
import { GoogleGenAI } from "@google/genai";

// Using the specified nano banana model equivalent for image generation
const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
// High quality model for architecture diagrams
const PRO_IMAGE_MODEL = 'gemini-3-pro-image-preview';

export const generateArchitectureDiagram = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    A high-quality, professional technical architecture diagram for an AI horror app called 'SEVEN DOORS TO HELL'. 
    The diagram should be laid out in 3 main numbered horizontal blocks from left to right:
    
    1. 'Generative Horror Brain' (powered by Gemini 2.5 Flash):
       - Purpose: Orchestrates on-demand spooky asset generation (Ghosts, Bats, Monsters).
       - Features: Dynamic image generation based on user game mode selection.
    
    2. 'Real-time Vision Layer' (powered by MediaPipe):
       - Purpose: Ultra-low latency face and hand tracking (<30ms).
       - Features: Spatial reasoning for ghost interaction and hand-gesture recognition for gameplay.
    
    3. 'Interactive Haunted Interface' (React/Canvas):
       - Purpose: The immersive frontend that blends real-world reflection with generated nightmares.
       - Features: CRT scanline effects, audio-visual feedback, and responsive state management.
    
    Visual Style: Modern, clean, professional architecture map style (similar to Google Cloud diagrams). 
    Background: Deep black/dark grey.
    Accents: Neon red (horror) and cyan (tech). 
    Show flow arrows connecting the blocks. 
    High contrast, sleek icons, and technical typography.
  `;

  try {
    const response = await ai.models.generateContent({
      model: PRO_IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No diagram data found");
  } catch (error) {
    console.error("Failed to generate architecture:", error);
    throw error;
  }
};

export const generateGhostAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    A terrifying, high-contrast horror movie ghost figure. 
    The ghost is a pale, spectral woman with long hair, reaching a hand out towards the viewer.
    CRITICAL: The background MUST be pure solid black (#000000). 
    The ghost should look like smoke and decay. 
    Photorealistic style, grainy found footage look.
  `;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response candidates");
  } catch (error) {
    console.error("Failed to summon the ghost:", error);
    throw error;
  }
};

export const generateSpiritAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    A classic spooky white flying ghost. 
    Traditional bedsheet ghost style with hollow black eyes and mouth.
    Floating in the air, arms out.
    CRITICAL: The background MUST be pure solid black (#000000).
    High contrast, spectral, eerie but distinct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No spirit image data in response");
  } catch (error) {
    console.error("Failed to summon spirits:", error);
    throw error;
  }
};

export const generateBatAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    A black vampire bat silhouette.
    The bat should be in flight with wings spread.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    High contrast vector art style.
  `;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No bat image data in response");
  } catch (error) {
    console.error("Failed to create bats:", error);
    throw error;
  }
};

export const generateZombieFaceAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Black and white artistic face paint mask. 
    Symmetrical patterns, theater makeup style, Day of the Dead style.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    Costume design.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No zombie face data");
  } catch (error) { throw error; }
};

export const generateDamagedEyeAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A red mechanical robot eye.
    Circular red glowing iris.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    Sci-fi robot eye design.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No eye data");
  } catch (error) { throw error; }
};

export const generateDaggerAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    An antique silver ornamental artifact.
    Ornate handle at the bottom, long pointed metallic shape at the top.
    Vertical orientation.
    CRITICAL: The background MUST be pure solid white (#FFFFFF).
    Museum display item, historical prop, non-weapon.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No dagger data");
  } catch (error) { throw error; }
};

export const generateMosquitoAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A scientific illustration of a mosquito flying, side view.
    Detailed insect silhouette.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    High contrast, vector art style.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No mosquito data");
  } catch (error) { throw error; }
};

export const generateRacketAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    An electric mosquito zapper racket (fly swatter).
    Tennis racket shape, yellow plastic handle, metal mesh grid.
    Vertical orientation.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    Product photo style.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No racket data");
  } catch (error) { throw error; }
};

export const generateClownAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A terrifying creepy clown face looking directly at the camera.
    Wild red hair, pale cracked skin, sharp teeth smile.
    The clown is peeking out, so the bottom half or sides should be cut off naturally.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    Horror movie poster style, high detail.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No clown data");
  } catch (error) { throw error; }
};

export const generateTomatoAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A bright red rotten tomato.
    Round, slightly squashed, organic texture.
    CRITICAL: The background MUST be pure solid WHITE (#FFFFFF).
    Realistic style.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No tomato data");
  } catch (error) { throw error; }
};

export const generateSnakeHeadAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A menacing, bright green viper snake head.
    Open mouth, fangs visible, looking forward.
    CRITICAL: The background MUST be pure solid BLACK (#000000).
    High detail, game sprite style.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No snake head data");
  } catch (error) { throw error; }
};

export const generateRatAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A dirty grey sewer rat viewed from the top down.
    Tail visible, scurrying posture.
    CRITICAL: The background MUST be pure solid BLACK (#000000).
    Game sprite style.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No rat data");
  } catch (error) { throw error; }
};

export const generateSkullAsset = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    A burning red demon skull.
    Surrounded by hellfire.
    CRITICAL: The background MUST be pure solid BLACK (#000000).
    Pixel art or game sprite style.
  `;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No skull data");
  } catch (error) { throw error; }
};
