export class WebSocketClient {
  constructor(url = 'ws://localhost:8080') {
    this.url = url;
    this.ws = null;
    this.onSubtitle = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'subtitle' && this.onSubtitle) {
            this.onSubtitle(data.text);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
    });
  }

  sendAudio(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }
}