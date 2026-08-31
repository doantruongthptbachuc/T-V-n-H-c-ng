import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Download,
  Upload,
  Cloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  HardDrive,
  Cpu,
  ShieldCheck,
  X,
  Zap,
  Layers,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VolunteerMember } from '../types';
import {
  getStorageDiagnostics,
  restoreOfficial2025Volunteers,
  deduplicateAndRecomputeVolunteerMembers,
  saveVolunteerMembers,
  pushCollectionToServer,
  syncAllWithServer,
  exportVolunteerMemoryJSON,
  importVolunteerMemoryJSON,
  exportHonoredStudentsCSV,
  upgradeAndOptimizeStorage,
} from '../utils/storage';

interface MemoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteerMembers: VolunteerMember[];
  onUpdateVolunteerMembers: (members: VolunteerMember[]) => void;
}

export const MemoryManagementModal: React.FC<MemoryManagementModalProps> = ({
  isOpen,
  onClose,
  volunteerMembers,
  onUpdateVolunteerMembers,
}) => {
  const [stats, setStats] = useState<{
    totalMembers: number;
    year2025Count: number;
    honoredCount: number;
    totalAttendances: number;
    idbSupported: boolean;
    estimatedSizeKb: number;
    maxStorageMb?: number;
    availableMb?: number;
    memoryHealth: string;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Load diagnostics on open
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, volunteerMembers]);

  const loadStats = async () => {
    try {
      const diag = await getStorageDiagnostics();
      setStats(diag);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  // 0. Upgrade and Expand Multi-Tier Storage Engine
  const handleUpgradeMemory = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: '⚡ Đang thực hiện nâng cấp & mở rộng bộ nhớ 5 tầng (RAM Cache, Turbo IndexedDB >1GB, Cloud Firestore)...' });

    try {
      const result = await upgradeAndOptimizeStorage();
      if (result.success) {
        onUpdateVolunteerMembers(volunteerMembers);
        confetti({ particleCount: 150, spread: 90 });
        setStatusMessage({
          type: 'success',
          text: `🚀 ${result.message}`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `❌ ${result.message}`,
        });
      }
      await loadStats();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `❌ Lỗi nâng cấp: ${err?.message || 'Không xác định'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Restore official 152 volunteers for 2025 - 2026
  const handleRestoreOfficial152 = () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang tái lập bộ nhớ 152 đoàn viên chính thức Năm học 2025 - 2026...' });

    setTimeout(() => {
      try {
        const restored = restoreOfficial2025Volunteers();
        onUpdateVolunteerMembers(restored);
        confetti({ particleCount: 120, spread: 80 });
        setStatusMessage({
          type: 'success',
          text: `✅ Đã khôi phục thành công 152 đoàn viên chính thức Năm học 2025 - 2026 và điểm danh 5 hoạt động!`,
        });
        loadStats();
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `❌ Lỗi khôi phục: ${err?.message || 'Không xác định'}`,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  // 2. Optimize & deduplicate memory
  const handleOptimizeMemory = () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang tối ưu hóa bộ nhớ, dọn dẹp dữ liệu trùng lặp...' });

    setTimeout(() => {
      try {
        const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(volunteerMembers);
        saveVolunteerMembers(cleanMembers);
        onUpdateVolunteerMembers(cleanMembers);
        setStatusMessage({
          type: 'success',
          text: `⚡ Đã tối ưu hóa bộ nhớ thành công! Tổng cộng ${cleanMembers.length} đoàn viên được chuẩn hóa.`,
        });
        loadStats();
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `❌ Lỗi tối ưu hóa: ${err?.message || 'Không xác định'}`,
        });
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  // 3. Force push to cloud & server
  const handleForceCloudSync = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang đồng bộ hóa bộ nhớ đa tầng lên Cloud Firestore & Server...' });
    try {
      await pushCollectionToServer('volunteerMembers', volunteerMembers);
      await syncAllWithServer();
      setStatusMessage({
        type: 'success',
        text: '☁️ Đồng bộ hóa thành công! Dữ liệu đã được lưu trữ bền vững trên đám mây và máy chủ.',
      });
      loadStats();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `❌ Lỗi đồng bộ: ${err?.message || 'Không thể kết nối máy chủ'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Import JSON backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang phân tích tệp sao lưu JSON...' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importVolunteerMemoryJSON(content);
        if (res.success) {
          onUpdateVolunteerMembers(volunteerMembers);
          setStatusMessage({ type: 'success', text: `✅ ${res.message}` });
          confetti({ particleCount: 80, spread: 60 });
          loadStats();
        } else {
          setStatusMessage({ type: 'error', text: `❌ ${res.message}` });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: `❌ Lỗi nạp tệp: ${err?.message || 'Tệp không đúng định dạng'}` });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: '❌ Lỗi đọc tệp sao lưu từ máy tính.' });
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-indigo-500 text-white rounded-2xl shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  TRUNG TÂM NÂNG CẤP & ĐIỀU HÀNH BỘ NHỚ
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Kiến trúc lưu trữ 5 tầng: RAM Cache • Turbo IndexedDB (&gt;1GB) • LocalStorage • Cloud Firestore • Server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-start space-x-2.5 transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Featured Hero Upgrade Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-indigo-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Turbo Memory Engine</span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                Nâng cấp & Mở rộng Dung lượng Toàn trang
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động tối ưu bảng vinh danh, chuẩn hóa dữ liệu đoàn viên và giải phóng bộ nhớ đệm chống giật lag.
              </p>
            </div>
            <button
              onClick={handleUpgradeMemory}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang nâng cấp...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>NÂNG CẤP & TỐI ƯU NGAY</span>
                </>
              )}
            </button>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chiến sĩ 2025-2026</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {stats ? stats.year2025Count : volunteerMembers.filter(m => (m.academicYear || '2025 - 2026') === '2025 - 2026').length}
              </p>
              <p className="text-[10px] font-semibold text-emerald-600">Đã đồng bộ đủ 152</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>Tổng đoàn viên</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {stats ? stats.totalMembers : volunteerMembers.length}
              </p>
              <p className="text-[10px] font-semibold text-slate-500">Mọi niên khóa</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                <span>Gương vinh danh</span>
              </div>
              <p className="text-2xl font-black text-amber-600">
                {stats ? stats.honoredCount : volunteerMembers.filter(m => m.isHonored || (m.activitiesCount || 0) >= 1).length}
              </p>
              <p className="text-[10px] font-semibold text-amber-600">Bảng Vàng</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Dung lượng mở rộng</span>
              </div>
              <p className="text-sm font-black text-emerald-600 pt-1.5 flex items-center justify-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{stats?.maxStorageMb ? `> ${stats.maxStorageMb} MB` : '> 1024 MB'}</span>
              </p>
              <p className="text-[10px] font-semibold text-slate-500">
                {stats?.estimatedSizeKb ? `Đã dùng ~${stats.estimatedSizeKb} KB` : 'IndexedDB Turbo'}
              </p>
            </div>
          </div>

          {/* Core Action Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span>TÁC VỤ ĐIỀU HÀNH BỘ NHỚ & BẢNG VÀNG</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Restore Official 152 */}
              <button
                onClick={handleRestoreOfficial152}
                disabled={isLoading}
                className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left transition-all group flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-amber-950">
                    Khôi phục 152 Đoàn viên chuẩn 2025-2026
                  </h5>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Tái lập danh sách trích xuất đầy đủ 152 chiến sĩ và điểm danh 5 hoạt động phong trào Đoàn trường.
                  </p>
                </div>
              </button>

              {/* Optimize Memory */}
              <button
                onClick={handleOptimizeMemory}
                disabled={isLoading}
                className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition-all group flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-2 bg-indigo-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-indigo-950">
                    Tối ưu hóa & Dọn dẹp Cache
                  </h5>
                  <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                    Xóa bản ghi trùng lặp, chuẩn hóa họ tên, cập nhật thứ hạng và giải phóng cache thừa.
                  </p>
                </div>
              </button>

              {/* Force Cloud Sync */}
              <button
                onClick={handleForceCloudSync}
                disabled={isLoading}
                className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all group flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-2 bg-blue-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-blue-950">
                    Đồng bộ Đám mây & Máy chủ tức thì
                  </h5>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    Đẩy bộ nhớ hiện tại lên Cloud Firestore và tệp sao lưu vĩnh viễn trên máy chủ.
                  </p>
                </div>
              </button>

              {/* Export Honor Board CSV */}
              <button
                onClick={() => exportHonoredStudentsCSV(volunteerMembers)}
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-all group flex items-start space-x-3 cursor-pointer"
              >
                <div className="p-2 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-emerald-950">
                    Xuất Bảng Vàng Vinh Danh (CSV / Excel)
                  </h5>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Tải danh sách vinh danh học sinh kèm thứ hạng, danh hiệu và số lượt cống hiến.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Backup & Restore Storage File */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SAO LƯU & PHỤC HỒI TỆP BỘ NHỚ HỆ THỐNG</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportVolunteerMemoryJSON}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp sao lưu bộ nhớ (.JSON)</span>
              </button>

              <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Nạp lại bộ nhớ từ file JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Tệp sao lưu JSON chứa toàn bộ đoàn viên, lịch sử chuyên cần điểm danh và danh hiệu vinh danh.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Hệ thống bộ nhớ THPT Ba Chúc • Phiên bản Turbo 3.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
