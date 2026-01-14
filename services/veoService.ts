import { GoogleGenAI } from "@google/genai";
import { VeoSettings, ImageReference } from "../types";

// ============================================================================
// KONFIGURASI API KEY (KHUSUS LOCAL HOST)
// ============================================================================
// Jika Anda menjalankan di localhost dan ingin menggunakan API Key langsung,
// tempelkan API Key Anda di antara tanda kutip di bawah ini.
//
// CONTOH: const LOCAL_API_KEY = "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxx";
//
const LOCAL_API_KEY = ""; 
// ============================================================================

// Helper aman untuk membaca env variable tanpa crash di browser
const getEnvApiKey = () => {
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error jika process tidak didefinisikan
  }
  return undefined;
};

// Helper to validate and get API Key
export const ensureApiKey = async (): Promise<boolean> => {
  // Jika LOCAL_API_KEY diisi, anggap key sudah siap (bypass check AI Studio)
  if (LOCAL_API_KEY) return true;

  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    return hasKey;
  }
  return false;
};

export const promptForApiKey = async () => {
  // Jika LOCAL_API_KEY diisi, tidak perlu membuka popup
  if (LOCAL_API_KEY) return;

  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.error("AI Studio environment not detected.");
  }
};

export const generateVeoVideo = async (
  prompt: string,
  imageRef: ImageReference | null,
  settings: VeoSettings,
  onProgress: (msg: string) => void
): Promise<string> => {
  
  // 1. Initialize Client
  // Gunakan LOCAL_API_KEY jika ada, jika tidak gunakan helper aman untuk process.env
  const apiKey = LOCAL_API_KEY || getEnvApiKey();
  
  if (!apiKey) {
    throw new Error("API Key not found. Please set LOCAL_API_KEY in services/veoService.ts or connect via UI.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  // 2. Configure Model and Payload
  // Default to the latest high-quality preview
  const modelName = settings.model || 'veo-3.1-generate-preview';
  
  const config: any = {
    numberOfVideos: 1,
    resolution: settings.resolution,
    aspectRatio: settings.aspectRatio,
  };

  // Note: 'enableSound' is not strictly a config param in the provided Veo API docs,
  // but we can append it to the prompt to influence the model if applicable.
  let finalPrompt = prompt;
  if (settings.enableSound) {
    finalPrompt += " The video should include high quality sound design matching the visual content.";
  }

  onProgress(`Initializing request with ${modelName}...`);

  try {
    let operation;

    if (imageRef) {
      // Image-to-Video
      operation = await ai.models.generateVideos({
        model: modelName,
        prompt: finalPrompt,
        image: {
          imageBytes: imageRef.data,
          mimeType: imageRef.mimeType,
        },
        config: config
      });
    } else {
      // Text-to-Video
      operation = await ai.models.generateVideos({
        model: modelName,
        prompt: finalPrompt,
        config: config
      });
    }

    // 3. Poll for Completion
    onProgress("Video is generating. This may take a minute...");
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      onProgress("Still processing... ensuring high quality output...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgress("Generation complete. Downloading video...");

    // 4. Fetch the final video
    const generatedVideo = operation.response?.generatedVideos?.[0];
    
    if (!generatedVideo?.video?.uri) {
      throw new Error("No video URI returned from the API.");
    }

    const downloadLink = generatedVideo.video.uri;
    
    // Fetch with API Key appended
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (err: any) {
    console.error("Veo Generation Error:", err);
    // Handle "Requested entity was not found" specifically for key issues
    if (err.message && err.message.includes("Requested entity was not found")) {
        throw new Error("API Key session expired or invalid. Please check your key.");
    }
    throw err;
  }
};