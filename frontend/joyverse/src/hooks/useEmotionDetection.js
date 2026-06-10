import { useEffect, useRef, useState, useCallback } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { applyEmotionTheme } from "../utils/EmotionThemeMap";

/**
 * useEmotionDetection
 *
 * Runs MediaPipe FaceMesh on the webcam, sends normalised landmarks to the
 * ML service, maintains a 5-frame rolling-window majority-vote for stability,
 * and applies the matching EmotionTheme to the document.
 *
 * Returns:
 *   emotion                — current smoothed emotion label
 *   sessionDominantEmotion — dominant emotion since last finalizeSession()
 *   finalizeSession()      — compute & store dominant, reset history
 *   setManualEmotion(e)    — override detected emotion (null to resume detection)
 *   videoRef / canvasRef   — attach to hidden <video> and <canvas> elements
 *
 * Options (all optional):
 *   intervalTime   — ms between ML calls (default 2000)
 *   apiUrl         — ML service endpoint
 *   manualOverride — controlled emotion label; when provided, ML inference
 *                    continues but the reported emotion is always this value
 */
const useEmotionDetection = ({
  intervalTime = 2000,
  apiUrl = "http://127.0.0.1:5000/predict",
} = {}) => {
  const [emotion, setEmotion]                         = useState("Neutral");
  const [sessionDominantEmotion, setSessionDominant] = useState("Neutral");
  const [manualEmotion, setManualEmotionState]        = useState(null);

  const emotionHistory      = useRef([]);
  const videoRef            = useRef(null);
  const canvasRef           = useRef(null);
  const lastPredictionTime  = useRef(0);

  // ── Webcam + FaceMesh loop ──────────────────────────────────────────────────
  useEffect(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");

    if (!video || !canvas || !ctx) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces:            1,
      refineLandmarks:        true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5,
    });

    faceMesh.onResults(async (results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (!results.multiFaceLandmarks?.length) return;

      const landmarksArray = results.multiFaceLandmarks[0];
      const now = Date.now();
      if (now - lastPredictionTime.current < intervalTime) return;
      lastPredictionTime.current = now;

      // Normalise 468 landmarks relative to landmark 0
      const pts       = landmarksArray.map((pt) => [pt.x * canvas.width, pt.y * canvas.height]);
      const [bx, by]  = pts[0];
      const rel       = pts.map(([x, y]) => [x - bx, y - by]);
      const flat      = rel.flat();
      const maxAbs    = Math.max(...flat.map(Math.abs)) || 1;
      const normalized = flat.map((v) => v / maxAbs);

      try {
        const response = await fetch(apiUrl, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ landmarks: normalized }),
        });

        if (!response.ok) return;

        const data = await response.json();
        const raw  = data.expression || data.emotion;
        if (!raw) return;

        const label =
          raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

        emotionHistory.current.push(label);
        if (emotionHistory.current.length > 5) emotionHistory.current.shift();

        // Majority vote over the rolling window
        const freq = {};
        for (const e of emotionHistory.current) freq[e] = (freq[e] || 0) + 1;
        const voted = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

        // Only update state when no manual override is active
        if (!manualEmotion) setEmotion(voted);
      } catch {
        // ML service unavailable — keep last known emotion
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => { await faceMesh.send({ image: video }); },
      width:  640,
      height: 480,
    });

    camera.start();
    return () => camera.stop();
    // manualEmotion is intentionally absent from this dep array — adding it
    // would restart the camera every time the override changes, which is wrong.
    // The override is handled in the separate theme effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, intervalTime]);

  // ── Apply emotion theme to document ────────────────────────────────────────
  useEffect(() => {
    const effective = manualEmotion ?? emotion;
    applyEmotionTheme(effective);
  }, [emotion, manualEmotion]);

  // ── Public API ──────────────────────────────────────────────────────────────
  const finalizeSession = useCallback(() => {
    const freq = {};
    for (const e of emotionHistory.current) freq[e] = (freq[e] || 0) + 1;
    const dominant =
      Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Neutral";
    setSessionDominant(dominant);
    emotionHistory.current = [];
  }, []);

  const setManualEmotion = useCallback((label) => {
    setManualEmotionState(label);
    if (label) setEmotion(label);
  }, []);

  const effectiveEmotion = manualEmotion ?? emotion;

  return {
    emotion: effectiveEmotion,
    sessionDominantEmotion,
    finalizeSession,
    setManualEmotion,
    videoRef,
    canvasRef,
  };
};

export default useEmotionDetection;
