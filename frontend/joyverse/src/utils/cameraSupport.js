/**
 * Camera capability detection + human-readable diagnostics.
 *
 * getUserMedia only works in a SECURE CONTEXT (HTTPS, or http://localhost during
 * development). On a plain-HTTP production origin `navigator.mediaDevices` is
 * `undefined`, so the camera silently fails while the rest of the site keeps
 * working — the classic "works locally, broken in prod" webcam bug. These
 * helpers turn that silent failure into an explicit, actionable signal.
 */

/**
 * Returns a machine reason string if the camera CANNOT work in this context,
 * or null if the API is available (permission is a separate, later step).
 *   'insecure-context' | 'unsupported' | null
 */
export function cameraUnavailableReason() {
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    return 'insecure-context';
  }
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== 'function'
  ) {
    // On insecure origins mediaDevices is undefined; report it as such so the
    // message points at HTTPS rather than at the (irrelevant) browser version.
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      return 'insecure-context';
    }
    return 'unsupported';
  }
  return null;
}

/** Friendly, parent/teacher-facing message for a reason or a getUserMedia error. */
export function describeCameraIssue(reasonOrError) {
  const name =
    typeof reasonOrError === 'string' ? reasonOrError : reasonOrError?.name;

  switch (name) {
    case 'insecure-context':
      return 'The camera needs a secure (https://) connection. Open the site over HTTPS and try again.';
    case 'unsupported':
      return "This browser doesn't support camera access. Try a recent Chrome, Edge, or Safari.";
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access was blocked. Allow camera permission in your browser (click the camera icon in the address bar) and try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found on this device.';
    case 'NotReadableError':
      return 'The camera is in use by another app. Close it and try again.';
    default:
      return 'The camera could not be started. Please check your browser camera permissions.';
  }
}

/**
 * Request the camera from within a user gesture (the proper, most reliable way
 * to trigger the browser permission prompt). Resolves with the MediaStream on
 * success; rejects with an Error whose `.name` is suitable for describeCameraIssue.
 * The caller is responsible for stopping the returned stream's tracks.
 */
export async function requestCameraStream({ width = 640, height = 480 } = {}) {
  const reason = cameraUnavailableReason();
  if (reason) {
    const err = new Error(reason);
    err.name = reason;
    throw err;
  }
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: width }, height: { ideal: height }, facingMode: 'user' },
    audio: false,
  });
}

/**
 * Drive a hidden <video> from the camera and invoke `onFrame` once per animation
 * frame. This is a dependency-free replacement for @mediapipe/camera_utils's
 * `Camera`: its UMD bundle exports an `undefined` `Camera` under the Vite/Rollup
 * PRODUCTION build (`TypeError: Camera is not a constructor`) even though it
 * resolves in dev — so we use the platform APIs directly instead. tasks-vision's
 * FaceLandmarker only needs raw <video> frames, which this provides.
 *
 * Returns a handle `{ stop() }`. `onFrame` receives no arguments and should read
 * the video element it was given. Per-frame errors are swallowed so a single bad
 * frame can never kill the loop.
 */
export async function startCameraPump(video, { onFrame, width = 640, height = 480 } = {}) {
  const stream = await requestCameraStream({ width, height });
  video.srcObject = stream;
  // The element is muted + playsInline; play() actually starts the frames.
  try { await video.play(); } catch (_) { /* some browsers autoplay; rAF still ticks */ }

  let stopped = false;
  let rafId = 0;
  const tick = async () => {
    if (stopped) return;
    if (typeof onFrame === 'function' && video.readyState >= 2) {
      try { await onFrame(); } catch (_) { /* never let one frame break the loop */ }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return {
    stop() {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      try { stream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      try { video.srcObject = null; } catch (_) {}
    },
  };
}
