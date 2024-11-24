export class AudioMixer {
  constructor(streams) {
    this.context = new AudioContext();
    this.streams = streams;
    this.mediaRecorder = null;
    this.setupAudioProcessing();
  }

  setupAudioProcessing() {
    const merger = this.context.createChannelMerger(this.streams.length);
    
    this.streams.forEach((stream, index) => {
      const source = this.context.createMediaStreamSource(stream);
      source.connect(merger, 0, index);
    });

    const destination = this.context.createMediaStreamDestination();
    merger.connect(destination);

    this.mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.onAudioData) {
        this.onAudioData(event.data);
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.streams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    
    this.context.close();
  }
}