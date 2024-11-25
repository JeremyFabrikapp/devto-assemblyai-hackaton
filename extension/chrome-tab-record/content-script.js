// Create and inject the subtitle overlay
const subtitleOverlay = document.createElement('div');
subtitleOverlay.id = 'extension-subtitle-overlay';
subtitleOverlay.style.cssText = `
  position: fixed;
  bottom: 0px;
  left: 0;
  width: 100%;
  padding: 30px 30px; /* Increased padding for more visible spacing */
  background-color: rgba(255, 255, 255, 0.9); /* Changed to a lighter background for better visibility */
  color: black; /* Changed text color to black for contrast */
  text-align: center;
  font-size: 18px;
  z-index: 9999;
`;
subtitleOverlay.textContent = "Press on the Red Dot in Extensions to start recording";
document.body.appendChild(subtitleOverlay);
console.log("Subtitle overlay created and appended to the document body.", chrome);

// Declare a variable to keep track of the removal timestamp
let removalTimestamp = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from background script:", message);
  if (message.action === 'updateSubtitle') {
    if (message.text) {
      subtitleOverlay.textContent = message.text;
      if (!document.body.contains(subtitleOverlay)) {
        document.body.appendChild(subtitleOverlay);
      }
    } else {
      if (document.body.contains(subtitleOverlay)) {
        removalTimestamp = Date.now() + 2000; // Set timestamp for 2 seconds later

        const checkAndRemoveOverlay = () => {
          if (Date.now() >= removalTimestamp && document.body.contains(subtitleOverlay)) {
            document.body.removeChild(subtitleOverlay);
          }
        };

        const removalTimeout = setTimeout(checkAndRemoveOverlay, 2000);

        // Ensure the subtitle is displayed for at least 2 seconds
        subtitleOverlay.onmouseenter = () => clearTimeout(removalTimeout);
        subtitleOverlay.onmouseleave = () => {
          removalTimestamp = Date.now() + 2000;
          setTimeout(() => {
            if (Date.now() >= removalTimestamp && document.body.contains(subtitleOverlay)) {
              document.body.removeChild(subtitleOverlay);
            }
          }, 2000);
        };
      }
    }
  }
});