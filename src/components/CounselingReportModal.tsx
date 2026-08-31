import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  PieChart,
  Bot,
  Copy,
  Check,
  X,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
  Settings2
} from 'lucide-react';
import { Question, Story, AIChatLog, SchoolConfig, Counselor, TopicType } from '../types';
import {
  CounselingReportFilter,
  computeCounselingReportData,
  exportCounselingReportCSVFile,
  printCounselingReport,
  generateCounselingReportHTML
} from '../utils/counselingReportGenerator';

interface CounselingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  stories?: Story[];
  aiLogs?: AIChatLog[];
  counselors?: Counselor[];
  config: SchoolConfig;
}

export const CounselingReportModal: React.FC<CounselingReportModalProps> = ({
  isOpen,
  onClose,
  questions,
  stories = [],
  aiLogs = [],
  counselors = [],
  config,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'table'>('overview');

  // Custom evaluative notes by counselor
  const [customNotes, setCustomNotes] = useState<string>(
    '1. Tình hình chung: Ban Tư vấn học đường đã tiếp nhận và giải quyết kịp thời các băn khoăn, lo lắng của học sinh trong tháng. Đa số học sinh tin tưởng và cởi mở chia sẻ.\n2. Trọng tâm tháng tới: Tăng cường truyền thông giảm áp lực thi cử, kỹ năng quản lý thời gian và hướng nghiệp chuyên sâu cho học sinh khối 12.'
  );
  const [reportSigner, setReportSigner] = useState<string>('Ban Tư Vấn Tâm Lý Học Đường');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Compute metrics based on filters
  const reportFilter: CounselingReportFilter = useMemo(() => ({
    month: selectedMonth,
    year: selectedYear,
    topic: selectedTopic,
    grade: selectedGrade,
  }), [selectedMonth, selectedYear, selectedTopic, selectedGrade]);

  const reportData = useMemo(() => {
    return computeCounselingReportData(questions, stories, aiLogs, reportFilter);
  }, [questions, stories, aiLogs, reportFilter]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    exportCounselingReportCSVFile(reportData, config, customNotes);
  };

  const handlePrintPDF = () => {
    printCounselingReport(reportData, config, counselors, customNotes, reportSigner);
  };

  const handleCopySummary = () => {
    const summaryText = `📊 BÁO CÁO TÌNH HÌNH TƯ VẤN TÂM LÝ HỌC ĐƯỜNG
🏫 Trường: ${config.schoolName || 'THPT Ba Chúc'}
📅 Kỳ báo cáo: ${reportData.reportPeriodText}
----------------------------------------
- Tổng số ca tư vấn tiếp nhận: ${reportData.totalQuestions} ca
- Đã giải đáp & hỗ trợ: ${reportData.answeredQuestions} ca (${reportData.totalQuestions > 0 ? Math.round((reportData.answeredQuestions / reportData.totalQuestions) * 100) : 0}%)
- Số ca đang chờ / theo dõi: ${reportData.pendingQuestions} ca
- Số lượt hỏi đáp tự động qua AI: ${reportData.totalAILogs} lượt
- Ca cảnh báo nguy cơ / khẩn cấp: ${reportData.emergencyQuestions + reportData.emergencyAILogs} ca
- Học sinh gửi ẩn danh: ${reportData.anonymousQuestions} ca

📌 Chủ đề được quan tâm nhiều nhất:
${Object.entries(reportData.topicCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([t, count]) => `  • ${t}: ${count} ca`)
  .join('\n')}

📝 Đánh giá của Ban Tư vấn:
${customNotes}

(Trích xuất tự động từ Cổng Thông Tin Tư Vấn Học Đường THPT Ba Chúc)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const totalQueries = reportData.totalQuestions;
  const answeredPct = totalQueries > 0 ? Math.round((reportData.answeredQuestions / totalQueries) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/30 text-amber-300 rounded-2xl border border-indigo-400/40 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-amber-400 text-indigo-950 font-black text-[10px] rounded-md uppercase tracking-wider">
                  BÁO CÁO HẰNG THÁNG
                </span>
                <span className="text-xs text-indigo-200 font-medium">Xuất CSV & PDF Chuẩn Sư Phạm</span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white mt-0.5">
                Báo Cáo Tình Hình Tư Vấn Tâm Lý Học Đường
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Month selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>Tháng báo cáo:</span>
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value={0}>✨ Tất cả các tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
            </div>

            {/* Year selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>Năm học:</span>
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value={0}>✨ Toàn thời gian</option>
                <option value={2027}>Năm 2027</option>
                <option value={2026}>Năm 2026</option>
                <option value={2025}>Năm 2025</option>
                <option value={2024}>Năm 2024</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Filter className="w-3 h-3 text-indigo-600" />
                <span>Chủ đề:</span>
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value="all">✨ Tất cả chủ đề</option>
                <option value="Học tập">Học tập & Áp lực thi cử</option>
                <option value="Tâm lý">Tâm lý & Cảm xúc</option>
                <option value="Bạn bè">Quan hệ bạn bè</option>
                <option value="Gia đình">Gia đình & Cha mẹ</option>
                <option value="Hướng nghiệp">Hướng nghiệp & Chọn ngành</option>
                <option value="Kỹ năng sống">Kỹ năng sống</option>
                <option value="Sức khỏe học đường">Sức khỏe học đường</option>
                <option value="Tình cảm học trò">Tình cảm học trò</option>
                <option value="Khác">Chủ đề khác</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1">
                <Users className="w-3 h-3 text-indigo-600" />
                <span>Khối lớp:</span>
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value="all">✨ Tất cả các khối</option>
                <option value="10">Khối 10 (Lớp 10A...)</option>
                <option value="11">Khối 11 (Lớp 11A...)</option>
                <option value="12">Khối 12 (Lớp 12A...)</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieChart className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tổng quan & Chỉ số</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xem trước Bản In / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Bảng dữ liệu ({reportData.filteredQuestions.length})</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 font-medium">
              <span>Kỳ báo cáo:</span>
              <strong className="text-indigo-900">{reportData.reportPeriodText}</strong>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border border-indigo-100 space-y-1">
                  <div className="text-[11px] font-bold text-indigo-800 uppercase flex items-center justify-between">
                    <span>Tổng ca tư vấn</span>
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                    {reportData.totalQuestions}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {reportData.anonymousQuestions} ca ẩn danh ({reportData.totalQuestions > 0 ? Math.round((reportData.anonymousQuestions / reportData.totalQuestions) * 100) : 0}%)
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center justify-between">
                    <span>Đã giải đáp</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                    {reportData.answeredQuestions}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Tỷ lệ hỗ trợ hoàn tất: <strong className="text-emerald-700">{answeredPct}%</strong>
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl border border-purple-100 space-y-1">
                  <div className="text-[11px] font-bold text-purple-800 uppercase flex items-center justify-between">
                    <span>Tương tác AI</span>
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-700">
                    {reportData.totalAILogs}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Lượt học sinh trò chuyện tự động
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-rose-50 to-amber-50/50 rounded-2xl border border-rose-100 space-y-1">
                  <div className="text-[11px] font-bold text-rose-800 uppercase flex items-center justify-between">
                    <span>Cảnh báo nhạy cảm</span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-600">
                    {reportData.emergencyQuestions + reportData.emergencyAILogs}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Từ khóa nguy cơ / cần theo dõi
                  </p>
                </div>
              </div>

              {/* Topic Breakdown & Grade Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topic progress list */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <PieChart className="w-4 h-4 text-indigo-600" />
                      <span>Cơ cấu theo chủ đề tư vấn</span>
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600">
                      {Object.keys(reportData.topicCounts).length} nhóm vấn đề
                    </span>
                  </h3>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(reportData.topicCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([topic, count]) => {
                        const pct = reportData.totalQuestions > 0 ? Math.round((count / reportData.totalQuestions) * 100) : 0;
                        return (
                          <div key={topic} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{topic}</span>
                              <span className="font-bold text-indigo-900">{count} ca ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    {Object.keys(reportData.topicCounts).length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-6">
                        Không có dữ liệu trong khoảng thời gian này.
                      </p>
                    )}
                  </div>
                </div>

                {/* Grade and School Distribution */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2 mb-3">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Phân bố theo khối lớp</span>
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-500">Khối 10</div>
                        <div className="text-xl font-black text-indigo-900 mt-1">
                          {reportData.gradeCounts.grade10}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {reportData.totalQuestions > 0 ? Math.round((reportData.gradeCounts.grade10 / reportData.totalQuestions) * 100) : 0}%
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-500">Khối 11</div>
                        <div className="text-xl font-black text-indigo-900 mt-1">
                          {reportData.gradeCounts.grade11}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {reportData.totalQuestions > 0 ? Math.round((reportData.gradeCounts.grade11 / reportData.totalQuestions) * 100) : 0}%
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-500">Khối 12</div>
                        <div className="text-xl font-black text-indigo-900 mt-1">
                          {reportData.gradeCounts.grade12}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {reportData.totalQuestions > 0 ? Math.round((reportData.gradeCounts.grade12 / reportData.totalQuestions) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Định dạng báo cáo lưu trữ:</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Báo cáo được chuẩn hóa theo thể thức văn bản hành chính sư phạm, sẵn sàng in đóng cuốn hồ sơ lưu trữ tháng hoặc gửi BGH & Sở GD&ĐT.
                    </p>
                  </div>
                </div>
              </div>

              {/* Editable Evaluative Notes for the report */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <Settings2 className="w-4 h-4 text-indigo-600" />
                    <span>Đánh giá & Kiến nghị của Ban Tư Vấn (Sẽ in vào báo cáo):</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Có thể chỉnh sửa trực tiếp nội dung</span>
                </div>

                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Nhập nhận xét về tình hình tâm lý học sinh trong tháng, các ca cần lưu ý và đề xuất giải pháp với Ban Giám hiệu..."
                  className="w-full p-3 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Đơn vị / Người lập báo cáo:
                    </label>
                    <input
                      type="text"
                      value={reportSigner}
                      onChange={(e) => setReportSigner(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phòng làm việc / Trụ sở:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={config.consultingRoom || 'Phòng Tư vấn học đường - THPT Ba Chúc'}
                      className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINT / PDF PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <span className="flex items-center space-x-2">
                  <Printer className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Bản xem trước theo khuôn khổ văn bản in A4. Khi bấm <strong>"In / Xuất PDF"</strong>, trình duyệt sẽ mở hộp thoại in để bạn lưu file PDF hoặc in trực tiếp.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition shrink-0 ml-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In ngay</span>
                </button>
              </div>

              {/* Document Frame Mockup */}
              <div className="bg-slate-100 p-3 sm:p-6 rounded-2xl border border-slate-300 overflow-x-auto">
                <div className="bg-white max-w-3xl mx-auto p-6 sm:p-10 rounded-lg shadow-md text-slate-900 border border-slate-200 font-serif text-[12px] leading-relaxed space-y-5">
                  {/* Top administrative header */}
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-200">
                    <div className="text-center space-y-0.5">
                      <div className="text-[11px] font-bold uppercase text-slate-800">SỞ GD&ĐT AN GIANG</div>
                      <div className="text-[12px] font-extrabold uppercase text-indigo-900">{config.schoolName || 'TRƯỜNG THPT BA CHÚC'}</div>
                      <div className="text-[11px] font-bold text-blue-900">BAN TƯ VẤN HỌC ĐƯỜNG</div>
                      <div className="w-16 h-0.5 bg-slate-400 mx-auto mt-1"></div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <div className="text-[11px] font-bold uppercase text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                      <div className="text-[12px] font-bold text-slate-900">Độc lập - Tự do - Hạnh phúc</div>
                      <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1"></div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-1 py-2">
                    <h1 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                      BÁO CÁO TỔNG HỢP TÌNH HÌNH TƯ VẤN TÂM LÝ HỌC ĐƯỜNG
                    </h1>
                    <div className="text-xs font-bold italic text-indigo-800">
                      KỲ BÁO CÁO: {reportData.reportPeriodText.toUpperCase()}
                    </div>
                  </div>

                  {/* Body highlights */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-indigo-900 uppercase border-b border-indigo-200 pb-1">
                      I. Tổng hợp số liệu trong kỳ:
                    </div>
                    <p>
                      - Tổng số ca tư vấn tiếp nhận: <strong>{reportData.totalQuestions} ca</strong> (Đã giải đáp hoàn tất: <strong>{reportData.answeredQuestions} ca</strong> - đạt {answeredPct}%; Đang theo dõi: <strong>{reportData.pendingQuestions} ca</strong>).
                    </p>
                    <p>
                      - Tương tác tự động qua Trợ lý AI: <strong>{reportData.totalAILogs} lượt</strong>.
                    </p>
                    <p>
                      - Số trường hợp phát hiện từ khóa nhạy cảm / can thiệp tâm lý: <strong>{reportData.emergencyQuestions + reportData.emergencyAILogs} ca</strong>.
                    </p>
                  </div>

                  {/* Table snippet */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-indigo-900 uppercase border-b border-indigo-200 pb-1">
                      II. Danh sách trích xuất các ca tư vấn ({reportData.filteredQuestions.length} ca):
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-300 text-[11px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold">
                            <th className="border border-slate-300 p-1.5 text-center">STT</th>
                            <th className="border border-slate-300 p-1.5">Mã / Ngày</th>
                            <th className="border border-slate-300 p-1.5">Học sinh / Lớp</th>
                            <th className="border border-slate-300 p-1.5">Chủ đề</th>
                            <th className="border border-slate-300 p-1.5">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.filteredQuestions.slice(0, 5).map((q, idx) => (
                            <tr key={q.id}>
                              <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                              <td className="border border-slate-300 p-1.5">{q.code || q.id.slice(0, 6)} ({q.createdAt ? q.createdAt.slice(0, 10) : ''})</td>
                              <td className="border border-slate-300 p-1.5">{q.isAnonymous ? 'Ẩn danh' : q.studentName} ({q.className || 'Chưa rõ'})</td>
                              <td className="border border-slate-300 p-1.5 font-semibold">{q.topic}</td>
                              <td className="border border-slate-300 p-1.5 text-emerald-700 font-bold">
                                {q.status === 'answered' ? 'Đã giải đáp' : 'Chờ xử lý'}
                              </td>
                            </tr>
                          ))}
                          {reportData.filteredQuestions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="border border-slate-300 p-3 text-center italic text-slate-500">
                                Không có câu hỏi nào trong kỳ này.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {reportData.filteredQuestions.length > 5 && (
                      <div className="text-[10px] text-slate-500 italic">
                        ... và {reportData.filteredQuestions.length - 5} ca tư vấn khác được xuất đầy đủ trong file PDF / CSV.
                      </div>
                    )}
                  </div>

                  {/* Notes & Signatures preview */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-indigo-900 uppercase border-b border-indigo-200 pb-1">
                      III. Đánh giá của Ban Tư Vấn:
                    </div>
                    <p className="italic text-slate-700 whitespace-pre-line">{customNotes}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-6 text-center text-xs">
                    <div>
                      <div className="font-bold uppercase">NGƯỜI LẬP BÁO CÁO</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
                      <div className="font-bold mt-12 text-slate-900">{reportSigner}</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase">ĐOÀN THANH NIÊN</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
                      <div className="font-bold mt-12 text-slate-900">Bí Thư Đoàn Trường</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase">HIỆU TRƯỞNG PHÊ DUYỆT</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">(Ký, đóng dấu lưu trữ)</div>
                      <div className="font-bold mt-12 text-slate-900">Ban Giám Hiệu</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DETAILED TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Danh sách gồm <strong>{reportData.filteredQuestions.length} câu hỏi</strong> trong kỳ:
                </span>
                <span className="font-bold text-indigo-700">
                  {reportData.reportPeriodText}
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3 text-center w-12">STT</th>
                        <th className="p-3">Mã / Ngày</th>
                        <th className="p-3">Học sinh / Lớp</th>
                        <th className="p-3">Chủ đề</th>
                        <th className="p-3">Nội dung câu hỏi</th>
                        <th className="p-3">Trạng thái / Thầy Cô</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.filteredQuestions.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-indigo-900 block">{q.code || q.id.slice(0, 6)}</span>
                            <span className="text-[10px] text-slate-500">{q.createdAt ? q.createdAt.slice(0, 10) : ''}</span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-bold text-slate-900">
                              {q.isAnonymous ? 'Học sinh ẩn danh' : (q.studentName || 'Ẩn danh')}
                            </div>
                            <div className="text-[10px] text-slate-500">Lớp: {q.className || 'Chưa rõ'}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-md font-semibold text-[11px] border border-indigo-100">
                              {q.topic}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="line-clamp-2 text-slate-700">{q.question}</div>
                            {q.answer && (
                              <div className="text-[10px] text-emerald-700 mt-1 line-clamp-1">
                                💬 <strong>Trả lời:</strong> {q.answer}
                              </div>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              q.status === 'answered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {q.status === 'answered' ? 'Đã giải đáp' : 'Chờ xử lý'}
                            </span>
                            {q.answeredBy && (
                              <div className="text-[10px] text-slate-500 mt-0.5">{q.answeredBy}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {reportData.filteredQuestions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                            Không tìm thấy câu hỏi nào phù hợp với bộ lọc đã chọn.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER & ACTION BUTTONS */}
        <div className="p-4 sm:p-5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Tổng số ca trích xuất: <strong className="text-indigo-900 font-bold">{reportData.totalQuestions} ca</strong> ({reportData.reportPeriodText})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Sao chép bản tóm tắt nhanh để gửi tin nhắn"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedSummary ? 'ĐÃ SAO CHÉP!' : 'Sao chép Tóm tắt'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Tải file Excel / CSV đầy đủ"
            >
              <Download className="w-4 h-4" />
              <span>Xuất File CSV (Excel)</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Mở trình in ấn và lưu file PDF chuẩn A4"
            >
              <Printer className="w-4 h-4" />
              <span>In / Xuất PDF Báo Cáo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
