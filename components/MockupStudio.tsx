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
  Monitor,
  Shirt,
  Phone,
  Gamepad2,
  Megaphone,
  CreditCard,
  Layers,
  Palette,
  Camera
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const PRODUCT_TYPES = [
  { id: 'T-Shirt', label: 'Apparel: Kaos', icon: Shirt, desc: 'Kaos katun premium' },
  { id: 'Hoodie', label: 'Apparel: Hoodie', icon: Shirt, desc: 'Hoodie oversize estetik' },
  { id: 'iPhone', label: 'Gadget: iPhone', icon: Phone, desc: 'Tampilan aplikasi di layar HP' },
  { id: 'MacBook', label: 'Gadget: Laptop', icon: Monitor, desc: 'Website/Software di MacBook' },
  { id: 'Billboard', label: 'Ads: Baliho', icon: Megaphone, desc: 'Iklan jalanan kota besar' },
  { id: 'Business Card', label: 'Print: Kartu Nama', icon: CreditCard, desc: 'Tumpukan kartu nama elegan' },
  { id: 'Poster', label: 'Print: Poster', icon: Layers, desc: 'Poster di dinding galeri' },
  { id: 'Coffee Cup', label: 'F&B: Gelas Kopi', icon: Sparkles, desc: 'Paper cup kafe kekinian' },
];

const SCENES = [
  { id: 'Clean Studio', label: 'Studio Bersih', desc: 'Minimalis dengan bayangan lembut' },
  { id: 'Urban Cityscape', label: 'Jalanan Kota', desc: 'Latar belakang urban dan sibuk' },
  { id: 'Luxury Interior', label: 'Interior Mewah', desc: 'Ruangan kantor atau hotel' },
  { id: 'Natural Light', label: 'Cahaya Alami', desc: 'Di taman atau dekat jendela' },
  { id: 'Creative Abstract', label: 'Artistik Abstrak', desc: 'Latar belakang penuh warna' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Square', value: '1:1' },
  { label: '3:4 Portrait', value: '3:4' },
  { label: '16:9 Cinema', value: '16:9' },
  { label: '4:3 Catalog', value: '4:3' },
];

interface MockupStudioProps {
  onPreview: (url: string) => void;
}

export default function MockupStudio({ onPreview }: MockupStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [productType, setProductType] = useState('T-Shirt');
  const [scene, setScene] = useState('Clean Studio');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar desain/logo didukung.');
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
      setError('Harap unggah setidaknya satu desain/logo Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    let mockupPrompt = `A high-end professional commercial mockup photography. `;
    mockupPrompt += `Objective: Place the provided graphic design/logo from the reference images onto a ${productType}. `;
    mockupPrompt += `Setting: The product is presented in a ${scene} environment. `;
    
    if (customPrompt) mockupPrompt += `Atmosphere Detail: ${customPrompt}. `;
    
    mockupPrompt += "CRITICAL INSTRUCTION: The graphic from the source images must be applied realistically to the product's surface, following its contours, fabric folds, and lighting. Do not alter the logo design, only integrate it perfectly. ";
    mockupPrompt += "Visual Style: Professional advertising standards, cinematic lighting, sharp focus on the product, 8k resolution, photorealistic textures.";

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        mockupPrompt,
        aspectRatio,
        false // Not a face-consistency task
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: mockupPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan mockup.');
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
             <div className="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-600/30">
                <Monitor className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Mockup Studio</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Brand Showcase Forge</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Design Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Desain / Logo Anda (1-5)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Design" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-violet-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Product Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Pilih Produk
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCT_TYPES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProductType(p.id)}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all text-left ${productType === p.id ? 'bg-violet-600/10 border-violet-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${productType === p.id ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        <p.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-[11px] font-bold ${productType === p.id ? 'text-violet-400' : 'text-slate-300'}`}>{p.label}</div>
                      <div className="text-[9px] opacity-60">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Scene */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Pilih Latar / Suasana
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SCENES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setScene(s.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${scene === s.id ? 'bg-violet-600/10 border-violet-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className="text-left">
                      <div className={`text-[11px] font-bold ${scene === s.id ? 'text-violet-400' : 'text-slate-300'}`}>{s.label}</div>
                      <div className="text-[9px] opacity-70">{s.desc}</div>
                    </div>
                    {scene === s.id && <CheckCircle2 className="w-4 h-4 text-violet-500" />}
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
                placeholder="E.g. Tambahkan efek embos, letakkan di atas meja kayu gelap, pencahayaan dramatis..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              
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
                : 'bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white shadow-xl shadow-violet-900/40 border border-violet-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-white">Merender Mockup Realistis...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate Mockup</span>
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
             <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Monitor className="w-12 h-12 text-violet-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Professional Mockup AI</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Tampilkan hasil karya Anda pada produk nyata secara profesional. Cukup unggah logo atau desain, pilih media, dan biarkan AI kami melakukan tugas render yang kompleks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: Palette, title: "1. Upload Desain", text: "Gunakan logo (PNG/JPG) atau desain grafis apa pun. AI akan menempelkannya dengan presisi tekstur." },
                    { icon: Shirt, title: "2. Media Fisik", text: "Pilih dari kategori Kaos, iPhone, Baliho, hingga Gelas Kopi untuk mempresentasikan branding Anda." },
                    { icon: Camera, title: "3. Kontur Realistis", text: "AI akan mendeteksi lipatan kain, pantulan layar, dan bayangan untuk hasil yang tampak sangat nyata." },
                    { icon: CheckCircle2, title: "4. Kualitas Presentasi", text: "Dapatkan 4 variasi hasil 8K yang siap digunakan untuk portofolio atau materi pemasaran Anda." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-violet-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-violet-400" />
                        </div>
                        <h3 className="font-bold text-violet-50 mb-3 text-lg">{step.title}</h3>
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
                     <div className="absolute inset-0 bg-violet-500 blur-[80px] opacity-20 animate-pulse" />
                     <Monitor className="w-24 h-24 relative animate-bounce text-violet-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-violet-400">
                        Mengintegrasikan Desain Anda...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Memetakan tekstur media & kontur objek</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-violet-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-square">
                      <img 
                        src={url} 
                        alt={`Mockup Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-violet-600 text-white p-4 rounded-full hover:bg-violet-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`mockup-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Mockup Master Render</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{productType} @ {scene}</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     <div className="flex items-center gap-2 bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20">
                        <Layers className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] text-violet-400 font-black uppercase">Texture Mapped</span>
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