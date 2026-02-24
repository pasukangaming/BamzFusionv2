
import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Upload, 
  Trash2, 
  Loader2, 
  Download,
  Zap,
  Image as ImageIcon,
  User,
  Sparkles,
  Plus,
  X,
  Maximize2,
  Layout,
  Flag,
  Home,
  Sun,
  Trees,
  CheckCircle2,
  UserRound,
  UserRoundCheck,
  MapPin,
  Accessibility,
  Fingerprint,
  Crown,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Move,
  Users,
  UserPlus,
  RefreshCw,
  Palette,
  PenTool,
  Settings2,
  // Fix for line 666: Added missing UserCheck import
  UserCheck
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages, transformImagesPro, magicProductDetails } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Potret', value: '3:4' },
  { label: '9:16 Story', value: '9:16' },
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Cinema', value: '16:9' },
];

const LOADING_MESSAGES = [
  "Menganalisis Tekstur Produk...",
  "Menyesuaikan Proporsi Model...",
  "Mengatur Tata Cahaya Katalog...",
  "Menambahkan Model Pendamping...",
  "Merender Detail Kain & Bahan...",
  "Sinkronisasi Identitas Wajah...",
  "Menyelesaikan Master Katalog..."
];

const THEMES = [
  { id: 'indoor', label: 'Indoor', icon: Home, desc: 'Studio, Butik, atau Interior Mewah' },
  { id: 'outdoor', label: 'Outdoor', icon: Trees, desc: 'Jalanan Kota, Taman, atau Resort' },
];

const POSE_PRESETS = [
  { id: 'none', label: 'Default', desc: 'Pose natural otomatis', prompt: '' },
  { id: 'standing_full', label: 'Full Standing', desc: 'Berdiri tegak menghadap kamera', prompt: 'Subject is in a professional full-body standing pose, feet slightly apart, confident posture.' },
  { id: 'walking_catwalk', label: 'Catwalk Walk', desc: 'Berjalan ala model runway', prompt: 'Subject is walking forward mid-stride as if on a fashion runway, dynamic movement.' },
  { id: 'side_profile', label: 'Side Profile', desc: 'Tampak samping elegan', prompt: 'Subject is standing in a three-quarter side profile, looking away from camera with an elegant chin angle.' },
  { id: 'sitting_chic', label: 'Elegant Sitting', desc: 'Duduk santai tapi berkelas', prompt: 'Subject is sitting gracefully on a minimalist designer stool, legs crossed, sophisticated posture.' },
];

const RESULT_TITLES = [
  "Potret Klasik Urban",
  "Langkah Urban yang Dinamis",
  "Kenikmatan Kopi Pagi",
  "Detail Tekstur Lembut",
  "Lapisan Gaya Saat Senja",
  "Momen Refleksi Tenang"
];

interface FashionStudioProps {
  onPreview: (url: string) => void;
}

export default function FashionStudio({ onPreview }: FashionStudioProps) {
  const [engineMode, setEngineMode] = useState<'standard' | 'pro'>('standard');
  const [productImages, setProductImages] = useState<ImageFile[]>([]);
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [backgroundRef, setBackgroundRef] = useState<ImageFile | null>(null);
  const [poseRef, setPoseRef] = useState<ImageFile | null>(null);
  const [selectedPosePreset, setSelectedPosePreset] = useState('none');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  
  // New Feature: Companion
  const [companionMode, setCompanionMode] = useState(false);
  const [companionGender, setCompanionGender] = useState<'male' | 'female'>('male');

  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [selectedTheme, setSelectedTheme] = useState('indoor');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [magicLoading, setMagicLoading] = useState(false);
  const [imageResults, setImageResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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

  // Cycling loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleOpenKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsConnected(true);
    }
  };

  const handleProductFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (productImages.length + files.length > 5) {
      setError('Maksimal 5 gambar produk.');
      return;
    }
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));
    setProductImages(prev => [...prev, ...newImages]);
    setError(null);
  };

  const handleModelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (modelImage) URL.revokeObjectURL(modelImage.preview);
      setModelImage({
        id: 'model',
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleBackgroundFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (backgroundRef) URL.revokeObjectURL(backgroundRef.preview);
      setBackgroundRef({
        id: 'bg-ref',
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handlePoseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (poseRef) URL.revokeObjectURL(poseRef.preview);
      setPoseRef({
        id: 'pose-ref',
        file,
        preview: URL.createObjectURL(file)
      });
      setSelectedPosePreset('none');
    }
  };

  const removeProductImage = (id: string) => {
    setProductImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const handleMagicDescription = async () => {
    if (productImages.length === 0) return;
    setMagicLoading(true);
    try {
      const details = await magicProductDetails(productImages[0].file);
      setDescription(details.features);
    } catch (err) {
      console.error(err);
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (engineMode === 'pro' && !isConnected) {
      handleOpenKey();
      return;
    }
    if (productImages.length === 0) {
      setError('Harap unggah gambar produk.');
      return;
    }

    setLoading(true);
    setError(null);

    const ethnicityLogic = gender === 'female' 
      ? "The main model MUST be a realistic Indonesian female with Southeast Asian facial features. "
      : "The main model MUST be a realistic Indonesian male with handsome Southeast Asian features. ";

    try {
      let fashionPrompt = `PROFESSIONAL INDONESIAN FASHION CATALOG PHOTOGRAPHY. ${ethnicityLogic} `;
      fashionPrompt += `Task: Generate a high-end fashion scene where the models wear the exact products from the reference images. `;
      
      // Companion Logic
      if (companionMode) {
        const friendGenderStr = companionGender === 'male' ? 'male' : 'female';
        fashionPrompt += `COMPANION FEATURE: Add a secondary person (a friend) to the scene. The friend is an Indonesian ${friendGenderStr} model. Both models should be interacting naturally, such as talking, walking together, or posing as a couple/friends to create a lifestyle catalog vibe. Their outfits must be complementary. `;
      }

      // Pose Logic
      if (poseRef) {
        fashionPrompt += `POSE IMAGE CONTROL: The models MUST mirror the body orientation and perspective from the provided pose reference image. `;
      } else if (selectedPosePreset !== 'none') {
        const preset = POSE_PRESETS.find(p => p.id === selectedPosePreset);
        if (preset) fashionPrompt += `${preset.prompt} `;
      }

      // Environment Logic
      if (backgroundRef) {
        fashionPrompt += `ENVIRONMENT CONTROL: Replicate the background, lighting, and mood from the provided background reference image. `;
      } else {
        if (selectedTheme === 'indoor') {
          fashionPrompt += `Environment: Set in a luxury minimalist fashion studio with professional softbox lighting. `;
        } else {
          fashionPrompt += `Environment: Set in an aesthetic outdoor Jakarta urban street setting. `;
        }
      }

      fashionPrompt += `Product Description: ${description || 'Contemporary Indonesian fashion item'}. `;
      fashionPrompt += `Aesthetic: Professional commercial photography, 8k resolution, photorealistic fabric texture, realistic human skin. `;
      
      if (modelImage) {
        fashionPrompt += `IDENTITY SYNC: Maintain the 100% exact facial identity of the provided model reference for the main subject. `;
      }

      const allFiles = [...productImages.map(img => img.file)];
      if (modelImage) allFiles.push(modelImage.file);
      if (backgroundRef) allFiles.push(backgroundRef.file);
      if (poseRef) allFiles.push(poseRef.file);

      let generatedUrls: string[];
      if (engineMode === 'pro') {
        generatedUrls = await transformImagesPro(allFiles, fashionPrompt, aspectRatio, '1K', !!modelImage);
      } else {
        generatedUrls = await transformImages(allFiles, fashionPrompt, aspectRatio, !!modelImage);
      }

      setImageResults(prev => [{
        imageUrls: generatedUrls,
        prompt: fashionPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses permintaan fashion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a0f1d] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Header Badge & Engine Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Fashion Studio</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flag className="w-3 h-3 text-sky-400" />
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest text-nowrap">Indonesian AI Engine</span>
                  </div>
                </div>
              </div>
              <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                <button onClick={() => setEngineMode('standard')} className={`p-2 rounded-lg transition-all ${engineMode === 'standard' ? 'bg-slate-700 text-white' : 'text-slate-500'}`} title="Standard Mode">
                  <Cpu className="w-4 h-4" />
                </button>
                <button onClick={() => setEngineMode('pro')} className={`p-2 rounded-lg transition-all ${engineMode === 'pro' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`} title="Elite Pro Mode">
                  <Crown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step 1: Product Photos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">1</span>
                  Produk (1-5 Foto)
                </h3>
                <span className="text-[10px] font-black text-indigo-400">{productImages.length}/5</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {productImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-900 border border-white/5">
                    <img src={img.preview} alt="Product" className="w-full h-full object-contain p-2" />
                    <button 
                      onClick={() => removeProductImage(img.id)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {productImages.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                    <Plus className="w-7 h-7 text-slate-700 group-hover:text-indigo-500" />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleProductFiles} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Main Model & Companion */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">2</span>
                  Model Utama & Teman
                </h3>
                
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Gender Model Utama</span>
                  <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-white/5 gap-2">
                    <button 
                      onClick={() => setGender('male')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gender === 'male' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <UserRound className="w-4 h-4" /> Laki-laki
                    </button>
                    <button 
                      onClick={() => setGender('female')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gender === 'female' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <UserRoundCheck className="w-4 h-4" /> Perempuan
                    </button>
                  </div>
                </div>

                <div 
                  onClick={() => setCompanionMode(!companionMode)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    companionMode ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg' : 'bg-slate-800/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all ${companionMode ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-200 block">Mode Bareng Teman</span>
                      <span className="text-[8px] text-slate-500 uppercase font-medium">Add Companion AI</span>
                    </div>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${companionMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${companionMode ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>

                {companionMode && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Pilih Gender Teman</label>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => setCompanionGender('male')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${companionGender === 'male' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800/50 border-white/5 text-slate-500'}`}
                        >
                          <UserRound className="w-4 h-4" /> Cowok
                        </button>
                        <button 
                          onClick={() => setCompanionGender('female')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${companionGender === 'female' ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-800/50 border-white/5 text-slate-500'}`}
                        >
                          <UserRoundCheck className="w-4 h-4" /> Cewek
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Pose Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">3</span>
                Setting Pose Pro
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {POSE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPosePreset(p.id);
                        setPoseRef(null);
                      }}
                      className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                        selectedPosePreset === p.id && !poseRef
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-900 border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                      <span className="text-[8px] opacity-60 line-clamp-1">{p.desc}</span>
                    </button>
                  ))}
                </div>

                {poseRef ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden group border border-indigo-500/50 bg-slate-900">
                    <img src={poseRef.preview} alt="Pose Ref" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setPoseRef(null)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-indigo-600 text-[8px] font-black text-white uppercase py-1.5 text-center">Custom Pose Locked</div>
                  </div>
                ) : (
                  <label className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group bg-slate-900/50">
                    <div className="p-2 bg-slate-800 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                      <Accessibility className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-black uppercase text-center px-4">Pakai Custom Pose</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePoseFile} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 4: Background Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">4</span>
                Latar Belakang
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      setBackgroundRef(null);
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center gap-2 ${
                      selectedTheme === theme.id && !backgroundRef
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <theme.icon className={`w-6 h-6 ${selectedTheme === theme.id && !backgroundRef ? 'text-indigo-400' : 'text-slate-600'}`} />
                    <div className="text-[10px] font-black uppercase tracking-tight">{theme.label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {backgroundRef ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden group border border-indigo-500/50 bg-slate-900">
                    <img src={backgroundRef.preview} alt="Background Ref" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setBackgroundRef(null)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="aspect-video w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group bg-slate-900/50">
                    <div className="p-2 bg-slate-800 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-black uppercase text-center px-4 leading-tight">Ganti Lokasi Spesifik</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundFile} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 5: Description & Magic Scan */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">5</span>
                  Deskripsi & Edit
                </h3>
                <button 
                  onClick={handleMagicDescription}
                  disabled={magicLoading || productImages.length === 0}
                  className="text-[10px] text-sky-400 font-black uppercase flex items-center gap-1.5 hover:text-sky-300 disabled:opacity-30 transition-all"
                >
                  {magicLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Magic Scan
                </button>
              </div>
              <textarea 
                placeholder={`E.g. Model memakai jaket ini dengan teman, suasana kafe estetik, pencahayaan hangat...`}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500/50 h-24 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Step 6: Identity Lock */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">6</span>
                Wajah Utama <span className="text-[8px] opacity-40 lowercase ml-1">(Opsional)</span>
              </h3>
              {modelImage ? (
                <div className="relative aspect-[4/5] w-full max-w-[150px] mx-auto rounded-2xl overflow-hidden group border border-white/10 shadow-xl">
                  <img src={modelImage.preview} alt="Model Ref" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setModelImage(null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-indigo-600 text-[8px] font-black text-white uppercase py-1.5 text-center">Identity Locked</div>
                </div>
              ) : (
                <label className="aspect-[4/5] w-full max-w-[150px] mx-auto rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group bg-slate-900/50">
                  <div className="p-3 bg-slate-800 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-black uppercase text-center px-4 leading-tight">Kunci Wajah Anda</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleModelFile} />
                </label>
              )}
            </div>

            {/* Step 7: Aspect Ratio */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">7</span>
                Pilih Rasio
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      aspectRatio === r.value 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                      : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <Layout className="w-3 h-3" />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              {engineMode === 'pro' && !isConnected && (
                <button 
                  onClick={handleOpenKey}
                  className="w-full mb-4 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 group transition-all active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                     <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Wajib API Key Pro</div>
                     <div className="text-[8px] text-amber-500/60 uppercase font-bold">Model Pro diperlukan untuk hasil 4K</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500 ml-auto mr-4" />
                </button>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-2xl">
                   ⚠️ {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`group relative w-full overflow-hidden py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50 active:scale-95 ${
                  loading 
                  ? 'bg-slate-800 text-slate-500' 
                  : (engineMode === 'pro' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20') + ' text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Rendering Katalog...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Generate Katalog {engineMode === 'pro' ? 'Pro' : ''}</span>
                    </div>
                    <span className="text-[8px] opacity-60 tracking-widest mt-0.5">Using {engineMode === 'pro' ? 'Gemini 3 Pro Image' : 'Gemini 2.5 Flash'}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-8">
          {imageResults.length === 0 && !loading ? (
            <div className="h-full min-h-[500px] bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
               <div className="flex flex-col items-center text-center mb-10 md:mb-16 relative z-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse" />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                      <Shirt className="w-10 h-10 md:w-12 md:h-12 text-indigo-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">Katalog Fashion AI</h2>
                  <p className="text-slate-500 max-w-xl text-sm md:text-base font-medium leading-relaxed px-4">
                    Ubah foto produk mentah menjadi katalog profesional sekelas brand global secara instan.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10 text-left">
                  {[
                    { icon: Shirt, title: "1. Foto Produk", text: "Unggah 1-5 foto pakaian atau produk fashion Anda. AI akan menganalisis detail tekstur kain." },
                    { icon: UserCheck, title: "2. Identity Mapping", text: "Opsional: Unggah foto wajah Anda agar AI memasangkan produk fashion tersebut ke tubuh Anda." },
                    { icon: Palette, title: "3. Atur Suasana", text: "Tentukan lokasi Indoor/Outdoor dan biarkan AI merancang pencahayaan katalog yang estetik." },
                    { icon: CheckCircle2, title: "4. Hasil Pro 8K", text: "Dapatkan 4 hasil render profesional dengan pose model yang natural dan siap dipublikasikan." }
                  ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-indigo-500/10 text-indigo-400">
                            <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base uppercase tracking-tight">{step.title}</h3>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  ))}
               </div>

               <div className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/10 bg-indigo-500/5 animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fashion Intelligence Safeguard Active</span>
               </div>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              {loading && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/40 rounded-[3rem] border border-white/5 animate-in fade-in duration-700">
                   <div className="absolute inset-0 bg-indigo-500/5" />
                   <div className="relative mb-12">
                      <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20 animate-pulse" />
                      <div className="relative w-40 h-40 flex items-center justify-center">
                         <RefreshCw className="w-24 h-24 text-indigo-500/30 animate-spin absolute" />
                         <Shirt className="w-16 h-16 text-indigo-500 animate-bounce" />
                      </div>
                   </div>
                   <div className="text-center space-y-4 relative z-10">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic animate-pulse px-6">
                        {LOADING_MESSAGES[loadingStep]}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                         {[1,2,3,4,5,6].map(i => (
                           <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: `${i*0.2}s`}} />
                         ))}
                      </div>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] pt-6 opacity-60">Indonesian AI Studio Rendering</p>
                   </div>
                </div>
              )}

              {!loading && imageResults.map((result, rIdx) => (
                <div key={result.timestamp} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <ImageIcon className="w-5 h-5 text-indigo-400" />
                       <h3 className="text-lg font-black uppercase text-white tracking-widest">Koleksi Terbaru</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                         {engineMode} Quality
                       </div>
                       <span className="text-[10px] font-black text-slate-600 uppercase bg-white/5 px-3 py-1 rounded-full">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.imageUrls.map((url, i) => (
                      <div key={i} className="group flex flex-col gap-4">
                        <div className="relative aspect-[3/4] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/[0.05] shadow-2xl transition-all duration-500 hover:border-indigo-500/40">
                          <img 
                            src={url} 
                            alt="Fashion Result" 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          
                          <div className="absolute top-6 left-6 pointer-events-none">
                             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                <Flag className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                  {gender === 'male' ? 'Male Model' : 'Female Model'}
                                  {companionMode && ` + ${companionGender}`}
                                </span>
                             </div>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            <button 
                              onClick={() => onPreview(url)}
                              className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                              <Maximize2 className="w-6 h-6" />
                            </button>
                            <a 
                              href={url} 
                              download={`fashion-studio-${rIdx}-${i}.png`}
                              className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                              <Download className="w-6 h-6" />
                            </a>
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{RESULT_TITLES[i % RESULT_TITLES.length]}</h4>
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
