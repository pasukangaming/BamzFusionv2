import React, { useState, useEffect } from 'react';
import { 
  History, 
  Upload, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  Zap,
  Layout,
  Palette,
  Camera,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  Maximize2,
  Cpu,
  Crown,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, transformImagesPro } from '../services/geminiService';

const RESTORATION_MODES = [
  { id: 'Full Restoration', label: 'Restorasi Total', desc: 'Menghilangkan goresan, bintik, dan noise' },
  { id: 'Face Sharpening', label: 'Pertajam Wajah', desc: 'Fokus pada detail mata, kulit, dan bibir' },
  { id: 'Colorize', label: 'Pewarnaan', desc: 'Ubah foto hitam-putih menjadi berwarna' },
  { id: 'HD Upscale', label: 'HD Upscale', desc: 'Meningkatkan kejernihan dan resolusi total' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
];

const RESOLUTIONS = [
  { id: '1K', label: '1K Standard' },
  { id: '2K', label: '2K High-Def' },
  { id: '4K', label: '4K Ultra-HD' },
];

interface PhotoRestorationProps {
  onPreview: (url: string) => void;
}

export default function PhotoRestoration({ onPreview }: PhotoRestorationProps) {
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('standard');
  const [image, setImage] = useState<ImageFile | null>(null);
  const [mode, setMode] = useState('Full Restoration');
  const [colorize, setColorize] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
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
    if (engineMode === 'standard' && imageSize !== '1K') {
      setImageSize('1K');
    }
  }, [engineMode]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsConnected(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (image) URL.revokeObjectURL(image.preview);
      setImage({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      });
      setError(null);
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
  };

  const handleGenerate = async () => {
    if (engineMode === 'pro' && !isConnected) {
      handleOpenKey();
      return;
    }

    if (!image) {
      setError('Harap unggah foto lawas yang ingin diperbaiki.');
      return;
    }

    setLoading(true);
    setError(null);

    let restorePrompt = `PROFESSIONAL PHOTO RESTORATION AND ENHANCEMENT. `;
    restorePrompt += `Target Mode: ${mode}. `;
    
    if (mode === 'Full Restoration') {
      restorePrompt += "CRITICAL: Eliminate all blur, motion blur, lens blur, scratches, dust, film grain, and digital noise. Intelligently reconstruct missing pixels and sharp edges. ";
    } else if (mode === 'Face Sharpening') {
      restorePrompt += "AGGRESSIVE DEBLURRING: Focus primarily on making the person's facial features razor-sharp. Enhance eye clarity, iris detail, and skin texture. ";
    } else if (mode === 'HD Upscale') {
      restorePrompt += "ENHANCE CLARITY: Drastically improve resolution by adding plausible high-frequency details. Make everything look crisp and modern. ";
    }

    if (colorize) {
      restorePrompt += "COLORIZATION: Apply natural, historically accurate, and realistic skin tones, vibrant clothing colors, and accurate environmental hues. ";
    }

    restorePrompt += `Aesthetic: Professional studio portrait quality, cinematic lighting, realistic textures, ${engineMode === 'pro' ? imageSize : '8k'} resolution. `;
    restorePrompt += "STRICT IDENTITY LOCK: Maintain the EXACT biometric identity of the subject. DO NOT morph, change, or hallucinate a new face. The result must be 100% recognizable as the person in the source image.";

    try {
      let generatedUrls: string[];

      if (engineMode === 'pro') {
        generatedUrls = await transformImagesPro(
          [image.file],
          restorePrompt,
          aspectRatio,
          imageSize,
          true
        );
      } else {
        generatedUrls = await transformImages(
          [image.file],
          restorePrompt,
          aspectRatio,
          true
        );
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: restorePrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      if (engineMode === 'pro' && err.message?.includes("Requested entity was not found")) {
        setIsConnected(false);
        setError("Koneksi Pro terputus. Silakan hubungkan kembali API Key Anda.");
      } else {
        setError(err.message || 'Gagal memperbaiki foto.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 md:max-h-[85vh] md:overflow-y-auto custom-scrollbar">
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Pilih Mode Mesin</label>
             <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
                <button 
                  onClick={() => setEngineMode('standard')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'standard' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Cpu className="w-4 h-4" />
                  Standard
                </button>
                <button 
                  onClick={() => setEngineMode('pro')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'pro' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Crown className="w-4 h-4" />
                  Premium Pro
                </button>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-2xl shadow-lg ${engineMode === 'pro' ? 'bg-orange-600 shadow-orange-600/30' : 'bg-cyan-600 shadow-cyan-600/30'}`}>
                <History className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Photo Restorer</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Old to New Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Upload */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Lawas / Buram
              </label>
              {image ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                  <img src={image.preview} alt="Old Photo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onPreview(image.preview)} className="p-2 bg-indigo-500 text-white rounded-xl">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={removeImage} className="p-2 bg-red-500 text-white rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-slate-800/50 transition-all group">
                  <Upload className="w-7 h-7 text-slate-600 mb-2 group-hover:text-cyan-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Unggah Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Step 2: Modes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Mode Restorasi
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {RESTORATION_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      mode === m.id 
                      ? (engineMode === 'pro' ? 'bg-orange-500/10 border-orange-500' : 'bg-cyan-500/10 border-cyan-500') 
                      : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-black uppercase tracking-tight ${mode === m.id ? (engineMode === 'pro' ? 'text-orange-400' : 'text-cyan-400') : 'text-slate-300'}`}>{m.label}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{m.desc}</div>
                    </div>
                    {mode === m.id && <CheckCircle2 className={`w-4 h-4 ${engineMode === 'pro' ? 'text-orange-500' : 'text-cyan-500'}`} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Colorize Toggle */}
            <div className="space-y-3">
              <div 
                onClick={() => setColorize(!colorize)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  colorize ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className={`w-5 h-5 ${colorize ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">Pewarnaan (Colorize)</span>
                    <span className="text-[8px] text-slate-500 uppercase">Foto B&W menjadi Berwarna</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${colorize ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${colorize ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>

            {/* Step 4: Resolution & Ratio */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Resolusi & Rasio
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-slate-600 uppercase pl-1 tracking-widest">Resolusi</span>
                    <div className="grid grid-cols-1 gap-2">
                       {RESOLUTIONS.map(res => (
                         <button
                          key={res.id}
                          disabled={engineMode === 'standard' && res.id !== '1K'}
                          onClick={() => setImageSize(res.id as any)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${imageSize === res.id ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 disabled:opacity-20'}`}
                         >
                           {res.label}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-slate-600 uppercase pl-1 tracking-widest">Rasio</span>
                    <div className="grid grid-cols-2 gap-2">
                      {RATIOS.map(r => (
                        <button
                          key={r.value}
                          onClick={() => setAspectRatio(r.value)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${aspectRatio === r.value ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        >
                          {r.value}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {engineMode === 'pro' && !isConnected && (
              <button 
                onClick={handleOpenKey}
                className="w-full mb-4 py-4 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex items-center justify-center gap-3 group transition-all active:scale-95"
              >
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                   <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Wajib API Key Pro</div>
                   <div className="text-[8px] text-amber-500/60 uppercase font-bold">Pilih untuk Mode Pro</div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 ml-auto mr-4" />
              </button>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-2xl font-black uppercase tracking-wider flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] py-6 transition-all active:scale-95 shadow-2xl ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : (engineMode === 'pro' 
                   ? 'bg-gradient-to-r from-orange-600 to-cyan-600 text-white shadow-orange-900/20' 
                   : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20')
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Loader2 className={`w-8 h-8 animate-spin mb-1 ${engineMode === 'pro' ? 'text-orange-400' : 'text-white'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest animate-pulse">Merestorasi Foto...</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-0.5">
                    <Zap className="w-6 h-6 fill-white" />
                    <span className="font-black text-xl uppercase tracking-tighter">Restore Now</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Identity Match Enabled</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 min-h-[60vh] md:min-h-[75vh] items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <History className={`w-10 h-10 md:w-12 md:h-12 ${engineMode === 'pro' ? 'text-orange-500' : 'text-cyan-500'}`} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase leading-tight">Photo Restoration Studio</h2>
              <p className="text-slate-500 max-w-xl text-sm md:text-lg font-medium leading-relaxed">
                Kembalikan kejernihan kenangan lama Anda. AI kami akan memperbaiki tekstur, deblurring tingkat lanjut, dan rekonstruksi detail wajah yang telah memudar.
              </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full mt-12 text-left relative z-10">
                {[
                    { icon: Sparkles, title: "Aggressive Deblur", text: "Menghilangkan blur dan sensor pixelated secara cerdas menggunakan model pengenalan gambar terbaru." },
                    { icon: Camera, title: "Deteksi Wajah Pro", text: "AI akan menganalisis fitur wajah dan merekonstruksi detail yang hilang (mata, bibir, pori-pori) secara alami." },
                    { icon: Palette, title: "Pewarnaan Cerdas", text: "Hidupkan kembali foto hitam-putih dengan warna yang realistis berdasarkan deteksi materi kain dan kulit." },
                    { icon: CheckCircle2, title: "Output Ultra-HD", text: "Gunakan Mode Pro untuk mendapatkan resolusi hingga 4K, cocok untuk dicetak dalam ukuran besar." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-cyan-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${engineMode === 'pro' ? 'text-orange-400' : 'text-cyan-400'}`} />
                        </div>
                        <h3 className="font-black text-indigo-50 mb-2 md:mb-3 text-base md:text-lg uppercase tracking-tight">{step.title}</h3>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className={`relative bg-slate-900/40 border border-white/5 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square max-w-2xl mx-auto'}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10">
                    <div className="relative">
                       <div className={`absolute inset-0 blur-[80px] opacity-20 animate-pulse ${engineMode === 'pro' ? 'bg-orange-500' : 'bg-cyan-500'}`} />
                       <History className={`w-20 h-20 md:w-24 md:h-24 relative animate-spin-slow ${engineMode === 'pro' ? 'text-orange-500/30' : 'text-cyan-500/30'}`} />
                    </div>
                    <div className="text-center space-y-4">
                      <p className={`font-black text-xl md:text-2xl tracking-tighter uppercase italic animate-pulse ${engineMode === 'pro' ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {engineMode === 'pro' ? 'Rekonstruksi Master 4K...' : 'Memperbaiki Piksel Kenangan...'}
                      </p>
                      <div className="flex justify-center gap-2">
                         {[1,2,3,4].map(i => <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${engineMode === 'pro' ? 'bg-orange-500' : 'bg-cyan-500'}`} style={{animationDelay: `${i*0.2}s`}} />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 ${idx === 0 ? (engineMode === 'pro' ? 'ring-2 ring-orange-500/20 shadow-[0_20px_50px_rgba(249,115,22,0.1)]' : 'ring-2 ring-cyan-500/20 shadow-[0_20px_50px_rgba(6,182,212,0.1)]') : ''}`}
              >
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 shadow-inner">
                      <img 
                        src={url} 
                        alt={`Restored Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${engineMode === 'pro' ? 'text-orange-400' : 'text-cyan-400'}`} />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Similarity Verified</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className={`p-4 rounded-full text-white transition-all shadow-xl hover:scale-110 active:scale-95 ${engineMode === 'pro' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`restored-${engineMode}-${vIdx}.png`}
                          className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 md:p-10 bg-slate-900/95 border-t border-slate-800 flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`${engineMode === 'pro' ? 'bg-orange-500' : 'bg-cyan-500'} text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
                        {engineMode === 'pro' ? 'Premium Pro' : 'Standard'}
                      </div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{imageSize} • {mode} {colorize ? '& Colorized' : ''}</span>
                      <div className="h-4 w-px bg-slate-700 hidden sm:block" />
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${engineMode === 'pro' ? 'text-orange-400' : 'text-cyan-400'}`}>
                         <UserCheck className="w-4 h-4" /> Identity Consistent
                      </div>
                    </div>
                    <div className="p-4 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-slate-400 text-xs font-medium italic leading-relaxed line-clamp-2">"{result.prompt}"</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950/50 px-5 py-2.5 rounded-full border border-slate-800 shrink-0 uppercase tracking-widest">
                    {new Date(result.timestamp).toLocaleTimeString()}
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
