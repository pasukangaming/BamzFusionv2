import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  Zap,
  Layout,
  CheckCircle2,
  Image as ImageIcon,
  Shirt,
  Layers
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult, UserRole } from '../types';
import { transformImages } from '../services/geminiService';

const PRESET_COLORS = [
  { label: 'Deep Blue', value: '#1e40af' },
  { label: 'Success Green', value: '#15803d' },
  { label: 'Royal Purple', value: '#7e22ce' },
  { label: 'Crimson Red', value: '#b91c1c' },
  { label: 'Mustard Gold', value: '#a16207' },
  { label: 'Slate Gray', value: '#334155' },
  { label: 'Forest Green', value: '#065f46' },
  { label: 'Soft Pink', value: '#db2777' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
];

interface ColorSwapperProps {
  onPreview: (url: string) => void;
  userRole?: UserRole;
}

export default function ColorSwapper({ onPreview, userRole }: ColorSwapperProps) {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [colorRefImage, setColorRefImage] = useState<ImageFile | null>(null);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [colorMode, setColorMode] = useState<'image' | 'palette'>('palette');
  const [clothingType, setClothingType] = useState('kaos');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (sourceImage) URL.revokeObjectURL(sourceImage.preview);
      setSourceImage({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      });
      setError(null);
    }
  };

  const handleRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (colorRefImage) URL.revokeObjectURL(colorRefImage.preview);
      setColorRefImage({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      });
      setError(null);
    }
  };

  const removeImage = (type: 'source' | 'ref') => {
    if (type === 'source' && sourceImage) {
      URL.revokeObjectURL(sourceImage.preview);
      setSourceImage(null);
    } else if (type === 'ref' && colorRefImage) {
      URL.revokeObjectURL(colorRefImage.preview);
      setColorRefImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Harap unggah foto sumber.');
      return;
    }
    if (colorMode === 'image' && !colorRefImage) {
      setError('Harap unggah foto referensi warna.');
      return;
    }

    setLoading(true);
    setError(null);

    let colorPrompt = `Change the color of the ${clothingType} in the source image. `;
    if (colorMode === 'image') {
      colorPrompt += `The new color must exactly match the primary color/pattern shown in the provided COLOR REFERENCE image. `;
    } else {
      colorPrompt += `The new color must be exactly hex code ${selectedColor}. `;
    }
    
    colorPrompt += `STRICT INSTRUCTION: Preserve the exact textures, fabric folds, shadows, highlights, and identity of the person. Only change the color of the ${clothingType}. Do not distort the image. High-end professional result.`;

    try {
      const allFiles = [sourceImage.file];
      if (colorMode === 'image' && colorRefImage) {
        allFiles.push(colorRefImage.file);
      }

      const generatedUrls = await transformImages(
        allFiles,
        colorPrompt,
        aspectRatio,
        true // Keep face by default for this tool
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: colorPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah warna pakaian.');
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
             <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
                <Palette className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Color Swapper</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clothing Color Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Source Image */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Sumber
              </label>
              {sourceImage ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                  <img src={sourceImage.preview} alt="Sumber" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onPreview(sourceImage.preview)} className="p-2 bg-indigo-500 text-white rounded-xl">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeImage('source')} className="p-2 bg-red-500 text-white rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group">
                  <Upload className="w-6 h-6 text-slate-600 mb-2 group-hover:text-indigo-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Unggah Foto Utama</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleSourceChange} />
                </label>
              )}
            </div>

            {/* Step 2: Clothing Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Tipe Pakaian
              </label>
              <input 
                type="text"
                placeholder="E.g. kaos, jaket, gaun..."
                value={clothingType}
                onChange={(e) => setClothingType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Step 3: Color Source */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Referensi Warna
              </label>
              
              <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700 mb-3">
                <button 
                  onClick={() => setColorMode('palette')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold transition-all ${colorMode === 'palette' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  <Palette className="w-3.5 h-3.5" /> Palette
                </button>
                <button 
                  onClick={() => setColorMode('image')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold transition-all ${colorMode === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Foto Ref
                </button>
              </div>

              {colorMode === 'palette' ? (
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSelectedColor(c.value)}
                      className={`aspect-square rounded-xl border-2 transition-all hover:scale-105 ${selectedColor === c.value ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                  <div className="relative aspect-square rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center bg-slate-800 group">
                    <input 
                      type="color" 
                      value={selectedColor} 
                      onChange={(e) => setSelectedColor(e.target.value)} 
                      className="absolute inset-0 scale-150 cursor-pointer opacity-0" 
                    />
                    <Palette className="w-5 h-5 text-slate-500 group-hover:text-white" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {colorRefImage ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden group border border-slate-700">
                      <img src={colorRefImage.preview} alt="Referensi" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage('ref')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-video rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 bg-slate-800/20 group">
                      <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-indigo-400" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Foto Referensi Warna</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleRefChange} />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Step 4: Aspect Ratio */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Rasio Hasil
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all ${aspectRatio === r.value ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    {r.value}
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
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-600/20'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse">Memproses Warna...</span>
                </div>
              ) : (
                <div className="relative z-10 items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white" />
                  <span className="font-bold text-lg uppercase tracking-tight">Swap Color</span>
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
                <Palette className="w-12 h-12 text-indigo-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Color Swapper Studio</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Ubah warna pakaian secara instan. Gunakan foto referensi warna dari majalah, atau pilih warna solid favorit Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {[
                    { icon: Shirt, title: "1. Foto Utama", text: "Unggah foto subjek yang mengenakan pakaian yang ingin diubah warnanya." },
                    { icon: Palette, title: "2. Pilih Warna", text: "Gunakan palet warna atau unggah gambar lain sebagai referensi warna/pola." },
                    { icon: Layers, title: "3. Jaga Tekstur", text: "AI akan mendeteksi lipatan kain dan bayangan untuk hasil yang sangat realistis." },
                    { icon: CheckCircle2, title: "4. Hasil 4K", text: "Dapatkan 4 variasi hasil dengan tekstur kain yang tetap terjaga sempurna." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-indigo-400" />
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
              <div className="animate-pulse bg-slate-900/50 rounded-[3rem] p-10 border border-slate-800">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-slate-800 rounded-[2.5rem]" />)}
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
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-square">
                      <img 
                        src={url} 
                        alt={`Color Swap ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`color-swap-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Color Swapper Result</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{clothingType} • {colorMode === 'palette' ? 'Preset Color' : 'Ref Image'}</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] text-indigo-400 font-black uppercase">Identity Protected</span>
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
