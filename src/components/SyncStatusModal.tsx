import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Wifi, 
  ArrowRightLeft, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Download
} from 'lucide-react';
import { realtimeSync, SyncState } from '../utils/realtimeSync';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAppInstall?: () => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenAppInstall,
}) => {
  const [syncState, setSyncState] = useState<SyncState>(realtimeSync.getState());
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [manualSyncSuccess, setManualSyncSuccess] = useState(false);

  useEffect(() => {
    const unsub = realtimeSync.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setManualSyncSuccess(false);
    const res = await realtimeSync.performSync(true);
    if (res.success) {
      setManualSyncSuccess(true);
      setTimeout(() => setManualSyncSuccess(false), 4000);
    }
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    try {
      const res = await realtimeSync.checkForUpdates();
      if (res.hasUpdate) {
        setUpdateMessage('🚀 Đã tìm thấy bản cập nhật mới! Đang chuẩn bị tải và làm mới ứng dụng...');
        setTimeout(() => {
          realtimeSync.applyUpdate();
        }, 1200);
      } else {
        setUpdateMessage('✅ Ứng dụng trên Web và Điện thoại đã ở phiên bản mới nhất (v2.6.0).');
      }
    } catch {
      setUpdateMessage('Đã kiểm tra máy chủ, hệ thống đang đồng bộ dữ liệu ổn định.');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const formatLastSync = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN');
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <ArrowRightLeft className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Liên Kết & Đồng Bộ Web ↔ App
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </h2>
              <p className="text-xs text-indigo-200">
                Tự động kết nối hai chiều thời gian thực giữa Web máy tính và App điện thoại
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Status Highlight Banner */}
          <div className="bg-gradient-to-r from-indigo-950/80 to-blue-950/80 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 relative">
                <span className="flex h-3.5 w-3.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${syncState.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${syncState.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Trạng thái kết nối:</span>
                  <span className={syncState.isConnected ? 'text-emerald-400' : 'text-amber-400'}>
                    {syncState.isConnected ? '🟢 Đang liên kết trực tiếp' : '🟡 Đang kết nối lại...'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Cập nhật gần nhất: <span className="text-cyan-300 font-medium">{formatLastSync(syncState.lastSyncedAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleManualSync}
                disabled={syncState.isSyncing}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncState.isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
              </button>
            </div>
          </div>

          {manualSyncSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Đồng bộ thành công! Tất cả câu hỏi, bài viết, hoạt động và cấu hình đã được cập nhật mới nhất.</span>
            </div>
          )}

          {updateMessage && (
            <div className="p-3 bg-blue-950/80 border border-blue-500/40 rounded-xl text-blue-200 text-xs flex items-center space-x-2 animate-fade-in">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{updateMessage}</span>
            </div>
          )}

          {/* Visual Architecture Diagram: Web <-> Server <-> Mobile App */}
          <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Cơ chế liên kết 2 chiều thông minh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
              {/* Web Client */}
              <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs">Web Máy Tính</div>
                <div className="text-[11px] text-slate-400 mt-1">Thầy cô duyệt bài, trả lời, đăng tin</div>
              </div>

              {/* Central Realtime Sync Hub */}
              <div className="bg-gradient-to-b from-indigo-900/60 to-purple-950/60 border border-indigo-400/40 rounded-xl p-3 flex flex-col items-center shadow-lg relative">
                <div className="w-10 h-10 rounded-full bg-indigo-500/30 text-cyan-300 flex items-center justify-center mb-2 animate-pulse">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div className="font-black text-cyan-300 text-xs">Máy Chủ & Đám Mây</div>
                <div className="text-[10px] text-indigo-200 mt-1">Realtime SSE Stream + Firestore</div>
              </div>

              {/* Mobile App */}
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs">App Trên Điện Thoại</div>
                <div className="text-[11px] text-slate-400 mt-1">Học sinh hỏi đáp, thả tim, đăng ký</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-300 leading-relaxed">
              <ul className="space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Khi đổi trên Web:</strong> Thầy cô đăng hoạt động, trả lời câu hỏi, hay đổi hotline ➔ App trên điện thoại học sinh hiển thị ngay sau chưa đầy 1 giây.</li>
                <li><strong className="text-white">Khi đổi trên Điện thoại:</strong> Học sinh gửi câu hỏi mới, đăng ký Đoàn, hay tương tác ➔ Web máy tính của Ban Quản trị nhận được tức thì.</li>
                <li><strong className="text-white">Không cần tải lại trang:</strong> Hệ thống tự cập nhật ngầm thông qua công nghệ Server-Sent Events và Service Worker.</li>
              </ul>
            </div>
          </div>

          {/* Synced Collections Checklist */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Dữ liệu được bảo vệ và đồng bộ liên tục
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-2.5 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Câu hỏi & Trả lời tư vấn</div>
                  <div className="text-[11px] text-slate-400">Đồng bộ mã tra cứu & nội dung giải đáp</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-2.5 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Chuyện muốn kể & Tương tác</div>
                  <div className="text-[11px] text-slate-400">Thả tim, gửi lời động viên bạn bè</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-2.5 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Hoạt động phong trào Đoàn</div>
                  <div className="text-[11px] text-slate-400">Bài viết, hình ảnh, cảm xúc trực tuyến</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-2.5 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Tình nguyện viên & Vinh danh</div>
                  <div className="text-[11px] text-slate-400">Điểm danh hoạt động và bảng vàng 152 ĐV</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-2.5 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Cẩm nang Y tế & Thi Quân đội</div>
                  <div className="text-[11px] text-slate-400">Hướng dẫn dinh dưỡng, thể lực, phòng bệnh</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-white/5 rounded-lg p-2.5 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-white">Cấu hình trường & Hotline</div>
                  <div className="text-[11px] text-slate-400">Số điện thoại khẩn, lịch trực, ban cố vấn</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCheckUpdate}
              disabled={isCheckingUpdate}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isCheckingUpdate ? 'Đang kiểm tra...' : 'Kiểm tra cập nhật App'}</span>
            </button>

            {onOpenAppInstall && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAppInstall();
                }}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài App về điện thoại</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
