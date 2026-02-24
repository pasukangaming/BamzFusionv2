
import React, { useState, useEffect } from 'react';
import { 
  Video, 
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
  CheckCircle2
} from 'lucide-react';
import { ImageFile, VideoResult } from '../types';
import { generateVideo, enhancePromptGrok } from '../services/geminiService';

const LOADING_MESSAGES = [
  "Inisialisasi Grok Engine...",
  "Menganalisis aset visual (1-5 foto)...",
  "Grok AI sedang 'berpikir' (Thinking Mode)...",
  "Merancang komposisi sinematik...",
  "Merender video Pro Engine...",
  "Mengoptimalkan frame rate...",
  "Menyelesaikan paket download..."
];

const SERVER_ENGINES = [
  { 
    id: 'veo-3.1-generate-preview', 
    name: 'Server 1: Veo 3.1 Pro', 
    desc: 'Kualitas tertinggi, 1080p, Multi-Ref.',
    tier: 'Premium / Paid',
    color: 'border-indigo-500 text-indigo-400'
  },
  { 
    id: 'veo-3.1-fast-generate-preview', 
    name: 'Server 2: Veo 3.1 Fast', 
    desc: 'Cepat, 720p, Hemat Token.',
    tier: 'Standard / Dev',
    color: 'border-emerald-500 text-emerald-400'
  }
];

export default function VideoStudio() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedServer, setSelectedServer] = useState(SERVER_ENGINES[1].id);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<VideoResult[]>([]);
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
      }, 6000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Add explicit type casting to File[] to avoid 'unknown' type inference issues
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar referensi.');
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

    if (!prompt.trim() && images.length === 0) {
      setError('Masukkan ide cerita atau unggah foto.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalPrompt = prompt || "A cinematic journey of light and color";
      
      if (isGrokActive) {
        finalPrompt = await enhancePromptGrok(finalPrompt, images.map(img => img.file));
      }

      const videoUrl = await generateVideo(
        finalPrompt,
        images.map(img => img.file),
        resolution,
        aspectRatio,
        selectedServer
      );

      setResults(prev => [{
        videoUrl,
        prompt: prompt || 'Cinematic Fusion',
        timestamp: Date.now(),
        resolution
      }, ...prev]);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("PERMISSION_DENIED")) {
        setError("Tier Server tidak mendukung akun Anda. Silakan pilih 'Server 2: Veo Fast' atau periksa billing Google Cloud Anda.");
      } else {
        setError(err.message || 'Grok Engine mengalami kendala teknis.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-[#070b15]/80 backdrop-blur-2xl rounded-[3rem] border border-white/[0.05] p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 overflow-hidden">
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-[10px] font-black uppercase text-slate-400">Google Cloud {isConnected ? 'Online' : 'Required'}</span>
             </div>
             <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
                <Chrome className="w-3 h-3 text-indigo-400" />
                <span className="text-[8px] font-black text-indigo-400 uppercase">Auto-Auth</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-3 rounded-2xl rotate-3">
                <Video className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-2xl font-black tracking-tighter">Video Studio</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multi-Server Access</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Server Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Server className="w-3.5 h-3.5" /> Pilih Server Engine
              </label>
              <div className="grid grid-cols-1 gap-2">
                 {SERVER_ENGINES.map(srv => (
                   <button
                    key={srv.id}
                    onClick={() => setSelectedServer(srv.id)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedServer === srv.id ? 'bg-white/5 border-white/20 shadow-xl' : 'bg-transparent border-white/5 opacity-50 hover:opacity-80'}`}
                   >
                     <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedServer === srv.id ? 'border-indigo-500' : 'border-slate-700'}`}>
                        {selectedServer === srv.id && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                           <span className={`text-xs font-black uppercase tracking-tight ${selectedServer === srv.id ? 'text-white' : 'text-slate-400'}`}>{srv.name}</span>
                           <span className="text-[7px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-black">{srv.tier}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{srv.desc}</p>
                     </div>
                   </button>
                 ))}
              </div>
            </div>

            {/* Visual Assets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Referensi Visual (1-5)</label>
                <span className="text-[9px] font-bold text-indigo-400">{images.length}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5 bg-slate-900/50">
                    <img src={img.preview} alt="Ref" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(img.id)} className="absolute inset-0 m-auto w-8 h-8 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                       <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                    <Upload className="w-6 h-6 text-slate-600 mb-1 group-hover:text-indigo-400" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Grok Thinking Engine */}
            <div className="space-y-4">
              <div 
                onClick={() => setIsGrokActive(!isGrokActive)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  isGrokActive ? 'bg-lime-500/5 border-lime-500/30' : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-xl ${isGrokActive ? 'bg-lime-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      <BrainCircuit className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className={`text-sm font-black ${isGrokActive ? 'text-lime-400' : 'text-slate-300'}`}>Grok AI Optimizer</h3>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Prompt Thinking Mode</p>
                   </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isGrokActive ? 'bg-lime-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isGrokActive ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

              <textarea 
                placeholder="Ceritakan kejadian dalam video ini..."
                className="w-full h-32 bg-slate-900/50 border border-white/5 rounded-[2rem] p-5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Config Output */}
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-600 pl-1">Resolution</label>
                  <div className="grid grid-cols-1 gap-2">
                     {['720p', '1080p'].map(res => (
                        <button
                          key={res}
                          disabled={res === '1080p' && selectedServer !== SERVER_ENGINES[0].id}
                          onClick={() => setResolution(res as any)}
                          className={`py-2.5 rounded-xl text-[10px] font-black border transition-all ${resolution === res ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-500 disabled:opacity-20'}`}
                        >
                          {res === '1080p' ? 'Full HD (Pro)' : 'Standard HD'}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-600 pl-1">Aspect Ratio</label>
                  <div className="grid grid-cols-1 gap-2">
                     {[
                        { val: '16:9', icon: Monitor },
                        { val: '9:16', icon: Phone }
                     ].map(r => (
                        <button
                          key={r.val}
                          onClick={() => setAspectRatio(r.val as any)}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === r.val ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                        >
                          <r.icon className="w-3 h-3" /> {r.val}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-6">
            {!isConnected && (
              <button 
                onClick={handleOpenKey}
                className="w-full mb-4 py-4 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex items-center justify-center gap-3 group transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                   <div className="text-[10px] font-black text-amber-500 uppercase">Koneksi Google AI</div>
                   <div className="text-[8px] text-amber-500/60 font-bold uppercase tracking-tighter italic">Required for Video Render</div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 ml-auto mr-4" />
              </button>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold rounded-2xl flex gap-3 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-[2rem] py-6 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-br from-indigo-600 to-violet-700 hover:scale-[1.02] text-white shadow-2xl'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-lime-400 mb-2" />
                  <span className="text-xs font-black uppercase tracking-widest animate-pulse">{LOADING_MESSAGES[loadingStep]}</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-1">
                    <Zap className={`w-6 h-6 fill-white ${isGrokActive ? 'text-lime-400 fill-lime-400' : ''}`} />
                    <span className="font-black text-xl tracking-tighter uppercase">Render Video</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Using {SERVER_ENGINES.find(s => s.id === selectedServer)?.name.split(':')[1]}</span>
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
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-10 max-w-2xl">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20" />
                    <div className="relative w-32 h-32 bg-slate-900 rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl mx-auto rotate-3">
                        <BrainCircuit className="w-16 h-16 text-lime-500" />
                    </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                    Grok Multi-Server <br /> Video Studio
                  </h2>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    Kami menyediakan dua server utama: <b>Server 1 (Pro)</b> untuk kualitas Hollywood, dan <b>Server 2 (Fast)</b> untuk render cepat yang mendukung akun developer standar.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-3">
                       <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                          <Layers className="w-5 h-5 text-indigo-400" />
                       </div>
                       <h3 className="font-black text-sm uppercase text-indigo-100">Server 1 (Tier Paid)</h3>
                       <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">
                          Kualitas Pro, resolusi 1080p, dan pemrosesan multi-gambar referensi yang mendalam.
                       </p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-3">
                       <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-emerald-400" />
                       </div>
                       <h3 className="font-black text-sm uppercase text-emerald-100">Server 2 (Free/Fast)</h3>
                       <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase">
                          Render kilat 720p, kompatibel dengan hampir semua API Key standar Google AI Studio.
                       </p>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-32">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className={`relative bg-slate-900/40 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-w-md mx-auto'}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <Clapperboard className="w-24 h-24 text-indigo-500/20 animate-pulse" />
                    <div className="text-center space-y-2">
                      <p className="text-indigo-400 font-black text-2xl tracking-tighter uppercase italic">{LOADING_MESSAGES[loadingStep]}</p>
                      <div className="flex justify-center gap-2 mt-4">
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
                className={`bg-[#070b15]/60 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 ${idx === 0 ? 'ring-2 ring-indigo-500/20' : ''}`}
              >
                <div className="p-6">
                  <div className={`relative rounded-[3rem] overflow-hidden bg-black shadow-inner group ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-w-md mx-auto'}`}>
                    <video src={result.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                    <div className="absolute top-6 left-6 pointer-events-none">
                       <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Master Render Complete</span>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-10 bg-gradient-to-b from-transparent to-black/40 border-t border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-lime-500 text-slate-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Grok Result</div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{result.resolution} • {aspectRatio} Cinematic</span>
                    </div>
                    <p className="text-slate-300 text-base font-medium leading-relaxed italic line-clamp-2">"{result.prompt}"</p>
                  </div>
                  
                  <a 
                    href={result.videoUrl} 
                    download={`grok-video-${result.timestamp}.mp4`} 
                    className="flex items-center gap-4 bg-white hover:bg-slate-100 text-slate-950 px-10 py-5 rounded-[2rem] text-sm font-black transition-all shadow-2xl hover:scale-105 active:scale-95 group shrink-0"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" /> 
                    SAVE MP4
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
