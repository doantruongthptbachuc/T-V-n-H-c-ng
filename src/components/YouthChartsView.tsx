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
  Users,
  Flag,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Star
} from 'lucide-react';
import { VolunteerMember, YouthRegistration, VolunteerAttendance } from '../types';

interface YouthChartsViewProps {
  volunteerMembers: VolunteerMember[];
  registrations: YouthRegistration[];
  attendance?: VolunteerAttendance[];
  onSelectGradeFilter?: (grade: string) => void;
}

export const YouthChartsView: React.FC<YouthChartsViewProps> = ({
  volunteerMembers,
  registrations,
  attendance = [],
}) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Unified combined member dataset for analysis
  const combinedMembers = useMemo(() => {
    // 1. Volunteer members (Official)
    const official = volunteerMembers.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      className: m.className,
      academicYear: m.academicYear || '2026 - 2027',
      isLeader: !!m.isLeader,
      leaderRole: m.leaderRole || (m.isLeader ? 'Thủ lĩnh / Đội trưởng' : 'Đoàn viên'),
      status: m.isHonored ? 'honored' : (m.status || 'active'),
      activitiesCount: m.activitiesCount ?? 0,
      source: 'volunteer_member',
    }));

    // 2. Registrations (Pending or Approved)
    const regList = registrations.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      className: r.className,
      academicYear: r.academicYear || '2026 - 2027',
      isLeader: !!r.isLeader,
      leaderRole: r.leaderRole || (r.isLeader ? 'Bí thư Chi đoàn' : 'Đoàn viên'),
      status: r.status || 'pending',
      activitiesCount: 0,
      source: 'registration',
    }));

    return [...official, ...regList];
  }, [volunteerMembers, registrations]);

  // Extract unique academic years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    combinedMembers.forEach((m) => {
      if (m.academicYear) years.add(m.academicYear);
    });
    return Array.from(years);
  }, [combinedMembers]);

  // Filtered dataset based on current filter selections
  const filteredData = useMemo(() => {
    return combinedMembers.filter((m) => {
      // Academic year filter
      if (selectedYear !== 'all' && m.academicYear !== selectedYear) return false;

      // Grade filter
      if (selectedGrade !== 'all') {
        const cls = (m.className || '').trim();
        if (!cls.startsWith(selectedGrade)) return false;
      }

      // Role filter
      if (selectedRole === 'leader' && !m.isLeader) return false;
      if (selectedRole === 'member' && m.isLeader) return false;

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active' && m.status !== 'active') return false;
        if (selectedStatus === 'accepted' && (m.status !== 'accepted' && m.status !== 'approved' && m.status !== 'assigned')) return false;
        if (selectedStatus === 'pending' && m.status !== 'pending') return false;
        if (selectedStatus === 'honored' && m.status !== 'honored') return false;
      }

      return true;
    });
  }, [combinedMembers, selectedYear, selectedGrade, selectedRole, selectedStatus]);

  // Metrics
  const totalCount = filteredData.length;
  const leaderCount = filteredData.filter((m) => m.isLeader).length;
  const officialActiveCount = filteredData.filter((m) => m.status === 'active' || m.status === 'honored').length;
  const approvedNewCount = filteredData.filter((m) => m.status === 'accepted' || m.status === 'approved' || m.status === 'assigned').length;
  const pendingCount = filteredData.filter((m) => m.status === 'pending').length;

  // Chart 1: Grade Breakdown (Khối 10, Khối 11, Khối 12)
  const gradeChartData = useMemo(() => {
    const grades = [
      { name: 'Khối 10', prefix: '10' },
      { name: 'Khối 11', prefix: '11' },
      { name: 'Khối 12', prefix: '12' },
    ];

    return grades.map((g) => {
      const inGrade = filteredData.filter((m) => (m.className || '').startsWith(g.prefix));
      const leaders = inGrade.filter((m) => m.isLeader).length;
      const members = inGrade.length - leaders;
      return {
        name: g.name,
        'Thủ lĩnh / Ban Cán sự': leaders,
        'Đoàn viên & Tình nguyện viên': members,
        total: inGrade.length,
      };
    });
  }, [filteredData]);

  // Chart 2: Status Breakdown (Pie/Donut)
  const statusPieData = useMemo(() => {
    const active = filteredData.filter((m) => m.status === 'active').length;
    const accepted = filteredData.filter((m) => m.status === 'accepted' || m.status === 'approved' || m.status === 'assigned').length;
    const pending = filteredData.filter((m) => m.status === 'pending').length;
    const honored = filteredData.filter((m) => m.status === 'honored').length;

    return [
      { name: 'Đoàn viên chính thức', value: active, color: '#2563EB' },
      { name: 'Đã duyệt gia nhập', value: accepted, color: '#10B981' },
      { name: 'Chờ xét duyệt kết nạp', value: pending, color: '#F59E0B' },
      { name: 'Gương mặt vinh danh', value: honored, color: '#EC4899' },
    ].filter((d) => d.value > 0);
  }, [filteredData]);

  // Chart 3: Activity participation breakdown (Cột mức độ năng nổ)
  const activityFrequencyData = useMemo(() => {
    const high = filteredData.filter((m) => m.activitiesCount >= 5).length;
    const medium = filteredData.filter((m) => m.activitiesCount >= 3 && m.activitiesCount < 5).length;
    const basic = filteredData.filter((m) => m.activitiesCount < 3).length;

    return [
      { name: 'Khởi đầu (1 - 2 buổi)', 'Số lượng đoàn viên': basic, fill: '#60A5FA' },
      { name: 'Thường xuyên (3 - 4 buổi)', 'Số lượng đoàn viên': medium, fill: '#3B82F6' },
      { name: 'Xuất sắc (≥ 5 buổi)', 'Số lượng đoàn viên': high, fill: '#1D4ED8' },
    ];
  }, [filteredData]);

  // Chart 4: Top Class Breakdown
  const topClassesData = useMemo(() => {
    const classMap: Record<string, number> = {};
    filteredData.forEach((m) => {
      const cls = (m.className || '').trim().toUpperCase();
      if (cls) {
        classMap[cls] = (classMap[cls] || 0) + 1;
      }
    });

    return Object.entries(classMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredData]);

  const handleResetFilters = () => {
    setSelectedYear('all');
    setSelectedGrade('all');
    setSelectedRole('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters =
    selectedYear !== 'all' ||
    selectedGrade !== 'all' ||
    selectedRole !== 'all' ||
    selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-red-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-bold rounded-full">
              <Flag className="w-3.5 h-3.5 text-yellow-300" />
              <span>DỮ LIỆU ĐOÀN VIÊN & PHONG TRÀO THANH NIÊN</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              BIỂU ĐỒ & THỐNG KÊ ĐOÀN VIÊN TÌNH NGUYỆN
            </h3>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl leading-relaxed">
              Thống kê tổng hợp số lượng đoàn viên, thủ lĩnh chi đoàn, tiến độ xét duyệt kết nạp và tần suất tham gia phong trào tình nguyện qua các năm học.
            </p>
          </div>

          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-200">Tổng lực lượng</p>
            <p className="text-3xl font-black text-yellow-300">{totalCount}</p>
            <p className="text-[10px] text-rose-200/80">Đoàn viên & Đăng ký</p>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-red-600" />
            <span>BỘ LỌC ĐOÀN VIÊN & PHONG TRÀO</span>
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
          {/* Filter 1: Năm học */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Năm học:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tất cả năm học</option>
              <option value="2026 - 2027">Năm học 2026 - 2027</option>
              <option value="2025 - 2026">Năm học 2025 - 2026</option>
              <option value="2024 - 2025">Năm học 2024 - 2025</option>
              {availableYears
                .filter((y) => !['2026 - 2027', '2025 - 2026', '2024 - 2025'].includes(y))
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter 2: Khối lớp */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Khối lớp:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>

          {/* Filter 3: Vai trò */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Vai trò / Chức vụ:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tất cả vai trò ({totalCount})</option>
              <option value="leader">Thủ lĩnh / Bí thư / Đội trưởng ({leaderCount})</option>
              <option value="member">Đoàn viên thường ({totalCount - leaderCount})</option>
            </select>
          </div>

          {/* Filter 4: Trạng thái */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Trạng thái hồ sơ:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang sinh hoạt chính thức ({officialActiveCount})</option>
              <option value="accepted">Đã duyệt gia nhập ({approvedNewCount})</option>
              <option value="pending">Chờ xét duyệt ({pendingCount})</option>
              <option value="honored">Gương mặt vinh danh</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUICK METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Đang sinh hoạt</span>
            <Users className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600">{officialActiveCount}</p>
          <p className="text-[11px] text-slate-400">Đoàn viên & Đội tình nguyện</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Đã duyệt gia nhập</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{approvedNewCount}</p>
          <p className="text-[11px] text-emerald-600/70 font-semibold">Được xét duyệt tham gia</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Thủ lĩnh & Bí thư</span>
            <Flag className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{leaderCount}</p>
          <p className="text-[11px] text-amber-600/70 font-semibold">Gương mặt nòng cốt</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Lượt điểm danh</span>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600">{attendance.length}</p>
          <p className="text-[11px] text-indigo-600/70 font-semibold">Hoạt động tình nguyện</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Phân bố theo Khối lớp (Khối 10, 11, 12) & Vai trò */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-red-600" />
              <span>PHÂN BỐ ĐOÀN VIÊN THEO KHỐI LỚP</span>
            </h4>
            <p className="text-xs text-slate-500">Cơ cấu Thủ lĩnh vs Đoàn viên tham gia theo Khối 10, 11, 12</p>
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
                <Bar dataKey="Thủ lĩnh / Ban Cán sự" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Đoàn viên & Tình nguyện viên" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Cơ cấu trạng thái hồ sơ Đoàn (Donut Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-indigo-600" />
              <span>CƠ CẤU TRẠNG THÁI HỒ SƠ ĐOÀN VIÊN</span>
            </h4>
            <p className="text-xs text-slate-500">Tỉ lệ chính thức, đã duyệt kết nạp và chờ xét duyệt</p>
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

        {/* CHART 3: Tần suất tham gia hoạt động tình nguyện */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>TẦN SUẤT THAM GIA PHONG TRÀO TÌNH NGUYỆN</span>
            </h4>
            <p className="text-xs text-slate-500">Phân loại theo mức độ tích cực tham gia các buổi tình nguyện</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityFrequencyData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
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
                <Bar dataKey="Số lượng đoàn viên" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Top Lớp / Chi đoàn tích cực nhất */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm sm:text-base flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>TOP CHI ĐOÀN CÓ LỰC LƯỢNG ĐÔNG ĐẢO NHẤT</span>
            </h4>
            <p className="text-xs text-slate-500">Các tập thể lớp tích cực tham gia công tác Đoàn & Tình nguyện</p>
          </div>

          <div className="h-72 w-full pt-2">
            {topClassesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Không có dữ liệu lớp
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topClassesData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }} width={60} />
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
                  <Bar dataKey="count" name="Số lượng đoàn viên" fill="#EC4899" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
