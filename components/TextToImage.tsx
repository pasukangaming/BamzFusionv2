
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  Zap,
  Type,
  Layout,
  MousePointer2,
  Settings2,
  CheckCircle2,
  ImagePlus,
  Info,
  PenTool,
  Save,
  MousePointerClick
} from 'lucide-react';
import { AspectRatio, GenerationResult } from '../types';
import { generateImagesFromText } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '3:4 Potret', value: '3:4' },
  { label: '4:3 Lanskap', value: '4:3' },
  { label: '9:16 Cerita', value: '9:16' },
  { label: '16:9 Sinematik', value: '16:9' },
];

interface TextToImageProps {
  onPreview: (url: string) => void;
  initialPrompt?: string;
}

export default function TextToImage({ onPreview, initialPrompt }: TextToImageProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Harap masukkan deskripsi gambar yang ingin dibuat.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedUrls = await generateImagesFromText(prompt, aspectRatio);

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghasilkan gambar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Input */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-800 p-5 md:p-7 shadow-2xl space-y-6 md:space-y-8 lg:sticky lg:top-20">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg shadow-indigo-500/10">
                <ImagePlus className="w-4 h-4 md:w-5 md:h-5 text-white" />
             </div>
             <h2 className="text-lg md:text-xl font-bold">Buat Gambar</h2>
          </div>

          <div className="space-y-5 md:space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 flex items-center justify-center text-[7px]">1</span>
                Ide Gambar (Prompt)
              </label>
              <textarea 
                placeholder="Contoh: Kucing astronot memancing di atas bulan..."
                className="w-full h-32 md:h-40 bg-slate-800/30 border border-slate-700 rounded-xl md:rounded-2xl p-4 text-xs md:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 flex items-center justify-center text-[7px]">2</span>
                Ukuran Gambar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                {RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] border transition-all ${
                      aspectRatio === r.value 
                      ? 'bg-indigo-600 border-indigo-400 text-white' 
                      : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    <Layout className="w-3 h-3" />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-xl md:rounded-[1.25rem] py-3.5 md:py-4 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                : 'bg-indigo-600 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-600/10'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold animate-pulse">Memproses...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 fill-white" />
                  <span className="font-bold text-xs md:text-sm uppercase tracking-widest">Hasilkan Gambar</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Results View */}
      <div className="lg:col-span-8 space-y-6 md:space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] p-6 md:p-12 min-h-[40vh] md:min-h-[75vh] items-center justify-center">
            <div className="flex flex-col items-center text-center mb-10 md:mb-16 relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-800 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-indigo-500" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Buat Gambar AI</h2>
              <p className="text-slate-500 max-w-lg text-sm md:text-base leading-relaxed">
                Ubah ide tulisan Anda menjadi mahakarya visual dalam hitungan detik menggunakan teknologi Gemini AI terbaru.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: PenTool, title: "1. Tulis Deskripsi", text: "Masukkan detail gambar yang Anda inginkan. Semakin detail deskripsi Anda, semakin akurat hasilnya." },
                    { icon: Layout, title: "2. Pilih Rasio", text: "Tentukan ukuran gambar yang sesuai untuk postingan media sosial, story, atau banner website." },
                    { icon: MousePointerClick, title: "3. Klik Generate", text: "Biarkan AI meracik 4 variasi gambar unik berdasarkan instruksi yang Anda berikan." },
                    { icon: Save, title: "4. Simpan Hasil", text: "Lihat hasil dalam kualitas HD, lalu unduh gambar favorit Anda untuk digunakan langsung." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800/60 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <step.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base">{step.title}</h3>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/10 animate-pulse">
               <Info className="w-3.5 h-3.5 text-indigo-400" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tips: Gunakan kata sifat untuk hasil lebih estetik</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12 pb-12">
            {loading && (
              <div className="animate-pulse bg-slate-900/50 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-800 rounded-xl md:rounded-3xl" />)}
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900/50 rounded-2xl md:rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-6 ${idx === 0 ? 'ring-1 ring-indigo-500/20' : ''}`}
              >
                <div className="p-3 md:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {result.imageUrls.map((url, vIdx) => (
                      <div key={vIdx} className="relative group rounded-xl md:rounded-3xl overflow-hidden bg-black border border-slate-800 aspect-square">
                        <img 
                          src={url} 
                          alt={`Variasi ${vIdx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={() => onPreview(url)}
                            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a 
                            href={url} 
                            download={`image-gen-${vIdx + 1}.png`}
                            className="bg-white text-slate-900 p-3 rounded-full hover:bg-slate-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 md:p-6 bg-slate-900/80 border-t border-slate-800 flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Deskripsi</span>
                    </div>
                    <p className="text-slate-300 text-[11px] md:text-sm italic line-clamp-2 leading-relaxed">"{result.prompt}"</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 shrink-0">
                    <div className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {new Date(result.timestamp).toLocaleTimeString()}</div>
                    <div className="bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold">{aspectRatio}</div>
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
