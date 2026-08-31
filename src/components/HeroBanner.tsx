import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  HeartPulse,
  Stethoscope,
  BookOpen, 
  MessageSquareQuote, 
  Flag, 
  ArrowRight, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck, 
  Smile, 
  GraduationCap,
  Smartphone,
  Bot,
  Award,
  Users,
  Compass,
  Camera,
  Image as ImageIcon,
  Check,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Play,
  Pause,
  Layers
} from 'lucide-react';
import { SchoolConfig } from '../types';
import { sampleHeroBannerImages, sampleSchoolLogos } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';

interface HeroBannerProps {
  onNavigate: (tab: string) => void;
  config: SchoolConfig;
  onOpenQuestionModal: () => void;
  onOpenStoryModal: () => void;
  onOpenAppInstall?: () => void;
  isAdminLoggedIn?: boolean;
  onUpdateConfig?: (newConfig: SchoolConfig) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onNavigate,
  config,
  onOpenQuestionModal,
  onOpenStoryModal,
  onOpenAppInstall,
  isAdminLoggedIn = false,
  onUpdateConfig,
}) => {
  const [isCarouselManageModalOpen, setIsCarouselManageModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic Time Greeting & H1 Title State
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Chào buổi sáng';
    if (hour >= 11 && hour < 14) return 'Chào buổi trưa';
    if (hour >= 14 && hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const initialGreeting = getTimeGreeting();
  const [greetingState, setGreetingState] = useState<string>(initialGreeting);
  const [h1Title, setH1Title] = useState<string>(`${initialGreeting} • TƯ VẤN HỌC ĐƯỜNG`);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempCustomTitle, setTempCustomTitle] = useState<string>('');

  // Update greeting when time changes
  useEffect(() => {
    const timer = setInterval(() => {
      const currentGreeting = getTimeGreeting();
      if (currentGreeting !== greetingState) {
        setGreetingState(currentGreeting);
        setH1Title(`${currentGreeting} • TƯ VẤN HỌC ĐƯỜNG`);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [greetingState]);

  // Single central banner image for the school space
  const currentBannerImage = config.heroBannerImage || (config.heroBannerImages && config.heroBannerImages[0]) || sampleHeroBannerImages[0];
  const [tempBannerUrl, setTempBannerUrl] = useState(currentBannerImage);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const compressed = await compressImageFile(file, 1600, 1000, 0.85);
        setTempBannerUrl(compressed);
      } catch (err) {
        console.error('Error uploading image:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveBannerImage = () => {
    if (onUpdateConfig && tempBannerUrl) {
      onUpdateConfig({
        ...config,
        heroBannerImage: tempBannerUrl,
        heroBannerImages: [tempBannerUrl],
      });
      setIsCarouselManageModalOpen(false);
      alert('Đã cập nhật thành công ảnh Trang Chủ!');
    }
  };

  return (
    <div className="relative overflow-hidden pt-4 pb-10 bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white">
      {/* Decorative background ambient glows */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        {/* Top Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Text & Slogan */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* School & Unit Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-blue-400/20 border border-amber-300/30 text-amber-300 text-xs sm:text-sm font-black shadow-lg">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="tracking-wide uppercase">{config.schoolName}</span>
              <span className="text-amber-400/60 hidden sm:inline">•</span>
              <span className="text-white/90 text-xs font-semibold hidden sm:inline">{config.schoolSubName}</span>
            </div>

            {/* 3D Main Title with Dynamic State */}
            <div className="space-y-3">
              {/* Dynamic Title Preset Switcher Chips */}
              <div className="flex flex-wrap items-center gap-1.5 justify-center lg:justify-start text-xs">
                <button
                  type="button"
                  onClick={() => setH1Title('Chào buổi sáng • TƯ VẤN HỌC ĐƯỜNG')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    h1Title.includes('Chào buổi sáng') 
                      ? 'bg-amber-400 text-slate-950 shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                  }`}
                >
                  ☀️ Buổi sáng
                </button>
                <button
                  type="button"
                  onClick={() => setH1Title('Chào buổi trưa • TƯ VẤN HỌC ĐƯỜNG')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    h1Title.includes('Chào buổi trưa') 
                      ? 'bg-amber-400 text-slate-950 shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                  }`}
                >
                  🌤️ Buổi trưa
                </button>
                <button
                  type="button"
                  onClick={() => setH1Title('Chào buổi chiều • TƯ VẤN HỌC ĐƯỜNG')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    h1Title.includes('Chào buổi chiều') 
                      ? 'bg-amber-400 text-slate-950 shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                  }`}
                >
                  ⛅ Buổi chiều
                </button>
                <button
                  type="button"
                  onClick={() => setH1Title('Chào buổi tối • TƯ VẤN HỌC ĐƯỜNG')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    h1Title.includes('Chào buổi tối') 
                      ? 'bg-amber-400 text-slate-950 shadow-xs' 
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                  }`}
                >
                  🌙 Buổi tối
                </button>
                <button
                  type="button"
                  onClick={() => setH1Title('TƯ VẤN HỌC ĐƯỜNG & TÂM LÝ')}
                  className="px-2.5 py-1 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 transition cursor-pointer text-[11px]"
                >
                  💖 Tư Vấn
                </button>
                <button
                  type="button"
                  onClick={() => setH1Title('ĐOÀN TRƯỜNG & PHONG TRÀO')}
                  className="px-2.5 py-1 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 transition cursor-pointer text-[11px]"
                >
                  🚩 Đoàn Trường
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(!isEditingTitle);
                    setTempCustomTitle(h1Title);
                  }}
                  className="px-2 py-1 rounded-lg font-bold bg-indigo-500/40 hover:bg-indigo-500 text-white border border-indigo-400/40 transition cursor-pointer text-[11px]"
                  title="Tự nhập tiêu đề tùy chỉnh"
                >
                  ✏️ Nhập tay
                </button>
              </div>

              {/* Custom Title Input Popup Inline */}
              {isEditingTitle && (
                <div className="flex items-center gap-2 p-2 bg-slate-900/90 border border-amber-400/40 rounded-xl max-w-md">
                  <input
                    type="text"
                    value={tempCustomTitle}
                    onChange={(e) => setTempCustomTitle(e.target.value)}
                    placeholder="Nhập tiêu đề H1 tùy thích..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempCustomTitle.trim()) {
                        setH1Title(tempCustomTitle.trim());
                      }
                      setIsEditingTitle(false);
                    }}
                    className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              )}

              {/* Dynamic H1 */}
              <div>
                <h1 
                  className="font-black tracking-tight leading-[1.15] p-3 sm:p-4 rounded-2xl inline-block shadow-lg border border-red-950"
                  style={{
                    fontSize: '20px',
                    color: '#c1d31f',
                    backgroundColor: '#650808',
                  }}
                >
                  <span className="inline-block uppercase drop-shadow-md">
                    {h1Title}
                  </span>
                </h1>
              </div>
              
              {/* Slogan */}
              <p 
                className="font-extrabold tracking-wide drop-shadow-md"
                style={{
                  fontSize: '20px',
                  color: '#fef08a',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                “Lắng nghe – Thấu hiểu – Đồng hành – Phát triển”
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Ngôi nhà tinh thần ấm áp dành riêng cho các bạn học sinh <strong className="text-amber-300 font-bold">{config.schoolName}</strong>. Nơi mọi tâm tư, băn khoăn về <span className="text-cyan-300 font-semibold">học tập, tâm lý, bạn bè, hướng nghiệp và phong trào Đoàn</span> luôn được lắng nghe trong sự thấu hiểu và bảo mật tuyệt đối.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigate('qa')}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black shadow-lg shadow-blue-500/30 hover:scale-102 transition cursor-pointer text-xs sm:text-sm border border-blue-400/30"
              >
                <MessageSquareQuote className="w-4 h-4 text-cyan-200" />
                <span>Gửi câu hỏi tư vấn</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('aichat')}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black shadow-lg shadow-purple-500/30 hover:scale-102 transition cursor-pointer text-xs sm:text-sm border border-pink-400/30"
              >
                <Bot className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Chat với AI Tư Vấn</span>
              </button>

              {onOpenAppInstall && (
                <button
                  onClick={onOpenAppInstall}
                  className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold backdrop-blur-md border border-white/25 hover:scale-102 transition cursor-pointer text-xs sm:text-sm"
                  title="Cài đặt App trên Android, iPhone, Laptop"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Cài đặt App</span>
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật danh tính 100%</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Smile className="w-4 h-4 text-amber-300" />
                <span>Thầy cô tâm lý & tận tâm</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <GraduationCap className="w-4 h-4 text-cyan-300" />
                <span>Đồng hành suốt 3 năm THPT</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card - 1 SINGLE HIGH RESOLUTION BANNER IMAGE (NO 7 IMAGES SLIDER) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 rounded-3xl blur-lg opacity-50 animate-pulse-soft" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 bg-slate-900 group">
                {/* Single Banner Image with 16/10 aspect ratio and object-cover */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={currentBannerImage}
                    alt="Khoảnh khắc hoạt động trường THPT Ba Chúc"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = sampleHeroBannerImages[0];
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                </div>

                {/* Top Control Bar: Admin Edit Button */}
                {isAdminLoggedIn && (
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={() => {
                        setTempBannerUrl(currentBannerImage);
                        setIsCarouselManageModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xl flex items-center space-x-1.5 cursor-pointer border border-white"
                      title="Quản trị viên: Đổi ảnh đại diện Không Gian Trang Chủ"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Đổi Ảnh Trung Tâm</span>
                    </button>
                  </div>
                )}

                {/* Floating Bottom Overlay Badge */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-white z-20">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-amber-300 font-black flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>HOẠT ĐỘNG & KHOẢNH KHẮC THANH XUÂN THPT BA CHÚC</span>
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                      Thầy cô và bạn bè luôn đồng hành bên bạn trong mọi khoảnh khắc!
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Counseling Space Mini Badge */}
              <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl shadow-2xl border-2 border-white flex items-center space-x-2.5 max-w-[240px] z-30">
                <div className="p-2 bg-white text-emerald-600 rounded-xl shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-wider text-emerald-100">Bảo mật & Tận tâm</p>
                  <p className="text-xs sm:text-sm font-black text-white">
                    Tư vấn ẩn danh 100%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ADMIN MODAL: THAY ĐỔI 1 ẢNH TRUNG TÂM */}
        {isCarouselManageModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      THAY ĐỔI ẢNH TRUNG TÂM TRANG CHỦ
                    </h3>
                    <p className="text-xs text-slate-500">Hình ảnh đại diện trung tâm trên trang chủ trường THPT Ba Chúc</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCarouselManageModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Xem trước ảnh trung tâm (Tỉ lệ chuẩn 16:9):
                </label>
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 aspect-[16/9] w-full shadow-inner">
                  <img src={tempBannerUrl} alt="Xem trước ảnh" className="w-full h-full object-cover object-center" />
                </div>
              </div>

              {/* Upload New Image */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block">
                  1. Tải ảnh mới từ máy tính / điện thoại:
                </label>
                <label className="flex items-center justify-center space-x-2 p-3.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-300 rounded-2xl cursor-pointer text-indigo-700 font-bold text-xs transition">
                  <ImageIcon className="w-4 h-4" />
                  <span>{isUploading ? 'Đang tải ảnh...' : '+ Chọn file ảnh mới từ thiết bị'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {/* Add image by URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  2. Hoặc nhập đường dẫn URL ảnh trực tiếp:
                </label>
                <input
                  type="text"
                  value={tempBannerUrl}
                  onChange={(e) => setTempBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCarouselManageModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveBannerImage}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Ảnh</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5 KHÔNG GIAN ĐỒNG HÀNH */}
        <div className="pt-6 pb-2">
          <div className="text-center mb-6 space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-white/15">
              <Compass className="w-3.5 h-3.5 text-yellow-400" />
              <span>TIỆN ÍCH TRỌNG TÂM CỦA HỆ THỐNG</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              5 KHÔNG GIAN ĐỒNG HÀNH NỔI BẬT
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
              Lựa chọn không gian phù hợp để chia sẻ tâm tư, chăm sóc sức khỏe, đặt câu hỏi hoặc tham gia phong trào cùng Đoàn trường
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Card 1: TƯ VẤN HỌC ĐƯỜNG */}
            <div 
              onClick={() => onNavigate('counseling')}
              className="group relative rounded-3xl p-5 shadow-xl hover:shadow-2xl border-2 border-red-400/40 hover:border-red-300 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1.5 cursor-pointer text-slate-900"
              style={{ backgroundColor: '#ef9595' }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 
                  className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight"
                  style={{ marginTop: '12px' }}
                >
                  TƯ VẤN HỌC ĐƯỜNG
                </h3>
                <p className="text-slate-900 text-xs leading-relaxed font-medium">
                  Chia sẻ, định hướng và giải đáp những băn khoăn trong học tập, tâm lý, kỹ năng sống, hướng nghiệp và phương pháp ôn thi.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-red-300/80 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-red-950 transition">
                <span>Tìm hiểu & Đặt hẹn</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: TƯ VẤN & CHĂM SÓC SỨC KHOẺ HỌC SINH */}
            <div 
              onClick={() => onNavigate('health')}
              className="group relative rounded-3xl p-5 shadow-xl hover:shadow-2xl border-2 border-teal-400/50 hover:border-teal-300 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1.5 cursor-pointer text-slate-900"
              style={{ backgroundColor: '#9fe3de' }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 
                  className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight"
                  style={{ marginTop: '12px' }}
                >
                  TƯ VẤN & SỨC KHỎE
                </h3>
                <p className="text-slate-900 text-xs leading-relaxed font-medium">
                  Hỏi đáp y tế học đường, chăm sóc thể chất, dinh dưỡng mùa thi, sơ cấp cứu & cẩm nang tuyên truyền phòng chống bệnh tật.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-teal-400/80 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-teal-950 transition">
                <span>Hỏi đáp & Tuyên truyền</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: HỎI VÀ ĐÁP */}
            <div 
              onClick={() => onNavigate('qa')}
              className="group relative rounded-3xl p-5 shadow-xl hover:shadow-2xl border-2 border-cyan-400/40 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1.5 cursor-pointer text-slate-900"
              style={{ backgroundColor: '#a8e1f4' }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquareQuote className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  HỎI VÀ ĐÁP THẦY CÔ
                </h3>
                <p className="text-slate-900 text-xs leading-relaxed font-medium">
                  Gửi câu hỏi ẩn danh hoặc công khai đến Thầy Cô Tổ Tư vấn. Xem kho câu trả lời hữu ích của các bạn học sinh khác.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-300/80 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-blue-950 transition">
                <span>Gửi câu hỏi ngay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: CHUYỆN MUỐN KỂ */}
            <div 
              onClick={() => onNavigate('stories')}
              className="group relative rounded-3xl p-5 shadow-xl hover:shadow-2xl border-2 border-amber-400/40 hover:border-amber-300 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1.5 cursor-pointer text-slate-900"
              style={{ backgroundColor: '#f1aa58' }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  CHUYỆN MUỐN KỂ
                </h3>
                <p className="text-slate-900 text-xs leading-relaxed font-medium">
                  Không gian gửi gắm tâm sự, cảm xúc tuổi học trò, những kỷ niệm đẹp và nhận lời nhắn gửi động viên từ Thầy Cô.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-300/80 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-950 transition">
                <span>Chia sẻ câu chuyện</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: ĐĂNG KÝ THAM GIA ĐOÀN */}
            <div 
              onClick={() => onNavigate('youth')}
              className="group relative rounded-3xl p-5 shadow-xl hover:shadow-2xl border-2 border-emerald-400/40 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1.5 cursor-pointer text-slate-900"
              style={{ backgroundColor: '#7ce8a0' }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Flag className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  ĐOÀN TRƯỜNG & PHONG TRÀO
                </h3>
                <p className="text-slate-900 text-xs leading-relaxed font-medium">
                  Tìm hiểu hoạt động Đoàn, đăng ký kết nạp Đoàn viên mới, tham gia các chiến dịch tình nguyện và câu lạc bộ sở thích.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-300/80 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition">
                <span>Đăng ký tham gia</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
