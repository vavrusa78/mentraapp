# G1 Voice Agent - Setup Tutorial

This guide will walk you through setting up the G1 Voice Agent from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18 or higher** installed ([download here](https://nodejs.org/))
- **Git** installed
- **SSH key configured** for GitHub (required for MentraOS SDK)
- **Even Realities G1 glasses** (for testing)
- **ElevenLabs account** with Conversational AI access

## Step 1: Verify Node.js Installation

Check your Node.js version:

```bash
node --version
```

You should see `v18.0.0` or higher. If not, install or update Node.js.

## Step 2: Configure GitHub SSH Access

The MentraOS SDK is installed via GitHub SSH. Verify your SSH access:

```bash
ssh -T git@github.com
```

You should see: `Hi <username>! You've successfully authenticated...`

If not, set up SSH keys:

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add to SSH agent:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. Add public key to GitHub:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output and add it to GitHub: Settings → SSH and GPG keys → New SSH key

## Step 3: Install Dependencies

Install all npm packages:

```bash
npm install
```

This will install:
- MentraOS SDK (from GitHub)
- TypeScript and development tools
- ElevenLabs dependencies (ws, express, dotenv)

If you get a permission error for the MentraOS repo, verify Step 2 is completed.

## Step 4: Configure ElevenLabs

### 4.1 Create ElevenLabs Account

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up or log in
3. Navigate to your API settings

### 4.2 Get API Credentials

1. **API Key**: Go to Profile → API Keys → Create new key
2. **Agent ID**: 
   - Go to Conversational AI section
   - Create a new agent or select existing one
   - Copy the Agent ID from the agent settings

### 4.3 Configure Environment Variables

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=your_agent_id_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

**Important:** Never commit your `.env` file to git!

## Step 5: Verify Setup

Run type checking to ensure everything is configured correctly:

```bash
npm run typecheck
```

You should see no errors. If there are errors, check that all dependencies installed correctly.

## Step 6: Start Development Server

Run the development server with hot reload:

```bash
npm run dev
```

You should see:
```
G1 Voice Agent server started on port 3000
Waiting for G1 glasses to connect...
```

## Step 7: Deploy (For G1 Glasses Testing)

The app must be deployed to a server accessible by your G1 glasses. Choose one option:

### Option A: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add environment variables (ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID)
4. Deploy

### Option B: Deploy to Ubuntu Server

See [MentraOS documentation](https://docs.mentraglass.com/deploy-to-ubuntu-server) for detailed instructions.

### Option C: Local Development with ngrok (Testing Only)

For quick testing, expose your local server:

```bash
# Install ngrok
brew install ngrok

# Expose port 3000
ngrok http 3000
```

Use the ngrok URL to connect your glasses.

## Step 8: Configure G1 Glasses

1. Install **MentraOS app** on your G1 glasses
2. Open MentraOS settings
3. Add your deployed server URL
4. Launch "G1 Voice Agent" from the glasses menu

## Step 9: Test the App

1. Tap glasses to start voice input
2. Speak your question
3. Wait for text response to appear on glasses display
4. Response should display, then automatically stop listening

## Troubleshooting

### "Permission denied" when installing dependencies

- Verify SSH key is added to GitHub (Step 2)
- Test with: `ssh -T git@github.com`

### "Cannot find module 'mentra-sdk'"

- Dependencies not installed
- Run `npm install` again
- Check that node_modules/mentra-sdk exists

### "WebSocket connection failed"

- Check ELEVENLABS_API_KEY is correct
- Verify ELEVENLABS_AGENT_ID matches your agent
- Ensure you have Conversational AI access in ElevenLabs

### "Audio error" on glasses

- Check microphone permissions in G1 settings
- Verify server is accessible from glasses network
- Check server logs for errors

### No response from ElevenLabs

- Check ElevenLabs agent is configured and active
- Verify audio format is supported
- Check logs with `LOG_LEVEL=debug` in .env

## Development Commands Reference

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Next Steps

- Customize agent prompts in ElevenLabs dashboard
- Optimize text display layout for G1 screen
- Add conversation history
- Implement custom wake words
- Add app settings

## Support

- **MentraOS Docs**: https://docs.mentraglass.com
- **ElevenLabs Docs**: https://elevenlabs.io/docs
- **Issues**: Report on GitHub repository
