import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  CheckCircle2,
  Clock,
  HelpCircle,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Question, TopicType } from '../types';

interface QAChartsViewProps {
  questions: Question[];
  isAdmin?: boolean;
}

const TOPICS_LIST: TopicType[] = [
  'Học tập',
  'Tâm lý',
  'Bạn bè',
  'Gia đình',
  'Hướng nghiệp',
  'Kỹ năng sống',
  'Sức khỏe học đường',
  'Hoạt động Đoàn',
  'Tình cảm học trò',
  'Khác'
];

const TOPIC_COLORS: Record<string, string> = {
  'Học tập': '#3B82F6',
  'Tâm lý': '#EC4899',
  'Bạn bè': '#F59E0B',
  'Gia đình': '#10B981',
  'Hướng nghiệp': '#8B5CF6',
  'Kỹ năng sống': '#06B6D4',
  'Sức khỏe học đường': '#14B8A6',
  'Hoạt động Đoàn': '#EF4444',
  'Tình cảm học trò': '#F43F5E',
  'Khác': '#64748B'
};

export const QAChartsView: React.FC<QAChartsViewProps> = ({ questions, isAdmin = false }) => {
  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAnonymity, setSelectedAnonymity] = useState<string>('all');

  // Filtered dataset
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Topic filter
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;

      // Status filter
      if (selectedStatus !== 'all' && q.status !== selectedStatus) return false;

      // Anonymity filter
      if (selectedAnonymity === 'anonymous' && !q.isAnonymous) return false;
      if (selectedAnonymity === 'public' && q.isAnonymous) return false;

      // Grade filter (deduced from className like "10A1", "11B2", "12C3" etc.)
      if (selectedGrade !== 'all') {
        const cls = (q.className || '').trim();
        if (!cls.startsWith(selectedGrade)) return false;
      }

      return true;
    });
  }, [questions, selectedTopic, selectedGrade, selectedStatus, selectedAnonymity]);

  // Metric computations
  const total = filteredQuestions.length;
  const answeredCount = filteredQuestions.filter((q) => q.status === 'answered').length;
  const pendingCount = filteredQuestions.filter((q) => q.status === 'pending').length;
  const anonymousCount = filteredQuestions.filter((q) => q.isAnonymous).length;
  const publicCount = total - anonymousCount;
  const responseRate = total > 0 ? Math.round((answeredCount / total) * 100) : 100;

  // Chart 1: Topic Distribution with Answered vs Pending breakdown
  const topicChartData = useMemo(() => {
    return TOPICS_LIST.map((topic) => {
      const qsInTopic = filteredQuestions.filter((q) => q.topic === topic);
      const answered = qsInTopic.filter((q) => q.status === 'answered').length;
      const pending = qsInTopic.filter((q) => q.status === 'pending').length;
      return {
        name: topic,
        'Đã trả lời': answered,
        'Chờ phản hồi': pending,
        total: qsInTopic.length,
        fillColor: TOPIC_COLORS[topic] || '#6366F1',
      };
    }).filter((item) => selectedTopic === 'all' || item.name === selectedTopic);
  }, [filteredQuestions, selectedTopic]);

  // Chart 2: Grade Breakdown (Khối 10, Khối 11, Khối 12, Khác)
  const gradeChartData = useMemo(() => {
    const grades = [
      { name: 'Khối 10', prefix: '10' },
      { name: 'Khối 11', prefix: '11' },
      { name: 'Khối 12', prefix: '12' },
    ];

    return grades.map((g) => {
      const inGrade = filteredQuestions.filter((q) => (q.className || '').startsWith(g.prefix));
      const answered = inGrade.filter((q) => q.status === 'answered').length;
      const pending = inGrade.filter((q) => q.status === 'pending').length;
      return {
        name: g.name,
        'Đã trả lời': answered,
        'Chờ phản hồi': pending,
        total: inGrade.length,
      };
    });
  }, [filteredQuestions]);

  // Chart 3: Status Distribution (Pie)
  const statusPieData = useMemo(() => {
    return [
      { name: 'Đã giải đáp', value: answeredCount, color: '#10B981' },
      { name: 'Đang xử lý / Chờ phản hồi', value: pendingCount, color: '#F59E0B' },
    ].filter((d) => d.value > 0);
  }, [answeredCount, pendingCount]);

  // Chart 4: Anonymity Distribution (Pie)
  const anonymityPieData = useMemo(() => {
    return [
      { name: 'Gửi Ẩn danh (Bảo mật 100%)', value: anonymousCount, color: '#8B5CF6' },
      { name: 'Công khai họ tên học sinh', value: publicCount, color: '#3B82F6' },
    ].filter((d) => d.value > 0);
  }, [anonymousCount, publicCount]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedTopic('all');
    setSelectedGrade('all');
    setSelectedStatus('all');
    setSelectedAnonymity('all');
  };

  const hasActiveFilters =
    selectedTopic !== 'all' ||
    selectedGrade !== 'all' ||
    selectedStatus !== 'all' ||
    selectedAnonymity !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Banner / Privacy Guarantee Note */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
              <span>DỮ LIỆU TỔNG QUAN TƯ VẤN HỌC ĐƯỜNG</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              BIỂU ĐỒ & PHÂN TÍCH NHU CẦU TƯ VẤN HỌC SINH
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Biểu đồ trực quan hóa xu hướng học tập, sức khỏe tinh thần và định hướng nghề nghiệp của học sinh THPT Ba Chúc (hoàn toàn bảo mật nội dung chi tiết).
            </p>
          </div>

          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Tỉ lệ phản hồi</p>
            <p className="text-3xl font-black text-emerald-400">{responseRate}%</p>
            <p className="text-[10px] text-blue-200/70">Đã được tư vấn</p>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>BỘ LỌC DỮ LIỆU BIỂU ĐỒ HỎI ĐÁP</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer transition"
            >
              ✕ Xóa bộ lọc (Hiển thị tất cả)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Filter 1: Chủ đề */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Chủ đề tư vấn:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả chủ đề ({questions.length})</option>
              {TOPICS_LIST.map((t) => (
                <option key={t} value={t}>
                  {t} ({questions.filter((q) => q.topic === t).length})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Khối lớp */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Khối lớp học sinh:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>

          {/* Filter 3: Trạng thái */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Trạng thái xử lý:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="answered">Đã trả lời hoàn tất</option>
              <option value="pending">Đang chờ phản hồi</option>
            </select>
          </div>

          {/* Filter 4: Hình thức gửi */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Hình thức gửi:</label>
            <select
              value={selectedAnonymity}
              onChange={(e) => setSelectedAnonymity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả (Ẩn danh + Công khai)</option>
              <option value="anonymous">100% Ẩn danh</option>
              <option value="public">Công khai họ tên</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUICK METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tổng câu hỏi</span>
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{total}</p>
          <p className="text-[11px] text-slate-400">Theo bộ lọc hiện tại</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Đã trả lời</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{answeredCount}</p>
          <p className="text-[11px] text-emerald-600/70 font-semibold">{responseRate}% đã hoàn thành</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Chờ phản hồi</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-amber-600/70 font-semibold">Đang được chuyển xử lý</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gửi Ẩn danh</span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{anonymousCount}</p>
          <p className="text-[11px] text-purple-600/70 font-semibold">
            {total > 0 ? Math.round((anonymousCount / total) * 100) : 0}% chọn bảo mật danh tính
          </p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Phân bố theo Chủ đề & Tiến độ giải đáp */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>PHÂN BỐ CÂU HỎI THEO CHỦ ĐỀ</span>
              </h4>
              <p className="text-xs text-slate-500">Tiến độ phản hồi của Thầy Cô theo từng lĩnh vực</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topicChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                  height={45}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  }}
                  itemStyle={{ color: '#FFF' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar dataKey="Đã trả lời" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Chờ phản hồi" stackId="a" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Tỉ lệ Trạng thái Giải đáp (Donut Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <span>TỈ LỆ TIẾN ĐỘ GIẢI ĐÁP CỦA BAN TƯ VẤN</span>
            </h4>
            <p className="text-xs text-slate-500">Tỉ lệ câu hỏi đã được giải đáp thỏa đáng</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {statusPieData.length === 0 ? (
              <p className="text-xs text-slate-400">Không có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 3: Phân bố theo Khối Lớp (Bar Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>MỨC ĐỘ QUAN TÂM THEO KHỐI LỚP</span>
            </h4>
            <p className="text-xs text-slate-500">Số lượng câu hỏi gửi về từ Khối 10, Khối 11 và Khối 12</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#FFF' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                <Bar dataKey="Đã trả lời" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chờ phản hồi" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Tỉ lệ Ẩn danh vs Hiện danh (Pie Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>TỈ LỆ BẢO MẬT & ẨN DANH CỦA HỌC SINH</span>
            </h4>
            <p className="text-xs text-slate-500">Thói quen lựa chọn tính năng ẩn danh khi chia sẻ tâm sự</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {anonymityPieData.length === 0 ? (
              <p className="text-xs text-slate-400">Không có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anonymityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {anonymityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
