import { AppServer } from "mentra-sdk";
import dotenv from "dotenv";
import { VoiceAgentSession } from "./session";
import { logger } from "./utils/logger";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

/**
 * Main AppServer for G1 Voice Agent
 * Handles incoming connections from G1 glasses
 */
const appServer = new AppServer({
  // App metadata
  name: "G1 Voice Agent",
  description: "Voice-controlled AI assistant using ElevenLabs",
  version: "1.0.0",

  // Required permissions
  permissions: ["microphone"],

  // Session factory - creates new session for each connection
  sessionFactory: (appSession) => {
    logger.info("New session created");
    return new VoiceAgentSession(appSession);
  },

  // Server configuration
  port: PORT,
});

// Start the server
appServer.start().then(() => {
  logger.info(`G1 Voice Agent server started on port ${PORT}`);
  logger.info("Waiting for G1 glasses to connect...");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down server...");
  await appServer.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down server...");
  await appServer.stop();
  process.exit(0);
});
