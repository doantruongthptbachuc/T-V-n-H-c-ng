import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Facebook, 
  HeartHandshake, 
  HeartPulse,
  Home, 
  BookOpen, 
  HelpCircle, 
  Flag, 
  Camera, 
  Mail, 
  Menu, 
  X, 
  ShieldAlert, 
  Lock, 
  Sparkles,
  Award,
  Bot,
  Smartphone,
  Download,
  Clock,
  ArrowRightLeft,
  RefreshCw
} from 'lucide-react';
import { SchoolConfig } from '../types';
import { getHotlineDisplay } from '../utils/hotlineHelper';
import { realtimeSync, SyncState } from '../utils/realtimeSync';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  config: SchoolConfig;
  onOpenEmergency: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onOpenAppInstall?: () => void;
  onOpenSyncModal?: () => void;
  onOpenMemoryManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  config,
  onOpenEmergency,
  onOpenAdmin,
  isAdminLoggedIn,
  onOpenAppInstall,
  onOpenSyncModal,
  onOpenMemoryManager,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(realtimeSync.getState());
  const hotlineInfo = getHotlineDisplay(config.hotline || '0789 620 212');

  useEffect(() => {
    const unsub = realtimeSync.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsub();
  }, []);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home, color: 'text-sky-500' },
    { id: 'counseling', label: 'Tư vấn học đường', icon: HeartHandshake, color: 'text-rose-500' },
    { id: 'health', label: 'Tư vấn & Sức khỏe', icon: HeartPulse, color: 'text-teal-400' },
    { id: 'qa', label: 'Hỏi và đáp', icon: HelpCircle, color: 'text-emerald-500' },
    { id: 'aichat', label: 'Hỏi đáp với Chat AI', icon: Bot, color: 'text-purple-600' },
    { id: 'stories', label: 'Chuyện muốn kể', icon: BookOpen, color: 'text-amber-500' },
    { id: 'youth', label: 'Đăng ký tham gia Đoàn', icon: Flag, color: 'text-red-500' },
    { id: 'activities', label: 'Hoạt động', icon: Camera, color: 'text-indigo-500' },
    { id: 'contact', label: 'Liên hệ', icon: Mail, color: 'text-blue-500' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg transition-all border-b border-indigo-500/20">
      {/* Top Bar with Youth Navy & Indigo Theme */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-white text-xs sm:text-sm py-2 px-3 sm:px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* School Name & SubName */}
          <div className="flex items-center space-x-2 font-medium tracking-wide">
            <span className="inline-flex items-center justify-center p-1 bg-amber-400/20 rounded-full text-yellow-300 border border-amber-300/30">
              <Award className="w-3.5 h-3.5 text-yellow-300" />
            </span>
            <span className="font-black uppercase tracking-wider text-yellow-300">
              {config.schoolName}
            </span>
            <span className="hidden md:inline text-white/50">•</span>
            <span className="text-cyan-200 text-xs font-semibold hidden lg:inline">
              {config.schoolSubName}
            </span>
          </div>

          {/* Hotline & App Install & Emergency */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
            {/* Real-time Web <-> Mobile App Sync Trigger */}
            {onOpenSyncModal && (
              <button
                onClick={onOpenSyncModal}
                className="inline-flex items-center space-x-1.5 bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-sm hover:shadow transition-all border border-indigo-400/40 cursor-pointer text-xs group"
                title="Trạng thái đồng bộ thời gian thực Web ↔ App - Bấm để kiểm tra và làm mới dữ liệu"
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${syncState.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${syncState.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <ArrowRightLeft className="w-3 h-3 text-cyan-300 hidden xs:inline" />
                <span className="hidden sm:inline text-xs text-slate-200 group-hover:text-cyan-200">
                  {syncState.isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Web ↔ App'}
                </span>
                <span className="sm:hidden text-xs text-slate-200">
                  Đồng bộ
                </span>
                {syncState.hasAppUpdate && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" title="Có bản cập nhật mới"></span>
                )}
              </button>
            )}

            {/* Memory Turbo Engine & Diagnostics Trigger */}
            {onOpenMemoryManager && (
              <button
                onClick={onOpenMemoryManager}
                className="inline-flex items-center space-x-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 hover:text-white font-bold px-2.5 sm:px-3 py-1 rounded-full shadow-sm hover:shadow transition-all border border-indigo-500/40 cursor-pointer text-xs group"
                title="Trung tâm Quản lý & Nâng cấp Bộ nhớ Turbo 5 tầng (>1GB)"
              >
                <span className="p-0.5 bg-indigo-500/30 rounded-full text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </span>
                <span className="hidden sm:inline text-xs">
                  Bộ nhớ Turbo
                </span>
                <span className="sm:hidden text-xs">
                  Bộ nhớ
                </span>
              </button>
            )}

            {/* Install App Trigger Button */}
            {onOpenAppInstall && (
              <button
                onClick={onOpenAppInstall}
                className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-xs"
                title="Cài đặt App trên Android, iPhone, Windows, Mac"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                <span>Cài App</span>
              </button>
            )}

            {/* Prominent Hotline */}
            {hotlineInfo.isActive && hotlineInfo.phoneLink ? (
              <a
                href={hotlineInfo.phoneLink}
                className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                title="Gọi ngay đường dây nóng tư vấn (07:00 - 17:00)"
              >
                <Phone className="w-3.5 h-3.5 animate-bounce text-slate-950" />
                <span className="text-xs uppercase hidden xs:inline font-black">HOTLINE:</span>
                <span className="text-xs sm:text-sm tracking-wider font-black">{hotlineInfo.displayText}</span>
              </a>
            ) : (
              <div 
                className="inline-flex items-center space-x-1.5 bg-slate-800 text-slate-400 border border-slate-700 font-bold px-3 py-1 rounded-full text-xs cursor-default"
                title="Hotline ngoài giờ làm việc (Sau 17:00). Vui lòng gửi câu hỏi trên hệ thống!"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Hotline nghỉ sau 17h</span>
                <span className="xs:hidden">Nghỉ 17h</span>
              </div>
            )}

            {/* Emergency Help Button */}
            <button
              onClick={onOpenEmergency}
              className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full transition shadow-sm cursor-pointer animate-pulse-soft"
              title="Cần hỗ trợ tâm lý khẩn cấp"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khẩn cấp</span>
            </button>

            {/* Admin toggle */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/15 hover:bg-white/25 text-white/90'
              }`}
              title="Khu vực Quản trị dành cho Thầy Cô & Cán bộ Đoàn"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdminLoggedIn ? 'Quản trị viên' : 'Quản trị'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 bg-slate-900/95 backdrop-blur-md">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & School Branding */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            {/* School Logo with Image and Fallback */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-1 shadow-xl ring-2 ring-amber-400/90 group-hover:ring-amber-300 group-hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                {config.schoolLogo ? (
                  <img 
                    src={config.schoolLogo} 
                    alt={config.schoolName}
                    className="w-full h-full object-contain drop-shadow-xs"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <HeartHandshake className="w-7 h-7 text-amber-500 group-hover:text-yellow-600 transition-colors" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span 
                  className="font-black bg-gradient-to-r from-yellow-300 via-amber-200 to-white bg-clip-text text-transparent tracking-tight"
                  style={{ fontSize: '17px' }}
                >
                  TƯ VẤN HỌC ĐƯỜNG
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                  THPT
                </span>
              </div>
              <p className="text-slate-300 font-medium italic flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span style={{ fontSize: '10px' }}>Lắng nghe – Thấu hiểu – Đồng hành – Phát triển</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-yellow-300' : item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center xl:hidden space-x-2">
            {onOpenAppInstall && (
              <button
                onClick={onOpenAppInstall}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-600 text-white shadow-sm"
                title="Cài đặt App"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            <a
              href={`tel:${config.hotline.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-sm"
              title="Gọi hotline"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-indigo-500/30 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-white">
          <div className="grid grid-cols-1 gap-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-l-4 border-yellow-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {onOpenSyncModal && (
              <button
                onClick={() => {
                  onOpenSyncModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-indigo-900/60 hover:bg-indigo-800/80 text-white font-bold rounded-xl border border-indigo-400/40 shadow cursor-pointer text-xs"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>LIÊN KẾT ĐỒNG BỘ WEB ↔ APP ĐIỆN THOẠI</span>
                <span className={`w-2.5 h-2.5 rounded-full ${syncState.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              </button>
            )}

            {onOpenMemoryManager && (
              <button
                onClick={() => {
                  onOpenMemoryManager();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-indigo-900 to-purple-900 text-amber-300 font-black rounded-xl border border-indigo-400/50 shadow cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>TRUNG TÂM NÂNG CẤP & ĐIỀU HÀNH BỘ NHỚ (TURBO)</span>
              </button>
            )}

            {onOpenAppInstall && (
              <button
                onClick={() => {
                  onOpenAppInstall();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>HƯỚNG DẪN CÀI ĐẶT APP (ANDROID, IOS, PC)</span>
              </button>
            )}

            <a
              href={`tel:${config.hotline.replace(/\s+/g, '')}`}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black rounded-xl shadow"
            >
              <Phone className="w-4 h-4" />
              <span>GỌI HOTLINE: {config.hotline}</span>
            </a>

            <button
              onClick={() => {
                onOpenEmergency();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 w-full py-2.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 font-bold rounded-xl border border-red-500/30 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Kênh Hỗ Trợ Khẩn Cấp 24/7</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
