import { GoogleGenAI, Type } from "@google/genai";
import { Card, AIAdvice, ActionType } from "../types";

// Removed top-level initialization to prevent crash on module load

export const getBlackjackAdvice = async (
  dealerCard: Card,
  playerCards: Card[]
): Promise<AIAdvice> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  // Lazy initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


  const dealerStr = `${dealerCard.rank}${dealerCard.suit}`;
  const playerStr = playerCards.map((c) => `${c.rank}${c.suit}`).join(", ");

  const prompt = `
    You are a world-class Blackjack expert and mathematician.
    
    Context:
    - Standard Blackjack rules (assume 6 decks, Dealer stands on Soft 17).
    - Dealer Upcard: ${dealerStr}
    - Player Hand: ${playerStr}
    
    Task:
    Determine the mathematically optimal move for the player.
    Provide the best action, a confidence score (0-100) based on statistical advantage, and a brief, punchy explanation suitable for a player at the table.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Updated model name for better performance
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: [
                ActionType.HIT,
                ActionType.STAND,
                ActionType.DOUBLE,
                ActionType.SPLIT,
                ActionType.SURRENDER,
              ],
              description: "The best move to make.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence percentage (0-100) based on basic strategy charts.",
            },
            explanation: {
              type: Type.STRING,
              description: "A short, one-sentence reasoning for the decision.",
            },
          },
          required: ["action", "confidence", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAdvice;
  } catch (error) {
    console.error("Error fetching blackjack advice:", error);
    // Fallback in case of error, though ideally we handle this in UI
    throw error;
  }
};
