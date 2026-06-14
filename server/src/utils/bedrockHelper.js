// src/utils/bedrockHelper.js
// Thin wrapper around the Bedrock InvokeModel API for text + vision calls
import {
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { bedrock, BEDROCK_MODELS } from "./awsClients.js";

/**
 * Call Claude via Amazon Bedrock (text-only prompt).
 * @param {string} prompt
 * @param {object} opts  – { model, maxTokens, systemPrompt }
 * @returns {Promise<string>} assistant text
 */
export async function invokeClaudeText(prompt, opts = {}) {
  const {
    model = BEDROCK_MODELS.CLAUDE_SONNET,
    maxTokens = 1024,
    systemPrompt = "You are a helpful AI assistant for ReCircle, Amazon's circular commerce platform.",
  } = opts;

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  };

  const cmd = new InvokeModelCommand({
    modelId: model,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await bedrock.send(cmd);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content?.[0]?.text ?? "";
}

/**
 * Call Claude via Amazon Bedrock with an image + text prompt (vision).
 * @param {string} prompt
 * @param {Buffer} imageBuffer
 * @param {string} mediaType  – e.g. "image/jpeg"
 * @param {object} opts
 * @returns {Promise<string>}
 */
export async function invokeClaudeVision(prompt, imageBuffer, mediaType = "image/jpeg", opts = {}) {
  const {
    model = BEDROCK_MODELS.CLAUDE_SONNET,
    maxTokens = 1024,
    systemPrompt = "You are an expert product condition assessor for ReCircle, Amazon's AI-powered circular commerce platform. Analyse product photos and provide detailed condition assessments.",
  } = opts;

  const base64Image = imageBuffer.toString("base64");

  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  };

  const cmd = new InvokeModelCommand({
    modelId: model,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await bedrock.send(cmd);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content?.[0]?.text ?? "";
}

/**
 * Parse a JSON block from Claude's text response (Claude often wraps JSON in ```json blocks).
 * @param {string} text
 * @returns {object|null}
 */
export function extractJSON(text) {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    return null;
  }
}
