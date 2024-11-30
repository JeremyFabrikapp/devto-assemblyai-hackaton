// ... existing code ...
let activeTabId = null;
// Maintain a port to the offscreen document
let offscreenPort = null;

// Listen for connections from the offscreen document
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'offscreen') {
    offscreenPort = port;
    offscreenPort.onDisconnect.addListener(() => {
      offscreenPort = null;
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'audioDataMicBuffer' && offscreenPort) {
    // Forward the audio data to the offscreen document
    offscreenPort.postMessage(
      { action: 'audioDataMicBuffer', data: message.data },
      [message.data] // Transfer ownership of the buffer
    );
  }
  // ... existing message handling ...
});
chrome.action.onClicked.addListener(async (tab) => {
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://")
  ) {
    console.warn("Cannot record Chrome pages or extension pages.");
    chrome.action.setIcon({ path: "icons/error.png" });
    return;
  }

  if (activeTabId) {
    // Close the current recording if a tab is already set
    await stopRecording(activeTabId);
    activeTabId = null;
    chrome.action.setIcon({ path: "icons/not-recording.png" });
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // This function is executed in the context of the tab
        console.log("Tab context script executed");
      },
    });
    activeTabId = tab.id;
    startRecordingOffscreen(true);
  } catch (error) {
    console.error("Error executing script in tab:", error);
    chrome.action.setIcon({ path: "icons/error.png" });
  }
});

async function stopRecording(tabId) {
  // Implement the logic to stop the recording
  // This might involve sending a message to the offscreen document
  await chrome.runtime.sendMessage({
    type: "stop-recording",
    target: "offscreen",
  });
  console.log(`Recording stopped for tab ${tabId}`);
}

async function startRecordingProcess(useMicrophone, tab) {
  const existingContexts = await chrome.runtime.getContexts({});
  let recording = false;
  // If tab is not set, use the saved activeTabId
  if (!tab && activeTabId) {
    try {
      tab = await chrome.tabs.get(activeTabId);
    } catch (error) {
      console.error("Error getting active tab:", error);
      return;
    }
  }
  // Check if the tab is a Chrome-specific page
  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://")
  ) {
    console.warn("Cannot record Chrome pages or extension pages.");
    return;
  }

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === "OFFSCREEN_DOCUMENT"
  );

  if (!offscreenDocument) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Recording from chrome.tabCapture API and microphone",
    });
  } else {
    recording = offscreenDocument.documentUrl.endsWith("#recording");
  }

  if (recording) {
    chrome.runtime.sendMessage({
      type: "stop-recording",
      target: "offscreen",
    });
    chrome.action.setIcon({ path: "icons/not-recording.png" });
    return;
  }

  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: activeTabId,
    });

    chrome.runtime.sendMessage({
      type: "start-recording",
      target: "offscreen",
      data: { streamId, useMicrophone },
    });

    chrome.action.setIcon({ path: "icons/recording.png" });
    console.log("Recording started.");
  } catch (error) {
    console.error("Error starting recording:", error);
    chrome.action.setIcon({ path: "icons/error.png" });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "recording-error") {
    console.error("Recording error:", message.error);
    chrome.action.setIcon({ path: "icons/error.png" });
  }
  if (message.action === "updateSubtitle") {
    chrome.tabs.sendMessage(
      activeTabId,
      { action: "updateSubtitle", text: message.text },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "Failed to send message:",
            chrome.runtime.lastError.message
          );
        }
      }
    );
  }
  if (message.action === "microphoneAccessGranted") {
    console.error("startRecording in background", JSON.stringify(message));
    // startRecordingOffscreen(true);
    return true;
  } else if (message.action === "stopRecording") {
    console.error("stopRecording in background");
    stopRecordingOffscreen()
    // startRecordingOffscreen(activeTabId);
    return true;
  } else if (message.action === "set-recording") {
    console.error("set-recording in background", message.recording);
    chrome.storage.session.set({ recording: message.recording });
  }
});
const stopRecordingOffscreen = () => {
  console.log("Stopping offscreen recording");
  const recording =
    offscreenDocument.documentUrl?.endsWith("#recording") ?? false;
  if (!recording) {
    return;
  }
  chrome.runtime.sendMessage({
    type: "stop-recording",
    target: "offscreen",
  });
  chrome.action.setIcon({ path: "icons/not-recording.png" });
  chrome.storage.session.set({ recording: false });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "stopRecordingOffscreen") {
    stopRecordingOffscreen();
    return true;
  }
});

const startRecordingOffscreen = async (useMicrophone) => {
  const existingContexts = await chrome.runtime.getContexts({});
  let recording = false;

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === "OFFSCREEN_DOCUMENT"
  );

  // If an offscreen document is not already open, create one.
  if (!offscreenDocument) {
    console.log("OFFSCREEN no offscreen document");
    // Create an offscreen document.
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [
        chrome.offscreen.Reason.USER_MEDIA,
        chrome.offscreen.Reason.DISPLAY_MEDIA,
      ],
      justification: "Recording from chrome.tabCapture API",
    });
  } else {
    recording = offscreenDocument.documentUrl?.endsWith("#recording") ?? false;
  }

  if (recording) {
    chrome.runtime.sendMessage({
      type: "stop-recording",
      target: "offscreen",
    });
    chrome.action.setIcon({ path: "icons/not-recording.png" });
    return;
  }

  // Get a MediaStream for the active tab.
  console.error("BACKGROUND getMediaStreamId");

  const streamId = await new Promise((resolve) => {
    chrome.tabCapture.getMediaStreamId(
      { targetTabId: activeTabId },
      (streamId) => {
        resolve(streamId);
      }
    );
  });
  console.error("BACKGROUND streamId", streamId);

  const micStreamId = await new Promise((resolve) => {
    chrome.tabCapture.getMediaStreamId(
      { consumerTabId: activeTabId },
      (streamId) => {
        resolve(streamId);
      }
    );
  });
  console.error("BACKGROUND micStreamId", micStreamId);

  // Send the stream ID to the offscreen document to start recording.
  chrome.runtime.sendMessage({
    type: "start-recording",
    target: "offscreen",
    data: { streamId, useMicrophone, micStreamId },
  });

  chrome.action.setIcon({ path: "/icons/recording.png" });
};
