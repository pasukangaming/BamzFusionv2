
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
  Lamp,
  Home,
  Monitor,
  Palette,
  Camera,
  Layers,
  ArrowRight,
  Maximize2,
  // Added missing Info import from lucide-react
  Info
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const INTERIOR_STYLES = [
  { id: 'Modern Scandinavian', label: 'Scandinavian', desc: 'Minimalis, kayu terang, dan fungsional' },
  { id: 'Industrial Loft', label: 'Industrial', desc: 'Dinding bata, aksen logam, dan rustic' },
  { id: 'Japandi Style', label: 'Japandi', desc: 'Perpaduan Jepang & Skandinavia yang tenang' },
  { id: 'Bohemian Chic', label: 'Bohemian', desc: 'Penuh tekstur, tanaman, dan warna bumi' },
  { id: 'Modern Luxury', label: 'Modern Luxury', desc: 'Elegan, marmer, dan aksen emas' },
  { id: 'Minimalist Zen', label: 'Minimalis Zen', desc: 'Sangat bersih dan mengutamakan ketenangan' },
];

const ROOM_TYPES = [
  { id: 'Living Room', label: 'Ruang Tamu' },
  { id: 'Bedroom', label: 'Kamar Tidur' },
  { id: 'Kitchen', label: 'Dapur' },
  { id: 'Office Workspace', label: 'Ruang Kerja' },
  { id: 'Dining Room', label: 'Ruang Makan' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '16:9 Cinema', value: '16:9' },
  { label: '4:3 Classic', value: '4:3' },
  { label: '1:1 Square', value: '1:1' },
  { label: '9:16 Mobile', value: '9:16' },
];

interface InteriorStudioProps {
  onPreview: (url: string) => void;
}

export default function InteriorStudio({ onPreview }: InteriorStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [style, setStyle] = useState('Modern Scandinavian');
  const [roomType, setRoomType] = useState('Living Room');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar referensi sudut ruangan.');
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
      setError('Harap unggah foto ruangan Anda terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);

    let interiorPrompt = `PROFESSIONAL INTERIOR DESIGN TRANSFORMATION. `;
    interiorPrompt += `Room Type: ${roomType}. Desired Style: ${style}. `;
    interiorPrompt += `Task: Re-design the interior of the provided room(s) into the ${style} aesthetic. `;
    interiorPrompt += `Instructions: Replace all furniture, wall textures, floorings, and lighting to match the ${style} style perfectly. `;
    
    if (customPrompt) interiorPrompt += `Additional Requirements: ${customPrompt}. `;
    
    interiorPrompt += "CRITICAL: Maintain the exact spatial architecture, window positions, and structural walls from the reference images. Only change the decorative elements and surface materials. ";
    interiorPrompt += "Visual Style: Photorealistic architecture photography, high-end real estate lighting, sharp focus, 8k resolution.";

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        interiorPrompt,
        aspectRatio,
        false
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: interiorPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal merancang interior ruangan.');
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
                <Lamp className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Interior Studio</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Architectural Vision AI</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Ruangan (1-5)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Room" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-amber-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Room & Style */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Tipe & Gaya Desain
              </label>
              <div className="grid grid-cols-1 gap-2">
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
                >
                  {ROOM_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <div className="grid grid-cols-1 gap-1.5">
                  {INTERIOR_STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${style === s.id ? 'bg-amber-600/10 border-amber-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      <div>
                        <div className={`text-[11px] font-bold ${style === s.id ? 'text-amber-400' : 'text-slate-300'}`}>{s.label}</div>
                        <div className="text-[9px] opacity-60">{s.desc}</div>
                      </div>
                      {style === s.id && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Prompt & Ratio */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Detail Tambahan & Rasio
              </label>
              <textarea 
                placeholder="E.g. Tambahkan sofa beludru hijau, lukisan abstrak di dinding, lantai parket kayu gelap..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />

              <div className="grid grid-cols-4 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`px-1 py-2.5 rounded-xl text-[9px] font-bold border transition-all ${
                      aspectRatio === r.value ? 'bg-white border-white text-slate-900 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
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
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4.5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-xl shadow-amber-900/40 border border-amber-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse text-white">Merancang Ruang Baru...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Render Interior</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Lamp className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Interior Design AI</h2>
              <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                Ubah suasana ruangan Anda secara instan tanpa perlu renovasi fisik. Unggah foto ruangan Anda, pilih gaya dekorasi, dan lihat transformasi visualnya dalam hitungan detik.
              </p>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-8 min-h-[50vh]">
                  <div className="relative">
                     <div className="absolute inset-0 bg-amber-500 blur-[80px] opacity-20 animate-pulse" />
                     <Home className="w-24 h-24 relative animate-bounce text-amber-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-amber-400">
                        Memvisualisasikan Desain...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Memetakan pencahayaan & furnitur baru</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div key={result.timestamp} className="bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-video">
                      <img src={url} alt="Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Master Design</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => onPreview(url)} className="bg-amber-600 text-white p-4 rounded-full hover:bg-amber-500 transition-all shadow-xl hover:scale-110 active:scale-95"><Eye className="w-6 h-6" /></button>
                        <a href={url} download={`interior-${vIdx + 1}.png`} className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"><Download className="w-6 h-6" /></a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 bg-slate-900/95 border-t border-slate-800 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Interior Rendering Successful</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{style} Style • {roomType}</span>
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
