// // src/hooks/useGameSessionLogger.js
// import { useEffect, useRef } from "react";
// import axios from "axios";

// const useGameSessionLogger = ({ username, difficulty, expression }) => {
//   const startTimeRef = useRef(new Date());
//   const expressionsRef = useRef([]);

//   useEffect(() => {
//     if (expression) {
//       expressionsRef.current.push({
//         expression,
//         timestamp: new Date().toISOString(),
//       });
//     }
//   }, [expression]);

//   const endSession = async () => {
//     const endTime = new Date();
//     const gameName = window.location.pathname.replace("/", "") || "unknown";

//     const sessionData = {
//       username,
//       difficulty,
//       startTime: startTimeRef.current.toISOString(),
//       endTime: endTime.toISOString(),
//       expressions: expressionsRef.current,
//       gameName, // ✅ Added here
//     };

//     try {
//       await axios.post("http://localhost:5000/api/sessions", sessionData);
//       console.log("Game session saved!");
//     } catch (err) {
//       console.error("Failed to save session:", err);
//     }
//   };

//   return { endSession };
// };

// export default useGameSessionLogger;





// src/hooks/useGameSessionLogger.js
import { useEffect, useRef } from "react";
import axios from "axios";

const useGameSessionLogger = ({ username, difficulty, expression,score }) => {
  const startTimeRef = useRef(new Date());
  const expressionsRef = useRef([]);

  useEffect(() => {
    if (expression) {
      expressionsRef.current.push({
        expression,
        timestamp: new Date().toISOString(),
      });
    }
  }, [expression]);

  const endSession = async () => {
    const endTime = new Date();
    const gameName = window.location.pathname.replace("/", "") || "unknown";

    const sessionData = {
      username,
      difficulty:difficulty.toLowerCase(),
      startTime: startTimeRef.current.toISOString(),
      endTime: endTime.toISOString(),
      expressions: expressionsRef.current,
      gameName, // ✅ Added here
      score,
    };

    try {
      await axios.post("http://localhost:4000/api/sessions", sessionData);
      console.log("Game session saved!");
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  return { endSession };
};

export default useGameSessionLogger;
