// Create and inject the subtitle overlay
const subtitleOverlay = document.createElement('div');
subtitleOverlay.id = 'extension-subtitle-overlay';
subtitleOverlay.style.cssText = `
  position: fixed;
  bottom: 50px;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 18px;
  z-index: 9999;
`;
document.body.appendChild(subtitleOverlay);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSubtitle') {
    subtitleOverlay.textContent = message.text;
  }
});