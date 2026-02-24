import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  Zap,
  Type,
  Layout,
  MousePointer2,
  Settings2,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Monitor,
  Megaphone
} from 'lucide-react';
import { AspectRatio, GenerationResult, UserRole } from '../types';
import { generateImagesFromText } from '../services/geminiService';

const BANNER_STYLES = [
  { id: 'Corporate', label: 'Korporat', desc: 'Bersih & Profesional' },
  { id: 'Creative', label: 'Kreatif', desc: 'Artistik & Unik' },
  { id: 'Sales', label: 'Promosi', desc: 'Berani & Menarik' },
  { id: 'Minimalist', label: 'Minimalis', desc: 'Elegan & Sederhana' },
  { id: 'Tech', label: 'Teknologi', desc: 'Futuristik & Modern' },
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: '3:1 Banner Luas', value: '3:1' },
  { label: '2:1 Banner Standar', value: '2:1' },
  { label: '16:9 Sinematik', value: '16:9' },
  { label: '1:1 Konten Sosial', value: '1:1' },
];

const COLOR_PRESETS = [
  { label: 'Royal Blue', value: '#1e40af' },
  { label: 'Success Green', value: '#15803d' },
  { label: 'Electric Purple', value: '#7e22ce' },
  { label: 'Deep Slate', value: '#334155' },
  { label: 'Vibrant Orange', value: '#ea580c' },
];

interface BannerMakerProps {
  onPreview: (url: string) => void;
  userRole?: UserRole;
}

export default function BannerMaker({ onPreview, userRole }: BannerMakerProps) {
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [cta, setCta] = useState('');
  const [style, setStyle] = useState('Corporate');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:1');
  const [primaryColor, setPrimaryColor] = useState('#1e40af');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!heading.trim()) {
      setError('Harap masukkan judul banner.');
      return;
    }

    setLoading(true);
    setError(null);

    let bannerPrompt = `A professional, high-end commercial banner design. `;
    bannerPrompt += `The banner features the main heading: "${heading}". `;
    if (subheading) bannerPrompt += `It includes a supporting sub-heading: "${subheading}". `;
    if (cta) bannerPrompt += `It features a clear Call To Action: "${cta}". `;
    
    bannerPrompt += `Visual Style: ${style}. `;
    bannerPrompt += `Dominant Color Palette: Centered around ${primaryColor}. `;
    
    bannerPrompt += `Composition requirements: Clean typography, well-balanced negative space for readability, professional graphic elements, high-quality textures, and a polished commercial aesthetic. The design should look like a professional web banner or advertising billboard. Avoid clutter. High resolution, 4k.`;

    try {
      const generatedUrls = await generateImagesFromText(bannerPrompt, aspectRatio);

      setResults(prev => [{
        imageUrls: generatedUrls,
        prompt: bannerPrompt,
        timestamp: Date.now()
      }, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membuat banner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Sidebar Config */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-slate-900 rounded-[2rem] border border-slate-800 p-7 shadow-2xl space-y-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Megaphone className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-xl font-bold">Banner Designer</h2>
          </div>

          <div className="space-y-6">
            {/* Step 1: Text Content */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">1</span>
                Konten Teks
              </label>
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Judul Utama (E.g. Diskon Akhir Tahun)"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                />
                <input 
                  type="text"
                  placeholder="Sub-judul (E.g. Hemat hingga 70%)"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                />
                <input 
                  type="text"
                  placeholder="Tombol / CTA (E.g. Belanja Sekarang)"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                />
              </div>
            </div>

            {/* Step 2: Visual Config */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">2</span>
                Gaya & Warna
              </label>
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BANNER_STYLES.map(s => <option key={s.id} value={s.id}>{s.label} - {s.desc}</option>)}
              </select>

              <div className="flex gap-2 items-center">
                {COLOR_PRESETS.map(p => (
                  <button 
                    key={p.value}
                    onClick={() => setPrimaryColor(p.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${primaryColor === p.value ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: p.value }}
                  />
                ))}
                <div className="relative w-8 h-8 rounded-full border border-slate-700 overflow-hidden">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="absolute inset-0 scale-150 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Step 3: Ratio */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">3</span>
                Rasio Aspek
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATIOS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      aspectRatio === r.value 
                      ? 'bg-indigo-600 border-indigo-400 text-white' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{r.value}</span>
                    <span className="text-[8px] opacity-60">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`group relative w-full overflow-hidden rounded-[1.25rem] py-4 transition-all active:scale-95 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20'
              }`}
            >
              {loading ? (
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-bold">Mendesain Banner...</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold">Hasilkan Desain Banner</span>
                </div>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Main Results Area */}
      <div className="lg:col-span-8 space-y-8">
        {results.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] p-8 md:p-12 min-h-[75vh]">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                <Megaphone className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-300">Banner Maker Guide</h2>
              <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
                Buat banner profesional untuk website, media sosial, atau promosi iklan Anda secara instan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Type className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">1. Masukkan Teks</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Tentukan judul, sub-judul, dan tombol ajakan (CTA) yang ingin ditampilkan di banner.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Palette className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">2. Pilih Gaya & Warna</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Pilih tema visual dan skema warna yang sesuai dengan branding produk Anda.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Layout className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">3. Sesuaikan Rasio</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Gunakan 3:1 untuk header website atau 1:1 untuk postingan Instagram promosi.
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-indigo-50 mb-2 text-sm">4. Hasilkan Desain</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Klik 'Generate' dan AI akan meracik 4 variasi banner iklan profesional siap pakai.
                    </p>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {loading && (
              <div className="grid grid-cols-1 gap-6">
                {[1,2].map(i => <div key={i} className="bg-slate-900 rounded-[2.5rem] p-4 border border-slate-800 animate-pulse min-h-[200px]" />)}
              </div>
            )}
            
            {results.map((result, idx) => (
              <div 
                key={result.timestamp} 
                className={`bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${idx === 0 ? 'ring-2 ring-indigo-500/30' : ''}`}
              >
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.imageUrls.map((url, vIdx) => (
                    <div key={vIdx} className="relative group rounded-3xl overflow-hidden bg-black border border-slate-800">
                      <div className={`w-full overflow-hidden ${aspectRatio === '3:1' ? 'aspect-[3/1]' : aspectRatio === '2:1' ? 'aspect-[2/1]' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-square'}`}>
                        <img 
                          src={url} 
                          alt={`Banner ${vIdx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          onClick={() => onPreview(url)}
                          className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <a 
                          href={url} 
                          download={`banner-${vIdx + 1}.png`}
                          className="bg-white text-slate-900 p-3 rounded-full hover:bg-slate-100 transition-all"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Judul: {heading}</span>
                     <span className="w-1 h-1 bg-slate-700 rounded-full" />
                     <span className="text-[10px] text-slate-500 uppercase">{aspectRatio} • {style}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold">{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
