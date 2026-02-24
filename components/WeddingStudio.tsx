
import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  UserCheck,
  Zap,
  Layout,
  CheckCircle2,
  Heart,
  User,
  UserRound,
  ShieldCheck,
  Fingerprint,
  Info,
  Camera,
  MapPin,
  Calendar,
  Maximize2,
  Home,
  Trees,
  Users,
  Palette
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const WEDDING_THEMES = [
  { id: 'International White', label: 'International White', desc: 'Gaun putih klasik & Jas modern' },
  { id: 'Adat Jawa', label: 'Adat Jawa (Paes Ageng)', desc: 'Kebaya hitam beludru & kain batik' },
  { id: 'Adat Sunda', label: 'Adat Sunda (Siger)', desc: 'Kebaya putih elegan & siger sunda' },
  { id: 'Adat Minang', label: 'Adat Minang (Suntiang)', desc: 'Baju kurung merah/emas & suntiang' },
];

const PREWED_CONCEPTS = [
  { id: 'Cinematic Casual', label: 'Casual Sinematik', desc: 'Gaya santai dengan tone film film' },
  { id: 'Vintage 90s', label: 'Vintage 90-an', desc: 'Gaya retro dengan grain film estetik' },
  { id: 'Minimalist Korea', label: 'Minimalis Korea', desc: 'Clean, estetik, dan latar studio simpel' },
  { id: 'Bohemian Nature', label: 'Bohemian Nature', desc: 'Bebas, artistik, dan menyatu dengan alam' },
];

const LOCATION_TYPES = [
  { id: 'indoor', label: 'Indoor', icon: Home, desc: 'Ballroom, Studio, atau Interior' },
  { id: 'outdoor', label: 'Outdoor', icon: Trees, desc: 'Taman, Pantai, atau Alam' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface WeddingStudioProps {
  onPreview: (url: string) => void;
}

export default function WeddingStudio({ onPreview }: WeddingStudioProps) {
  const [subMode, setSubMode] = useState<'wedding' | 'prewed'>('wedding');
  const [locationType, setLocationType] = useState('indoor');
  const [maleImage, setMaleImage] = useState<ImageFile | null>(null);
  const [femaleImage, setFemaleImage] = useState<ImageFile | null>(null);
  const [theme, setTheme] = useState(WEDDING_THEMES[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (mode: 'wedding' | 'prewed') => {
    setSubMode(mode);
    setTheme(mode === 'wedding' ? WEDDING_THEMES[0].id : PREWED_CONCEPTS[0].id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, gender: 'male' | 'female') => {
    const file = e.target.files?.[0];
    if (file) {
      const newImage: ImageFile = {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      };
      if (gender === 'male') {
        if (maleImage) URL.revokeObjectURL(maleImage.preview);
        setMaleImage(newImage);
      } else {
        if (femaleImage) URL.revokeObjectURL(femaleImage.preview);
        setFemaleImage(newImage);
      }
      setError(null);
    }
  };

  const removeImage = (gender: 'male' | 'female') => {
    if (gender === 'male' && maleImage) {
      URL.revokeObjectURL(maleImage.preview);
      setMaleImage(null);
    } else if (gender === 'female' && femaleImage) {
      URL.revokeObjectURL(femaleImage.preview);
      setFemaleImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!maleImage || !femaleImage) {
      setError('Harap unggah foto Mempelai Pria DAN Mempelai Wanita.');
      return;
    }

    setLoading(true);
    setError(null);

    let prompt = subMode === 'wedding' 
      ? `A high-end professional wedding photography masterpiece. `
      : `A stunning cinematic pre-wedding photography session. `;
      
    prompt += `SUBJECT MAPPING: The person in Image 1 is the groom/man. The person in Image 2 is the bride/woman. `;
    prompt += `${subMode === 'wedding' ? 'Theme' : 'Concept'}: ${theme}. `;
    
    if (locationType === 'indoor') {
      prompt += `Environment: Set in a ${subMode === 'wedding' ? 'luxurious grand ballroom decorated with thousands of white roses' : 'minimalist modern interior with soft natural light coming from a large window'}. `;
    } else {
      prompt += `Environment: Set in a ${subMode === 'wedding' ? 'dreamy outdoor garden ceremony during golden hour' : 'breathtaking outdoor natural landscape like a pine forest or sunset beach'}. `;
    }

    if (customPrompt) prompt += `Extra Details: ${customPrompt}. `;
    
    prompt += "Visual Style: Professional editorial photography, cinematic lighting, 8k resolution, photorealistic masterwork. ";
    
    if (keepFace) {
      prompt += "STRICT IDENTITY LOCK: Maintain 100% facial identity for both subjects. Image 1 must map exactly to the male, Image 2 must map exactly to the female. Preserve biometric structure. ";
    }

    try {
      const generatedUrls = await transformImages(
        [maleImage.file, femaleImage.file],
        prompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto pasangan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Sub-Mode Toggle */}
      <div className="flex justify-center mb-8 md:mb-12">
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-2xl overflow-x-auto no-scrollbar">
           <button 
            onClick={() => handleModeChange('wedding')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${subMode === 'wedding' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Heart className="w-4 h-4" /> Wedding Studio
           </button>
           <button 
            onClick={() => handleModeChange('prewed')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${subMode === 'prewed' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Camera className="w-4 h-4" /> Prewedding AI
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-5 space-y-6 px-4 md:px-0">
          <div className="bg-[#0a0f1d] rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Subject Input */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">1</span>
                Input Foto Pasangan
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-tighter">Pria (Groom)</span>
                  {maleImage ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                      <img src={maleImage.preview} alt="Man" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage('male')} className="absolute inset-0 m-auto w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                      <User className="w-6 h-6 text-slate-700 mb-1 group-hover:text-blue-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Unggah Pria</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'male')} />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-tighter">Wanita (Bride)</span>
                  {femaleImage ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                      <img src={femaleImage.preview} alt="Woman" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage('female')} className="absolute inset-0 m-auto w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all group">
                      <UserRound className="w-6 h-6 text-slate-700 mb-1 group-hover:text-pink-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Unggah Wanita</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'female')} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Location Type */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">2</span>
                Tema Lokasi
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {LOCATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setLocationType(type.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center gap-2 ${
                        locationType === type.id 
                        ? (subMode === 'wedding' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg' : 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-lg')
                        : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${locationType === type.id ? (subMode === 'wedding' ? 'text-rose-400' : 'text-pink-400') : 'text-slate-600'}`} />
                      <div className="text-[10px] font-black uppercase tracking-tight">{type.label}</div>
                      <div className="text-[8px] opacity-60 leading-tight hidden md:block">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Theme Selector */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">3</span>
                Pilihan Konsep
              </label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-bold text-slate-300 focus:ring-1 focus:ring-rose-500/50"
              >
                {(subMode === 'wedding' ? WEDDING_THEMES : PREWED_CONCEPTS).map(t => (
                  <option key={t.id} value={t.id}>{t.label} - {t.desc}</option>
                ))}
              </select>
            </div>

            {/* Identity Control */}
            <div className="space-y-4">
               <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">4</span>
                Proteksi & Edit
              </label>
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? (subMode === 'wedding' ? 'bg-rose-500/10 border-rose-500/40 shadow-lg' : 'bg-pink-500/10 border-pink-500/40 shadow-lg') : 'bg-slate-900 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className={`w-5 h-5 ${keepFace ? (subMode === 'wedding' ? 'text-rose-400' : 'text-pink-400') : 'text-slate-600'}`} />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-200 block">Strict Identity Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase font-medium">Dual-Identity Partner Sync</span>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${keepFace ? (subMode === 'wedding' ? 'bg-rose-600' : 'bg-pink-600') : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

              <textarea 
                placeholder="Detail tambahan (E.g. Memegang buket bunga tulip, suasana romantis, baju adat warna emas...)"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-xs text-slate-300 focus:ring-1 focus:ring-rose-500/50 h-24 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      aspectRatio === r.value 
                      ? (subMode === 'wedding' ? 'bg-rose-600 border-rose-400 text-white shadow-lg' : 'bg-pink-600 border-pink-400 text-white shadow-lg')
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
                  : (subMode === 'wedding' ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-900/30' : 'bg-gradient-to-r from-pink-600 to-rose-600 shadow-pink-900/30') + ' text-white shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest animate-pulse">Menghubungkan Hati...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="w-4 h-4 fill-white" />
                    <span className="font-black text-xs uppercase tracking-[0.2em]">Generate Moment</span>
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
               <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />
               
               <div className="flex flex-col items-center text-center mb-10 md:mb-16 relative z-10">
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 blur-3xl opacity-10 animate-pulse ${subMode === 'wedding' ? 'bg-rose-500' : 'bg-pink-500'}`} />
                    <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                      {subMode === 'wedding' ? <Heart className="w-10 h-10 md:w-12 md:h-12 text-rose-500" /> : <Camera className="w-10 h-10 md:w-12 md:h-12 text-pink-500" />}
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
                      {subMode === 'wedding' ? 'Wedding Portrait AI' : 'Prewedding Studio'}
                  </h2>
                  <p className="text-slate-500 max-w-xl text-sm md:text-base font-medium leading-relaxed px-4">
                    Abadikan momen sakral dan romantis bersama pasangan dalam kualitas studio maestro internasional.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10 text-left">
                  {[
                    { icon: Users, title: "1. Unggah Berpasangan", text: "Masukkan foto Mempelai Pria dan Wanita. AI akan mengenali keduanya sebagai entitas identitas yang berbeda." },
                    { icon: Palette, title: "2. Pilih Konsep", text: "Tersedia opsi Gaun Internasional, Adat Nusantara (Jawa/Sunda/Minang), hingga konsep Prewed Casual." },
                    { icon: UserCheck, title: "3. Identity Sync", text: "Logika dual-identity menjamin wajah Anda dan pasangan tetap autentik tanpa tertukar satu sama lain." },
                    { icon: CheckCircle2, title: "4. Hasil Pro 8K", text: "Dapatkan 4 hasil render dengan pencahayaan sinematik yang menyatukan pasangan secara natural." }
                  ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-rose-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${subMode === 'wedding' ? 'bg-rose-500/10 text-rose-400' : 'bg-pink-500/10 text-pink-400'}`}>
                            <step.icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base uppercase tracking-tight">{step.title}</h3>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  ))}
               </div>

               <div className={`mt-10 flex items-center gap-2 px-4 py-2 rounded-full border animate-pulse ${subMode === 'wedding' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-pink-500/5 border-pink-500/10'}`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${subMode === 'wedding' ? 'text-rose-400' : 'text-pink-400'}`} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Partner-Identity Lock Active</span>
               </div>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="space-y-5 animate-pulse">
                       <div className="aspect-[3/4] bg-white/5 rounded-[2.5rem] border border-white/5" />
                       <div className="h-3 bg-white/5 rounded-full w-2/3 mx-auto" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && results.map((result, rIdx) => (
                <div key={result.timestamp} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Sparkles className={`w-5 h-5 ${subMode === 'wedding' ? 'text-rose-400' : 'text-pink-400'}`} />
                       <h3 className="text-lg font-black uppercase text-white tracking-widest">
                          {subMode === 'wedding' ? 'Master Wedding Render' : 'Cinematic Prewed Result'}
                       </h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${locationType === 'indoor' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {locationType}
                       </div>
                       <span className="text-[10px] font-black text-slate-600 uppercase bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        {new Date(result.timestamp).toLocaleTimeString()}
                       </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.imageUrls.map((url, i) => (
                      <div key={i} className="group flex flex-col gap-4">
                        <div className="relative aspect-[3/4] bg-slate-950 rounded-[3rem] overflow-hidden border border-white/[0.05] shadow-2xl transition-all duration-500 hover:border-rose-500/40">
                          <img 
                            src={url} 
                            alt="Result" 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          
                          <div className="absolute top-6 left-6 pointer-events-none">
                             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                <ShieldCheck className={`w-3.5 h-3.5 ${subMode === 'wedding' ? 'text-rose-400' : 'text-pink-400'}`} />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Dual Identity OK</span>
                             </div>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            <button 
                              onClick={() => onPreview(url)}
                              className={`p-4 rounded-2xl transition-all shadow-xl hover:scale-110 active:scale-95 text-white ${subMode === 'wedding' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-pink-600 hover:bg-pink-500'}`}
                            >
                              <Maximize2 className="w-6 h-6" />
                            </button>
                            <a 
                              href={url} 
                              download={`couple-studio-${rIdx}-${i}.png`}
                              className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                            >
                              <Download className="w-6 h-6" />
                            </a>
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
