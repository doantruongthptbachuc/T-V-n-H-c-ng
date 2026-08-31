import React, { useState, useMemo } from 'react';
import {
  Trees,
  Sun,
  Calendar,
  Sparkles,
  Award,
  Search,
  Filter,
  Users,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Flag,
  Flame,
  CheckCircle2,
  Trophy,
  Leaf,
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';
import { VolunteerMember, VolunteerAttendance } from '../types';
import { StudentAvatar } from './StudentAvatar';
import {
  getAcademicYearBoundaries,
  isDateInMainAcademicYear,
  isDateInSummerCampaign,
  computeMemberScoreForYear,
} from '../utils/academicYearUtils';

interface VolunteerActivityTreeProps {
  volunteerMembers: VolunteerMember[];
  volunteerAttendance: VolunteerAttendance[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: string[];
  onSelectMember?: (member: VolunteerMember) => void;
  onOpenCertificate?: (member: VolunteerMember) => void;
  isAdmin?: boolean;
}

export const VolunteerActivityTree: React.FC<VolunteerActivityTreeProps> = ({
  volunteerMembers,
  volunteerAttendance,
  selectedYear,
  onYearChange,
  availableYears,
  onSelectMember,
  onOpenCertificate,
  isAdmin = false,
}) => {
  // Chế độ cây: 'main' (5/9 - 31/5), 'summer' (1/6 - 31/8), 'all' (Cả năm)
  const [treePeriod, setTreePeriod] = useState<'main' | 'summer' | 'all'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({
    '12': true,
    '11': true,
    '10': true,
  });
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  const boundaries = useMemo(() => getAcademicYearBoundaries(selectedYear), [selectedYear]);

  // Lọc hoạt động điểm danh theo giai đoạn thời gian được chọn
  const periodFilteredAttendances = useMemo(() => {
    return volunteerAttendance.filter(a => {
      if (treePeriod === 'main') {
        return isDateInMainAcademicYear(a.date, selectedYear);
      } else if (treePeriod === 'summer') {
        return isDateInSummerCampaign(a.date, selectedYear);
      }
      return isDateInMainAcademicYear(a.date, selectedYear) || isDateInSummerCampaign(a.date, selectedYear);
    });
  }, [volunteerAttendance, selectedYear, treePeriod]);

  // Tính toán điểm số của các đoàn viên theo năm học và mùa được chọn
  const evaluatedMembers = useMemo(() => {
    return volunteerMembers.map(m => {
      const stats = computeMemberScoreForYear(m, volunteerAttendance, selectedYear, treePeriod);
      return {
        ...m,
        calculatedPoints: stats.totalPoints,
        mainPoints: stats.mainPoints,
        summerPoints: stats.summerPoints,
        honorRank: stats.honorRank,
        isEligible: stats.isEligibleForHonor,
      };
    });
  }, [volunteerMembers, volunteerAttendance, selectedYear, treePeriod]);

  // Nhóm đoàn viên theo Khối và Chi đoàn
  const treeData = useMemo(() => {
    const grades: Record<string, Record<string, typeof evaluatedMembers>> = {
      '12': {},
      '11': {},
      '10': {},
    };

    let totalPointsInTree = 0;
    let activeMembersCount = 0;

    evaluatedMembers.forEach(m => {
      const cls = (m.className || '').trim().toUpperCase();
      let grade = '10';
      if (cls.startsWith('12')) grade = '12';
      else if (cls.startsWith('11')) grade = '11';
      else if (cls.startsWith('10')) grade = '10';

      if (!grades[grade]) grades[grade] = {};
      if (!grades[grade][cls]) grades[grade][cls] = [];

      grades[grade][cls].push(m);

      if (m.calculatedPoints > 0) {
        totalPointsInTree += m.calculatedPoints;
        activeMembersCount++;
      }
    });

    return {
      grades,
      totalPointsInTree,
      activeMembersCount,
    };
  }, [evaluatedMembers]);

  const toggleGrade = (grade: string) => {
    setExpandedGrades(prev => ({ ...prev, [grade]: !prev[grade] }));
  };

  const toggleClass = (className: string) => {
    setExpandedClasses(prev => ({ ...prev, [className]: !prev[className] }));
  };

  const expandAll = () => {
    setExpandedGrades({ '12': true, '11': true, '10': true });
    const allClasses: Record<string, boolean> = {};
    Object.values(treeData.grades).forEach(classes => {
      Object.keys(classes).forEach(cls => {
        allClasses[cls] = true;
      });
    });
    setExpandedClasses(allClasses);
  };

  const collapseAll = () => {
    setExpandedGrades({ '12': false, '11': false, '10': false });
    setExpandedClasses({});
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Cây Tình Nguyện */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
              <Trees className="w-3.5 h-3.5" />
              <span>HỆ THỐNG CÂY HOẠT ĐỘNG ĐOÀN & PHONG TRÀO TÌNH NGUYỆN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span>CÂY HOẠT ĐỘNG HỌC ĐƯỜNG & CHIẾN DỊCH HÈ</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl font-medium leading-relaxed">
              Mô hình trực quan hóa các nhánh hoạt động phong trào Đoàn trường theo niên khóa. Tách bạch rõ ràng giữa{' '}
              <strong className="text-amber-300">Năm học chính khóa (05/09 – 31/05)</strong> và{' '}
              <strong className="text-orange-300">Chiến dịch tình nguyện hè (01/06 – 31/08)</strong>, đảm bảo tính điểm công bằng cho từng khóa học sinh mới.
            </p>
          </div>

          {/* Selector Năm học */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
              <span>Chọn Năm Học:</span>
              <span className="text-[11px] text-amber-300 font-mono">
                {treePeriod === 'main' ? boundaries.labelMain : treePeriod === 'summer' ? boundaries.labelSummer : `${boundaries.startYear} - ${boundaries.endYear}`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => onYearChange(year)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedYear === year
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                      : 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-100 border border-emerald-700/50'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Nút chuyển chế độ Cây (Chính khóa vs Hè vs Cả năm) */}
        <div className="relative z-10 mt-6 pt-6 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-800/60 shadow-inner">
            <button
              onClick={() => setTreePeriod('main')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 transition-all cursor-pointer ${
                treePeriod === 'main'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-200" />
              <span>🌸 Cây Năm Học Chính Khóa (05/09 – 31/05)</span>
            </button>

            <button
              onClick={() => setTreePeriod('summer')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 transition-all cursor-pointer ${
                treePeriod === 'summer'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-orange-950/50'
                  : 'text-amber-300 hover:text-white hover:bg-amber-950/60'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-300" />
              <span>☀️ Cây Hoạt Động Hè (01/06 – 31/08)</span>
            </button>

            <button
              onClick={() => setTreePeriod('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center space-x-2 transition-all cursor-pointer ${
                treePeriod === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>🌟 Toàn Niên Khóa (Cả Năm)</span>
            </button>
          </div>

          {/* Tóm tắt nhanh số liệu */}
          <div className="flex items-center space-x-4 text-xs font-bold text-emerald-200">
            <div className="flex items-center space-x-1.5 bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-700/40">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{evaluatedMembers.length} Đoàn viên</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-700/40 text-amber-300">
              <Award className="w-4 h-4" />
              <span>{periodFilteredAttendances.length} Lượt điểm danh trong kỳ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm đoàn viên trên cây theo tên hoặc lớp..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['all', '12', '11', '10'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  gradeFilter === g
                    ? 'bg-white text-emerald-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 'all' ? 'Tất cả khối' : `Khối ${g}`}
              </button>
            ))}
          </div>

          <button
            onClick={expandAll}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Mở rộng tất cả
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Thu gọn
          </button>
        </div>
      </div>

      {/* GỐC CÂY: BAN CHẤP HÀNH ĐOÀN TRƯỜNG THPT BA CHÚC */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-yellow-300 font-black shadow-inner">
            <Flag className="w-8 h-8 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-red-950 text-[10px] font-black uppercase tracking-wider">
                Gốc Cây Trung Tâm
              </span>
              <span className="text-xs text-red-100 font-bold">Năm học {selectedYear}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              BAN CHỈ ĐẠO PHONG TRÀO THANH NIÊN & TÌNH NGUYỆN HÈ
            </h3>
            <p className="text-xs text-red-100 mt-0.5">
              Trường THPT Ba Chúc • {treePeriod === 'summer' ? '☀️ Chiến dịch Hoa Phượng Đỏ & Tiếp Sức Mùa Thi' : '🌸 Năm học chính khóa & Ngày thứ Bảy tình nguyện'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 bg-black/20 p-3 rounded-2xl backdrop-blur-xs border border-white/10">
          <div className="text-center px-2">
            <p className="text-[10px] text-red-200 font-bold uppercase">Tổng đoàn viên</p>
            <p className="text-xl font-black text-white">{evaluatedMembers.length}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2">
            <p className="text-[10px] text-yellow-200 font-bold uppercase">Thủ lĩnh 🚩</p>
            <p className="text-xl font-black text-yellow-300">{evaluatedMembers.filter(m => m.isLeader).length}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2">
            <p className="text-[10px] text-emerald-200 font-bold uppercase">Vinh danh ⭐</p>
            <p className="text-xl font-black text-emerald-300">{evaluatedMembers.filter(m => m.isEligible).length}</p>
          </div>
        </div>
      </div>

      {/* 3 CÀNH LỚN: KHỐI 12, KHỐI 11, KHỐI 10 */}
      <div className="space-y-6">
        {(['12', '11', '10'] as const).map(grade => {
          if (gradeFilter !== 'all' && gradeFilter !== grade) return null;

          const classesInGrade = treeData.grades[grade] || {};
          const classNames = Object.keys(classesInGrade).sort();
          const totalInGrade = Object.values(classesInGrade).reduce((acc, list) => acc + list.length, 0);
          const isExpanded = expandedGrades[grade] !== false;

          const gradeColors = {
            '12': {
              border: 'border-rose-300',
              bg: 'bg-rose-50/60',
              badge: 'bg-rose-600 text-white',
              title: 'text-rose-900',
              iconColor: 'text-rose-600',
              desc: 'Cánh chim đầu đàn • Đội hình Xung kích tốt nghiệp & Tiếp sức mùa thi',
            },
            '11': {
              border: 'border-blue-300',
              bg: 'bg-blue-50/60',
              badge: 'bg-blue-600 text-white',
              title: 'text-blue-900',
              iconColor: 'text-blue-600',
              desc: 'Lực lượng nòng cốt • Phong trào Hoa phượng đỏ & Ngày Chủ nhật xanh',
            },
            '10': {
              border: 'border-emerald-300',
              bg: 'bg-emerald-50/60',
              badge: 'bg-emerald-600 text-white',
              title: 'text-emerald-900',
              iconColor: 'text-emerald-600',
              desc: 'Thế hệ kế thừa • Đoàn viên mới tham gia công tác Đoàn học đường',
            },
          }[grade];

          return (
            <div
              key={grade}
              className={`rounded-3xl border ${gradeColors.border} ${gradeColors.bg} p-5 sm:p-6 shadow-sm transition-all`}
            >
              {/* Tiêu đề Khối */}
              <div
                onClick={() => toggleGrade(grade)}
                className="flex items-center justify-between cursor-pointer select-none pb-4 border-b border-slate-200/80"
              >
                <div className="flex items-center space-x-3">
                  <button className="p-1.5 rounded-xl bg-white text-slate-700 shadow-xs border border-slate-200">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black ${gradeColors.badge}`}>
                    KHỐI {grade}
                  </span>
                  <div>
                    <h4 className={`text-lg sm:text-xl font-black ${gradeColors.title} flex items-center gap-2`}>
                      <span>CÀNH PHONG TRÀO KHỐI {grade}</span>
                      <span className="text-xs font-bold text-slate-500">
                        ({classNames.length} Chi đoàn • {totalInGrade} Đoàn viên)
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600">{gradeColors.desc}</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  <Leaf className={`w-4 h-4 ${gradeColors.iconColor}`} />
                  <span>{classNames.length} Nhánh Chi đoàn</span>
                </div>
              </div>

              {/* Danh sách các Nhánh Chi Đoàn trong Khối */}
              {isExpanded && (
                <div className="mt-5 space-y-4">
                  {classNames.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      Chưa có đoàn viên thuộc Khối {grade} trong năm học {selectedYear}.
                    </div>
                  ) : (
                    classNames.map(clsName => {
                      const membersInClass = classesInGrade[clsName] || [];
                      const filteredMembers = searchQuery.trim()
                        ? membersInClass.filter(
                            m =>
                              m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              m.className.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                        : membersInClass;

                      if (searchQuery.trim() && filteredMembers.length === 0) return null;

                      const isClassOpen = expandedClasses[clsName] !== false;
                      const leadersInClass = filteredMembers.filter(m => m.isLeader);
                      const honoredInClass = filteredMembers.filter(m => m.isEligible);

                      return (
                        <div
                          key={clsName}
                          className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                        >
                          {/* Thanh Header Chi đoàn */}
                          <div
                            onClick={() => toggleClass(clsName)}
                            className="p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200/60 select-none"
                          >
                            <div className="flex items-center space-x-3">
                              <button className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                                {isClassOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <div className="flex items-center space-x-2">
                                <span className="font-black text-sm text-slate-900 bg-slate-200/80 px-2.5 py-1 rounded-lg">
                                  🌿 Chi đoàn {clsName}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  ({filteredMembers.length} đoàn viên)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {leadersInClass.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200 flex items-center gap-1">
                                  🚩 {leadersInClass.length} Thủ lĩnh
                                </span>
                              )}
                              {honoredInClass.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                                  ⭐ {honoredInClass.length} Xuất sắc
                                </span>
                              )}
                            </div>
                          </div>

                          {/* LÁ / ĐOÀN VIÊN TRÊN CÀNH CHI ĐOÀN */}
                          {isClassOpen && (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-50/40">
                              {filteredMembers.map(member => (
                                <div
                                  key={member.id}
                                  className={`relative p-3.5 rounded-2xl border transition-all hover:shadow-md bg-white ${
                                    member.isLeader
                                      ? 'border-amber-300 shadow-amber-100/50 ring-1 ring-amber-300/60'
                                      : member.isEligible
                                      ? 'border-emerald-300 shadow-emerald-100/50'
                                      : 'border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    {/* Avatar chữ cái đồng bộ */}
                                    <StudentAvatar
                                      fullName={member.fullName}
                                      photoUrl={member.avatarUrl || member.honorPhoto}
                                      size="md"
                                      rounded="xl"
                                      badge={
                                        member.isLeader ? (
                                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                                            🚩
                                          </span>
                                        ) : member.isEligible ? (
                                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                                            ⭐
                                          </span>
                                        ) : undefined
                                      }
                                    />

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <h5 className="text-xs font-black text-slate-900 truncate">
                                          {member.fullName}
                                        </h5>
                                      </div>
                                      <p className="text-[11px] text-slate-500 font-medium">
                                        {member.className} • Mã: {member.code || 'ĐV'}
                                      </p>

                                      {/* Điểm hoạt động trong kỳ */}
                                      <div className="mt-2 flex items-center justify-between">
                                        <span
                                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${
                                            treePeriod === 'summer'
                                              ? 'bg-orange-100 text-orange-800'
                                              : 'bg-emerald-100 text-emerald-800'
                                          }`}
                                        >
                                          {treePeriod === 'summer' ? '☀️ Hè:' : '🌸 Năm học:'}{' '}
                                          <strong className="font-extrabold text-xs">
                                            {member.calculatedPoints} lần
                                          </strong>
                                        </span>

                                        {onOpenCertificate && (
                                          <button
                                            onClick={() => onOpenCertificate(member)}
                                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                                            title="Xem kỷ yếu / chứng nhận vinh danh"
                                          >
                                            <Award className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>

                                      {member.isLeader && (
                                        <div className="mt-1.5 text-[10px] font-bold text-amber-700 truncate bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                          🚩 {member.leaderRole || 'Thủ lĩnh Chi đoàn'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
