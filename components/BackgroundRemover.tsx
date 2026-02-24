
import React, { useState } from 'react';
import { 
  Eraser, 
  Upload, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Scissors,
  Layers,
  SquareDashedMousePointer
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

interface BackgroundRemoverProps {
  onPreview: (url: string) => void;
}

export default function BackgroundRemover({ onPreview }: BackgroundRemoverProps) {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    if (!image) {
      setError('Harap unggah gambar yang ingin dihapus latar belakangnya.');
      return;
    }

    setLoading(true);
    setError(null);

    // Prompt specifically tailored for background removal on a white canvas
    const removeBgPrompt = `REMOVE BACKGROUND. Carefully isolate the main subject (person/object) from the original image. Place the subject on a PURE SOLID FLAT WHITE BACKGROUND (#FFFFFF). Ensure the edges are crisp, sharp, and clean with NO trace of the original background. High-quality professional product/portrait isolation.`;

    try {
      const generatedUrls = await transformImages(
        [image.file],
        removeBgPrompt,
        '1:1', // Standard ratio for isolated assets
        true // Keep face consistency if it's a person
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: removeBgPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus latar belakang.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="bg-slate-700 p-2.5 rounded-2xl shadow-lg shadow-slate-600/30">
                <Eraser className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">BG Remover</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Object Isolation Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Sumber
              </label>
              {image ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                  <img src={image.preview} alt="Source" className="w-full h-full object-cover" />
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
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-800/50 transition-all group">
                  <Upload className="w-8 h-8 text-slate-600 mb-2 group-hover:text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Pilih Gambar</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 text-[10px] text-slate-500 leading-relaxed italic">
                AI akan secara otomatis mendeteksi subjek utama dan memberikan latar belakang putih bersih untuk kemudahan edit selanjutnya.
            </div>
          </div>

          <div className="pt-4">
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
                : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white shadow-xl shadow-slate-900/50 border border-slate-600/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-slate-200">Menghapus Background...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Scissors className="w-5 h-5" />
                  <span className="font-bold text-lg uppercase tracking-tight text-white">Remove BG</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh]">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                <Eraser className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">AI Background Remover</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Hapus latar belakang secara otomatis dengan satu klik. AI kami akan mengisolasi subjek utama dan menempatkannya pada kanvas putih bersih.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {[
                    { icon: ImageIcon, title: "1. Unggah Foto", text: "Pilih foto apapun yang memiliki subjek yang jelas (orang, produk, atau hewan)." },
                    { icon: SquareDashedMousePointer, title: "2. Seleksi AI", text: "Gemini akan menganalisis pixel demi pixel untuk menemukan batas subjek." },
                    { icon: Scissors, title: "3. Ekstraksi Bersih", text: "Latar belakang akan dihapus dan diganti dengan warna solid minimalis." },
                    { icon: CheckCircle2, title: "4. Hasil Siap Pakai", text: "Dapatkan 4 variasi hasil bersih yang siap untuk desain marketplace atau profil." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-slate-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-200 mb-3 text-lg">{step.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{step.text}</p>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-pulse bg-slate-900/50 rounded-[3rem] p-10 border border-slate-800">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-800 rounded-[2.5rem]" />)}
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-slate-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-white border border-slate-800 aspect-square">
                      <img 
                        src={url} 
                        alt={`Removed BG ${vIdx + 1}`} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`removed-bg-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Background Removed</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase">PNG Format Ready (White Canvas)</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase">Edge Sharpened</span>
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
