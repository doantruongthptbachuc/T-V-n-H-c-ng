import { Question, Story, AIChatLog, SchoolConfig, Counselor } from '../types';
import { convertToCSV, downloadFile } from './storage';

export interface CounselingReportFilter {
  month: number; // 0 = All, 1-12 = Jan-Dec
  year: number; // 0 = All, 2024, 2025, 2026, etc.
  topic?: string; // 'all' or specific topic
  grade?: string; // 'all', '10', '11', '12'
}

export interface CounselingReportMetrics {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  anonymousQuestions: number;
  emergencyQuestions: number;
  totalAILogs: number;
  emergencyAILogs: number;
  totalStories: number;
  approvedStories: number;
  topicCounts: Record<string, number>;
  gradeCounts: {
    grade10: number;
    grade11: number;
    grade12: number;
    other: number;
  };
  counselorCounts: Record<string, number>;
  filteredQuestions: Question[];
  filteredStories: Story[];
  filteredAILogs: AIChatLog[];
  reportPeriodText: string;
}

/**
 * Helper to parse a date string safely into Year and Month
 */
export function parseDate(dateStr?: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  
  // Format: YYYY-MM-DD or ISO
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10),
    };
  }

  // Format: DD/MM/YYYY
  const vnMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (vnMatch) {
    return {
      year: parseInt(vnMatch[3], 10),
      month: parseInt(vnMatch[2], 10),
      day: parseInt(vnMatch[1], 10),
    };
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }

  return null;
}

/**
 * Filter and compute statistics for a counseling report
 */
export function computeCounselingReportData(
  questions: Question[],
  stories: Story[],
  aiLogs: AIChatLog[],
  filter: CounselingReportFilter
): CounselingReportMetrics {
  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    // Date filter
    if (filter.year > 0 || filter.month > 0) {
      const parsed = parseDate(q.createdAt);
      if (parsed) {
        if (filter.year > 0 && parsed.year !== filter.year) return false;
        if (filter.month > 0 && parsed.month !== filter.month) return false;
      }
    }

    // Topic filter
    if (filter.topic && filter.topic !== 'all' && q.topic !== filter.topic) {
      return false;
    }

    // Grade filter
    if (filter.grade && filter.grade !== 'all') {
      const cls = (q.className || '').trim().toUpperCase();
      if (!cls.startsWith(filter.grade)) {
        return false;
      }
    }

    return true;
  });

  // Filter stories
  const filteredStories = stories.filter((s) => {
    if (filter.year > 0 || filter.month > 0) {
      const parsed = parseDate(s.createdAt);
      if (parsed) {
        if (filter.year > 0 && parsed.year !== filter.year) return false;
        if (filter.month > 0 && parsed.month !== filter.month) return false;
      }
    }
    if (filter.topic && filter.topic !== 'all' && s.topic !== filter.topic) {
      return false;
    }
    if (filter.grade && filter.grade !== 'all') {
      const cls = (s.className || '').trim().toUpperCase();
      if (!cls.startsWith(filter.grade)) {
        return false;
      }
    }
    return true;
  });

  // Filter AI Logs
  const filteredAILogs = aiLogs.filter((log) => {
    if (filter.year > 0 || filter.month > 0) {
      const parsed = parseDate(log.timestamp);
      if (parsed) {
        if (filter.year > 0 && parsed.year !== filter.year) return false;
        if (filter.month > 0 && parsed.month !== filter.month) return false;
      }
    }
    if (filter.topic && filter.topic !== 'all' && log.topicCategory !== filter.topic) {
      return false;
    }
    return true;
  });

  // Aggregate stats
  let answeredQuestions = 0;
  let pendingQuestions = 0;
  let anonymousQuestions = 0;
  let emergencyQuestions = 0;
  const topicCounts: Record<string, number> = {};
  const gradeCounts = { grade10: 0, grade11: 0, grade12: 0, other: 0 };
  const counselorCounts: Record<string, number> = {};

  filteredQuestions.forEach((q) => {
    if (q.status === 'answered') answeredQuestions++;
    else pendingQuestions++;

    if (q.isAnonymous) anonymousQuestions++;

    const isEmerg = (q.notes && q.notes.toLowerCase().includes('khẩn cấp')) || 
      q.question.toLowerCase().includes('tự tử') || 
      q.question.toLowerCase().includes('bạo lực') ||
      q.question.toLowerCase().includes('trầm cảm');
    if (isEmerg) emergencyQuestions++;

    // Topic count
    const t = q.topic || 'Khác';
    topicCounts[t] = (topicCounts[t] || 0) + 1;

    // Grade count
    const cls = (q.className || '').trim().toUpperCase();
    if (cls.startsWith('10')) gradeCounts.grade10++;
    else if (cls.startsWith('11')) gradeCounts.grade11++;
    else if (cls.startsWith('12')) gradeCounts.grade12++;
    else gradeCounts.other++;

    // Counselor count
    if (q.answeredBy) {
      const c = q.answeredBy.trim();
      counselorCounts[c] = (counselorCounts[c] || 0) + 1;
    }
  });

  let approvedStories = 0;
  filteredStories.forEach((s) => {
    if (s.status === 'approved') approvedStories++;
    const t = s.topic || 'Khác';
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  });

  let emergencyAILogs = 0;
  filteredAILogs.forEach((l) => {
    if (l.isEmergency) emergencyAILogs++;
  });

  let reportPeriodText = 'Toàn bộ thời gian (Tất cả dữ liệu)';
  if (filter.month > 0 && filter.year > 0) {
    reportPeriodText = `Tháng ${filter.month < 10 ? '0' + filter.month : filter.month} năm ${filter.year}`;
  } else if (filter.month > 0) {
    reportPeriodText = `Tháng ${filter.month < 10 ? '0' + filter.month : filter.month} (Mọi năm)`;
  } else if (filter.year > 0) {
    reportPeriodText = `Năm học / Năm ${filter.year}`;
  }

  return {
    totalQuestions: filteredQuestions.length,
    answeredQuestions,
    pendingQuestions,
    anonymousQuestions,
    emergencyQuestions,
    totalAILogs: filteredAILogs.length,
    emergencyAILogs,
    totalStories: filteredStories.length,
    approvedStories,
    topicCounts,
    gradeCounts,
    counselorCounts,
    filteredQuestions,
    filteredStories,
    filteredAILogs,
    reportPeriodText,
  };
}

/**
 * Generate a comprehensive CSV export string with UTF-8 BOM
 */
export function generateCounselingReportCSV(
  reportData: CounselingReportMetrics,
  config: SchoolConfig,
  customNotes?: string
): string {
  const lines: string[] = [];
  const addLine = (row: (string | number | undefined | null)[]) => {
    const escaped = row.map((val) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    });
    lines.push(escaped.join(','));
  };

  const addEmpty = () => lines.push('');

  // 1. Header Information
  addLine(['SỞ GIÁO DỤC VÀ ĐÀO TẠO AN GIANG', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  addLine(['TRƯỜNG THPT BA CHÚC', 'Độc lập - Tự do - Hạnh phúc']);
  addLine(['BAN TƯ VẤN TÂM LÝ HỌC ĐƯỜNG', '']);
  addEmpty();
  addLine([`BÁO CÁO TỔNG HỢP TÌNH HÌNH TƯ VẤN TÂM LÝ HỌC ĐƯỜNG & HỎI ĐÁP HỌC SINH`]);
  addLine([`KỲ BÁO CÁO: ${reportData.reportPeriodText.toUpperCase()}`]);
  addLine([`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} lúc ${new Date().toLocaleTimeString('vi-VN')}`]);
  addLine([`Đơn vị: ${config.schoolName || 'Trường THPT Ba Chúc'} - Phòng Tư Vấn: ${config.consultingRoom || 'Phòng Tư vấn học đường'}`]);
  addEmpty();

  // 2. Summary KPIs
  addLine(['=== I. TỔNG HỢP CÁC CHỈ SỐ HOẠT ĐỘNG TƯ VẤN TRONG KỲ ===']);
  addLine(['Chỉ tiêu thống kê', 'Số lượng', 'Đơn vị tính', 'Ghi chú / Tỷ lệ']);
  addLine(['Tổng số câu hỏi & yêu cầu tư vấn tiếp nhận', reportData.totalQuestions, 'Câu hỏi', '100%']);
  addLine(['Số ca đã được Thầy Cô giải đáp & hỗ trợ', reportData.answeredQuestions, 'Ca đã xử lý', `${reportData.totalQuestions > 0 ? Math.round((reportData.answeredQuestions / reportData.totalQuestions) * 100) : 0}% tổng câu hỏi`]);
  addLine(['Số ca đang trong quá trình tư vấn / theo dõi', reportData.pendingQuestions, 'Ca đang chờ', `${reportData.totalQuestions > 0 ? Math.round((reportData.pendingQuestions / reportData.totalQuestions) * 100) : 0}%`]);
  addLine(['Số câu hỏi học sinh gửi dưới dạng ẩn danh', reportData.anonymousQuestions, 'Câu hỏi', `${reportData.totalQuestions > 0 ? Math.round((reportData.anonymousQuestions / reportData.totalQuestions) * 100) : 0}%`]);
  addLine(['Số lượt học sinh tương tác hỏi đáp qua Trợ lý AI', reportData.totalAILogs, 'Lượt tương tác', 'Lưu trữ tự động từ hộp chat']);
  addLine(['Số trường hợp phát hiện cảnh báo tâm lý nhạy cảm / can thiệp', reportData.emergencyQuestions + reportData.emergencyAILogs, 'Trường hợp', 'Cần Thầy Cô & Nhà trường lưu ý']);
  addLine(['Số bài viết tâm sự / Chuyện muốn kể đã duyệt', reportData.approvedStories, 'Bài viết', `Trên tổng số ${reportData.totalStories} bài gửi về`]);
  addEmpty();

  // 3. Topic Breakdown
  addLine(['=== II. THỐNG KÊ CƠ CẤU THEO CHỦ ĐỀ QUAN TÂM ===']);
  addLine(['Chủ đề tư vấn', 'Số lượng tiếp nhận', 'Tỷ lệ %']);
  const totalTopicItems = Object.values(reportData.topicCounts).reduce((a, b) => a + b, 0);
  Object.entries(reportData.topicCounts).forEach(([topic, count]) => {
    const pct = totalTopicItems > 0 ? Math.round((count / totalTopicItems) * 100) : 0;
    addLine([topic, count, `${pct}%`]);
  });
  addEmpty();

  // 4. Grade Breakdown
  addLine(['=== III. PHÂN BỐ HỌC SINH THEO KHỐI LỚP ===']);
  addLine(['Khối lớp', 'Số lượt gửi câu hỏi', 'Tỷ lệ %']);
  const qTotal = reportData.totalQuestions || 1;
  addLine(['Khối 10', reportData.gradeCounts.grade10, `${Math.round((reportData.gradeCounts.grade10 / qTotal) * 100)}%`]);
  addLine(['Khối 11', reportData.gradeCounts.grade11, `${Math.round((reportData.gradeCounts.grade11 / qTotal) * 100)}%`]);
  addLine(['Khối 12', reportData.gradeCounts.grade12, `${Math.round((reportData.gradeCounts.grade12 / qTotal) * 100)}%`]);
  if (reportData.gradeCounts.other > 0) {
    addLine(['Chưa rõ lớp / Khác', reportData.gradeCounts.other, `${Math.round((reportData.gradeCounts.other / qTotal) * 100)}%`]);
  }
  addEmpty();

  // 5. Detailed Question Table
  addLine(['=== IV. DANH SÁCH CHI TIẾT CÁC CA TƯ VẤN & CÂU HỎI TRONG KỲ ===']);
  addLine([
    'STT',
    'Mã Số',
    'Thời Gian Gửi',
    'Họ Tên Học Sinh',
    'Lớp',
    'Chủ Đề',
    'Nội Dung Câu Hỏi / Vấn Đề Của Học Sinh',
    'Trạng Thái',
    'Thầy Cô Giải Đáp',
    'Thời Gian Giải Đáp',
    'Nội Dung Lời Khuyên / Hướng Dẫn Tư Vấn',
    'Ghi Chú Nội Bộ'
  ]);

  reportData.filteredQuestions.forEach((q, idx) => {
    addLine([
      idx + 1,
      q.code || q.id,
      q.createdAt || '',
      q.isAnonymous ? 'Học sinh ẩn danh' : (q.studentName || 'Ẩn danh'),
      q.className || 'Chưa rõ',
      q.topic || 'Khác',
      q.question || '',
      q.status === 'answered' ? 'Đã giải đáp' : 'Đang chờ xử lý',
      q.answeredBy || 'Ban Tư Vấn',
      q.answeredAt || '',
      q.answer || '',
      q.notes || ''
    ]);
  });
  addEmpty();

  // 6. Evaluative Notes & Signatures
  if (customNotes) {
    addLine(['=== V. ĐÁNH GIÁ & ĐỀ XUẤT CỦA BAN TƯ VẤN TÂM LÝ ===']);
    addLine(['Nội dung đánh giá:', customNotes]);
    addEmpty();
  }

  addLine(['=== VI. XÁC NHẬN CỦA CÁC BÊN LIÊN QUAN ===']);
  addLine(['NGƯỜI LẬP BÁO CÁO', 'CÁN BỘ PHỤ TRÁCH TƯ VẤN', 'BAN GIÁM HIỆU PHÊ DUYỆT']);
  addLine(['(Ký, ghi rõ họ tên)', '(Ký, ghi rõ họ tên)', '(Ký, đóng dấu và lưu trữ hồ sơ)']);

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Trigger CSV download directly to client machine
 */
export function exportCounselingReportCSVFile(
  reportData: CounselingReportMetrics,
  config: SchoolConfig,
  customNotes?: string
): void {
  const csvContent = generateCounselingReportCSV(reportData, config, customNotes);
  const safePeriod = reportData.reportPeriodText.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BaoCao_TuVanTamLy_THPT_BaChuc_${safePeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Generate Printable HTML String for PDF Export and Print Preview
 */
export function generateCounselingReportHTML(
  reportData: CounselingReportMetrics,
  config: SchoolConfig,
  counselors: Counselor[] = [],
  customNotes: string = '',
  reportSigner: string = 'Ban Tư Vấn Tâm Lý Học Đường'
): string {
  const currentDate = new Date();
  const dateString = `Ba Chúc, ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;
  
  const totalQueries = reportData.totalQuestions;
  const answeredPct = totalQueries > 0 ? Math.round((reportData.answeredQuestions / totalQueries) * 100) : 0;

  const topicEntries = Object.entries(reportData.topicCounts).sort((a, b) => b[1] - a[1]);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo cáo tình hình tư vấn tâm lý học đường - THPT Ba Chúc</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.4;
      color: #111;
      background: #fff;
      margin: 0;
      padding: 20px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .header-table td {
      vertical-align: top;
      padding: 0;
    }
    .school-info {
      text-align: center;
      width: 45%;
    }
    .school-info .dept {
      font-size: 11pt;
      text-transform: uppercase;
      font-weight: bold;
    }
    .school-info .school {
      font-size: 12pt;
      text-transform: uppercase;
      font-weight: bold;
      margin-top: 2px;
    }
    .school-info .counseling-unit {
      font-size: 11pt;
      font-weight: bold;
      color: #1e3a8a;
      margin-top: 2px;
    }
    .school-info .line {
      width: 80px;
      height: 1px;
      background: #333;
      margin: 4px auto 0;
    }
    .national-info {
      text-align: center;
      width: 55%;
    }
    .national-info .title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .national-info .subtitle {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 2px;
    }
    .national-info .line {
      width: 120px;
      height: 1px;
      background: #333;
      margin: 4px auto 0;
    }
    .doc-title {
      text-align: center;
      margin: 25px 0 15px 0;
    }
    .doc-title h1 {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 5px 0;
      color: #0f172a;
    }
    .doc-title .period {
      font-size: 12pt;
      font-style: italic;
      font-weight: bold;
      color: #1e40af;
      margin: 0;
    }
    .doc-title .meta {
      font-size: 10pt;
      font-style: italic;
      color: #555;
      margin-top: 3px;
    }
    h2.section-heading {
      font-size: 12.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 18px 0 8px 0;
      color: #1e3a8a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 3px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    .kpi-card {
      border: 1px solid #94a3b8;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
      background: #f8fafc;
    }
    .kpi-card .num {
      font-size: 16pt;
      font-weight: bold;
      color: #1e3a8a;
      margin: 2px 0;
    }
    .kpi-card .label {
      font-size: 9.5pt;
      font-weight: bold;
      color: #475569;
      text-transform: uppercase;
    }
    .kpi-card .sub {
      font-size: 8.5pt;
      color: #64748b;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 15px 0;
      font-size: 11pt;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #475569;
      padding: 6px 8px;
      text-align: left;
    }
    table.data-table th {
      background-color: #e2e8f0;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      font-size: 10pt;
    }
    table.data-table td.center {
      text-align: center;
    }
    table.data-table td.bold {
      font-weight: bold;
    }
    .topic-bar-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .topic-bar-bg {
      flex: 1;
      height: 10px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }
    .topic-bar-fill {
      height: 100%;
      background: #2563eb;
      border-radius: 4px;
    }
    .text-block {
      text-align: justify;
      margin-bottom: 10px;
      font-size: 12pt;
    }
    .signature-table {
      width: 100%;
      margin-top: 30px;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    .signature-table td {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
      padding: 5px;
    }
    .signature-table .role {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 11pt;
    }
    .signature-table .note {
      font-size: 10pt;
      font-style: italic;
      color: #555;
      margin-bottom: 60px;
    }
    .signature-table .name {
      font-weight: bold;
      font-size: 11.5pt;
    }
    .date-location {
      text-align: right;
      font-style: italic;
      font-size: 11pt;
      margin-bottom: 8px;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
    }
    .badge-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .badge-pending {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- HEADER TIÊU NGỮ -->
  <table class="header-table">
    <tr>
      <td class="school-info">
        <div class="dept">SỞ GD&ĐT AN GIANG</div>
        <div class="school">${config.schoolName || 'TRƯỜNG THPT BA CHÚC'}</div>
        <div class="counseling-unit">BAN TƯ VẤN HỌC ĐƯỜNG</div>
        <div class="line"></div>
      </td>
      <td class="national-info">
        <div class="title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="subtitle">Độc lập - Tự do - Hạnh phúc</div>
        <div class="line"></div>
      </td>
    </tr>
  </table>

  <!-- TIÊU ĐỀ BÁO CÁO -->
  <div class="doc-title">
    <h1>BÁO CÁO TỔNG HỢP TÌNH HÌNH TƯ VẤN TÂM LÝ HỌC ĐƯỜNG</h1>
    <p class="period">KỲ BÁO CÁO: ${reportData.reportPeriodText.toUpperCase()}</p>
    <p class="meta">Địa điểm thực hiện: ${config.consultingRoom || 'Phòng Tư vấn học đường THPT Ba Chúc'} • Hotline: ${config.hotline || '0296.3876.123'}</p>
  </div>

  <!-- PHẦN I: TỔNG HỢP SỐ LIỆU -->
  <h2 class="section-heading">I. TỔNG HỢP CHỈ SỐ HOẠT ĐỘNG TƯ VẤN TRONG KỲ</h2>
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="label">Tổng ca tư vấn</div>
      <div class="num">${reportData.totalQuestions}</div>
      <div class="sub">Tiếp nhận từ học sinh</div>
    </div>
    <div class="kpi-card">
      <div class="label">Đã giải đáp</div>
      <div class="num" style="color: #166534;">${reportData.answeredQuestions}</div>
      <div class="sub">Đạt ${answeredPct}% tổng số ca</div>
    </div>
    <div class="kpi-card">
      <div class="label">Tương tác AI 24/7</div>
      <div class="num" style="color: #7c3aed;">${reportData.totalAILogs}</div>
      <div class="sub">Lượt hội thoại tự động</div>
    </div>
    <div class="kpi-card">
      <div class="label">Cảnh báo can thiệp</div>
      <div class="num" style="color: #dc2626;">${reportData.emergencyQuestions + reportData.emergencyAILogs}</div>
      <div class="sub">Ca tâm lý nhạy cảm</div>
    </div>
  </div>

  <!-- PHẦN II: CƠ CẤU CHỦ ĐỀ -->
  <h2 class="section-heading">II. PHÂN TÍCH DIỄN BIẾN TÂM LÝ THEO CHỦ ĐỀ & KHỐI LỚP</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 35%;">Chủ đề tư vấn tâm lý</th>
        <th style="width: 15%;">Số ca ghi nhận</th>
        <th style="width: 15%;">Tỷ lệ (%)</th>
        <th style="width: 30%;">Biểu đồ phân bổ</th>
      </tr>
    </thead>
    <tbody>
      ${topicEntries.map(([topic, count], idx) => {
        const total = reportData.totalQuestions || 1;
        const pct = Math.round((count / total) * 100);
        return `
          <tr>
            <td class="center">${idx + 1}</td>
            <td class="bold">${topic}</td>
            <td class="center bold">${count}</td>
            <td class="center">${pct}%</td>
            <td>
              <div class="topic-bar-container">
                <div class="topic-bar-bg">
                  <div class="topic-bar-fill" style="width: ${Math.min(pct, 100)}%;"></div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <p class="text-block">
    <strong>* Phân bổ theo Khối lớp:</strong> 
    Khối 10: <strong>${reportData.gradeCounts.grade10} ca</strong> (${Math.round((reportData.gradeCounts.grade10 / (reportData.totalQuestions || 1)) * 100)}%) • 
    Khối 11: <strong>${reportData.gradeCounts.grade11} ca</strong> (${Math.round((reportData.gradeCounts.grade11 / (reportData.totalQuestions || 1)) * 100)}%) • 
    Khối 12: <strong>${reportData.gradeCounts.grade12} ca</strong> (${Math.round((reportData.gradeCounts.grade12 / (reportData.totalQuestions || 1)) * 100)}%) • 
    Khác: <strong>${reportData.gradeCounts.other} ca</strong>.
  </p>

  <!-- PHẦN III: BẢNG DANH SÁCH CHI TIẾT CÁC CA TƯ VẤN -->
  <h2 class="section-heading">III. DANH MỤC TRÍCH XUẤT CÁC CA TƯ VẤN TIÊU BIỂU</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 12%;">Mã / Ngày</th>
        <th style="width: 15%;">Học sinh / Lớp</th>
        <th style="width: 18%;">Chủ đề</th>
        <th style="width: 32%;">Vấn đề / Câu hỏi học sinh</th>
        <th style="width: 18%;">Thầy Cô & Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.filteredQuestions.length === 0 ? `
        <tr><td colspan="6" class="center" style="padding: 20px; font-style: italic;">Không có câu hỏi tư vấn nào trong khoảng thời gian đã chọn.</td></tr>
      ` : reportData.filteredQuestions.slice(0, 30).map((q, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="center" style="font-size: 9pt;">
            <strong>${q.code || q.id.slice(0, 6)}</strong><br/>
            ${q.createdAt ? q.createdAt.slice(0, 10) : ''}
          </td>
          <td>
            <strong>${q.isAnonymous ? 'Ẩn danh' : (q.studentName || 'Ẩn danh')}</strong><br/>
            <span style="font-size: 9pt; color: #555;">Lớp: ${q.className || 'Chưa rõ'}</span>
          </td>
          <td style="font-size: 9.5pt;"><strong>${q.topic}</strong></td>
          <td style="font-size: 9.5pt;">
            <div style="max-height: 80px; overflow: hidden; text-overflow: ellipsis;">
              ${q.question}
            </div>
          </td>
          <td style="font-size: 9.5pt;">
            <span class="badge ${q.status === 'answered' ? 'badge-success' : 'badge-pending'}">
              ${q.status === 'answered' ? 'Đã giải đáp' : 'Đang chờ'}
            </span><br/>
            <span style="font-size: 8.5pt; color: #475569;">${q.answeredBy || 'Ban Tư Vấn'}</span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ${reportData.filteredQuestions.length > 30 ? `
    <p style="font-size: 9pt; font-style: italic; color: #64748b; margin-top: -5px;">
      * Hiển thị 30 ca tư vấn đầu tiên trên bản in. Toàn bộ ${reportData.filteredQuestions.length} ca đã được xuất đầy đủ trong file dữ liệu CSV kèm theo.
    </p>
  ` : ''}

  <!-- PHẦN IV: ĐÁNH GIÁ & KIẾN NGHỊ -->
  <h2 class="section-heading">IV. ĐÁNH GIÁ TÌNH HÌNH & KIẾN NGHỊ VỚI NHÀ TRƯỜNG</h2>
  <div class="text-block">
    ${customNotes ? `<p style="white-space: pre-line;">${customNotes}</p>` : `
      <p>1. <strong>Đánh giá chung:</strong> Trong kỳ báo cáo, Ban Tư vấn học đường đã tiếp nhận và giải quyết kịp thời các băn khoăn, lo lắng của học sinh. Các chủ đề được quan tâm nhiều nhất tập trung vào phương pháp học tập, giảm áp lực thi cử và định hướng nghề nghiệp cho học sinh khối 12.</p>
      <p>2. <strong>Công tác phối hợp:</strong> Sự phối hợp giữa Giáo viên Chủ nhiệm, Đoàn Thanh niên và Ban Tư vấn diễn ra chặt chẽ, phát hiện sớm các trường hợp có dấu hiệu tâm lý bất thường để có biện pháp hỗ trợ riêng tư, an toàn.</p>
      <p>3. <strong>Phương hướng tháng tới:</strong> Tiếp tục đẩy mạnh truyền thông chuyên đề sinh hoạt dưới cờ, cập nhật thêm tài nguyên tự học và kiến thức sức khỏe tâm lý trên Cổng thông tin học đường.</p>
    `}
  </div>

  <!-- PHẦN V: CHỮ KÝ VÀ PHÊ DUYỆT -->
  <div class="date-location">${dateString}</div>
  <table class="signature-table">
    <tr>
      <td>
        <div class="role">NGƯỜI LẬP BÁO CÁO</div>
        <div class="note">(Ký, ghi rõ họ tên)</div>
        <div class="name">${reportSigner}</div>
      </td>
      <td>
        <div class="role">ĐOÀN THANH NIÊN TRƯỜNG</div>
        <div class="note">(Ký, ghi rõ họ tên)</div>
        <div class="name">Bí Thư Đoàn Trường</div>
      </td>
      <td>
        <div class="role">HIỆU TRƯỞNG PHÊ DUYỆT</div>
        <div class="note">(Ký, đóng dấu & lưu trữ)</div>
        <div class="name">Ban Giám Hiệu</div>
      </td>
    </tr>
  </table>

  <script>
    window.onload = function() {
      // Auto focus for print if desired
    };
  </script>
</body>
</html>
  `;
}

/**
 * Open print window for immediate PDF creation / physical printing
 */
export function printCounselingReport(
  reportData: CounselingReportMetrics,
  config: SchoolConfig,
  counselors: Counselor[] = [],
  customNotes: string = '',
  reportSigner: string = 'Ban Tư Vấn Tâm Lý Học Đường'
): void {
  const html = generateCounselingReportHTML(reportData, config, counselors, customNotes, reportSigner);
  
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  } else {
    // Fallback: create iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  }
}
