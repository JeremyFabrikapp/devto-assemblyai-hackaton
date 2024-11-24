let isRecording = false;

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('recordButton');
  const wsUrlInput = document.getElementById('wsUrl');
  const statusDiv = document.getElementById('statusIndicator');

  toggleButton.addEventListener('click', async () => {
    if (!isRecording) {
      const wsUrl = wsUrlInput.value;
      if (!wsUrl) {
        statusDiv.textContent = 'Please enter a WebSocket URL';
        statusDiv.className = 'status error';
        return;
      }

      chrome.runtime.sendMessage(
        { type: 'START_RECORDING', wsUrl },
        (response) => {
          if (response.status === 'started') {
            isRecording = true;
            toggleButton.querySelector('.button-text').textContent = 'Stop Recording';
            statusDiv.textContent = 'Recording...';
            statusDiv.className = 'status recording';
          }
        }
      );
    } else {
      chrome.runtime.sendMessage(
        { type: 'STOP_RECORDING' },
        (response) => {
          if (response.status === 'stopped') {
            isRecording = false;
            toggleButton.querySelector('.button-text').textContent = 'Start Recording';
            statusDiv.textContent = 'Ready';
            statusDiv.className = 'status connected';
          }
        }
      );
    }
  });
});

// Listen for error messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ERROR') {
    const statusDiv = document.getElementById('statusIndicator');
    statusDiv.textContent = `Error: ${message.error}`;
    statusDiv.className = 'status error';
  } else if (message.type === 'subtitle') {
    const lastSubtitle = document.getElementById('lastSubtitle');
    lastSubtitle.textContent = message.text;
  }
});

// Initial setup
const statusDiv = document.getElementById('statusIndicator');
statusDiv.textContent = 'Ready to record!';
statusDiv.className = 'status connected';