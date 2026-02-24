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
  Camera,
  MapPin,
  User,
  UserRound,
  ShieldCheck,
  Fingerprint,
  Info
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const CONCEPTS = [
  { id: 'Cinematic Casual', label: 'Casual Sinematik', desc: 'Gaya santai dengan tone film' },
  { id: 'Vintage 90s', label: 'Vintage 90-an', desc: 'Gaya retro dengan butiran film' },
  { id: 'Minimalist Studio', label: 'Minimalis Korea', desc: 'Clean, estetik, dan elegan' },
  { id: 'Bohemian Nature', label: 'Bohemian Nature', desc: 'Bebas, artistik, dan menyatu alam' },
  { id: 'Classic Formal', label: 'Klasik Formal', desc: 'Jas & gaun simpel yang abadi' },
];

const LOCATIONS = [
  { id: 'Pine Forest', label: 'Hutan Pinus', desc: 'Suasana sejuk dengan sinar matahari menembus pohon' },
  { id: 'Beach Sunset', label: 'Pantai Matahari Terbenam', desc: 'Suasana romantis tepi laut' },
  { id: 'Old City / Heritage', label: 'Kota Tua', desc: 'Kesan klasik dan bersejarah' },
  { id: 'Aesthetic Cafe', label: 'Kafe Estetik', desc: 'Suasana urban yang modern' },
  { id: 'Mountain Range', label: 'Pegunungan', desc: 'Pemandangan alam yang megah' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '16:9 Cinema', value: '16:9' },
  { label: '1:1 Square', value: '1:1' },
];

interface PreweddingStudioProps {
  onPreview: (url: string) => void;
}

export default function PreweddingStudio({ onPreview }: PreweddingStudioProps) {
  const [maleImage, setMaleImage] = useState<ImageFile | null>(null);
  const [femaleImage, setFemaleImage] = useState<ImageFile | null>(null);
  const [concept, setConcept] = useState('Cinematic Casual');
  const [location, setLocation] = useState('Pine Forest');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setError('Harap unggah foto Pria DAN Wanita sebagai pasangan.');
      return;
    }

    setLoading(true);
    setError(null);

    let prewedPrompt = `A stunning cinematic pre-wedding photography session. `;
    prewedPrompt += `SUBJECT ASSIGNMENT: Image 1 is the man. Image 2 is the woman. Render them as a loving couple. `;
    prewedPrompt += `Concept: ${concept}. Location: ${location}. `;
    
    if (customPrompt) prewedPrompt += `Artistic Direction: ${customPrompt}. `;
    
    prewedPrompt += "Technical Style: Professional camera work, shallow depth of field, natural skin tones, 8k resolution. ";
    
    if (keepFace) {
      prewedPrompt += "STRICT BIOMETRIC LOCK: Preserve 100% facial similarity. Map Image 1 facial features onto the man, and Image 2 features onto the woman. No identity swapping or morphing. ";
    }

    try {
      const generatedUrls = await transformImages(
        [maleImage.file, femaleImage.file],
        prewedPrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: prewedPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto pre-wedding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-pink-500 p-2.5 rounded-2xl shadow-lg shadow-pink-500/30">
                <Camera className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Prewedding Studio</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Partner Perspective Sync</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Partner Uploads */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Pasangan
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Male Input */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-600 uppercase ml-1">Pria</span>
                  {maleImage ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                      <img src={maleImage.preview} alt="Man" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage('male')} className="absolute inset-0 m-auto w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                      <User className="w-6 h-6 text-slate-600 mb-1 group-hover:text-blue-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Unggah Pria</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'male')} />
                    </label>
                  )}
                </div>

                {/* Female Input */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-600 uppercase ml-1">Wanita</span>
                  {femaleImage ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                      <img src={femaleImage.preview} alt="Woman" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage('female')} className="absolute inset-0 m-auto w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all group">
                      <UserRound className="w-6 h-6 text-slate-600 mb-1 group-hover:text-pink-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Unggah Wanita</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'female')} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Gaya & Lokasi
              </label>
              <div className="grid grid-cols-1 gap-2">
                <select 
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
                >
                  {CONCEPTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300"
                >
                  {LOCATIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Proteksi Identitas
              </label>
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-900/10' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${keepFace ? 'bg-pink-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 block">Strict Face Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase">Identity Protection Active</span>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${keepFace ? 'bg-pink-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              <textarea 
                placeholder="E.g. Memakai kacamata hitam, saling menatap mesra..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`px-1 py-2.5 rounded-xl text-[9px] font-bold border transition-all ${
                      aspectRatio === r.value ? 'bg-white border-white text-slate-900 shadow-md' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
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
                : 'bg-gradient-to-r from-pink-600 to-rose-700 text-white shadow-xl shadow-pink-900/40 border border-pink-500/30'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menyelaraskan Sudut Cinta...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Generate Prewedding</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-pink-500/5 pointer-events-none" />
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Camera className="w-12 h-12 text-pink-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Prewedding AI Studio</h2>
              <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                Logika <b>Dual-Identity Mapping</b> memastikan wajah Anda dan pasangan tidak tertukar. Unggah foto wajah masing-masing, pilih konsep sinematik, dan lihat hasilnya secara ajaib.
              </p>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-8 min-h-[50vh]">
                  <Fingerprint className="w-24 h-24 text-pink-500/20 animate-pulse" />
                  <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-pink-400">Verifikasi Landmark Wajah...</p>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div key={result.timestamp} className="bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img src={url} alt="Prewedding" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Dual-Subject Identity Active</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => onPreview(url)} className="bg-rose-600 text-white p-4 rounded-full hover:bg-rose-500 transition-all shadow-xl hover:scale-110 active:scale-95"><Eye className="w-6 h-6" /></button>
                        <a href={url} download={`prewed-${vIdx + 1}.png`} className="bg-white text-slate-900 p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl hover:scale-110 active:scale-95"><Download className="w-6 h-6" /></a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-8 bg-slate-900/95 border-t border-slate-800 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Partner Mapping OK</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{concept} @ {location}</span>
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