import React from 'react';
import { 
  ArrowRight, 
  Rocket,
  Zap,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Info,
  CheckCircle2,
  Layers,
  Fingerprint
} from 'lucide-react';
import { Tab } from '../types';
import { NAV_CONFIG } from '../App';

interface HomeProps {
  onNavigate: (tab: Tab) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 md:space-y-20">
      {/* Hero Section */}
      <section className="relative pt-6 md:pt-12 pb-4 text-center px-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] -z-10 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] mb-6 animate-in slide-in-from-top-4 duration-700">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Ramadhan Edition Engine Active</span>
        </div>

        <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-emerald-100 to-slate-400 leading-[1.1]">
          Rayakan Ramadhan <br className="hidden md:block" /> Dengan Kreativitas AI
        </h2>
        
        <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium px-4">
          Wujudkan momen spesial Ramadhan dan Idul Fitri Anda dengan kualitas studio profesional sekejap mata.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-5 px-4">
          <button 
            onClick={() => onNavigate('ramadhan-studio')}
            className="group relative bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest inline-flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 transition-all active:scale-95 overflow-hidden"
          >
            <Rocket className="w-4 h-4" /> Mulai Edisi Ramadhan
          </button>
          <button 
            onClick={() => onNavigate('eid-cards')}
            className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest inline-flex items-center justify-center gap-3 transition-all border border-white/10 active:scale-95"
          >
            Buat Kartu Ucapan <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Usage Instructions Global */}
      <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10">
         <div className="text-center space-y-2">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">Panduan Penggunaan</h3>
            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Cara Kerja Bamz Fusion</h4>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Layers, 
                title: "1. Pilih Studio", 
                text: "Gunakan sidebar (desktop) atau menu burger (mobile) untuk memilih fitur sesuai kebutuhan Anda (Fashion, Produk, dsb)." 
              },
              { 
                icon: Fingerprint, 
                title: "2. Input Aset", 
                text: "Unggah 1-5 foto referensi. Untuk studio wajah, pastikan wajah terlihat jelas agar fitur Identity Lock bekerja maksimal." 
              },
              { 
                icon: Zap, 
                title: "3. Render & Download", 
                text: "Klik tombol Generate dan tunggu beberapa detik. AI akan memberikan 4 variasi hasil resolusi tinggi yang siap diunduh." 
              }
            ].map((step, i) => (
              <div key={i} className="space-y-4 text-center md:text-left group">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto md:mx-0 group-hover:scale-110 transition-transform group-hover:bg-emerald-600/20">
                    <step.icon className="w-6 h-6 text-emerald-500" />
                 </div>
                 <h5 className="font-black text-white uppercase tracking-tight text-sm">{step.title}</h5>
                 <p className="text-slate-500 text-xs leading-relaxed">{step.text}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Tools Grid */}
      {NAV_CONFIG.map((group, groupIdx) => (
        <section key={groupIdx} className="space-y-6">
          <div className="flex items-center gap-3 px-1">
             <div className="h-px flex-1 bg-white/[0.05]" />
             <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap">
               {group.group}
             </h3>
             <div className="h-px flex-1 bg-white/[0.05]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {group.items.map((item) => (
              <div 
                key={item.id}
                onClick={() => onNavigate(item.id as Tab)}
                className="group relative bg-[#064e3b]/20 border border-white/[0.03] p-5 md:p-7 rounded-2xl md:rounded-[2rem] cursor-pointer hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all duration-300 flex flex-col"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
                  <item.icon className="text-white w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2 text-slate-100 group-hover:text-emerald-400 transition-colors">{item.label}</h3>
                  <p className="text-slate-500 text-[11px] md:text-sm leading-relaxed mb-4 md:mb-6">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center text-slate-400 text-[9px] font-black uppercase tracking-widest gap-1 group-hover:text-white transition-all">
                  Gunakan <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}