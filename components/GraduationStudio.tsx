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
  CheckCircle2,
  GraduationCap,
  Info,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Fingerprint,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const THEMES = [
  { id: 'Toga Sarjana', label: 'Sarjana (S1)', desc: 'Toga & topi wisuda standar' },
  { id: 'Toga Magister', label: 'Magister (S2)', desc: 'Toga dengan jubah lebih panjang' },
  { id: 'Toga Doktor', label: 'Doktor (S3)', desc: 'Toga dengan detail emas/beludru' },
  { id: 'Kebaya Wisuda', label: 'Kebaya Wisuda', desc: 'Kebaya modern/tradisional dengan jilbab/sanggul' },
];

const LOCATIONS = [
  { id: 'Graduation Podium', label: 'Podium Wisuda', desc: 'Momen sakral menerima ijazah' },
  { id: 'University Library', label: 'Perpustakaan', desc: 'Latar rak buku klasik universitas' },
  { id: 'Campus Garden', label: 'Taman Kampus', desc: 'Suasana outdoor gedung rektorat' },
  { id: 'Professional Studio', label: 'Studio Mewah', desc: 'Kesan bersih, modern, dan mahal' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '9:16 Story', value: '9:16' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface GraduationStudioProps {
  onPreview: (url: string) => void;
}

export default function GraduationStudio({ onPreview }: GraduationStudioProps) {
  const [identityImages, setIdentityImages] = useState<ImageFile[]>([]);
  const [styleRefImage, setStyleRefImage] = useState<ImageFile | null>(null);
  const [theme, setTheme] = useState('Toga Sarjana');
  const [location, setLocation] = useState('Graduation Podium');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [keepFace, setKeepFace] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleIdentityFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (identityImages.length + files.length > 4) {
      setError('Maksimal 4 foto wajah sebagai sumber identitas.');
      return;
    }
    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file)
    }));
    setIdentityImages(prev => [...prev, ...newImages]);
    setError(null);
  };

  const handleStyleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (styleRefImage) URL.revokeObjectURL(styleRefImage.preview);
      setStyleRefImage({
        id: 'style-ref',
        file,
        preview: URL.createObjectURL(file)
      });
      setError(null);
    }
  };

  const removeIdentity = (id: string) => {
    setIdentityImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== id);
    });
  };

  const removeStyle = () => {
    if (styleRefImage) URL.revokeObjectURL(styleRefImage.preview);
    setStyleRefImage(null);
  };

  const handleGenerate = async () => {
    if (identityImages.length === 0) {
      setError('Harap unggah setidaknya satu foto wajah Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    let gradPrompt = `PROFESSIONAL GRADUATION PORTRAIT MASTERCLASS. `;
    
    if (styleRefImage) {
      gradPrompt += `TASK: Using the STYLE REFERENCE IMAGE provided as a template for pose, lighting, and costume detail, transfer the identity of the person from the IDENTITY SOURCE IMAGES onto that template. `;
    }

    gradPrompt += `Costume: The subject is wearing a high-quality ${theme}. `;
    gradPrompt += `Environment: The subject is at the ${location}. `;
    
    if (customPrompt) gradPrompt += `Specific Additions: ${customPrompt}. `;
    
    gradPrompt += "Technical Style: Professional cinematic photography, 85mm lens portrait, sharp focus on facial features, natural skin texture, high-end studio lighting, 8k resolution. ";
    
    if (keepFace) {
      gradPrompt += `CRITICAL BIOMETRIC LOCK: You must preserve the EXACT facial identity of the person from the identity source images with 100% fidelity. Maintain the jawline, nose structure, eye shape, and unique markers. The result must be biometrically identical to the source person. `;
    }

    try {
      const allFiles = [...identityImages.map(img => img.file)];
      if (styleRefImage) allFiles.push(styleRefImage.file);

      const generatedUrls = await transformImages(
        allFiles,
        gradPrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: gradPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal menghasilkan foto wisuda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/30">
                <GraduationCap className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Wisuda Studio Pro</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Hyper-Realistic Identity Match</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Identity Source */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Anda (Identity Source)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {identityImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Identity Source" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeIdentity(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {identityImages.length < 4 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                    <Camera className="w-5 h-5 text-slate-600 mb-1 group-hover:text-blue-400" />
                    <span className="text-[7px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleIdentityFiles} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Style Reference */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Referensi Gaya / Pose (Opsional)
              </label>
              
              {styleRefImage ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden group border border-blue-500/50 bg-slate-800">
                  <img src={styleRefImage.preview} alt="Style Reference" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => onPreview(styleRefImage.preview)} className="p-2.5 bg-indigo-500 text-white rounded-xl">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={removeStyle} className="p-2.5 bg-red-500 text-white rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded shadow-lg">Template Pose</div>
                </div>
              ) : (
                <label className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                  <ImageIcon className="w-8 h-8 text-slate-600 mb-2 group-hover:text-blue-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase group-hover:text-blue-400">Pilih Foto Referensi (Gaya/Pose)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleStyleFile} />
                </label>
              )}
              <p className="text-[9px] text-slate-500 leading-tight italic">Jika diunggah, AI akan mengikuti pose dan pencahayaan foto ini.</p>
            </div>

            {/* Step 3: Theme & Details */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Atur Toga & Suasana
              </label>
              <div className="grid grid-cols-1 gap-2">
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {THEMES.map(t => <option key={t.id} value={t.id}>{t.label} - {t.desc}</option>)}
                </select>
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-[11px] font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {LOCATIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            {/* Step 4: Strict Identity Shield */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">4</span>
                Identity Shield Control
              </label>
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-900/10' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${keepFace ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 block">Strict Face Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase">100% Similarity Verification</span>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${keepFace ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              <textarea 
                placeholder="Detail tambahan (E.g. Memegang bunga, kacamata hitam, ekspresi bangga...)"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />

              <div className="grid grid-cols-4 gap-2">
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
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-4.5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-xl shadow-blue-900/40 border border-blue-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghitung Biometrik Wajah...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Render Foto Wisuda</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Area */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] relative overflow-hidden items-center justify-center">
             <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <GraduationCap className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Graduation Portrait Pro</h2>
              <p className="text-slate-500 max-w-xl text-base md:text-lg font-medium leading-relaxed">
                Transformasikan selfie Anda menjadi potret wisuda profesional. Sekarang dengan dukungan <b>Referensi Gaya</b>: Unggah contoh foto wisuda favorit Anda, dan AI akan menaruh wajah Anda di sana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: Fingerprint, title: "1. Biometric Mapping", text: "AI memetakan volume 3D wajah Anda dari 1-4 foto sumber untuk menjamin kemiripan mutlak." },
                    { icon: ImageIcon, title: "2. Style Reference", text: "Unggah foto wisuda orang lain sebagai 'kerangka' gaya, pose, dan pencahayaan yang Anda inginkan." },
                    { icon: Layers, title: "3. Toga Hyper-Detail", text: "Setiap lipatan kain dan tekstur topi wisuda diproses dengan standar iklan profesional." },
                    { icon: ShieldCheck, title: "4. Identity Shield", text: "Sistem pengunci wajah kami memastikan hasil akhir adalah Anda, bukan orang asing dalam balutan toga." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-blue-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-indigo-50 mb-3 text-lg uppercase tracking-tight">{step.title}</h3>
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
                     <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 animate-pulse" />
                     <GraduationCap className="w-24 h-24 relative animate-bounce text-blue-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic animate-pulse text-blue-400">
                        {styleRefImage ? 'Mentransfer Identitas ke Referensi...' : 'Merekonstruksi Foto Wisuda...'}
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Menyelaraskan wajah dengan struktur toga</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-blue-500/20 shadow-[0_20px_50px_rgba(37,99,235,0.1)]' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img 
                        src={url} 
                        alt={`Graduation Result ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-6 left-6 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <ShieldCheck className={`w-3.5 h-3.5 ${keepFace ? 'text-blue-400' : 'text-slate-400'}`} />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">
                               {keepFace ? 'Identity Shield Active' : 'Similarity Check'}
                            </span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`grad-photo-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Graduation Masterpiece Rendered</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{theme} • {location}</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Identity Verified</span>
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