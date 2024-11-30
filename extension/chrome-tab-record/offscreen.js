const BUFFER_SIZE = 4096;

class Recorder {
  constructor(onDataAvailable) {
    this.onDataAvailable = onDataAvailable;
    this.audioContext = null;
    this.state = "ready";
    this.mediaStream = null;
    this.mediaStreamSource = null;
    this.workletNode = null;
  }

  async start(stream) {
    console.log("starting");
    try {
      if (this.audioContext) {
        await this.audioContext.close();
      }

      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 24000 });
      console.log("1");

      await this.audioContext.audioWorklet.addModule(
        "/audio/audio-processor-worklet.js"
      );
      console.log("2");

      this.mediaStream = stream;
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(
        this.mediaStream
      );

      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        "audio-processor-worklet"
      );
      this.workletNode.port.onmessage = (event) => {
        this.onDataAvailable(event.data.buffer);
      };

      this.mediaStreamSource.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
      console.log("done");
    } catch (error) {
      console.log("error", error);
      this.stop();
    }
  }

  async stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaStreamSource = null;
    this.workletNode = null;
  }
}

const port = chrome.runtime.connect({ name: 'offscreen' });
console.log('Offscreen port:', port);

// Listen for messages from the background script
port.onMessage.addListener((message) => {
  console.log("Received message from background script:", message);
  if (message.action === 'audioDataMicBuffer') {
    handleIncomingAudioData(message.data);
  }
});

// Function to handle incoming audio data
function handleIncomingAudioData(buffer) {
  console.log("Received audio data buffer:", buffer);
  console.log("Audio data length:", buffer.byteLength);

  if (audioRecorder && audioRecorder.audioContext && audioRecorder.micGain) {
    // Convert the incoming buffer to a Float32Array
    const audioData = new Float32Array(buffer);
    
    // Create a new AudioBuffer
    const audioBuffer = audioRecorder.audioContext.createBuffer(1, audioData.length, audioRecorder.audioContext.sampleRate);
    
    // Fill the AudioBuffer with the microphone data
    audioBuffer.getChannelData(0).set(audioData);
    
    // Create a new AudioBufferSourceNode
    const source = audioRecorder.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Connect the source to the microphone gain node
    source.connect(audioRecorder.micGain);
    
    // Start playing the buffer immediately
    source.start();
  }

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    // Send combined audio data to the server
    websocket.send(audioRecorder.workletNode.port);
  }
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === "offscreen") {
    switch (message.type) {
      case "start-recording":
        startRecording(message.data);
        break;
      case "stop-recording":
        stopRecording();
        break;
      default:
        throw new Error("Unrecognized message:", message.type);
    }
  }
});

let audioRecorder;
let websocket;
let accumulatedData = [];
let buffer = new Uint8Array();
let recorder;

async function startRecording(data) {
  if (audioRecorder?.state === "recording") {
    throw new Error("Called startRecording while recording is in progress.");
  }

  // Connect to WebSocket
  websocket = new WebSocket("ws://localhost:8888/ws");
  websocket.binaryType = "arraybuffer";
  websocket.onopen = () => {
    console.log("WebSocket connection established");
    websocket.send(
      JSON.stringify({
        type: "session_start",
        userId: "74049d58-7768-47cb-aafe-7765a3bc72ba",
      })
    );
  };

  websocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  function sendSubtitleToBackground(text) {
    chrome.runtime.sendMessage({ action: "updateSubtitle", text: text });
  }

  // Modify the WebSocket onmessage handler to send subtitles to the background
  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "subtitle") {
      sendSubtitleToBackground(data.text);
    }
  };

  const appendToBuffer = (newData) => {
    const newBuffer = new Uint8Array(buffer.length + newData.length);
    newBuffer.set(buffer);
    newBuffer.set(newData, buffer.length);
    buffer = newBuffer;
  };

  const handleAudioMicData = (data) => {
    console.log("Received audio data from microphone:", data);
    // Process microphone data here if needed
  };

  const handleAudioData = (data) => {
    const uint8Array = new Uint8Array(data);
    appendToBuffer(uint8Array);
    if (buffer.length >= BUFFER_SIZE) {
      const toSend = new Uint8Array(buffer.slice(0, BUFFER_SIZE));
      buffer = new Uint8Array(buffer.slice(BUFFER_SIZE));
      websocket.send(toSend);
    }
  };

  audioRecorder = new Recorder(handleAudioData);

  try {
    console.log("audiodata", data);
    // Check for tab audio permission
    // const tabPermission = await navigator.permissions.query({
    //   name: "audioCapture",
    // });
    // if (tabPermission.state !== "granted") {
    //   throw new Error("Tab audio permission not granted");
    // } else {
    //   console.log("Tab audio permission granted. Audio data:", data);
    //   console.log("Stream ID:", data.streamId);
    //   console.log("Use microphone:", data.useMicrophone);
    // }
    // return;
    // Wait for 5 seconds before proceeding
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // console.log("5 seconds have passed, continuing with the recording setup...");

    // Check for microphone permission if needed
    // if (data.useMicrophone) {
    //   // const micPermission = await navigator.permissions.query({
    //   //   name: "microphone",
    //   // });
    //   // if (micPermission.state === "prompt") {
    //     // If permission hasn't been asked yet, we need to request it
    //     await navigator.mediaDevices.getUserMedia({ audio: true });
    //   // } else if (micPermission.state !== "granted") {
    //   //   throw new Error("Microphone permission not granted");
    //   // }
    // }

    // const micTabStream = await navigator.mediaDevices.getUserMedia({
    //   audio: {
    //     mandatory: {
    //       chromeMediaSource: "tab",
    //       chromeMediaSourceId: data.streamId,
    //     },
    //   },
    // });
    // Get tab audio stream
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: data.streamId,
        },
      },
    });
    let micStream = null;

    // const audioRecorderMic = new Recorder(handleAudioMicData);

    // Get microphone stream if requested and permitted
    if (data.micStreamId) {
      // micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // await audioRecorderMic.start(stream);
      // micStream = await navigator.mediaDevices.getUserMedia({
      //   audio: {
      //     mandatory: {
      //       chromeMediaSource: "tab",
      //       chromeMediaSourceId: data.micStreamId,
      //     },
      //   },
      // });
    }

    // Combine streams if both are present
    let combinedStream;
    if (micStream) {
      // const audioContext = new AudioContext();
      // const tabSource = audioContext.createMediaStreamSource(tabStream);
      // const micSource = audioContext.createMediaStreamSource(micStream);
      // const destination = audioContext.createMediaStreamDestination();
      // tabSource.connect(destination);
      // micSource.connect(destination);
      // combinedStream = destination.stream;
      combinedStream = tabStream;
    } else {
      combinedStream = tabStream;
    }

    audioRecorder.state = "recording";
    await audioRecorder.start(combinedStream);

    // Continue to play the captured audio to the user.
    const output = new AudioContext();
    const source = output.createMediaStreamSource(combinedStream);
    source.connect(output.destination);

    // Start recording.
    recorder = new MediaRecorder(combinedStream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (event) => accumulatedData.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(accumulatedData, { type: "audio/webm" });
      window.open(URL.createObjectURL(blob), "_blank");

      // Clear state ready for next recording
      recorder = undefined;
      accumulatedData = [];
    };
    recorder.start();
    // Record the current state in the URL
    window.location.hash = "recording";
  } catch (error) {
    console.error("Error starting recording:", JSON.stringify(error));
    let errorMessage = "An error occurred while starting the recording.";
    if (
      error.name === "NotAllowedError" ||
      error.message.includes("permission not granted")
    ) {
      errorMessage =
        "Please allow access to the tab audio and/or microphone to start recording.";
    }
    // Send a message to the background script to show a notification
    chrome.runtime.sendMessage({
      action: "showNotification",
      title: "Recording Error",
      message: errorMessage,
    });

    // Close WebSocket connection if it was opened
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.close();
    }
    // Reset state
    audioRecorder = undefined;
    websocket = undefined;
    window.location.hash = "";
  }
}

function updateSubtitle(text) {
  console.log("XXXXX", text);
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSubtitle",
          text: text,
        });
      }
    });
  } else {
    console.log("chrome.tabs is undefined");
  }
}

async function stopRecording() {
  audioRecorder.stop();

  // Close WebSocket connection
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.close();
  }

  console.log("COMPLETE RECORDING");

  // Clear state ready for next recording
  audioRecorder = undefined;
  websocket = undefined;

  // Update current state in URL
  window.location.hash = "";
}
