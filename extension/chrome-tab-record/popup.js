document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById("startRecording")
    .addEventListener("click", async () => {
      try {
        // Request microphone access
        await initializeMicrophone();

        // Send a message to the background script to start recording
        chrome.runtime.sendMessage({
          action: "startRecording",
          useMicrophone: true,
        });

        // window.close(); // Close the popup after starting
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Microphone permission is required to start recording.");
      }
    });

  console.log("POPUPJS");

  // Initialize and check audio permission after 5 seconds
  const initializeMicrophone = async () => {
    const status = await checkAudioPermission();
    console.log("Initial microphone permission status:", status);
    if (status === "granted") {
      accessMicrophone()
        .then((stream) => {
          console.log("Audio stream:", stream);
          logAudioTracks(stream);
        })
        .catch((error) => {
          console.error("Error accessing audio stream:", error);
        });
    }
  };

  console.log("Waiting 5 seconds before checking audio permission...");
});
