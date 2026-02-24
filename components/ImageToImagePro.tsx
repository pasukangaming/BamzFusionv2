
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Download,
  Eye, 
  Zap,
  Monitor,
  Phone,
  Clapperboard,
  BrainCircuit,
  Layers,
  ShieldCheck,
  Chrome,
  ArrowRight,
  Server,
  AlertTriangle,
  Info,
  CheckCircle2,
  WandSparkles,
  Maximize
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImagesPro, enhancePromptGrok } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '3:4 Potret', value: '3:4' },
  { label: '4:3 Lanskap', value: '4:3' },
  { label: '9:16 Cerita', value: '9:16' },
  { label: '16:9 Sinematik', value: '16:9' },
];

const RESOLUTIONS = [
  { id: '1K', label: '1K Standard' },
  { id: '2K', label: '2K High-Def' },
  { id: '4K', label: '4K Ultra-HD' },
];

const LOADING_MESSAGES = [
  "Inisialisasi Grok Visual Engine...",
  "Menganalisis 1-5 aset gambar...",
  "Grok AI sedang 'berpikir' (Thinking Mode)...",
  "Membangun struktur piksel Pro...",
  "Merender detail 4K...",
  "Menyelesaikan paket download..."
];

interface ImageToImageProProps {
  onPreview: (url: string) => void;
}

export default function ImageToImagePro({ onPreview }: ImageToImageProProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGrokActive, setIsGrokActive] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsConnected(hasKey);
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add explicit type casting to File[] to avoid 'unknown' type inference issues
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar referensi didukung oleh Grok Pro.');
      return;
    }

    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    setError(null);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsConnected(true);
    }
  };

  const handleGenerate = async () => {
    if (!isConnected) {
      handleOpenKey();
      return;
    }

    if (images.length === 0) {
      setError('Harap unggah setidaknya satu gambar referensi.');
      return;
    }

    if (!prompt.trim()) {
      setError('Harap berikan instruksi prompt.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalPrompt = prompt;
      
      // Step 1: Deep Reasoning Enhancement with Grok Pro text model
      if (isGrokActive) {
        finalPrompt = await enhancePromptGrok(finalPrompt, images.map(img => img.file));
      }

      // Step 2: Render Image using Gemini 3 Pro Image model
      const imageUrls = await transformImagesPro(
        images.map(img => img.file),
        finalPrompt,
        aspectRatio,
        imageSize
      );

      setResults(prev => [{
        imageUrls,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setIsConnected(false);
        setError("Koneksi Google AI terputus atau API Key tidak valid untuk model Pro. Silakan hubungkan kembali.");
      } else {
        setError(err.message || 'Grok Pro Engine mengalami kendala teknis.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-[#070b15]/80 backdrop-blur-2xl rounded-[3rem] border border-white/[0.05] p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 overflow-hidden relative">
          {/* Status Bar */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {isConnected ? 'Grok Pro Connected' : 'Auth Required'}
                </span>
             </div>
             <div className="flex items-center gap-1.5 bg-violet-500/10 px-2 py-1 rounded-lg border border-violet-500/20">
                <Chrome className="w-3 h-3 text-violet-400" />
                <span className="text-[8px] font-black text-violet-400 uppercase tracking-tighter">Gemini 3 Pro</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-3 rounded-2xl shadow-xl shadow-violet-600/20 rotate-3">
                <WandSparkles className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tighter">Transformer Pro</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">High Fidelity Image2Image</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Visual Assets Support up to 5 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Referensi Aset (1-5)</label>
                <span className="text-[9px] font-bold text-violet-400">{images.length}/5 Foto</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5 bg-slate-900/50">
                    <img src={img.preview} alt="Ref" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(img.id)} 
                      className="absolute inset-0 m-auto w-8 h-8 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    >
                       <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group">
                    <Upload className="w-6 h-6 text-slate-600 mb-1 group-hover:text-violet-400" />
                    <span className="text-[8px] text-slate-500 font-black uppercase">Add Photo</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Smart Prompt with Grok Pro */}
            <div className="space-y-4">
              <div 
                onClick={() => setIsGrokActive(!isGrokActive)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  isGrokActive 
                  ? 'bg-lime-500/5 border-lime-500/30 shadow-[0_0_30px_rgba(163,230,53,0.05)]' 
                  : 'bg-white/5 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-xl transition-all ${isGrokActive ? 'bg-lime-500 text-slate-950 scale-110 shadow-lg shadow-lime-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      <BrainCircuit className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="flex items-center gap-1.5">
                         <h3 className={`text-sm font-black ${isGrokActive ? 'text-lime-400' : 'text-slate-300'}`}>Grok Reasoning</h3>
                         <div className="text-[7px] bg-lime-500/20 text-lime-400 px-1 py-0.5 rounded font-black uppercase tracking-tighter">Active</div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">AI Prompt Enhancement</p>
                   </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isGrokActive ? 'bg-lime-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isGrokActive ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

              <textarea 
                placeholder="Deskripsikan transformasi gambar Anda secara detail..."
                className="w-full h-32 bg-slate-900/50 border border-white/5 rounded-[2rem] p-5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-700"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Config Output */}
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Resolution</label>
                  <div className="grid grid-cols-1 gap-2">
                     {RESOLUTIONS.map(res => (
                        <button
                          key={res.id}
                          onClick={() => setImageSize(res.id as any)}
                          className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${imageSize === res.id ? 'bg-violet-600 border-violet-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                        >
                          {res.label}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                     {RATIOS.slice(0, 4).map(r => (
                        <button
                          key={r.value}
                          onClick={() => setAspectRatio(r.value)}
                          className={`flex items-center justify-center py-2.5 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === r.value ? 'bg-violet-600 border-violet-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                        >
                          {r.value}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            {!isConnected && (
              <button 
                onClick={handleOpenKey}
                className="w-full mb-4 py-4 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex items-center justify-center gap-3 group transition-all hover:bg-amber-500/20"
              >
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                   <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pilih API Key</div>
                   <div className="text-[8px] text-amber-500/60 uppercase font-bold">Wajib untuk fitur Grok Pro</div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 ml-auto mr-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold rounded-2xl">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-[2rem] py-6 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-br from-violet-600 via-indigo-700 to-violet-800 hover:scale-[1.02] text-white shadow-[0_20px_50px_rgba(124,58,237,0.3)]'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-lime-400 mb-2" />
                  <span className="text-xs font-black uppercase tracking-widest animate-pulse text-white/90">{LOADING_MESSAGES[loadingStep]}</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-1">
                    <Zap className={`w-6 h-6 fill-white ${isGrokActive ? 'text-lime-400 fill-lime-400' : ''}`} />
                    <span className="font-black text-xl tracking-tighter uppercase">Render Pro Image</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                     <span className="text-[9px] font-black uppercase tracking-widest">
                       Engine: Gemini 3 Pro
                     </span>
                     <div className="w-1 h-1 rounded-full bg-white/40" />
                     <span className="text-[9px] font-black uppercase tracking-widest">{imageSize} Resolution</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Results View */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-[#070b15]/40 border-2 border-dashed border-white/5 rounded-[4rem] p-12 md:p-20 min-h-[80vh] items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-500/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-10 max-w-2xl">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-violet-500 blur-[100px] opacity-20" />
                    <div className="relative w-32 h-32 bg-slate-900 rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl mx-auto rotate-3">
                        <WandSparkles className="w-16 h-16 text-lime-500" />
                    </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                    Transformer Pro <br /> Intelligence
                  </h2>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    Unggah hingga 5 gambar referensi. Mesin Grok Pro akan menganalisis tiap piksel untuk menciptakan transformasi visual yang presisi dan berkualitas tinggi (hingga 4K).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-3">
                       <div className="w-10 h-10 bg-violet-500/20 rounded-2xl flex items-center justify-center">
                          <Layers className="w-5 h-5 text-violet-400" />
                       </div>
                       <h3 className="font-black text-sm uppercase text-violet-100">Multi-Ref Support</h3>
                       <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">
                          Gabungkan karakter, latar belakang, dan gaya dari 1-5 foto yang berbeda menjadi satu kesatuan.
                       </p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-3">
                       <div className="w-10 h-10 bg-lime-500/20 rounded-2xl flex items-center justify-center">
                          <Maximize className="w-5 h-5 text-lime-400" />
                       </div>
                       <h3 className="font-black text-sm uppercase text-lime-100">4K Ultra Output</h3>
                       <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">
                          Model Gemini 3 Pro mendukung resolusi tajam untuk kebutuhan cetak atau desain profesional.
                       </p>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-32">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className={`relative bg-slate-900/40 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl ${aspectRatio === '1:1' ? 'aspect-square max-w-2xl mx-auto' : 'aspect-video'}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                       <div className="absolute inset-0 bg-violet-500 blur-[80px] opacity-30 animate-pulse" />
                       <BrainCircuit className="w-24 h-24 text-violet-500/20 relative animate-spin-slow" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-violet-400 font-black text-2xl tracking-tighter uppercase italic">{LOADING_MESSAGES[loadingStep]}</p>
                      <div className="flex justify-center gap-2">
                         {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-[#070b15]/60 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 ${idx === 0 ? 'ring-2 ring-violet-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[3rem] overflow-hidden bg-black border border-white/5 shadow-inner">
                      <img 
                        src={url} 
                        alt={`Pro Variation ${vIdx + 1}`} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-6 left-6 pointer-events-none opacity-40">
                         <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Master Pro {imageSize}</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-violet-600 text-white p-4 rounded-full hover:bg-violet-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`grok-pro-${result.timestamp}-${vIdx}.png`}
                          className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-10 bg-gradient-to-b from-transparent to-black/40 border-t border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-lime-500 text-slate-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-lime-500/20">Pro Success</div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{imageSize} • {aspectRatio} Cinematic</span>
                      <div className="h-4 w-px bg-white/10 hidden md:block" />
                      <div className="flex items-center gap-2 text-[10px] text-violet-400 font-black uppercase tracking-widest">
                         <BrainCircuit className="w-3 h-3" /> Grok Logic applied
                      </div>
                    </div>
                    <p className="text-slate-300 text-base font-medium leading-relaxed italic line-clamp-3">"{result.prompt}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
