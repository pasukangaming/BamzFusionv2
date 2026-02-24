
import React, { useState } from 'react';
import { 
  Scissors, 
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
  User,
  Crown,
  Smile,
  ShieldCheck,
  Fingerprint,
  Maximize2
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const HAIR_STYLES = [
  { id: 'Buzz Cut', label: 'Buzz Cut', desc: 'Sangat pendek & praktis' },
  { id: 'Undercut Fade', label: 'Undercut Fade', desc: 'Samping tipis, atas panjang' },
  { id: 'Pompadour', label: 'Pompadour', desc: 'Klasik & Bervolume' },
  { id: 'Mullet Modern', label: 'Mullet Modern', desc: 'Pendek depan, panjang belakang' },
  { id: 'Comma Hair', label: 'Comma Hair', desc: 'Gaya K-Pop trendy' },
  { id: 'Long Wavy', label: 'Long Wavy', desc: 'Gondrong bergelombang' },
];

const BEARD_STYLES = [
  { id: 'Clean Shaven', label: 'Clean Shaven', desc: 'Cukur bersih' },
  { id: 'Heavy Stubble', label: 'Heavy Stubble', desc: 'Kumis & jenggot tipis' },
  { id: 'Full Beard', label: 'Full Beard', desc: 'Jenggot lebat rapi' },
  { id: 'Van Dyke', label: 'Van Dyke', desc: 'Kumis & jenggot lancip' },
];

const HAIR_COLORS = [
  { id: 'Natural Black', label: 'Hitam Alami' },
  { id: 'Platinum Blonde', label: 'Platinum Blonde' },
  { id: 'Ash Brown', label: 'Ash Brown' },
  { id: 'Silver Fox', label: 'Silver Grey' },
  { id: 'Midnight Blue', label: 'Midnight Blue' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '9:16 Story', value: '9:16' },
];

interface BarbershopProps {
  onPreview: (url: string) => void;
}

export default function Barbershop({ onPreview }: BarbershopProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [hairStyle, setHairStyle] = useState('Undercut Fade');
  const [beardStyle, setBeardStyle] = useState('Clean Shaven');
  const [hairColor, setHairColor] = useState('Natural Black');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setError('Harap unggah foto wajah Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    let barberPrompt = `Professional barbershop grooming transformation. Target Hairstyle: ${hairStyle}. Target Beard: ${beardStyle}. Hair Color: ${hairColor}. `;
    
    barberPrompt += "Environment: High-end barbershop interior with cinematic lighting. Sharp focus on hair textures and grooming precision. 8k resolution. ";
    
    if (keepFace) {
      barberPrompt += "STRICT IDENTITY MANDATE: Preserve the EXACT facial identity and features of the person from the source images. Only transform the hair and beard. Do not alter facial bone structure. ";
    }

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        barberPrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: barberPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan pada sistem Barbershop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-lime-600 p-2.5 rounded-2xl shadow-lg shadow-lime-600/30">
                <Scissors className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Barbershop AI</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Strict Identity Locked</p>
             </div>
          </div>

          <div className="space-y-6">
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
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-lime-500 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-lime-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Proteksi Identitas
              </label>
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-lime-500/10 border-lime-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${keepFace ? 'bg-lime-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 block">Strict Face Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase">Identity Shield Active</span>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${keepFace ? 'bg-lime-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <select 
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
                >
                  {HAIR_STYLES.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
                </select>
                <select 
                  value={beardStyle}
                  onChange={(e) => setBeardStyle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
                >
                  {BEARD_STYLES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4.5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : 'bg-gradient-to-r from-lime-600 to-indigo-600 text-white shadow-xl shadow-lime-600/20'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-lime-400 mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghitung Biometrik...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate Style</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="h-full min-h-[500px] bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-lime-500/5 pointer-events-none" />
             
             <div className="flex flex-col items-center text-center mb-10 md:mb-16 relative z-10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 blur-3xl opacity-10 bg-lime-500 animate-pulse" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                    <Scissors className="w-10 h-10 md:w-12 md:h-12 text-lime-500" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">Barbershop AI Studio</h2>
                <p className="text-slate-500 max-w-xl text-sm md:text-base font-medium leading-relaxed px-4">
                  Coba ribuan gaya rambut dan jenggot secara instan dengan teknologi pemetaan identitas mutakhir.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full relative z-10 text-left">
                {[
                  { icon: User, title: "1. Unggah Selfie", text: "Masukkan foto wajah Anda dari depan. AI membutuhkan 1-5 referensi untuk hasil yang sangat mirip." },
                  { icon: Layout, title: "2. Pilih Gaya", text: "Tersedia gaya rambut modern mulai dari Undercut, Comma Hair, hingga Long Wavy yang trendy." },
                  { icon: ShieldCheck, title: "3. Face Lock", text: "Fitur ini memastikan struktur tulang wajah Anda tidak berubah, hanya rambut yang bertransformasi." },
                  { icon: CheckCircle2, title: "4. Render Master", text: "Dapatkan 4 hasil render dengan tekstur rambut yang tampak sangat nyata (fotorealistik 8K)." }
                ].map((step, i) => (
                  <div key={i} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-lime-500/30 transition-all group backdrop-blur-sm shadow-xl">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-lime-500/10 text-lime-400">
                          <step.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-indigo-50 mb-2 text-sm md:text-base uppercase tracking-tight">{step.title}</h3>
                      <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">{step.text}</p>
                  </div>
                ))}
             </div>

             <div className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full border border-lime-500/10 bg-lime-500/5 animate-pulse">
                <Fingerprint className="w-3.5 h-3.5 text-lime-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biometric Identity Safeguard Active</span>
             </div>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-8 min-h-[50vh]">
                  <Fingerprint className="w-24 h-24 text-lime-500/20 animate-pulse" />
                  <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-lime-400">Locking Identity Markers...</p>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div key={result.timestamp} className="bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img src={url} alt="Barber" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Identity Shield Active</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => onPreview(url)} className="bg-lime-600 text-white p-4 rounded-full"><Eye className="w-6 h-6" /></button>
                        <a href={url} download={`barber-${vIdx + 1}.png`} className="bg-white text-slate-900 p-4 rounded-full"><Download className="w-6 h-6" /></a>
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
  );
}
