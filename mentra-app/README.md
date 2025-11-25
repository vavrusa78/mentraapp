# G1 Voice Agent

Voice-controlled AI assistant for Even Realities G1 glasses using ElevenLabs Conversational AI.

## Features

- 🎤 Voice input via G1 glasses microphone
- 🤖 ElevenLabs Conversational AI integration
- 📱 Text-only display output (no audio playback)
- 👆 Tap to toggle voice input
- ☁️ Cloud-based processing with MentraOS

## Prerequisites

- Node.js 18 or higher
- Even Realities G1 glasses
- ElevenLabs API account with Conversational AI access

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key
   - `ELEVENLABS_AGENT_ID`: Your ElevenLabs agent ID

3. **Run in development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## How It Works

1. User opens the app on G1 glasses
2. Screen shows "Voice Agent Ready - Tap to start"
3. User taps the glasses to activate voice input
4. Glasses start recording audio via microphone
5. Audio is streamed to ElevenLabs Conversational AI
6. ElevenLabs processes the audio and returns text response
7. Response text is displayed on G1 glasses screen
8. Voice input automatically stops after response

## Project Structure

```
mentra-app/
├── src/
│   ├── index.ts              # AppServer entry point
│   ├── session.ts            # AppSession with voice/display logic
│   ├── elevenlabs/
│   │   └── client.ts         # ElevenLabs API client
│   └── utils/
│       └── logger.ts         # Logging utility
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

### Type checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Testing with G1 glasses
1. Deploy the app to a server (Railway, Ubuntu, etc.)
2. Install MentraOS app on your G1 glasses
3. Connect glasses to your deployed server
4. Launch the app from glasses menu

## Next Steps

- [ ] Implement actual ElevenLabs WebSocket integration
- [ ] Add support for streaming audio to ElevenLabs
- [ ] Optimize text display layout for G1 screen
- [ ] Add conversation history
- [ ] Implement custom agent prompts
- [ ] Add app settings via MentraOS dashboard

## Deployment

See MentraOS documentation:
- [Deploy to Railway](https://docs.mentraglass.com/deploy-to-railway)
- [Deploy to Ubuntu Server](https://docs.mentraglass.com/deploy-to-ubuntu-server)

## License

MIT
