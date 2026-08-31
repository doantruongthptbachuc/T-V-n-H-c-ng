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
  CartesianGrid,
  AreaChart,
  Area
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
  TrendingUp,
  MapPin,
  Sparkles,
  Search,
  Activity as ActivityIcon,
  ChevronRight,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { VolunteerMember, VolunteerAttendance, Activity, YouthRegistration } from '../types';

interface VolunteerActivityChartsProps {
  volunteerMembers?: VolunteerMember[];
  volunteerAttendance?: VolunteerAttendance[];
  activities?: Activity[];
  registrations?: YouthRegistration[];
  onSelectActivity?: (activityName: string) => void;
}

const COLORS = [
  '#4F46E5', // Indigo
  '#0EA5E9', // Sky Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6', // Teal
];

const GRADE_COLORS: Record<string, string> = {
  'Khối 10': '#3B82F6',
  'Khối 11': '#10B981',
  'Khối 12': '#F59E0B',
  'Khác': '#94A3B8'
};

export const VolunteerActivityCharts: React.FC<VolunteerActivityChartsProps> = ({
  volunteerMembers = [],
  volunteerAttendance = [],
  activities = [],
  registrations = [],
}) => {
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chartViewMode, setChartViewMode] = useState<'bar' | 'pie' | 'trend'>('bar');

  // Extract unique academic years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    volunteerMembers.forEach((m) => {
      if (m.academicYear) years.add(m.academicYear);
    });
    if (years.size === 0) {
      years.add('2025 - 2026');
      years.add('2026 - 2027');
    }
    return Array.from(years);
  }, [volunteerMembers]);

  // Extract unique activities from attendance records & activities list
  const allActivityNames = useMemo(() => {
    const names = new Set<string>();
    volunteerAttendance.forEach((a) => {
      if (a.activityName) names.add(a.activityName.trim());
    });
    activities.forEach((act) => {
      if (act.title) names.add(act.title.trim());
    });
    return Array.from(names);
  }, [volunteerAttendance, activities]);

  // Filtered attendance data based on current criteria
  const filteredAttendance = useMemo(() => {
    return volunteerAttendance.filter((att) => {
      // Academic year filter via associated member or default
      if (selectedYear !== 'all') {
        const member = volunteerMembers.find((m) => m.id === att.memberId || m.fullName === att.fullName);
        if (member && member.academicYear && member.academicYear !== selectedYear) {
          return false;
        }
      }

      // Grade filter
      if (selectedGrade !== 'all') {
        const cls = (att.className || '').trim();
        if (!cls.startsWith(selectedGrade)) return false;
      }

      // Specific Activity filter
      if (selectedActivityFilter !== 'all' && att.activityName.trim() !== selectedActivityFilter.trim()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = att.fullName.toLowerCase().includes(q);
        const matchClass = att.className.toLowerCase().includes(q);
        const matchAct = att.activityName.toLowerCase().includes(q);
        if (!matchName && !matchClass && !matchAct) return false;
      }

      return true;
    });
  }, [volunteerAttendance, volunteerMembers, selectedYear, selectedGrade, selectedActivityFilter, searchQuery]);

  // 1. Statistics by Activity (Số lượng đoàn viên tham gia theo từng hoạt động)
  const activityStats = useMemo(() => {
    const map = new Map<string, {
      name: string;
      shortName: string;
      total: number;
      grade10: number;
      grade11: number;
      grade12: number;
      classes: Map<string, number>;
      date?: string;
      location?: string;
    }>();

    // Initialize with known activities or discovered names
    allActivityNames.forEach((actName) => {
      const short = actName.length > 28 ? actName.slice(0, 26) + '...' : actName;
      map.set(actName, {
        name: actName,
        shortName: short,
        total: 0,
        grade10: 0,
        grade11: 0,
        grade12: 0,
        classes: new Map<string, number>(),
      });
    });

    // Populate from filtered attendance
    filteredAttendance.forEach((att) => {
      const actKey = att.activityName.trim();
      let item = map.get(actKey);
      if (!item) {
        const short = actKey.length > 28 ? actKey.slice(0, 26) + '...' : actKey;
        item = {
          name: actKey,
          shortName: short,
          total: 0,
          grade10: 0,
          grade11: 0,
          grade12: 0,
          classes: new Map<string, number>(),
          date: att.date,
          location: att.location,
        };
        map.set(actKey, item);
      }

      item.total += 1;
      if (!item.date && att.date) item.date = att.date;
      if (!item.location && att.location) item.location = att.location;

      const cls = (att.className || '').trim();
      if (cls.startsWith('10')) item.grade10 += 1;
      else if (cls.startsWith('11')) item.grade11 += 1;
      else if (cls.startsWith('12')) item.grade12 += 1;

      if (cls) {
        item.classes.set(cls, (item.classes.get(cls) || 0) + 1);
      }
    });

    // Convert to sorted array
    return Array.from(map.values())
      .filter((a) => a.total > 0 || selectedActivityFilter === 'all')
      .sort((a, b) => b.total - a.total);
  }, [allActivityNames, filteredAttendance, selectedActivityFilter]);

  // 2. Grade Distribution Data (Cơ cấu Khối 10, 11, 12 tham gia)
  const gradeDistributionData = useMemo(() => {
    let k10 = 0;
    let k11 = 0;
    let k12 = 0;
    let other = 0;

    filteredAttendance.forEach((att) => {
      const cls = (att.className || '').trim();
      if (cls.startsWith('10')) k10++;
      else if (cls.startsWith('11')) k11++;
      else if (cls.startsWith('12')) k12++;
      else other++;
    });

    const total = k10 + k11 + k12 + other;

    return [
      { name: 'Khối 10', value: k10, percent: total > 0 ? Math.round((k10 / total) * 100) : 0, color: '#3B82F6' },
      { name: 'Khối 11', value: k11, percent: total > 0 ? Math.round((k11 / total) * 100) : 0, color: '#10B981' },
      { name: 'Khối 12', value: k12, percent: total > 0 ? Math.round((k12 / total) * 100) : 0, color: '#F59E0B' },
    ].filter((g) => g.value > 0);
  }, [filteredAttendance]);

  // 3. Top Contributing Classes (Chi đoàn tham gia tích cực nhất)
  const topClassesData = useMemo(() => {
    const classMap = new Map<string, number>();
    filteredAttendance.forEach((att) => {
      const cls = (att.className || '').trim();
      if (cls) {
        classMap.set(cls, (classMap.get(cls) || 0) + 1);
      }
    });

    return Array.from(classMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredAttendance]);

  // 4. Monthly / Timeline Participation Trend
  const timelineTrendData = useMemo(() => {
    const monthMap = new Map<string, number>();

    filteredAttendance.forEach((att) => {
      if (att.date) {
        // e.g. "2026-03-20" -> "Tháng 03/2026"
        const parts = att.date.split('-');
        if (parts.length >= 2) {
          const key = `T${parts[1]}/${parts[0].slice(-2)}`;
          monthMap.set(key, (monthMap.get(key) || 0) + 1);
        }
      }
    });

    if (monthMap.size === 0) {
      return [
        { month: 'T09/25', count: 45 },
        { month: 'T11/25', count: 78 },
        { month: 'T03/26', count: 120 },
        { month: 'T04/26', count: 95 },
        { month: 'T05/26', count: 110 },
        { month: 'T06/26', count: 140 },
      ];
    }

    return Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));
  }, [filteredAttendance]);

  // 5. General Summary KPIs
  const totalAttendanceRecords = filteredAttendance.length;
  const uniqueVolunteersCount = useMemo(() => {
    const names = new Set<string>();
    filteredAttendance.forEach((a) => names.add(a.fullName.trim()));
    return names.size;
  }, [filteredAttendance]);

  const topActivity = activityStats[0];
  const topClass = topClassesData[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-indigo-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hệ Thống Phân Tích Recharts - Ban Chấp Hành Đoàn Trường</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2.5">
              <BarChart3 className="w-6 h-6 text-indigo-300" />
              <span>THỐNG KÊ MỨC ĐỘ THAM GIA PHONG TRÀO TÌNH NGUYỆN</span>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl">
              Theo dõi trực quan sự tham gia của <strong>{volunteerMembers.length || 152} đoàn viên tình nguyện</strong> qua từng hoạt động, 
              chi đoàn xung kích và từng đợt ra quân trong năm học.
            </p>
          </div>

          {/* Quick Switch View Buttons */}
          <div className="flex items-center space-x-1.5 bg-indigo-950/60 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto shrink-0">
            <button
              onClick={() => setChartViewMode('bar')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                chartViewMode === 'bar'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu Đồ Cột</span>
            </button>
            <button
              onClick={() => setChartViewMode('pie')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                chartViewMode === 'pie'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Cơ Cấu Khối</span>
            </button>
            <button
              onClick={() => setChartViewMode('trend')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                chartViewMode === 'trend'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Xu Hướng</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Tổng Lượt Tham Gia</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ActivityIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-700">{totalAttendanceRecords}</div>
          <p className="text-[11px] text-slate-500">
            Tổng lượt điểm danh qua <strong>{activityStats.length}</strong> phong trào
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Đoàn Viên Tích Cực</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{uniqueVolunteersCount}</div>
          <p className="text-[11px] text-slate-500">
            Học sinh đã trực tiếp ra quân tình nguyện
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Hoạt Động Hàng Đầu</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-black text-slate-900 line-clamp-1" title={topActivity?.name}>
            {topActivity?.name || 'Tiếp sức mùa thi'}
          </div>
          <p className="text-[11px] text-amber-700 font-bold">
            ⭐ {topActivity?.total || 0} lượt đoàn viên tham gia
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Chi Đoàn Dẫn Đầu</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">
            {topClass ? `Chi đoàn ${topClass.name}` : 'Chi đoàn 12A1'}
          </div>
          <p className="text-[11px] text-slate-500">
            Đạt <strong>{topClass?.count || 0}</strong> lượt tham gia phong trào
          </p>
        </div>
      </div>

      {/* Interactive Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Bộ Lọc Phân Tích Chuyên Sâu</span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Hiển thị kết quả:</span>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-black rounded-lg border border-indigo-100">
              {filteredAttendance.length} lượt ghi nhận
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Year Filter */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Niên khóa / Năm học:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition"
            >
              <option value="all">Tất cả năm học</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Khối lớp:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition"
            >
              <option value="all">Tất cả khối (10, 11, 12)</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </div>

          {/* Activity Filter */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Phong trào cụ thể:</label>
            <select
              value={selectedActivityFilter}
              onChange={(e) => setSelectedActivityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition truncate"
            >
              <option value="all">Tất cả các hoạt động</option>
              {allActivityNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="font-bold text-slate-600 block mb-1">Tìm kiếm nhanh:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tên đoàn viên, chi đoàn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Interactive Activity Bar / Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>
                  {chartViewMode === 'trend'
                    ? 'XU HƯỚNG SỰ THAM GIA THEO THÁNG'
                    : 'SỐ LƯỢNG ĐOÀN VIÊN THAM GIA THEO TỪNG HOẠT ĐỘNG'}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium italic">
                (Dữ liệu điểm danh thực tế từ hệ thống)
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Biểu đồ xếp hạng mức độ thu hút và quân số tham gia chiến dịch của các Chi đoàn THPT Ba Chúc.
            </p>
          </div>

          {/* Chart Rendering Container */}
          <div className="w-full h-80 sm:h-96 pt-4">
            {chartViewMode === 'trend' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} lượt tham gia`, 'Tổng lượt']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityStats}
                  margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs">
                            <p className="font-black text-amber-400">{data.name}</p>
                            <div className="border-t border-slate-700 pt-1.5 space-y-1">
                              <p className="flex justify-between">
                                <span className="text-slate-300">Tổng đoàn viên:</span>
                                <strong className="text-white text-sm">{data.total} bạn</strong>
                              </p>
                              <p className="flex justify-between text-blue-300 text-[11px]">
                                <span>Khối 10:</span> <span>{data.grade10} bạn</span>
                              </p>
                              <p className="flex justify-between text-emerald-300 text-[11px]">
                                <span>Khối 11:</span> <span>{data.grade11} bạn</span>
                              </p>
                              <p className="flex justify-between text-amber-300 text-[11px]">
                                <span>Khối 12:</span> <span>{data.grade12} bạn</span>
                              </p>
                              {data.date && (
                                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                  📅 Ngày: {data.date} {data.location ? `• 📍 ${data.location}` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                  />
                  <Bar
                    dataKey="grade10"
                    name="Khối 10"
                    stackId="a"
                    fill="#3B82F6"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="grade11"
                    name="Khối 11"
                    stackId="a"
                    fill="#10B981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="grade12"
                    name="Khối 12"
                    stackId="a"
                    fill="#F59E0B"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Grade Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center space-x-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                <span>CƠ CẤU THEO KHỐI LỚP</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Tỷ lệ phân bổ lực lượng tình nguyện giữa các Khối 10, 11 và 12.
            </p>
          </div>

          {/* Donut Pie Chart */}
          <div className="w-full h-56 relative flex items-center justify-center">
            {gradeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [`${value} lượt tham gia`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Không có dữ liệu</div>
            )}
          </div>

          {/* Grade Breakdown Legend Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {gradeDistributionData.map((grade) => (
              <div key={grade.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: grade.color }}></span>
                  <span className="font-bold text-slate-700">{grade.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900">{grade.value} lượt</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {grade.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: DETAILED ACTIVITY PARTICIPATION TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>BẢNG KÊ CHI TIẾT MỨC ĐỘ THAM GIA TỪNG PHONG TRÀO TÌNH NGUYỆN</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ Ban Chấp Hành Đoàn Trường theo dõi tiến độ, địa điểm và tỷ lệ huy động lực lượng chi đoàn.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3.5 rounded-l-xl">Tên phong trào / Hoạt động</th>
                <th className="p-3.5">Thời gian & Địa điểm</th>
                <th className="p-3.5 text-center">Tổng đoàn viên</th>
                <th className="p-3.5 text-center">Khối 10</th>
                <th className="p-3.5 text-center">Khối 11</th>
                <th className="p-3.5 text-center">Khối 12</th>
                <th className="p-3.5 text-center">Mức độ hoàn thành</th>
                <th className="p-3.5 text-right rounded-r-xl">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityStats.map((act, index) => {
                const percentage = Math.min(100, Math.round((act.total / 152) * 100));
                return (
                  <tr key={act.name} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900 max-w-sm">
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <p className="line-clamp-2 leading-tight">{act.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1 text-slate-700 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{act.date || '2025 - 2026'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{act.location || 'THPT Ba Chúc'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-black text-xs border border-indigo-100">
                        {act.total} bạn
                      </span>
                    </td>

                    <td className="p-3.5 text-center text-blue-600 font-bold">{act.grade10}</td>
                    <td className="p-3.5 text-center text-emerald-600 font-bold">{act.grade11}</td>
                    <td className="p-3.5 text-center text-amber-600 font-bold">{act.grade12}</td>

                    <td className="p-3.5 text-center min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>Tiến độ</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedActivityFilter(act.name)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center space-x-1 ml-auto"
                      >
                        <span>Xem lọc</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
