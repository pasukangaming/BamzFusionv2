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
  Move3d,
  Camera,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Smartphone,
  User as UserIcon
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const ANGLES = [
  { id: 'Frontal', label: 'Frontal (Wajah Depan)', desc: 'Tampak depan lurus', icon: UserIcon },
  { id: 'POV Selfie', label: 'POV Selfie', desc: 'Gaya foto selfie sendiri', icon: Smartphone },
  { id: 'Side View (Left)', label: 'Sisi Kiri', desc: 'Profil dari kiri', icon: ArrowLeft },
  { id: 'Side View (Right)', label: 'Sisi Kanan', desc: 'Profil dari kanan', icon: ArrowRight },
  { id: 'Three-Quarter View', label: '3/4 Angle', desc: 'Sudut klasik semi-profil', icon: RotateCcw },
  { id: 'High Angle / Bird\'s Eye', label: 'High Angle', desc: 'Kamera dari atas melihat ke bawah', icon: ArrowDown },
  { id: 'Low Angle / Worm\'s Eye', label: 'Low Angle', desc: 'Kamera dari bawah melihat ke atas', icon: ArrowUp },
  { id: 'Dutch Angle (Tilted)', label: 'Dutch Angle', desc: 'Sudut miring sinematik', icon: Maximize2 },
  { id: 'Random / Creative AI', label: 'Creative Random', desc: 'Biarkan AI memilih angle terbaik', icon: Sparkles },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:4 Portrait', value: '3:4' },
  { label: '1:1 Square', value: '1:1' },
  { label: '9:16 Story', value: '9:16' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface ChangeAngleStudioProps {
  onPreview: (url: string) => void;
}

export default function ChangeAngleStudio({ onPreview }: ChangeAngleStudioProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedAngle, setSelectedAngle] = useState('Frontal');
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
      setError('Harap unggah setidaknya satu foto subjek.');
      return;
    }

    setLoading(true);
    setError(null);

    let anglePrompt = `A high-end professional photography session with a specific camera perspective. `;
    anglePrompt += `The camera angle is: ${selectedAngle}. `;
    
    if (selectedAngle === 'POV Selfie') {
      anglePrompt += `Action: The subject is taking a high-quality selfie. Include a realistic view of their arm extended towards the camera. The perspective should have slight wide-angle lens distortion typical of a modern smartphone front camera. The subject should be looking directly into the 'lens' with a natural expression. `;
    } else if (selectedAngle === 'Random / Creative AI') {
      anglePrompt += `AI: Choose a highly dynamic, unique, and artistically impactful camera angle that best suits the subject. Explore extreme perspectives for a high-fashion feel. `;
    }

    if (customPrompt) anglePrompt += `Additional instructions: ${customPrompt}. `;
    
    anglePrompt += "Visual Style: Professional cinematic photography, sharp focus on the subject, natural lighting that follows the new perspective, high detail, 8k resolution. ";
    
    if (keepFace) {
      anglePrompt += "CRITICAL: Maintain the EXACT facial identity and features of the person from the source images. Preserve their bone structure and unique traits 100% while changing the viewing angle. ";
    }

    try {
      const generatedUrls = await transformImages(
        images.map(img => img.file),
        anglePrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: anglePrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah sudut kamera.');
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
             <div className="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-600/30">
                <Move3d className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold">Ubah Angle AI</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Perspective Shifter Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: Uploads */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Foto Subjek (1-5)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700 bg-slate-800">
                    <img src={img.preview} alt="Subject" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group">
                    <Upload className="w-5 h-5 text-slate-600 mb-1 group-hover:text-violet-400" />
                    <span className="text-[8px] text-slate-500 font-bold uppercase text-center">Tambah</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            {/* Step 2: Angle Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Pilih Sudut Kamera
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ANGLES.map(angle => (
                  <button
                    key={angle.id}
                    onClick={() => setSelectedAngle(angle.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left ${selectedAngle === angle.id ? 'bg-violet-600/10 border-violet-500 shadow-inner' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <angle.icon className={`w-3.5 h-3.5 ${selectedAngle === angle.id ? 'text-violet-400' : 'text-slate-600'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-tight ${selectedAngle === angle.id ? 'text-violet-300' : 'text-slate-400'}`}>{angle.label}</span>
                    </div>
                    <span className="text-[8px] opacity-60 line-clamp-1">{angle.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Detail & Precision */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Detail & Konfigurasi
              </label>
              <textarea 
                placeholder="E.g. Tambahkan ekspresi serius, cahaya dari samping, gaya potret bisnis..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 h-24 placeholder:text-slate-600 transition-all"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-violet-500/10 border-violet-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`w-5 h-5 ${keepFace ? 'text-violet-400' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-bold text-slate-300">Kunci Identitas Wajah</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${keepFace ? 'bg-violet-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>

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
                : 'bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white shadow-xl shadow-violet-900/40 border border-violet-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[44px]">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-400 mb-1" />
                  <span className="text-sm font-bold animate-pulse text-white">Menghitung Sudut Perspektif...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Shift Perspective</span>
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
             <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />
             <div className="flex flex-col items-center text-center mb-16 relative z-10">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <Move3d className="w-12 h-12 text-violet-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Perspective AI Studio</h2>
              <p className="text-slate-500 max-w-xl text-base leading-relaxed">
                Ubah cara dunia melihat foto Anda. Ambil foto dari sudut manapun dan biarkan AI merender ulang perspektifnya menjadi POV Selfie, Side View, atau sudut miring sinematik tanpa kehilangan identitas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
                {[
                    { icon: Camera, title: "1. Foto Subjek", text: "Unggah foto target yang ingin diubah sudut pandangnya. AI akan memetakan volume 3D wajah." },
                    { icon: RotateCcw, title: "2. Pilih Perspektif", text: "Tentukan angle baru: POV Selfie, Sisi kiri/kanan, atau bird's eye view yang dramatis." },
                    { icon: Sparkles, title: "3. AI Creative Mode", text: "Gunakan fitur Creative Random untuk membiarkan AI menemukan sudut kamera paling artistik." },
                    { icon: CheckCircle2, title: "4. Kualitas Pro", text: "Dapatkan 4 hasil dengan detail tekstur dan pencahayaan yang menyesuaikan angle baru secara realistis." }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 hover:border-violet-500/30 transition-all group backdrop-blur-sm shadow-xl">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <step.icon className="w-6 h-6 text-violet-400" />
                        </div>
                        <h3 className="font-bold text-violet-50 mb-3 text-lg">{step.title}</h3>
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
                     <div className={`absolute inset-0 bg-violet-500 blur-[80px] opacity-20 animate-pulse`} />
                     <Move3d className="w-24 h-24 relative animate-spin-slow text-violet-500/30" />
                  </div>
                  <div className="text-center space-y-3">
                     <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-violet-400">
                        Meregenerasi Ruang 3D...
                     </p>
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Menghitung bayangan & geometri baru</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-violet-500/20' : ''}`}
              >
                <div className="p-6 grid grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img 
                        src={url} 
                        alt={`Angle Variation ${vIdx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-violet-600 text-white p-4 rounded-full hover:bg-violet-500 transition-all shadow-xl hover:scale-110 active:scale-95"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <a 
                          href={url} 
                          download={`angle-shift-${vIdx + 1}.png`}
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
                        <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Perspective Success</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{selectedAngle} View Mode</span>
                     </div>
                     <span className="w-px h-8 bg-slate-800 mx-2" />
                     {keepFace && (
                       <div className="flex items-center gap-2 bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20">
                          <UserCheck className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-[10px] text-violet-400 font-black uppercase">Face Consistent</span>
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
