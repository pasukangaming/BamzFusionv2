
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon,
  X,
  Home as HomeIcon,
  Settings,
  Menu,
  Baby,
  PenTool,
  ImagePlus,
  ScanSearch,
  Megaphone,
  Youtube,
  ShoppingBag,
  Shirt,
  Palette,
  Eraser,
  ScrollText,
  Search,
  Zap,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Scissors,
  ShieldCheck,
  MoonStar,
  Heart,
  Camera,
  Move3d,
  Flower,
  Box,
  Maximize,
  GraduationCap,
  Monitor,
  ChevronRight,
  Info,
  RotateCcw,
  PartyPopper,
  Lamp,
  Layers,
  Rocket,
  History,
  Wand2,
  MessageCircle,
  ExternalLink,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import Home from './components/Home';
import ImageTransformer from './components/ImageTransformer';
import TextToImage from './components/TextToImage';
import ImageToPrompt from './components/ImageToPrompt';
import KidsStudio from './components/KidsStudio';
import ProductPhotoStudio from './components/ProductPhotoStudio';
import ColorSwapper from './components/ColorSwapper';
import PhotoEditorStudio from './components/PhotoEditorStudio';
import ProductCopywriter from './components/ProductCopywriter';
import Barbershop from './components/Barbershop';
import HajjUmrahStudio from './components/HajjUmrahStudio';
import WeddingStudio from './components/WeddingStudio';
import ChangeAngleStudio from './components/ChangeAngleStudio';
import GraduationStudio from './components/GraduationStudio';
import MockupStudio from './components/MockupStudio';
import FashionStudio from './components/FashionStudio';
import { Tab } from './types';

export const NAV_CONFIG = [
  {
    group: "Bisnis & Sistem",
    items: [
      { id: 'fashion-studio', label: 'Fashion Studio', icon: Shirt, color: 'bg-indigo-600', text: 'text-indigo-400', desc: 'Katalog pakaian & model AI' },
      { id: 'img2prompt', label: 'Gambar ke Promt', icon: ScanSearch, color: 'bg-slate-600', text: 'text-slate-400', desc: 'Deskripsi dari foto' },
      { id: 'copywriter', label: 'Tulis Iklan', icon: ScrollText, color: 'bg-orange-600', text: 'text-orange-400', desc: 'Caption jualan otomatis' },
    ]
  },
  {
    group: "Kreasi Gambar",
    items: [
      { id: 'text2img', label: 'Buat Gambar', icon: ImagePlus, color: 'bg-indigo-600', text: 'text-indigo-400', desc: 'Ide tulisan jadi gambar' },
      { id: 'change-angle', label: 'Ubah Angle', icon: RotateCcw, color: 'bg-violet-600', text: 'text-violet-400', desc: 'Ganti sudut pandang kamera' },
      { id: 'img2img', label: 'Gambar ke Gambar', icon: ImageIcon, color: 'bg-blue-600', text: 'text-blue-400', desc: 'Edit foto via prompt' },
    ]
  },
  {
    group: "Studio Profesional",
    items: [
      { id: 'wedding-studio', label: 'Wedding & Prewed', icon: Heart, color: 'bg-rose-500', text: 'text-rose-400', desc: 'Foto nikah adat & casual' },
      { id: 'kids-studio', label: 'Kids & Baby', icon: Baby, color: 'bg-orange-500', text: 'text-orange-400', desc: 'Foto anak & bayi tema impian' },
      { id: 'photo-editor', label: 'Edit Foto AI', icon: Wand2, color: 'bg-cyan-600', text: 'text-cyan-400', desc: 'Hapus latar, perbaiki, perluas' },
      { id: 'mockup-studio', label: 'Buat Mockup', icon: Monitor, color: 'bg-violet-600', text: 'text-violet-400', desc: 'Tempel desain ke kaos/HP' },
      { id: 'barbershop', label: 'Coba Rambut', icon: Scissors, color: 'bg-lime-600', text: 'text-lime-400', desc: 'Gaya rambut baru AI' },
      { id: 'graduation-studio', label: 'Foto Wisuda', icon: GraduationCap, color: 'bg-blue-500', text: 'text-blue-400', desc: 'Foto wisuda estetik' },
      { id: 'color-swapper', label: 'Ganti Warna Pakaian', icon: Palette, color: 'bg-pink-600', text: 'text-pink-400', desc: 'Ganti warna baju instan' },
      { id: 'hajj-umrah', label: 'Haji & Umrah', icon: MoonStar, color: 'bg-emerald-600', text: 'text-emerald-400', desc: 'Foto tema Tanah Suci' },
      { id: 'product-photo', label: 'Studio Produk', icon: ShoppingBag, color: 'bg-emerald-600', text: 'text-amber-400', desc: 'Foto jualan profesional' },
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sharedPrompt, setSharedPrompt] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsConnected(hasKey);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
    if (tab !== 'text2img') setSharedPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return NAV_CONFIG;
    return NAV_CONFIG.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  const activeItem = useMemo(() => {
    if (activeTab === 'home') return { label: 'Dashboard', desc: 'Selamat datang kembali', icon: HomeIcon, text: 'text-indigo-400' };
    for (const group of NAV_CONFIG) {
      const found = group.items.find(i => i.id === activeTab);
      if (found) return found;
    }
    return null;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col md:flex-row font-inter selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Image Preview Overlay */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-4 right-4 p-3 bg-slate-900/50 rounded-full hover:bg-slate-800 z-[101] border border-slate-800 active:scale-90 transition-transform">
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl animate-in zoom-in-95 duration-300 object-contain"
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-white/[0.05] bg-[#070b15]/60 backdrop-blur-3xl sticky top-0 h-screen transition-all duration-500 ease-in-out z-50 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}
      >
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 bg-indigo-600 text-white p-1.5 rounded-full border-4 border-[#030712] hover:bg-indigo-500 transition-all z-50"
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>

        <div className="p-5 pb-4">
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 mb-6 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 rounded-xl shadow-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-black tracking-tighter text-white">BAMZ FUSION</h1>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block -mt-1 text-nowrap">Creative AI Studio</span>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari fitur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg pl-9 pr-3 py-2.5 text-[11px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar space-y-6">
          {filteredNav.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isSidebarCollapsed && (
                <h3 className="px-3 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 opacity-60">
                  {group.group}
                </h3>
              )}
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as Tab)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full ${
                    activeTab === item.id 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 shrink-0 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {!isSidebarCollapsed && (
                    <span className={`text-[12px] tracking-tight ${activeTab === item.id ? 'font-bold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-white/[0.05] bg-black/20">
            <button 
              onClick={() => navigateTo('settings')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full ${activeTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-400 hover:bg-white/[0.03]'}`}
            >
              <Settings className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span className="text-[12px] font-bold">Pengaturan</span>}
            </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-[#030712]/95 backdrop-blur-xl border-b border-white/[0.05] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => navigateTo('home')}>
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-sm tracking-tighter uppercase">BAMZ FUSION</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-slate-300 active:scale-90 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#030712] flex flex-col animate-in slide-in-from-bottom-6 duration-300">
          <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#070b15]">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">STUDIO TOOLS</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 bg-slate-900 rounded-full border border-white/10 active:scale-90 transition-transform">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5 pb-20 space-y-8 md:space-y-10">
             {/* Mobile Search */}
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Cari alat kreasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl pl-11 pr-4 py-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
             </div>

             {filteredNav.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    {group.group}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map(item => (
                      <button 
                        key={item.id}
                        onClick={() => navigateTo(item.id as Tab)}
                        className={`flex flex-col items-center justify-center p-4 md:p-5 rounded-[1.5rem] border transition-all text-center gap-2 md:gap-3 active:scale-95 ${
                          activeTab === item.id 
                          ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow-[0_10px_20px_rgba(79,70,229,0.1)]' 
                          : 'bg-white/[0.03] border-white/[0.05] text-slate-300'
                        }`}
                      >
                        <div className={`p-2.5 md:p-3 rounded-2xl shadow-lg transition-transform ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 group-hover:scale-110'}`}>
                          <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="text-[10px] md:text-xs font-black leading-tight uppercase tracking-tight line-clamp-1">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {activeTab !== 'home' && activeItem && (
          <header className="sticky top-[56px] md:top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.05] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
               <button 
                onClick={() => navigateTo('home')}
                className="p-2 md:p-2.5 hover:bg-white/5 rounded-xl text-slate-400 transition-colors active:scale-90 shrink-0"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <activeItem.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${activeItem.text}`} />
                    <h2 className="text-xs md:text-sm font-black uppercase tracking-tighter text-white truncate">{activeItem.label}</h2>
                  </div>
                  <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block mt-0.5 truncate">{activeItem.desc}</p>
               </div>
            </div>
            {isConnected && (
              <div className="flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
            )}
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
          <div 
            key={activeTab} 
            className="max-w-7xl mx-auto w-full p-4 md:p-10 lg:p-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both flex-1"
          >
            {activeTab === 'home' && <Home onNavigate={navigateTo} />}
            {activeTab === 'text2img' && <TextToImage onPreview={setPreviewImage} initialPrompt={sharedPrompt} />}
            {activeTab === 'img2prompt' && <ImageToPrompt onSendToTextToImage={(p) => { setSharedPrompt(p); setActiveTab('text2img'); }} onPreview={setPreviewImage} />}
            {activeTab === 'img2img' && <ImageTransformer onPreview={setPreviewImage} />}
            {activeTab === 'product-photo' && <ProductPhotoStudio onPreview={setPreviewImage} />}
            {activeTab === 'color-swapper' && <ColorSwapper onPreview={setPreviewImage} />}
            {activeTab === 'photo-editor' && <PhotoEditorStudio onPreview={setPreviewImage} />}
            {activeTab === 'copywriter' && <ProductCopywriter />}
            {activeTab === 'barbershop' && <Barbershop onPreview={setPreviewImage} />}
            {activeTab === 'hajj-umrah' && <HajjUmrahStudio onPreview={setPreviewImage} />}
            {activeTab === 'wedding-studio' && <WeddingStudio onPreview={setPreviewImage} />}
            {activeTab === 'change-angle' && <ChangeAngleStudio onPreview={setPreviewImage} />}
            {activeTab === 'graduation-studio' && <GraduationStudio onPreview={setPreviewImage} />}
            {activeTab === 'mockup-studio' && <MockupStudio onPreview={setPreviewImage} />}
            {activeTab === 'fashion-studio' && <FashionStudio onPreview={setPreviewImage} />}
            {activeTab === 'kids-studio' && <KidsStudio onPreview={setPreviewImage} />}
            
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-12 pb-24">
                <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="relative w-full max-w-lg">
                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 scale-150" />
                    <div className="relative bg-slate-900/60 p-8 md:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 shadow-2xl space-y-6">
                      <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl transition-all duration-700 ${isConnected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 rotate-6' : 'bg-slate-800'}`}>
                        <ShieldCheck className={`w-8 h-8 md:w-12 md:h-12 ${isConnected ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase">Studio Config</h3>
                        <p className={`font-black text-[10px] md:text-xs mt-2 uppercase tracking-[0.2em] ${isConnected ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                          {isConnected ? 'API Key Connected' : 'API Key Disconnected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-5 max-w-sm w-full px-2">
                    <button 
                      onClick={async () => {
                        // @ts-ignore
                        if (window.aistudio) await window.aistudio.openSelectKey();
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 border border-white/10 active:scale-95"
                    >
                      <Settings className="w-5 h-5" /> {isConnected ? 'Ubah API Key' : 'Hubungkan API Key'}
                    </button>
                  </div>
                </div>

                {/* Tutorial Section */}
                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="text-center space-y-2">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Panduan Aktivasi</h3>
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Cara Mendapatkan API Key Gratis</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { 
                        step: "01", 
                        icon: ExternalLink, 
                        title: "Buka Google AI Studio", 
                        text: "Kunjungi aistudio.google.com dan login menggunakan akun Google Anda." 
                      },
                      { 
                        step: "02", 
                        icon: KeyRound, 
                        title: "Buat API Key", 
                        text: "Klik tombol 'Get API Key' di sidebar kiri, lalu pilih 'Create API key in new project'." 
                      },
                      { 
                        step: "03", 
                        icon: ImageIcon, 
                        title: "Salin Kode", 
                        text: "Tunggu proses selesai, lalu klik 'Copy' pada kode unik yang muncul." 
                      },
                      { 
                        step: "04", 
                        icon: CheckCircle2, 
                        title: "Hubungkan Studio", 
                        text: "Kembali ke Bamz Fusion, klik tombol 'Hubungkan' di atas, lalu tempelkan kodenya." 
                      }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex gap-5 group hover:bg-white/[0.08] transition-colors">
                        <div className="shrink-0">
                          <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-6 h-6 text-indigo-500" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-600">{item.step}</span>
                            <h5 className="font-black text-white uppercase tracking-tight text-[11px]">{item.title}</h5>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex justify-center">
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                      Buka Google AI Studio <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Global Footer */}
          <footer className="mt-auto border-t border-white/[0.05] bg-[#070b15]/80 backdrop-blur-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
               <div className="flex flex-col items-center gap-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">© 2025 BAMZ FUSION STUDIO • Powered by Gemini AI</p>
                 <div className="h-1 w-8 bg-indigo-500/20 rounded-full" />
               </div>
               
               <div className="flex flex-col items-center gap-4">
                  <p className="text-xs text-slate-400 font-medium italic">Butuh bantuan atau kustomisasi khusus?</p>
                  <a 
                    href="https://wa.me/6285156433936" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white hover:shadow-xl hover:shadow-emerald-900/20 transition-all active:scale-95 group"
                  >
                    <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Hubungi via WhatsApp</span>
                  </a>
               </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
