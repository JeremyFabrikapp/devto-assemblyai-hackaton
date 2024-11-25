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



async function startRecording(streamId) {
  if (audioRecorder?.state === "recording") {
    throw new Error("Called startRecording while recording is in progress.");
  }

  // Connect to WebSocket
  websocket = new WebSocket("ws://localhost:8888/ws");
  websocket.binaryType = "arraybuffer";
  websocket.onopen = () => {
    console.log("WebSocket connection established");
    
    websocket.send(JSON.stringify({ type: "session_start", userId: "74049d58-7768-47cb-aafe-7765a3bc72ba" }));

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

  const handleAudioData = (data) => {
    const uint8Array = new Uint8Array(data);
    appendToBuffer(uint8Array);
    // accumulatedData.push(data)
    if (buffer.length >= BUFFER_SIZE) {
      const toSend = new Uint8Array(buffer.slice(0, BUFFER_SIZE));
      buffer = new Uint8Array(buffer.slice(BUFFER_SIZE));

      const regularArray = String.fromCharCode(...toSend);
      const base64 = btoa(regularArray);
      websocket.send(toSend);
      // accumulatedData.push(toSend); // Add this line to accumulate data

      // websocket.send(
      //   JSON.stringify({ type: "input_audio_buffer.append", audio: base64 })
      // );
    }
  };

  audioRecorder = new Recorder(handleAudioData);
  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
  });

  audioRecorder.state = "recording";
  await audioRecorder.start(media);

  // Continue to play the captured audio to the user.
  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);


  // Start recording.
  recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
  recorder.ondataavailable = (event) => accumulatedData.push(event.data);
  recorder.onstop = () => {
    const blob = new Blob(accumulatedData, { type: 'audio/webm' });
    window.open(URL.createObjectURL(blob), '_blank');

    // Clear state ready for next recording
    recorder = undefined;
    accumulatedData = [];
  };
  recorder.start();
  // Record the current state in the URL
  window.location.hash = "recording";
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

  // Stopping the tracks makes sure the recording icon in the tab is removed.
  // audioRecorder.stream.getTracks().forEach((t) => t.stop());

  // Close WebSocket connection
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.close();
  }

  console.log("COMPLETE RECORDING");
  // Create a Blob from the accumulated data and open in a new window
  // const blob = new Blob(buffer, { type: "audio/webm" }); // Note: Changed to audio/webm
  // window.open(URL.createObjectURL(blob), "_blank");
  // const blob = new Blob(accumulatedData, { type: 'audio/webm' });
  // window.open(URL.createObjectURL(blob), '_blank');
  // // Clear accumulated data
  // recorder = undefined;
  // accumulatedData = [];
  console.log("COMPLETE RECORDING");

  // Clear state ready for next recording
  audioRecorder = undefined;
  websocket = undefined;

  // Update current state in URL
  window.location.hash = "";

  // Note: In a real extension, you would want to write the recordings to a more
  // permanent location (e.g IndexedDB) and then close the offscreen document,
  // to avoid keeping a document around unnecessarily. Here we avoid that to
  // make sure the browser keeps the Object URLs we create (see above) and to
  // keep the sample fairly simple to follow.
}
