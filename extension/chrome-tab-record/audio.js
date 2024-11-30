// // Utility function to create and append the subtitle overlay
// function createSubtitleOverlay() {
//   const subtitleOverlay = document.createElement("div");
//   subtitleOverlay.id = "extension-subtitle-overlay";
//   subtitleOverlay.style.cssText = `
//     position: fixed;
//     bottom: 0px;
//     left: 0;
//     width: 100%;
//     padding: 30px 30px;
//     background-color: rgba(255, 255, 255, 0.9);
//     color: black;
//     text-align: center;
//     font-size: 18px;
//     z-index: 9999;
//   `;
//   subtitleOverlay.textContent = "Press on the Red Dot in Extensions to start recording";
//   document.body.appendChild(subtitleOverlay);
//   console.log("Subtitle overlay created and appended to the document body.", chrome);
//   return subtitleOverlay;
// }

// // Utility function to update subtitle with timer
// function updateSubtitleWithTimer(subtitleOverlay, text) {
//   subtitleOverlay.textContent = text;
//   if (!document.body.contains(subtitleOverlay)) {
//     document.body.appendChild(subtitleOverlay);
//   }

//   let removalTimestamp = Date.now() + 2000;

//   const checkAndRemoveOverlay = () => {
//     if (Date.now() >= removalTimestamp && document.body.contains(subtitleOverlay)) {
//       document.body.removeChild(subtitleOverlay);
//     }
//   };

//   const removalTimeout = setTimeout(checkAndRemoveOverlay, 2000);

//   subtitleOverlay.onmouseenter = () => clearTimeout(removalTimeout);
//   subtitleOverlay.onmouseleave = () => {
//     removalTimestamp = Date.now() + 2000;
//     setTimeout(checkAndRemoveOverlay, 2000);
//   };
// }

// // Helper function to check audio permission
// async function checkAudioPermission() {
//   try {
//     const permissionStatus = await navigator.permissions.query({ name: "microphone" });
//     console.log("Microphone permission status:", permissionStatus.state);

//     permissionStatus.onchange = function () {
//       console.log("Microphone permission status changed to:", this.state);
//     };

//     return permissionStatus.state;
//   } catch (error) {
//     console.error("Error checking microphone permission:", error);
//     return "error";
//   }
// }

// // Helper function to access microphone
// async function accessMicrophone() {
//   console.log("Attempting to access microphone...");
//   try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 echoCancellation: true,
//                 noiseSuppression: true,
//                 sampleRate: 44100,
//             },
//         });
//         console.log("Audio stream:", stream);
//         logAudioTracks(stream);
//         return stream;
//     } catch (error) {
//         console.error("Error accessing audio stream:", error);
//         throw error;
//     }
// }

// // Helper function to log audio tracks
// function logAudioTracks(stream) {
//   if (stream && stream.getAudioTracks) {
//     const audioTracks = stream.getAudioTracks();
//     console.log("Audio tracks:", audioTracks);

//     audioTracks.forEach((track, index) => {
//       console.log(`Track ${index + 1}:`, {
//         kind: track.kind,
//         label: track.label,
//         enabled: track.enabled,
//         muted: track.muted,
//         readyState: track.readyState,
//         constraints: track.getConstraints(),
//         settings: track.getSettings(),
//       });
//     });
//   }
// }

// // Export the utility functions
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = {
//     createSubtitleOverlay,
//     updateSubtitleWithTimer,
//     checkAudioPermission,
//     accessMicrophone,
//     logAudioTracks
//   };
// }
