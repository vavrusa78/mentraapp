import { logger } from "../utils/logger";
import WebSocket from "ws";

interface ElevenLabsMessage {
  type: string;
  [key: string]: any;
}

interface AudioResponse {
  audio?: string;
  text?: string;
}

/**
 * ElevenLabs Conversational AI Client
 * Handles WebSocket connection to ElevenLabs agents
 */
export class ElevenLabsClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private agentId: string;
  private textResponses: string[] = [];
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private responsePromise: Promise<string> | null = null;
  private responseResolver: ((value: string) => void) | null = null;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || "";
    this.agentId = process.env.ELEVENLABS_AGENT_ID || "";

    if (!this.apiKey || !this.agentId) {
      logger.warn("ElevenLabs API key or Agent ID not configured");
    }
  }

  /**
   * Connect to ElevenLabs WebSocket
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        logger.info("Already connected to ElevenLabs");
        return;
      }

      logger.info("Connecting to ElevenLabs Conversational AI...");

      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`;
      
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket(wsUrl, {
          headers: {
            "xi-api-key": this.apiKey,
          },
        });

        this.ws.on("open", () => {
          logger.info("Connected to ElevenLabs WebSocket");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.setupMessageHandlers();
          resolve();
        });

        this.ws.on("error", (error) => {
          logger.error("WebSocket error:", error);
          this.isConnected = false;
          reject(error);
        });

        this.ws.on("close", (code, reason) => {
          logger.info(`WebSocket closed: ${code} - ${reason}`);
          this.isConnected = false;
          this.handleDisconnect();
        });
      });
    } catch (error) {
      logger.error("Error connecting to ElevenLabs:", error);
      throw error;
    }
  }

  /**
   * Setup message handlers for WebSocket
   */
  private setupMessageHandlers(): void {
    if (!this.ws) return;

    this.ws.on("message", (data: WebSocket.Data) => {
      try {
        const message: ElevenLabsMessage = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        logger.error("Error parsing WebSocket message:", error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: ElevenLabsMessage): void {
    logger.debug(`Received message type: ${message.type}`);

    switch (message.type) {
      case "conversation_initiation_metadata":
        logger.info("Conversation initiated");
        break;

      case "audio":
        // We only want text responses, so we extract text if available
        if (message.audio_event?.text) {
          this.textResponses.push(message.audio_event.text);
          logger.debug(`Text received: ${message.audio_event.text}`);
        }
        break;

      case "transcript":
        // Handle transcript messages
        if (message.transcript) {
          this.textResponses.push(message.transcript);
          logger.info(`Transcript: ${message.transcript}`);
        }
        break;

      case "agent_response":
        // Agent finished responding
        if (message.text) {
          const fullResponse = message.text;
          logger.info(`Agent response: ${fullResponse}`);
          
          // Resolve the waiting promise
          if (this.responseResolver) {
            this.responseResolver(fullResponse);
            this.responseResolver = null;
            this.responsePromise = null;
          }
        }
        break;

      case "interruption":
        logger.info("User interrupted");
        this.textResponses = [];
        break;

      case "ping":
        // Respond to ping
        this.sendPong();
        break;

      case "error":
        logger.error("ElevenLabs error:", message.message || message);
        break;

      default:
        logger.debug(`Unhandled message type: ${message.type}`);
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    } else {
      logger.error("Max reconnection attempts reached");
    }
  }

  /**
   * Send pong response
   */
  private sendPong(): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ type: "pong" }));
    }
  }

  /**
   * Disconnect from ElevenLabs
   */
  async disconnect(): Promise<void> {
    try {
      if (this.ws) {
        // Remove listeners to prevent reconnection
        this.ws.removeAllListeners();
        this.ws.close();
        this.ws = null;
      }
      this.isConnected = false;
      this.textResponses = [];
      this.responsePromise = null;
      this.responseResolver = null;
      logger.info("Disconnected from ElevenLabs");
    } catch (error) {
      logger.error("Error disconnecting from ElevenLabs:", error);
    }
  }

  /**
   * Send audio data to ElevenLabs
   */
  async sendAudio(audioData: Buffer): Promise<void> {
    try {
      if (!this.isConnected || !this.ws) {
        throw new Error("Not connected to ElevenLabs");
      }

      // ElevenLabs expects audio in base64 format
      const audioMessage = {
        user_audio_chunk: audioData.toString("base64"),
      };

      this.ws.send(JSON.stringify(audioMessage));
      logger.debug(`Sent ${audioData.length} bytes of audio`);
    } catch (error) {
      logger.error("Error sending audio:", error);
      throw error;
    }
  }

  /**
   * Get text response from ElevenLabs (no audio)
   */
  async getTextResponse(): Promise<string> {
    try {
      // Create a promise that resolves when we receive the agent response
      if (!this.responsePromise) {
        this.responsePromise = new Promise<string>((resolve, reject) => {
          this.responseResolver = resolve;

          // Timeout after 30 seconds
          setTimeout(() => {
            if (this.responseResolver) {
              reject(new Error("Response timeout"));
              this.responseResolver = null;
              this.responsePromise = null;
            }
          }, 30000);
        });
      }

      const response = await this.responsePromise;
      logger.info(`Text response received: ${response}`);
      
      return response;
    } catch (error) {
      logger.error("Error getting text response:", error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isActive(): boolean {
    return this.isConnected;
  }
}
