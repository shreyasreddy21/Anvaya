// import { useEffect, useRef, useState } from "react";
// import { FaceMesh } from "@mediapipe/face_mesh";
// import { Camera } from "@mediapipe/camera_utils";

// // Define background and color themes per emotion
// const emotionThemes = {
//   Happy: {
//     backgroundImage: "url('https://img.freepik.com/free-photo/beautiful-natural-landscape_23-2151839255.jpg')",
//     "--card-color": "#F8FD89",
//     "--button-bg": "#EDD1B0",
//     "--button-hover-bg": "#e2c0a0",
//     "--button-text": "#333333",
//     "--text-color": "#333333",
//     "--score-color": "#EDD1B0",
//   },
//   Sad: {
//     backgroundImage: "url('https://img.freepik.com/free-photo/pathway-middle-green-leafed-trees-with-sun-shining-through-branches_181624-4539.jpg')",
//     "--card-color": "#D8FAD2",
//     "--button-bg": "#CDE8B0",
//     "--button-hover-bg": "#b9d9a2",
//     "--button-text": "#3B2F2F",
//     "--text-color": "#3B2F2F",
//     "--score-color": "#CDE8B0",
//   },
//   Angry: {
//     backgroundImage: "url('https://img.freepik.com/free-photo/beautiful-landscape-view-ocean_23-2149119440.jpg')",
//     "--card-color": "#A5F7E1",
//     "--button-bg": "#96ADFC",
//     "--button-hover-bg": "#8198f0",
//     "--button-text": "#223344",
//     "--text-color": "#223344",
//     "--score-color": "#96ADFC",
//   },
//   Neutral: {
//     backgroundImage: "url('https://img.freepik.com/premium-photo/man-fishing-boat-near-tree-blue-water-lake-is-very-smooth_42764-132.jpg')",
//     "--card-color": "#F9F9F3",
//     "--button-bg": "#E6E6FA",
//     "--button-hover-bg": "#d8d8ef",
//     "--button-text": "#2C2C2C",
//     "--text-color": "#2C2C2C",
//     "--score-color": "#E6E6FA",
//   },
//   Surprise: {
//     backgroundImage: "url('https://img.freepik.com/free-vector/aurora-realistic-night-background_1284-69939.jpg')",
//     "--card-color": "#FFDAB9",
//     "--button-bg": "#FFFACD",
//     "--button-hover-bg": "#f2eebf",
//     "--button-text": "#4B0082",
//     "--text-color": "#4B0082",
//     "--score-color": "#FFFACD",
//   },
// };



// const useEmotionDetection = ({ intervalTime = 2000, apiUrl = "http://localhost:4000/api/emotion/predict" } = {}) => {
//   const [emotion, setEmotion] = useState("Neutral");
//   const emotionHistory = useRef([]);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const lastPredictionTime = useRef(0);

//   useEffect(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (!video || !canvas || !ctx) return;

//     const faceMesh = new FaceMesh({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//     });

//     faceMesh.setOptions({
//       maxNumFaces: 1,
//       refineLandmarks: true,
//       minDetectionConfidence: 0.5,
//       minTrackingConfidence: 0.5,
//     });

//     faceMesh.onResults(async (results) => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       if (results.multiFaceLandmarks?.length) {
//         const landmarksArray = results.multiFaceLandmarks[0];
//         const now = Date.now();

//         if (now - lastPredictionTime.current >= intervalTime) {
//           lastPredictionTime.current = now;

//           const landmarkPoints = landmarksArray.map(pt => [pt.x * canvas.width, pt.y * canvas.height]);
//           const [baseX, baseY] = landmarkPoints[0];
//           const relativePoints = landmarkPoints.map(([x, y]) => [x - baseX, y - baseY]);
//           const flatPoints = relativePoints.flat();
//           const maxAbs = Math.max(...flatPoints.map(Math.abs)) || 1;
//           const normalized = flatPoints.map(val => val / maxAbs);

//           try {
//             const response = await fetch(apiUrl, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ landmarks: normalized }),
//             });
//             const data = await response.json();

//             if (data.emotion) {
//               const normalizedEmotion = data.emotion.charAt(0).toUpperCase() + data.emotion.slice(1).toLowerCase();
//               emotionHistory.current.push(normalizedEmotion);
//               if (emotionHistory.current.length > 5) emotionHistory.current.shift();

//               const freq = {};
//               for (const e of emotionHistory.current) freq[e] = (freq[e] || 0) + 1;
//               const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

//               setEmotion(mostCommon);
//             }
//           } catch (err) {
//             console.error("Prediction error:", err);
//           }
//         }
//       }
//     });

//     const camera = new Camera(video, {
//       onFrame: async () => {
//         await faceMesh.send({ image: video });
//       },
//       width: 640,
//       height: 480,
//     });

//     camera.start();

//     return () => camera.stop();
//   }, []);

//   // Update background + theme variables
//   useEffect(() => {
//     const theme = emotionThemes[emotion];

//     if (theme) {
//       document.body.style.setProperty("transition", "background-image 1s ease-in-out", "important");
//       document.body.style.setProperty("background-image", theme.backgroundImage || "none", "important");
//       document.body.style.setProperty("background-size", "cover", "important");
//       document.body.style.setProperty("background-position", "center", "important");
//       document.body.style.setProperty("background-repeat", "no-repeat", "important");
//       document.body.style.setProperty("width", "100%");
//       document.body.style.setProperty("height", "100%");

//       // Set CSS variables on :root
//       Object.entries(theme).forEach(([key, value]) => {
//         if (key.startsWith("--")) {
//           document.documentElement.style.setProperty(key, value);
//         }
//       });
//     }
//   }, [emotion]);

//   return { emotion, videoRef, canvasRef };
// };

// export default useEmotionDetection;












import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const emotionThemes = {
  Happy: { backgroundImage: "url('/gameBackgrounds/happy.jpg')", "--card-color": "#F8FD89", "--button-bg": "#EDD1B0", "--button-hover-bg": "#e2c0a0", "--button-text": "#333333", "--text-color": "#333333", "--score-color": "#EDD1B0" },
  Sad: { backgroundImage: "url('/gameBackgrounds/sad.jpg')", "--card-color": "#D8FAD2", "--button-bg": "#CDE8B0", "--button-hover-bg": "#b9d9a2", "--button-text": "#3B2F2F", "--text-color": "#3B2F2F", "--score-color": "#CDE8B0" },
  Angry: { backgroundImage: "url('/gameBackgrounds/angry.jpg')", "--card-color": "#A5F7E1", "--button-bg": "#96ADFC", "--button-hover-bg": "#8198f0", "--button-text": "#223344", "--text-color": "#223344", "--score-color": "#96ADFC" },
  Neutral: { backgroundImage: "url('/gameBackgrounds/neutral.jpg')", "--card-color": "#F9F9F3", "--button-bg": "#E6E6FA", "--button-hover-bg": "#d8d8ef", "--button-text": "#2C2C2C", "--text-color": "#2C2C2C", "--score-color": "#E6E6FA" },
  Surprise: { backgroundImage: "url('/gameBackgrounds/surprise.jpg')", "--card-color": "#FFDAB9", "--button-bg": "#FFFACD", "--button-hover-bg": "#f2eebf", "--button-text": "#4B0082", "--text-color": "#4B0082", "--score-color": "#FFFACD" },
};

const useEmotionDetection = ({ intervalTime = 2000, apiUrl = "http://127.0.0.1:5000/predict" } = {}) => {
  const [emotion, setEmotion] = useState("Neutral");
  const [sessionDominantEmotion, setSessionDominantEmotion] = useState("Neutral");
  const emotionHistory = useRef([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastPredictionTime = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!video || !canvas || !ctx) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(async (results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks?.length) {
        const landmarksArray = results.multiFaceLandmarks[0];
        const now = Date.now();

        if (now - lastPredictionTime.current >= intervalTime) {
          lastPredictionTime.current = now;

          const landmarkPoints = landmarksArray.map((pt) => [pt.x * canvas.width, pt.y * canvas.height]);
          const [baseX, baseY] = landmarkPoints[0];
          const relativePoints = landmarkPoints.map(([x, y]) => [x - baseX, y - baseY]);
          const flatPoints = relativePoints.flat();
          const maxAbs = Math.max(...flatPoints.map(Math.abs)) || 1;
          const normalized = flatPoints.map((val) => val / maxAbs);

          try {
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ landmarks: normalized }),
            });

            if (!response.ok) {
              throw new Error(`Prediction request failed with ${response.status}`);
            }

            const data = await response.json();
            const detectedEmotion = data.expression || data.emotion;

            if (detectedEmotion) {
              const normalizedEmotion = detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1).toLowerCase();
              emotionHistory.current.push(normalizedEmotion);
              if (emotionHistory.current.length > 5) emotionHistory.current.shift();

              const freq = {};
              for (const e of emotionHistory.current) freq[e] = (freq[e] || 0) + 1;
              const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

              setEmotion(mostCommon);
            }
          } catch (err) {
            console.error("Prediction error:", err);
          }
        }
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await faceMesh.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    return () => camera.stop();
  }, [apiUrl, intervalTime]);

  useEffect(() => {
    const theme = emotionThemes[emotion];
    if (theme) {
      document.body.style.setProperty("transition", "background-image 1s ease-in-out", "important");
      document.body.style.setProperty("background-image", theme.backgroundImage || "none", "important");
      document.body.style.setProperty("background-size", "cover", "important");
      document.body.style.setProperty("background-position", "center", "important");
      document.body.style.setProperty("background-repeat", "no-repeat", "important");
      document.body.style.setProperty("width", "100%");
      document.body.style.setProperty("height", "100%");
      Object.entries(theme).forEach(([key, value]) => {
        if (key.startsWith("--")) {
          document.documentElement.style.setProperty(key, value);
        }
      });
    }
  }, [emotion]);

  const finalizeSession = () => {
    const freq = {};
    for (const e of emotionHistory.current) freq[e] = (freq[e] || 0) + 1;
    const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral";
    setSessionDominantEmotion(dominant);
    emotionHistory.current = []; // Clear for next session
  };

  return { emotion, sessionDominantEmotion, finalizeSession, videoRef, canvasRef };
};

export default useEmotionDetection;
