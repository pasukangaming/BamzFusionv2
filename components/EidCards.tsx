import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  Download, 
  ImageIcon, 
  Loader2, 
  Zap, 
  MoonStar, 
  Heart, 
  Send,
  Palette,
  Layout,
  Type,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { generateImagesFromText } from '../services/geminiService';
import { AspectRatio, GenerationResult } from '../types';

const CARD_THEMES = [
  { id: 'modern-minimalist', label: 'Modern Minimalist', desc: 'Desain bersih dengan tipografi elegan' },
  { id: 'traditional-islamic', label: 'Traditional Islamic', desc: 'Motif arabesque dan ornamen klasik' },
  { id: 'watercolor-floral', label: 'Watercolor Floral', desc: 'Sentuhan bunga lembut dan artistik' },
  { id: 'luxury-gold', label: 'Luxury Gold', desc: 'Kesan mewah dengan aksen emas dan navy' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '4:5 Potret', value: '3:4' },
  { label: '9:16 Cerita', value: '9:16' },
];

interface EidCardsProps {
  onPreview: (url: string) => void;
}

export default function EidCards({ onPreview }: EidCardsProps) {
  const [theme, setTheme] = useState('modern-minimalist');
  const [message, setMessage] = useState('Selamat Hari Raya Idul Fitri 1447 H. Mohon Maaf Lahir dan Batin.');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
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

  const handleGenerate = async () => {
    if (!isConnected) {
      // @ts-ignore
      if (window.aistudio) await window.aistudio.openSelectKey();
      return;
    }

    setLoading(true);
    setError(null);

    const prompt = `
      Create a high-quality Eid Al-Fitr greeting card. 
      Theme: ${theme}. 
      Visual Elements: Islamic geometric patterns, crescent moon, lanterns (fanous), elegant Arabic calligraphy style (but readable English/Indonesian text). 
      Text to include: "${message}". 
      Style: Professional graphic design, high resolution, vibrant colors, ${theme} aesthetic. 
      No distorted text, clean layout, centered composition.
    `;

    try {
      const urls = await generateImagesFromText(prompt, aspectRatio);
      setResults(prev => [{
        imageUrls: urls,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat kartu ucapan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/30">
                <Mail className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Kartu Ucapan Lebaran</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Edisi Ramadhan & Idul Fitri</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Pilih Tema Desain</label>
              <div className="grid grid-cols-1 gap-2">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      theme === t.id 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${theme === t.id ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-[11px] font-black uppercase tracking-tight ${theme === t.id ? 'text-emerald-400' : 'text-slate-300'}`}>{t.label}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Pesan Ucapan</label>
              <textarea 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32 placeholder:text-slate-600 transition-all"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesan ucapan Anda di sini..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Ukuran Kartu</label>
              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${aspectRatio === r.value ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-2xl font-black uppercase tracking-wider">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-[2.5rem] py-6 transition-all active:scale-95 shadow-2xl ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin mb-1 text-emerald-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest animate-pulse">Sedang Mendesain Kartu...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-0.5">
                    <Zap className="w-6 h-6 fill-white" />
                    <span className="font-black text-xl uppercase tracking-tighter">Buat Kartu Ucapan</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">AI Graphic Designer</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[4rem] p-20 min-h-[75vh] items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
              <Mail className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Personalized Eid Cards</h2>
            <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
              Bikin kartu ucapan Idul Fitri yang unik dan personal untuk keluarga, teman, atau kolega bisnis Anda hanya dalam hitungan detik.
            </p>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className={`relative bg-slate-900/40 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-square max-w-2xl mx-auto'}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10">
                    <div className="relative">
                       <div className="absolute inset-0 blur-[80px] opacity-20 animate-pulse bg-emerald-500" />
                       <MoonStar className="w-24 h-24 relative animate-pulse text-emerald-500/30" />
                    </div>
                    <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-emerald-400">Menyusun Ornamen & Tipografi...</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 ${idx === 0 ? 'ring-2 ring-emerald-500/20 shadow-[0_20px_50px_rgba(16,185,129,0.1)]' : ''}`}
              >
                <div className="p-6 grid grid-cols-1 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 shadow-inner">
                      <img 
                        src={url} 
                        alt={`Eid Card ${vIdx + 1}`} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="p-4 rounded-full bg-emerald-600 text-white transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <ImageIcon className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`eid-card-${vIdx}.png`}
                          className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-10 bg-gradient-to-b from-transparent to-black/40 border-t border-slate-800 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Edisi Ramadhan</div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{theme} • {aspectRatio}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 italic">"{message}"</p>
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
