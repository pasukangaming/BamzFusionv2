
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon,
  RefreshCw,
  Layout,
  Download,
  Eye, 
  UserCheck,
  Zap,
  CheckCircle2,
  Maximize,
  Crown,
  Cpu,
  Plus,
  X,
  Users,
  UserPlus,
  UserRound,
  UserRoundCheck,
  Heart,
  MessageCircle,
  Fingerprint,
  ArrowRight,
  PenTool,
  Settings2,
  MousePointerClick,
  Info,
  Maximize2
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, transformImagesPro } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '3:4 Potret', value: '3:4' },
  { label: '4:3 Lanskap', value: '4:3' },
  { label: '9:16 Cerita', value: '9:16' },
  { label: '16:9 Sinema', value: '16:9' },
];

const LOADING_MESSAGES = [
  "Inisialisasi Studio Pintar...",
  "Menganalisis Biometrik Wajah...",
  "Menyelaraskan Pencahayaan Sinematik...",
  "Merender Detail Tekstur Pro...",
  "Menyusun Komposisi Background...",
  "Finalisasi Visual Intelligence...",
  "Menyiapkan Paket Download..."
];

interface ImageTransformerProps {
  onPreview: (url: string) => void;
}

export default function ImageTransformer({ onPreview }: ImageTransformerProps) {
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('standard');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  
  // New Feature: Companion Mode
  const [companionMode, setCompanionMode] = useState(false);
  const [companionGender, setCompanionGender] = useState<'male' | 'female'>('female');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cycling loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError('Harap unggah setidaknya satu gambar utama.');
      return;
    }
    if (!prompt.trim() && !companionMode) {
      setError('Harap masukkan instruksi perubahan.');
      return;
    }

    setLoading(true);
    setError(null);

    // Prompt Engineering for Companion Mode
    let finalPrompt = prompt;
    if (companionMode) {
      const friendDesc = companionGender === 'male' ? 'a handsome male friend' : 'a beautiful female friend';
      const interaction = images.length > 1 
        ? `The people from the source images are now together in the scene. `
        : `Add ${friendDesc} standing next to the primary subject from the source image. `;
      
      finalPrompt = `[COMPANION FUSION MODE] ${interaction} They are interacting naturally, laughing or posing together. ${prompt}. High-quality professional photography, consistent lighting, 8k resolution.`;
    }

    try {
      let generatedUrls: string[];
      if (engineMode === 'pro') {
        generatedUrls = await transformImagesPro(images.map(img => img.file), finalPrompt, aspectRatio, '1K', true);
      } else {
        generatedUrls = await transformImages(images.map(img => img.file), finalPrompt, aspectRatio, true);
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: finalPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses gambar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 p-5 md:p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Engine Quality</label>
             <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setEngineMode('standard')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'standard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Cpu className="w-3.5 h-3.5" /> Standard
                </button>
                <button 
                  onClick={() => setEngineMode('pro')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'pro' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Crown className="w-3.5 h-3.5" /> Elite Pro
                </button>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Multiple Uploads */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                  Input Gambar (1-5)
                </label>
                <span className="text-[9px] font-black text-indigo-400">{images.length}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5 bg-slate-900">
                    <img src={img.preview} alt="Input" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                    <Plus className="w-6 h-6 text-slate-700 mb-1 group-hover:text-indigo-400" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Companion Mode */}
            <div className="space-y-4">
               <div 
                  onClick={() => setCompanionMode(!companionMode)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    companionMode ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' : 'bg-slate-800/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all ${companionMode ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-200 block">Mode Bareng Teman</span>
                      <span className="text-[8px] text-slate-500 uppercase font-medium">Add Companion AI</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${companionMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${companionMode ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
              </div>

              {companionMode && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                   <label className="text-[9px] font-black uppercase text-slate-600 ml-1 tracking-widest">Pilih Gender Teman</label>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setCompanionGender('male')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${companionGender === 'male' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800/50 border-white/5 text-slate-500'}`}
                      >
                        <UserRound className="w-3.5 h-3.5" /> Cowok
                      </button>
                      <button 
                        onClick={() => setCompanionGender('female')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${companionGender === 'female' ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-800/50 border-white/5 text-slate-500'}`}
                      >
                        <UserRoundCheck className="w-3.5 h-3.5" /> Cewek
                      </button>
                   </div>
                </div>
              )}
            </div>

            {/* Step 3: Prompt */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Instruksi Edit
              </label>
              <textarea 
                placeholder="Deskripsikan perubahan (E.g. Ganti latar belakang jadi kafe estetik, pakai baju senada...)"
                className="w-full h-28 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Step 4: Ratio */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Pilih Rasio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex items-center justify-center py-2.5 rounded-xl text-[9px] font-black uppercase border transition-all ${aspectRatio === r.value ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-white/5 text-slate-500 hover:border-white/10'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl leading-relaxed">
                ⚠️ {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-2xl py-4 transition-all active:scale-95 ${loading ? 'bg-slate-800 cursor-not-allowed text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest animate-pulse">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 fill-white" />
                  <span className="font-bold text-xs uppercase tracking-widest">Hasilkan Gambar</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Results Main View */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl md:rounded-[3.5rem] p-8 md:p-12 min-h-[400px] md:min-h-[75vh] items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
             
             <div className="flex flex-col items-center text-center mb-12 md:mb-16 relative z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                  <ImageIcon className="w-10 h-10 md:w-12 md:h-12 text-indigo-500" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-3 uppercase tracking-tighter italic">Image to Image Studio</h2>
                <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed px-4">
                   Ubah 1-5 foto referensi Anda menjadi karya visual baru yang menakjubkan dengan instruksi prompt AI.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                  { icon: Upload, title: "1. Unggah Foto", text: "Masukkan 1-5 foto referensi. AI akan menganalisis wajah dan struktur dari semua foto yang diunggah." },
                  { icon: PenTool, title: "2. Tulis Instruksi", text: "Jelaskan perubahan yang Anda inginkan (misal: ganti baju, ganti lokasi, atau tambahkan kacamata)." },
                  { icon: UserPlus, title: "3. Companion Mode", text: "Aktifkan mode ini untuk menambahkan teman baru (AI) di samping Anda dalam satu bingkai foto." },
                  { icon: Settings2, title: "4. Kualitas Pro", text: "Gunakan Elite Pro untuk hasil 4K yang lebih tajam dan biometrik wajah yang 100% akurat." }
                ].map((step, i) => (
                  <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group backdrop-blur-sm shadow-xl">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <step.icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base uppercase tracking-tight">{step.title}</h3>
                    <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                  </div>
                ))}
             </div>

             <div className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 animate-pulse">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity Lock: Menjaga Wajah Tetap Mirip Aslinya</span>
             </div>
          </div>
        ) : (
          <div className="space-y-12 pb-24 px-1">
            {loading && (
              <div className="min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/20 rounded-[3rem] border border-white/5 animate-in fade-in duration-700">
                 <div className="absolute inset-0 bg-indigo-500/5" />
                 <div className="relative mb-12">
                    <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 animate-pulse" />
                    <div className="relative w-32 h-32 flex items-center justify-center">
                       <RefreshCw className="w-20 h-20 text-indigo-500/20 animate-spin-slow absolute" />
                       <ImageIcon className="w-12 h-12 text-indigo-500 animate-pulse" />
                    </div>
                 </div>
                 <div className="text-center space-y-4 relative z-10 px-6">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic animate-pulse">
                      {LOADING_MESSAGES[loadingStep]}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
                       ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] pt-4">Mempersembahkan Mahakarya Visual...</p>
                 </div>
              </div>
            )}
            
            {!loading && results.map((result, idx) => (
              <div key={result.timestamp} className={`bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-indigo-500/20' : ''}`}>
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black border border-white/5 aspect-square">
                      <img src={url} alt="Result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 pointer-events-none">
                         <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Studio Master Render</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 transition-all hover:scale-110 active:scale-95 shadow-xl"
                        >
                          <Maximize2 className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`fusion-studio-${vIdx + 1}.png`}
                          className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all hover:scale-110 active:scale-95 shadow-xl"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 md:p-8 bg-slate-900/95 border-t border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Fusion Intelligence Applied</span>
                       {companionMode && (
                         <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${companionGender === 'male' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                           Companion: {companionGender}
                         </div>
                       )}
                    </div>
                    <p className="text-[11px] text-slate-400 italic line-clamp-2 leading-relaxed px-1">"{result.prompt}"</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                     <div className="text-[9px] text-slate-600 font-bold bg-slate-950 px-4 py-2 rounded-full border border-white/5 uppercase tracking-widest">
                       {new Date(result.timestamp).toLocaleTimeString()}
                     </div>
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
