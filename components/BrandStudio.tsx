import React, { useState } from 'react';
import { 
  PenTool, 
  Megaphone, 
  Sparkles, 
  Layout, 
  Palette, 
  Type, 
  CheckCircle2, 
  Wand2,
  Box,
  Monitor,
  Feather,
  Cpu,
  Briefcase,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import LogoMaker from './LogoMaker';
import BannerMaker from './BannerMaker';

type BrandMode = 'logo' | 'banner';

interface BrandStudioProps {
  onPreview: (url: string) => void;
}

export default function BrandStudio({ onPreview }: BrandStudioProps) {
  const [activeMode, setActiveMode] = useState<BrandMode>('logo');

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Tool Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-2 shadow-2xl overflow-x-auto no-scrollbar">
           <button 
            onClick={() => setActiveMode('logo')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeMode === 'logo' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <PenTool className="w-4 h-4" /> Bikin Logo
           </button>
           <button 
            onClick={() => setActiveMode('banner')}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeMode === 'banner' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Megaphone className="w-4 h-4" /> Bikin Banner
           </button>
        </div>
      </div>

      <div className="space-y-8">
         {/* Welcome Header */}
         <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] animate-in slide-in-from-top-4 duration-700">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeMode === 'logo' ? 'bg-teal-500' : 'bg-indigo-500'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {activeMode === 'logo' ? 'Logo Design Engine' : 'Commercial Banner Forge'}
                </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
               Studio Brand AI
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
               {activeMode === 'logo' 
                 ? "Ciptakan identitas visual yang ikonik untuk brand Anda dalam hitungan detik menggunakan kecerdasan buatan." 
                 : "Rancang materi promosi profesional untuk website, media sosial, atau iklan cetak secara instan."}
            </p>
         </div>

         {/* Content Area */}
         <div className="animate-in fade-in zoom-in-95 duration-500">
            {activeMode === 'logo' ? (
              <LogoMaker onPreview={onPreview} />
            ) : (
              <BannerMaker onPreview={onPreview} />
            )}
         </div>

         {/* Feature Highlights */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeMode === 'logo' ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm uppercase">Magic Generation</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">AI kami merancang ribuan kombinasi visual untuk menemukan hasil yang paling estetis.</p>
                </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeMode === 'logo' ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Layout className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm uppercase">Customizable Ratios</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Sesuaikan ukuran desain Anda untuk kebutuhan berbagai platform media sosial.</p>
                </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeMode === 'logo' ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Box className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm uppercase">Pro Aesthetics</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">Hasil desain dengan standar kualitas agensi profesional yang siap pakai.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}