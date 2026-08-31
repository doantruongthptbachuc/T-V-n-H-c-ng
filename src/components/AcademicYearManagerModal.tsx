import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  ShieldAlert,
  Info,
  Clock,
  Layers,
  Award,
  Sun,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  getAcademicYearBoundaries,
  parseYearRange,
} from '../utils/academicYearUtils';

interface AcademicYearManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableYears: string[];
  currentActiveYear: string;
  onSaveYearsList: (years: string[]) => void;
  onSetActiveYear: (year: string) => void;
  onInitializeNewYear?: (newYearStr: string) => void;
}

export const AcademicYearManagerModal: React.FC<AcademicYearManagerModalProps> = ({
  isOpen,
  onClose,
  availableYears,
  currentActiveYear,
  onSaveYearsList,
  onSetActiveYear,
  onInitializeNewYear,
}) => {
  const [newYearInput, setNewYearInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmInitYear, setConfirmInitYear] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = newYearInput.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập niên khóa (ví dụ: 2027 - 2028 hoặc 2028 - 2029)!');
      return;
    }

    const { startYear, endYear } = parseYearRange(trimmed);
    if (!startYear || !endYear || endYear <= startYear || endYear - startYear > 2) {
      setErrorMsg('Định dạng năm học không hợp lệ. Vui lòng nhập đúng dạng "YYYY - YYYY" (ví dụ: 2027 - 2028).');
      return;
    }

    const formattedYear = `${startYear} - ${endYear}`;
    if (availableYears.includes(formattedYear)) {
      setErrorMsg(`Năm học ${formattedYear} đã tồn tại trong hệ thống!`);
      return;
    }

    const updated = [...availableYears, formattedYear].sort((a, b) => {
      const pa = parseYearRange(a);
      const pb = parseYearRange(b);
      return pa.startYear - pb.startYear;
    });

    onSaveYearsList(updated);
    setNewYearInput('');
    setSuccessMsg(`Đã thêm thành công năm học mới: ${formattedYear}`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDeleteYear = (yearToDelete: string) => {
    if (yearToDelete === currentActiveYear) {
      alert('Không thể xóa năm học đang được chọn làm Năm Học Mặc Định Hiện Hành!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa niên khóa "${yearToDelete}" khỏi danh sách chọn?`)) {
      const updated = availableYears.filter(y => y !== yearToDelete);
      onSaveYearsList(updated);
    }
  };

  const handleConfirmInitYear = (yearStr: string) => {
    onSetActiveYear(yearStr);
    if (onInitializeNewYear) {
      onInitializeNewYear(yearStr);
    }
    setConfirmInitYear(null);
    setSuccessMsg(`Đã kích hoạt năm học ${yearStr}. Bảng điểm và Bảng Vinh danh của năm học này sẽ được tính độc lập và công bằng!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-yellow-300 font-black">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">QUẢN LÝ NIÊN KHÓA & NĂM HỌC MỚI</h3>
              <p className="text-xs text-red-100 font-medium">
                Thiết lập năm học, phân kỳ 05/09 – 31/05 & Chiến dịch hè 01/06 – 31/08
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Thông báo Nguyên tắc Phân kỳ & Điểm số công bằng */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2 text-amber-950">
            <div className="flex items-center space-x-2 font-black text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>NGUYÊN TẮC BẢO ĐẢM CÔNG BẰNG CHO HỌC SINH MỚI</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 font-medium text-amber-900/90 leading-relaxed">
              <li>
                <strong>Năm học chính khóa:</strong> Điểm hoạt động tính tự động từ ngày <strong>05/09</strong> năm trước đến ngày <strong>31/05</strong> năm sau (VD: 2026-2027 từ 05/09/2026 đến 31/05/2027).
              </li>
              <li>
                <strong>Chiến dịch tình nguyện hè:</strong> Tính từ ngày <strong>01/06</strong> đến ngày <strong>31/08</strong>.
              </li>
              <li>
                <strong>Tính độc lập từng năm:</strong> Khi mở năm học mới (VD: 2027-2028, 2028-2029...), điểm số của năm cũ sẽ không bị cộng dồn lẫn lộn, giúp học sinh mới vào trường thi đua Bảng Vàng hoàn toàn bình đẳng!
              </li>
            </ul>
          </div>

          {/* Form thêm năm học mới */}
          <form onSubmit={handleAddNewYear} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-black text-slate-700 uppercase">
              Thêm Năm Học Mới Vào Hệ Thống
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newYearInput}
                onChange={e => setNewYearInput(e.target.value)}
                placeholder="VD: 2027 - 2028 hoặc 2028 - 2029"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Niên Khóa</span>
              </button>
            </div>
            {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}
            {successMsg && <p className="text-xs font-bold text-emerald-600">{successMsg}</p>}
          </form>

          {/* Danh sách các năm học hiện có */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Danh Sách Niên Khóa Đang Hoạt Động ({availableYears.length} năm)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableYears.map(year => {
                const isCurrent = year === currentActiveYear;
                const bounds = getAcademicYearBoundaries(year);

                return (
                  <div
                    key={year}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900">{year}</span>
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                            Hiện hành
                          </span>
                        ) : (
                          <button
                            onClick={() => onSetActiveYear(year)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-slate-600 font-medium">
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Chính khóa: <strong>{bounds.labelMain}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Hè: <strong>{bounds.labelSummer}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setConfirmInitYear(year)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Kích hoạt phân kỳ độc lập cho năm học này"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Kích hoạt niên khóa</span>
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => handleDeleteYear(year)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa niên khóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal xác nhận chuyển đổi & làm mới điểm năm học */}
          {confirmInitYear && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3 animate-in fade-in">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black text-indigo-950 uppercase">
                    Xác nhận kích hoạt năm học: {confirmInitYear}
                  </h5>
                  <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                    Hệ thống sẽ chuyển góc nhìn mặc định sang năm học <strong>{confirmInitYear}</strong>. Điểm số các hoạt động sẽ được tổng hợp chính xác theo các hoạt động diễn ra từ ngày <strong>05/09</strong> đến <strong>31/05</strong> và hoạt động hè từ <strong>01/06</strong> đến <strong>31/08</strong> của năm này.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setConfirmInitYear(null)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleConfirmInitYear(confirmInitYear)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
                >
                  Đồng ý Kích hoạt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
