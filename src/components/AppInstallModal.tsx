import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Apple, 
  Download, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ExternalLink,
  Laptop,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [selectedOS, setSelectedOS] = useState<'android' | 'ios' | 'windows' | 'mac'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 my-6 border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-amber-500/15 to-blue-500/15 text-blue-800 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ỨNG DỤNG ĐA NỀN TẢNG (PWA)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            HƯỚNG DẪN CÀI ĐẶT ỨNG DỤNG (APP)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Cài đặt ứng dụng <strong>{config.schoolName}</strong> trực tiếp lên điện thoại hoặc máy tính của bạn để nhận hỗ trợ tư vấn 24/7 và truy cập cực nhanh không cần mở trình duyệt.
          </p>
        </div>

        {/* OS Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedOS('android')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer border ${
              selectedOS === 'android'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-6 h-6" />
            <span className="font-bold text-xs">Android (Samsung, Oppo, Xiaomi...)</span>
          </button>

          <button
            onClick={() => setSelectedOS('ios')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer border ${
              selectedOS === 'ios'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Apple className="w-6 h-6" />
            <span className="font-bold text-xs">iPhone / iPad (iOS)</span>
          </button>

          <button
            onClick={() => setSelectedOS('windows')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer border ${
              selectedOS === 'windows'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-6 h-6" />
            <span className="font-bold text-xs">Laptop Windows (PC)</span>
          </button>

          <button
            onClick={() => setSelectedOS('mac')}
            className={`p-3 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer border ${
              selectedOS === 'mac'
                ? 'bg-purple-700 text-white border-purple-700 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-6 h-6" />
            <span className="font-bold text-xs">MacBook / macOS</span>
          </button>
        </div>

        {/* Step-by-Step Instructions by Selected OS */}
        <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
          {/* ANDROID */}
          {selectedOS === 'android' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm sm:text-base border-b border-slate-200 pb-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>CÁCH CÀI ĐẶT TRÊN ĐIỆN THOẠI ANDROID (CHROME / CỐC CỐC)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">1</div>
                  <div>
                    <strong className="text-slate-900">Mở trình duyệt Google Chrome</strong> trên điện thoại và truy cập vào trang web trường THPT Ba Chúc.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    <strong className="text-slate-900">Nhấp vào biểu tượng Menu 3 chấm (<MoreVertical className="w-4 h-4 inline text-slate-600" />)</strong> ở góc trên bên phải màn hình.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">3</div>
                  <div>
                    Chọn mục <strong className="text-emerald-700 font-bold">"Cài đặt ứng dụng"</strong> (hoặc <strong className="text-emerald-700 font-bold">"Thêm vào màn hình chính" / Add to Home screen</strong>).
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0">4</div>
                  <div>
                    Bấm <strong className="text-slate-900 font-bold">"Cài đặt" (Install)</strong>. Biểu tượng ứng dụng Tư Vấn THPT Ba Chúc sẽ xuất hiện ngay trên màn hình chính của bạn như một App tải từ CH Play!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IOS / IPHONE */}
          {selectedOS === 'ios' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm sm:text-base border-b border-slate-200 pb-2">
                <Apple className="w-5 h-5 text-slate-900" />
                <span>CÁCH CÀI ĐẶT TRÊN IPHONE / IPAD (TRÌNH DUYỆT SAFARI)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0">1</div>
                  <div>
                    <strong className="text-slate-900">Mở trình duyệt Safari</strong> trên iPhone / iPad và truy cập vào trang web của trường.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    Nhấp vào nút <strong className="text-slate-900">Chia sẻ (<Share2 className="w-4 h-4 inline text-blue-600" />)</strong> ở thanh công cụ phía dưới màn hình iPhone.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0">3</div>
                  <div>
                    Cuộn xuống danh sách tùy chọn và chọn <strong className="text-blue-700 font-bold">"Thêm vào Màn hình chính" (<PlusSquare className="w-4 h-4 inline text-slate-800" /> / Add to Home Screen)</strong>.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black flex items-center justify-center shrink-0">4</div>
                  <div>
                    Bấm <strong className="text-slate-900 font-bold">"Thêm" (Add)</strong> ở góc trên bên phải. App sẽ hiển thị trên màn hình iPhone và mở toàn màn hình mượt mà không có thanh địa chỉ!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WINDOWS LAPTOP */}
          {selectedOS === 'windows' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-blue-800 font-extrabold text-sm sm:text-base border-b border-slate-200 pb-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span>CÁCH CÀI ĐẶT TRÊN LAPTOP / MÁY TÍNH WINDOWS (CHROME / EDGE)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">1</div>
                  <div>
                    Mở trình duyệt <strong className="text-slate-900">Google Chrome</strong> hoặc <strong className="text-slate-900">Microsoft Edge</strong> trên máy tính Windows.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    Nhìn vào góc phải thanh địa chỉ (URL), bấm biểu tượng <strong className="text-blue-700">"Cài đặt ứng dụng" (<Download className="w-4 h-4 inline text-blue-600" />)</strong>.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">3</div>
                  <div>
                    Hoặc bấm Menu 3 chấm → chọn <strong className="text-slate-900">"Ứng dụng" (Apps)</strong> → <strong className="text-blue-700">"Cài đặt trang web này dưới dạng ứng dụng"</strong>.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">4</div>
                  <div>
                    Chọn ghim vào <strong className="text-slate-900">Taskbar</strong> hoặc tạo lối tắt ngoài <strong className="text-slate-900">Desktop</strong> để mở ứng dụng bất cứ lúc nào!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MACBOOK / MACOS */}
          {selectedOS === 'mac' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center space-x-2 text-purple-900 font-extrabold text-sm sm:text-base border-b border-slate-200 pb-2">
                <Laptop className="w-5 h-5 text-purple-700" />
                <span>CÁCH CÀI ĐẶT TRÊN MACBOOK / MACOS (SAFARI / CHROME)</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center shrink-0">1</div>
                  <div>
                    Mở trình duyệt <strong className="text-slate-900">Safari</strong> hoặc <strong className="text-slate-900">Chrome</strong> trên máy Mac.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    <strong>Trên Safari:</strong> Nhấp vào Menu <strong className="text-purple-800">"Tệp" (File)</strong> trên thanh menu trên cùng → chọn <strong className="text-purple-800 font-bold">"Thêm vào Dock" (Add to Dock)</strong>.
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center shrink-0">3</div>
                  <div>
                    <strong>Trên Chrome:</strong> Bấm biểu tượng Cài đặt trên thanh địa chỉ URL hoặc Menu 3 chấm → Lưu & Chia sẻ → Cài đặt trang web dưới dạng App.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits banner */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-black text-sm text-yellow-300">Lợi ích khi cài App:</p>
              <p className="text-slate-200">Mở toàn màn hình, tốc độ nhanh gấp 2 lần, không tốn dung lượng máy, lưu trữ dữ liệu an toàn.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl shrink-0 cursor-pointer shadow"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
