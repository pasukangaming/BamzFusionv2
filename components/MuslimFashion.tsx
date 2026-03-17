import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Download, 
  ImageIcon, 
  Loader2, 
  Zap, 
  MoonStar, 
  Palette, 
  Layout, 
  Maximize, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  Layers,
  Camera
} from 'lucide-react';
import { transformImages, transformImagesPro } from '../services/geminiService';
import { AspectRatio, GenerationResult } from '../types';

const FASHION_THEMES = [
  { id: 'modern-koko', label: 'Baju Koko Modern', desc: 'Gaya pria muslim kontemporer yang elegan' },
  { id: 'syari-hijab', label: 'Gamis & Hijab Syar\'i', desc: 'Koleksi muslimah anggun dan menutup aurat' },
  { id: 'family-sarimbit', label: 'Sarimbit Keluarga', desc: 'Seragam keluarga kompak untuk hari raya' },
  { id: 'kaftan-luxury', label: 'Kaftan Luxury', desc: 'Gaya pesta Ramadhan yang mewah dan glamor' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '3:4 Potret', value: '3:4' },
  { label: '9:16 Cerita', value: '9:16' },
];

interface MuslimFashionProps {
  onPreview: (url: string) => void;
}

export default function MuslimFashion({ onPreview }: MuslimFashionProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [theme, setTheme] = useState('modern-koko');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
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
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!isConnected) {
      // @ts-ignore
      if (window.aistudio) await window.aistudio.openSelectKey();
      return;
    }

    if (!image) {
      setError('Harap unggah foto model atau diri Anda terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);

    const prompt = `
      Transform the person in the image into a high-end Muslim fashion model. 
      Theme: ${theme}. 
      Clothing Details: Elegant ${theme} style, high-quality fabrics (silk, linen, premium cotton), intricate embroidery or patterns where appropriate. 
      Setting: Luxurious Ramadhan/Eid atmosphere, soft warm lighting, modern Islamic architecture background or minimalist studio. 
      Style: Professional fashion photography, 85mm lens, sharp focus on the model, cinematic color grading. 
      Maintain the original facial features and identity of the person in the image perfectly.
      ${customPrompt ? `Additional details: ${customPrompt}` : ''}
    `;

    try {
      const urls = await transformImagesPro([image], prompt, aspectRatio, '1K', true);
      setResults(prev => [{
        imageUrls: urls,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses foto fashion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                <Shirt className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Fashion Muslim AI</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Katalog Ramadhan & Lebaran</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Unggah Foto Model</label>
              <div className="relative aspect-[3/4] rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950/50 overflow-hidden group transition-all hover:border-indigo-500/50">
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Ganti Foto
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-slate-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Klik untuk Unggah</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Pilih Gaya Busana</label>
              <div className="grid grid-cols-1 gap-2">
                {FASHION_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      theme === t.id 
                      ? 'bg-indigo-500/10 border-indigo-500/50' 
                      : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${theme === t.id ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-[11px] font-black uppercase tracking-tight ${theme === t.id ? 'text-indigo-400' : 'text-slate-300'}`}>{t.label}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Detail Tambahan</label>
              <textarea 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Misal: Warna sage green, motif batik halus, latar masjid estetik..."
              />
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
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin mb-1 text-indigo-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest animate-pulse">Menghasilkan Katalog...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-0.5">
                    <Zap className="w-6 h-6 fill-white" />
                    <span className="font-black text-xl uppercase tracking-tighter">Render Fashion AI</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">High-End Fashion Engine</span>
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
              <MoonStar className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Ramadhan Fashion Studio</h2>
            <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
              Ubah foto biasa menjadi katalog fashion muslim profesional. Cocok untuk owner brand hijab, koko, atau sekadar ingin tampil beda di hari raya.
            </p>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className={`relative bg-slate-900/40 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-[3/4] max-w-2xl mx-auto'}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10">
                    <div className="relative">
                       <div className="absolute inset-0 blur-[80px] opacity-20 animate-pulse bg-indigo-500" />
                       <Layers className="w-24 h-24 relative animate-pulse text-indigo-500/30" />
                    </div>
                    <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-indigo-400">Memproses Tekstur Kain & Cahaya...</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 ${idx === 0 ? 'ring-2 ring-indigo-500/20 shadow-[0_20px_50px_rgba(79,70,229,0.1)]' : ''}`}
              >
                <div className="p-6 grid grid-cols-1 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 shadow-inner">
                      <img 
                        src={url} 
                        alt={`Fashion ${vIdx + 1}`} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="p-4 rounded-full bg-indigo-600 text-white transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <ImageIcon className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`muslim-fashion-${vIdx}.png`}
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
                      <div className="bg-indigo-600 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Fashion Muslim AI</div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{theme} • {aspectRatio}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                       <UserCheck className="w-4 h-4" /> Identity Preserved
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
