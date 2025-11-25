import { AppServer, AppSession } from "@mentra/sdk";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { ElevenLabsClient } from "./elevenlabs/client";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const PACKAGE_NAME = process.env.MENTRAOS_PACKAGE_NAME || "com.example.voiceagent";
const API_KEY = process.env.MENTRAOS_API_KEY;

if (!API_KEY) {
  throw new Error("MENTRAOS_API_KEY environment variable is required");
}

/**
 * Voice Agent Server for G1 Glasses
 * Extends AppServer to handle voice interactions with ElevenLabs
 */
class VoiceAgentServer extends AppServer {
  private elevenLabsClients = new Map<string, ElevenLabsClient>();

  protected async onSession(
    session: AppSession,
    sessionId: string,
    userId: string,
  ): Promise<void> {
    logger.info(`New session started: ${sessionId} for user: ${userId}`);

    // Create ElevenLabs client for this session
    const elevenLabsClient = new ElevenLabsClient();
    this.elevenLabsClients.set(sessionId, elevenLabsClient);

    // Show welcome message
    await session.layouts.showTextWall("Voice Agent Ready\nSay something to start");

    // Listen for transcriptions (voice input)
    session.events.onTranscription(async (data) => {
      logger.info(`User said: ${data.text}`);
      
      try {
        // Show that we're processing
        await session.layouts.showTextWall("Processing...\n\nPlease wait");

        // Connect to ElevenLabs if not connected
        if (!elevenLabsClient.isActive()) {
          await elevenLabsClient.connect();
        }

        // Send transcription to ElevenLabs for a response
        // Note: This is a simplified version - you may want to use
        // ElevenLabs text-to-text API instead of audio streaming
        const response = await elevenLabsClient.getTextResponse();

        if (response) {
          // Display response on glasses
          await session.layouts.showReferenceCard("Response", response);
        }
      } catch (error) {
        logger.error("Error processing transcription:", error);
        await session.layouts.showTextWall("Error\nPlease try again");
      }
    });

    // Listen for button presses
    session.events.onButtonPress(async (data) => {
      logger.info(`Button pressed: ${data.buttonId}`);
      await session.layouts.showTextWall("Voice Agent Ready\nSay something to start");
    });

    // Note: Session cleanup happens automatically when user disconnects
    // We clean up ElevenLabs clients when the server shuts down
  }
}

// Create and start the server
const server = new VoiceAgentServer({
  packageName: PACKAGE_NAME,
  apiKey: API_KEY,
  port: PORT,
});

server.start().then(() => {
  logger.info(`Voice Agent server started on port ${PORT}`);
  logger.info(`Package: ${PACKAGE_NAME}`);
  logger.info("Waiting for connections from MentraOS...");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down server...");
  process.exit(0);
});
