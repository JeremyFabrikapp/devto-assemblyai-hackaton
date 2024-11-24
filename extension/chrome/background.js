let mediaRecorder = null;
let websocket = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse, tab) => {
  console.log('Received message:', message, tab);
  if (message.type === 'START_RECORDING') {
    startRecording(message.wsUrl, tab);
    sendResponse({ status: 'started' });
  } else if (message.type === 'STOP_RECORDING') {
    stopRecording();
    sendResponse({ status: 'stopped' });
  }
  return true;
});

async function startRecording(wsUrl, tab) {
  try {
    // Connect to WebSocket
    websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    const tabs = await chrome.tabCapture.getCapturedTabs();
    console.log('tabs:', tabs);
    const targetTab = tabs.find(t => t.tabId === tab.id);
    if (!targetTab) {
      throw new Error('Target tab not found in captured tabs');
    }
    // const streamId = targetTab.status === 'active' ? targetTab.streamId : null;
    // if (!streamId) {
    //   throw new Error('No active stream found for the target tab');
    // }
    console.log('Chrome object:', chrome);

    // Get tab audio stream ID
    // Get a MediaStream for the active tab.
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id
    });

    if (!streamId) {
      throw new Error('Failed to get media stream ID');
    }

    // Get the actual media stream using the ID
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId,
        },
      },
    });

    // Create MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && websocket?.readyState === WebSocket.OPEN) {
        websocket.send(event.data);
      }
    };

    // Start recording
    mediaRecorder.start(100); // Send data every 100ms

    chrome.runtime.sendMessage({
      type: 'status',
      content: 'Recording started',
      status: 'recording'
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    chrome.runtime.sendMessage({
      type: 'ERROR',
      error: error.message
    });
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder = null;
  }

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.close();
    websocket = null;
  }

  chrome.runtime.sendMessage({
    type: 'status',
    content: 'Recording stopped',
    status: 'connected'
  });
}