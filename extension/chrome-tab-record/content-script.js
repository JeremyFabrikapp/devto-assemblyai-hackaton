// import {
//   createSubtitleOverlay,
//   updateSubtitleWithTimer,
//   checkAudioPermission,
//   accessMicrophone,
//   logAudioTracks
// } from './audio.js';
// Load audio.js
// const script = document.createElement('script');
// script.src = chrome.runtime.getURL('audio.js');
// script.onload = function() {
//     this.remove();
// };
// (document.head || document.documentElement).appendChild(script);

// // Wait for the script to load and then use the functions
// script.addEventListener('load', () => {
//     if (typeof createSubtitleOverlay === 'function' &&
//         typeof updateSubtitleWithTimer === 'function' &&
//         typeof checkAudioPermission === 'function' &&
//         typeof accessMicrophone === 'function' &&
//         typeof logAudioTracks === 'function') {
//         console.log('Audio functions loaded successfully');
//     } else {
//         console.error('Failed to load audio functions');
//     }
// });

// // Create and inject the subtitle overlay
// const subtitleOverlay = createSubtitleOverlay();

// Utility function to create and append the subtitle overlay
function createSubtitleOverlay() {
  const subtitleOverlay = document.createElement("div");
  subtitleOverlay.id = "extension-subtitle-overlay";
  subtitleOverlay.style.cssText = `
    position: fixed;
    bottom: 0px;
    left: 0;
    width: 100%;
    padding: 30px 30px;
    background-color: rgba(255, 255, 255, 0.9);
    color: black;
    text-align: center;
    font-size: 18px;
    z-index: 9999;
  `;
  subtitleOverlay.textContent =
    "Press on the Red Dot in Extensions to start recording";
  document.body.appendChild(subtitleOverlay);
  console.log(
    "Subtitle overlay created and appended to the document body.",
    chrome
  );
  return subtitleOverlay;
}
const SUBTITLE_DISPLAY_TIME = 2000; // 2 seconds

// Utility function to update subtitle with timer
function updateSubtitleWithTimer(subtitleOverlay, text) {
  if (text && text.trim() !== "") {
    subtitleOverlay.textContent = text;
    if (!document.body.contains(subtitleOverlay)) {
      document.body.appendChild(subtitleOverlay);
    }
  } else if (!subtitleOverlay.removalTimeout) {
    // If text is empty and no removal timeout is set, start the removal process
    subtitleOverlay.removalTimeout = setTimeout(() => {
      if (document.body.contains(subtitleOverlay)) {
        document.body.removeChild(subtitleOverlay);
      }
      subtitleOverlay.removalTimeout = null;
    }, SUBTITLE_DISPLAY_TIME);
    return; // Exit the function early
  }

  // Clear any existing removal timeout
  clearTimeout(subtitleOverlay.removalTimeout);
  subtitleOverlay.removalTimeout = null;

  // Set a new removal timeout
  subtitleOverlay.removalTimeout = setTimeout(() => {
    if (document.body.contains(subtitleOverlay)) {
      document.body.removeChild(subtitleOverlay);
    }
    subtitleOverlay.removalTimeout = null;
  }, SUBTITLE_DISPLAY_TIME);
}

// Helper function to check audio permission
async function checkAudioPermission() {
  try {
    const permissionStatus = await navigator.permissions.query({
      name: "microphone",
    });
    console.log("Microphone permission status:", permissionStatus.state);

    permissionStatus.onchange = function () {
      console.log("Microphone permission status changed to:", this.state);
    };

    return permissionStatus.state;
  } catch (error) {
    console.error("Error checking microphone permission:", error);
    return "error";
  }
}

// Helper function to access microphone
async function accessMicrophone() {
  console.log("Attempting to access microphone...");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });
    console.log("Audio stream:", stream);
    logAudioTracks(stream);
    return stream;
  } catch (error) {
    console.error("Error accessing audio stream:", error);
    throw error;
  }
}

// Helper function to log audio tracks
function logAudioTracks(stream) {
  if (stream && stream.getAudioTracks) {
    const audioTracks = stream.getAudioTracks();
    console.log("Audio tracks:", audioTracks);

    audioTracks.forEach((track, index) => {
      console.log(`Track ${index + 1}:`, {
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        constraints: track.getConstraints(),
        settings: track.getSettings(),
      });
    });
  }
}
async function captureAndSendAudio() {
  try {
    console.log("Attempting to access microphone...");
    const state = await checkAudioPermission();
    if (state !== "granted") {
      console.log("Failed to get microphone permission. Current state:", state);
      chrome.runtime.sendMessage({
        action: "microphoneAccessFailed",
        error: `Microphone permission not granted. Current state: ${state}`
      });
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    
    // Create a ScriptProcessorNode to process audio data
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    mediaStreamSource.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = function(e) {
      // Get the audio data
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert to a regular array
      const inputDataArray = Array.from(inputData);
      // Send the audio data to the background script
      // Log the audio data for debugging
      // console.log('Audio data captured:', inputDataArray);
      // console.log('Audio data length:', inputDataArray.length);
      // console.log('Audio data sample rate:', audioContext.sampleRate);
      chrome.runtime.sendMessage({
        action: 'audioDataMicBuffer',
        data: inputDataArray
      });
    };

    // Store references if needed
    window.microphoneStream = stream;
    window.audioContext = audioContext;
    window.processor = processor;

    console.log("Microphone access granted and audio capture started.");
  } catch (error) {
    console.error("Error accessing audio stream:", error);
  }
}

// Call the function to start capturing audio
captureAndSendAudio();

async function requestMicrophoneAccess() {
  console.log("Requesting microphone access...");
  try {
    const state = await checkAudioPermission();
    if (state === "granted") {
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted.");
      chrome.runtime.sendMessage({
        action: "microphoneAccessGranted",
      });
    }
    // Notify the background script that microphone access has been granted
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //     if (tabs[0]) {
    //         chrome.runtime.sendMessage({
    //             action: 'microphoneAccessGranted',
    //             tabId: 0
    //         });
    //     } else {
    //         console.error('No active tab found');
    //     }
    // });

    // Optional: Stop the stream if you don't need it here
    // stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Error accessing microphone:", error);
    alert("Microphone permission is required to start recording.");
  }
}

// Call the function to request microphone access
// requestMicrophoneAccess();
// Export the utility functions
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createSubtitleOverlay,
    updateSubtitleWithTimer,
    checkAudioPermission,
    accessMicrophone,
    logAudioTracks,
  };
}

let subtitleOverlay;

if (!document.getElementById("extension-subtitle-overlay")) {
  subtitleOverlay = createSubtitleOverlay();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log("Received message from background script:", message);
  if (message.action === "updateSubtitle") {
    updateSubtitleWithTimer(subtitleOverlay, message.text || "");
  }
});

console.log("HELLO");

// Initialize and check audio permission after 5 seconds
// setTimeout(() => {
//   checkAudioPermission().then((status) => {
//     console.log("Initial microphone permission status:", status);
//     if (status === 'granted') {
//       accessMicrophone()
//         .then(stream => {
//           console.log("Audio stream:", stream);
//           logAudioTracks(stream);
//         })
//         .catch(error => {
//           console.error("Error accessing audio stream:", error);
//         });
//     }
//   });
// }, 5000);

// console.log("Waiting 5 seconds before checking audio permission...");
