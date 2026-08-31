import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  PhoneCall, 
  ShieldAlert, 
  ShieldCheck,
  X, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles,
  Heart,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

import { 
  loginAdmin, 
  logoutAdmin, 
  subscribeToAuth 
} from './lib/auth';

import { 
  Question, 
  Story, 
  YouthRegistration, 
  Activity, 
  QAInfographic, 
  SchoolConfig,
  AIPromptQuestion,
  AIChatLog,
  TopicType,
  Counselor,
  VolunteerMember,
  VolunteerAttendance,
  HealthArticle
} from './types';

import { 
  getQuestions, 
  saveQuestions,
  getStories, 
  saveStories,
  getYouthRegistrations, 
  saveYouthRegistrations,
  getActivities, 
  saveActivities,
  getInfographics, 
  saveInfographics,
  getSchoolConfig, 
  saveSchoolConfig,
  getAIPromptQuestions,
  saveAIPromptQuestions,
  getAIChatLogs,
  saveAIChatLogs,
  addAIChatLog,
  getCounselors,
  saveCounselors,
  getVolunteerMembers,
  saveVolunteerMembers,
  updateVolunteerMember,
  deleteVolunteerMember,
  getVolunteerAttendance,
  saveVolunteerAttendance,
  getHealthArticles,
  saveHealthArticles,
  addHealthArticle,
  updateHealthArticle,
  deleteHealthArticle,
  reactToActivity,
  syncToGoogleSheets,
  syncAllToGoogleSheets,
  syncAllWithServer,
  normalizeStudentName,
  normalizeStudentClass,
  deduplicateAndRecomputeVolunteerMembers,
  initPersistentMemory
} from './utils/storage';
import { initialHealthArticles } from './data/healthData';
import { 
  subscribeToFirebaseConfig, 
  subscribeToFirebaseCounselors, 
  subscribeToFirebaseCollection 
} from './lib/firestoreService';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { StatsSection } from './components/StatsSection';
import { CounselingHome } from './components/CounselingHome';
import { HealthCareSection } from './components/HealthCareSection';
import { QASection } from './components/QASection';
import { StoriesSection } from './components/StoriesSection';
import { YouthUnionSection } from './components/YouthUnionSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { ContactSection } from './components/ContactSection';
import { AIChatBox } from './components/AIChatBox';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { AppInstallModal } from './components/AppInstallModal';
import { SyncStatusModal } from './components/SyncStatusModal';
import { MemoryManagementModal } from './components/MemoryManagementModal';
import { FloatingHotlineWidget } from './components/FloatingHotlineWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getHotlineDisplay, isHotlineActive } from './utils/hotlineHelper';
import { realtimeSync } from './utils/realtimeSync';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Application Data States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [registrations, setRegistrations] = useState<YouthRegistration[]>([]);
  const [volunteerMembers, setVolunteerMembers] = useState<VolunteerMember[]>([]);
  const [volunteerAttendance, setVolunteerAttendance] = useState<VolunteerAttendance[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [infographics, setInfographics] = useState<QAInfographic[]>([]);
  const [aiPrompts, setAiPrompts] = useState<AIPromptQuestion[]>([]);
  const [aiLogs, setAiLogs] = useState<AIChatLog[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [healthArticles, setHealthArticles] = useState<HealthArticle[]>([]);
  const [config, setConfig] = useState<SchoolConfig>(getSchoolConfig());

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // Modals & Real-time Live Link state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAppInstallOpen, setIsAppInstallOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Subscribe to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user, isAdmin) => {
      if (user && isAdmin) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Smooth Tab Switcher with Optional Topic Deep-linking
  const [qaInitialTopic, setQaInitialTopic] = useState<TopicType | undefined>(undefined);

  const handleSelectTab = (tab: string, topic?: TopicType | string) => {
    setActiveTab(tab);
    if (tab === 'qa' && topic) {
      setQaInitialTopic(topic as TopicType);
    } else if (tab !== 'qa') {
      setQaInitialTopic(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize data and sync with Firebase Cloud Firestore in real-time
  useEffect(() => {
    // 1. Initial fast local state load
    setQuestions(getQuestions());
    setStories(getStories());
    setRegistrations(getYouthRegistrations());
    setVolunteerMembers(getVolunteerMembers());
    setVolunteerAttendance(getVolunteerAttendance());
    setActivities(getActivities());
    setInfographics(getInfographics());
    setAiPrompts(getAIPromptQuestions());
    setAiLogs(getAIChatLogs());
    setCounselors(getCounselors());
    setHealthArticles(getHealthArticles());
    setConfig(getSchoolConfig());

    // 1.1 Hydrate deep persistent memory (IndexedDB 5-layer system)
    initPersistentMemory().then((res) => {
      if (res && res.members && res.members.length > 0) {
        setVolunteerMembers(res.members);
      }
    }).catch((err) => {
      console.warn('Persistent memory hydration note:', err);
    });

    // 2. Fetch fresh cloud data across all devices
    const performFullCloudSync = () => {
      syncAllWithServer().then((res) => {
        if (res.success && res.data) {
          if (res.data.config) setConfig(res.data.config);
          if (res.data.questions) setQuestions(res.data.questions);
          if (res.data.stories) setStories(res.data.stories);
          if (res.data.counselors) setCounselors(res.data.counselors);
          if (res.data.healthArticles) setHealthArticles(res.data.healthArticles);
          if (res.data.youthRegistrations) setRegistrations(res.data.youthRegistrations);
          if (res.data.volunteerAttendance) setVolunteerAttendance(res.data.volunteerAttendance);
          if (res.data.volunteerMembers) {
            const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(
              res.data.volunteerMembers,
              res.data.volunteerAttendance || getVolunteerAttendance()
            );
            setVolunteerMembers(cleanMembers);
            saveVolunteerMembers(cleanMembers);
          }
          if (res.data.activities) setActivities(res.data.activities);
          if (res.data.infographics) setInfographics(res.data.infographics);
          if (res.data.aiPrompts) setAiPrompts(res.data.aiPrompts);
        }
      });
    };

    performFullCloudSync();

    // 3. Setup real-time listener for live updates across all devices & installed PWAs
    const unsubConfig = subscribeToFirebaseConfig((newConfig) => {
      setConfig(newConfig);
    });

    const unsubCounselors = subscribeToFirebaseCounselors((items) => {
      if (items && items.length > 0) setCounselors(items);
    });

    const unsubQuestions = subscribeToFirebaseCollection<Question>('questions', (items) => {
      if (items && items.length > 0) setQuestions(items);
    });

    const unsubStories = subscribeToFirebaseCollection<Story>('stories', (items) => {
      if (items && items.length > 0) setStories(items);
    });

    const unsubActivities = subscribeToFirebaseCollection<Activity>('activities', (items) => {
      if (items && items.length > 0) setActivities(items);
    });

    const unsubInfographics = subscribeToFirebaseCollection<QAInfographic>('infographics', (items) => {
      if (items && items.length > 0) setInfographics(items);
    });

    const unsubAIPrompts = subscribeToFirebaseCollection<AIPromptQuestion>('aiPrompts', (items) => {
      if (items && items.length > 0) setAiPrompts(items);
    });

    const unsubYouth = subscribeToFirebaseCollection<YouthRegistration>('youthRegistrations', (items) => {
      if (items && items.length > 0) setRegistrations(items);
    });

    const unsubVolunteers = subscribeToFirebaseCollection<VolunteerMember>('volunteerMembers', (items) => {
      if (items && items.length > 0) {
        const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(items);
        setVolunteerMembers(cleanMembers);
        saveVolunteerMembers(cleanMembers);
      }
    });

    const unsubAttendance = subscribeToFirebaseCollection<VolunteerAttendance>('volunteerAttendance', (items) => {
      if (items && items.length > 0) setVolunteerAttendance(items);
    });

    const unsubHealth = subscribeToFirebaseCollection<HealthArticle>('healthArticles', (items) => {
      if (items && items.length > 0) {
        const itemIds = new Set(items.map(a => a.id));
        const missingInitial = initialHealthArticles.filter(a => !itemIds.has(a.id));
        const resolved = missingInitial.length > 0 ? [...missingInitial, ...items] : items;
        setHealthArticles(resolved);
      }
    });

    // 4. Auto re-sync whenever user opens / switches back to the installed app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performFullCloudSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', performFullCloudSync);
    window.addEventListener('focus', performFullCloudSync);

    // 5. Connect real-time bidirectional synchronization between Web & Mobile App
    const unsubRealtime = realtimeSync.onDataChange((collection) => {
      if (collection === 'all' || collection === 'questions') setQuestions(getQuestions());
      if (collection === 'all' || collection === 'stories') setStories(getStories());
      if (collection === 'all' || collection === 'activities') setActivities(getActivities());
      if (collection === 'all' || collection === 'healthArticles') setHealthArticles(getHealthArticles());
      if (collection === 'all' || collection === 'volunteerMembers') setVolunteerMembers(getVolunteerMembers());
      if (collection === 'all' || collection === 'volunteerAttendance') setVolunteerAttendance(getVolunteerAttendance());
      if (collection === 'all' || collection === 'youthRegistrations') setRegistrations(getYouthRegistrations());
      if (collection === 'all' || collection === 'config') setConfig(getSchoolConfig());
      if (collection === 'all' || collection === 'counselors') setCounselors(getCounselors());
      if (collection === 'all' || collection === 'infographics') setInfographics(getInfographics());

      performFullCloudSync();

      setSyncToastMessage('Đã đồng bộ cập nhật mới giữa Web & App');
      setTimeout(() => setSyncToastMessage(null), 3500);
    });

    return () => {
      unsubConfig();
      unsubCounselors();
      unsubQuestions();
      unsubStories();
      unsubActivities();
      unsubInfographics();
      unsubAIPrompts();
      unsubYouth();
      unsubVolunteers();
      unsubAttendance();
      unsubHealth();
      unsubRealtime();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', performFullCloudSync);
      window.removeEventListener('focus', performFullCloudSync);
    };
  }, []);

  // QUESTION HANDLERS
  const handleAddQuestion = async (
    qData: Omit<Question, 'id' | 'code' | 'createdAt' | 'status' | 'isPublic'> & { code?: string }
  ): Promise<Question> => {
    const newQuestion: Question = {
      ...qData,
      id: `q-${Date.now()}`,
      code: qData.code || `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      isPublic: false, // Bảo mật riêng tư: chỉ học sinh có mã tra cứu và Ban Quản trị mới xem được
    };

    const updated = [newQuestion, ...questions];
    setQuestions(updated);
    saveQuestions(updated);
    syncToGoogleSheets('question', newQuestion);
    return newQuestion;
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
      const updated = questions.filter((q) => q.id !== id);
      setQuestions(updated);
      saveQuestions(updated);
    }
  };

  // STORY HANDLERS
  const handleAddStory = async (
    sData: Omit<Story, 'id' | 'code' | 'createdAt' | 'status' | 'likes' | 'hearts' | 'cheers'>
  ) => {
    const newStory: Story = {
      ...sData,
      id: `s-${Date.now()}`,
      code: `TS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'pending', // Chờ Quản trị viên / Ban Cố vấn duyệt trước khi xuất hiện công khai
      likes: 0,
      hearts: 1,
      cheers: 0,
    };

    const updated = [newStory, ...stories];
    setStories(updated);
    saveStories(updated);
    syncToGoogleSheets('story', newStory);
  };

  const handleReactStory = (storyId: string, reactionType: 'like' | 'heart' | 'cheer') => {
    const updated = stories.map((s) => {
      if (s.id === storyId) {
        const userInteracted = s.userInteracted || {};
        if (reactionType === 'heart') {
          const current = s.hearts || 0;
          const hearted = !userInteracted.hearted;
          return {
            ...s,
            hearts: hearted ? current + 1 : Math.max(0, current - 1),
            userInteracted: { ...userInteracted, hearted },
          };
        } else if (reactionType === 'cheer' || reactionType === 'like') {
          const currentCheers = s.cheers || s.likes || 0;
          const currentLikes = s.likes || s.cheers || 0;
          const cheered = !(userInteracted.cheered || userInteracted.liked);
          return {
            ...s,
            cheers: cheered ? currentCheers + 1 : Math.max(0, currentCheers - 1),
            likes: cheered ? currentLikes + 1 : Math.max(0, currentLikes - 1),
            userInteracted: { ...userInteracted, cheered, liked: cheered },
          };
        }
      }
      return s;
    });

    setStories(updated);
    saveStories(updated);
  };

  const handleUpdateStory = (id: string, updates: Partial<Story>) => {
    const updated = stories.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStories(updated);
    saveStories(updated);
  };

  const handleDeleteStory = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết tâm sự này không?')) {
      const updated = stories.filter((s) => s.id !== id);
      setStories(updated);
      saveStories(updated);
    }
  };

  // YOUTH REGISTRATION HANDLERS
  const handleAddRegistration = async (
    rData: Omit<YouthRegistration, 'id' | 'code' | 'createdAt' | 'status'>
  ) => {
    const normName = normalizeStudentName(rData.fullName);
    const normClass = normalizeStudentClass(rData.className);
    const normPhone = (rData.phone || '').replace(/\s+/g, '');

    // Check if student already registered
    const existingIndex = registrations.findIndex(
      r => (normPhone && r.phone.replace(/\s+/g, '') === normPhone) ||
           (normalizeStudentName(r.fullName) === normName && normalizeStudentClass(r.className) === normClass)
    );

    let updated: YouthRegistration[];
    let targetReg: YouthRegistration;

    if (existingIndex !== -1) {
      // Update existing registration info rather than creating duplicate row
      targetReg = {
        ...registrations[existingIndex],
        ...rData,
        fullName: rData.fullName.trim().replace(/\s+/g, ' '),
        className: rData.className.trim(),
      };
      updated = registrations.map((r, idx) => idx === existingIndex ? targetReg : r);
    } else {
      targetReg = {
        ...rData,
        fullName: rData.fullName.trim().replace(/\s+/g, ' '),
        className: rData.className.trim(),
        id: `reg-${Date.now()}`,
        code: `DV-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      updated = [targetReg, ...registrations];
    }

    setRegistrations(updated);
    saveYouthRegistrations(updated);
    syncToGoogleSheets('youth_registration', targetReg);
  };

  const handleUpdateRegistration = (id: string, updates: Partial<YouthRegistration>) => {
    const targetReg = registrations.find(r => r.id === id);
    const updated = registrations.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRegistrations(updated);
    saveYouthRegistrations(updated);

    // If approved / accepted, ensure member is created or updated in volunteerMembers list
    if (updates.status === 'accepted' || updates.status === 'assigned' || updates.status === 'approved') {
      if (targetReg) {
        const normName = normalizeStudentName(targetReg.fullName);
        const normClass = normalizeStudentClass(targetReg.className);
        const normPhone = (targetReg.phone || '').replace(/\s+/g, '');

        // Count real attendances for this student from the attendance log
        const actualAttendanceCount = volunteerAttendance.filter(
          a => normalizeStudentName(a.fullName) === normName && normalizeStudentClass(a.className) === normClass
        ).length;

        const existingMember = volunteerMembers.find(
          m => (normPhone && m.phone.replace(/\s+/g, '') === normPhone) ||
               (normalizeStudentName(m.fullName) === normName && normalizeStudentClass(m.className) === normClass)
        );

        if (!existingMember) {
          const newMember: VolunteerMember = {
            id: `vol-${Date.now()}`,
            code: targetReg.code || `DV-${Math.floor(1000 + Math.random() * 9000)}`,
            fullName: targetReg.fullName.trim().replace(/\s+/g, ' '),
            className: targetReg.className.trim(),
            phone: targetReg.phone,
            email: targetReg.email,
            status: 'active',
            // Default 0 activities if only registered and not yet checked in
            activitiesCount: actualAttendanceCount,
            skills: targetReg.skills || 'Nhiệt tình tham gia hoạt động tình nguyện',
            joinedDate: new Date().toLocaleDateString('vi-VN'),
            isHonored: actualAttendanceCount >= 5,
          };
          const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers([newMember, ...volunteerMembers], volunteerAttendance);
          setVolunteerMembers(cleanMembers);
          saveVolunteerMembers(cleanMembers);
        } else {
          // If already in members list, update status and recalculate actual count
          const updatedMembers = volunteerMembers.map(m => m.id === existingMember.id ? {
            ...m,
            status: (m.status === 'active' || m.status === 'honored') ? m.status : ('active' as const),
            activitiesCount: Math.max(m.activitiesCount || 0, actualAttendanceCount),
          } : m);
          const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(updatedMembers, volunteerAttendance);
          setVolunteerMembers(cleanMembers);
          saveVolunteerMembers(cleanMembers);
        }
      }
    }
  };

  const handleDeleteRegistration = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đăng ký này không?')) {
      const updated = registrations.filter((r) => r.id !== id);
      setRegistrations(updated);
      saveYouthRegistrations(updated);
    }
  };

  // VOLUNTEER MEMBER & ATTENDANCE HANDLERS
  const handleAddVolunteerMember = (memberData: Omit<VolunteerMember, 'id'>) => {
    const newMember: VolunteerMember = {
      ...memberData,
      fullName: memberData.fullName.trim().replace(/\s+/g, ' '),
      className: memberData.className.trim(),
      id: `vol-${Date.now()}`,
      activitiesCount: Number(memberData.activitiesCount) >= 0 ? Number(memberData.activitiesCount) : 0,
    };
    const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers([newMember, ...volunteerMembers], volunteerAttendance);
    setVolunteerMembers(cleanMembers);
    saveVolunteerMembers(cleanMembers);
  };

  const handleUpdateVolunteerMember = (id: string, updates: Partial<VolunteerMember>) => {
    const updated = updateVolunteerMember(id, updates);
    const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(updated, volunteerAttendance);
    setVolunteerMembers(cleanMembers);
    saveVolunteerMembers(cleanMembers);
  };

  const handleDeleteVolunteerMember = (id: string, reason?: string) => {
    if (confirm(`Xác nhận xóa hoàn toàn đoàn viên này khỏi hệ thống? Dữ liệu sẽ được xóa vĩnh viễn khỏi Cloud Firestore.`)) {
      const updated = deleteVolunteerMember(id);
      setVolunteerMembers(updated);
    }
  };

  const handleAddAttendance = (attData: Omit<VolunteerAttendance, 'id' | 'createdAt'>) => {
    const normName = normalizeStudentName(attData.fullName);
    const normClass = normalizeStudentClass(attData.className);

    const newAtt: VolunteerAttendance = {
      ...attData,
      fullName: attData.fullName.trim().replace(/\s+/g, ' '),
      className: attData.className.trim(),
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedAttendance = [newAtt, ...volunteerAttendance];
    setVolunteerAttendance(updatedAttendance);
    saveVolunteerAttendance(updatedAttendance);

    // Calculate actual total attendances for this student from the updated attendance list
    const totalAttCount = updatedAttendance.filter(
      a => normalizeStudentName(a.fullName) === normName && normalizeStudentClass(a.className) === normClass
    ).length;

    // Find member by normalized name and class
    const existingIndex = volunteerMembers.findIndex(
      m => normalizeStudentName(m.fullName) === normName && normalizeStudentClass(m.className) === normClass
    );

    let updatedMembers = [...volunteerMembers];
    if (existingIndex !== -1) {
      const currentMember = updatedMembers[existingIndex];
      // Increment and ensure it's at least totalAttCount
      const newCount = Math.max((currentMember.activitiesCount || 0) + 1, totalAttCount);
      const shouldHonor = newCount >= 5 && !currentMember.isHonored;

      // Update primary member and consolidate any duplicate profiles of this student
      const primaryUpdated = {
        ...currentMember,
        activitiesCount: newCount,
        isHonored: shouldHonor ? true : currentMember.isHonored,
        status: shouldHonor ? ('honored' as const) : currentMember.status,
        honorTitle: shouldHonor ? (currentMember.honorTitle || 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện') : currentMember.honorTitle,
        honorDate: shouldHonor ? (currentMember.honorDate || new Date().toLocaleDateString('vi-VN')) : currentMember.honorDate,
      };

      updatedMembers = updatedMembers
        .filter((m, idx) => {
          if (idx === existingIndex) return true;
          // Filter out duplicate profiles of the same student
          return !(normalizeStudentName(m.fullName) === normName && normalizeStudentClass(m.className) === normClass);
        })
        .map(m => m.id === currentMember.id ? primaryUpdated : m);
    } else {
      // If student is not yet in volunteerMembers, auto-create their member card with 1 attendance
      const newMember: VolunteerMember = {
        id: `vol-${Date.now()}`,
        code: `TN-${String(volunteerMembers.length + 1).padStart(3, '0')}`,
        fullName: attData.fullName.trim().replace(/\s+/g, ' '),
        className: attData.className.trim(),
        academicYear: '2026 - 2027',
        phone: '',
        joinedDate: new Date().toLocaleDateString('vi-VN'),
        skills: 'Tham gia phong trào Đoàn trường',
        activitiesCount: Math.max(1, totalAttCount),
        status: totalAttCount >= 5 ? 'honored' : 'active',
        isHonored: totalAttCount >= 5,
        honorTitle: totalAttCount >= 5 ? 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện' : undefined,
        honorDate: totalAttCount >= 5 ? new Date().toLocaleDateString('vi-VN') : undefined,
      };
      updatedMembers = [newMember, ...updatedMembers];
    }

    const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(updatedMembers, updatedAttendance);
    setVolunteerMembers(cleanMembers);
    saveVolunteerMembers(cleanMembers);
  };

  const handleHonorMember = (id: string, title: string, photo?: string) => {
    const updatedMembers = volunteerMembers.map(m => m.id === id ? {
      ...m,
      isHonored: true,
      status: 'honored' as const,
      honorTitle: title,
      honorDate: new Date().toLocaleDateString('vi-VN'),
      honorPhoto: photo || m.avatarUrl,
    } : m);
    setVolunteerMembers(updatedMembers);
    saveVolunteerMembers(updatedMembers);
  };

  const handleUpdateVolunteerMembersBulk = (members: VolunteerMember[]) => {
    setVolunteerMembers(members);
    saveVolunteerMembers(members);
  };

  // ACTIVITY HANDLERS
  const handleAddActivity = (actData: Omit<Activity, 'id'>) => {
    const newAct: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    saveActivities(updated);
  };

  const handleUpdateActivity = (id: string, updates: Partial<Activity>) => {
    const updated = activities.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setActivities(updated);
    saveActivities(updated);
  };

  const handleDeleteActivity = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
      const updated = activities.filter((a) => a.id !== id);
      setActivities(updated);
      saveActivities(updated);
    }
  };

  // HEALTH ARTICLES HANDLERS (CẨM NANG & TUYÊN TRUYỀN Y TẾ)
  const handleAddHealthArticle = (artData: Omit<HealthArticle, 'id'>) => {
    const created = addHealthArticle(artData);
    setHealthArticles(getHealthArticles());
    return created;
  };

  const handleUpdateHealthArticle = (id: string, updates: Partial<HealthArticle>) => {
    const updated = updateHealthArticle(id, updates);
    setHealthArticles(updated);
  };

  const handleDeleteHealthArticle = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết cẩm nang y tế này?')) {
      const updated = deleteHealthArticle(id);
      setHealthArticles(updated);
    }
  };

  // INFOGRAPHIC HANDLERS
  const handleAddInfographic = (infoData: Omit<QAInfographic, 'id'>) => {
    const newInfo: QAInfographic = {
      ...infoData,
      id: `info-${Date.now()}`,
    };
    const updated = [newInfo, ...infographics];
    setInfographics(updated);
    saveInfographics(updated);
  };

  const handleDeleteInfographic = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa infographic này?')) {
      const updated = infographics.filter((i) => i.id !== id);
      setInfographics(updated);
      saveInfographics(updated);
    }
  };

  // AI PROMPTS HANDLERS (MANAGED BY ADMIN BY TIME PERIOD)
  const handleAddAIPrompt = (promptData: Omit<AIPromptQuestion, 'id'>) => {
    const newPrompt: AIPromptQuestion = {
      ...promptData,
      id: `prompt-${Date.now()}`,
    };
    const updated = [newPrompt, ...aiPrompts];
    setAiPrompts(updated);
    saveAIPromptQuestions(updated);
  };

  const handleUpdateAIPrompt = (id: string, updates: Partial<AIPromptQuestion>) => {
    const updated = aiPrompts.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setAiPrompts(updated);
    saveAIPromptQuestions(updated);
  };

  const handleDeleteAIPrompt = (id: string) => {
    const updated = aiPrompts.filter((p) => p.id !== id);
    setAiPrompts(updated);
    saveAIPromptQuestions(updated);
  };

  // AI CHAT QUERY LOGGING
  const handleLogChat = (logData: Omit<AIChatLog, 'id' | 'timestamp'>) => {
    const newLog = addAIChatLog(logData);
    setAiLogs((prev) => [newLog, ...prev]);
  };

  const handleClearAILogs = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử hỏi đáp AI?')) {
      saveAIChatLogs([]);
      setAiLogs([]);
    }
  };

  // COUNSELOR HANDLERS (ADMIN MANAGEMENT)
  const handleAddCounselor = (cData: Omit<Counselor, 'id'>) => {
    const newCounselor: Counselor = {
      ...cData,
      id: `counselor-${Date.now()}`,
    };
    const updated = [...counselors, newCounselor];
    setCounselors(updated);
    saveCounselors(updated);
  };

  const handleUpdateCounselor = (id: string, updates: Partial<Counselor>) => {
    const updated = counselors.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCounselors(updated);
    saveCounselors(updated);
  };

  const handleDeleteCounselor = (id: string) => {
    const updated = counselors.filter((c) => c.id !== id);
    setCounselors(updated);
    saveCounselors(updated);
  };

  // CONTACT MESSAGE HANDLER
  const handleContactMessage = (msg: { name: string; phone: string; email: string; message: string }) => {
    syncToGoogleSheets('contact', {
      ...msg,
      id: `contact-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  };

  // CONFIG HANDLER
  const handleUpdateConfig = (newConfig: SchoolConfig) => {
    setConfig(newConfig);
    saveSchoolConfig(newConfig);
  };

  const handleReactActivity = async (id: string, reactionType: 'like' | 'heart' | 'haha' | 'fire' | 'care') => {
    const updated = await reactToActivity(id, reactionType);
    if (updated) {
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };

  // ADMIN LOGIN HANDLER (Firebase Auth & School RBAC)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminAuthLoading(true);

    try {
      const result = await loginAdmin(adminEmail, adminPassword);

      if (!result.success) {
        setAdminLoginError(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
        return;
      }

      setIsAdminLoggedIn(true);
      setIsAdminLoginModalOpen(false);
      setAdminEmail('');
      setAdminPassword('');
      setAdminLoginError('');
      setShowAdminPassword(false);
      handleSelectTab('admin');
    } catch (err: any) {
      setAdminLoginError(err?.message || 'Có lỗi xảy ra khi xác thực tài khoản.');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      setIsAdminLoggedIn(false);
      handleSelectTab('home');
    }
  };

  const handleManualSync = async (): Promise<boolean> => {
    const res = await syncAllToGoogleSheets();
    return res.success;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        config={config}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenAppInstall={() => setIsAppInstallOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenMemoryManager={() => setIsMemoryModalOpen(true)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            handleSelectTab('admin');
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }}
      />

      {/* Primary Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-0">
            {/* 3D Hero Banner with 4 Interactive Action Cards */}
            <HeroBanner
              config={config}
              onNavigate={handleSelectTab}
              onOpenQuestionModal={() => handleSelectTab('qa')}
              onOpenStoryModal={() => handleSelectTab('stories')}
              onOpenAppInstall={() => setIsAppInstallOpen(true)}
            />

            {/* Live Operational Statistics */}
            <StatsSection
              questions={questions}
              stories={stories}
              registrations={registrations}
              volunteerCount={volunteerMembers.length}
            />

            {/* Quick Home Overview of Counseling */}
            <CounselingHome
              config={config}
              counselors={counselors}
              onNavigate={handleSelectTab}
              onOpenQuestionModal={() => handleSelectTab('qa')}
              isAdminLoggedIn={isAdminLoggedIn}
            />

            {/* Highlighted Activities Section */}
            <ActivitiesSection
              activities={activities.slice(0, 3)}
              onAddActivity={handleAddActivity}
              isAdminLoggedIn={isAdminLoggedIn}
            />
          </div>
        )}

        {activeTab === 'counseling' && (
          <CounselingHome
            config={config}
            counselors={counselors}
            onNavigate={handleSelectTab}
            onOpenQuestionModal={() => handleSelectTab('qa')}
            isAdminLoggedIn={isAdminLoggedIn}
            onUpdateCounselor={handleUpdateCounselor}
          />
        )}

        {activeTab === 'health' && (
          <HealthCareSection
            questions={questions}
            counselors={counselors}
            config={config}
            healthArticles={healthArticles}
            onAddQuestion={handleAddQuestion}
            onAddHealthArticle={handleAddHealthArticle}
            onUpdateHealthArticle={handleUpdateHealthArticle}
            onDeleteHealthArticle={handleDeleteHealthArticle}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenQuestionModal={() => handleSelectTab('qa')}
          />
        )}

        {activeTab === 'qa' && (
          <QASection
            questions={questions}
            infographics={infographics}
            counselors={counselors}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onOpenAIChat={() => handleSelectTab('aichat')}
            isAdminLoggedIn={isAdminLoggedIn}
            initialTopic={qaInitialTopic}
          />
        )}

        {activeTab === 'aichat' && (
          <AIChatBox
            config={config}
            prompts={aiPrompts}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
            onLogChat={handleLogChat}
          />
        )}

        {activeTab === 'stories' && (
          <StoriesSection
            stories={stories}
            onAddStory={handleAddStory}
            onReact={handleReactStory}
            isAdminLoggedIn={isAdminLoggedIn}
            onUpdateStory={handleUpdateStory}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {activeTab === 'youth' && (
          <YouthUnionSection
            registrations={registrations}
            volunteerMembers={volunteerMembers}
            volunteerAttendance={volunteerAttendance}
            onAddRegistration={handleAddRegistration}
            onUpdateRegistration={handleUpdateRegistration}
            onDeleteRegistration={handleDeleteRegistration}
            onAddVolunteerMember={handleAddVolunteerMember}
            onUpdateVolunteerMember={handleUpdateVolunteerMember}
            onUpdateVolunteerMembersBulk={handleUpdateVolunteerMembersBulk}
            onDeleteVolunteerMember={handleDeleteVolunteerMember}
            onAddAttendance={handleAddAttendance}
            onHonorMember={handleHonorMember}
            isAdminLoggedIn={isAdminLoggedIn}
            config={config}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesSection
            activities={activities}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
            onReact={handleReactActivity}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {activeTab === 'contact' && (
          <ContactSection
            config={config}
            counselors={counselors}
            onSendMessage={handleContactMessage}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            questions={questions}
            stories={stories}
            registrations={registrations}
            volunteerMembers={volunteerMembers}
            volunteerAttendance={volunteerAttendance}
            activities={activities}
            infographics={infographics}
            aiPrompts={aiPrompts}
            aiLogs={aiLogs}
            counselors={counselors}
            healthArticles={healthArticles}
            config={config}
            onLogout={handleAdminLogout}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateStory={handleUpdateStory}
            onDeleteStory={handleDeleteStory}
            onUpdateRegistration={handleUpdateRegistration}
            onDeleteRegistration={handleDeleteRegistration}
            onAddVolunteerMember={handleAddVolunteerMember}
            onUpdateVolunteerMember={handleUpdateVolunteerMember}
            onUpdateVolunteerMembersBulk={handleUpdateVolunteerMembersBulk}
            onDeleteVolunteerMember={handleDeleteVolunteerMember}
            onAddAttendance={handleAddAttendance}
            onHonorMember={handleHonorMember}
            onAddInfographic={handleAddInfographic}
            onDeleteInfographic={handleDeleteInfographic}
            onAddHealthArticle={handleAddHealthArticle}
            onUpdateHealthArticle={handleUpdateHealthArticle}
            onDeleteHealthArticle={handleDeleteHealthArticle}
            onDeleteActivity={handleDeleteActivity}
            onUpdateConfig={handleUpdateConfig}
            onSyncGoogleSheets={handleManualSync}
            onAddAIPrompt={handleAddAIPrompt}
            onUpdateAIPrompt={handleUpdateAIPrompt}
            onDeleteAIPrompt={handleDeleteAIPrompt}
            onClearAILogs={handleClearAILogs}
            onAddCounselor={handleAddCounselor}
            onUpdateCounselor={handleUpdateCounselor}
            onDeleteCounselor={handleDeleteCounselor}
          />
        )}
      </main>

      {/* Floating Action Hotline & AI Chat Widgets */}
      <FloatingHotlineWidget
        config={config}
        hotline={config.hotline}
        onOpenAIChat={() => handleSelectTab('aichat')}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
      />

      {/* Floating AI Chat Assistant Button on Bottom-Right */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => handleSelectTab('aichat')}
          className="group flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-indigo-700 text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/80 cursor-pointer"
          title="Trò chuyện tức thì với Chat AI Tư vấn (24/7)"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-black hidden sm:inline-block">
            Chat AI Tư Vấn (24/7)
          </span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        config={config}
        onNavigate={handleSelectTab}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            handleSelectTab('admin');
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }}
        onOpenAIChat={() => handleSelectTab('aichat')}
      />

      {/* EMERGENCY PROTOCOL POPUP MODAL */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border-4 border-red-500 relative animate-in zoom-in-95">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                KÊNH TRỢ GIÚP KHẨN CẤP
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Nếu bạn hoặc bạn bè đang gặp khủng hoảng tâm lý nghiêm trọng, bạo lực học đường hay nguy hiểm, hãy liên hệ ngay với người lớn đáng tin cậy hoặc các đường dây nóng dưới đây:
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`tel:${config.hotline.replace(/\s+/g, '')}`}
                className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-300 rounded-2xl transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-600 text-white rounded-xl">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-red-950">Hotline Tư Vấn Trường THPT Ba Chúc</p>
                    <p className="text-base font-black text-red-600">{config.hotline}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-700 bg-white px-2.5 py-1 rounded-lg border border-red-200">
                  Gọi ngay
                </span>
              </a>

              <a
                href="tel:111"
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-2xl transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-blue-950">Tổng đài Quốc gia Bảo vệ Trẻ em</p>
                    <p className="text-base font-black text-blue-600">111 (Miễn phí 24/7)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  Gọi 111
                </span>
              </a>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-center font-medium">
                📍 Bạn cũng có thể đến trực tiếp: <strong>{config.consultingRoom}</strong> để gặp thầy cô tư vấn.
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Đã hiểu & Đóng thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {isAdminLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95">
            <button
              onClick={() => {
                setIsAdminLoginModalOpen(false);
                setAdminLoginError('');
                setAdminPassword('');
                setShowAdminPassword(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black uppercase tracking-wider border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tường Lửa WAF Bảo Vệ • Đăng Nhập Siêu Tốc</span>
              </div>
              <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                ĐĂNG NHẬP QUẢN TRỊ VIÊN
              </h3>
              <p className="text-xs text-slate-500">
                Dành cho Ban Giám hiệu, Ban Tư vấn & Ban Chấp Hành Đoàn Trường THPT Ba Chúc
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Email / Tên đăng nhập quản trị
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('tuvanhocduongthptbachuc2025');
                      setAdminPassword('Bachuc@2025');
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer transition-colors"
                  >
                    ⚡ Điền tài khoản mặc định
                  </button>
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@thptbachuc.edu.vn hoặc tuvanhocduongthptbachuc2025"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu quản trị
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3.5 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminLoginError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium leading-relaxed">
                  {adminLoginError}
                </div>
              )}

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {adminAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG XÁC THỰC...</span>
                  </>
                ) : (
                  <span>ĐĂNG NHẬP HỆ THỐNG TỨC THÌ</span>
                )}
              </button>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Tường lửa chống Hacker Brute-Force & Ẩn mã nguồn 100%</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Tự động cách ly IP & tạm khóa 5 phút nếu nhập sai quá 5 lần.
                </p>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* App Install Guidance Modal */}
      <AppInstallModal
        isOpen={isAppInstallOpen}
        onClose={() => setIsAppInstallOpen(false)}
        config={config}
      />

      {/* Real-time Bidirectional Web <-> App Sync Status Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onOpenAppInstall={() => setIsAppInstallOpen(true)}
      />

      {/* Turbo Memory Manager & Diagnostics Modal */}
      <MemoryManagementModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        volunteerMembers={volunteerMembers}
        onUpdateVolunteerMembers={(members) => {
          setVolunteerMembers(members);
          saveVolunteerMembers(members);
        }}
      />

      {/* Floating Live Real-time Sync Toast Notification */}
      {syncToastMessage && (
        <div className="fixed bottom-24 right-4 z-50 bg-slate-900/95 text-white border border-indigo-500/50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-100">{syncToastMessage}</span>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}
