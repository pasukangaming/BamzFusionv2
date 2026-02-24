
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Scissors,
  Maximize,
  History,
  ShieldCheck,
  Cpu,
  Crown,
  Palette,
  Eraser,
  ArrowRight,
  ShieldAlert,
  Fingerprint,
  Info,
  PenTool,
  Settings2
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, transformImagesPro } from '../services/geminiService';

type EditorSubMode = 'bg-remover' | 'restoration' | 'expand';

const RESTORATION_MODES = [
  { id: 'Full Restoration', label: 'Restorasi Total', desc: 'Hapus goresan & noise' },
  { id: 'Face Sharpening', label: 'Pertajam Wajah', desc: 'Fokus detail biometrik' },
  { id: 'HD Upscale', label: 'HD Upscale', desc: 'Tingkatkan resolusi' },
];

const EXPAND_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '16:9 Cinema', value: '16:9' },
  { label: '9:16 Story', value: '9:16' },
  { label: '4:3 Klasik', value: '4:3' },
  { label: '1:1 Square', value: '1:1' },
];

interface PhotoEditorStudioProps {
  onPreview: (url: string) => void;
}

export default function PhotoEditorStudio({ onPreview }: PhotoEditorStudioProps) {
  const [activeMode, setActiveMode] = useState<EditorSubMode>('bg-remover');
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('standard');
  const [image, setImage] = useState<ImageFile | null>(null);
  
  // Restoration States
  const [restorationMode, setRestorationMode] = useState('Full Restoration');
  const [colorize, setColorize] = useState(false);
  
  // Expand States
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [customExpandPrompt, setCustomExpandPrompt] = useState('');
  
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

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsConnected(true);
    }
  };

  const handleGenerate = async () => {
    if (engineMode === 'pro' && !isConnected) {
      handleOpenKey();
      return;
    }

    if (!image) {
      setError('Harap unggah foto terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);

    let prompt = "";
    let finalRatio: AspectRatio = '1:1';

    if (activeMode === 'bg-remover') {
      prompt = "REMOVE BACKGROUND. Isolate the main subject from the original image. Place the subject on a PURE SOLID FLAT WHITE BACKGROUND. Sharp edges, professional isolation.";
      finalRatio = '1:1';
    } else if (activeMode === 'restoration') {
      prompt = `PHOTO RESTORATION: ${restorationMode}. Remove blur, scratches, and noise. `;
      if (colorize) prompt += "Apply natural and realistic colorization. ";
      prompt += "Maintain exact identity. Studio quality lighting.";
      finalRatio = '1:1';
    } else if (activeMode === 'expand') {
      prompt = `EXPAND PHOTO: Extend the background to fit a ${aspectRatio} ratio. `;
      if (customExpandPrompt) prompt += `Add/Continue background with: ${customExpandPrompt}. `;
      prompt += "Seamlessly blend with original style and textures.";
      finalRatio = aspectRatio;
    }

    try {
      let generatedUrls: string[];
      if (engineMode === 'pro') {
        generatedUrls = await transformImagesPro([image.file], prompt, finalRatio, '1K', true);
      } else {
        generatedUrls = await transformImages([image.file], prompt, finalRatio, true);
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses gambar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Sub-Mode Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-2xl overflow-x-auto no-scrollbar">
           <button 
            onClick={() => setActiveMode('bg-remover')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeMode === 'bg-remover' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Scissors className="w-4 h-4" /> Hapus Latar
           </button>
           <button 
            onClick={() => setActiveMode('restoration')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeMode === 'restoration' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <History className="w-4 h-4" /> Perbaiki Foto
           </button>
           <button 
            onClick={() => setActiveMode('expand')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeMode === 'expand' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Maximize className="w-4 h-4" /> Perluas Foto
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-5 space-y-6 px-4 md:px-0">
          <div className="bg-[#0a0f1d] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-8">
            
            {/* Step 1: Upload */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">1</span>
                Input Foto Utama
              </label>
              
              {image ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                  <img src={image.preview} alt="Input" className="w-full h-full object-cover" />
                  <button onClick={removeImage} className="absolute inset-0 m-auto w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group">
                  <ImageIcon className="w-8 h-8 text-slate-700 mb-2 group-hover:text-cyan-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Pilih Gambar</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Dynamic Controls based on Sub-Mode */}
            <div className="space-y-6">
              {activeMode === 'restoration' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Restoration Settings</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {RESTORATION_MODES.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setRestorationMode(m.id)}
                        className={`flex flex-col p-3 rounded-2xl border transition-all text-left ${restorationMode === m.id ? 'bg-indigo-600/10 border-indigo-500' : 'bg-slate-900 border-white/5'}`}
                      >
                         <span className={`text-[10px] font-bold ${restorationMode === m.id ? 'text-indigo-400' : 'text-slate-400'}`}>{m.label}</span>
                         <span className="text-[8px] text-slate-600 opacity-80">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div 
                    onClick={() => setColorize(!colorize)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${colorize ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-900 border-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-bold text-slate-200">Colorize (Pewarnaan)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${colorize ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${colorize ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                </div>
              )}

              {activeMode === 'expand' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Outpainting Config</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPAND_RATIOS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setAspectRatio(r.value)}
                        className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${aspectRatio === r.value ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Detail latar tambahan (E.g. Tambahkan pegunungan, gedung pencakar langit...)"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-[10px] text-slate-300 focus:ring-1 focus:ring-amber-500 h-20 placeholder:text-slate-700 resize-none"
                    value={customExpandPrompt}
                    onChange={(e) => setCustomExpandPrompt(e.target.value)}
                  />
                </div>
              )}

              {activeMode === 'bg-remover' && (
                <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 animate-in fade-in">
                  <p className="text-[9px] text-slate-500 leading-relaxed italic">AI akan memisahkan subjek dari latar belakang dan memberikan kanvas putih bersih secara otomatis.</p>
                </div>
              )}
            </div>

            {/* Quality Engine */}
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Engine Quality</label>
               <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setEngineMode('standard')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'standard' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Cpu className="w-3.5 h-3.5" /> Standard
                  </button>
                  <button 
                    onClick={() => setEngineMode('pro')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'pro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Crown className="w-3.5 h-3.5" /> Premium Pro
                  </button>
               </div>
            </div>

            <div className="pt-4">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-2xl">
                   ⚠️ {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`group relative w-full overflow-hidden rounded-2xl py-5 transition-all active:scale-95 ${
                  loading 
                  ? 'bg-slate-800 text-slate-500' 
                  : (activeMode === 'bg-remover' ? 'bg-cyan-600' : activeMode === 'restoration' ? 'bg-indigo-600' : 'bg-amber-600') + ' text-white shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest animate-pulse">Memproses Pixel...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="w-4 h-4 fill-white" />
                    <span className="font-black text-xs uppercase tracking-widest">Generate Edit</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7 space-y-8 px-4 md:px-0">
          {results.length === 0 && !loading ? (
            <div className="h-full min-h-[500px] bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
               
               <div className="flex flex-col items-center text-center mb-10 md:mb-16 relative z-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 blur-3xl opacity-10 bg-indigo-500 animate-pulse" />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                      {activeMode === 'bg-remover' ? <Eraser className="w-10 h-10 md:w-12 md:h-12 text-cyan-500" /> : activeMode === 'restoration' ? <History className="w-10 h-10 md:w-12 md:h-12 text-indigo-500" /> : <Maximize className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />}
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
                      {activeMode === 'bg-remover' ? 'Background Remover' : activeMode === 'restoration' ? 'Photo Restoration' : 'AI Outpainting'}
                  </h2>
                  <p className="text-slate-500 max-w-xl text-sm md:text-base font-medium leading-relaxed px-4">
                    Pilih mode di atas untuk memanipulasi gambar Anda secara cerdas dengan kualitas studio profesional.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10 text-left">
                  {[
                    { icon: Upload, title: "1. Unggah Foto", text: "Pilih foto asli yang ingin Anda edit (Hapus latar, restorasi buram, atau perluas bingkai)." },
                    { icon: PenTool, title: "2. Pilih Mode", text: "Gunakan tab di atas untuk berganti fungsi editor sesuai kebutuhan manipulasi visual Anda." },
                    { icon: Settings2, title: "3. Atur Detail", text: "Sesuaikan resolusi, rasio, atau instruksi tambahan agar AI merender hasil yang paling presisi." },
                    { icon: CheckCircle2, title: "4. Hasil Pro 8K", text: "Dapatkan hasil render bersih beresolusi tinggi yang siap digunakan untuk profil atau portofolio." }
                  ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${activeMode === 'bg-remover' ? 'bg-cyan-500/10 text-cyan-400' : activeMode === 'restoration' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base uppercase tracking-tight">{step.title}</h3>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  ))}
               </div>

               <div className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Studio Rendering Active</span>
               </div>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="space-y-5 animate-pulse">
                       <div className="aspect-square bg-white/5 rounded-[2.5rem] border border-white/5" />
                       <div className="h-3 bg-white/5 rounded-full w-2/3 mx-auto" />
                    </div>
                  ))}
                </div>
              )}

              {results.map((result, rIdx) => (
                <div key={result.timestamp} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Sparkles className="w-5 h-5 text-indigo-400" />
                       <h3 className="text-lg font-black uppercase text-white tracking-widest">Result Variation</h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.imageUrls.map((url, i) => (
                      <div key={i} className="group flex flex-col gap-4">
                        <div className="relative aspect-square bg-slate-950 rounded-[3rem] overflow-hidden border border-white/[0.05] shadow-2xl transition-all duration-500 hover:border-indigo-500/40">
                          <img 
                            src={url} 
                            alt="Result" 
                            className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            <button 
                              onClick={() => onPreview(url)}
                              className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                              <ImageIcon className="w-6 h-6" />
                            </button>
                            <a 
                              href={url} 
                              download={`edit-ai-${activeMode}-${rIdx}-${i}.png`}
                              className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                              <Download className="w-6 h-6" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
