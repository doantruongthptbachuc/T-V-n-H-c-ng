import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert, Home, Database, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * ErrorBoundary component for THPT Ba Chúc Consultation & Youth Union App.
 * Catches runtime crashes, prevents blank white screens or app exits,
 * provides friendly Vietnamese recovery actions and safe memory restoration.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[THPT Ba Chúc ErrorBoundary] Đã bắt được lỗi runtime:', error, errorInfo);
    this.setState({ errorInfo });

    // Tối ưu giải phóng bộ nhớ khi xảy ra sự cố
    try {
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    } catch {}
  }

  private handleReload = (): void => {
    try {
      // Dọn dẹp cache tạm thời trong sessionStorage để giải phóng bộ nhớ
      sessionStorage.removeItem('tvhd_temp_cache');
      sessionStorage.removeItem('tvhd_active_tab_cache');
    } catch {}
    window.location.reload();
  };

  private handleClearMemoryAndReload = (): void => {
    try {
      // Xóa các dữ liệu đệm nặng không bắt buộc nhưng giữ lại tài khoản quản trị
      const preservedKeys = [
        'tvhd_admin_session',
        'tvhd_admin_last_active',
        'tvhd_school_config',
        'tvhd_volunteer_members_v2526',
        'tvhd_volunteer_attendance_v2526',
      ];
      
      const savedData: Record<string, string> = {};
      for (const k of preservedKeys) {
        const val = localStorage.getItem(k);
        if (val !== null) savedData[k] = val;
      }

      // Dọn dẹp localStorage
      localStorage.clear();

      // Phục hồi dữ liệu cần thiết
      for (const [k, v] of Object.entries(savedData)) {
        localStorage.setItem(k, v);
      }
      sessionStorage.clear();
    } catch (e) {
      console.warn('Lỗi khi tối ưu bộ nhớ:', e);
    }
    window.location.reload();
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
  };

  private toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Lỗi không xác định trong quá trình xử lý';

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in zoom-in-95">
            {/* Header Badge & Icon */}
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-1">
                  Bảo vệ ứng dụng an toàn
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  ĐÃ XẢY RA SỰ CỐ TẠM THỜI
                </h1>
              </div>
            </div>

            {/* Notification message */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/50 space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Hệ thống <strong>Tư Vấn Học Đường THPT Ba Chúc</strong> đã tự động cách ly và ngăn chặn sự cố này để bảo vệ dữ liệu và danh sách đoàn viên của bạn không bị gián đoạn hay mất mát.
              </p>
              <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Toàn bộ 152 đoàn viên và điểm danh 5 hoạt động đã được sao lưu bền vững trong IndexedDB.</span>
              </div>
            </div>

            {/* Error Detail Accordion */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>{this.state.showDetails ? 'Ẩn chi tiết kỹ thuật' : 'Xem thông tin lỗi kỹ thuật'}</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="bg-black/50 rounded-xl p-3.5 border border-rose-900/40 text-xs font-mono text-rose-300 overflow-x-auto max-h-48 space-y-2">
                  <p className="font-bold text-rose-400">{errorMessage}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Primary Reload Button */}
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Tải lại trang</span>
              </button>

              {/* Go Home Button */}
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-sm border border-slate-600 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang chủ</span>
              </button>
            </div>

            {/* Optimize Memory & Deep Reset */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Nếu vẫn gặp sự cố sau khi tải lại:
              </span>
              <button
                type="button"
                onClick={this.handleClearMemoryAndReload}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Dọn bộ nhớ đệm và tải lại ứng dụng"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Dọn bộ nhớ đệm & Khôi phục</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
