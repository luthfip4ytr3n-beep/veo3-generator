export interface VeoSettings {
  model: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  enableSound: boolean; // Note: Current Veo API might interpret sound via prompt/model capabilities
}

export interface GenerationState {
  isGenerating: boolean;
  progressMessage: string;
  error: string | null;
  videoUrl: string | null;
}

export interface ImageReference {
  data: string; // Base64
  mimeType: string;
}

// Global declaration for the AI Studio key picker
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  
  interface Window {
    aistudio?: AIStudio;
  }
}