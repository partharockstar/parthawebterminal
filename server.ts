import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface DrawnRegionInput {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  beforeLabel: string;
  afterInstruction: string;
}

// Safely sanitize and process image payloads for Gemini API
function processImageInput(imageBase64?: string, mimeType?: string): { imagePart?: any; textFallback?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return {};
  }

  // Check if it is an SVG (data URI or raw markup)
  if (
    imageBase64.includes('image/svg') ||
    imageBase64.includes('<svg') ||
    imageBase64.includes('%3Csvg')
  ) {
    try {
      let svgText = imageBase64;
      if (svgText.startsWith('data:')) {
        const commaIdx = svgText.indexOf(',');
        if (commaIdx !== -1) {
          const header = svgText.substring(0, commaIdx);
          const body = svgText.substring(commaIdx + 1);
          if (header.includes('base64')) {
            svgText = Buffer.from(body, 'base64').toString('utf-8');
          } else {
            svgText = decodeURIComponent(body);
          }
        }
      }
      return {
        textFallback: `\n--- WEBPAGE VISUAL SVG LAYOUT & DOM ELEMENTS SOURCE ---\n${svgText}\n--- END WEBPAGE SVG SOURCE ---\n`,
      };
    } catch (e) {
      console.warn('Failed to parse SVG payload:', e);
      return {};
    }
  }

  // Process raster image (PNG, JPEG, WEBP)
  let cleanData = imageBase64;
  let detectedMime = (mimeType || 'image/png').toLowerCase();

  const dataUriMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    detectedMime = dataUriMatch[1].toLowerCase();
    cleanData = dataUriMatch[2];
  } else {
    cleanData = imageBase64.replace(/^data:[^;]+;base64,/, '');
  }

  if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) {
    detectedMime = 'image/jpeg';
  } else if (detectedMime.includes('webp')) {
    detectedMime = 'image/webp';
  } else {
    detectedMime = 'image/png';
  }

  cleanData = cleanData.replace(/\s+/g, '');

  // Verify valid base64
  const isBase64Valid = cleanData.length > 20 && /^[A-Za-z0-9+/=]+$/.test(cleanData);
  if (!isBase64Valid) {
    return {};
  }

  return {
    imagePart: {
      inlineData: {
        mimeType: detectedMime,
        data: cleanData,
      },
    },
  };
}

// Endpoint to generate Tampermonkey Userscript from screenshot and instructions
app.post('/api/generate-tampermonkey', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/png',
      prompt,
      matchUrl = '*://*/*',
      scriptName = 'Custom UI Tweaker',
      regions = [],
      annotations = [],
      strategy = 'smart',
      runAt = 'document-idle',
    } = req.body;

    if (!imageBase64 && !prompt && (!regions || regions.length === 0)) {
      return res.status(400).json({ error: 'Image, prompt, or drawn change regions are required.' });
    }

    // Build Before -> After transformation specifications
    const drawnBoxesText = (regions as DrawnRegionInput[])
      .map((r, idx) => {
        return `TRANSFORMATION #${idx + 1}:
• BEFORE (Marked area at X: ${Math.round(r.x)}%, Y: ${Math.round(r.y)}%, W: ${Math.round(r.width)}%, H: ${Math.round(r.height)}%): "${r.beforeLabel || 'Marked Box #' + (idx + 1)}"
• AFTER (User requested change): "${r.afterInstruction || 'Hide or modify as appropriate'}"`;
      })
      .join('\n\n');

    const annotationsText = (annotations as any[])
      .map((a, idx) => `Point #${idx + 1} at [X: ${Math.round(a.x)}%, Y: ${Math.round(a.y)}%]: "${a.label || 'Target Element'}" - ${a.description}`)
      .join('\n');

    const systemInstruction = `You are an elite frontend reverse-engineering and Tampermonkey/Violentmonkey Userscript architect.
The user has uploaded a screenshot of a webpage and used a DRAW TOOL to mark specific bounding boxes / regions.
For each marked region, the user provides a "BEFORE" (what was captured) and an "AFTER" (what they want it to change into).
Your job is to inspect the screenshot image carefully at those visual coordinates and generate a complete, robust, ready-to-run Tampermonkey Userscript that implements EVERY SINGLE "BEFORE ➔ AFTER" transformation!

Key architectural guidelines for the Tampermonkey script:
1. Include a complete, valid Tampermonkey UserScript header block:
   // ==UserScript==
   // @name         ${scriptName || 'UI Customizer'}
   // @namespace    https://screenmonkey.local/
   // @version      1.0.0
   // @description  ...
   // @author       ScreenMonkey AI
   // @match        ${matchUrl || '*://*/*'}
   // @grant        GM_addStyle
   // @run-at       ${runAt}
   // ==/UserScript==

2. Exact Transformation Fulfillment:
   - For every marked region, find the corresponding DOM elements (by CSS classes, IDs, text content, semantic tags, buttons, banners, etc.)
   - If the AFTER instruction says "hide", "remove", "display: none", inject strong CSS rules (with !important) or remove the element.
   - If the AFTER instruction says to change text, change colors, add animations, modify font sizes, or insert buttons, implement the necessary CSS and safe DOM JavaScript.
   - For modern dynamic Single Page Apps (SPAs like React, YouTube, Next.js), provide a resilient MutationObserver with debounce or \`waitForElement\` helper so modifications survive client-side navigations and lazy loading.

3. Return structured JSON with:
   - scriptName: title of the script
   - matchUrl: target url match pattern
   - summary: concise high-level overview of all transformations implemented
   - tampermonkeyCode: complete executable Javascript code with full metadata block
   - changes: array of each change made with { element, action, selectorUsed, rationale }
   - tips: 2-4 practical tips for the user (e.g., testing selectors in DevTools, tweaking the @match pattern, etc.)`;

    const promptText = `
Webpage Modification Request (Before ➔ After Transformations):

${drawnBoxesText ? `SPECIFIC DRAWN BOXES (BEFORE ➔ AFTER MAPPINGS):\n${drawnBoxesText}\n` : ''}

${prompt ? `ADDITIONAL GENERAL INSTRUCTIONS:\n${prompt}\n` : ''}

Target Match URL: ${matchUrl}
Script Name: ${scriptName}
Strategy: ${strategy} (smart = CSS + MutationObserver DOM logic)
Run-At: ${runAt}

Generate a complete, fully functioning Tampermonkey UserScript that accomplishes all these Before ➔ After changes.`;

    const parts: any[] = [];

    const { imagePart, textFallback } = processImageInput(imageBase64, mimeType);
    if (imagePart) {
      parts.push(imagePart);
    }
    if (textFallback) {
      parts.push({ text: textFallback });
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scriptName: { type: Type.STRING },
            matchUrl: { type: Type.STRING },
            summary: { type: Type.STRING },
            tampermonkeyCode: { type: Type.STRING },
            changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  action: { type: Type.STRING },
                  selectorUsed: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['element', 'action', 'selectorUsed', 'rationale'],
              },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['scriptName', 'matchUrl', 'summary', 'tampermonkeyCode', 'changes', 'tips'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from AI model');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating Tampermonkey script:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate Tampermonkey script.',
    });
  }
});

// Endpoint to refine existing Tampermonkey script
app.post('/api/refine-tampermonkey', async (req: Request, res: Response) => {
  try {
    const { currentScript, feedback, imageBase64, mimeType } = req.body;

    if (!currentScript || !feedback) {
      return res.status(400).json({ error: 'currentScript and feedback are required.' });
    }

    const systemInstruction = `You are an expert Tampermonkey Userscript developer.
The user already has an existing Tampermonkey script and wants to refine, fix, adjust, or add features based on feedback.
Analyze the current script and apply the requested refinements cleanly.
Preserve the metadata header while updating the version number if appropriate.`;

    const parts: any[] = [];

    const { imagePart, textFallback } = processImageInput(imageBase64, mimeType);
    if (imagePart) {
      parts.push(imagePart);
    }
    if (textFallback) {
      parts.push({ text: textFallback });
    }

    parts.push({
      text: `CURRENT SCRIPT:
\`\`\`javascript
${currentScript}
\`\`\`

USER FEEDBACK / MODIFICATION REQUEST:
${feedback}

Return the updated script and explanation in structured JSON.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scriptName: { type: Type.STRING },
            summary: { type: Type.STRING },
            tampermonkeyCode: { type: Type.STRING },
            changes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  element: { type: Type.STRING },
                  action: { type: Type.STRING },
                  selectorUsed: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['element', 'action', 'selectorUsed', 'rationale'],
              },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['scriptName', 'summary', 'tampermonkeyCode', 'changes', 'tips'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from AI model');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error refining Tampermonkey script:', error);
    return res.status(500).json({
      error: error.message || 'Failed to refine Tampermonkey script.',
    });
  }
});

// Setup Vite in Dev or Static files in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
