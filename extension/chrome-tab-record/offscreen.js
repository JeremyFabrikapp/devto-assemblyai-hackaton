
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
let videoRecorder;
let audioData = [];
let videoData = [];
let websocket;
// const convertWebmToPcm = async (webmBuffer) => {
//   const audioContext = new AudioContext();
//   const audioData = await audioContext.decodeAudioData(webmBuffer);
//   const pcmData = audioData.getChannelData(0); // Assuming mono audio
//   return pcmData;
// };
async function startRecording(streamId) {
  if (
    audioRecorder?.state === "recording" ||
    videoRecorder?.state === "recording"
  ) {
    throw new Error("Called startRecording while recording is in progress.");
  }

  // Connect to WebSocket
  websocket = new WebSocket("ws://localhost:8888/ws");
  websocket.binaryType = "arraybuffer";
  websocket.onopen = () => {
    console.log("WebSocket connection established");
  };

  websocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  let buffer = new Uint8Array();

  const appendToBuffer = (newData) => {
    const newBuffer = new Uint8Array(buffer.length + newData.length);
    newBuffer.set(buffer);
    newBuffer.set(newData, buffer.length);
    buffer = newBuffer;
  };

  const handleAudioData = (data) => {
    const uint8Array = new Uint8Array(data);
    appendToBuffer(uint8Array);

    if (buffer.length >= BUFFER_SIZE) {
      const toSend = new Uint8Array(buffer.slice(0, BUFFER_SIZE));
      buffer = new Uint8Array(buffer.slice(BUFFER_SIZE));

      const regularArray = String.fromCharCode(...toSend);
      const base64 = btoa(regularArray);

      ws.send(
        JSON.stringify({ type: "input_audio_buffer.append", audio: base64 })
      );
    }
  };

  const audioRecorder = new Recorder(handleAudioData);
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
  // const media = await navigator.mediaDevices.getUserMedia({
  //   audio: {
  //     mandatory: {
  //       chromeMediaSource: "tab",
  //       chromeMediaSourceId: streamId,
  //     },
  //   },
  //   video: {
  //     mandatory: {
  //       chromeMediaSource: "tab",
  //       chromeMediaSourceId: streamId,
  //     },
  //   },
  // });

  // Continue to play the captured audio to the user.
  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  // Split the media stream into audio and video tracks
  const audioStream = new MediaStream(media.getAudioTracks());
  const videoStream = new MediaStream(media.getVideoTracks());

  /*
  // Start audio recording
  audioRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm" });
  audioRecorder.ondataavailable = async (event) => {
    // Create a new Blob from the event data
    const audioChunk = new Blob([event.data], { type: "audio/webm" });
    audioData.push(audioChunk);

    // Convert audio chunk to ArrayBuffer
    // const arrayBuffer = await audioChunk.arrayBuffer();

    // Convert WebM to PCM
    // const pcmData = await convertWebmToPcm(arrayBuffer);

    // Send PCM data to the WebSocket
    if (websocket.readyState === WebSocket.OPEN) {
      // websocket.send(event.data);
    }
  };
  // audioRecorder.start(1000); // Send data every 1 second
  */
  // Start video recording
  // videoRecorder = new MediaRecorder(videoStream, { mimeType: "video/webm" });
  // videoRecorder.ondataavailable = (event) => {
  //   videoData.push(event.data);
  // };
  // videoRecorder.start(1000); // Send data every 1 second

  // Record the current state in the URL
  window.location.hash = "recording";
}

async function stopRecording() {
  audioRecorder.stop();
  // videoRecorder.stop();

  // Stopping the tracks makes sure the recording icon in the tab is removed.
  audioRecorder.stream.getTracks().forEach((t) => t.stop());
  // videoRecorder.stream.getTracks().forEach((t) => t.stop());

  // Close WebSocket connection
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.close();
  }

  console.log("COMPLETE RECORDING");
  // return;
  // Create blobs for audio and video
  const audioBlob = new Blob(audioData, { type: "audio/webm" });
  // const videoBlob = new Blob(videoData, { type: "video/webm" });

  // Clear state ready for next recording
  audioRecorder = undefined;
  videoRecorder = undefined;
  audioData = [];
  videoData = [];
  websocket = undefined;

  // Open audio and video in new tabs
  // window.open(URL.createObjectURL(audioBlob), '_blank');
  // window.open(URL.createObjectURL(videoBlob), '_blank');

  // Update current state in URL
  window.location.hash = "";

  // Note: In a real extension, you would want to write the recordings to a more
  // permanent location (e.g IndexedDB) and then close the offscreen document,
  // to avoid keeping a document around unnecessarily. Here we avoid that to
  // make sure the browser keeps the Object URLs we create (see above) and to
  // keep the sample fairly simple to follow.
}
