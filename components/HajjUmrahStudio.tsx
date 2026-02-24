import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  Zap,
  Layout,
  CheckCircle2,
  MoonStar,
  MapPin,
  User,
  Heart,
  UserRound,
  UserRoundCheck
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const BACKGROUND_OPTIONS = [
  { id: 'Kaaba Front', label: 'Depan Ka\'bah', desc: 'Suasana Masjidil Haram yang khidmat' },
  { id: 'Masjid Nabawi', label: 'Masjid Nabawi', desc: 'Pemandangan pelataran payung Madinah' },
  { id: 'Jabal Rahmah', label: 'Jabal Rahmah', desc: 'Bukit kasih sayang di Padang Arafah' },
  { id: 'Mina Tent', label: 'Tenda Mina', desc: 'Suasana mabit di perkemahan Mina' },
  { id: 'Mecca View', label: 'Cityscape Mekkah', desc: 'Pemandangan kota dengan Clock Tower' },
];

const MALE_OUTFITS = [
  { id: 'Ihram', label: 'Kain Ihram', desc: 'Pakaian suci putih (untuk pria)' },
  { id: 'Batik Haji Pria', label: 'Batik Haji', desc: 'Seragam resmi jamaah Indonesia' },
  { id: 'Thobe', label: 'Thobe / Gamis', desc: 'Jubah putih bersih khas Arab' },
];

const FEMALE_OUTFITS = [
  { id: 'Abaya Hijab', label: 'Abaya & Hijab', desc: 'Pakaian muslimah syar\'i elegan' },
  { id: 'Mukena', label: 'Mukena Putih', desc: 'Pakaian ibadah shalat' },
  { id: 'Batik Hijab', label: 'Batik & Jilbab', desc: 'Seragam resmi dengan jilbab' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '9:16 Story', value: '9:16' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface HajjUmrahStudioProps {
  onPreview: (url: string) => void;
}

export default function HajjUmrahStudio({ onPreview }: HajjUmrahStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [background, setBackground] = useState('Kaaba Front');
  const [gender, setGender] = useState<'pria' | 'wanita'>('pria');
  const [outfit, setOutfit] = useState('Ihram');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenderChange = (newGender: 'pria' | 'wanita') => {
    setGender(newGender);
    setOutfit(newGender === 'pria' ? MALE_OUTFITS[0].id : FEMALE_OUTFITS[0].id);
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
      setError('Harap unggah setidaknya satu foto wajah/diri Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    let hajjPrompt = `A high-quality spiritual photography of a ${gender === 'pria' ? 'man' : 'woman'} in a sacred journey to the Holy Land. `;
    hajjPrompt += `The subject is ${gender === 'wanita' ? 'wearing a beautiful and modest ' + outfit + ' including a properly worn hijab' : 'wearing ' + outfit}. `;
    hajjPrompt += `Background/Setting: ${background}. `;
    
    if (customPrompt) hajjPrompt += `Additional artistic direction: ${customPrompt}. `;
    
    hajjPrompt += "Atmosphere: Divine, peaceful, serene, professional studio-quality lighting, soft cinematic colors, realistic crowds of pilgrims in the distant background. 8k resolution, photorealistic. ";
    
    if (keepFace) {
      hajjPrompt += "CRITICAL IDENTITY LOCK: Maintain the EXACT facial features, skin tone, and unique identity of the person from the source images. Do not change who they are. ";
    }

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        hajjPrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: hajjPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto bertema Haji/Umrah.');
    } finally {
      setLoading(false);
    }
  };

  const currentOutfits = gender === 'pria' ? MALE_OUTFITS : FEMALE_OUTFITS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-600/30">
                <MoonStar className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Haji & Umrah Studio</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Visual Ibadah Creator</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Anda (1-5)
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
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-emerald-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Gender Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Pilih Gender
              </label>
              <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
                <button 
                  onClick={() => handleGenderChange('pria')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${gender === 'pria' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <UserRound className="w-4 h-4" />
                  Laki-laki
                </button>
                <button 
                  onClick={() => handleGenderChange('wanita')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${gender === 'wanita' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <UserRoundCheck className="w-4 h-4" />
                  Perempuan
                </button>
              </div>
            </div>

            {/* Step 3: Outfit (Dynamic) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Pilihan Busana
              </label>
              <div className="grid grid-cols-1 gap-2">
                {currentOutfits.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOutfit(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${outfit === opt.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className="text-left">
                      <div className={`text-[11px] font-bold ${outfit === opt.id ? 'text-emerald-400' : 'text-slate-300'}`}>{opt.label}</div>
                      <div className="text-[9px] opacity-70">{opt.desc}</div>
                    </div>
                    {outfit === opt.id && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Background */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Lokasi & Suasana
              </label>
              <div className="grid grid-cols-1 gap-2">
                {BACKGROUND_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setBackground(opt.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border transition-all ${background === opt.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className={`w-3 h-3 ${background === opt.id ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className={`text-[11px] font-bold ${background === opt.id ? 'text-emerald-400' : 'text-slate-300'}`}>{opt.label}</span>
                    </div>
                    <span className="text-[9px] opacity-70 line-clamp-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Detail & Ratio */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">5</span>
                Kustomisasi & Rasio
              </label>
              <textarea 
                placeholder="E.g. Tersenyum tenang, memegang tas paspor, cahaya matahari terbenam..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-5 h-5 ${keepFace ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-bold text-slate-300">Kunci Identitas Wajah</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${keepFace ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

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
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xl shadow-emerald-900/40 border border-emerald-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-white">Merakit Moment Suci...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate Foto Ibadah</span>
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
             <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <MoonStar className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Haji & Umrah AI Studio</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Abadikan kerinduan akan Tanah Suci. Pilih gender dan busana yang sesuai, biarkan AI kami menempatkan Anda di titik-titik mustajab dengan sempurna.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: User, title: "1. Foto Wajah", text: "Gunakan 1-5 foto wajah yang jelas agar AI dapat mengenali identitas Anda dengan sangat presisi." },
                    { icon: MoonStar, title: "2. Busana Khusus", text: "Pilihan otomatis: Ihram/Gamis untuk Pria, atau Abaya/Mukena/Hijab elegan untuk Wanita." },
                    { icon: MapPin, title: "3. Spot Impian", text: "Pilih latar belakang Ka'bah, Masjid Nabawi, hingga suasana mabit di Mina yang terasa sangat nyata." },
                    { icon: CheckCircle2, title: "4. Kualitas HD", text: "Dapatkan 4 variasi hasil dengan pencahayaan sinematik dan detail wajah yang tetap terjaga 100%." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-emerald-500/30 transition-all group backdrop-blur-sm">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-emerald-50 mb-3 text-lg">{step.title}</h3>
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
                     <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 animate-pulse" />
                     <MoonStar className="w-24 h-24 relative animate-bounce text-emerald-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-emerald-400">
                        Menghadirkan Nuansa Tanah Suci...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Memetakan identitas & busana muslimah/ihram</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-emerald-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img 
                        src={url} 
                        alt={`Spiritual Moment ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-emerald-600 text-white p-4 rounded-full hover:bg-emerald-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`hajj-umrah-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Spiritual Moment Captured</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{gender === 'wanita' ? 'Wanita' : 'Pria'} • {outfit} @ {background}</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     {keepFace && (
                       <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-black uppercase">Identity Protected</span>
                       </div>
                     )}
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