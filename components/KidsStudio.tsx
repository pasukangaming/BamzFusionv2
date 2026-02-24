
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Download,
  Zap,
  CheckCircle2,
  PartyPopper,
  ShieldCheck,
  Camera,
  Fingerprint,
  Crop,
  X,
  Check,
  Cpu,
  Crown,
  ArrowRight,
  Maximize2,
  Plus,
  BabyIcon,
  Smile,
  Palette,
  Briefcase,
  Box,
  BoxSelect,
  RefreshCw,
  MapPin,
  Trees,
  Home,
  Castle,
  Gamepad2,
  Type,
  Users,
  Settings2,
  PenTool,
  Shirt
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, transformImagesPro } from '../services/geminiService';

const LOADING_MESSAGES = [
  "Inisialisasi Studio Pintar...",
  "Menganalisis Biometrik Wajah Si Kecil...",
  "Menyesuaikan Kostum & Adat...",
  "Menyusun Tata Cahaya Studio...",
  "Merender Detail Tekstur...",
  "Sinkronisasi Identitas Wajah...",
  "Mempersembahkan Hasil Terbaik..."
];

const BACKGROUND_OPTIONS = [
  { id: 'Studio Clean', label: 'Studio Minimalis', icon: Camera, desc: 'Polos profesional' },
  { id: 'Fantasy Castle', label: 'Istana Megah', icon: Castle, desc: 'Latar kerajaan' },
  { id: 'Playground', label: 'Taman Bermain', icon: Gamepad2, desc: 'Suasana ceria' },
  { id: 'Nature Forest', label: 'Alam Terbuka', icon: Trees, desc: 'Asri & sejuk' },
  { id: 'Luxury Home', label: 'Interior Mewah', icon: Home, desc: 'Ruangan estetik' },
];

const THEME_GROUPS = {
  baby: [
    {
      label: "Utama",
      items: [
        { id: "Tanpa Tema", label: "Tanpa Tema", desc: "Pakaian asli foto", icon: Shirt },
      ]
    },
    {
      label: "Budaya & Adat",
      items: [
        { id: "Baby Jawa", label: "Adat Jawa", desc: "Beskap/Kebaya" },
        { id: "Baby Sunda", label: "Adat Sunda", desc: "Kebaya & Samping" },
        { id: "Baby Minang", label: "Adat Minang", desc: "Suntiang mini" },
        { id: "Baby Aceh", label: "Adat Aceh", desc: "Meukasah kecil" },
        { id: "Baby Bugis", label: "Adat Bugis", desc: "Baju Bodo imut" },
        { id: "Baby Betawi", label: "Adat Betawi", desc: "Abang None cilik" },
        { id: "Baby Papua", label: "Adat Papua", desc: "Hiasan Kepala" },
        { id: "Baby Dayak", label: "Adat Dayak", desc: "Manik-manik" },
      ]
    },
    {
      label: "Profesi Cilik",
      items: [
        { id: "Baby Doctor", label: "Dokter Cilik", desc: "Jas & Stetoskop" },
        { id: "Baby Chef", label: "Koki Cilik", desc: "Topi & Celemek" },
        { id: "Baby Pilot", label: "Pilot Cilik", desc: "Seragam Kapten" },
        { id: "Baby TNI", label: "Tentara (TNI)", desc: "Loreng Gagah" },
        { id: "Baby Firefighter", label: "Damkar", desc: "Pahlawan Api" },
        { id: "Baby Scientist", label: "Ilmuwan", desc: "Jas Lab & Kacamata" },
      ]
    }
  ],
  kids: [
    {
      label: "Utama",
      items: [
        { id: "Tanpa Tema", label: "Tanpa Tema", desc: "Pakaian asli foto", icon: Shirt },
      ]
    },
    {
      label: "Adat & Budaya",
      items: [
        { id: "Adat Jawa Anak", label: "Adat Jawa", desc: "Beskap / Kebaya" },
        { id: "Adat Bali Anak", label: "Adat Bali", desc: "Udeng & Kamen" },
        { id: "Adat Minang Anak", label: "Adat Minang", desc: "Baju Suntiang" },
        { id: "Adat Papua Anak", label: "Adat Papua", desc: "Rumbai & Mahkota" },
        { id: "Adat Dayak Anak", label: "Adat Dayak", desc: "Kostum Perang" },
        { id: "Adat Betawi Anak", label: "Adat Betawi", desc: "Abang None" },
        { id: "Adat Aceh Anak", label: "Adat Aceh", desc: "Meukasah Lengkap" },
        { id: "Adat Bugis Anak", label: "Adat Bugis", desc: "Baju Bodo" },
      ]
    },
    {
      label: "Profesi Impian",
      items: [
        { id: "Astronaut Kid", label: "Astronaut", desc: "Luar Angkasa" },
        { id: "Police Kid", label: "Polisi", desc: "Seragam Gagah" },
        { id: "Pilot Kid", label: "Pilot", desc: "Kapten Pesawat" },
        { id: "Scientist Kid", label: "Ilmuwan", desc: "Laboratorium" },
        { id: "TNI Kid", label: "Tentara (TNI)", desc: "Baret & Loreng" },
        { id: "Firefighter Kid", label: "Damkar", desc: "Pahlawan Api" },
        { id: "Professional Athlete", label: "Atlet Juara", desc: "Tim Indonesia" },
      ]
    },
    {
      label: "Karakter Fantasi",
      items: [
        { id: "Superhero Kid", label: "Superhero", desc: "Pahlawan Super" },
        { id: "Prince/Princess Kid", label: "Pangeran/Putri", desc: "Mahkota & Jubah" },
        { id: "Fairy Kid", label: "Peri Kecil", desc: "Sayap & Tongkat" },
      ]
    }
  ]
};

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Potret', value: '3:4' },
  { label: '1:1 Kotak', value: '1:1' },
  { label: '9:16 Cerita', value: '9:16' },
  { label: '16:9 Cinema', value: '16:9' },
];

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
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgUrl] = useState(URL.createObjectURL(file));

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgRef.current) return;

    canvas.width = 1024;
    canvas.height = 1024;

    const img = imgRef.current;
    const viewportSize = Math.min(window.innerWidth - 64, 300);
    const scaleFactor = 1024 / viewportSize;
    
    const displayWidth = img.clientWidth * zoom;
    const displayHeight = img.clientHeight * zoom;
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1024, 1024);
    
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
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-xl">
                 <Crop className="w-4 h-4 text-white" />
              </div>
              <div>
                 <h3 className="font-bold text-white text-sm md:text-base">Focus Wajah Si Kecil</h3>
                 <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest">Biometric alignment</p>
              </div>
           </div>
           <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full text-slate-500 active:scale-90"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 md:p-8 flex flex-col items-center gap-6 md:gap-8 overflow-y-auto custom-scrollbar">
           <div 
            className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-2xl md:rounded-3xl border-2 border-orange-500/30 overflow-hidden bg-slate-950 cursor-move shrink-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
           >
              <img 
                ref={imgRef}
                src={imgUrl} 
                alt="Crop Target"
                draggable={false}
                className="max-w-none origin-center pointer-events-none"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: window.innerWidth < 640 ? '-130px' : '-150px',
                  marginLeft: window.innerWidth < 640 ? '-130px' : '-150px'
                }}
              />
              <div className="absolute inset-0 pointer-events-none ring-[100px] ring-black/60" />
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full scale-90 opacity-40 border-dashed" />
           </div>
           <div className="w-full space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase px-1">
                    <span>Zoom</span>
                    <span>{(zoom * 100).toFixed(0)}%</span>
                 </div>
                 <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              </div>
           </div>
        </div>
        <div className="p-5 md:p-6 bg-slate-950/50 border-t border-white/5 grid grid-cols-2 gap-3 md:gap-4 shrink-0">
           <button onClick={onCancel} className="py-3 rounded-xl md:rounded-2xl border border-white/10 text-slate-400 font-black text-[10px] uppercase hover:bg-white/5">Batal</button>
           <button onClick={handleSave} className="py-3 rounded-xl md:rounded-2xl bg-orange-600 text-white font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20 active:scale-95"><Check className="w-4 h-4" /> Gunakan</button>
        </div>
      </div>
    </div>
  );
}

interface KidsStudioProps {
  onPreview: (url: string) => void;
}

export default function KidsStudio({ onPreview }: KidsStudioProps) {
  const [subMode, setSubMode] = useState<'baby' | 'kids'>('kids');
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('standard');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [themeId, setThemeId] = useState('Tanpa Tema');
  const [backgroundId, setBackgroundId] = useState('Studio Clean');
  const [childName, setChildName] = useState('');
  const [ageValue, setAgeValue] = useState('5');
  const [ageUnit, setAgeUnit] = useState<'bulan' | 'tahun'>('tahun');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [keepFace, setKeepFace] = useState(true); 
  const [isMiniature, setIsMiniature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (pendingFiles.length > 0 && !currentFileToCrop) {
      setCurrentFileToCrop(pendingFiles[0]);
    }
  }, [pendingFiles, currentFileToCrop]);

  const handleModeChange = (mode: 'baby' | 'kids') => {
    setSubMode(mode);
    setAgeUnit(mode === 'baby' ? 'bulan' : 'tahun');
    setAgeValue(mode === 'baby' ? '12' : '5');
    setThemeId('Tanpa Tema');
  };

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
      setError('Maksimal 5 gambar referensi.');
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

  const getSelectedThemeData = () => {
    for (const group of THEME_GROUPS[subMode]) {
      const found = group.items.find(i => i.id === themeId);
      if (found) return found;
    }
    return null;
  };

  const handleGenerate = async () => {
    if (engineMode === 'pro' && !isConnected) {
      handleOpenKey();
      return;
    }

    if (images.length === 0) {
      setError('Harap unggah foto wajah subjek.');
      return;
    }

    setLoading(true);
    setError(null);

    const themeData = getSelectedThemeData();
    const bgData = BACKGROUND_OPTIONS.find(b => b.id === backgroundId);
    const isNewborn = subMode === 'baby' && ageUnit === 'bulan' && parseInt(ageValue) <= 3;

    let kidsPrompt = "";
    
    if (isMiniature) {
      kidsPrompt = `[MINIATURE WORLD MODE] A professional high-end macro photography of a ${ageValue} ${ageUnit} old ${isNewborn ? 'newborn baby' : 'child'} scaled down to the size of a tiny toy. `;
      if (themeId !== 'Tanpa Tema') {
        kidsPrompt += `Theme: The subject is wearing a detailed miniature ${themeData?.label} costume. `;
      } else {
        kidsPrompt += `Identity: The subject wears their original clothes from the source photo, rendered as a miniature figurine. `;
      }
      kidsPrompt += `Environment: Set in a GIGANTIC ${bgData?.id} environment with macro scale effects. `;
      kidsPrompt += `Visual Style: Tilt-shift, macro lens, extremely shallow depth of field. `;
    } else {
      kidsPrompt = subMode === 'baby' 
        ? `[BABY STUDIO] A professional high-end studio ${isNewborn ? 'newborn baby born' : 'baby'} photography session. `
        : `[KIDS STUDIO] A professional children's photography studio masterpiece. `;
      
      if (isNewborn) {
        kidsPrompt += "Subject: The subject is a peacefully sleeping newborn baby born, swaddled in premium soft fabrics. ";
      }
      
      kidsPrompt += `Subject Details: A ${ageValue} ${ageUnit} old ${subMode}. `;
      if (themeId !== 'Tanpa Tema') {
        kidsPrompt += `Theme: Wearing a high-quality ${themeData?.label} costume. `;
      } else {
        kidsPrompt += `Outfit: The subject wears their original clothes from the source images. Focus on high-end studio lighting and a crisp ${bgData?.id} background while keeping the original outfit perfectly. `;
      }
      kidsPrompt += `Background: Set in a ${bgData?.id} setting with matching professional studio props. `;
      kidsPrompt += `Visual Style: Cinematic studio lighting, sharp focus, 8k resolution. `;
    }
    
    if (childName.trim()) {
      kidsPrompt += `PROPS: Include a clear and stylish decorative sign, wooden blocks, or a high-quality nameplate within the scene that displays the name "${childName.toUpperCase()}". The sign should match the ${themeData?.label || 'Studio'} aesthetic and be clearly legible. `;
    }

    if (customPrompt) kidsPrompt += `Additional Context: ${customPrompt}. `;
    
    if (keepFace) {
      kidsPrompt += `STRICT BIOMETRIC IDENTITY LOCK: You must preserve 100% of the facial identity from source. `;
    }

    try {
      let generatedUrls: string[];
      const files = images.map(img => img.file);

      if (engineMode === 'pro') {
        generatedUrls = await transformImagesPro(files, kidsPrompt, aspectRatio, imageSize, true);
      } else {
        generatedUrls = await transformImages(files, kidsPrompt, aspectRatio, keepFace);
      }

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: kidsPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto studio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {currentFileToCrop && <CropModal file={currentFileToCrop} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}
      
      {/* Sub-Mode Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-2xl overflow-x-auto no-scrollbar">
           <button 
            onClick={() => handleModeChange('baby')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${subMode === 'baby' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <BabyIcon className="w-4 h-4" /> Baby Studio
           </button>
           <button 
            onClick={() => handleModeChange('kids')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${subMode === 'kids' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <PartyPopper className="w-4 h-4" /> Kids Studio
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-5 space-y-6 px-4 md:px-0">
          <div className="bg-[#0a0f1d] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            <div className="space-y-4">
              <label className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-300">
                <div className="flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">1</span>
                   Input Foto Subjek (1-5)
                </div>
                <span className="text-[10px] text-indigo-400 font-black">{images.length}/5</span>
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Subject" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(img.id)} className="absolute inset-0 m-auto w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                    <Plus className="w-6 h-6 text-slate-700 mb-1 group-hover:text-indigo-400" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">2</span>
                Konfigurasi Studio
              </label>
              
              <div 
                onClick={() => setIsMiniature(!isMiniature)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  isMiniature ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-slate-950 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isMiniature ? 'bg-cyan-500 text-white animate-pulse' : 'bg-slate-800 text-slate-600'}`}>
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-tight block ${isMiniature ? 'text-cyan-400' : 'text-slate-300'}`}>Mode Dunia Mini</span>
                    <span className="text-[8px] text-slate-500 uppercase font-medium">Background Miniatur</span>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${isMiniature ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMiniature ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text" 
                    placeholder="Nama Si Kecil (Akan muncul di foto)" 
                    value={childName} 
                    onChange={(e) => setChildName(e.target.value)} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="relative">
                    <input 
                      type="number" 
                      value={ageValue} 
                      onChange={(e) => setAgeValue(e.target.value)} 
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-600 uppercase">Usia</span>
                   </div>
                   <select 
                    value={ageUnit}
                    onChange={(e) => setAgeUnit(e.target.value as any)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-2 text-[10px] font-bold text-slate-400"
                   >
                     <option value="bulan">Bulan</option>
                     <option value="tahun">Tahun</option>
                   </select>
                </div>
              </div>

              {/* Background Selection Section */}
              <div className="space-y-3">
                 <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Pilih Latar Belakang
                 </label>
                 <div className="grid grid-cols-1 gap-2">
                    {BACKGROUND_OPTIONS.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => setBackgroundId(bg.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${backgroundId === bg.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'}`}
                      >
                        <div className={`p-2 rounded-xl ${backgroundId === bg.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                           <bg.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-tight">{bg.label}</div>
                          <div className="text-[8px] opacity-60 leading-tight">{bg.desc}</div>
                        </div>
                        {backgroundId === bg.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6 pt-2">
                 {THEME_GROUPS[subMode].map((group, idx) => (
                   <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                         {idx === 0 ? <Palette className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                         {group.label} (Kostum)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         {group.items.map(item => (
                           <button
                             key={item.id}
                             onClick={() => setThemeId(item.id)}
                             className={`group relative flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${themeId === item.id ? (subMode === 'baby' ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg' : 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-lg') : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'}`}
                           >
                             <div className="pr-4">
                               <div className="text-[10px] font-black uppercase tracking-tight line-clamp-1">{item.label}</div>
                               <div className="text-[8px] opacity-60 leading-tight line-clamp-1">{item.desc}</div>
                             </div>
                             {themeId === item.id && <CheckCircle2 className={`w-3.5 h-3.5 absolute top-2 right-2 ${subMode === 'baby' ? 'text-sky-500' : 'text-orange-500'}`} />}
                           </button>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">3</span>
                Prompt Tambahan & Edit
              </label>
              <textarea 
                placeholder="Contoh: Memegang boneka, tertawa ceria, pakai kacamata hitam..."
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500/50 h-24 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' : 'bg-slate-900 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className={`w-5 h-5 ${keepFace ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-200 block">Strict Face Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase font-medium">Identitas Terproteksi</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${keepFace ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      aspectRatio === r.value 
                      ? 'bg-white border-white text-slate-900 shadow-lg' 
                      : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    {r.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-2xl leading-relaxed">
                   ⚠️ {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`group relative w-full overflow-hidden rounded-2xl py-5 transition-all active:scale-95 ${
                  loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : (subMode === 'baby' 
                     ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500' 
                     : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500') + ' text-white shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest animate-pulse">Merakit Foto...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="w-4 h-4 fill-white" />
                    <span className="font-black text-xs uppercase tracking-[0.2em]">Generate Studio</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7 space-y-8 px-4 md:px-0">
          {results.length === 0 && !loading ? (
            <div className="h-full min-h-[500px] bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
               <div className="flex flex-col items-center text-center mb-10 md:mb-16 relative z-10">
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 blur-3xl opacity-10 animate-pulse ${isMiniature ? 'bg-cyan-500' : 'bg-indigo-500'}`} />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                      {isMiniature ? <BoxSelect className="w-10 h-10 md:w-12 md:h-12 text-cyan-500" /> : subMode === 'baby' ? <BabyIcon className="w-10 h-10 md:w-12 md:h-12 text-sky-500" /> : <PartyPopper className="w-10 h-10 md:w-12 md:h-12 text-orange-500" />}
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
                      {isMiniature ? 'Miniature World Studio' : subMode === 'baby' ? 'Baby Portrait AI' : 'Kids Dream Studio'}
                  </h2>
                  <p className="text-slate-500 max-w-xl text-sm md:text-base font-medium leading-relaxed px-4">
                    Abadikan setiap fase pertumbuhan si kecil dalam visual yang menakjubkan dan berkarakter.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10 text-left">
                  {[
                    { icon: Users, title: "1. Pilih & Unggah", text: "Tentukan mode Baby atau Kids, lalu unggah 1-5 foto wajah terbaik untuk hasil biometrik yang akurat." },
                    { icon: Settings2, title: "2. Atur Identitas", text: "Masukkan nama (opsional untuk prop) dan usia si kecil agar AI dapat menyesuaikan proporsi tubuh." },
                    { icon: Shirt, title: "3. Tanpa Tema (Baju Asli)", text: "Pilih opsi 'Tanpa Tema' jika ingin menjaga pakaian asli si kecil namun dalam kualitas studio 8K." },
                    { icon: CheckCircle2, title: "4. Render & Simpan", text: "Klik generate dan AI akan meracik 4 variasi foto studio profesional beresolusi 8K yang siap dipamerkan." }
                  ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${subMode === 'baby' ? 'bg-sky-500/10 text-sky-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base uppercase tracking-tight">{step.title}</h3>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  ))}
               </div>

               <div className={`mt-10 flex items-center gap-2 px-4 py-2 rounded-full border animate-pulse ${subMode === 'baby' ? 'bg-sky-500/5 border-sky-500/10' : 'bg-orange-500/5 border-orange-500/10'}`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${subMode === 'baby' ? 'text-sky-400' : 'text-orange-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Child-Identity Safeguard Active</span>
               </div>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              {loading && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/40 rounded-[3rem] border border-white/5 animate-in fade-in duration-700">
                   <div className="absolute inset-0 bg-indigo-500/5" />
                   <div className="relative mb-12">
                      <div className={`absolute inset-0 blur-[100px] opacity-20 animate-pulse ${isMiniature ? 'bg-cyan-500' : 'bg-indigo-500'}`} />
                      <div className="relative w-40 h-40 flex items-center justify-center">
                         <RefreshCw className={`w-24 h-24 animate-spin absolute ${isMiniature ? 'text-cyan-400/30' : 'text-indigo-400/30'}`} />
                         {isMiniature ? <Box className="w-16 h-16 text-cyan-500 animate-bounce" /> : <Smile className="w-16 h-16 text-indigo-400 animate-bounce" />}
                      </div>
                   </div>
                   <div className="text-center space-y-4 relative z-10 px-6">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic animate-pulse">
                        {LOADING_MESSAGES[loadingStep]}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                         {[1,2,3,4,5,6].map(i => (
                           <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${isMiniature ? 'bg-cyan-500' : 'bg-indigo-500'}`} style={{animationDelay: `${i*0.2}s`}} />
                         ))}
                      </div>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] pt-6 opacity-60">Bamz Studio Intelligence Rendering</p>
                   </div>
                </div>
              )}

              {!loading && results.map((result, rIdx) => (
                <div key={result.timestamp} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Sparkles className={`w-5 h-5 ${isMiniature ? 'text-cyan-400' : 'text-indigo-400'}`} />
                       <h3 className="text-lg font-black uppercase text-white tracking-widest">
                          Hasil Render Studio
                       </h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-600 uppercase bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        {new Date(result.timestamp).toLocaleTimeString()}
                       </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.imageUrls.map((url, i) => (
                      <div key={i} className="group flex flex-col gap-4">
                        <div className="relative aspect-[3/4] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/[0.05] shadow-2xl transition-all duration-500 hover:border-indigo-500/40">
                          <img 
                            src={url} 
                            alt="Result" 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          
                          <div className="absolute top-6 left-6 pointer-events-none">
                             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                <ShieldCheck className={`w-3.5 h-3.5 ${isMiniature ? 'text-cyan-400' : 'text-indigo-400'}`} />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Identity Match OK</span>
                             </div>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            <button 
                              onClick={() => onPreview(url)}
                              className={`p-4 rounded-2xl transition-all shadow-xl hover:scale-110 active:scale-95 text-white ${isMiniature ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                            >
                              <Maximize2 className="w-6 h-6" />
                            </button>
                            <a 
                              href={url} 
                              download={`kids-studio-${rIdx}-${i}.png`}
                              className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                              <Download className="w-6 h-6" />
                            </a>
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{themeId !== 'Tanpa Tema' ? themeId.replace('Baby ', '').replace(' Kid', '').replace(' Anak', '') : 'Baju Asli'} • {backgroundId}</h4>
                          {childName && (
                             <div className="text-[9px] font-black text-indigo-400 uppercase mt-1">Nama Properti: {childName}</div>
                          )}
                          <div className="flex items-center justify-center gap-1.5 mt-1">
                             <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Master Studio Render</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
