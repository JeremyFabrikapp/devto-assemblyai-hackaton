import { AudioMixer } from './audio-mixer.js';
import { WebSocketClient } from './websocket-client.js';

let audioMixer = null;
let wsClient = null;

async function startRecording(sources) {
  try {
    const streams = [];
    
    if (sources.tab) {
      const tabStream = await chrome.tabCapture.capture({
        audio: true,
        video: false
      });
      if (tabStream) streams.push(tabStream);
    }
    
    if (sources.mic) {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      if (micStream) streams.push(micStream);
    }

    if (streams.length === 0) {
      throw new Error('No audio sources available');
    }

    // Initialize audio processing
    audioMixer = new AudioMixer(streams);
    
    // Initialize WebSocket connection
    wsClient = new WebSocketClient();
    await wsClient.connect();

    // Set up audio data handling
    audioMixer.onAudioData = (data) => {
      wsClient.sendAudio(data);
    };

    // Handle subtitles
    wsClient.onSubtitle = (text) => {
      chrome.runtime.sendMessage({
        type: 'subtitle',
        text: text
      });
      
      // Send to content script for overlay display
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'subtitle',
            text: text
          });
        }
      });
    };

    chrome.runtime.sendMessage({
      type: 'status',
      content: 'Recording started',
      status: 'recording'
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    chrome.runtime.sendMessage({
      type: 'status',
      content: 'Error: ' + error.message,
      status: 'error'
    });
  }
}

function stopRecording() {
  if (audioMixer) {
    audioMixer.stop();
    audioMixer = null;
  }
  
  if (wsClient) {
    wsClient.disconnect();
    wsClient = null;
  }

  chrome.runtime.sendMessage({
    type: 'status',
    content: 'Recording stopped',
    status: 'connected'
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    startRecording(message.sources);
  } else if (message.action === 'stopRecording') {
    stopRecording();
  }
});