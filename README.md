# AssemblyAI Challenge: Really Rad Real-Time

## What I Built

For the AssemblyAI Challenge, I developed a real-time audio transcription and note-taking application. This project combines the power of AssemblyAI's Streaming API with a user-friendly interface to provide instant transcription, live note-taking, and AI-assisted content generation.

The application consists of three main components:

1. A Chrome extension for capturing tab audio, displaying subtitles, and fetching audio from any webpage or microphone
2. A server-side component for handling WebSocket connections and interacting with AssemblyAI's API
3. A frontend web application for displaying transcriptions and managing notes. The user will be able to rewrite and generate notes from a recorded session

## Demo

[Link to the deployed application]

### Screenshots

![Recording Interface](screenshot_recording_interface.png)
*The main recording interface showing live transcription and note-taking features*

![Note Generation](screenshot_note_generation.png)
*AI-assisted note generation based on the transcribed content*

![Session Review](screenshot_session_review.png)
*Review and edit transcribed sessions with additional context and notes*

## Journey

Implementing AssemblyAI's Streaming API was an exciting process that involved several key steps:

1. **Setting up the WebSocket connection**: I used the Hono framework to create a WebSocket server that acts as a bridge between the client and AssemblyAI's API.

2. **Audio capture and streaming**: I developed a Chrome extension to capture tab audio and stream it to our server. The extension uses the `chrome.tabCapture` API to access the audio stream.

3. **Real-time transcription display**: On the frontend, I created a React component to display the live transcription as it comes in from the WebSocket.

4. **AI-assisted note generation**: I implemented a feature that allows users to generate notes based on the transcribed content using AI-powered instructions.

One of the most challenging aspects was ensuring a smooth, real-time experience while handling the continuous stream of audio data and transcription results. I had to carefully manage state updates and optimize rendering to prevent lag or jitter in the user interface.

## Additional Prompts

This submission qualifies for the following additional prompts:

1. **Chrome Extension**: I developed a Chrome extension to capture tab audio, which is a crucial component of the application. The extension allows users to record audio from any tab and send it to our server for transcription.

2. **AI-Assisted Content Generation**: The application uses AI to generate notes and summaries based on the transcribed content. This feature enhances the user's note-taking experience by providing intelligent suggestions and transformations of the transcribed text.

By integrating these additional tools, I was able to create a more comprehensive and powerful application that goes beyond simple transcription. The Chrome extension allows for seamless audio capture from any web content, while the AI-assisted content generation provides valuable insights and summaries to users, making their note-taking process more efficient and effective.

Throughout this project, I gained valuable experience in working with real-time audio processing, WebSocket communication, and integrating AI capabilities into a web application. The AssemblyAI Streaming API proved to be robust and reliable, enabling me to create a responsive and accurate transcription experience for users.
