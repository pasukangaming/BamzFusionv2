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
  Hand,
  Phone,
  Coffee,
  PenTool,
  Gem,
  Palette,
  Camera
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const HAND_ACTIONS = [
  { id: 'Holding Phone', label: 'Pegang HP', icon: Phone, desc: 'Tangan memegang smartphone modern' },
  { id: 'Holding Coffee', label: 'Pegang Kopi', icon: Coffee, desc: 'Memegang cup kopi estetik' },
  { id: 'Writing/Sketching', label: 'Menulis/Sketsa', icon: PenTool, desc: 'Tangan sedang menulis di kertas' },
  { id: 'Holding Luxury Watch', label: 'Pegang Jam Mewah', icon: Gem, desc: 'Memamerkan perhiasan / jam tangan' },
  { id: 'Touching Screen', label: 'Menyentuh Layar', icon: Hand, desc: 'Interaksi dengan layar digital' },
  { id: 'Gesturing (Pointing)', label: 'Menunjuk', icon: Hand, desc: 'Tangan menunjuk ke arah tertentu' },
];

const BACKGROUND_SCENES = [
  { id: 'Aesthetic Cafe', label: 'Kafe Estetik' },
  { id: 'Luxury Office', label: 'Kantor Mewah' },
  { id: 'Nature/Forest', label: 'Alam Terbuka' },
  { id: 'City Street Blur', label: 'Jalanan Kota (Bokeh)' },
  { id: 'Clean Studio', label: 'Studio Minimalis' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '9:16 Story', value: '9:16' },
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface HandPOVStudioProps {
  onPreview: (url: string) => void;
}

export default function HandPOVStudio({ onPreview }: HandPOVStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [action, setAction] = useState('Holding Phone');
  const [scene, setScene] = useState('Aesthetic Cafe');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [keepIdentity, setKeepIdentity] = useState(true);
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
      setError('Harap unggah setidaknya satu foto tangan atau perhiasan sebagai referensi.');
      return;
    }

    setLoading(true);
    setError(null);

    let povPrompt = `A high-end professional first-person perspective (POV) photograph looking down at hands. `;
    povPrompt += `The hands are ${action}. `;
    povPrompt += `Background: The scene is set in a ${scene}. `;
    
    if (customPrompt) povPrompt += `Additional Detail: ${customPrompt}. `;
    
    povPrompt += "Visual Style: Cinematic lighting, extremely shallow depth of field with beautiful bokeh, sharp focus on the hands and the held object. Professional macro-like photography. 8k resolution, photorealistic. ";
    
    if (keepIdentity) {
      povPrompt += "CRITICAL: Maintain the skin tone, hand structure, and unique details (like rings, tattoos, or skin textures) from the reference images. ";
    }

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        povPrompt,
        aspectRatio,
        keepIdentity
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: povPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan visual POV Tangan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-stone-600 p-2.5 rounded-2xl shadow-lg shadow-stone-600/30">
                <Hand className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">POV Tangan</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">First-Person Visual Forge</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Referensi (Tangan/Objek)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Ref" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-stone-500 hover:bg-stone-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-stone-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Action Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Pilih Aktivitas Tangan
              </label>
              <div className="grid grid-cols-1 gap-2">
                {HAND_ACTIONS.map(h => (
                  <button
                    key={h.id}
                    onClick={() => setAction(h.id)}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all text-left ${action === h.id ? 'bg-stone-600/10 border-stone-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${action === h.id ? 'bg-stone-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        <h.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-[11px] font-bold ${action === h.id ? 'text-stone-300' : 'text-slate-400'}`}>{h.label}</div>
                      <div className="text-[9px] opacity-60">{h.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Background Scene */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Pilih Latar Belakang
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_SCENES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScene(s.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${scene === s.id ? 'bg-stone-600/20 border-stone-500 text-stone-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Detail & Ratio */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Kustomisasi & Rasio
              </label>
              <textarea 
                placeholder="E.g. Memakai cincin kawin, kuku dicat merah, memegang iPhone 15 Pro Titanium..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-stone-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              
              <div 
                onClick={() => setKeepIdentity(!keepIdentity)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  keepIdentity ? 'bg-stone-500/10 border-stone-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-5 h-5 ${keepIdentity ? 'text-stone-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-bold text-slate-300">Identity Guard</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${keepIdentity ? 'bg-stone-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepIdentity ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`px-1 py-2.5 rounded-xl text-[9px] font-bold border transition-all ${
                      aspectRatio === r.value ? 'bg-white border-white text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {r.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4.5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-r from-stone-600 to-stone-800 hover:from-stone-500 hover:to-stone-700 text-white shadow-xl shadow-stone-900/40 border border-stone-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-white">Merender Perspektif...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate POV</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] relative overflow-hidden">
             <div className="absolute inset-0 bg-stone-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Hand className="w-12 h-12 text-stone-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">POV Tangan AI Studio</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Ciptakan visual orang pertama (First Person View) yang memukau. Sangat cocok untuk konten media sosial, review produk, atau pamer perhiasan dengan estetika sinematik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: Hand, title: "1. Foto Referensi", text: "Unggah foto tangan Anda atau produk yang ingin dipamerkan. AI akan mengenali tekstur kulit dan detail objek." },
                    { icon: Camera, title: "2. Perspektif POV", text: "AI akan merancang sudut pandang seolah-olah kamera adalah mata Anda sendiri (first-person view)." },
                    { icon: Sparkles, title: "3. Bokeh Profesional", text: "Dapatkan efek blur latar belakang yang sangat artistik, memfokuskan pandangan pada subjek tangan." },
                    { icon: CheckCircle2, title: "4. Kualitas Iklan", text: "Hasil render 8K dengan pencahayaan yang natural, siap untuk Reels, Stories, atau katalog digital." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-stone-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-12 h-12 bg-stone-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-stone-400" />
                        </div>
                        <h3 className="font-bold text-stone-50 mb-3 text-lg">{step.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{step.text}</p>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-8 min-h-[50vh]">
                  <div className="relative">
                     <div className="absolute inset-0 bg-stone-500 blur-[80px] opacity-20 animate-pulse" />
                     <Hand className="w-24 h-24 relative animate-bounce text-stone-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-stone-400">
                        Menyesuaikan Pandangan Anda...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Memetakan geometri tangan & bayangan objek</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-stone-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[9/16]">
                      <img 
                        src={url} 
                        alt={`POV Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-stone-600 text-white p-4 rounded-full hover:bg-stone-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`pov-hand-${vIdx + 1}.png`}
                          className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 bg-slate-900/95 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">POV Master Render</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{action} @ {scene}</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     {keepIdentity && (
                       <div className="flex items-center gap-2 bg-stone-500/10 px-3 py-1.5 rounded-xl border border-stone-500/20">
                          <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-[10px] text-stone-400 font-black uppercase">Hand Identity Verified</span>
                       </div>
                     )}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950 px-4 py-2 rounded-full border border-slate-800">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}