import React, { useState } from 'react';
import { 
  Rocket, 
  Upload, 
  Trash2, 
  Loader2, 
  Download,
  Eye,
  Zap,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Home,
  Trees,
  MonitorCheck,
  MousePointer2
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const PLATFORMS = [
  { id: 'Shopee Video', label: 'Shopee Video', desc: 'Tone cerah & visual memikat' },
  { id: 'TikTok Shop', label: 'TikTok Shop', desc: 'Gaya urban & natural mobile' },
  { id: 'Instagram Reels', label: 'IG Reels', desc: 'Aesthetic & Cinematic' },
  { id: 'Catalog Marketplace', label: 'Katalog Produk', desc: 'Bersih & Profesional' },
];

const LOCATION_TYPES = [
  { id: 'Indoor', label: 'Indoor / Dalam Ruangan', icon: Home, desc: 'Latar cafe, rumah mewah, atau studio' },
  { id: 'Outdoor', label: 'Outdoor / Luar Ruangan', icon: Trees, desc: 'Latar taman, jalanan kota, atau alam' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '9:16 (Vertikal)', value: '9:16' },
  { label: '1:1 (Persegi)', value: '1:1' },
  { label: '4:3 (Katalog)', value: '4:3' },
  { label: '16:9 (Lanskap)', value: '16:9' },
];

interface AffiliateGoProps {
  onPreview: (url: string) => void;
}

export default function AffiliateGo({ onPreview }: AffiliateGoProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [platform, setPlatform] = useState('Shopee Video');
  const [locationType, setLocationType] = useState('Indoor');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar referensi produk.');
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
      setError('Harap unggah setidaknya satu foto produk.');
      return;
    }

    setLoading(true);
    setError(null);

    let affiliatePrompt = `HIGH-CONVERSION AFFILIATE CONTENT CREATION. `;
    affiliatePrompt += `Platform Focus: ${platform}. Environment Setting: ${locationType}. `;
    affiliatePrompt += `Goal: Transform the provided product images into eye-catching promotional content with high-end advertising aesthetics. `;
    
    if (locationType === 'Indoor') {
      affiliatePrompt += `Setting Detail: Place the product in a premium indoor environment like a minimalist luxury living room, high-end cafe table, or a modern kitchen with soft window lighting. `;
    } else {
      affiliatePrompt += `Setting Detail: Place the product in an aesthetic outdoor environment like a sunny botanical garden, a city street terrace with natural bokeh, or a stylish poolside area. `;
    }

    if (customPrompt) affiliatePrompt += `User Custom Instructions: ${customPrompt}. `;
    
    affiliatePrompt += `
    STRICT VISUAL PROTOCOL:
    1. PRODUCT FIDELITY: Maintain the 100% original shape, brand labels, and core details of the product from the source images. Do not distort the product.
    2. SCENE ENHANCEMENT: Create a visual that looks like a successful high-tier affiliate creator's post.
    3. LIGHTING: Use professional commercial lighting to make the product "pop" and look expensive.
    4. VIBE: Professional product photography, cinematic 8k resolution, realistic shadows, sharp focus on product details.
    `;

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        affiliatePrompt,
        aspectRatio,
        false 
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: affiliatePrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal merender konten affiliate.');
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
             <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-600/30">
                <Rocket className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Affiliate Go</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">High-CTR Content Forge</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Produk Mentah (1-5)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-emerald-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Platform Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Platform Tujuan
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${platform === p.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div>
                      <div className={`text-[11px] font-bold ${platform === p.id ? 'text-emerald-400' : 'text-slate-300'}`}>{p.label}</div>
                      <div className="text-[9px] opacity-60">{p.desc}</div>
                    </div>
                    {platform === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Location Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Pilih Lokasi
              </label>
              <div className="grid grid-cols-1 gap-2">
                {LOCATION_TYPES.map(l => {
                  const Icon = l.icon;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setLocationType(l.id)}
                      className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all text-left ${locationType === l.id ? 'bg-emerald-600/10 border-emerald-500 shadow-inner' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      <div className={`p-2 rounded-xl ${locationType === l.id ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className={`text-[11px] font-bold ${locationType === l.id ? 'text-emerald-400' : 'text-slate-300'}`}>{l.label}</div>
                        <div className="text-[9px] opacity-60">{l.desc}</div>
                      </div>
                      {locationType === l.id && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Detail & Ratio */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Kustomisasi & Rasio
              </label>
              <textarea 
                placeholder="E.g. Tambahkan stiker 'Promo', beri efek cahaya berkilau, masukkan elemen lifestyle..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`px-1 py-2.5 rounded-xl text-[9px] font-bold border transition-all ${
                      aspectRatio === r.value ? 'bg-white border-white text-slate-900 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {r.label}
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
                : 'bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-xl shadow-emerald-900/40 border border-emerald-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Merender Konten Cuan...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight text-white">Generate High-CTR</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] relative overflow-hidden items-center justify-center text-center">
             <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Rocket className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Affiliate Go Studio</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Ubah foto produk biasa dari supplier menjadi konten visual berkelas yang siap mendatangkan banyak klik dan komisi. Pilih lokasi Indoor atau Outdoor untuk nuansa jualan yang berbeda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10 text-left">
                {[
                    { icon: ShoppingBag, title: "1. Upload Produk", text: "Gunakan 1-5 foto produk mentah. AI akan menganalisis fitur fisik dan material barang Anda." },
                    { icon: Smartphone, title: "2. Visual Mobile-First", text: "Setiap hasil dirancang untuk rasio 9:16 yang mendominasi TikTok dan Shopee Video." },
                    { icon: Sparkles, title: "3. Background Estetik", text: "AI merender latar belakang yang relevan, baik Indoor maupun Outdoor, untuk menggugah selera pembeli." },
                    { icon: CheckCircle2, title: "4. Presisi Produk", text: "Teknologi kami memastikan bentuk, logo, dan teks pada produk asli tidak berubah sama sekali." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-emerald-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-emerald-50 mb-3 text-lg">{step.title}</h3>
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
                     <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 animate-pulse" />
                     <Rocket className="w-24 h-24 relative animate-bounce text-emerald-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-emerald-400">
                        Memvisualisasikan Cuan...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Mengatur pencahayaan {locationType} & estetika viral</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-emerald-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[9/16]">
                      <img 
                        src={url} 
                        alt={`Affiliate Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-emerald-600 text-white p-4 rounded-full hover:bg-emerald-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`affiliate-content-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Affiliate Content Rendered</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{platform} • {locationType} Setting</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Viral Optimized</span>
                     </div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950 px-4 py-2 rounded-full border border-slate-800 shrink-0">
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