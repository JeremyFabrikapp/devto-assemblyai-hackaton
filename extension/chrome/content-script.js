let mediaRecorder = null;
let audioContext = null;
let source = null;
// Logging function for debugging
function log(message, data) {
  console.log(`[Content Script] ${message}`, data);
}

// Log initial setup
log('Content script initialized');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log('Received message:', request);
  if (request.action === "startTabCapture") {
    startTabCapture(sendResponse);
    return true; // Indicates that the response is asynchronous
  }
});

async function startTabCapture(sendResponse) {
  try {
    log('Attempting to get tab capture stream', chrome);
    const streamId = await new Promise((resolve, reject) => {
      chrome.tabCapture.getMediaStreamId((id) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(id);
        }
      });
    });
    log('Tab capture stream ID obtained:', streamId);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
      video: false
    });
    log('Tab audio stream obtained successfully');

    // Create AudioContext and source
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(stream);
    log('AudioContext and source created');

    // Create MediaStreamAudioDestinationNode
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    log('Destination created and connected');

    // Preserve system audio
    const output = new AudioContext();
    const preserveSource = output.createMediaStreamSource(stream);
    preserveSource.connect(output.destination);
    log('System audio preserved');

    // Send audio data to background script
    log('Setting up MediaRecorder');
    mediaRecorder = new MediaRecorder(destination.stream);
    mediaRecorder.ondataavailable = (event) => {
      log('Audio data available, sending to background script');
      chrome.runtime.sendMessage({type: 'audioData', data: event.data});
    };
    mediaRecorder.start(100); // Send data every 100ms
    log('MediaRecorder started');

    sendResponse({success: true});
  } catch (error) {
    console.error('Error starting tab capture:', error);
    sendResponse({success: false, error: error.message});
  }
}