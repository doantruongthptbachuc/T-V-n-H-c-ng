import React, { useState, useMemo } from 'react';
import { 
  Flag, 
  Send, 
  CheckCircle, 
  Sparkles, 
  Users, 
  HeartHandshake, 
  Award, 
  Flame, 
  Music, 
  Trophy, 
  Camera, 
  ShieldCheck, 
  ChevronRight,
  Phone,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  Upload,
  UserCheck,
  UserX,
  GraduationCap,
  TrendingDown,
  Plus,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  Star,
  MapPin,
  Heart,
  FileText,
  UserPlus,
  Shield,
  BadgeCheck,
  X,
  Save,
  Check,
  Download,
  FileSpreadsheet,
  BarChart3,
  Crown,
  Database,
  HardDrive,
  RefreshCw,
  Table,
  LayoutGrid,
  Cpu,
  Trees,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { YouthRegistration, VolunteerMember, VolunteerAttendance, VolunteerStatus, SchoolConfig } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { exportVolunteersCSV, exportAttendanceCSV, normalizeStudentName, normalizeStudentClass, exportHonoredStudentsCSV, exportVolunteerMemoryJSON } from '../utils/storage';
import { moderateText, validateImageFile } from '../lib/contentModeration';
import { YouthChartsView } from './YouthChartsView';
import { HonorMemoryCertificateModal } from './HonorMemoryCertificateModal';
import { MemoryManagementModal } from './MemoryManagementModal';
import { StudentAvatar } from './StudentAvatar';
import { VolunteerActivityTree } from './VolunteerActivityTree';
import { AcademicYearManagerModal } from './AcademicYearManagerModal';
import {
  getSavedAcademicYears,
  saveAcademicYearsList,
  getCurrentActiveYear,
  setCurrentActiveYear,
  computeMemberScoreForYear,
  getAcademicYearBoundaries,
} from '../utils/academicYearUtils';

interface YouthUnionSectionProps {
  registrations: YouthRegistration[];
  volunteerMembers: VolunteerMember[];
  volunteerAttendance: VolunteerAttendance[];
  onAddRegistration: (reg: Omit<YouthRegistration, 'id' | 'code' | 'createdAt' | 'status'>) => void;
  onUpdateRegistration?: (id: string, updates: Partial<YouthRegistration>) => void;
  onDeleteRegistration?: (id: string) => void;
  onAddVolunteerMember?: (member: Omit<VolunteerMember, 'id'>) => void;
  onUpdateVolunteerMember?: (id: string, updates: Partial<VolunteerMember>) => void;
  onUpdateVolunteerMembersBulk?: (members: VolunteerMember[]) => void;
  onDeleteVolunteerMember?: (id: string, reason?: string) => void;
  onAddAttendance?: (att: Omit<VolunteerAttendance, 'id' | 'createdAt'>) => void;
  onHonorMember?: (id: string, title: string, photo?: string) => void;
  isAdminLoggedIn?: boolean;
  config: SchoolConfig;
}

const ACTIVITIES_LIST = [
  { id: 'Công tác Đoàn', label: 'Công tác Đoàn & Ban Cán sự', icon: Flag, desc: 'Tổ chức phong trào, quản trị chi đoàn, thi đua nề nếp' },
  { id: 'Tình nguyện', label: 'Tình nguyện Thanh Niên', icon: HeartHandshake, desc: 'Tiếp sức mùa thi, gom ve chai gây quỹ, bảo vệ môi trường' },
  { id: 'Hoa Phượng Đỏ', label: 'Chiến dịch Hoa Phượng Đỏ', icon: Flame, desc: 'Chiến dịch tình nguyện hè trọng điểm của đoàn viên THPT' },
  { id: 'Văn nghệ', label: 'Đội Văn Nghệ Xung Kích', icon: Music, desc: 'Hát, nhảy hiện đại, múa dân gian, kịch nghệ học đường' },
  { id: 'Thể thao', label: 'Đội Thể Dục Thể Thao', icon: Trophy, desc: 'Bóng đá, bóng rổ, cầu lông, cờ vua, kéo co' },
  { id: 'Truyền thông', label: 'Ban Truyền Thông & Sự Kiện', icon: Camera, desc: 'Chụp ảnh, quay video ngắn TikTok, viết bài, thiết kế poster' },
  { id: 'Hoạt động xã hội', label: 'Hoạt Động Xã Hội & Cộng Đồng', icon: Users, desc: 'Thăm viện dưỡng lão, trung tâm bảo trợ trẻ em' },
  { id: 'Câu lạc bộ', label: 'Các Câu Lạc Bộ Kỹ Năng', icon: Layers, desc: 'CLB Tiếng Anh, CLB Sách & Tranh biện, CLB Nhiếp ảnh...' },
];

export const YouthUnionSection: React.FC<YouthUnionSectionProps> = ({
  registrations,
  volunteerMembers,
  volunteerAttendance,
  onAddRegistration,
  onUpdateRegistration,
  onDeleteRegistration,
  onAddVolunteerMember,
  onUpdateVolunteerMember,
  onUpdateVolunteerMembersBulk,
  onDeleteVolunteerMember,
  onAddAttendance,
  onHonorMember,
  isAdminLoggedIn = false,
  config,
}) => {
  // Main Subtabs
  const [activeTab, setActiveTab] = useState<'register' | 'registrations_list' | 'volunteers_list' | 'tree' | 'honors' | 'attendance' | 'lookup' | 'charts'>('register');

  // Academic Years Dynamic Management
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>(() => getSavedAcademicYears());
  const [currentSchoolYear, setCurrentSchoolYear] = useState<string>(() => getCurrentActiveYear());
  const [isYearManagerModalOpen, setIsYearManagerModalOpen] = useState(false);

  const handleSaveYearsList = (years: string[]) => {
    setAvailableAcademicYears(years);
    saveAcademicYearsList(years);
  };

  const handleSetActiveYear = (year: string) => {
    setCurrentSchoolYear(year);
    setCurrentActiveYear(year);
    setAcademicYear(year);
  };

  const handleInitializeNewYear = (newYear: string) => {
    handleSetActiveYear(newYear);
    setHonorYearFilter(newYear);
    setVolYearFilter(newYear);
  };

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState(currentSchoolYear);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [isCompressingRegAvatar, setIsCompressingRegAvatar] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['Công tác Đoàn', 'Tình nguyện']);
  const [skills, setSkills] = useState('');
  const [desires, setDesires] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'pending' | 'accepted';
    message: string;
    studentName?: string;
  } | null>(null);

  // Filter states for "Danh sách Đoàn viên đăng ký"
  const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [regYearFilter, setRegYearFilter] = useState<string>('all');
  const [regGradeFilter, setRegGradeFilter] = useState<string>('all');
  const [regClassFilter, setRegClassFilter] = useState<string>('all');
  const [regSearch, setRegSearch] = useState('');

  // Filter states for "Danh sách Đoàn thanh niên tình nguyện"
  const [volYearFilter, setVolYearFilter] = useState<string>('all');
  const [volGradeFilter, setVolGradeFilter] = useState<string>('all');
  const [volClassFilter, setVolClassFilter] = useState<string>('all');
  const [volStatusFilter, setVolStatusFilter] = useState<'all' | 'active' | 'leader' | 'honored' | 'graduated_12' | 'inactive_rules_violation' | 'inactive_low_performance'>('all');
  const [volSearch, setVolSearch] = useState('');

  // Lookup State
  const [lookupKeyword, setLookupKeyword] = useState('');
  const [lookupResult, setLookupResult] = useState<YouthRegistration | VolunteerMember | null | 'not_found'>(null);

  // Attendance Form & Leaderboard State
  const [attFullName, setAttFullName] = useState('');
  const [attClassName, setAttClassName] = useState('');
  const [attActivityName, setAttActivityName] = useState('Chủ nhật Xanh - Vệ sinh Nghĩa trang Liệt sĩ Ba Chúc');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attLocation, setAttLocation] = useState('Khuôn viên Trường THPT Ba Chúc');
  const [attSavedToast, setAttSavedToast] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Honor modal state
  const [selectedHonorMember, setSelectedHonorMember] = useState<VolunteerMember | null>(null);
  const [honorStudentName, setHonorStudentName] = useState('');
  const [honorStudentClass, setHonorStudentClass] = useState('');
  const [honorStudentCount, setHonorStudentCount] = useState(5);
  const [honorTitleText, setHonorTitleText] = useState('Vinh Danh Học Sinh Tích Cực Trong Phong Trào Tình Nguyện');
  const [honorDateText, setHonorDateText] = useState('');
  const [honorPhotoUrl, setHonorPhotoUrl] = useState('');
  const [isCompressingHonor, setIsCompressingHonor] = useState(false);
  const [honorYearFilter, setHonorYearFilter] = useState<string>('2025 - 2026');
  const [honorSearch, setHonorSearch] = useState<string>('');
  const [honorTierFilter, setHonorTierFilter] = useState<string>('all');
  const [honorViewMode, setHonorViewMode] = useState<'cards' | 'table'>('cards');
  const [viewingCertificateMember, setViewingCertificateMember] = useState<VolunteerMember | null>(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  // Editing Registration Modal State
  const [editingReg, setEditingReg] = useState<YouthRegistration | null>(null);
  const [editRegName, setEditRegName] = useState('');
  const [editRegClass, setEditRegClass] = useState('');
  const [editRegYear, setEditRegYear] = useState('2026 - 2027');
  const [editRegPhone, setEditRegPhone] = useState('');
  const [editRegSkills, setEditRegSkills] = useState('');
  const [editRegStatus, setEditRegStatus] = useState<YouthRegistration['status']>('pending');
  const [editRegIsLeader, setEditRegIsLeader] = useState(false);
  const [editRegLeaderRole, setEditRegLeaderRole] = useState('Bí thư Chi đoàn');
  const [editRegNotes, setEditRegNotes] = useState('');

  // Editing Volunteer Member Modal State
  const [editingMember, setEditingMember] = useState<VolunteerMember | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberClass, setEditMemberClass] = useState('');
  const [editMemberYear, setEditMemberYear] = useState('2026 - 2027');
  const [editMemberPhone, setEditMemberPhone] = useState('');
  const [editMemberSkills, setEditMemberSkills] = useState('');
  const [editMemberCount, setEditMemberCount] = useState(1);
  const [editMemberStatus, setEditMemberStatus] = useState<VolunteerStatus>('active');
  const [editMemberIsLeader, setEditMemberIsLeader] = useState(false);
  const [editMemberLeaderRole, setEditMemberLeaderRole] = useState('Đội trưởng Tình nguyện');
  const [editMemberAvatar, setEditMemberAvatar] = useState('');
  const [isCompressingMemberAvatar, setIsCompressingMemberAvatar] = useState(false);

  // Add new member modal state
  const [isAddingNewMember, setIsAddingNewMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberClass, setNewMemberClass] = useState('');
  const [newMemberYear, setNewMemberYear] = useState('2026 - 2027');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberSkills, setNewMemberSkills] = useState('');
  const [newMemberCount, setNewMemberCount] = useState(1);
  const [newMemberIsLeader, setNewMemberIsLeader] = useState(false);
  const [newMemberLeaderRole, setNewMemberLeaderRole] = useState('Đội phó Xung kích');

  // Reason / Dismiss modal state
  const [targetDismissMember, setTargetDismissMember] = useState<{ id: string; name: string; isReg?: boolean } | null>(null);
  const [dismissReasonChoice, setDismissReasonChoice] = useState<VolunteerStatus>('inactive_low_performance');
  const [dismissCustomNote, setDismissCustomNote] = useState('');

  // Unique lists for Year and Class dropdowns
  const availableRegYears = useMemo(() => {
    const years = new Set(['2026 - 2027', '2025 - 2026', '2024 - 2025']);
    registrations.forEach(r => { if (r.academicYear) years.add(r.academicYear); });
    return Array.from(years);
  }, [registrations]);

  const availableRegClasses = useMemo(() => {
    const classes = new Set<string>();
    registrations.forEach(r => { if (r.className) classes.add(r.className.trim().toUpperCase()); });
    return Array.from(classes).sort();
  }, [registrations]);

  const availableVolYears = useMemo(() => {
    const years = new Set(['2026 - 2027', '2025 - 2026', '2024 - 2025']);
    volunteerMembers.forEach(m => { if (m.academicYear) years.add(m.academicYear); });
    return Array.from(years);
  }, [volunteerMembers]);

  const availableVolClasses = useMemo(() => {
    const classes = new Set<string>();
    volunteerMembers.forEach(m => { if (m.className) classes.add(m.className.trim().toUpperCase()); });
    return Array.from(classes).sort();
  }, [volunteerMembers]);

  // Filtered Registrations List
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // Status filter
      if (regStatusFilter === 'approved') {
        if (r.status !== 'accepted' && r.status !== 'approved' && r.status !== 'assigned') return false;
      } else if (regStatusFilter === 'pending') {
        if (r.status !== 'pending' && r.status !== 'contacted') return false;
      }
      // Year filter
      if (regYearFilter !== 'all' && (r.academicYear || '2026 - 2027') !== regYearFilter) return false;
      // Grade filter
      if (regGradeFilter !== 'all') {
        const cls = (r.className || '').trim();
        if (!cls.startsWith(regGradeFilter)) return false;
      }
      // Class filter
      if (regClassFilter !== 'all' && r.className.trim().toUpperCase() !== regClassFilter) return false;
      // Search keyword
      if (regSearch.trim()) {
        const query = regSearch.trim().toLowerCase();
        const matchName = r.fullName.toLowerCase().includes(query);
        const matchClass = r.className.toLowerCase().includes(query);
        const matchPhone = r.phone.includes(query);
        if (!matchName && !matchClass && !matchPhone) return false;
      }
      return true;
    });
  }, [registrations, regStatusFilter, regYearFilter, regGradeFilter, regClassFilter, regSearch]);

  // Filtered Volunteers List
  const filteredVolunteers = useMemo(() => {
    return volunteerMembers.filter(m => {
      // Year filter
      if (volYearFilter !== 'all' && (m.academicYear || '2025 - 2026') !== volYearFilter) return false;
      // Grade filter
      if (volGradeFilter !== 'all') {
        const cls = (m.className || '').trim();
        if (!cls.startsWith(volGradeFilter)) return false;
      }
      // Class filter
      if (volClassFilter !== 'all' && m.className.trim().toUpperCase() !== volClassFilter) return false;
      // Status filter
      if (volStatusFilter === 'leader') {
        if (!m.isLeader) return false;
      } else if (volStatusFilter === 'honored') {
        if (!m.isHonored && m.status !== 'honored') return false;
      } else if (volStatusFilter !== 'all') {
        if (m.status !== volStatusFilter) return false;
      }
      // Search keyword
      if (volSearch.trim()) {
        const query = volSearch.trim().toLowerCase();
        const matchName = m.fullName.toLowerCase().includes(query);
        const matchClass = m.className.toLowerCase().includes(query);
        const matchPhone = m.phone.includes(query);
        if (!matchName && !matchClass && !matchPhone) return false;
      }
      return true;
    }).sort((a, b) => (b.activitiesCount || 0) - (a.activitiesCount || 0));
  }, [volunteerMembers, volYearFilter, volGradeFilter, volClassFilter, volStatusFilter, volSearch]);

  const allHonoredMembers = useMemo(() => {
    return volunteerMembers.filter(m => m.isHonored || m.status === 'honored' || (m.activitiesCount || 0) >= 1);
  }, [volunteerMembers]);

  const availableHonorYears = useMemo(() => {
    const years = new Set<string>(availableAcademicYears);
    volunteerMembers.forEach(m => {
      if (m.academicYear) {
        years.add(m.academicYear);
      }
    });
    return Array.from(years);
  }, [availableAcademicYears, volunteerMembers]);

  const filteredHonoredMembers = useMemo(() => {
    const evaluated = allHonoredMembers.map(m => {
      if (honorYearFilter === 'all') {
        const direct = Number(m.activitiesCount) || 0;
        return { ...m, activitiesCount: direct, calculatedPoints: direct };
      }
      const stats = computeMemberScoreForYear(m, volunteerAttendance, honorYearFilter, 'all');
      return {
        ...m,
        activitiesCount: stats.totalPoints,
        calculatedPoints: stats.totalPoints,
        isEligible: stats.isEligibleForHonor,
      };
    });

    let list = evaluated;

    if (honorYearFilter !== 'all') {
      list = list.filter(m => {
        // Chỉ lấy những bạn có hoạt động trong năm học này hoặc đăng ký năm này với điểm > 0
        return (m.academicYear === honorYearFilter) || (m.calculatedPoints > 0);
      });
    }

    if (honorSearch.trim()) {
      const q = honorSearch.trim().toLowerCase();
      list = list.filter(m =>
        m.fullName.toLowerCase().includes(q) ||
        m.className.toLowerCase().includes(q) ||
        (m.honorTitle && m.honorTitle.toLowerCase().includes(q))
      );
    }

    if (honorTierFilter === 'top') {
      list = list.filter(m => (m.calculatedPoints || m.activitiesCount || 0) >= 20);
    } else if (honorTierFilter === 'excellent') {
      list = list.filter(m => (m.calculatedPoints || m.activitiesCount || 0) >= 10);
    } else if (honorTierFilter === 'active') {
      list = list.filter(m => (m.calculatedPoints || m.activitiesCount || 0) >= 5);
    }

    return [...list].sort((a, b) => (b.calculatedPoints || b.activitiesCount || 0) - (a.calculatedPoints || a.activitiesCount || 0));
  }, [allHonoredMembers, honorYearFilter, honorSearch, honorTierFilter, volunteerAttendance]);

  // Consolidated and deduplicated volunteer member list with real-time aggregated attendance counts
  const deduplicatedVolunteersWithAttendance = useMemo(() => {
    const map = new Map<string, { member: VolunteerMember; actualCount: number }>();
    
    volunteerMembers.forEach(m => {
      const normName = normalizeStudentName(m.fullName);
      const normClass = normalizeStudentClass(m.className);
      const key = `${normName}_${normClass}`;
      
      const matchedAtts = volunteerAttendance.filter(
        a => normalizeStudentName(a.fullName) === normName && normalizeStudentClass(a.className) === normClass
      ).length;
      const directCount = Number(m.activitiesCount) || 0;
      const count = Math.max(directCount, matchedAtts);

      if (!map.has(key)) {
        map.set(key, { member: m, actualCount: count });
      } else {
        const existing = map.get(key)!;
        const higherCount = Math.max(existing.actualCount, count, (existing.member.activitiesCount || 0) + directCount);
        map.set(key, {
          member: {
            ...existing.member,
            isLeader: existing.member.isLeader || m.isLeader,
            leaderRole: existing.member.leaderRole || m.leaderRole,
            isHonored: existing.member.isHonored || m.isHonored || higherCount >= 5,
            avatarUrl: existing.member.avatarUrl || m.avatarUrl,
            honorPhoto: existing.member.honorPhoto || m.honorPhoto,
          },
          actualCount: higherCount
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.actualCount - a.actualCount);
  }, [volunteerMembers, volunteerAttendance]);

  const toggleActivity = (actId: string) => {
    setSelectedActivities((prev) => 
      prev.includes(actId) ? prev.filter((a) => a !== actId) : [...prev, actId]
    );
  };

  const handleRegAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.reason || 'Tệp ảnh đại diện không hợp lệ hoặc bị từ chối.');
      e.target.value = '';
      return;
    }
    setIsCompressingRegAvatar(true);
    try {
      const compressed = await compressImageFile(file, 500, 500, 0.85);
      setRegAvatar(compressed);
    } catch {
      alert('Không thể tải ảnh, vui lòng thử lại với ảnh dung lượng nhỏ hơn!');
    } finally {
      setIsCompressingRegAvatar(false);
    }
  };

  // Form Submit Handler
  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanClass = className.trim();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!cleanName || !cleanClass || !cleanPhone) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const nameMod = moderateText(cleanName);
    if (!nameMod.isSafe) {
      alert(nameMod.reason || 'Họ và tên không hợp lệ!');
      return;
    }

    const skillsMod = moderateText(skills);
    if (!skillsMod.isSafe) {
      alert(skillsMod.reason || 'Nội dung sở trường / kỹ năng chứa từ ngữ không phù hợp!');
      return;
    }

    const desiresMod = moderateText(desires);
    if (!desiresMod.isSafe) {
      alert(desiresMod.reason || 'Nội dung nguyện vọng chứa từ ngữ không phù hợp!');
      return;
    }

    if (selectedActivities.length === 0) {
      alert('Vui lòng chọn ít nhất 1 nội dung hoạt động muốn tham gia!');
      return;
    }

    // Check duplicate in existing registrations
    const existingReg = registrations.find(
      r => r.phone.replace(/\s+/g, '') === cleanPhone || 
           (r.fullName.toLowerCase() === cleanName.toLowerCase() && r.className.toLowerCase() === cleanClass.toLowerCase())
    );

    if (existingReg) {
      if (existingReg.status === 'accepted' || existingReg.status === 'approved' || existingReg.status === 'assigned') {
        setSubmitFeedback({
          type: 'accepted',
          studentName: cleanName,
          message: 'Bạn chính thức là thành viên của Đoàn Trường THPT Ba Chúc!',
        });
        return;
      } else {
        setSubmitFeedback({
          type: 'pending',
          studentName: cleanName,
          message: 'Bạn vui lòng chờ duyệt',
        });
        return;
      }
    }

    // Add new registration
    onAddRegistration({
      fullName: cleanName,
      birthDate: birthDate.trim() || '2009-01-01',
      className: cleanClass,
      academicYear: academicYear.trim() || '2026 - 2027',
      phone: cleanPhone,
      email: email.trim() || undefined,
      avatarUrl: regAvatar.trim() || undefined,
      activities: selectedActivities,
      skills: skills.trim() || 'Sẵn sàng học hỏi và rèn luyện kỹ năng mới',
      desires: desires.trim() || 'Mong muốn cống hiến và phát triển bản thân',
    });

    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.6 },
    });

    setSubmitFeedback({
      type: 'success',
      studentName: cleanName,
      message: 'Chúc mừng bạn đã đăng ký hoạt động đoàn',
    });
  };

  const handleResetForm = () => {
    setSubmitFeedback(null);
    setFullName('');
    setBirthDate('');
    setClassName('');
    setPhone('');
    setEmail('');
    setRegAvatar('');
    setSelectedActivities(['Công tác Đoàn', 'Tình nguyện']);
    setSkills('');
    setDesires('');
  };

  // Quick Student Lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupKeyword.trim().toLowerCase();
    if (!query) return;

    const member = volunteerMembers.find(
      m => m.phone.replace(/\s+/g, '').includes(query) || m.fullName.toLowerCase().includes(query)
    );
    if (member) {
      const normName = normalizeStudentName(member.fullName);
      const normClass = normalizeStudentClass(member.className);
      const attCount = volunteerAttendance.filter(
        a => normalizeStudentName(a.fullName) === normName && normalizeStudentClass(a.className) === normClass
      ).length;
      setLookupResult({
        ...member,
        activitiesCount: Math.max(member.activitiesCount ?? 0, attCount)
      });
      return;
    }

    const reg = registrations.find(
      r => r.phone.replace(/\s+/g, '').includes(query) || r.fullName.toLowerCase().includes(query)
    );
    if (reg) {
      setLookupResult(reg);
      return;
    }

    setLookupResult('not_found');
  };

  // Attendance submit
  const handleAddAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attFullName.trim() || !attClassName.trim() || !attActivityName.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên, lớp và tên hoạt động!');
      return;
    }

    if (onAddAttendance) {
      onAddAttendance({
        fullName: attFullName.trim(),
        className: attClassName.trim(),
        activityName: attActivityName.trim(),
        date: attDate,
        location: attLocation.trim(),
        timesParticipated: 1,
      });
      setAttSavedToast(true);
      setTimeout(() => setAttSavedToast(false), 3000);
      setAttFullName('');
      setAttClassName('');
    }
  };

  // Honor modal Handlers
  const handleOpenHonorModal = (member: VolunteerMember) => {
    setSelectedHonorMember(member);
    setHonorStudentName(member.fullName);
    setHonorStudentClass(member.className);
    setHonorStudentCount(member.activitiesCount ?? 0);
    setHonorTitleText(member.honorTitle || 'Vinh Danh Học Sinh Tích Cực Trong Phong Trào Tình Nguyện');
    setHonorDateText(member.honorDate || 'Gương Mặt Tiêu Biểu Năm Học 2026 - 2027');
    setHonorPhotoUrl(member.honorPhoto || member.avatarUrl || '');
  };

  const handleHonorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingHonor(true);
    try {
      const compressed = await compressImageFile(file, 800, 800, 0.85);
      setHonorPhotoUrl(compressed);
    } catch {
      alert('Không thể nén ảnh, vui lòng thử lại ảnh khác!');
    } finally {
      setIsCompressingHonor(false);
    }
  };

  const handleSaveHonor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedHonorMember) return;
    if (!honorStudentName.trim() || !honorStudentClass.trim()) {
      alert('Vui lòng nhập họ tên và lớp của học sinh!');
      return;
    }

    if (onUpdateVolunteerMember) {
      onUpdateVolunteerMember(selectedHonorMember.id, {
        fullName: honorStudentName.trim(),
        className: honorStudentClass.trim(),
        activitiesCount: Number(honorStudentCount) >= 0 ? Number(honorStudentCount) : (selectedHonorMember.activitiesCount ?? 0),
        isHonored: true,
        status: 'honored',
        honorTitle: honorTitleText.trim() || 'Vinh Danh Học Sinh Tích Cực Trong Phong Trào Tình Nguyện',
        honorDate: honorDateText.trim() || new Date().toLocaleDateString('vi-VN'),
        honorPhoto: honorPhotoUrl.trim() || selectedHonorMember.avatarUrl,
      });
    } else if (onHonorMember) {
      onHonorMember(selectedHonorMember.id, honorTitleText.trim(), honorPhotoUrl.trim() || undefined);
    }
    confetti({ particleCount: 120, spread: 90 });
    setSelectedHonorMember(null);
  };

  // Open Edit Registration Modal
  const handleOpenEditReg = (reg: YouthRegistration) => {
    setEditingReg(reg);
    setEditRegName(reg.fullName);
    setEditRegClass(reg.className);
    setEditRegYear(reg.academicYear || '2026 - 2027');
    setEditRegPhone(reg.phone || '');
    setEditRegSkills(reg.skills || '');
    setEditRegStatus(reg.status || 'pending');
    setEditRegIsLeader(!!reg.isLeader);
    setEditRegLeaderRole(reg.leaderRole || 'Bí thư Chi đoàn');
    setEditRegNotes(reg.notes || '');
  };

  // Save Registration Edit
  const handleSaveRegEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg || !onUpdateRegistration) return;
    if (!editRegName.trim() || !editRegClass.trim()) {
      alert('Vui lòng nhập họ tên và lớp của học sinh!');
      return;
    }

    onUpdateRegistration(editingReg.id, {
      fullName: editRegName.trim(),
      className: editRegClass.trim(),
      academicYear: editRegYear.trim(),
      phone: editRegPhone.trim(),
      skills: editRegSkills.trim(),
      status: editRegStatus,
      isLeader: editRegIsLeader,
      leaderRole: editRegIsLeader ? editRegLeaderRole.trim() : undefined,
      notes: editRegNotes.trim(),
    });

    setEditingReg(null);
  };

  // Quick Toggle Leader Flag on Registration
  const handleToggleRegLeader = (reg: YouthRegistration) => {
    if (!onUpdateRegistration) return;
    const newIsLeader = !reg.isLeader;
    onUpdateRegistration(reg.id, {
      isLeader: newIsLeader,
      leaderRole: newIsLeader ? (reg.leaderRole || 'Bí thư Chi đoàn / Thủ lĩnh') : undefined,
    });
    if (newIsLeader) {
      confetti({ particleCount: 60, spread: 70 });
    }
  };

  // Quick Toggle Leader Flag on Volunteer Member
  const handleToggleMemberLeader = (member: VolunteerMember) => {
    if (!onUpdateVolunteerMember) return;
    const newIsLeader = !member.isLeader;
    onUpdateVolunteerMember(member.id, {
      isLeader: newIsLeader,
      leaderRole: newIsLeader ? (member.leaderRole || 'Đội trưởng Tình nguyện') : undefined,
    });
    if (newIsLeader) {
      confetti({ particleCount: 60, spread: 70 });
    }
  };

  // Quick Approve Registration
  const handleApproveReg = (reg: YouthRegistration) => {
    if (onUpdateRegistration) {
      onUpdateRegistration(reg.id, { status: 'accepted' });
      confetti({ particleCount: 80, spread: 80 });
    }
  };

  // Open Edit Volunteer Member Modal
  const handleOpenEditMemberModal = (member: VolunteerMember) => {
    setEditingMember(member);
    setEditMemberName(member.fullName);
    setEditMemberClass(member.className);
    setEditMemberYear(member.academicYear || '2026 - 2027');
    setEditMemberPhone(member.phone || '');
    setEditMemberSkills(member.skills || '');
    setEditMemberCount(member.activitiesCount ?? 0);
    setEditMemberStatus(member.status || 'active');
    setEditMemberIsLeader(!!member.isLeader);
    setEditMemberLeaderRole(member.leaderRole || 'Đội trưởng Tình nguyện');
    setEditMemberAvatar(member.avatarUrl || member.honorPhoto || '');
  };

  const handleMemberAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingMemberAvatar(true);
    try {
      const compressed = await compressImageFile(file, 600, 600, 0.85);
      setEditMemberAvatar(compressed);
    } catch {
      alert('Không thể nén ảnh đại diện, vui lòng thử lại!');
    } finally {
      setIsCompressingMemberAvatar(false);
    }
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !onUpdateVolunteerMember) return;
    if (!editMemberName.trim() || !editMemberClass.trim()) {
      alert('Vui lòng nhập họ tên và lớp của học sinh!');
      return;
    }
    onUpdateVolunteerMember(editingMember.id, {
      fullName: editMemberName.trim(),
      className: editMemberClass.trim(),
      academicYear: editMemberYear.trim(),
      phone: editMemberPhone.trim(),
      skills: editMemberSkills.trim(),
      activitiesCount: Number(editMemberCount) >= 0 ? Number(editMemberCount) : 0,
      status: editMemberStatus,
      isLeader: editMemberIsLeader,
      leaderRole: editMemberIsLeader ? editMemberLeaderRole.trim() : undefined,
      avatarUrl: editMemberAvatar.trim() || undefined,
      isHonored: editMemberStatus === 'honored' ? true : editingMember.isHonored,
    });
    setEditingMember(null);
  };

  // Add New Member Handler
  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberClass.trim()) {
      alert('Vui lòng nhập họ tên và lớp của học sinh!');
      return;
    }
    const newMemberData = {
      code: `TN-BC-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newMemberName.trim(),
      className: newMemberClass.trim(),
      academicYear: newMemberYear.trim() || '2026 - 2027',
      phone: newMemberPhone.trim() || '09' + Math.floor(10000000 + Math.random() * 90000000),
      joinedDate: new Date().toLocaleDateString('vi-VN'),
      activitiesCount: Number(newMemberCount) >= 0 ? Number(newMemberCount) : 0,
      skills: newMemberSkills.trim() || 'Tích cực tham gia phong trào tình nguyện',
      status: 'active' as const,
      isLeader: newMemberIsLeader,
      leaderRole: newMemberIsLeader ? newMemberLeaderRole.trim() : undefined,
    };
    if (onAddVolunteerMember) {
      onAddVolunteerMember(newMemberData);
    }
    setIsAddingNewMember(false);
    setNewMemberName('');
    setNewMemberClass('');
    setNewMemberPhone('');
    setNewMemberSkills('');
    setNewMemberCount(0);
    setNewMemberIsLeader(false);
  };

  // Confirm Dismiss / Update Status with Reasons
  const handleConfirmDismiss = (actionType: 'remove_completely' | 'change_status' = 'remove_completely') => {
    if (!targetDismissMember) return;
    
    if (actionType === 'remove_completely') {
      if (targetDismissMember.isReg) {
        if (onDeleteRegistration) onDeleteRegistration(targetDismissMember.id);
      } else {
        if (onDeleteVolunteerMember) onDeleteVolunteerMember(targetDismissMember.id);
      }
      setTargetDismissMember(null);
      setDismissCustomNote('');
      return;
    }

    let reasonText = '';
    if (dismissReasonChoice === 'graduated_12') {
      reasonText = 'Đã hoàn thành học sinh cấp 3 (Tốt nghiệp lớp 12)';
    } else if (dismissReasonChoice === 'inactive_rules_violation') {
      reasonText = 'Không tích cực / Vi phạm nội quy phong trào tình nguyện';
    } else if (dismissReasonChoice === 'inactive_low_performance') {
      reasonText = 'Sức học giảm sút (Tạm dừng để tập trung học tập)';
    }

    if (dismissCustomNote.trim()) {
      reasonText += ` - ${dismissCustomNote.trim()}`;
    }

    if (targetDismissMember.isReg) {
      // It's a registration
      if (onDeleteRegistration) {
        onDeleteRegistration(targetDismissMember.id);
      }
    } else {
      // It's a volunteer member
      if (onUpdateVolunteerMember) {
        onUpdateVolunteerMember(targetDismissMember.id, {
          status: dismissReasonChoice,
          statusReason: reasonText,
        });
      } else if (onDeleteVolunteerMember) {
        onDeleteVolunteerMember(targetDismissMember.id, reasonText);
      }
    }

    setTargetDismissMember(null);
    setDismissCustomNote('');
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-red-50/60 via-rose-50/40 to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <Flag className="w-4 h-4 text-red-600 animate-pulse" />
            <span>ĐOÀN TNCS HỒ CHÍ MINH - TRƯỜNG THPT BA CHÚC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            THÔNG TIN ĐOÀN & ĐỘI TÌNH NGUYỆN
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Nơi kết nối nhiệt huyết tuổi trẻ, quản lý hồ sơ đoàn viên đã duyệt và chờ duyệt theo năm học/lớp, điểm danh phong trào, trao cờ thủ lĩnh và vinh danh học sinh tích cực.
          </p>

          {/* Navigation Sub-tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'register'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Đăng ký tham gia Đoàn</span>
            </button>

            <button
              onClick={() => setActiveTab('registrations_list')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'registrations_list'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Danh Sách Đăng Ký ({registrations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteers_list')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'volunteers_list'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Đoàn Thanh Niên Tình Nguyện ({volunteerMembers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tree')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'tree'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <Trees className="w-4 h-4 text-emerald-500" />
              <span>Cây Hoạt Động & Cây Hè 🌳</span>
            </button>

            <button
              onClick={() => setActiveTab('honors')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'honors'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <Award className="w-4 h-4 text-yellow-300" />
              <span>Bảng Vàng Vinh Danh ({allHonoredMembers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'attendance'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Điểm Danh Hoạt Động ({volunteerAttendance.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'lookup'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Xét Duyệt ({registrations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs ${
                activeTab === 'charts'
                  ? 'bg-red-600 text-white shadow-red-500/30'
                  : 'bg-white text-slate-700 hover:bg-red-50 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Biểu Đồ & Thống Kê Đoàn</span>
            </button>

            <button
              onClick={() => setIsYearManagerModalOpen(true)}
              className="px-3 py-2 rounded-2xl font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
              title="Quản lý niên khóa và phân kỳ năm học / mùa hè"
            >
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span>Niên khóa: <strong>{currentSchoolYear}</strong></span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: REGISTRATION FORM ================= */}
        {activeTab === 'register' && (
          <div className="space-y-8">
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Hồ sơ đã gửi</p>
                  <p className="text-2xl font-black text-slate-800">{registrations.length} Đơn</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Đã duyệt gia nhập</p>
                  <p className="text-2xl font-black text-emerald-600">
                    {registrations.filter(r => r.status === 'accepted' || r.status === 'approved' || r.status === 'assigned').length + volunteerMembers.length} Bạn
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Gương mặt vinh danh</p>
                  <p className="text-2xl font-black text-amber-600">{allHonoredMembers.length} Bạn</p>
                </div>
              </div>
            </div>

            {/* Form Box */}
            <div className="bg-white rounded-3xl border border-red-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white p-6 sm:p-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <Flag className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black">
                      PHIẾU ĐĂNG KÝ THAM GIA ĐOÀN & ĐỘI TÌNH NGUYỆN
                    </h2>
                    <p className="text-xs sm:text-sm text-red-100">
                      Năm học 2026 – 2027 | Ban Chấp Hành Đoàn Trường THPT Ba Chúc
                    </p>
                  </div>
                </div>
              </div>

              {submitFeedback ? (
                <div className="p-8 sm:p-12 text-center space-y-6">
                  {submitFeedback.type === 'accepted' ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                          Hồ sơ chính thức
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-700">
                          {submitFeedback.message}
                        </h3>
                        <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                          Chào mừng bạn <strong>{submitFeedback.studentName}</strong> đã là thành viên chính thức của Đoàn Trường THPT Ba Chúc!
                        </p>
                      </div>
                    </div>
                  ) : submitFeedback.type === 'pending' ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Clock className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase">
                          Tiến trình xét duyệt
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-amber-600">
                          {submitFeedback.message}
                        </h3>
                        <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                          Hồ sơ đăng ký của bạn <strong>{submitFeedback.studentName}</strong> đã được ghi nhận. Ban Chấp Hành Đoàn Trường sẽ sớm duyệt danh sách!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-emerald-700">
                        {submitFeedback.message}
                      </h3>
                      <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                        Hồ sơ của bạn <strong>{submitFeedback.studentName}</strong> đã được gửi thành công đến Ban Quản Trị Đoàn Trường THPT Ba Chúc.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetForm}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition cursor-pointer text-sm shadow-md"
                    >
                      Gửi thêm đơn đăng ký khác
                    </button>
                    <button
                      onClick={() => setActiveTab('registrations_list')}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition cursor-pointer text-sm"
                    >
                      Xem Danh Sách Đăng Ký
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegistrationSubmit} className="p-6 sm:p-8 space-y-6">
                  {/* 1. Personal Info Grid */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase text-red-600 tracking-wider flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span>1. THÔNG TIN CÁ NHÂN HỌC SINH</span>
                    </h3>

                    {/* Avatar Upload in Registration */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {regAvatar ? (
                          <img
                            src={regAvatar}
                            alt="Ảnh chân dung học sinh"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <label className="block text-xs font-bold text-slate-800">
                          Ảnh thẻ / Avatar đoàn viên (Tuỳ chọn)
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Tải ảnh chụp chân dung học sinh để làm thẻ Đoàn viên & bảng thành tích.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <label className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs">
                            <Camera className="w-3.5 h-3.5 text-red-600" />
                            <span>{isCompressingRegAvatar ? 'Đang nén ảnh...' : regAvatar ? 'Đổi ảnh khác' : 'Chọn ảnh chân dung'}</span>
                            <input
                              type="file"
                              accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                              className="hidden"
                              onChange={handleRegAvatarUpload}
                            />
                          </label>
                          {regAvatar && (
                            <button
                              type="button"
                              onClick={() => setRegAvatar('')}
                              className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
                            >
                              Xóa ảnh
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Họ và tên học sinh <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ví dụ: Lê Văn A"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Lớp học <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          placeholder="Ví dụ: 10A1, 11A1, 12A1..."
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Năm học đăng ký <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800"
                        >
                          <option value="2026 - 2027">2026 - 2027 (Năm học hiện tại)</option>
                          <option value="2025 - 2026">2025 - 2026</option>
                          <option value="2024 - 2025">2024 - 2025</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ngày tháng năm sinh <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Số điện thoại liên hệ <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ví dụ: 0912 345 678"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Địa chỉ Email (Tuỳ chọn)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Ví dụ: levana.thptbachuc@gmail.com"
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Activities Checkboxes */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase text-red-600 tracking-wider flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>2. LĨNH VỰC BẠN MUỐN THAM GIA</span>
                        <span className="text-rose-500">*</span>
                      </h3>
                      <span className="text-xs text-slate-400">Có thể chọn nhiều mục</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ACTIVITIES_LIST.map((item) => {
                        const isSelected = selectedActivities.includes(item.id);
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleActivity(item.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                              isSelected
                                ? 'bg-red-50/80 border-red-400 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                              isSelected ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-red-900' : 'text-slate-800'}`}>
                                  {item.label}
                                </p>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="rounded text-red-600 focus:ring-red-500 pointer-events-none"
                                />
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Skills & Desires */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-black uppercase text-red-600 tracking-wider flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span>3. KỸ NĂNG & NGUYỆN VỌNG</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kỹ năng, sở trường hoặc năng khiếu đặc biệt của bạn:
                        </label>
                        <textarea
                          rows={2}
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="Ví dụ: Thiết kế poster Canva/Photoshop, MC dẫn chương trình, quay dựng video CapCut, chụp ảnh, ca hát, sơ cấp cứu..."
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mong muốn và nguyện vọng phát triển của bạn khi tham gia:
                        </label>
                        <textarea
                          rows={2}
                          value={desires}
                          onChange={(e) => setDesires(e.target.value)}
                          placeholder="Ví dụ: Em muốn rèn luyện kỹ năng giao tiếp tự tin trước đám đông và cống hiến cho các hoạt động vì cộng đồng của trường THPT Ba Chúc..."
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black rounded-2xl shadow-xl shadow-red-500/25 transition cursor-pointer text-base flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>GỬI ĐĂNG KÝ THAM GIA ĐOÀN</span>
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Thông tin đăng ký được chuyển trực tiếp tới Ban Chấp Hành Đoàn Trường THPT Ba Chúc.</span>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: DANH SÁCH ĐOÀN VIÊN ĐĂNG KÝ (ĐÃ DUYỆT & CHỜ DUYỆT) ================= */}
        {activeTab === 'registrations_list' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                    <FileText className="w-6 h-6 text-red-600" />
                    <span>DANH SÁCH ĐOÀN VIÊN ĐĂNG KÝ (ĐÃ DUYỆT & CHỜ DUYỆT)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Quản lý danh sách học sinh nộp đơn theo từng Năm học và Lớp học. Quản trị viên có thể điều chỉnh họ tên, lớp học, phê duyệt hoặc trao cờ thủ lĩnh 🚩.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                      placeholder="Tìm theo tên, lớp, SĐT..."
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-red-500 w-48 sm:w-60"
                    />
                  </div>
                </div>
              </div>

              {/* Filters Bar: Status, Year, Class */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                {/* Status Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setRegStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      regStatusFilter === 'all' ? 'bg-white text-red-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả ({registrations.length})
                  </button>
                  <button
                    onClick={() => setRegStatusFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                      regStatusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã duyệt ({registrations.filter(r => r.status === 'accepted' || r.status === 'approved' || r.status === 'assigned').length})</span>
                  </button>
                  <button
                    onClick={() => setRegStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                      regStatusFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs font-black' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Chờ duyệt ({registrations.filter(r => r.status === 'pending' || r.status === 'contacted').length})</span>
                  </button>
                </div>

                {/* Academic Year Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Năm học:</span>
                  <select
                    value={regYearFilter}
                    onChange={(e) => setRegYearFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="all">Tất cả năm học</option>
                    {availableRegYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Grade Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Khối:</span>
                  <select
                    value={regGradeFilter}
                    onChange={(e) => setRegGradeFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="all">Tất cả khối</option>
                    <option value="10">Khối 10</option>
                    <option value="11">Khối 11</option>
                    <option value="12">Khối 12</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Lớp học:</span>
                  <select
                    value={regClassFilter}
                    onChange={(e) => setRegClassFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {availableRegClasses.map(c => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Registrations List Grid / Cards */}
            {filteredRegistrations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Chưa tìm thấy hồ sơ đăng ký phù hợp</h4>
                <p className="text-xs text-slate-400">Hãy thử đổi bộ lọc năm học, lớp học hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRegistrations.map((reg) => {
                  const isApproved = reg.status === 'accepted' || reg.status === 'approved' || reg.status === 'assigned';

                  return (
                    <div
                      key={reg.id}
                      className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                        reg.isLeader 
                          ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300' 
                          : isApproved 
                          ? 'border-emerald-200' 
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top status badges */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-base font-black text-slate-900">
                                {reg.fullName}
                              </h3>
                              {reg.isLeader && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs" title="Cờ Thủ Lĩnh Đoàn">
                                  <span>🚩</span>
                                  <span>{reg.leaderRole || 'Thủ Lĩnh'}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                Lớp {reg.className}
                              </span>
                              <span className="text-slate-400 font-medium">
                                • {reg.academicYear || '2026 - 2027'}
                              </span>
                            </div>
                          </div>

                          {/* Approval status pill */}
                          {isApproved ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center space-x-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã duyệt</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center space-x-1 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Chờ duyệt</span>
                            </span>
                          )}
                        </div>

                        {/* Activities tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {(reg.activities || []).map((act, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium"
                            >
                              {act}
                            </span>
                          ))}
                        </div>

                        {/* Skills and info */}
                        {reg.skills && (
                          <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-xl">
                            💡 <strong>Kỹ năng:</strong> {reg.skills}
                          </p>
                        )}
                        {reg.phone && (
                          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{reg.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Admin Controls */}
                      {isAdminLoggedIn && (
                        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5">
                            {/* Toggle Leader Flag */}
                            <button
                              onClick={() => handleToggleRegLeader(reg)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                                reg.isLeader
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800'
                              }`}
                              title={reg.isLeader ? 'Thu hồi Cờ Thủ Lĩnh' : 'Trao Cờ Thủ Lĩnh Đoàn'}
                            >
                              <span>🚩</span>
                              <span>{reg.isLeader ? 'Đã trao cờ' : 'Giao cờ'}</span>
                            </button>

                            {/* Edit Registration */}
                            <button
                              onClick={() => handleOpenEditReg(reg)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa họ tên, lớp, năm học..."
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Dismiss / Delete Modal */}
                            <button
                              onClick={() => setTargetDismissMember({ id: reg.id, name: reg.fullName, isReg: true })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Xóa / Tạm dừng học sinh"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {!isApproved && (
                            <button
                              onClick={() => handleApproveReg(reg)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt ngay</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: DANH SÁCH ĐOÀN THANH NIÊN TÌNH NGUYỆN ================= */}
        {activeTab === 'volunteers_list' && (
          <div className="space-y-6">
            {/* Memory & Sync Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm sm:text-base font-black tracking-tight flex items-center space-x-2">
                      <span>BỘ NHỚ ĐA TẦNG ĐOÀN VIÊN & VINH DANH</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        🟢 ĐỒNG BỘ 5 TẦNG
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Lưu trữ bền vững <strong className="text-amber-300">{volunteerMembers.filter(m => (m.academicYear || '2025 - 2026') === '2025 - 2026').length} chiến sĩ (2025 - 2026)</strong> trong tổng số {volunteerMembers.length} đoàn viên • RAM • IndexedDB • Firestore • Server
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsMemoryModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Trung tâm Bộ nhớ</span>
                </button>
                <button
                  onClick={() => exportHonoredStudentsCSV(volunteerMembers)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất Bảng Vàng (CSV)</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                    <Users className="w-6 h-6 text-red-600" />
                    <span>DANH SÁCH ĐOÀN THANH NIÊN TÌNH NGUYỆN</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Cây thông tin Đoàn & Đội tình nguyện chính thức. Quản trị viên có thể điều chỉnh họ tên, lớp học, năm học, trao cờ thủ lĩnh 🚩 và vinh danh Bảng Vàng.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={volSearch}
                      onChange={(e) => setVolSearch(e.target.value)}
                      placeholder="Tìm theo tên, lớp, SĐT..."
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-red-500 w-48 sm:w-60"
                    />
                  </div>

                  {isAdminLoggedIn && (
                    <button
                      onClick={() => setIsAddingNewMember(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm đoàn viên</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Bar: Status, Year, Class */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
                {/* Status Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setVolStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      volStatusFilter === 'all' ? 'bg-white text-red-700 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả ({volunteerMembers.length})
                  </button>
                  <button
                    onClick={() => setVolStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      volStatusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Đang hoạt động
                  </button>
                  <button
                    onClick={() => setVolStatusFilter('leader')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                      volStatusFilter === 'leader' ? 'bg-amber-500 text-white shadow-xs font-black' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <span>🚩</span>
                    <span>Cờ Thủ Lĩnh</span>
                  </button>
                  <button
                    onClick={() => setVolStatusFilter('honored')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                      volStatusFilter === 'honored' ? 'bg-purple-600 text-white shadow-xs font-black' : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Vinh danh</span>
                  </button>
                </div>

                {/* Academic Year Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Năm học:</span>
                  <select
                    value={volYearFilter}
                    onChange={(e) => setVolYearFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="all">Tất cả năm học ({volunteerMembers.length})</option>
                    {availableVolYears.map(y => {
                      const count = volunteerMembers.filter(m => (m.academicYear || '2025 - 2026') === y).length;
                      return (
                        <option key={y} value={y}>{y} ({count} chiến sĩ)</option>
                      );
                    })}
                  </select>
                </div>

                {/* Grade Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Khối:</span>
                  <select
                    value={volGradeFilter}
                    onChange={(e) => setVolGradeFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="all">Tất cả khối</option>
                    <option value="10">Khối 10</option>
                    <option value="11">Khối 11</option>
                    <option value="12">Khối 12</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-semibold">Lớp học:</span>
                  <select
                    value={volClassFilter}
                    onChange={(e) => setVolClassFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {availableVolClasses.map(c => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Volunteer Members Cards */}
            {filteredVolunteers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Chưa có đoàn viên nào theo điều kiện lọc</h4>
                <p className="text-xs text-slate-400">Vui lòng thử chọn bộ lọc khác.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVolunteers.map((member) => {
                  return (
                    <div
                      key={member.id}
                      className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                        member.isLeader
                          ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300'
                          : member.isHonored || member.status === 'honored'
                          ? 'border-purple-300 bg-purple-50/10'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          {/* Avatar */}
                          <StudentAvatar
                            fullName={member.fullName}
                            photoUrl={member.avatarUrl || member.honorPhoto}
                            size="lg"
                            rounded="full"
                            border="border-2 border-slate-200 shadow-xs shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <h3 className="text-base font-black text-slate-900 truncate">
                                {member.fullName}
                              </h3>
                              {member.isLeader && (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shrink-0" title="Cờ Thủ Lĩnh Đoàn">
                                  <span>🚩</span>
                                  <span>{member.leaderRole || 'Thủ Lĩnh'}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                Lớp {member.className}
                              </span>
                              <span>• {member.academicYear || '2026 - 2027'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Activities count & Skills */}
                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-slate-500">Đã tham gia phong trào:</span>
                          <span className="font-black text-red-600">
                            {member.activitiesCount ?? 0} hoạt động
                          </span>
                        </div>

                        {member.skills && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            ✨ {member.skills}
                          </p>
                        )}
                      </div>

                      {/* Admin controls */}
                      {isAdminLoggedIn && (
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-1">
                            {/* Toggle Leader Flag */}
                            <button
                              onClick={() => handleToggleMemberLeader(member)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                                member.isLeader
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800'
                              }`}
                              title={member.isLeader ? 'Thu hồi Cờ Thủ Lĩnh' : 'Trao Cờ Thủ Lĩnh Đoàn'}
                            >
                              <span>🚩</span>
                              <span>{member.isLeader ? 'Đã trao cờ' : 'Giao cờ'}</span>
                            </button>

                            {/* Honor member */}
                            <button
                              onClick={() => handleOpenHonorModal(member)}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Vinh danh trên Bảng Vàng"
                            >
                              <Award className="w-3.5 h-3.5 text-yellow-500" />
                              <span>Vinh danh</span>
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            {/* Edit Member */}
                            <button
                              onClick={() => handleOpenEditMemberModal(member)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa họ tên, lớp, năm học..."
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Dismiss / Delete Modal */}
                            <button
                              onClick={() => setTargetDismissMember({ id: member.id, name: member.fullName, isReg: false })}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Tạm dừng / Đã tốt nghiệp / Không tích cực"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3.5: CÂY HOẠT ĐỘNG & CÂY HÈ ================= */}
        {activeTab === 'tree' && (
          <VolunteerActivityTree
            volunteerMembers={volunteerMembers}
            volunteerAttendance={volunteerAttendance}
            selectedYear={currentSchoolYear}
            onYearChange={handleSetActiveYear}
            availableYears={availableAcademicYears}
            onOpenCertificate={(member) => setViewingCertificateMember(member)}
            isAdmin={isAdminLoggedIn}
          />
        )}

        {/* ================= TAB 4: BẢNG VÀNG VINH DANH ================= */}
        {activeTab === 'honors' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
                  <Award className="w-4 h-4 text-white" />
                  <span>TUYÊN DƯƠNG & KHEN THƯỞNG PHONG TRÀO</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  BẢNG VÀNG CHIẾN SĨ TÌNH NGUYỆN XUẤT SẮC
                </h2>
                <p className="text-xs sm:text-sm text-yellow-950 max-w-xl font-medium">
                  Vinh danh những đoàn viên tiêu biểu, các thủ lĩnh thanh niên gương mẫu đã cống hiến hết mình cho phong trào tuổi trẻ Trường THPT Ba Chúc trong từng niên khóa công bằng và độc lập.
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/50 text-center shadow-lg shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số vinh danh</p>
                <p className="text-3xl font-black text-amber-600">{allHonoredMembers.length} Chiến sĩ</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  {honorYearFilter === 'all' ? 'Tất cả niên khóa' : `Năm học ${honorYearFilter}`} ({filteredHonoredMembers.length} bạn)
                </p>
              </div>
            </div>

            {/* Memory & Sync Bar for Tab 4 */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-amber-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/30 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm sm:text-base font-black tracking-tight flex items-center space-x-2">
                      <span>BỘ NHỚ BẢNG VÀNG & VINH DANH HỌC SINH</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        🟢 5 TẦNG BỀN VỮNG
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Hệ thống lưu trữ tự động IndexedDB + Firestore + Server bảo vệ trọn vẹn danh sách <strong className="text-amber-300">152 chiến sĩ (2025 - 2026)</strong> và chứng nhận vinh danh.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsMemoryModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Quản lý bộ nhớ, kiểm tra sức khỏe và sao lưu"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Trung tâm Bộ nhớ</span>
                </button>
                <button
                  onClick={() => exportHonoredStudentsCSV(volunteerMembers)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Xuất danh sách vinh danh định dạng CSV / Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Xuất Bảng Vàng</span>
                </button>
                <button
                  onClick={() => exportVolunteerMemoryJSON()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Tải gói sao lưu toàn diện JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sao lưu JSON</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Year Selector Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-slate-500 mr-1 uppercase">Niên khóa:</span>
                  
                  {availableAcademicYears.map(year => {
                    const isSelected = honorYearFilter === year;
                    const countInYear = volunteerMembers.filter(m => (m.academicYear || '2025 - 2026') === year).length;
                    return (
                      <button
                        key={year}
                        onClick={() => setHonorYearFilter(year)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400 font-black'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{year === '2025 - 2026' ? `⭐ Năm học ${year}` : `Năm học ${year}`}</span>
                        {countInYear > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-900/10 text-[10px]">
                            {countInYear}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setHonorYearFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      honorYearFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400 font-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả năm học
                  </button>

                  <button
                    onClick={() => setIsYearManagerModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                    title="Cấu hình hoặc tạo năm học mới để độc lập điểm số"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Quản lý Niên Khóa</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* View Mode Toggle: Cards vs Table */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setHonorViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        honorViewMode === 'cards'
                          ? 'bg-white text-amber-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Thẻ Kỷ Yếu</span>
                    </button>
                    <button
                      onClick={() => setHonorViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        honorViewMode === 'table'
                          ? 'bg-white text-amber-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Sổ Vàng Tra Cứu</span>
                    </button>
                  </div>

                  {/* Quick Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={honorSearch}
                      onChange={(e) => setHonorSearch(e.target.value)}
                      placeholder="Tìm tên chiến sĩ, lớp, danh hiệu..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                    {honorSearch && (
                      <button
                        onClick={() => setHonorSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tier Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 mr-1">Mức độ cống hiến:</span>
                {[
                  { id: 'all', label: 'Tất cả mức độ' },
                  { id: 'top', label: '👑 Kiện tướng xuất sắc (≥ 20 hoạt động)' },
                  { id: 'excellent', label: '⭐ Chiến sĩ tiêu biểu (≥ 10 hoạt động)' },
                  { id: 'active', label: '🎖️ Tích cực (≥ 5 hoạt động)' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setHonorTierFilter(tier.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      honorTierFilter === tier.id
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TOP 3 PODIUM - If viewing without search */}
            {!honorSearch && honorTierFilter === 'all' && filteredHonoredMembers.length >= 3 && (
              <div className="bg-gradient-to-b from-amber-500/10 via-yellow-500/5 to-transparent p-6 rounded-3xl border border-amber-200/60 shadow-xs space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 text-xs font-black">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>TOP 3 CHIẾN SĨ DẪN ĐẦU PHONG TRÀO TÌNH NGUYỆN</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Bục Vinh Danh Gương Mặt Xuất Sắc Nhất {honorYearFilter === 'all' ? '' : `Năm Học ${honorYearFilter}`}
                  </h3>
                  <p className="text-xs text-slate-500">Nhấp vào bất kỳ chiến sĩ nào để mở Giấy Khen Điện Tử & Kỷ Yếu Vinh Danh</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Rank 2 (Left) */}
                  {filteredHonoredMembers[1] && (
                    <div 
                      onClick={() => setViewingCertificateMember(filteredHonoredMembers[1])}
                      className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-sm hover:shadow-md hover:border-slate-400 transition-all flex flex-col items-center text-center space-y-3 relative order-2 md:order-1 cursor-pointer group"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-[11px] font-black px-3 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <span>🥈 HẠNG 2</span>
                      </div>
                      <div className="mt-2 group-hover:scale-105 transition-transform">
                        <StudentAvatar
                          fullName={filteredHonoredMembers[1].fullName}
                          photoUrl={filteredHonoredMembers[1].honorPhoto || filteredHonoredMembers[1].avatarUrl}
                          size="xl"
                          border="border-4 border-slate-200 shadow-md"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">{filteredHonoredMembers[1].fullName}</h4>
                        <p className="text-xs font-bold text-slate-500">Chi đoàn {filteredHonoredMembers[1].className}</p>
                      </div>
                      <div className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-black">
                        ⭐ {filteredHonoredMembers[1].activitiesCount} hoạt động
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Xem Giấy Khen</span>
                      </span>
                    </div>
                  )}

                  {/* Rank 1 (Center) */}
                  {filteredHonoredMembers[0] && (
                    <div 
                      onClick={() => setViewingCertificateMember(filteredHonoredMembers[0])}
                      className="bg-gradient-to-b from-amber-100/90 to-white rounded-2xl p-5 border-2 border-amber-400 shadow-lg hover:shadow-xl hover:border-amber-500 transition-all flex flex-col items-center text-center space-y-3 relative order-1 md:order-2 md:-translate-y-2 cursor-pointer group"
                    >
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black px-3.5 py-0.5 rounded-full shadow-md flex items-center space-x-1 ring-2 ring-white">
                        <Crown className="w-3.5 h-3.5 text-amber-950" />
                        <span>👑 QUÁN QUÂN TOP 1</span>
                      </div>
                      <div className="mt-2 ring-4 ring-amber-200 rounded-full group-hover:scale-105 transition-transform">
                        <StudentAvatar
                          fullName={filteredHonoredMembers[0].fullName}
                          photoUrl={filteredHonoredMembers[0].honorPhoto || filteredHonoredMembers[0].avatarUrl}
                          size="2xl"
                          border="border-4 border-amber-400 shadow-xl"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-950 text-lg group-hover:text-amber-800 transition-colors">{filteredHonoredMembers[0].fullName}</h4>
                        <p className="text-xs font-black text-amber-700">Chi đoàn {filteredHonoredMembers[0].className}</p>
                      </div>
                      <div className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-full text-xs font-black shadow-sm">
                        ⭐ {filteredHonoredMembers[0].activitiesCount} hoạt động cống hiến
                      </div>
                      <span className="text-xs font-black text-slate-950 bg-amber-400 px-3 py-1 rounded-xl shadow-xs flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Xem Giấy Khen Quán Quân</span>
                      </span>
                    </div>
                  )}

                  {/* Rank 3 (Right) */}
                  {filteredHonoredMembers[2] && (
                    <div 
                      onClick={() => setViewingCertificateMember(filteredHonoredMembers[2])}
                      className="bg-white rounded-2xl p-4 border-2 border-amber-600/40 shadow-sm hover:shadow-md hover:border-amber-600 transition-all flex flex-col items-center text-center space-y-3 relative order-3 cursor-pointer group"
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <span>🥉 HẠNG 3</span>
                      </div>
                      <div className="mt-2 group-hover:scale-105 transition-transform">
                        <StudentAvatar
                          fullName={filteredHonoredMembers[2].fullName}
                          photoUrl={filteredHonoredMembers[2].honorPhoto || filteredHonoredMembers[2].avatarUrl}
                          size="xl"
                          border="border-4 border-amber-200 shadow-md"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base group-hover:text-amber-700 transition-colors">{filteredHonoredMembers[2].fullName}</h4>
                        <p className="text-xs font-bold text-slate-500">Chi đoàn {filteredHonoredMembers[2].className}</p>
                      </div>
                      <div className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-black border border-amber-200">
                        ⭐ {filteredHonoredMembers[2].activitiesCount} hoạt động
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Xem Giấy Khen</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* List of Honored Members Cards */}
            {filteredHonoredMembers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
                <Award className="w-12 h-12 text-amber-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Không tìm thấy chiến sĩ nào phù hợp</h4>
                <p className="text-xs text-slate-400">Vui lòng điều chỉnh lại từ khóa tìm kiếm hoặc niên khóa lọc.</p>
              </div>
            ) : honorViewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHonoredMembers.map((member, index) => {
                  const rankNumber = index + 1;
                  const isTop1 = rankNumber === 1;
                  const isTop2 = rankNumber === 2;
                  const isTop3 = rankNumber === 3;
                  const isTopTier = (member.activitiesCount || 0) >= 20;

                  return (
                    <div
                      key={member.id}
                      className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between relative group ${
                        isTop1 
                          ? 'border-amber-400 ring-2 ring-amber-300/60' 
                          : isTop2 
                          ? 'border-slate-300 ring-1 ring-slate-300' 
                          : isTop3 
                          ? 'border-amber-600/40 ring-1 ring-amber-600/30' 
                          : isTopTier 
                          ? 'border-amber-200' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div 
                        onClick={() => setViewingCertificateMember(member)}
                        className="relative h-64 bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
                      >
                        {member.honorPhoto || (member.avatarUrl && !member.avatarUrl.includes('unsplash.com/photo-1534528741775')) ? (
                          <img
                            src={member.honorPhoto || member.avatarUrl}
                            alt={member.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 space-y-3 group-hover:scale-105 transition-transform duration-500">
                            <StudentAvatar
                              fullName={member.fullName}
                              size="3xl"
                              rounded="full"
                              border="border-4 border-amber-400/40 shadow-2xl"
                            />
                            <span className="text-xs font-bold text-slate-300">Chiến sĩ tình nguyện THPT Ba Chúc</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                        
                        {/* Rank Badge */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1 ${
                            isTop1 
                              ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-200' 
                              : isTop2 
                              ? 'bg-slate-200 text-slate-900' 
                              : isTop3 
                              ? 'bg-amber-700 text-white' 
                              : 'bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-300/30'
                          }`}>
                            <span>#{rankNumber}</span>
                          </span>

                          <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                            <Award className="w-3 h-3" />
                            <span>{isTopTier ? 'Kiện Tướng' : 'Chiến Sĩ Tiêu Biểu'}</span>
                          </span>
                        </div>

                        {member.isLeader && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
                            <span>🚩</span>
                            <span>{member.leaderRole || 'Thủ Lĩnh'}</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                          <h3 className="text-lg font-black">{member.fullName}</h3>
                          <p className="text-xs text-amber-200 font-bold">
                            Chi đoàn {member.className} • Năm học {member.academicYear || '2025 - 2026'}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-100 leading-snug">
                          🏆 {member.honorTitle || 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện'}
                        </p>
                        
                        {member.notes && (
                          <p className="text-[11px] text-slate-500 italic line-clamp-2">
                            "{member.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 font-medium">Hoạt động tham gia:</span>
                          <span className="font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                            ⭐ {member.activitiesCount ?? 0} hoạt động
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setViewingCertificateMember(member)}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-slate-950" />
                            <span>Kỷ yếu & Giấy khen</span>
                          </button>
                          {isAdminLoggedIn && (
                            <button
                              onClick={() => handleOpenHonorModal(member)}
                              className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer border border-slate-200"
                              title="Chỉnh sửa thông tin vinh danh"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW: SỔ VÀNG KỶ YẾU TRA CỨU */
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-b border-amber-200 text-slate-900 font-black uppercase text-[11px] tracking-wider">
                        <th className="py-3.5 px-4 text-center w-16">Hạng</th>
                        <th className="py-3.5 px-4">Chiến Sĩ Tình Nguyện</th>
                        <th className="py-3.5 px-4">Chi Đoàn / Lớp</th>
                        <th className="py-3.5 px-4 text-center">Hoạt Động</th>
                        <th className="py-3.5 px-4">Danh Hiệu Tuyên Dương</th>
                        <th className="py-3.5 px-4">Niên Khóa</th>
                        <th className="py-3.5 px-4 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredHonoredMembers.map((member, index) => {
                        const rank = index + 1;
                        const isTop1 = rank === 1;
                        const isTop2 = rank === 2;
                        const isTop3 = rank === 3;
                        return (
                          <tr
                            key={member.id}
                            className={`hover:bg-amber-50/60 transition-colors ${
                              isTop1 ? 'bg-amber-50/70 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                                isTop1 ? 'bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-300' :
                                isTop2 ? 'bg-slate-200 text-slate-800' :
                                isTop3 ? 'bg-amber-700 text-white' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                #{rank}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div 
                                  onClick={() => setViewingCertificateMember(member)}
                                  className="cursor-pointer hover:scale-105 transition-transform shrink-0"
                                >
                                  <StudentAvatar
                                    fullName={member.fullName}
                                    photoUrl={member.honorPhoto || member.avatarUrl}
                                    size="sm"
                                    border="border-2 border-amber-300 shadow-xs"
                                  />
                                </div>
                                <div>
                                  <button
                                    onClick={() => setViewingCertificateMember(member)}
                                    className="font-black text-slate-900 text-sm hover:text-amber-700 transition-colors flex items-center space-x-1.5 cursor-pointer text-left"
                                  >
                                    <span>{member.fullName}</span>
                                    {member.isLeader && (
                                      <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">
                                        🚩 {member.leaderRole || 'Thủ lĩnh'}
                                      </span>
                                    )}
                                  </button>
                                  <div className="text-[11px] text-slate-400">
                                    Mã số: {member.code || member.id.slice(-6)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-700">
                              Chi đoàn {member.className}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-black text-xs border border-red-100">
                                ⭐ {member.activitiesCount ?? 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs inline-block">
                                🏆 {member.honorTitle || 'Học Sinh Tích Cực Trong Phong Trào'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-semibold">
                              {member.academicYear || '2025 - 2026'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => setViewingCertificateMember(member)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                                  title="Xem & Tải Giấy Khen Điện Tử"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Giấy khen</span>
                                </button>
                                {isAdminLoggedIn && (
                                  <button
                                    onClick={() => handleOpenHonorModal(member)}
                                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-all cursor-pointer"
                                    title="Chỉnh sửa vinh danh"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: ĐIỂM DANH & BẢNG THÀNH TÍCH ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-8">
            {/* 1. Form Điểm danh */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">ĐIỂM DANH HOẠT ĐỘNG ĐOÀN TRƯỜNG</h3>
                  <p className="text-xs text-slate-500">Ghi nhận sự tham gia tích cực để tích lũy điểm rèn luyện và xét vinh danh đoàn viên.</p>
                </div>
              </div>

              {attSavedToast && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Đã ghi nhận điểm danh hoạt động thành công vào hệ thống!</span>
                </div>
              )}

              <form onSubmit={handleAddAttendanceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên học sinh <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={attFullName}
                      onChange={(e) => setAttFullName(e.target.value)}
                      placeholder="Ví dụ: Lê Văn A"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={attClassName}
                      onChange={(e) => setAttClassName(e.target.value)}
                      placeholder="Ví dụ: 10A1"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên hoạt động / phong trào <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={attActivityName}
                    onChange={(e) => setAttActivityName(e.target.value)}
                    placeholder="Ví dụ: Chủ nhật Xanh, Tiếp sức mùa thi, Ngày hội Đoàn viên..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày tham gia
                    </label>
                    <input
                      type="date"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa điểm
                    </label>
                    <input
                      type="text"
                      value={attLocation}
                      onChange={(e) => setAttLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md transition cursor-pointer text-sm flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XÁC NHẬN ĐIỂM DANH HOẠT ĐỘNG</span>
                </button>
              </form>
            </div>

            {/* 2. BẢNG THÀNH TÍCH ĐOÀN VIÊN & SỐ LƯỢT ĐIỂM DANH */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black">
                    <Trophy className="w-3.5 h-3.5 text-red-600" />
                    <span>BẢNG THÀNH TÍCH ĐOÀN VIÊN CHI ĐOÀN</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    BẢNG THÀNH TÍCH & SỐ LƯỢT ĐIỂM DANH HOẠT ĐỘNG ĐOÀN
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thống kê đầy đủ tên đoàn viên, chi đoàn và số lượt điểm danh khi tham gia hoạt động Đoàn trường THPT Ba Chúc.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportVolunteersCSV(volunteerMembers)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center space-x-2 shadow-xs transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Xuất File Excel</span>
                  </button>
                </div>
              </div>

              {/* Search Bar for Leaderboard */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    placeholder="Tìm theo họ tên đoàn viên hoặc lớp/chi đoàn..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:border-red-500"
                  />
                </div>
                {attendanceSearch && (
                  <button
                    onClick={() => setAttendanceSearch('')}
                    className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Xóa tìm
                  </button>
                )}
              </div>

              {/* Full Leaderboard Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5 text-center w-12">STT</th>
                      <th className="p-3.5">Đoàn viên</th>
                      <th className="p-3.5">Chi đoàn (Lớp)</th>
                      <th className="p-3.5 text-center">Số lượt điểm danh</th>
                      <th className="p-3.5">Danh hiệu / Vai trò</th>
                      <th className="p-3.5 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {deduplicatedVolunteersWithAttendance
                      .filter(({ member }) => {
                        if (!attendanceSearch.trim()) return true;
                        const q = attendanceSearch.toLowerCase().trim();
                        return (
                          member.fullName.toLowerCase().includes(q) ||
                          member.className.toLowerCase().includes(q) ||
                          (member.phone && member.phone.includes(q))
                        );
                      })
                      .map(({ member, actualCount: count }, index) => {
                        return (
                          <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 text-center font-black text-slate-400">
                              {index + 1}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 aspect-square">
                                  <img
                                    src={member.avatarUrl || member.honorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                                    alt={member.fullName}
                                    className="w-full h-full object-cover object-center"
                                  />
                                </div>
                                <div>
                                  <div className="font-black text-slate-900">{member.fullName}</div>
                                  <div className="text-[11px] text-slate-400 font-normal">
                                    {member.academicYear || '2026 - 2027'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                Lớp {member.className}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full font-black text-xs border ${
                                count > 0 
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {count > 0 && <Flame className="w-3.5 h-3.5 text-indigo-600" />}
                                <span>{count} lượt{count === 0 ? ' (chưa điểm danh)' : ''}</span>
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="space-y-1">
                                {member.isLeader && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black mr-1.5 shadow-2xs">
                                    <span>🚩</span>
                                    <span>{member.leaderRole || 'Thủ lĩnh'}</span>
                                  </span>
                                )}
                                {member.isHonored || member.status === 'honored' || count >= 5 ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                                    <Award className="w-3 h-3 text-purple-600" />
                                    <span>Đoàn viên tiêu biểu</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">Đoàn viên tích cực</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                Chính thức
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: TRA CỨU XÉT DUYỆT ================= */}
        {activeTab === 'lookup' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  TRA CỨU KẾT QUẢ ĐĂNG KÝ ĐOÀN
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập Họ và tên hoặc Số điện thoại để kiểm tra trạng thái hồ sơ của bạn.
                </p>
              </div>

              <form onSubmit={handleLookup} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={lookupKeyword}
                  onChange={(e) => setLookupKeyword(e.target.value)}
                  placeholder="Nhập họ và tên hoặc số điện thoại..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm shadow-md transition cursor-pointer"
                >
                  Tra cứu
                </button>
              </form>

              {/* Lookup Result Display */}
              {lookupResult === 'not_found' && (
                <div className="p-5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs sm:text-sm font-bold text-center space-y-1 animate-in fade-in">
                  <p>Không tìm thấy hồ sơ đăng ký với thông tin này.</p>
                  <p className="text-slate-500 font-normal text-xs">
                    Vui lòng kiểm tra lại họ tên hoặc số điện thoại, hoặc quay lại tab Đăng ký để gửi hồ sơ mới.
                  </p>
                </div>
              )}

              {lookupResult && lookupResult !== 'not_found' && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 animate-in zoom-in-95 shadow-sm">
                  {('status' in lookupResult && (lookupResult.status === 'accepted' || lookupResult.status === 'approved' || lookupResult.status === 'active' || lookupResult.status === 'honored')) || ('activitiesCount' in lookupResult) ? (
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                          Đoàn viên chính thức
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black text-emerald-700">
                          Bạn chính thức là thành viên của Đoàn Trường THPT Ba Chúc
                        </h4>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Họ và tên:</span>
                          <span className="font-black text-slate-900">{lookupResult.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Chi đoàn / Lớp:</span>
                          <span className="font-black text-red-600">{lookupResult.className}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500">Năm học:</span>
                          <span className="font-bold text-slate-700">{lookupResult.academicYear || '2026 - 2027'}</span>
                        </div>
                        {'activitiesCount' in lookupResult && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Số lượt tham gia hoạt động:</span>
                            <span className="font-black text-indigo-600">{(lookupResult as VolunteerMember).activitiesCount ?? 0} lượt</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                        <Clock className="w-10 h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase">
                          Hồ sơ đang chờ duyệt
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black text-amber-700">
                          Bạn vui lòng chờ duyệt
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                          Hồ sơ của <strong>{lookupResult.fullName}</strong> (Lớp {lookupResult.className}) đã được gửi lên hệ thống. Ban Chấp Hành Đoàn Trường đang xem xét phê duyệt.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 7: BIỂU ĐỒ & THỐNG KÊ ĐOÀN ================= */}
        {activeTab === 'charts' && (
          <YouthChartsView
            volunteerMembers={volunteerMembers}
            registrations={registrations}
            attendance={volunteerAttendance}
          />
        )}

        {/* ================= MODAL: CHỈNH SỬA HỒ SƠ ĐĂNG KÝ (FOR ADMIN) ================= */}
        {editingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 my-6">
              <button
                onClick={() => setEditingReg(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-2xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">CHỈNH SỬA HỒ SƠ ĐOÀN VIÊN ĐĂNG KÝ</h3>
                  <p className="text-xs text-slate-500">Cập nhật họ tên, lớp, năm học và cờ thủ lĩnh</p>
                </div>
              </div>

              <form onSubmit={handleSaveRegEdit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editRegName}
                    onChange={(e) => setEditRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editRegClass}
                      onChange={(e) => setEditRegClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Năm học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editRegYear}
                      onChange={(e) => setEditRegYear(e.target.value)}
                      placeholder="2026 - 2027"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editRegPhone}
                      onChange={(e) => setEditRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Trạng thái xét duyệt
                    </label>
                    <select
                      value={editRegStatus}
                      onChange={(e) => setEditRegStatus(e.target.value as YouthRegistration['status'])}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 font-bold"
                    >
                      <option value="pending">Chờ duyệt (Đang xem xét)</option>
                      <option value="accepted">Đã duyệt (Chính thức)</option>
                    </select>
                  </div>
                </div>

                {/* Leader Flag Assignment */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🚩</span>
                      <span className="font-bold text-amber-900">Giao Cờ Thủ Lĩnh Đoàn</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editRegIsLeader}
                      onChange={(e) => setEditRegIsLeader(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {editRegIsLeader && (
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        Chức danh / Trách vụ thủ lĩnh:
                      </label>
                      <input
                        type="text"
                        value={editRegLeaderRole}
                        onChange={(e) => setEditRegLeaderRole(e.target.value)}
                        placeholder="Ví dụ: Bí thư Chi đoàn, Đội trưởng Xung kích..."
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ghi chú / Kỹ năng
                  </label>
                  <textarea
                    rows={2}
                    value={editRegSkills}
                    onChange={(e) => setEditRegSkills(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingReg(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: CHỈNH SỬA ĐOÀN THANH NIÊN TÌNH NGUYỆN (FOR ADMIN) ================= */}
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 my-6">
              <button
                onClick={() => setEditingMember(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-2xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">CHỈNH SỬA ĐOÀN VIÊN TÌNH NGUYỆN</h3>
                  <p className="text-xs text-slate-500">Cập nhật họ tên, lớp, năm học, số lần hoạt động và cờ thủ lĩnh</p>
                </div>
              </div>

              <form onSubmit={handleSaveMemberEdit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editMemberName}
                    onChange={(e) => setEditMemberName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editMemberClass}
                      onChange={(e) => setEditMemberClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Năm học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editMemberYear}
                      onChange={(e) => setEditMemberYear(e.target.value)}
                      placeholder="2026 - 2027"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số lần tham gia hoạt động
                    </label>
                    <input
                      type="number"
                      value={editMemberCount}
                      onChange={(e) => setEditMemberCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Trạng thái hoạt động
                    </label>
                    <select
                      value={editMemberStatus}
                      onChange={(e) => setEditMemberStatus(e.target.value as VolunteerStatus)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500 font-bold"
                    >
                      <option value="active">Đang hoạt động tích cực</option>
                      <option value="honored">Được vinh danh Bảng Vàng</option>
                      <option value="graduated_12">Đã tốt nghiệp lớp 12 (Cấp 3)</option>
                      <option value="inactive_low_performance">Sức học giảm sút (Tạm dừng)</option>
                      <option value="inactive_rules_violation">Không tích cực / Vi phạm nội quy</option>
                    </select>
                  </div>
                </div>

                {/* Leader Flag Assignment */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🚩</span>
                      <span className="font-bold text-amber-900">Giao Cờ Thủ Lĩnh Đội Tình Nguyện</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editMemberIsLeader}
                      onChange={(e) => setEditMemberIsLeader(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {editMemberIsLeader && (
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        Chức vụ thủ lĩnh:
                      </label>
                      <input
                        type="text"
                        value={editMemberLeaderRole}
                        onChange={(e) => setEditMemberLeaderRole(e.target.value)}
                        placeholder="Ví dụ: Đội trưởng Tình nguyện, Đội phó Xung kích..."
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ảnh đại diện đoàn viên
                  </label>
                  <label className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{isCompressingMemberAvatar ? 'Đang nén ảnh...' : 'Chọn ảnh mới từ máy tính'}</span>
                    <input
                      type="file"
                      accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                      onChange={handleMemberAvatarUpload}
                      className="hidden"
                      disabled={isCompressingMemberAvatar}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: THÊM ĐOÀN VIÊN MỚI TRỰC TIẾP (FOR ADMIN) ================= */}
        {isAddingNewMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 my-6">
              <button
                onClick={() => setIsAddingNewMember(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-2xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">THÊM ĐOÀN VIÊN TÌNH NGUYỆN MỚI</h3>
                  <p className="text-xs text-slate-500">Thêm trực tiếp vào danh sách đội thanh niên tình nguyện</p>
                </div>
              </div>

              <form onSubmit={handleAddNewMemberSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Ví dụ: Lê Văn A"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newMemberClass}
                      onChange={(e) => setNewMemberClass(e.target.value)}
                      placeholder="Ví dụ: 11A2"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Năm học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newMemberYear}
                      onChange={(e) => setNewMemberYear(e.target.value)}
                      placeholder="2026 - 2027"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số lần tham gia
                    </label>
                    <input
                      type="number"
                      value={newMemberCount}
                      onChange={(e) => setNewMemberCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Leader assignment */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🚩</span>
                      <span className="font-bold text-amber-900">Giao Cờ Thủ Lĩnh</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={newMemberIsLeader}
                      onChange={(e) => setNewMemberIsLeader(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {newMemberIsLeader && (
                    <div>
                      <input
                        type="text"
                        value={newMemberLeaderRole}
                        onChange={(e) => setNewMemberLeaderRole(e.target.value)}
                        placeholder="Chức vụ thủ lĩnh..."
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewMember(false)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Vào Danh Sách</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: DISMISS / REASON REMOVAL (FOR ADMIN) ================= */}
        {targetDismissMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95">
              <button
                onClick={() => setTargetDismissMember(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">XÁC NHẬN ĐIỀU CHỈNH / TẠM DỪNG</h3>
                  <p className="text-xs text-slate-500">Học sinh: {targetDismissMember.name}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <label className="block font-bold text-slate-700">
                  Chọn lý do điều chỉnh học sinh:
                </label>

                <div className="space-y-2">
                  <label className={`p-3 rounded-2xl border flex items-start space-x-3 cursor-pointer transition ${
                    dismissReasonChoice === 'inactive_low_performance' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="dismissReason"
                      checked={dismissReasonChoice === 'inactive_low_performance'}
                      onChange={() => setDismissReasonChoice('inactive_low_performance')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Sức học giảm sút</p>
                      <p className="text-[11px] text-slate-500">Tạm dừng hoạt động đoàn để học sinh tập trung cải thiện kết quả học tập.</p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border flex items-start space-x-3 cursor-pointer transition ${
                    dismissReasonChoice === 'inactive_rules_violation' ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="dismissReason"
                      checked={dismissReasonChoice === 'inactive_rules_violation'}
                      onChange={() => setDismissReasonChoice('inactive_rules_violation')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Không tích cực / Vi phạm nội quy</p>
                      <p className="text-[11px] text-slate-500">Không nghiêm túc, vắng mặt nhiều buổi không lý do.</p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border flex items-start space-x-3 cursor-pointer transition ${
                    dismissReasonChoice === 'graduated_12' ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="dismissReason"
                      checked={dismissReasonChoice === 'graduated_12'}
                      onChange={() => setDismissReasonChoice('graduated_12')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Đã hoàn thành học sinh cấp 3</p>
                      <p className="text-[11px] text-slate-500">Tốt nghiệp THPT lớp 12 và chuyển sinh hoạt đoàn.</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ghi chú chi tiết thêm:
                  </label>
                  <input
                    type="text"
                    value={dismissCustomNote}
                    onChange={(e) => setDismissCustomNote(e.target.value)}
                    placeholder="Ghi chú cụ thể..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleConfirmDismiss('remove_completely')}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa vĩnh viễn khỏi danh sách</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setTargetDismissMember(null)}
                      className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmDismiss('change_status')}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                    >
                      Lưu lý do & Tạm dừng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: VINH DANH BẢNG VÀNG (FOR ADMIN) ================= */}
        {selectedHonorMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 my-6">
              <button
                onClick={() => setSelectedHonorMember(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">VINH DANH HỌC SINH TÍCH CỰC</h3>
                  <p className="text-xs text-slate-500">Đưa lên Bảng Vàng vinh danh toàn trường</p>
                </div>
              </div>

              <form onSubmit={handleSaveHonor} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên học sinh
                  </label>
                  <input
                    type="text"
                    required
                    value={honorStudentName}
                    onChange={(e) => setHonorStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp học
                  </label>
                  <input
                    type="text"
                    required
                    value={honorStudentClass}
                    onChange={(e) => setHonorStudentClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh hiệu vinh danh
                  </label>
                  <input
                    type="text"
                    required
                    value={honorTitleText}
                    onChange={(e) => setHonorTitleText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ảnh vinh danh / kỷ niệm (Tự động nén):
                  </label>
                  <label className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{isCompressingHonor ? 'Đang nén ảnh...' : 'Tải ảnh từ máy tính'}</span>
                    <input
                      type="file"
                      accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                      onChange={handleHonorPhotoUpload}
                      className="hidden"
                      disabled={isCompressingHonor}
                    />
                  </label>
                  {honorPhotoUrl && (
                    <img
                      src={honorPhotoUrl}
                      alt="Preview"
                      className="h-24 w-24 object-cover rounded-xl mt-2 border"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedHonorMember(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Vinh Danh Bảng Vàng</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* HONOR MEMORY CERTIFICATE MODAL */}
        {viewingCertificateMember && (
          <HonorMemoryCertificateModal
            member={viewingCertificateMember}
            onClose={() => setViewingCertificateMember(null)}
            isAdmin={isAdminLoggedIn}
            onEditHonor={(m) => handleOpenHonorModal(m)}
            onUpdateMemberPhoto={(memberId, photoUrl) => {
              if (onUpdateVolunteerMember) {
                onUpdateVolunteerMember(memberId, { honorPhoto: photoUrl });
              }
              if (viewingCertificateMember && viewingCertificateMember.id === memberId) {
                setViewingCertificateMember({
                  ...viewingCertificateMember,
                  honorPhoto: photoUrl
                });
              }
            }}
          />
        )}

        {/* MEMORY MANAGEMENT CENTER MODAL */}
        {isMemoryModalOpen && (
          <MemoryManagementModal
            isOpen={isMemoryModalOpen}
            onClose={() => setIsMemoryModalOpen(false)}
            volunteerMembers={volunteerMembers}
            onUpdateVolunteerMembers={(updated) => {
              if (onUpdateVolunteerMembersBulk) {
                onUpdateVolunteerMembersBulk(updated);
              }
            }}
          />
        )}

        {/* ACADEMIC YEAR & SUMMER CAMPAIGN MANAGER MODAL */}
        {isYearManagerModalOpen && (
          <AcademicYearManagerModal
            isOpen={isYearManagerModalOpen}
            onClose={() => setIsYearManagerModalOpen(false)}
            availableYears={availableAcademicYears}
            currentActiveYear={currentSchoolYear}
            onSaveYearsList={handleSaveYearsList}
            onSetActiveYear={handleSetActiveYear}
            onInitializeNewYear={handleInitializeNewYear}
          />
        )}
      </div>
    </div>
  );
};
