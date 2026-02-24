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
  Box,
  MapPin,
  Camera,
  Layers,
  Palette,
  Maximize2,
  Shapes,
  Sun,
  Dices
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const QUICK_PRESETS = [
  { 
    id: 'claymation-magic', 
    label: 'Claymation World', 
    style: 'Claymation World', 
    lighting: 'Bright Studio',
    prompt: 'Add visible clay thumbprints, tactile textures, and soft-sculpted details. Make everything look like real modeling clay.',
    color: 'bg-orange-500'
  },
  { 
    id: 'toy-box', 
    label: 'Miniature Toy', 
    style: 'Plastic Toy Model', 
    lighting: 'Macro Flash',
    prompt: 'Add high-gloss plastic reflections, tiny molded seams, and vibrant primary colors.',
    color: 'bg-blue-500'
  },
  { 
    id: 'diorama-tilt', 
    label: 'Tilt-Shift Pro', 
    style: 'Tilt-Shift Diorama', 
    lighting: 'Golden Hour',
    prompt: 'Extreme shallow depth of field, focused on the subjects, miniature scale atmospheric effects.',
    color: 'bg-indigo-500'
  },
];

const MINIATURE_STYLES = [
  { id: 'Tilt-Shift Diorama', label: 'Tilt-Shift Diorama', desc: 'Efek optik dunia kecil yang nyata' },
  { id: 'Claymation World', label: 'Claymation World', desc: 'Gaya animasi tanah liat/lempung' },
  { id: 'Plastic Toy Model', label: 'Plastic Toy Model', desc: 'Bahan plastik mengkilap seperti mainan' },
  { id: 'Isometric Lego', label: 'Gaya Balok / Lego', desc: 'Terstruktur seperti mainan bongkar pasang' },
  { id: 'Cardboard Craft', label: 'Cardboard Craft', desc: 'Dibuat dari kardus dan kertas lipat' },
];

const LIGHTING_OPTIONS = [
  { id: 'Bright Studio', label: 'Bright Studio', desc: 'Pencahayaan studio lembut' },
  { id: 'Golden Hour', label: 'Golden Hour', desc: 'Hangat dan dramatis' },
  { id: 'Macro Flash', label: 'Macro Flash', desc: 'Fokus tajam pada detail kecil' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Square', value: '1:1' },
  { label: '4:3 Klasik', value: '4:3' },
  { label: '16:9 Cinema', value: '16:9' },
  { label: '9:16 Story', value: '9:16' },
];

interface MiniatureStudioProps {
  onPreview: (url: string) => void;
}

export default function MiniatureStudio({ onPreview }: MiniatureStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [style, setStyle] = useState('Tilt-Shift Diorama');
  const [lighting, setLighting] = useState('Bright Studio');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setStyle(preset.style);
    setLighting(preset.lighting);
    setCustomPrompt(preset.prompt);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar referensi didukung.');
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
      setError('Harap unggah setidaknya satu foto yang ingin diubah.');
      return;
    }

    setLoading(true);
    setError(null);

    let miniaturePrompt = `Transform this scene into a high-quality miniature model diorama. `;
    miniaturePrompt += `Artistic Style: ${style}. Lighting: ${lighting}. `;
    
    if (style === 'Tilt-Shift Diorama') {
      miniaturePrompt += "The image should have a strong tilt-shift photography effect with shallow depth of field, making real-life objects look like tiny toys. ";
    } else if (style === 'Claymation World') {
      miniaturePrompt += "Everything in the scene should look like it is handmade from modeling clay (plasticine), with visible tactile textures, small imperfections, and thumbprint-like details. ";
    }

    if (customPrompt) miniaturePrompt += `Additional instructions: ${customPrompt}. `;
    
    miniaturePrompt += "Visual Qualities: Ultra-high saturation, professional macro photography lighting, extremely detailed small-scale textures, toy-like materials, 8k resolution, crisp focus on the subjects with cinematic bokeh. ";
    miniaturePrompt += "Preserve the original composition from the source images but rethink them as handcrafted miniature assets.";

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        miniaturePrompt,
        aspectRatio,
        false
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: miniaturePrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto miniatur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 md:p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Shapes className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Dunia Mini AI</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Miniature & Diorama Studio</p>
             </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Quick Presets</label>
             <div className="grid grid-cols-1 gap-2">
                {QUICK_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all group text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${preset.color} flex items-center justify-center shrink-0 shadow-lg`}>
                       <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                       <div className="text-[11px] font-bold text-slate-200">{preset.label}</div>
                       <div className="text-[9px] text-slate-500 uppercase font-black">Pre-fill Config</div>
                    </div>
                    <Dices className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Sumber (1-5)
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-cyan-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Style Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Gaya Miniatur
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {MINIATURE_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${style === s.id ? 'bg-cyan-600/10 border-cyan-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div>
                       <div className={`text-[11px] font-bold ${style === s.id ? 'text-cyan-400' : 'text-slate-300'}`}>{s.label}</div>
                       <div className="text-[9px] opacity-70 mt-0.5 line-clamp-1">{s.desc}</div>
                    </div>
                    {style === s.id && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Lighting */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Pencahayaan
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {LIGHTING_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLighting(opt.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${lighting === opt.id ? 'bg-cyan-600/10 border-cyan-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className={`w-3.5 h-3.5 ${lighting === opt.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <div>
                        <div className={`text-[11px] font-bold ${lighting === opt.id ? 'text-cyan-400' : 'text-slate-300'}`}>{opt.label}</div>
                        <div className="text-[9px] opacity-70 line-clamp-1">{opt.desc}</div>
                      </div>
                    </div>
                    {lighting === opt.id && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
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
                placeholder="E.g. Tambahkan detail tekstur tanah liat yang terlihat, sidik jari kecil..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 placeholder:text-slate-600 transition-all"
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
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-xl shadow-cyan-900/40 border border-cyan-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Merender Miniatur...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate Mini</span>
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
             <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Box className="w-12 h-12 text-cyan-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 leading-tight">Dunia Mini AI Studio</h2>
              <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                Ubah pemandangan kota, kendaraan, hingga interior ruangan menjadi miniatur yang menggemaskan. Gunakan teknologi AI untuk menciptakan visual diorama yang nyata.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: Camera, title: "1. Foto Objek", text: "Gunakan foto pemandangan, mobil, atau rumah yang memiliki sudut pandang agak tinggi untuk hasil terbaik." },
                    { icon: Layers, title: "2. Efek Tilt-Shift", text: "AI akan memfokuskan bagian tengah dan memburamkan bagian atas-bawah untuk menciptakan kesan optik benda kecil." },
                    { icon: Palette, title: "3. Tekstur Unik", text: "Pilih gaya Claymation untuk tampilan tanah liat atau Plastic Model untuk kesan mainan mengkilap." },
                    { icon: CheckCircle2, title: "4. Kualitas 8K", text: "Dapatkan 4 variasi hasil foto beresolusi tinggi dengan warna yang kontras dan tajam sekelas studio profesional." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-cyan-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-3 text-lg">{step.title}</h3>
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
                     <div className="absolute inset-0 bg-cyan-500 blur-[80px] opacity-20 animate-pulse" />
                     <Box className="w-24 h-24 relative animate-bounce text-cyan-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic animate-pulse text-cyan-400">
                        {style === 'Claymation World' ? 'Membentuk Adonan Lempung...' : 'Menyusun Diorama Kecil...'}
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Mengatur depth of field & saturasi warna</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-cyan-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-square">
                      <img 
                        src={url} 
                        alt={`Miniature Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-cyan-600 text-white p-4 rounded-full hover:bg-cyan-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`miniature-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Miniature World Rendered</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{style} • {lighting} Mood</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">Master Studio Quality</span>
                     </div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950 px-4 py-2 rounded-full border border-slate-800">{new Date(result.timestamp).toLocaleTimeString()}</div>
                  <div className="w-full mt-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                     <p className="text-[10px] text-slate-400 italic font-mono leading-relaxed line-clamp-1">Prompt: "{result.prompt}"</p>
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
