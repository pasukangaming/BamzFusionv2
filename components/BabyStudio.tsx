import React, { useState } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Loader2, 
  Baby, 
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  Zap,
  Info,
  Calendar,
  Layout,
  User,
  Clock,
  Glasses,
  BabyIcon,
  Palette,
  ClipboardList,
  Smile,
  Activity,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Maximize2,
  Camera
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const ADAT_OPTIONS = [
  { id: "Tanpa Tema", label: "Tanpa Tema" },
  { id: "Jawa", label: "Adat Jawa" },
  { id: "Sunda", label: "Adat Sunda" },
  { id: "Minang", label: "Adat Minang" },
  { id: "Bali", label: "Adat Bali" },
  { id: "Batak", label: "Adat Batak" },
  { id: "Dayak", label: "Adat Dayak" },
  { id: "Papua", label: "Adat Papua" },
  { id: "Melayu", label: "Adat Melayu" }
];

const PROFESSION_OPTIONS = [
  { id: "Tanpa Tema", label: "Tanpa Tema" },
  { id: "Dokter", label: "Cita-cita: Dokter" },
  { id: "Pilot", label: "Cita-cita: Pilot" },
  { id: "Astronaut", label: "Cita-cita: Astronaut" },
  { id: "Polisi", label: "Cita-cita: Polisi" },
  { id: "Koki", label: "Cita-cita: Koki" },
  { id: "Insinyur", label: "Cita-cita: Insinyur" },
  { id: "Artis", label: "Cita-cita: Artis" },
  { id: "Atlet", label: "Cita-cita: Atlet" }
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Square', value: '1:1' },
  { label: '3:4 Portrait', value: '3:4' },
  { label: '9:16 Story', value: '9:16' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface BabyStudioProps {
  onPreview: (url: string) => void;
}

export default function BabyStudio({ onPreview }: BabyStudioProps) {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [babyName, setBabyName] = useState("");
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [adat, setAdat] = useState("Tanpa Tema");
  const [profession, setProfession] = useState("Tanpa Tema");
  const [ageValue, setAgeValue] = useState("1");
  const [ageUnit, setAgeUnit] = useState<'bulan' | 'tahun'>('bulan');
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (image) URL.revokeObjectURL(image.preview);
      setImage({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      });
      setError(null);
    }
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
  };

  const handleGenerate = async () => {
    if (!image) {
      setError('Harap unggah foto bayi untuk diproses.');
      return;
    }

    setLoading(true);
    setError(null);

    let babyPrompt = `A high-end professional studio baby photography session for a ${gender === 'male' ? 'baby boy' : 'baby girl'}. `;
    if (babyName) babyPrompt += `The baby's name is ${babyName}. `;
    babyPrompt += `Approximate age: ${ageValue} ${ageUnit === 'bulan' ? 'months' : 'years'} old. `;
    
    if (adat !== "Tanpa Tema") babyPrompt += `The baby is wearing very detailed and adorable ${adat} traditional Indonesian clothes. `;
    if (profession !== "Tanpa Tema") babyPrompt += `The baby is wearing a cute mini ${profession} costume with relevant small props. `;
    
    if (customPrompt) babyPrompt += `Artistic Direction: ${customPrompt}. `;
    
    babyPrompt += "Style: Soft cinematic studio lighting, pastel color palette, shallow depth of field, sharp focus on baby's facial expressions, 8k resolution. ";
    
    if (keepFace) {
      babyPrompt += "STRICT IDENTITY LOCK: Maintain the exact facial features, eye shape, and adorable identity of the baby from the source image. Preserve original cuteness 100%. ";
    }

    try {
      const generatedUrls = await transformImages([image.file], babyPrompt, aspectRatio, keepFace);
      setResults(prev => [{ imageUrls: generatedUrls, prompt: babyPrompt, timestamp: Date.now() }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses studio bayi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Control Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] border border-slate-800 p-5 md:p-8 shadow-2xl space-y-6 md:space-y-8 lg:sticky lg:top-20">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded-xl shadow-lg shadow-pink-500/20">
                <BabyIcon className="w-5 h-5 text-white" />
             </div>
             <div>
                <h2 className="text-lg md:text-xl font-bold">Studio Bayi</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dream Childhood Forge</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Image & Identity */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto & Identitas
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-28 shrink-0">
                  {image ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                      <img src={image.preview} alt="Baby" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => onPreview(image.preview)} className="p-2 bg-indigo-500 text-white rounded-xl">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={removeImage} className="p-2 bg-red-500 text-white rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-slate-800/50 transition-all group">
                      <Upload className="w-6 h-6 text-slate-600 mb-1 group-hover:text-pink-400" />
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                    <button 
                      onClick={() => setGender('male')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${gender === 'male' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500'}`}
                    >
                      Laki-laki
                    </button>
                    <button 
                      onClick={() => setGender('female')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${gender === 'female' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nama Si Kecil" 
                    value={babyName} 
                    onChange={(e) => setBabyName(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-500 uppercase shrink-0">Usia:</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="48"
                          value={ageValue} 
                          onChange={(e) => setAgeValue(e.target.value)} 
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        />
                     </div>
                     <select 
                        value={ageUnit}
                        onChange={(e) => setAgeUnit(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-300 focus:outline-none"
                     >
                        <option value="bulan">Bulan</option>
                        <option value="tahun">Tahun</option>
                     </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Theme */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Tema Kostum
              </label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-widest">Budaya & Adat</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ADAT_OPTIONS.slice(0, 9).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setAdat(opt.id)}
                        className={`py-2 rounded-xl text-[9px] font-bold border transition-all truncate px-1 ${adat === opt.id ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                      >
                        {opt.id}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-600 uppercase ml-1 tracking-widest">Profesi & Cita-cita</span>
                  <select 
                    value={profession} 
                    onChange={(e) => setProfession(e.target.value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none"
                  >
                    {PROFESSION_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Config */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Kustomisasi & Rasio
              </label>
              <textarea 
                placeholder="E.g. Tersenyum lebar, memegang boneka beruang..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500 h-20 placeholder:text-slate-600"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-pink-600/10 border-pink-500 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-5 h-5 ${keepFace ? 'text-pink-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-bold text-slate-300">Face Locked</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${keepFace ? 'bg-pink-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`px-1 py-2.5 rounded-xl text-[9px] font-bold border transition-all ${
                      aspectRatio === r.value ? 'bg-white border-white text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
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
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-xl shadow-pink-900/20 border border-pink-500/30'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Menyiapkan Studio...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg uppercase tracking-tight">Hasilkan Foto</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Results Main View */}
      <div className="lg:col-span-8 space-y-6 md:space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-16 min-h-[40vh] md:min-h-[75vh] items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-pink-500/5 pointer-events-none" />
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 border border-slate-800 shadow-2xl rotate-3">
                <BabyIcon className="w-10 h-10 md:w-12 md:h-12 text-pink-500" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Baby Studio AI</h2>
              <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed">
                Ubah momen berharga si kecil menjadi visual kreatif bertema adat Nusantara atau profesi impian dengan kualitas studio profesional.
              </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full mt-10 md:mt-12 text-left">
                {[
                    { icon: Camera, title: "1. Foto Jelas", text: "Gunakan foto wajah bayi yang tampak jelas untuk hasil identitas terbaik." },
                    { icon: Palette, title: "2. Pilih Kostum", text: "Tersedia kostum adat Nusantara dan seragam profesi lucu." },
                    { icon: Sparkles, title: "3. Lighting Lembut", text: "AI memberikan pencahayaan studio pastel yang estetik." },
                    { icon: CheckCircle2, title: "4. Hasil 8K", text: "Dapatkan 4 variasi foto resolusi tinggi yang nyata." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-slate-800/60 hover:border-pink-500/30 transition-all backdrop-blur-sm">
                        <div className="w-10 h-10 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                            <step.icon className="w-5 h-5 text-pink-400" />
                        </div>
                        <h3 className="font-bold text-pink-50 mb-1 md:mb-2 text-sm md:text-base">{step.title}</h3>
                        <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">{step.text}</p>
                    </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-3xl md:rounded-[3rem] p-8 md:p-10 flex flex-col items-center justify-center gap-6 md:gap-8 min-h-[40vh] md:min-h-[50vh]">
                  <div className="relative">
                     <div className="absolute inset-0 bg-pink-500 blur-[80px] opacity-20 animate-pulse" />
                     <BabyIcon className="w-16 h-16 md:w-24 md:h-24 relative animate-bounce text-pink-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-xl md:text-2xl tracking-tighter uppercase italic animate-pulse text-pink-400">
                        Menata Kostum Si Kecil...
                     </p>
                     <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest italic">Menjaga kemiripan wajah & kelucuan alami</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-3xl md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-pink-500/20' : ''}`}
              >
                <div className="p-3 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-square">
                      <img 
                        src={url} 
                        alt={`Baby Result ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-pink-600 text-white p-3 md:p-4 rounded-full hover:bg-pink-500 transition-all shadow-xl"
                        >
                          <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`baby-studio-${vIdx + 1}.png`}
                          className="bg-white text-slate-900 p-3 md:p-4 rounded-full hover:bg-slate-100 transition-all shadow-xl"
                        >
                          <Download className="w-5 h-5 md:w-6 md:h-6" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 md:p-8 bg-slate-900/95 border-t border-slate-800 flex flex-col md:flex-row md:flex-wrap justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Studio Baby Success</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{adat !== 'Tanpa Tema' ? adat : profession} Theme</span>
                     </div>
                     <span className="hidden md:block w-px h-8 bg-slate-800 mx-2" />
                     {keepFace && (
                       <div className="flex items-center gap-2 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/20">
                          <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                          <span className="text-[10px] text-pink-400 font-black uppercase tracking-tight">Identity Match OK</span>
                       </div>
                     )}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="w-full p-3 bg-black/30 rounded-xl border border-white/5">
                     <p className="text-[9px] text-slate-500 italic font-mono line-clamp-1">Prompt: "{result.prompt}"</p>
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
