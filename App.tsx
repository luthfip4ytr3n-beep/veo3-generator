import React, { useState, useEffect, useRef } from 'react';
import { 
  Clapperboard, 
  Upload, 
  Settings, 
  Download, 
  AlertCircle, 
  Key, 
  Video, 
  ImageIcon,
  Loader2,
  Play,
  Wand2
} from './components/Icons';
import { Button } from './components/ui/Button';
import { PromptBuilder } from './components/PromptBuilder';
import { generateVeoVideo, ensureApiKey, promptForApiKey } from './services/veoService';
import { VeoSettings, GenerationState, ImageReference } from './types';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'studio' | 'builder'>('studio');
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [refImage, setRefImage] = useState<ImageReference | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<VeoSettings>({
    model: 'veo-3.0-generate-preview',
    aspectRatio: '16:9',
    resolution: '1080p',
    enableSound: false,
  });

  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    progressMessage: '',
    error: null,
    videoUrl: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkKey = async () => {
    try {
      const hasKey = await ensureApiKey();
      setApiKeyReady(hasKey);
    } catch (e) {
      console.warn("AI Studio check failed", e);
    }
  };

  // --- Handlers ---

  const handleApiKeySelection = async () => {
    await promptForApiKey();
    // Assume success as per guidelines to avoid race condition
    setApiKeyReady(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setRefImage({
        data: base64Data,
        mimeType: file.type
      });
      setRefImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setRefImage(null);
    setRefImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    // Basic validation
    if (!prompt.trim() && !refImage) {
      setGenState(prev => ({ ...prev, error: "Please provide a text prompt or an image." }));
      return;
    }

    // Determine if we have a usable key
    if (!apiKeyReady) {
       setGenState(prev => ({ ...prev, error: "Please connect an API Key." }));
       return;
    }

    setGenState({
      isGenerating: true,
      progressMessage: "Starting Veo session...",
      error: null,
      videoUrl: null
    });

    try {
      const url = await generateVeoVideo(
        prompt, 
        refImage, 
        settings, 
        (msg) => setGenState(prev => ({ ...prev, progressMessage: msg }))
      );
      
      setGenState(prev => ({
        ...prev,
        isGenerating: false,
        videoUrl: url,
        progressMessage: "Done!"
      }));

    } catch (error: any) {
      setGenState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || "An unexpected error occurred."
      }));
      
      // If key invalid error, reset key state
      if (error.message?.includes("API Key")) {
        setApiKeyReady(false);
      }
    }
  };

  const handlePromptFromBuilder = (generatedPrompt: string) => {
    setPrompt(generatedPrompt);
    setActiveTab('studio');
  };

  // Helper to determine if generate button should be enabled
  const isReadyToGenerate = apiKeyReady;

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-primary-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-primary-600/20">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Veo3 Studio
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Navigation Tabs */}
             <div className="hidden md:flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                <button 
                  onClick={() => setActiveTab('studio')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'studio' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Video Studio
                </button>
                <button 
                  onClick={() => setActiveTab('builder')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === 'builder' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" /> Prompt Builder
                </button>
             </div>

             {!apiKeyReady ? (
               <Button variant="outline" onClick={handleApiKeySelection} className="text-sm h-9">
                 <Key className="w-4 h-4 mr-2" /> Connect Key
               </Button>
             ) : (
               <div className="flex items-center gap-3">
                 <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   Connected
                 </span>
                 <button 
                   onClick={handleApiKeySelection}
                   className="text-xs text-gray-500 hover:text-white underline transition-colors"
                   title="Change API Key"
                 >
                   Change Key
                 </button>
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        
        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex mb-6 bg-gray-900 p-1 rounded-lg border border-gray-800">
           <button 
              onClick={() => setActiveTab('studio')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'studio' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Video Studio
            </button>
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex justify-center items-center gap-2 ${
                activeTab === 'builder' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" /> Prompt Builder
            </button>
        </div>

        {activeTab === 'studio' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Prompt Section */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video Description
                  </label>
                  <button 
                    onClick={() => setActiveTab('builder')}
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 hover:underline"
                  >
                    <Wand2 className="w-3 h-3" /> Use Prompt Builder
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate (e.g., 'A cyberpunk city with flying cars in heavy rain'). You can also paste JSON."
                  className="w-full h-40 bg-gray-950 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              {/* Settings Section */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-gray-400 font-medium text-sm">
                  <Settings className="w-4 h-4" />
                  Configuration
                </div>
                
                <div className="space-y-4">
                  {/* Model Selector */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Model</label>
                    <select 
                      value={settings.model}
                      onChange={(e) => setSettings(s => ({ ...s, model: e.target.value }))}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-primary-600 outline-none appearance-none"
                    >
                      <option value="veo-3.0-generate-preview">Veo 3.0 (Preview)</option>
                      <option value="veo-3.1-fast-generate-preview">Veo 3.1 Fast (General)</option>
                      <option value="veo-3.1-generate-preview">Veo 3.1 High Quality</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Resolution</label>
                      <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                        {(['720p', '1080p'] as const).map((res) => (
                          <button
                            key={res}
                            onClick={() => setSettings(s => ({ ...s, resolution: res }))}
                            className={`flex-1 py-2 text-sm rounded-md transition-all ${
                              settings.resolution === res 
                                ? 'bg-gray-800 text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Aspect Ratio</label>
                      <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                        {(['16:9', '9:16'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setSettings(s => ({ ...s, aspectRatio: ratio }))}
                            className={`flex-1 py-2 text-sm rounded-md transition-all ${
                              settings.aspectRatio === ratio 
                                ? 'bg-gray-800 text-white shadow-sm' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                    <label className="text-sm text-gray-300">Enable Sound Generation</label>
                    <button
                      onClick={() => setSettings(s => ({ ...s, enableSound: !s.enableSound }))}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        settings.enableSound ? 'bg-primary-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                        settings.enableSound ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reference Image Section */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Reference Image (Optional)
                </label>
                
                {!refImagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/50 hover:bg-gray-800/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG supported</p>
                  </div>
                ) : (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-700">
                    <img src={refImagePreview} alt="Reference" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="danger" onClick={handleClearImage} className="scale-90">
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </div>

              {/* Action Button */}
              <Button 
                className="w-full py-4 text-lg font-bold tracking-wide shadow-primary-900/20" 
                onClick={handleGenerate}
                isLoading={genState.isGenerating}
                disabled={!isReadyToGenerate}
              >
                {isReadyToGenerate ? 'Generate Video' : 'Connect Key to Start'}
              </Button>
              
              {!apiKeyReady && (
                <p className="text-xs text-center text-gray-500">
                  Paid Google Cloud Project required for Veo models. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-gray-400">Learn more</a>
                </p>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 overflow-hidden shadow-2xl relative flex flex-col">
                <div className="border-b border-gray-800 p-4 flex items-center justify-between bg-gray-800/30">
                  <h2 className="font-semibold text-gray-200 flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary-500" />
                    Output Preview
                  </h2>
                  {genState.videoUrl && (
                    <a 
                      href={genState.videoUrl} 
                      download="veo-generated-video.mp4"
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download MP4
                    </a>
                  )}
                </div>

                <div className="flex-1 bg-black flex items-center justify-center relative p-4">
                  {genState.videoUrl ? (
                    <video 
                      src={genState.videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="max-h-full max-w-full rounded-lg shadow-2xl"
                      style={{
                        aspectRatio: settings.aspectRatio === '16:9' ? '16/9' : '9/16'
                      }}
                    />
                  ) : genState.isGenerating ? (
                    <div className="text-center space-y-4 max-w-sm px-6">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-bold text-white animate-pulse">Generating Video</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{genState.progressMessage}</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 space-y-3">
                      <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                        <Video className="w-8 h-8 opacity-20" />
                      </div>
                      <p>Your generated video will appear here.</p>
                    </div>
                  )}
                  
                  {/* Error Overlay */}
                  {genState.error && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 z-10">
                      <div className="bg-gray-900 border border-red-900/50 p-6 rounded-xl max-w-md text-center shadow-2xl">
                        <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-red-400 mb-2">Generation Failed</h3>
                        <p className="text-gray-400 text-sm mb-6">{genState.error}</p>
                        <Button variant="secondary" onClick={() => setGenState(prev => ({...prev, error: null}))}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Prompt Builder View */
          <div className="animate-fadeIn">
             <PromptBuilder onUsePrompt={handlePromptFromBuilder} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;