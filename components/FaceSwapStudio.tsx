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
  RefreshCcw,
  User,
  Image as ImageIcon,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Layers,
  Camera,
  Fingerprint
} from 'lucide-react';
import { ImageFile, AspectRatio, GenerationResult } from '../types';
import { transformImages } from '../services/geminiService';

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '1:1 Square', value: '1:1' },
  { label: '3:4 Portrait', value: '3:4' },
  { label: '9:16 Story', value: '9:16' },
  { label: '4:3 Classic', value: '4:3' },
  { label: '16:9 Cinema', value: '16:9' },
];

interface FaceSwapStudioProps {
  onPreview: (url: string) => void;
}

export default function FaceSwapStudio({ onPreview }: FaceSwapStudioProps) {
  const [sourceFace, setSourceFace] = useState<ImageFile | null>(null);
  const [targetScene, setTargetScene] = useState<ImageFile | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [keepFace, setKeepFace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'target') => {
    const file = e.target.files?.[0];
    if (file) {
      const newImage = {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      };
      if (type === 'source') {
        if (sourceFace) URL.revokeObjectURL(sourceFace.preview);
        setSourceFace(newImage);
      } else {
        if (targetScene) URL.revokeObjectURL(targetScene.preview);
        setTargetScene(newImage);
      }
      setError(null);
    }
  };

  const removeImage = (type: 'source' | 'target') => {
    if (type === 'source') {
      if (sourceFace) URL.revokeObjectURL(sourceFace.preview);
      setSourceFace(null);
    } else {
      if (targetScene) URL.revokeObjectURL(targetScene.preview);
      setTargetScene(null);
    }
  };

  const handleGenerate = async () => {
    if (!sourceFace || !targetScene) {
      setError('Harap unggah kedua foto (Sumber Wajah & Foto Target).');
      return;
    }

    setLoading(true);
    setError(null);

    const swapPrompt = `ULTRA-PRECISE FACE SWAP MISSION. 
    1. Identify the subject in the TARGET image (Image 2).
    2. Replace their face with the 100% EXACT facial features, bone structure, and unique identity markers from the SOURCE face image (Image 1).
    3. Seamlessly match skin tone, shadows, and resolution.
    4. Keep all original clothing, hair style, and background from the target scene.
    STRICT IDENTITY LOCK: Result must be instantly recognizable as the source subject. No generic morphing.`;

    try {
      const generatedUrls = await transformImages(
        [sourceFace.file, targetScene.file],
        swapPrompt,
        aspectRatio,
        keepFace
      );

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: swapPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pertukaran wajah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Control */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="bg-rose-600 p-2.5 rounded-2xl shadow-lg shadow-rose-600/30">
                <RefreshCcw className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Face Swap Pro</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">Identity Mapping Studio</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">1</span>
                Sumber Wajah
              </label>
              {sourceFace ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                  <img src={sourceFace.preview} alt="Source Face" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeImage('source')} className="p-2 bg-red-500 text-white rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-500/5 transition-all group">
                  <User className="w-7 h-7 text-slate-600 mb-2 group-hover:text-rose-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase text-center">Pilih Wajah</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'source')} />
                </label>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">2</span>
                Foto Target
              </label>
              {targetScene ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-700 bg-slate-800">
                  <img src={targetScene.preview} alt="Target Scene" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeImage('target')} className="p-2 bg-red-500 text-white rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-video rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
                  <ImageIcon className="w-7 h-7 text-slate-600 mb-2 group-hover:text-indigo-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase text-center">Pilih Target</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'target')} />
                </label>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">3</span>
                Proteksi Identitas
              </label>
              
              <div 
                onClick={() => setKeepFace(!keepFace)}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  keepFace ? 'bg-rose-500/10 border-rose-500/50 shadow-lg' : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${keepFace ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 block">Strict Face Lock</span>
                    <span className="text-[8px] text-slate-500 uppercase">Identity Shield Active</span>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${keepFace ? 'bg-rose-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${keepFace ? 'right-1' : 'left-1'}`} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`py-2 rounded-xl text-[9px] font-bold border transition-all ${
                      aspectRatio === r.value ? 'bg-rose-600 border-rose-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {r.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-3xl py-5 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-xl shadow-rose-900/40 border border-rose-500/30'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Memetakan Landmark Wajah...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-lg uppercase tracking-tight">Swap Identitas</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Results View */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3.5rem] p-10 md:p-16 min-h-[75vh] items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl rotate-3">
                <RefreshCcw className="w-12 h-12 text-rose-500" />
              </div>
              <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 uppercase">Face Swap Studio AI</h2>
              <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                Teknologi <b>Strict Biometric Locking</b> menjamin hasil pertukaran wajah yang 100% mirip dengan sumber aslinya.
              </p>
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {loading && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-8 min-h-[50vh]">
                  <Fingerprint className="w-24 h-24 text-rose-500/20 animate-pulse" />
                  <p className="font-black text-2xl tracking-tighter uppercase italic animate-pulse text-rose-400">Locking Identity Markers...</p>
                </div>
              </div>
            )}
            
            {results.map((result, idx) => (
              <div key={result.timestamp} className="bg-slate-900 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-[2.5rem] overflow-hidden bg-black border border-slate-800 aspect-[3/4]">
                      <img src={url} alt="Swap Result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-6 left-6 pointer-events-none">
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl">
                            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Identity Shield Active</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => onPreview(url)} className="bg-rose-600 text-white p-4 rounded-full"><Eye className="w-6 h-6" /></button>
                        <a href={url} download={`swap-${vIdx + 1}.png`} className="bg-white text-slate-900 p-4 rounded-full"><Download className="w-6 h-6" /></a>
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