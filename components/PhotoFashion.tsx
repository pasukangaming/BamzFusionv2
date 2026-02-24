import React, { useState } from 'react';
import { 
  Shirt, 
  Upload, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  Zap,
  Layout,
  Palette,
  Camera,
  Layers,
  CheckCircle2,
  Maximize2,
  User,
  Package,
  ArrowRight,
  ShieldAlert,
  // Fix: Added missing Sparkles import
  Sparkles
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, generateImagesFromText } from '../services/geminiService';

const PHOTO_TYPES = [
  { id: 'Editorial', label: 'Editorial', desc: 'Majalah & Artistik' },
  { id: 'Catalog', label: 'Katalog', desc: 'Bersih & Komersial' },
  { id: 'Lookbook', label: 'Lookbook', desc: 'Fokus pada Outfit' },
  { id: 'Street Style', label: 'Street Style', desc: 'Urban & Candid' },
  { id: 'Campaign', label: 'Campaign', desc: 'Sinematik & Mewah' },
];

const FABRIC_MATERIALS = [
  { id: 'Silk', label: 'Sutra (Silk)' },
  { id: 'Leather', label: 'Kulit (Leather)' },
  { id: 'Denim', label: 'Denim' },
  { id: 'Velvet', label: 'Velvet' },
  { id: 'Linen', label: 'Linen' },
  { id: 'Wool', label: 'Wol (Wool)' },
];

const LOCATIONS = [
  { id: 'Paris Luxury Suite', label: 'Paris Luxury Suite' },
  { id: 'Milan Street Runway', label: 'Milan Street' },
  { id: 'Minimalist White Studio', label: 'Studio Putih' },
  { id: 'Tokyo Neon Alley', label: 'Tokyo Neon' },
  { id: 'Tropical Resort', label: 'Resort Tropis' },
  { id: 'Industrial Loft', label: 'Loft Industri' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Majalah', value: '3:4' },
  { label: '9:16 Mobile', value: '9:16' },
  { label: '1:1 Sosial', value: '1:1' },
  { label: '4:3 Katalog', value: '4:3' },
];

interface PhotoFashionProps {
  onPreview: (url: string) => void;
}

export default function PhotoFashion({ onPreview }: PhotoFashionProps) {
  const [hasModel, setHasModel] = useState(true);
  const [modelImages, setModelImages] = useState<ImageFile[]>([]);
  const [fashionImages, setFashionImages] = useState<ImageFile[]>([]);
  const [outfitDesc, setOutfitDesc] = useState('');
  const [photoType, setPhotoType] = useState('Editorial');
  const [material, setMaterial] = useState('Silk');
  const [location, setLocation] = useState('Minimalist White Studio');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'fashion') => {
    const files = Array.from(e.target.files || []) as File[];
    const currentCount = type === 'model' ? modelImages.length : fashionImages.length;
    const maxFiles = type === 'model' ? 2 : 3;
    
    if (currentCount + files.length > maxFiles) {
      setError(`Maksimal ${maxFiles} gambar untuk ${type === 'model' ? 'Model' : 'Fashion'}.`);
      return;
    }

    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));

    if (type === 'model') setModelImages(prev => [...prev, ...newImages]);
    else setFashionImages(prev => [...prev, ...newImages]);
    setError(null);
  };

  const removeImage = (id: string, type: 'model' | 'fashion') => {
    const setter = type === 'model' ? setModelImages : setFashionImages;
    setter(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleGenerate = async () => {
    if (hasModel && (modelImages.length === 0 || fashionImages.length === 0)) {
      setError('Harap unggah setidaknya 1 foto model dan 1 foto fashion.');
      return;
    }
    if (!hasModel && fashionImages.length === 0 && !outfitDesc) {
      setError('Harap unggah foto pakaian atau masukkan deskripsi.');
      return;
    }

    setLoading(true);
    setError(null);

    let fashionPrompt = "";
    if (hasModel) {
      fashionPrompt = `A professional ${photoType} fashion photography session. `;
      fashionPrompt += `Instruction: The person from the MODEL images is now wearing the exact outfit and style seen in the FASHION images. `;
      fashionPrompt += `Environment: ${location}. `;
      if (outfitDesc) fashionPrompt += `Outfit Details: ${outfitDesc} made of fine ${material}. `;
      fashionPrompt += `Technical: High-fashion aesthetic, 8k resolution, cinematic lighting, sharp textures. `;
      if (keepFace) {
        fashionPrompt += `CRITICAL: Maintain the exact facial structure and identity of the person from the source images. `;
      }
    } else {
      // Updated logic for 'Hanya Baju' to generate a model wearing the clothes
      fashionPrompt = `Professional ${photoType} fashion photography featuring a realistic human model. `;
      fashionPrompt += `Instruction: Generate a professional model wearing the exact outfit and style seen in the provided FASHION reference images. `;
      fashionPrompt += `Environment: ${location}. `;
      if (outfitDesc) fashionPrompt += `Outfit Details: ${outfitDesc} made of premium ${material}. `;
      fashionPrompt += `Technical: High-fashion aesthetic, realistic human features, professional pose, cinematic studio lighting, 8k resolution, sharp focus on fabric textures.`;
    }

    try {
      const allFiles = [...modelImages.map(i => i.file), ...fashionImages.map(i => i.file)];
      let generatedUrls: string[];

      if (allFiles.length > 0) {
        generatedUrls = await transformImages(
          allFiles,
          fashionPrompt,
          aspectRatio,
          hasModel ? keepFace : false
        );
      } else {
        generatedUrls = await generateImagesFromText(fashionPrompt, aspectRatio);
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: fashionPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto fashion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
                <Shirt className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Photo Fashion</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Style Integration Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Mode Switcher */}
            <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
              <button 
                onClick={() => setHasModel(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${hasModel ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <User className="w-4 h-4" />
                Ganti Wajah
              </button>
              <button 
                onClick={() => setHasModel(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${!hasModel ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Package className="w-4 h-4" />
                Hanya Pakaian
              </button>
            </div>

            {/* Image Inputs */}
            <div className="space-y-5">
              {hasModel && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                    Identity: Foto Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {modelImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                        <img src={img.preview} alt="Model" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => removeImage(img.id, 'model')} className="p-2 bg-red-500 text-white rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {modelImages.length < 2 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group">
                        <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-indigo-400" />
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Tambah</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'model')} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">{hasModel ? '2' : '1'}</span>
                  Style: Referensi Pakaian
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {fashionImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                      <img src={img.preview} alt="Fashion" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeImage(img.id, 'fashion')} className="p-1.5 bg-red-500 text-white rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {fashionImages.length < 3 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group">
                      <Shirt className="w-5 h-5 text-slate-600 mb-1 group-hover:text-indigo-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Baju</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'fashion')} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Configs */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">{hasModel ? '3' : '2'}</span>
                Detail & Konfigurasi
              </label>
              <textarea 
                placeholder="E.g. Gaun sutra melayang dengan motif bunga sakura..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 placeholder:text-slate-600"
                value={outfitDesc}
                onChange={(e) => setOutfitDesc(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-[11px] font-bold text-slate-300"
                >
                  {PHOTO_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <select 
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-[11px] font-bold text-slate-300"
                >
                  {FABRIC_MATERIALS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
              >
                {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>

              {hasModel && (
                <div 
                  onClick={() => setKeepFace(!keepFace)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    keepFace ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className={`w-5 h-5 ${keepFace ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-bold text-slate-300">Identity Guard</span>
                  </div>
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${keepFace ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>
              )}

              {!hasModel && (
                <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-2">
                  {/* Fix: Added missing Sparkles import usage */}
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <p className="text-[9px] text-slate-500 leading-tight">
                    <b>AI Magic:</b> Meskipun hanya pakaian, AI akan men-generate model manusia yang mengenakannya untuk katalog yang lebih realistis.
                  </p>
                </div>
              )}

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
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4.5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/20'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Processing Style...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg uppercase tracking-tight">Generate Results</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                <Shirt className="w-12 h-12 text-indigo-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Photo Fashion Studio</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Logika Integrasi Gaya: Gunakan foto pakaian favorit Anda, dan biarkan AI merender model manusia yang mengenakannya secara instan dalam suasana editorial kelas dunia.
              </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full mt-12 text-left">
                {[
                    { icon: User, title: "1. Mode Ganti Wajah", text: "Unggah foto model target dan baju impian. AI akan memindahkan pakaian tersebut ke model dengan presisi tinggi." },
                    { icon: Package, title: "2. Mode Hanya Baju", text: "Hanya punya foto pakaian? AI akan men-generate model manusia yang serasi untuk memamerkan pakaian Anda." },
                    { icon: Layers, title: "3. Atmosfer Studio", text: "Pilih lokasi dari runway Paris hingga jalanan urban untuk menciptakan kesan profesional sekelas brand ternama." },
                    { icon: CheckCircle2, title: "4. Hasil 8K", text: "Dapatkan 4 variasi foto fashion resolusi tinggi dengan tekstur kain yang tampak nyata dan pencahayaan sinematik." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800/60 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <step.icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-2 text-base">{step.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.text}</p>
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
                     <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 animate-pulse" />
                     <Shirt className="w-24 h-24 relative animate-bounce text-indigo-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-indigo-400">
                        {hasModel ? 'Menyeleraskan Tekstur & Identitas...' : 'Menciptakan Model Visual Baru...'}
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Memetakan struktur kain & detail pencahayaan</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-indigo-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img 
                        src={url} 
                        alt={`Photo Fashion ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Maximize2 className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`fashion-photo-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{photoType} Fashion Render</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{location} • {material}</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     {hasModel ? (
                       keepFace && (
                         <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Face Locked</span>
                         </div>
                       )
                     ) : (
                       <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                          {/* Fix: Added missing Sparkles import usage */}
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Generated Model</span>
                       </div>
                     )}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950 px-4 py-2 rounded-full border border-slate-800 shrink-0">
                    Selesai pukul {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="w-full mt-4 p-3 bg-black/30 rounded-xl border border-white/5">
                     <p className="text-[9px] text-slate-500 italic font-mono line-clamp-1">Prompt: "{result.prompt}"</p>
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
