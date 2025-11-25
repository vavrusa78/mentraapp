import { AppSession } from "mentra-sdk";
import { logger } from "./utils/logger";
import { ElevenLabsClient } from "./elevenlabs/client";

/**
 * Voice Agent Session
 * Manages the lifecycle of a single glasses connection
 */
export class VoiceAgentSession {
  private appSession: AppSession;
  private elevenLabsClient: ElevenLabsClient;
  private isListening: boolean = false;
  private isProcessingResponse: boolean = false;

  constructor(appSession: AppSession) {
    this.appSession = appSession;
    this.elevenLabsClient = new ElevenLabsClient();

    // Setup event listeners
    this.setupEventListeners();

    // Initialize the session
    this.initialize();
  }

  /**
   * Initialize the session with welcome screen
   */
  private async initialize(): Promise<void> {
    try {
      logger.info("Initializing voice agent session");

      // Display welcome message
      await this.displayText("Voice Agent Ready\nTap to start");

      logger.info("Session initialized successfully");
    } catch (error) {
      logger.error("Error initializing session:", error);
      await this.displayText("Error: Failed to initialize");
    }
  }

  /**
   * Setup event listeners for app lifecycle and user interactions
   */
  private setupEventListeners(): void {
    // App lifecycle events
    this.appSession.on("start", () => {
      logger.info("App started on glasses");
    });

    this.appSession.on("stop", () => {
      logger.info("App stopped on glasses");
      this.cleanup();
    });

    this.appSession.on("pause", () => {
      logger.info("App paused");
      this.stopListening();
    });

    this.appSession.on("resume", () => {
      logger.info("App resumed");
    });

    // User interaction events
    this.appSession.on("tap", async () => {
      logger.info("Tap detected - toggling voice input");
      await this.toggleVoiceInput();
    });

    // Audio events
    this.appSession.audioManager?.on("data", async (audioData: Buffer) => {
      if (this.isListening) {
        await this.handleAudioData(audioData);
      }
    });

    this.appSession.audioManager?.on("error", (error: Error) => {
      logger.error("Audio error:", error);
      this.displayText("Audio Error\nTry again");
    });
  }

  /**
   * Toggle voice input on/off
   */
  private async toggleVoiceInput(): Promise<void> {
    if (this.isListening) {
      await this.stopListening();
    } else {
      await this.startListening();
    }
  }

  /**
   * Start listening for voice input
   */
  private async startListening(): Promise<void> {
    try {
      logger.info("Starting voice input");
      this.isListening = true;
      this.isProcessingResponse = false;

      // Connect to ElevenLabs first
      await this.elevenLabsClient.connect();

      // Display listening indicator
      await this.displayText("Listening...\n\nSpeak now");

      // Start microphone (audio will now stream to handleAudioData)
      await this.appSession.audioManager?.start();

      // Start waiting for response in background
      this.waitForResponse();

      logger.info("Voice input started");
    } catch (error) {
      logger.error("Error starting voice input:", error);
      await this.displayText("Error\nCannot start mic");
      this.isListening = false;
    }
  }

  /**
   * Stop listening for voice input
   */
  private async stopListening(): Promise<void> {
    try {
      logger.info("Stopping voice input");
      this.isListening = false;

      // Stop microphone
      await this.appSession.audioManager?.stop();

      // Disconnect from ElevenLabs
      await this.elevenLabsClient.disconnect();

      // Show ready state
      await this.displayText("Voice Agent Ready\nTap to start");

      logger.info("Voice input stopped");
    } catch (error) {
      logger.error("Error stopping voice input:", error);
    }
  }

  /**
   * Handle incoming audio data from microphone
   * Streams audio continuously to ElevenLabs
   */
  private async handleAudioData(audioData: Buffer): Promise<void> {
    try {
      // Stream audio chunks to ElevenLabs as they arrive
      await this.elevenLabsClient.sendAudio(audioData);
    } catch (error) {
      logger.error("Error handling audio data:", error);
      await this.displayText("Error\nStreaming failed");
      await this.stopListening();
    }
  }

  /**
   * Wait for response from ElevenLabs in background
   */
  private async waitForResponse(): Promise<void> {
    try {
      if (this.isProcessingResponse) {
        return;
      }
      
      this.isProcessingResponse = true;
      logger.info("Waiting for ElevenLabs response...");

      // Get response (text only, no audio)
      const response = await this.elevenLabsClient.getTextResponse();

      if (response && this.isListening) {
        logger.info("Response received, displaying on glasses");
        
        // Display response on glasses
        await this.displayText(response);

        // Auto-stop after response
        await this.stopListening();
      }
    } catch (error) {
      logger.error("Error waiting for response:", error);
      
      if (this.isListening) {
        await this.displayText("Error\nNo response");
        await this.stopListening();
      }
    } finally {
      this.isProcessingResponse = false;
    }
  }

  /**
   * Display text on glasses screen
   */
  private async displayText(text: string): Promise<void> {
    try {
      await this.appSession.displayManager?.showText({
        text,
        duration: 5000, // Show for 5 seconds
        fontSize: "medium",
        alignment: "center",
      });
    } catch (error) {
      logger.error("Error displaying text:", error);
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      await this.stopListening();
      await this.elevenLabsClient.disconnect();
      logger.info("Session cleanup completed");
    } catch (error) {
      logger.error("Error during cleanup:", error);
    }
  }
}
