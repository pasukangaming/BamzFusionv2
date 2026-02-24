
import React, { useState } from 'react';
import { 
  ScrollText, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  Zap, 
  ShoppingBag, 
  User, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  Hash,
  Upload,
  Trash2,
  Image as ImageIcon,
  Camera,
  Eye,
  Wand2
} from 'lucide-react';
import { generateCopywriting, magicProductDetails } from '../services/geminiService';
import { ImageFile } from '../types';

const TONES = [
  { id: 'Professional', label: 'Profesional', desc: 'Formal & Terpercaya' },
  { id: 'Casual', label: 'Santai', desc: 'Ramah & Akrab' },
  { id: 'Hype', label: 'Hype', desc: 'Energik & Semangat' },
  { id: 'Persuasive', label: 'Persuasif', desc: 'Menghipnotis & Menjual' },
];

const PLATFORMS = [
  { id: 'Instagram', label: 'Instagram' },
  { id: 'TikTok', label: 'TikTok' },
  { id: 'Shopee/Tokopedia', label: 'Marketplace' },
  { id: 'Facebook', label: 'Facebook' },
];

export default function ProductCopywriter() {
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Persuasive');
  const [platform, setPlatform] = useState('Instagram');
  const [image, setImage] = useState<ImageFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleMagicFill = async () => {
    if (!image) return;
    
    setIsMagicLoading(true);
    setError(null);
    try {
      const details = await magicProductDetails(image.file);
      setProductName(details.name);
      setFeatures(details.features);
    } catch (err) {
      setError("Magic scan gagal. Silakan isi manual.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!image && !productName.trim()) {
      setError('Harap unggah foto produk atau masukkan nama produk.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const copy = await generateCopywriting(
        productName, 
        features, 
        audience, 
        tone, 
        platform,
        image?.file
      );
      setResult(copy);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan copywriting.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="bg-amber-600 p-2.5 rounded-2xl shadow-lg shadow-amber-600/30">
                <ScrollText className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">AI Copywriter</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Marketing Content Engine</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 0: Image Upload */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">0</span>
                Foto Produk
              </label>
              
              {image ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={image.preview} alt="Produk" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={removeImage} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500 text-slate-950 text-[8px] font-black uppercase rounded shadow-lg">
                      Visual Input
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleMagicFill}
                    disabled={isMagicLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                      isMagicLoading 
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 animate-pulse' 
                      : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 hover:border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    }`}
                  >
                    {isMagicLoading ? (
                       <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                       <Wand2 className="w-4 h-4" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">
                      {isMagicLoading ? 'Magic Scanning...' : 'Tombol Magic: Isi Otomatis'}
                    </span>
                  </button>
                </div>
              ) : (
                <label className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group">
                  <Camera className="w-7 h-7 text-slate-600 mb-2 group-hover:text-amber-500 transition-colors" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase group-hover:text-amber-400">Pilih Foto Produk</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Step 1: Product Info */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Data Produk
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Nama Produk"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <textarea 
                  placeholder="Detail fitur, manfaat, atau promo khusus..."
                  className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                />
              </div>
            </div>

            {/* Step 2: Audience & Tone */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Target & Gaya
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Target Pembeli"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex flex-col items-start px-3 py-2 rounded-xl border transition-all ${
                      tone === t.id 
                      ? 'bg-amber-600/10 border-amber-600/50 text-amber-400' 
                      : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                    <span className="text-[8px] opacity-60">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Platform */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Platform Tujuan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
                      platform === p.id 
                      ? 'bg-amber-600/10 border-amber-600/50 text-amber-400' 
                      : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
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
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-xl shadow-amber-600/20'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse">Menyusun Teks Marketing...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white" />
                  <span className="font-bold text-lg uppercase tracking-tight">Hasilkan Copywriting</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {!result && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh]">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                <ScrollText className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">AI Product Copywriter</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Buat konten jualan kelas dunia dalam hitungan detik. Gunakan <b>Tombol Magic</b> untuk memindai foto produk Anda secara otomatis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {[
                    { icon: Wand2, title: "1. Tombol Magic", text: "Upload foto produk dan klik Magic. AI akan menebak nama dan keunggulan barang Anda otomatis." },
                    { icon: ShoppingBag, title: "2. Sesuaikan Data", text: "Tambahkan detail yang belum terdeteksi seperti harga promo atau link pembelian." },
                    { icon: Sparkles, title: "3. Personalisasi Gaya", text: "Pilih nada bicara (Santai/Hype) dan platform target seperti Instagram atau TikTok." },
                    { icon: Hash, title: "4. Paket Lengkap", text: "Dapatkan Headline maut, Body teks persuasif, CTA kuat, dan Hashtag viral sekaligus." }
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {loading && (
              <div className="animate-pulse bg-slate-900/50 rounded-[3rem] p-12 border border-slate-800 flex flex-col items-center justify-center gap-6 min-h-[50vh]">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center relative">
                   <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                   <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div className="space-y-4 w-full max-w-md text-center">
                   <p className="text-amber-500 font-bold animate-pulse text-lg">AI Sedang Meracik Kalimat Persuasif...</p>
                   <div className="space-y-2">
                      <div className="h-3 bg-slate-800 rounded-full w-3/4 mx-auto" />
                      <div className="h-3 bg-slate-800 rounded-full w-full" />
                      <div className="h-3 bg-slate-800 rounded-full w-5/6 mx-auto" />
                   </div>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col min-h-[75vh]">
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-600/20">
                         <ScrollText className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                         <h3 className="font-bold text-white text-lg">Draft Iklan Siap Pakai</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {platform} • {tone} {image ? '• Visual Identity OK' : ''}
                         </p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => setResult(null)}
                        className="bg-slate-800 border border-slate-700 text-slate-400 p-3 rounded-2xl hover:text-white transition-all"
                        title="Tulis Ulang"
                      >
                         <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all border ${
                          copied 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 shadow-lg'
                        }`}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Tersalin' : 'Salin Semua'}
                      </button>
                   </div>
                </div>

                <div className="p-10 md:p-14 overflow-auto custom-scrollbar prose prose-invert prose-amber max-w-none flex-1">
                   <div className="whitespace-pre-wrap leading-relaxed text-slate-300 text-lg">
                      {result}
                   </div>
                </div>

                <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      {image && (
                         <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">Magic Scan Applied</span>
                         </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Marketing Intelligence by Bamz Fusion.
                      </div>
                   </div>
                   <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      Ready for Social Commerce
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
