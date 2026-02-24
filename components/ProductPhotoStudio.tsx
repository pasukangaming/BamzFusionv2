import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  Zap,
  ShoppingBag,
  Palette,
  Layout,
  Sun,
  Box,
  CheckCircle2,
  MousePointer2
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult, UserRole } from '../types';
import { transformImages } from '../services/geminiService';

const PRODUCT_CATEGORIES = [
  { id: 'Cosmetics', label: 'Kosmetik/Skincare' },
  { id: 'Electronics', label: 'Elektronik/Gadget' },
  { id: 'Food', label: 'Makanan/Minuman' },
  { id: 'Fashion', label: 'Fashion/Sepatu' },
  { id: 'Furniture', label: 'Furniture/Interior' },
  { id: 'Jewelry', label: 'Perhiasan/Jam Tangan' },
];

const SCENE_OPTIONS = [
  { id: 'Modern Studio', label: 'Studio Modern', desc: 'Latar belakang solid & elegan' },
  { id: 'Nature Luxury', label: 'Alam Mewah', desc: 'Batu, air, atau tanaman' },
  { id: 'Marble Table', label: 'Meja Marmer', desc: 'Kesan mewah & bersih' },
  { id: 'Urban Street', label: 'Jalanan Kota', desc: 'Kesan aktif & outdoor' },
  { id: 'Rustic Wood', label: 'Kayu Rustik', desc: 'Kesan hangat & alami' },
  { id: 'Minimalist Shelf', label: 'Rak Minimalis', desc: 'Kesan rapi & estetik' },
];

const LIGHTING_OPTIONS = [
  { id: 'Soft Studio', label: 'Soft Studio' },
  { id: 'Dramatic Shadow', label: 'Dramatic Shadow' },
  { id: 'Natural Sunlight', label: 'Natural Sunlight' },
  { id: 'Neon Cyberpunk', label: 'Neon Cyberpunk' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '4:3 Katalog', value: '4:3' },
  { label: '3:4 Mobile', value: '3:4' },
  { label: '16:9 Banner', value: '16:9' },
];

interface ProductPhotoStudioProps {
  onPreview: (url: string) => void;
  userRole?: UserRole;
}

export default function ProductPhotoStudio({ onPreview, userRole }: ProductPhotoStudioProps) {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Cosmetics');
  const [scene, setScene] = useState('Modern Studio');
  const [lighting, setLighting] = useState('Soft Studio');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      setError('Harap unggah foto produk Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    let productPrompt = `A high-end professional commercial product photography of ${productName || 'a product'} in a ${category} category. `;
    productPrompt += `Environment/Scene: The product is placed in a ${scene} setting. `;
    productPrompt += `Lighting: ${lighting} setup with high-end advertising aesthetics. `;
    productPrompt += `CRITICAL INSTRUCTION: Maintain the exact shape, labels, branding, and details of the product from the source image. DO NOT distort or change the product itself. Enhance only the background and environment to look like a million-dollar ad campaign. Sharp focus, macro photography style, 8k resolution, clean and vibrant.`;

    try {
      const generatedUrls = await transformImages(
        [image.file],
        productPrompt,
        aspectRatio,
        false // Face consistency not needed for products, prompt handles shape preservation
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: productPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses foto produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Config */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Camera className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-xl font-bold">Product Studio</h2>
          </div>

          <div className="space-y-6">
            {/* Step 1: Image Upload */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">1</span>
                Foto Produk Asli
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
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Unggah Foto Produk</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Step 2: Details */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">2</span>
                Detail & Kategori
              </label>
              <input 
                type="text"
                placeholder="Nama Produk (E.g. Parfum Mewah)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                {PRODUCT_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                      category === c.id ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Atmosphere */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">3</span>
                Latar & Pencahayaan
              </label>
              <select 
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SCENE_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label} - {s.desc}</option>)}
              </select>
              <select 
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LIGHTING_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>

            {/* Step 4: Aspect Ratio Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">4</span>
                Rasio Aspek
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] border transition-all ${
                      aspectRatio === r.value 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    {r.label}
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
              className={`group relative w-full overflow-hidden rounded-[1.25rem] py-4 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse">Merubah Foto Produk...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 fill-white" />
                  <span className="font-bold">Hasilkan 4 Foto Iklan</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] p-8 md:p-12 min-h-[75vh]">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                <ShoppingBag className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-300">Product Photo Studio</h2>
              <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                Ubah foto produk biasa menjadi katalog profesional sekelas brand global.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">1. Foto Produk</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Cukup foto produk Anda di rumah dengan pencahayaan apa adanya. AI akan mengurus sisanya.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Palette className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">2. Atur Suasana</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Pilih tema 'Luxury Room' untuk kosmetik atau 'Urban Street' untuk sepatu kets Anda.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Box className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">3. Jaga Bentuk</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        AI dilatih khusus untuk menjaga keaslian label dan bentuk produk Anda tanpa distorsi.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">4. Katalog Siap Pakai</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Unduh hasilnya dan gunakan langsung untuk postingan jualan di media sosial atau marketplace.
                    </p>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {loading && (
              <div className="animate-pulse bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-800 rounded-3xl" />)}
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-indigo-500/30' : ''}`}
              >
                <div className="p-4 grid grid-cols-2 gap-4">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-3xl overflow-hidden bg-black border border-slate-800 aspect-square">
                      <img 
                        src={url} 
                        alt={`Produk Variasi ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <a 
                          href={url} 
                          download={`product-photo-${vIdx + 1}.png`}
                          className="bg-white text-slate-900 p-3 rounded-full hover:bg-slate-100 transition-all"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Kategori: {category}</span>
                     <span className="w-1 h-1 bg-slate-700 rounded-full" />
                     <span className="text-[10px] text-slate-500 uppercase">{scene} • {lighting}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
