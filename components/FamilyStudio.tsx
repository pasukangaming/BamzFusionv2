import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
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
  Image as ImageIcon, 
  Sparkles, 
  Home, 
  Tent, 
  PartyPopper, 
  Castle, 
  ShieldCheck, 
  ArrowRight, 
  Maximize, 
  Cpu, 
  Info, 
  Crown, 
  AlertCircle, 
  Crop, 
  Check, 
  X, 
  Plus,
  Fingerprint 
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, transformImagesPro } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Persegi', value: '1:1' },
  { label: '3:4 Potret', value: '3:4' },
  { label: '4:3 Lanskap', value: '4:3' },
  { label: '9:16 Cerita', value: '9:16' },
  { label: '16:9 Sinema', value: '16:9' },
];

const RESOLUTIONS = [
  { id: '1K', label: '1K Standar' },
  { id: '2K', label: '2K High-Def' },
  { id: '4K', label: '4K Ultra-HD' },
];

const FAMILY_THEMES = [
  { id: 'Lebaran/Eid', label: 'Hari Raya / Lebaran', icon: Home, desc: 'Suasana hangat kumpul keluarga di hari raya' },
  { id: 'Holiday Picnic', label: 'Liburan & Piknik', icon: Tent, desc: 'Keluarga santai di alam terbuka' },
  { id: 'Birthday Party', label: 'Pesta Ulang Tahun', icon: PartyPopper, desc: 'Suasana perayaan yang ceria' },
  { id: 'Classic Palace', label: 'Istana / Keraton', icon: Castle, desc: 'Kesan agung dan megah ala kerajaan' },
];

interface FamilyStudioProps {
  onPreview: (url: string) => void;
}

// --- Sub-component: Crop Modal ---
interface CropModalProps {
  file: File;
  onConfirm: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

function CropModal({ file, onConfirm, onCancel }: CropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgUrl] = useState(URL.createObjectURL(file));

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgRef.current) return;

    canvas.width = 512;
    canvas.height = 512;

    const img = imgRef.current;
    const uiSize = window.innerWidth < 640 ? 280 : 300;
    const scaleFactor = 512 / uiSize;
    
    const displayWidth = img.clientWidth * zoom;
    const displayHeight = img.clientHeight * zoom;
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.drawImage(
      img,
      (offset.x - (img.clientWidth * zoom - img.clientWidth) / 2) * scaleFactor,
      (offset.y - (img.clientHeight * zoom - img.clientHeight) / 2) * scaleFactor,
      displayWidth * scaleFactor,
      displayHeight * scaleFactor
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
        onConfirm(croppedFile, canvas.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                 <Crop className="w-4 h-4 text-white" />
              </div>
              <div>
                 <h3 className="font-bold text-white text-sm sm:text-base">Sesuaikan Wajah</h3>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Manual Crop Mode</p>
              </div>
           </div>
           <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 active:scale-90">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 sm:p-8 flex flex-col items-center gap-6 sm:gap-8 overflow-y-auto custom-scrollbar">
           <div 
            ref={containerRef}
            className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-3xl border-2 border-indigo-500/30 overflow-hidden bg-slate-950 cursor-move shadow-inner shrink-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
           >
              <img 
                ref={imgRef}
                src={imgUrl} 
                alt="Crop Target"
                draggable={false}
                className="max-w-none transition-transform duration-75 pointer-events-none origin-center"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: window.innerWidth < 640 ? '-140px' : '-150px',
                  marginLeft: window.innerWidth < 640 ? '-140px' : '-150px'
                }}
              />
              <div className="absolute inset-0 pointer-events-none ring-[100px] ring-black/60" />
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full scale-90 opacity-40 border-dashed" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                 <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg">Face Zone</span>
              </div>
           </div>

           <div className="w-full space-y-5">
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    <span>Zoom Level</span>
                    <span>{(zoom * 100).toFixed(0)}%</span>
                 </div>
                 <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.1" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
              </div>
              <p className="text-[10px] text-slate-500 text-center italic leading-relaxed">Geser foto agar wajah subjek berada tepat di dalam kotak.</p>
           </div>
        </div>

        <div className="p-5 sm:p-6 bg-slate-950/50 border-t border-white/5 grid grid-cols-2 gap-3 sm:gap-4">
           <button 
            onClick={onCancel}
            className="py-3.5 rounded-2xl border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
           >
             Batal
           </button>
           <button 
            onClick={handleSave}
            className="py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
           >
             <Check className="w-4 h-4" /> Simpan
           </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function FamilyStudio({ onPreview }: FamilyStudioProps) {
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('pro'); 
  const [images, setImages] = useState<ImageFile[]>([]);
  const [theme, setTheme] = useState('Lebaran/Eid');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Cropper State
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileToCrop, setCurrentFileToCrop] = useState<File | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsConnected(hasKey);
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (engineMode === 'standard' && imageSize !== '1K') {
      setImageSize('1K');
    }
  }, [engineMode]);

  useEffect(() => {
    if (pendingFiles.length > 0 && !currentFileToCrop) {
      setCurrentFileToCrop(pendingFiles[0]);
    }
  }, [pendingFiles, currentFileToCrop]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsConnected(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (images.length + files.length > 5) {
      setError('Maksimal 5 foto anggota keluarga.');
      return;
    }
    setPendingFiles(prev => [...prev, ...files]);
    setError(null);
  };

  const handleCropConfirm = (croppedFile: File, previewUrl: string) => {
    const newImage: ImageFile = {
      id: Math.random().toString(36).substring(7),
      file: croppedFile,
      preview: previewUrl
    };
    setImages(prev => [...prev, newImage]);
    setPendingFiles(prev => prev.slice(1));
    setCurrentFileToCrop(null);
  };

  const handleCropCancel = () => {
    setPendingFiles(prev => prev.slice(1));
    setCurrentFileToCrop(null);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleGenerate = async () => {
    if (engineMode === 'pro' && !isConnected) {
      handleOpenKey();
      return;
    }

    if (images.length === 0) {
      setError('Harap unggah setidaknya satu foto anggota keluarga.');
      return;
    }

    setLoading(true);
    setError(null);

    let familyPrompt = `ULTRA-REALISTIC NATURAL FAMILY PHOTOGRAPHY. Theme: ${theme}. `;
    familyPrompt += `SUBJECT MAPPING: We are providing ${images.length} distinct identities. `;
    
    images.forEach((_, idx) => {
      familyPrompt += `Identity Source ${idx + 1} represents a unique member of the family. `;
    });

    familyPrompt += `
    STRICT IDENTITY PROTOCOL:
    1. ZERO-MORPHING: Each person in the generated group MUST exactly match ONE of the provided source images. Do not mix or blend facial features between members.
    2. ANATOMICAL FIDELITY: Maintain the original bone structure, eye geometry, and facial proportions of each individual subject. 
    3. NATURALISM: Preserver original skin textures and tones. NO AI PLASTIC LOOK. Maintain natural expressions and aging markers.
    4. Pose: Natural and candid family group pose, realistic interactions, professional lighting that casts natural shadows.
    `;
    
    if (customPrompt) familyPrompt += `Additional Scene Details: ${customPrompt}. `;
    
    familyPrompt += "Visual Style: Professional 85mm portrait photography, cinematic studio lighting, sharp focus on all family members, photorealistic 8k grain.";

    try {
      let generatedUrls: string[];

      if (engineMode === 'pro') {
        generatedUrls = await transformImagesPro(
          images.map(img => img.file),
          familyPrompt,
          aspectRatio,
          imageSize,
          true
        );
      } else {
        generatedUrls = await transformImages(
          images.map(img => img.file),
          familyPrompt,
          aspectRatio,
          true 
        );
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: familyPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      if (engineMode === 'pro' && err.message?.includes("Requested entity was not found")) {
        setIsConnected(false);
        setError("Koneksi Pro terputus. Silakan hubungkan kembali API Key Anda.");
      } else {
        setError(err.message || 'Terjadi kesalahan saat menghasilkan foto.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Modal Cropper */}
      {currentFileToCrop && (
        <CropModal 
          file={currentFileToCrop}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-800 p-6 md:p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 md:max-h-[85vh] md:overflow-y-auto custom-scrollbar">
          
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Akurasi Kemiripan</label>
             <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700">
                <button 
                  onClick={() => setEngineMode('standard')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'standard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Cpu className="w-4 h-4" />
                  Standard
                </button>
                <button 
                  onClick={() => setEngineMode('pro')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${engineMode === 'pro' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Crown className="w-4 h-4" />
                  Ultra Pro (Best)
                </button>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-2xl shadow-lg ${engineMode === 'pro' ? 'bg-orange-600 shadow-orange-600/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}>
                <Users className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Foto Keluarga</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Individual Identity Mapping</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                  Unggah Wajah Anggota (1-5)
                </label>
                <span className="text-[9px] font-black text-indigo-400">{images.length}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Member" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-2 bg-red-500 text-white rounded-xl active:scale-90 transition-transform">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group active:scale-95">
                    <Plus className="w-6 h-6 text-slate-600 mb-1 group-hover:text-indigo-400" />
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex gap-3">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  <b>Natural Fix:</b> Gunakan fitur manual crop agar wajah terlihat besar dan jelas. Ini membantu AI mengenali identitas asli anggota keluarga tanpa merubahnya menjadi orang lain.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Pilih Suasana
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {FAMILY_THEMES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                        theme === t.id 
                        ? (engineMode === 'pro' ? 'bg-orange-500/10 border-orange-500/50' : 'bg-indigo-500/10 border-indigo-500/50') 
                        : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${theme === t.id ? (engineMode === 'pro' ? 'bg-orange-500 text-white' : 'bg-indigo-500 text-white') : 'bg-slate-700 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-black uppercase tracking-tight ${theme === t.id ? (engineMode === 'pro' ? 'text-orange-400' : 'text-indigo-400') : 'text-slate-300'}`}>{t.label}</div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Konfigurasi Hasil
              </label>
              
              <textarea 
                placeholder="Detail tambahan agar lebih natural (E.g. Senyum tipis alami, baju muslimah modern, pencahayaan lembut...)"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-slate-600 uppercase pl-1 tracking-widest">Resolusi</span>
                    <div className="grid grid-cols-1 gap-2">
                       {RESOLUTIONS.map(res => (
                         <button
                          key={res.id}
                          disabled={engineMode === 'standard' && res.id !== '1K'}
                          onClick={() => setImageSize(res.id as any)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${imageSize === res.id ? (engineMode === 'pro' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-indigo-600 border-indigo-400 text-white') : 'bg-slate-800 border-slate-700 text-slate-500 disabled:opacity-20'}`}
                         >
                           {res.label}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-2.5">
                    <span className="text-[9px] font-black text-slate-600 uppercase pl-1 tracking-widest">Rasio</span>
                    <div className="grid grid-cols-2 gap-2">
                      {RATIOS.map(r => (
                        <button
                          key={r.value}
                          onClick={() => setAspectRatio(r.value)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${aspectRatio === r.value ? (engineMode === 'pro' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-indigo-600 border-indigo-400 text-white') : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                        >
                          {r.value}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {engineMode === 'pro' && !isConnected && (
              <button 
                onClick={handleOpenKey}
                className="w-full mb-4 py-4 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex items-center justify-center gap-3 group transition-all active:scale-95"
              >
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                   <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Wajib API Key Pro</div>
                   <div className="text-[8px] text-amber-500/60 uppercase font-bold">Butuh Model Pro untuk Keluarga</div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 ml-auto mr-4" />
              </button>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-2xl font-black uppercase tracking-wider flex items-start gap-3">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] py-6 transition-all active:scale-95 shadow-2xl ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : (engineMode === 'pro' 
                   ? 'bg-gradient-to-r from-orange-600 to-indigo-600 text-white shadow-orange-900/20' 
                   : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20')
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Loader2 className={`w-8 h-8 animate-spin mb-1 ${engineMode === 'pro' ? 'text-orange-400' : 'text-white'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest animate-pulse">Menghasilkan Foto Natural...</span>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 mb-0.5">
                    <Zap className="w-6 h-6 fill-white" />
                    <span className="font-black text-xl uppercase tracking-tighter">Render Foto Keluarga</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Fidelity Identity Locked</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] md:rounded-[4rem] p-8 md:p-20 min-h-[60vh] md:min-h-[75vh] relative overflow-hidden items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
            <div className="flex flex-col items-center text-center mb-12 md:mb-16 relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Users className={`w-10 h-10 md:w-12 md:h-12 ${engineMode === 'pro' ? 'text-orange-500' : 'text-indigo-500'}`} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Family Identity Sync</h2>
              <p className="text-slate-500 max-w-xl text-sm md:text-lg font-medium leading-relaxed">
                Kami telah meningkatkan algoritma untuk memastikan wajah anggota keluarga Anda tetap **100% natural**. Gunakan <b>Ultra Pro Mode</b> untuk presisi biometrik terbaik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: ShieldCheck, title: "100% Likeness Lock", text: "AI dilarang mengubah struktur wajah. Setiap foto anggota keluarga dijaga identitasnya secara terpisah (No-Morphing)." },
                    { icon: UserCheck, title: "Authentic Skin Texture", text: "Menjaga tekstur kulit asli tanpa efek airbrush berlebihan, sehingga hasil terlihat seperti foto nyata, bukan editan AI." },
                    { icon: Maximize, title: "Group Sync Pro", text: "Menyelaraskan pencahayaan dan bayangan pada seluruh anggota grup agar menyatu sempurna dengan latar belakang." },
                    { icon: CheckCircle2, title: "Individual Mapping", text: "Setiap wajah diproses sebagai entitas identitas unik, menjamin tidak ada wajah yang tertukar atau tercampur." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 md:p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-indigo-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${engineMode === 'pro' ? 'text-orange-400' : 'text-indigo-400'}`} />
                        </div>
                        <h3 className="font-black text-indigo-50 mb-2 md:mb-3 text-base md:text-lg uppercase tracking-tight">{step.title}</h3>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className={`relative bg-slate-900/40 border border-white/5 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square max-w-2xl mx-auto'}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10">
                    <div className="relative">
                       <div className={`absolute inset-0 blur-[80px] opacity-20 animate-pulse ${engineMode === 'pro' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
                       <Fingerprint className={`w-20 h-20 md:w-24 md:h-24 relative animate-pulse ${engineMode === 'pro' ? 'text-orange-500/30' : 'text-indigo-500/30'}`} />
                    </div>
                    <div className="text-center space-y-4">
                      <p className={`font-black text-xl md:text-2xl tracking-tighter uppercase italic animate-pulse ${engineMode === 'pro' ? 'text-orange-400' : 'text-indigo-400'}`}>
                        {engineMode === 'pro' ? 'Sinkronisasi Biometrik Anggota...' : 'Menyusun Foto Kebersamaan...'}
                      </p>
                      <div className="flex justify-center gap-2">
                         {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 ${idx === 0 ? (engineMode === 'pro' ? 'ring-2 ring-orange-500/20 shadow-[0_20px_50px_rgba(249,115,22,0.1)]' : 'ring-2 ring-indigo-500/20 shadow-[0_10px_20px_rgba(79,70,229,0.1)]') : ''}`}
              >
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 shadow-inner">
                      <img 
                        src={url} 
                        alt={`Family ${engineMode} ${vIdx + 1}`} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 left-4 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <ShieldCheck className={`w-3.5 h-3.5 ${engineMode === 'pro' ? 'text-orange-400' : 'text-indigo-400'}`} />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Natural Identity OK</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className={`p-4 rounded-full text-white transition-all shadow-xl hover:scale-110 active:scale-95 ${engineMode === 'pro' ? 'bg-orange-600' : 'bg-indigo-600'}`}
                        >
                          <ImageIcon className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`family-natural-${engineMode}-${vIdx}.png`}
                          className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Download className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-8 md:p-10 bg-gradient-to-b from-transparent to-black/40 border-t border-slate-800 flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`${engineMode === 'pro' ? 'bg-orange-500' : 'bg-indigo-600'} text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
                        {engineMode === 'pro' ? 'Ultra Pro (Natural)' : 'Standard'}
                      </div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{imageSize} • {theme}</span>
                      <div className="h-4 w-px bg-slate-700 hidden sm:block" />
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${engineMode === 'pro' ? 'text-orange-400' : 'text-indigo-400'}`}>
                         <UserCheck className="w-4 h-4" /> Likeness Guaranteed
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950/50 px-5 py-2.5 rounded-full border border-slate-800 shrink-0 uppercase tracking-widest">
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