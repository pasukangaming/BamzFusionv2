import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  Zap,
  MousePointer2,
  Sparkles,
  ArrowRight,
  Eye,
  ScanSearch,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { ImageFile } from '../types';
import { describeImage } from '../services/geminiService';

interface ImageToPromptProps {
  onSendToTextToImage: (prompt: string) => void;
  onPreview: (url: string) => void;
}

export default function ImageToPrompt({ onSendToTextToImage, onPreview }: ImageToPromptProps) {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedPrompt, setExtractedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      });
      setExtractedPrompt(null);
      setError(null);
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
    setExtractedPrompt(null);
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Harap unggah gambar terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = await describeImage(image.file);
      setExtractedPrompt(prompt);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menganalisis gambar.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedPrompt) {
      navigator.clipboard.writeText(extractedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Input */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <ScanSearch className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-xl font-bold">Gambar ke Promt</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">1</span>
                Gambar Sumber
              </label>
              
              {image ? (
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden group border border-slate-700">
                  <img src={image.preview} alt="Pratinjau" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => onPreview(image.preview)}
                      className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={removeImage}
                      className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-square w-full rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800 transition-all group">
                  <Upload className="w-8 h-8 text-slate-500 mb-3 group-hover:text-indigo-400" />
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Unggah Gambar</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
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
              onClick={handleAnalyze}
              disabled={loading || !image}
              className={`group relative w-full overflow-hidden rounded-[1.25rem] py-4 transition-all active:scale-95 ${
                loading || !image
                ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-indigo-50">Menganalisis Gambar...</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-white group-hover:scale-125 transition-transform" />
                    <span className="font-bold text-base">Ekstrak Prompt</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-8 space-y-8">
        {!extractedPrompt && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] p-8 md:p-12 min-h-[75vh]">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                <ScanSearch className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-300">Panduan Gambar ke Promt</h2>
              <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                Ingin tahu deskripsi di balik sebuah gambar? Unggah dan biarkan AI mengekstrak deskripsi mendalamnya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">1. Pilih Gambar</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Unggah gambar apa pun yang ingin Anda analisis gaya dan deskripsinya.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">2. Klik Ekstrak</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Gemini 3 Flash akan memindai gambar dan menulis prompt deskriptif yang mendalam.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">3. Pakai di Teks ke Gambar</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Koneksikan langsung hasil prompt ke menu 'Teks ke Gambar' untuk membuat variasi gambar baru.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">4. Selesai</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Gunakan deskripsi tersebut untuk mendapatkan hasil visual yang serupa di AI generator mana pun.
                    </p>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {loading && (
              <div className="animate-pulse bg-slate-900 rounded-[2.5rem] p-12 border border-slate-800 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              </div>
            )}

            {extractedPrompt && !loading && (
              <div className="bg-slate-900 rounded-[3rem] border border-slate-800 p-8 md:p-12 shadow-2xl">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Prompt Terkunci</h3>
                      <p className="text-slate-500 text-sm">Gunakan deskripsi ini untuk membuat gambar baru.</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                          copied 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                       >
                         {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                         {copied ? 'Tersalin' : 'Salin'}
                       </button>
                    </div>
                 </div>

                 <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-slate-950/80 border border-slate-800 rounded-2xl p-8 text-slate-300 italic text-lg leading-relaxed shadow-inner">
                      "{extractedPrompt}"
                    </div>
                 </div>

                 <div className="mt-12 flex flex-col md:flex-row items-center gap-4">
                    <button 
                      onClick={() => onSendToTextToImage(extractedPrompt)}
                      className="w-full md:w-auto flex-1 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                      <Sparkles className="w-5 h-5" />
                      Gunakan di Teks ke Gambar
                    </button>
                    <button 
                      onClick={removeImage}
                      className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-2xl font-bold transition-all"
                    >
                      Analisis Gambar Lain
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}