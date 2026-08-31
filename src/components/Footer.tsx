import React from 'react';
import { 
  HeartHandshake, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowUp,
  Heart,
  Flag,
  Bot,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { SchoolConfig } from '../types';
import { getHotlineDisplay, isHotlineActive } from '../utils/hotlineHelper';

interface FooterProps {
  config: SchoolConfig;
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
  onOpenAIChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onNavigate,
  onOpenAdmin,
  onOpenAIChat,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hotlineInfo = getHotlineDisplay(config.hotline || '0789 620 212');

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-400 relative overflow-hidden">
      {/* Subtle top glowing bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-rose-500 to-amber-500" />

      {/* DEDICATED PROMINENT HOTLINE SECTION AT FOOTER (Moved here as requested with 17h cutoff) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <div className="bg-gradient-to-r from-slate-800 via-slate-850 to-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4 text-center sm:text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                hotlineInfo.isActive 
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 animate-pulse' 
                  : 'bg-slate-700 text-slate-400'
              }`}>
                <PhoneCall className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    ĐƯỜNG DÂY NÓNG HỖ TRỢ & TƯ VẤN HỌC ĐƯỜNG
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    hotlineInfo.isActive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {hotlineInfo.isActive ? '● Đang mở tiếp nhận' : '○ Tạm nghỉ sau 17:00'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {hotlineInfo.statusNote}
                </p>
              </div>
            </div>

            <div className="text-center md:text-right shrink-0">
              {hotlineInfo.isActive && hotlineInfo.phoneLink ? (
                <div className="space-y-1">
                  <a
                    href={hotlineInfo.phoneLink}
                    className="inline-flex items-center space-x-3 px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all text-xl tracking-tight cursor-pointer"
                  >
                    <Phone className="w-5 h-5 fill-slate-950" />
                    <span>{hotlineInfo.displayText}</span>
                  </a>
                  <p className="text-[11px] text-amber-300/80 font-medium">
                    Nhấp để kết nối trực tiếp với Ban Tư Vấn (07h00 - 17h00)
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Hotline ngừng tiếp nhận cuộc gọi sau 17:00</span>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Để đảm bảo thời gian nghỉ ngơi của thầy cô, số hotline tự động ẩn sau 17h00. Học sinh vui lòng gửi câu hỏi trên web để được phản hồi vào sáng hôm sau!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Slogan Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white p-1 shadow-xl flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-amber-400/90">
                {config.schoolLogo ? (
                  <img 
                    src={config.schoolLogo} 
                    alt={config.schoolName}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white font-black text-xl">
                    TV
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  TƯ VẤN HỌC ĐƯỜNG
                </h3>
                <p className="text-xs text-amber-400 font-bold tracking-wider uppercase">
                  {config.schoolName}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed italic">
              "{config.slogan}"
            </p>

            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Cam kết an toàn & bảo mật:</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tôn trọng sự riêng tư và bảo mật thông tin cá nhân của học sinh 100%.
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider text-yellow-400">
              LIÊN KẾT NHANH
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>• Trang chủ & Giới thiệu</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('counseling')}
                  className="hover:text-amber-400 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>• Góc Tư vấn Học đường</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('qa')}
                  className="hover:text-amber-400 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>• Chuyên mục Hỏi & Đáp</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stories')}
                  className="hover:text-amber-400 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>• Chuyện muốn kể (Tâm sự)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('youth')}
                  className="hover:text-amber-400 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>• Đăng ký tham gia Đoàn & CLB</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('activities')}
                  className="hover:text-amber-400 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>• Hoạt động nổi bật</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider text-yellow-400">
              THÔNG TIN LIÊN HỆ
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Hotline trực tuyến (07:00 - 17:00):</p>
                  {hotlineInfo.isActive && hotlineInfo.phoneLink ? (
                    <a href={hotlineInfo.phoneLink} className="font-bold text-white hover:text-amber-400 transition">
                      {hotlineInfo.displayText}
                    </a>
                  ) : (
                    <p className="text-rose-400 text-xs font-semibold">Tạm ẩn ngoài giờ làm việc (Sau 17:00)</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Hòm thư điện tử:</p>
                  <a href={`mailto:${config.email}`} className="font-bold text-white hover:text-amber-400 transition">
                    {config.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Địa điểm phòng tư vấn:</p>
                  <p className="font-medium text-slate-200">{config.consultingRoom}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">Thời gian tiếp nhận:</p>
                  <p className="font-medium text-slate-200">{config.workingHours} (Tự động ngắt 17h00)</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat & Administrative portal */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider text-yellow-400">
              TIỆN ÍCH HỖ TRỢ
            </h4>

            <div className="space-y-2.5">
              <button
                onClick={onOpenAIChat}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Trò Chuyện Cùng AI Tư Vấn</span>
              </button>

              <button
                onClick={onOpenAdmin}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Cổng Quản Trị Viên</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              🌟 Khi gặp khó khăn tâm lý, đừng ngần ngại lên tiếng. Thầy cô và nhà trường luôn ở bên bạn!
            </div>
          </div>
        </div>

        {/* Bottom copyright and Scroll to Top */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © 2025 <strong className="text-slate-300">TƯ VẤN HỌC ĐƯỜNG</strong> — {config.schoolName}. Phát triển vì một môi trường giáo dục hạnh phúc, an toàn & phát triển toàn diện.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <span>Về đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
