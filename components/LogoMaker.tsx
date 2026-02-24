import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  Zap,
  PenTool,
  Palette,
  Type,
  Layout,
  Info,
  CheckCircle2,
  Layers,
  Monitor,
  Briefcase,
  Cpu,
  Feather,
  Box,
  MonitorCheck,
  Shapes,
  TypeIcon,
  Wand2
} from 'lucide-react';
import { GenerationResult, AspectRatio, UserRole } from '../types';
import { generateImagesFromText, suggestLogoDescription } from '../services/geminiService';

const LOGO_STYLES = [
  { id: 'Minimalist', label: 'Minimalis', icon: Feather },
  { id: 'Modern', label: 'Modern', icon: Monitor },
  { id: 'Luxury', label: 'Mewah', icon: Sparkles },
  { id: 'Tech', label: 'Teknologi', icon: Cpu },
  { id: 'Vintage', label: 'Vintage', icon: Briefcase },
  { id: 'Geometric', label: 'Geometris', icon: Box },
];

const LOGO_TYPES = [
  { id: 'icon-text', label: 'Ikon + Teks', desc: 'Simbol & Nama' },
  { id: 'icon-only', label: 'Hanya Ikon', desc: 'Simbol Saja' },
  { id: 'text-only', label: 'Hanya Teks', desc: 'Tipografi Saja' },
];

const COLOR_PRESETS = [
  { label: 'Indigo Night', value: '#6366f1' },
  { label: 'Emerald City', value: '#10b981' },
  { label: 'Rose Gold', value: '#fb7185' },
  { label: 'Amber Sun', value: '#f59e0b' },
  { label: 'Slate Corporate', value: '#475569' },
  { label: 'Royal Purple', value: '#8b5cf6' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
];

interface LogoMakerProps {
  onPreview: (url: string) => void;
}

export default function LogoMaker({ onPreview }: LogoMakerProps) {
  const [logoName, setLogoName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [style, setStyle] = useState('Minimalist');
  const [logoType, setLogoType] = useState('icon-text');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<'light' | 'dark' | 'grid'>('light');

  const handleMagicSuggest = async () => {
    if (!logoName.trim()) {
      setError('Masukkan nama brand terlebih dahulu.');
      return;
    }
    setMagicLoading(true);
    setError(null);
    try {
      const suggestion = await suggestLogoDescription(logoName, slogan);
      setCustomDescription(suggestion);
    } catch (err) {
      setError("Gagal mendapatkan saran magic.");
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!logoName.trim()) {
      setError('Harap masukkan nama brand.');
      return;
    }

    setLoading(true);
    setError(null);

    let logoPrompt = `High-end professional logo design for a brand named "${logoName}". `;
    if (slogan && logoType !== 'icon-only') logoPrompt += `Include the tagline "${slogan}". `;
    logoPrompt += `Visual Style: ${style}. `;
    
    if (logoType === 'icon-text') {
      logoPrompt += "Composition: A high-clarity professional vector icon paired with readable brand typography. ";
    } else if (logoType === 'icon-only') {
      logoPrompt += "Composition: STANDALONE GRAPHICAL SYMBOL ONLY. STRICT NEGATIVE INSTRUCTION: NO TEXT AT ALL. ";
    } else {
      logoPrompt += "Composition: A sophisticated wordmark or lettermark focus on typography. ";
    }

    logoPrompt += `Color Scheme: ${primaryColor} on clean solid background. `;
    if (customDescription) logoPrompt += `Visual Concept: ${customDescription}. `;
    logoPrompt += "Standard: Clean lines, flat design, vector aesthetics, professional branding.";

    try {
      const generatedUrls = await generateImagesFromText(logoPrompt, aspectRatio);
      setResults(prev => [{ imageUrls: generatedUrls, prompt: logoPrompt, timestamp: Date.now() }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat logo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Input Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-800 p-5 md:p-7 shadow-2xl space-y-6 md:space-y-8 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-emerald-600 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg">
                   <PenTool className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold">Logo Maker</h2>
             </div>
          </div>

          <div className="space-y-5 md:space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">1. Identitas Brand</label>
              <div className="space-y-2">
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input type="text" placeholder="Nama Brand" className="w-full bg-slate-800/30 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={logoName} onChange={(e) => setLogoName(e.target.value)} />
                </div>
                <input type="text" placeholder="Slogan (Opsional)" className="w-full bg-slate-800/30 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">2. Gaya & Tipe</label>
                <button onClick={handleMagicSuggest} disabled={magicLoading} className="text-[8px] font-black uppercase text-indigo-400 flex items-center gap-1">{magicLoading ? '...' : <Wand2 className="w-3 h-3" />} Magic</button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {LOGO_STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${style === s.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800/30 border-slate-800 text-slate-500'}`}>
                    <s.icon className="w-4 h-4 mb-1" />
                    <span className="text-[8px] font-bold">{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {LOGO_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setLogoType(t.id)} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-bold ${logoType === t.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800/30 border-slate-800 text-slate-500'}`}>
                    {t.label} {logoType === t.id && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">3. Warna & Rasio</label>
              <div className="flex flex-wrap gap-2 px-1">
                {COLOR_PRESETS.map((p) => (
                  <button key={p.value} onClick={() => setPrimaryColor(p.value)} className={`w-5 h-5 rounded-full border border-white/10 ${primaryColor === p.value ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' : ''}`} style={{ backgroundColor: p.value }} />
                ))}
                <input type="color" className="w-5 h-5 bg-transparent border-none cursor-pointer" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                {RATIOS.map(r => (
                  <button key={r.value} onClick={() => setAspectRatio(r.value)} className={`px-3 py-1.5 rounded-lg border text-[8px] font-bold whitespace-nowrap ${aspectRatio === r.value ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{r.value}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Hasilkan Logo'}
            </button>
          </div>
        </section>
      </div>

      {/* Results View */}
      <div className="lg:col-span-8 space-y-6">
        {results.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Konsep Desain</h3>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
               {(['light', 'dark', 'grid'] as const).map((mode) => (
                 <button key={mode} onClick={() => setBgMode(mode)} className={`px-2 py-1 text-[8px] font-bold rounded-md transition-all uppercase ${bgMode === mode ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{mode}</button>
               ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 ? (
          <div className="bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-2xl md:rounded-[3rem] p-8 min-h-[40vh] md:min-h-[70vh] flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800">
               <PenTool className="w-8 h-8 text-emerald-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-300">Buat Logo Brand</h3>
             <p className="text-slate-500 text-xs max-w-xs mt-2">Identitas visual brand Anda hanya dalam hitungan detik menggunakan Gemini AI.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
            {loading && [1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-900/40 rounded-2xl animate-pulse border border-slate-800" />)}
            {results.map((result) => (
              result.imageUrls.map((url, vIdx) => (
                <div key={`${result.timestamp}-${vIdx}`} className="relative group rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
                  <div className={`aspect-square flex items-center justify-center p-8 md:p-12 ${bgMode === 'light' ? 'bg-white' : bgMode === 'dark' ? 'bg-slate-950' : 'bg-slate-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]'}`}>
                    <img src={url} alt="Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between p-2 bg-slate-900/90 backdrop-blur rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-[8px] font-bold text-slate-400 pl-2">Konsep {vIdx + 1}</span>
                    <div className="flex gap-1.5">
                       <button onClick={() => onPreview(url)} className="p-2 bg-emerald-600 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                       <a href={url} download={`logo-${vIdx}.png`} className="p-2 bg-white text-slate-950 rounded-lg"><Download className="w-3.5 h-3.5" /></a>
                    </div>
                  </div>
                </div>
              ))
            ))}
          </div>
        )}
      </div>
    </div>
  );
}