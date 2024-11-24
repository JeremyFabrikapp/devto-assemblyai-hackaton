let isRecording = false;
const statusIndicator = document.getElementById('statusIndicator');
const recordButton = document.getElementById('recordButton');
const tabAudioCheckbox = document.getElementById('tabAudio');
const micAudioCheckbox = document.getElementById('micAudio');
const lastSubtitle = document.getElementById('lastSubtitle');

function updateStatus(message, type) {
  statusIndicator.textContent = message;
  statusIndicator.className = `status ${type}`;
}

function updateButton(recording) {
  const buttonText = recording ? 'Stop Recording' : 'Start Recording';
  recordButton.querySelector('.button-text').textContent = buttonText;
}

function validateSources() {
  const hasSource = tabAudioCheckbox.checked || micAudioCheckbox.checked;
  recordButton.disabled = !hasSource;
  return hasSource;
}

[tabAudioCheckbox, micAudioCheckbox].forEach(checkbox => {
  checkbox.addEventListener('change', validateSources);
});

recordButton.addEventListener('click', async () => {
  if (!isRecording) {
    if (!validateSources()) {
      updateStatus('Please select at least one audio source', 'error');
      return;
    }

    try {
      chrome.runtime.sendMessage({
        action: 'startRecording',
        sources: {
          tab: tabAudioCheckbox.checked,
          mic: micAudioCheckbox.checked
        }
      });
      isRecording = true;
      updateButton(true);
      updateStatus('Recording in progress...', 'recording');
    } catch (error) {
      updateStatus('Failed to start recording: ' + error.message, 'error');
    }
  } else {
    chrome.runtime.sendMessage({ action: 'stopRecording' });
    isRecording = false;
    updateButton(false);
    updateStatus('Recording stopped', 'connected');
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'status') {
    updateStatus(message.content, message.status);
  } else if (message.type === 'subtitle') {
    lastSubtitle.textContent = message.text;
  }
});

// Initial setup
updateStatus('Ready to record', 'connected');
validateSources();