# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

G1 Voice Agent is a voice-controlled AI assistant for Even Realities G1 smart glasses using ElevenLabs Conversational AI. Built with TypeScript and the MentraOS SDK, it processes voice input through the glasses' microphone and displays text responses on the glasses' screen.

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID
```

### Running
```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start
```

### Code Quality
```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```

## Architecture

### Session-Based Architecture

The app follows a session-per-connection model where each G1 glasses connection spawns a new `VoiceAgentSession`. The `AppServer` (from mentra-sdk) acts as the entry point, creating sessions via `sessionFactory` and managing their lifecycle.

**Flow:**
1. `AppServer` (src/index.ts) receives connection from G1 glasses
2. Creates new `VoiceAgentSession` (src/session.ts) for that connection
3. Session manages:
   - Display output via `appSession.displayManager`
   - Microphone input via `appSession.audioManager`
   - ElevenLabs WebSocket connection via `ElevenLabsClient`
4. User taps glasses → audio streams to ElevenLabs → text response displayed

### Core Components

- **AppServer** (src/index.ts): MentraOS entry point, handles glasses connections and permissions
- **VoiceAgentSession** (src/session.ts): Per-connection session managing display, audio events, and voice input lifecycle
- **ElevenLabsClient** (src/elevenlabs/client.ts): WebSocket client for ElevenLabs Conversational AI (currently stubbed)

### MentraOS SDK Integration

The app depends on `mentra-sdk` (from MentraOS monorepo) which provides:
- `AppServer`: Server framework with session management
- `AppSession`: Per-connection session with audioManager and displayManager
- Event-driven API: `tap`, `start`, `stop`, `pause`, `resume`, `audioManager.on('data')`

## Configuration

Environment variables (see .env.example):
- `ELEVENLABS_API_KEY`: ElevenLabs API key
- `ELEVENLABS_AGENT_ID`: ElevenLabs agent ID for Conversational AI
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)

## Current State

**Implemented:**
- Session lifecycle management (start, stop, pause, resume)
- Tap-to-toggle voice input
- Display text on glasses screen
- Audio streaming from G1 microphone
- Logging via custom logger utility

**Stubbed/TODO:**
- ElevenLabs WebSocket integration (client.ts has placeholder implementation)
- Actual audio streaming to ElevenLabs
- Response parsing from ElevenLabs
- Conversation history
- Custom agent prompts

## MentraOS Monorepo Context

This app is part of the larger MentraOS ecosystem. The parent MentraOS/ directory contains the SDK source and broader platform. When working across both:
- Use Bun in MentraOS workspace: `cd MentraOS && bun install`
- This mentra-app uses npm: `npm install` in this directory
- SDK changes require rebuilding: follow MentraOS build steps
