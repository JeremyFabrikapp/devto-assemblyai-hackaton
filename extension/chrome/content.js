// Create and inject the subtitle overlay
const overlay = document.createElement('div');
overlay.className = 'subtitle-overlay';
overlay.style.display = 'none';
document.body.appendChild(overlay);

let hideTimeout;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'subtitle') {
    overlay.textContent = message.text;
    overlay.style.display = 'block';
    
    // Clear existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // Hide subtitle after 3 seconds
    hideTimeout = setTimeout(() => {
      overlay.style.display = 'none';
    }, 3000);
  }
});