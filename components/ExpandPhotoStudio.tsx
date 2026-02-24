import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  Zap,
  Layout,
  CheckCircle2,
  Maximize,
  Layers,
  Palette,
  Image as ImageIcon,
  Expand
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '16:9 Sinematik', value: '16:9' },
  { label: '9:16 Mobile Story', value: '9:16' },
  { label: '4:3 Klasik', value: '4:3' },
  { label: '3:1 Banner Luas', value: '3:1' },
  { label: '2:1 Standar', value: '2:1' },
  { label: '1:1 Persegi', value: '1:1' },
];

interface ExpandPhotoStudioProps {
  onPreview: (url: string) => void;
}

export default function ExpandPhotoStudio({ onPreview }: ExpandPhotoStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 3) {
      setError('Maksimal 3 gambar referensi didukung.');
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
      setError('Harap unggah setidaknya satu foto yang ingin diperluas.');
      return;
    }

    setLoading(true);
    setError(null);

    let expandPrompt = `EXPAND AND OUTPAINT THIS IMAGE. `;
    expandPrompt += `The goal is to extend the background and borders of the original photo to fit a ${aspectRatio} aspect ratio. `;
    expandPrompt += `The new expanded areas should perfectly match the style, lighting, texture, and continuity of the original image. `;
    
    if (customPrompt) {
      expandPrompt += `In the expanded background areas, please add or focus on: ${customPrompt}. `;
    } else {
      expandPrompt += `Seamlessly continue the existing environment, objects, and background elements. `;
    }
    
    expandPrompt += "CRITICAL: Maintain the exact appearance and identity of any subjects from the original image. Do not alter the central content, only expand the world around it. High-quality professional outpainting, 8k resolution, seamless blend.";

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        expandPrompt,
        aspectRatio,
        true // Maintain identity if there's a person
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: expandPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memperluas foto.');
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
             <div className="bg-amber-600 p-2.5 rounded-2xl shadow-lg shadow-amber-600/30">
                <Maximize className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Perluas Foto</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Outpainting Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Sumber
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                {images.length < 1 && (
                  <label className="aspect-square w-full rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group">
                    <Upload className="w-6 h-6 text-slate-600 mb-1 group-hover:text-amber-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Pilih Foto</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Ratio Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Rasio Target Perluasan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${aspectRatio === r.value ? 'bg-amber-600/10 border-amber-500 shadow-lg shadow-amber-950/20' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <span className={`text-[10px] font-bold ${aspectRatio === r.value ? 'text-amber-400' : 'text-slate-400'}`}>{r.value}</span>
                    <span className="text-[8px] opacity-60 line-clamp-1">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Prompt */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Detail Latar Baru (Opsional)
              </label>
              <textarea 
                placeholder="E.g. Tambahkan lebih banyak pohon pinus, jalan setapak, atau bukit di kejauhan..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
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
                : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white shadow-xl shadow-amber-900/40 border border-amber-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-white">Melukis Dunia Luar...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Expand className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Expand Borders</span>
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
             <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Maximize className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">AI Expand borders</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Punya foto keren tapi terpotong? Gunakan fitur Perluas Foto untuk "menebak" apa yang ada di luar bingkai foto asli Anda secara ajaib menggunakan AI Outpainting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: ImageIcon, title: "1. Foto Terpotong", text: "Unggah foto yang ingin Anda perluas jangkauan visualnya. AI akan menganalisis tiap pixel di pinggiran gambar." },
                    { icon: Layout, title: "2. Rasio Baru", text: "Ubah foto kotak menjadi pemandangan lebar (16:9) atau potret penuh (9:16) untuk kebutuhan sosial media." },
                    { icon: Palette, title: "3. Kontinuitas Sempurna", text: "AI secara cerdas melukis sisa gambar agar menyatu dengan pencahayaan dan tekstur foto asli Anda." },
                    { icon: CheckCircle2, title: "4. Kualitas 8K", text: "Dapatkan 4 hasil perluasan berbeda dengan detail yang mengagumkan dan transisi yang tidak terlihat." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-amber-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="font-bold text-amber-50 mb-3 text-lg">{step.title}</h3>
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
                     <div className="absolute inset-0 bg-amber-500 blur-[80px] opacity-20 animate-pulse" />
                     <Maximize className="w-24 h-24 relative animate-spin-slow text-amber-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-amber-400">
                        Merekonstruksi Dunia Luar...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Menyelaraskan pixel & perspektif baru</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-amber-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-video">
                      <img 
                        src={url} 
                        alt={`Expanded Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-amber-600 text-white p-4 rounded-full hover:bg-amber-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`expanded-photo-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Outpainting Render Successful</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">New Aspect Ratio: {aspectRatio}</span>
                     </div>
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