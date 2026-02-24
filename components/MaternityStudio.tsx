import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  UserCheck,
  Zap,
  Layout,
  CheckCircle2,
  Flower,
  MapPin,
  User,
  Heart,
  BabyIcon,
  Palette,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const THEMES = [
  { id: 'Ethereal Flow', label: 'Ethereal Flow', desc: 'Gaun melayang lembut dengan nuansa magis' },
  { id: 'Nature Goddess', label: 'Nature Goddess', desc: 'Di tengah taman bunga atau hutan pinus' },
  { id: 'Minimalist Chic', label: 'Minimalist Chic', desc: 'Latar studio solid dengan outfit simpel' },
  { id: 'Floral Fantasy', label: 'Floral Fantasy', desc: 'Dikelilingi rangkaian bunga estetik' },
  { id: 'Luxury Suite', label: 'Luxury Suite', desc: 'Suasana kamar hotel mewah yang tenang' },
  { id: 'Black and White Classic', label: 'B&W Classic', desc: 'Kesan artistik, dramatis, dan abadi' },
];

const OUTFITS = [
  { id: 'Long Flowing Gown', label: 'Gaun Melayang', desc: 'Menonjolkan siluet perut ibu' },
  { id: 'Silk Robe', label: 'Robe Sutra', desc: 'Kesan intim dan elegan' },
  { id: 'Lace Dress', label: 'Dress Brukat', desc: 'Detail tekstur kain yang cantik' },
  { id: 'Simple Casual', label: 'Casual Minimalis', desc: 'Kaos/Kemeja santai yang rapi' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '9:16 Story', value: '9:16' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface MaternityStudioProps {
  onPreview: (url: string) => void;
}

export default function MaternityStudio({ onPreview }: MaternityStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [theme, setTheme] = useState('Ethereal Flow');
  const [outfit, setOutfit] = useState('Long Flowing Gown');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar referensi didukung.');
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

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError('Harap unggah setidaknya satu foto wajah/diri Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    let maternityPrompt = `A high-end professional maternity photography session. `;
    maternityPrompt += `Theme: ${theme}. The woman is elegantly pregnant, showcasing her beautiful baby bump. `;
    maternityPrompt += `Outfit: She is wearing a stunning ${outfit}. `;
    
    if (customPrompt) maternityPrompt += `Special Detail: ${customPrompt}. `;
    
    maternityPrompt += "Visual Style: Cinematic soft lighting, professional studio or natural lighting, beautiful bokeh, sharp focus on the mother's radiant face and pregnancy bump. ";
    
    if (keepFace) {
      maternityPrompt += "STRICT IDENTITY MANDATE: You must maintain 100% facial similarity to the source image. Preserve the subject's unique biometric identity perfectly. ";
    }

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        maternityPrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: maternityPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto maternity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-amber-500 p-2.5 rounded-2xl shadow-lg shadow-amber-500/30">
                <Flower className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Maternity Studio</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Identity Mapping Mode</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Ibu (1-5)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Input" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-amber-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Proteksi Identitas
              </label>
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-amber-500/10 border-amber-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${keepFace ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 block">Strict Face Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase">Identity Shield Active</span>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${keepFace ? 'bg-amber-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
              >
                {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4.5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-xl shadow-amber-900/40 border border-amber-500/30'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghitung Biometrik...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate Maternity</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Flower className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Maternity AI Studio</h2>
              <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                Abadikan momen kehamilan dalam balutan visual elegan. Sistem <b>Identity Shield</b> kami menjaga wajah Anda tetap autentik dan bercahaya.
              </p>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-8 min-h-[50vh]">
                  <Fingerprint className="w-24 h-24 text-amber-500/20 animate-pulse" />
                  <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-amber-400">Locking Identity Markers...</p>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div key={result.timestamp} className="bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img src={url} alt="Maternity" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Identity Shield Active</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => onPreview(url)} className="bg-amber-600 text-white p-4 rounded-full"><Eye className="w-6 h-6" /></button>
                        <a href={url} download={`maternity-${vIdx + 1}.png`} className="bg-white text-slate-900 p-4 rounded-full"><Download className="w-6 h-6" /></a>
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