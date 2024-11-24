let mediaRecorder = null;
let audioContext = null;
let source = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTabCapture") {
    startTabCapture(sendResponse);
    return true; // Indicates that the response is asynchronous
  }
});

async function startTabCapture(sendResponse) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaStreamSource(stream);
    
    const processor = audioContext.createScriptProcessor(1024, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    processor.onaudioprocess = function(e) {
      const audioData = e.inputBuffer.getChannelData(0);
      // Send audio data to background script
      chrome.runtime.sendMessage({type: 'audioData', data: audioData.buffer});
    };

    sendResponse({success: true});
  } catch (error) {
    console.error('Error starting tab capture:', error);
    sendResponse({success: false, error: error.message});
  }
}