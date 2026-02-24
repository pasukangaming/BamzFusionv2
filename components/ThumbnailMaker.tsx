import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  Zap,
  Youtube,
  Upload,
  Trash2,
  CheckCircle2,
  Move,
  TypeIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  UserCheck,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Layout,
  MousePointer2,
  Plus,
  X,
  Maximize2,
  Target,
  Flame,
  Fingerprint,
  ArrowRightLeft,
  Crown,
  Cpu,
  Smile,
  ShieldCheck,
  MonitorCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AspectRatio, GenerationResult, ImageFile, UserRole } from '../types';
import { transformImages, transformImagesPro, generateImagesFromText } from '../services/geminiService';

const THUMBNAIL_STYLES = [
  { id: 'Clickbait', label: 'Ekstrim / Viral', desc: 'Kontras tinggi, ekspresif, warna berani' },
  { id: 'Educational', label: 'Edukasi / Tutorial', desc: 'Clean, teratur, informatif' },
  { id: 'Vlog', label: 'Vlog / Lifestyle', desc: 'Estetik, natural, sinematik' },
  { id: 'Gaming', label: 'Gaming / Esports', desc: 'Neon, penuh aksi, energi tinggi' },
  { id: 'Tech', label: 'Review Teknologi', desc: 'Sleek, fokus produk, profesional' },
];

const EXPRESSIONS = [
  { id: 'Extreme Shocked', label: 'Kaget', icon: Sparkles },
  { id: 'Confident/Happy', label: 'Senang', icon: Smile },
  { id: 'Angry/Aggressive', label: 'Marah', icon: Flame },
  { id: 'Mysterious/Intriguing', label: 'Misterius', icon: Target },
];

const COLOR_THEMES = [
  { id: 'Red Alert', label: 'Red Alert', color: 'bg-red-600' },
  { id: 'Neon Cyber', label: 'Neon Cyber', color: 'bg-indigo-600' },
  { id: 'Golden Hour', label: 'Golden Hour', color: 'bg-amber-500' },
  { id: 'Toxic Green', label: 'Toxic Green', color: 'bg-emerald-500' },
];

const VIBE_TAGS = [
  { id: 'Glow Aura', label: 'Glow Aura', icon: Flame },
  { id: 'Big Red Arrow', label: 'Big Arrow', icon: MousePointer2 },
  { id: 'VS Battle', label: 'VS Mode', icon: ArrowRightLeft },
  { id: 'Extreme Zoom', label: 'Extreme Zoom', icon: Target },
];

const FONT_GALLERY = [
  { id: "AI_OPTIMIZED", label: "AI Magic", style: "font-black tracking-widest text-indigo-400", isMagic: true },
  { id: "Impact Heavy", label: "Impact", style: "font-black uppercase tracking-tighter" },
  { id: "Gaming Bold", label: "Gaming", style: "font-black border-b-2 border-red-500" },
  { id: "Minimalist", label: "Minimalis", style: "font-light tracking-[0.3em]" },
];

interface ThumbnailMakerProps {
  onPreview: (url: string) => void;
  userRole?: UserRole;
}

export default function ThumbnailMaker({ onPreview, userRole }: ThumbnailMakerProps) {
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('standard');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [style, setStyle] = useState('Clickbait');
  const [expression, setExpression] = useState('Extreme Shocked');
  const [colorTheme, setColorTheme] = useState('Red Alert');
  const [selectedFont, setSelectedFont] = useState(FONT_GALLERY[0].id);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Glow Aura']);
  const [keepFace, setKeepFace] = useState(true);
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

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsConnected(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 foto referensi.');
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

  const toggleVibe = (id: string) => {
    setSelectedVibes(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (engineMode === 'pro' && !isConnected) {
      handleOpenKey();
      return;
    }

    if (!title.trim()) {
      setError('Harap masukkan judul video.');
      return;
    }

    setLoading(true);
    setError(null);

    let thumbnailPrompt = `ULTRA-HIGH CLICK-THROUGH-RATE (CTR) YOUTUBE THUMBNAIL DESIGN. `;
    thumbnailPrompt += `Primary Headline: "${title}". `;
    if (subtitle) thumbnailPrompt += `Supporting Subtitle: "${subtitle}". `;
    
    thumbnailPrompt += `Theme Style: ${style}. `;
    thumbnailPrompt += `Visual Emotion: The subjects must show an ${expression} facial expression. `;
    thumbnailPrompt += `Color Palette: Focused on high-contrast ${colorTheme}. `;
    
    if (selectedVibes.length > 0) {
      thumbnailPrompt += `Key Elements: ${selectedVibes.join(', ')}. `;
    }

    thumbnailPrompt += `Typography: Use ${selectedFont} style. Text must be GIANT, 3D, glowing, and positioned with high-impact professional graphic design layout. `;
    
    thumbnailPrompt += `
      ARTISTIC PROTOCOL:
      1. COMPOSITION: Use Rule of Thirds or Split Screen for dramatic effect. 
      2. FIDELITY: If people are provided in images, maintain 100% exact facial identity and structural features. Only enhance their expressions to be more dramatic.
      3. TEXTURES: Professional commercial grade textures, 8k sharpness, realistic lighting, and heavy drop shadows on text for maximum depth.
      4. CLICKBAIT LEVEL: Maximize curiosity and visual impact.
    `;

    try {
      let generatedUrls: string[];
      const files = images.map(img => img.file);

      if (files.length > 0) {
        if (engineMode === 'pro') {
          generatedUrls = await transformImagesPro(files, thumbnailPrompt, '16:9', '1K', keepFace);
        } else {
          generatedUrls = await transformImages(files, thumbnailPrompt, '16:9', keepFace);
        }
      } else {
        generatedUrls = await generateImagesFromText(thumbnailPrompt, '16:9');
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: thumbnailPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal meracik thumbnail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Input Config */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-white/10 p-6 md:p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2.5 rounded-2xl shadow-lg shadow-red-900/20">
                   <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tight">Thumbnail Elite</h2>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Viral Optimization Active</p>
                </div>
             </div>
             <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                <button onClick={() => setEngineMode('standard')} className={`p-2 rounded-lg transition-all ${engineMode === 'standard' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500'}`} title="Standard Mode">
                  <Cpu className="w-4 h-4" />
                </button>
                <button onClick={() => setEngineMode('pro')} className={`p-2 rounded-lg transition-all ${engineMode === 'pro' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500'}`} title="Elite Pro Mode">
                  <Crown className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Multiple Photo Inputs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">1</span>
                  Input Aset (1-5 Foto)
                </label>
                <span className="text-[10px] font-black text-red-500">{images.length}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5 bg-slate-800">
                    <img src={img.preview} alt="Ref" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute inset-0 m-auto w-8 h-8 bg-red-600 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-500/5 transition-all group">
                    <Plus className="w-6 h-6 text-slate-700 group-hover:text-red-500" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Content & Expressions */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">2</span>
                Teks & Ekspresi
              </label>
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Judul Bombastis (E.g. JANGAN DITONTON!)"
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-slate-700"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                   {EXPRESSIONS.map(exp => (
                     <button
                        key={exp.id}
                        onClick={() => setExpression(exp.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-[10px] font-bold transition-all ${expression === exp.id ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                     >
                        <exp.icon className="w-3.5 h-3.5" /> {exp.label}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            {/* Step 3: Vibes & Style */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">3</span>
                Gaya & Vibe
              </label>
              <div className="flex flex-wrap gap-2">
                {VIBE_TAGS.map(v => (
                  <button
                    key={v.id}
                    onClick={() => toggleVibe(v.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                      selectedVibes.includes(v.id) 
                      ? 'bg-red-600 border-red-400 text-white shadow-lg' 
                      : 'bg-slate-800/50 border-white/5 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <v.icon className="w-3 h-3" />
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${colorTheme === theme.id ? 'bg-white/10 border-white/20' : 'border-transparent'}`}
                  >
                    <div className={`w-full aspect-square rounded-lg ${theme.color} ${colorTheme === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`} />
                    <span className="text-[7px] font-black uppercase text-slate-500">{theme.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Font Selection */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">4</span>
                Pilihan Tipografi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_GALLERY.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`p-3 rounded-xl border transition-all text-center ${selectedFont === f.id ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    <span className={`text-[10px] font-bold ${f.style}`}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Identity Shield */}
            <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-red-500/10 border-red-500/40 shadow-lg' : 'bg-slate-950 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${keepFace ? 'bg-red-600' : 'bg-slate-800'}`}>
                    <Fingerprint className={`w-4 h-4 ${keepFace ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-200 block">Strict Identity Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase font-medium">Keep Face Similarity</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${keepFace ? 'bg-red-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
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
                     <div className="text-[10px] font-black text-amber-500 uppercase">Wajib API Key Pro</div>
                     <div className="text-[8px] text-amber-500/60 uppercase font-bold">Butuh Model Pro untuk 4K</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500 ml-auto mr-4" />
                </button>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-2xl flex items-start gap-2">
                   <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                   <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`group relative w-full overflow-hidden rounded-[2rem] py-5 transition-all active:scale-95 ${
                  loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : (engineMode === 'pro' ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-red-600 hover:bg-red-500') + ' text-white shadow-xl shadow-red-900/30'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Merender Viralitas...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 fill-white" />
                      <span className="font-black text-xs uppercase tracking-[0.2em]">Generate 4 Variasi</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mt-1">Using {engineMode === 'pro' ? 'Gemini 3 Pro Image' : 'Gemini 2.5 Flash'}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Results View */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="h-full min-h-[500px] bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
             <div className="relative mb-10">
                <div className="absolute inset-0 bg-red-500 blur-[100px] opacity-10 animate-pulse" />
                <div className="relative w-28 h-28 bg-slate-900 rounded-[3rem] flex items-center justify-center border border-white/10 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                  <Youtube className="w-14 h-14 text-red-500" />
                </div>
             </div>
             <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">AI Thumbnail Forge</h2>
             <p className="text-slate-500 max-w-lg text-lg font-medium leading-relaxed px-4">
               Gunakan <b>Engine Pro</b> untuk hasil 4K tajam. Padukan teks raksasa dengan ekspresi wajah dramatis untuk mendongkrak CTR video Anda secara instan.
             </p>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl">
                {[
                  { label: '4K Engine Pro', icon: Crown },
                  { label: 'Facial Emotion', icon: Smile },
                  { label: 'Identity Shield', icon: Fingerprint },
                  { label: 'Auto High-CTR', icon: Target }
                ].map((f, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
                    <f.icon className="w-5 h-5 text-red-500 mx-auto" />
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{f.label}</div>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-12 pb-32">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="space-y-4 animate-pulse">
                     <div className="aspect-video bg-white/5 rounded-[2.5rem] border border-white/5" />
                     <div className="h-2 bg-white/5 rounded-full w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            )}

            {results.map((result, rIdx) => (
              <div key={result.timestamp} className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Sparkles className="w-5 h-5 text-red-400" />
                       <h3 className="text-xl font-black uppercase text-white tracking-tighter italic">Viral Concept Results</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">{engineMode} Quality</div>
                       <span className="text-[10px] font-black text-slate-500 uppercase bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        {new Date(result.timestamp).toLocaleTimeString()}
                       </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {result.imageUrls.map((url, i) => (
                    <div key={i} className="group flex flex-col gap-5">
                      <div className="relative aspect-video bg-slate-950 rounded-[3rem] overflow-hidden border border-white/[0.05] shadow-2xl transition-all duration-500 hover:border-red-500/40">
                        <img 
                          src={url} 
                          alt="Thumbnail Result" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        
                        <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                              <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[9px] font-black text-white uppercase tracking-widest">Master Render OK</span>
                           </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                          <button 
                            onClick={() => onPreview(url)}
                            className="p-5 bg-red-600 text-white rounded-3xl hover:bg-red-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                          >
                            <Maximize2 className="w-6 h-6" />
                          </button>
                          <a 
                            href={url} 
                            download={`viral-thumbnail-${rIdx}-${i}.png`}
                            className="p-5 bg-white text-slate-900 rounded-3xl hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                          >
                            <Download className="w-6 h-6" />
                          </a>
                        </div>
                      </div>
                      <div className="text-center px-4">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Concept Variation {i + 1}</div>
                        <div className="flex items-center justify-center gap-2">
                           <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Ready for Viral Distribution</span>
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
  );
}