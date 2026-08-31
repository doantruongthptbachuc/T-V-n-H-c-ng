import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  Flag, 
  Camera, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Save, 
  Copy, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Sparkles,
  Bot,
  BarChart3,
  Calendar,
  AlertTriangle,
  Download,
  Check,
  Eye,
  EyeOff,
  TrendingUp,
  PieChart,
  Layers,
  PhoneCall,
  UserCheck,
  User,
  Users,
  Image as ImageIcon,
  Phone,
  Mail,
  Award,
  ArrowUpDown,
  UserX,
  GraduationCap,
  TrendingDown,
  HeartHandshake,
  Heart,
  RotateCcw,
  CheckCircle,
  LogOut,
  Crop,
  Stethoscope,
  HeartPulse,
  Cpu,
  ShieldAlert,
  ChevronRight,
  X,
  FileText,
  Printer
} from 'lucide-react';
import { LogoCropperModal } from './LogoCropperModal';
import { MemoryManagementModal } from './MemoryManagementModal';
import { HonorMemoryCertificateModal } from './HonorMemoryCertificateModal';
import { SecurityFirewallPanel } from './SecurityFirewallPanel';
import { CounselingReportModal } from './CounselingReportModal';
import { StudentAvatar } from './StudentAvatar';
import { VolunteerActivityCharts } from './VolunteerActivityCharts';
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
  VolunteerStatus,
  HealthArticle
} from '../types';
import { 
  generateGoogleAppsScriptCode, 
  downloadFile,
  syncAllToGoogleSheets,
  triggerAutoBackup,
  exportQuestionsCSV,
  exportStoriesCSV,
  exportVolunteersCSV,
  exportAttendanceCSV,
  exportDataToJSON
} from '../utils/storage';
import { initialCounselors, sampleTeacherAvatars, sampleSchoolLogos, sampleHeroBannerImages } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';
import { uploadImageToFirebase, deleteImageFromFirebase } from '../lib/storageService';
import { QAChartsView } from './QAChartsView';
import { YouthChartsView } from './YouthChartsView';

interface AdminDashboardProps {
  questions: Question[];
  stories: Story[];
  registrations: YouthRegistration[];
  volunteerMembers?: VolunteerMember[];
  volunteerAttendance?: VolunteerAttendance[];
  activities: Activity[];
  infographics: QAInfographic[];
  aiPrompts: AIPromptQuestion[];
  aiLogs: AIChatLog[];
  counselors?: Counselor[];
  config: SchoolConfig;
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateStory: (id: string, updates: Partial<Story>) => void;
  onDeleteStory: (id: string) => void;
  onUpdateRegistration: (id: string, updates: Partial<YouthRegistration>) => void;
  onDeleteRegistration: (id: string) => void;
  onAddVolunteerMember?: (m: Omit<VolunteerMember, 'id' | 'code'>) => void;
  onUpdateVolunteerMember?: (id: string, updates: Partial<VolunteerMember>) => void;
  onUpdateVolunteerMembersBulk?: (members: VolunteerMember[]) => void;
  onDeleteVolunteerMember?: (id: string, reason?: string) => void;
  onAddAttendance?: (att: Omit<VolunteerAttendance, 'id' | 'createdAt'>) => void;
  onHonorMember?: (id: string, title: string, photo?: string) => void;
  onAddInfographic: (info: Omit<QAInfographic, 'id'>) => void;
  onDeleteInfographic: (id: string) => void;
  healthArticles?: HealthArticle[];
  onAddHealthArticle?: (art: Omit<HealthArticle, 'id'>) => void;
  onUpdateHealthArticle?: (id: string, updates: Partial<HealthArticle>) => void;
  onDeleteHealthArticle?: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateConfig: (newConfig: SchoolConfig) => void;
  onSyncGoogleSheets: () => Promise<boolean>;
  onAddAIPrompt: (prompt: Omit<AIPromptQuestion, 'id'>) => void;
  onUpdateAIPrompt: (id: string, updates: Partial<AIPromptQuestion>) => void;
  onDeleteAIPrompt: (id: string) => void;
  onClearAILogs?: () => void;
  onAddCounselor?: (c: Omit<Counselor, 'id'>) => void;
  onUpdateCounselor?: (id: string, updates: Partial<Counselor>) => void;
  onDeleteCounselor?: (id: string) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  questions,
  stories,
  registrations,
  volunteerMembers = [],
  volunteerAttendance = [],
  activities,
  infographics,
  aiPrompts,
  aiLogs,
  counselors = initialCounselors,
  healthArticles = [],
  config,
  onLogout,
  onUpdateQuestion,
  onDeleteQuestion,
  onUpdateStory,
  onDeleteStory,
  onUpdateRegistration,
  onDeleteRegistration,
  onUpdateVolunteerMember,
  onUpdateVolunteerMembersBulk,
  onDeleteVolunteerMember,
  onAddAttendance,
  onHonorMember,
  onAddInfographic,
  onDeleteInfographic,
  onAddHealthArticle,
  onUpdateHealthArticle,
  onDeleteHealthArticle,
  onDeleteActivity,
  onUpdateConfig,
  onSyncGoogleSheets,
  onAddAIPrompt,
  onUpdateAIPrompt,
  onDeleteAIPrompt,
  onClearAILogs,
  onAddCounselor,
  onUpdateCounselor,
  onDeleteCounselor,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'ai_prompts' | 'ai_logs' | 'counselors' | 'qa' | 'health_articles' | 'stories' | 'youth' | 'activities' | 'config' | 'firewall'
  >('analytics');

  // Memory Management & Honor Certificate Modal States
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [adminViewingCertMember, setAdminViewingCertMember] = useState<VolunteerMember | null>(null);

  // Health Articles management in Admin
  const [healthSearchTerm, setHealthSearchTerm] = useState('');
  const [healthCategoryFilter, setHealthCategoryFilter] = useState('all');
  const [editingHealthArticle, setEditingHealthArticle] = useState<HealthArticle | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [hEditTitle, setHEditTitle] = useState('');
  const [hEditCategory, setHEditCategory] = useState<string>('Bệnh học đường');
  const [hEditReadTime, setHEditReadTime] = useState('3 phút đọc');
  const [hEditAuthor, setHEditAuthor] = useState('Cô Nguyễn Thị Hiệp (Cán bộ Y tế)');
  const [hEditSummary, setHEditSummary] = useState('');
  const [hEditContent, setHEditContent] = useState('');
  const [hEditTips, setHEditTips] = useState<string[]>(['']);
  const [hEditImage, setHEditImage] = useState('');
  const [isCompressingHImg, setIsCompressingHImg] = useState(false);

  const [analyticsSubView, setAnalyticsSubView] = useState<'overview' | 'qa_charts' | 'youth_charts'>('overview');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Question answering & full editing state
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qEditStudentName, setQEditStudentName] = useState('');
  const [qEditClass, setQEditClass] = useState('');
  const [qEditTopic, setQEditTopic] = useState<TopicType>('Học tập');
  const [qEditQuestion, setQEditQuestion] = useState('');
  const [qEditAnswer, setQEditAnswer] = useState('');
  const [qEditAnsweredBy, setQEditAnsweredBy] = useState('');
  const [qEditStatus, setQEditStatus] = useState<'pending' | 'answered'>('answered');
  const [qEditIsPublic, setQEditIsPublic] = useState(true);

  const [answerText, setAnswerText] = useState('');
  const [counselorName, setCounselorName] = useState(counselors[0]?.name ? `${counselors[0].name} (${counselors[0].role})` : 'Thầy Trần Văn Được - BT Đoàn');
  const [answerStatusChoice, setAnswerStatusChoice] = useState<'answered' | 'pending'>('answered');

  // Story review & full editing state
  const [storyFilterStatus, setStoryFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [storySearchTerm, setStorySearchTerm] = useState('');
  const [storyNoteId, setStoryNoteId] = useState<string | null>(null);
  const [counselorNoteText, setCounselorNoteText] = useState('');
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [sEditTitle, setSEditTitle] = useState('');
  const [sEditAuthor, setSEditAuthor] = useState('');
  const [sEditIsAnonymous, setSEditIsAnonymous] = useState(false);
  const [sEditClass, setSEditClass] = useState('');
  const [sEditTag, setSEditTag] = useState<TopicType>('Tâm lý');
  const [sEditContent, setSEditContent] = useState('');
  const [sEditImage, setSEditImage] = useState('');
  const [sEditNote, setSEditNote] = useState('');
  const [sEditStatus, setSEditStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [sEditCreatedAt, setSEditCreatedAt] = useState('');
  const [sEditHearts, setSEditHearts] = useState(1);
  const [sEditCheers, setSEditCheers] = useState(0);
  const [isCompressingStoryImage, setIsCompressingStoryImage] = useState(false);

  // Infographic state & editing
  const [infoTitle, setInfoTitle] = useState('');
  const [infoCategory, setInfoCategory] = useState('Phương pháp học tập');
  const [infoUrl, setInfoUrl] = useState('');
  const [infoDesc, setInfoDesc] = useState('');
  const [editingInfo, setEditingInfo] = useState<QAInfographic | null>(null);

  // Youth Union Sub-tabs & Management state
  const [youthSubTab, setYouthSubTab] = useState<'registrations' | 'tree' | 'attendance' | 'activity_charts'>('registrations');
  const [youthAnalyticsMode, setYouthAnalyticsMode] = useState<'activity_recharts' | 'member_demographics'>('activity_recharts');
  const [regFilterStatus, setRegFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [volSearch, setVolSearch] = useState('');
  const [editingVolMember, setEditingVolMember] = useState<VolunteerMember | null>(null);
  const [volEditName, setVolEditName] = useState('');
  const [volEditClass, setVolEditClass] = useState('');
  const [volEditPhone, setVolEditPhone] = useState('');
  const [volEditSkills, setVolEditSkills] = useState('');
  const [volEditCount, setVolEditCount] = useState(1);

  // Volunteer Honor Modal state
  const [honoringVolMember, setHonoringVolMember] = useState<VolunteerMember | null>(null);
  const [honorTitleText, setHonorTitleText] = useState('Học Sinh Tích Cực Trong Phong Trào Tình Nguyện');
  const [honorPhotoUrl, setHonorPhotoUrl] = useState('');
  const [isCompressingVolHonor, setIsCompressingVolHonor] = useState(false);

  // Volunteer Removal / Reasons modal
  const [deletingVolMember, setDeletingVolMember] = useState<VolunteerMember | null>(null);
  const [volDeleteReason, setVolDeleteReason] = useState<VolunteerStatus>('graduated_12');
  const [volDeleteCustomNote, setVolDeleteCustomNote] = useState('');

  // Manual Attendance Form inside Admin
  const [attFullName, setAttFullName] = useState('');
  const [attClassName, setAttClassName] = useState('');
  const [attActivityName, setAttActivityName] = useState('Chiến dịch Tình nguyện Ba Chúc');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attLocation, setAttLocation] = useState('Trường THPT Ba Chúc');
  const [attSavedMsg, setAttSavedMsg] = useState(false);

  // Counselor Management State
  const [editingCounselorId, setEditingCounselorId] = useState<string | null>(null);
  const [counselorFormName, setCounselorFormName] = useState('');
  const [counselorFormRole, setCounselorFormRole] = useState('');
  const [counselorFormSpecialty, setCounselorFormSpecialty] = useState('');
  const [counselorFormAvatar, setCounselorFormAvatar] = useState(sampleTeacherAvatars[0]);
  const [counselorFormPhone, setCounselorFormPhone] = useState(config.hotline || '0789 620 212');
  const [counselorFormEmail, setCounselorFormEmail] = useState('');
  const [counselorFormBio, setCounselorFormBio] = useState('');
  const [counselorSavedToast, setCounselorSavedToast] = useState(false);

  // AI Prompt Modal/Form State
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptAnswer, setNewPromptAnswer] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<string>('Học tập');
  const [newPromptPeriod, setNewPromptPeriod] = useState('Mùa thi học kỳ & TN THPT');
  const [customPeriodText, setCustomPeriodText] = useState('');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [promptSearchTerm, setPromptSearchTerm] = useState('');
  const [promptCategoryFilter, setPromptCategoryFilter] = useState<string>('Tất cả');

  // Filter & Search states
  const [searchLogKeyword, setSearchLogKeyword] = useState('');
  const [filterLogCategory, setFilterLogCategory] = useState<string>('Tất cả');
  const [filterLogEmergency, setFilterLogEmergency] = useState<string>('Tất cả');

  // School config editing state
  const [editConfig, setEditConfig] = useState<SchoolConfig>(config);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isLogoCropperOpen, setIsLogoCropperOpen] = useState(false);

  // Cloud Upload State Trackers
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadStatus, setLogoUploadStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadStatus, setBannerUploadStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);
  const [isUploadingInfo, setIsUploadingInfo] = useState(false);
  const [infoUploadStatus, setInfoUploadStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);
  const [isUploadingHonor, setIsUploadingHonor] = useState(false);
  const [honorUploadStatus, setHonorUploadStatus] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);

  // PRESET TIME PERIODS FOR ADMINS
  const PRESET_PERIODS = [
    'Mùa thi học kỳ & TN THPT',
    'Đầu năm học mới',
    'Mùa tuyển sinh & hướng nghiệp',
    'Chiến dịch hè & Đoàn - Hội',
    'Toàn thời gian (Quanh năm)',
    'Tháng cao điểm Sức khỏe tinh thần',
    'Tùy chỉnh khác...',
  ];

  const TOPIC_LIST: TopicType[] = [
    'Học tập',
    'Tâm lý',
    'Hướng nghiệp',
    'Bạn bè',
    'Gia đình',
    'Kỹ năng sống',
    'Hoạt động Đoàn',
    'Khác'
  ];

  // STATISTICS CALCULATIONS (EXCLUSIVELY FOR ADMIN)
  const totalQuestions = questions.length;
  const totalAnswered = questions.filter(q => q.status === 'answered').length;
  const totalPending = totalQuestions - totalAnswered;
  const totalAILogs = aiLogs.length;
  const totalEmergencies = aiLogs.filter(l => l.isEmergency).length;

  // Topic distribution across AI queries and questions
  const topicCounts: Record<string, number> = {};
  TOPIC_LIST.forEach(t => { topicCounts[t] = 0; });

  aiLogs.forEach(log => {
    const cat = log.topicCategory || 'Khác';
    topicCounts[cat] = (topicCounts[cat] || 0) + 1;
  });

  questions.forEach(q => {
    const cat = q.topic || 'Khác';
    topicCounts[cat] = (topicCounts[cat] || 0) + 1;
  });

  const totalAllQueries = totalQuestions + totalAILogs;

  // AI Prompt Handlers
  const handleCreateOrUpdatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi gợi ý!');
      return;
    }

    const finalPeriod = newPromptPeriod === 'Tùy chỉnh khác...' ? (customPeriodText.trim() || 'Toàn thời gian') : newPromptPeriod;

    if (editingPromptId) {
      onUpdateAIPrompt(editingPromptId, {
        promptText: newPromptText.trim(),
        answer: newPromptAnswer.trim(),
        category: newPromptCategory as (TopicType | 'Tất cả'),
        timePeriod: finalPeriod,
      });
      setEditingPromptId(null);
    } else {
      onAddAIPrompt({
        promptText: newPromptText.trim(),
        answer: newPromptAnswer.trim(),
        category: newPromptCategory as (TopicType | 'Tất cả'),
        timePeriod: finalPeriod,
        isActive: true,
        order: aiPrompts.length + 1,
      });
    }

    setNewPromptText('');
    setNewPromptAnswer('');
    setCustomPeriodText('');
  };

  const handleEditPromptClick = (prompt: AIPromptQuestion) => {
    setEditingPromptId(prompt.id);
    setNewPromptText(prompt.promptText);
    setNewPromptAnswer(prompt.answer || '');
    setNewPromptCategory(prompt.category);
    if (PRESET_PERIODS.includes(prompt.timePeriod)) {
      setNewPromptPeriod(prompt.timePeriod);
      setCustomPeriodText('');
    } else {
      setNewPromptPeriod('Tùy chỉnh khác...');
      setCustomPeriodText(prompt.timePeriod);
    }
  };

  // Counselor Form Handlers
  const handleEditCounselorClick = (c: Counselor) => {
    setEditingCounselorId(c.id);
    setCounselorFormName(c.name);
    setCounselorFormRole(c.role);
    setCounselorFormSpecialty(c.specialty);
    setCounselorFormAvatar(c.avatar);
    setCounselorFormPhone(c.phone || config.hotline);
    setCounselorFormEmail(c.email || '');
    setCounselorFormBio(c.bio || '');
  };

  const handleResetCounselorForm = () => {
    setEditingCounselorId(null);
    setCounselorFormName('');
    setCounselorFormRole('');
    setCounselorFormSpecialty('');
    setCounselorFormAvatar(sampleTeacherAvatars[0]);
    setCounselorFormPhone(config.hotline || '0789 620 212');
    setCounselorFormEmail('');
    setCounselorFormBio('');
  };

  const handleSaveCounselor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselorFormName.trim() || !counselorFormRole.trim()) {
      alert('Vui lòng nhập Họ tên và Chức vụ của Thầy/Cô!');
      return;
    }

    const payload = {
      name: counselorFormName.trim(),
      role: counselorFormRole.trim(),
      specialty: counselorFormSpecialty.trim() || 'Tư vấn Học đường, Kỹ năng sống & Hoạt động Đoàn',
      avatar: counselorFormAvatar.trim() || sampleTeacherAvatars[0],
      phone: counselorFormPhone.trim() || config.hotline,
      email: counselorFormEmail.trim(),
      bio: counselorFormBio.trim(),
    };

    if (editingCounselorId) {
      if (onUpdateCounselor) {
        onUpdateCounselor(editingCounselorId, payload);
      }
    } else {
      if (onAddCounselor) {
        onAddCounselor({
          ...payload,
          order: counselors.length + 1,
        });
      }
    }

    setCounselorSavedToast(true);
    setTimeout(() => {
      setCounselorSavedToast(false);
      handleResetCounselorForm();
    }, 1000);
  };

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      setAvatarUploadStatus({ type: 'loading', message: 'Đang tải ảnh chân dung lên Firebase Storage...' });
      try {
        const cloudUrl = await uploadImageToFirebase(file, 'images/counselors');
        setCounselorFormAvatar(cloudUrl);
        setAvatarUploadStatus({ type: 'success', message: '✅ Tải lên Firebase Storage thành công!' });
        setTimeout(() => setAvatarUploadStatus(null), 4000);
      } catch (err) {
        console.error('Error uploading avatar:', err);
        setAvatarUploadStatus({ type: 'error', message: '❌ Tải lên thất bại, vui lòng kiểm tra kết nối!' });
        setTimeout(() => setAvatarUploadStatus(null), 5000);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  // Question Answer Handler inside Admin
  const handleOpenAnswerBox = (q: Question) => {
    setAnsweringQuestionId(q.id);
    setAnswerText(q.answer || '');
    setCounselorName(q.answeredBy || (counselors[0]?.name ? `${counselors[0].name} (${counselors[0].role})` : 'Thầy Trần Văn Được - BT Đoàn'));
    setAnswerStatusChoice(q.status || 'answered');
  };

  const handleSaveAnswer = (qId: string) => {
    if (!answerText.trim()) {
      alert('Vui lòng nhập nội dung câu trả lời!');
      return;
    }
    onUpdateQuestion(qId, {
      answer: answerText.trim(),
      answeredBy: counselorName.trim() || 'Tổ Tư vấn Học đường THPT Ba Chúc',
      answeredAt: new Date().toISOString(),
      status: answerStatusChoice,
    });
    setAnsweringQuestionId(null);
    setAnswerText('');
  };

  const handleSaveStoryNote = (sId: string) => {
    onUpdateStory(sId, {
      counselorNote: counselorNoteText.trim(),
      status: 'approved',
    });
    setStoryNoteId(null);
    setCounselorNoteText('');
  };

  // QA Question Full Edit
  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQEditStudentName(q.studentName || '');
    setQEditClass(q.className || '');
    setQEditTopic(q.topic || 'Học tập');
    setQEditQuestion(q.question || '');
    setQEditAnswer(q.answer || '');
    setQEditAnsweredBy(q.answeredBy || (counselors[0]?.name ? `${counselors[0].name} (${counselors[0].role})` : 'Tổ Tư vấn Học đường'));
    setQEditStatus(q.status || 'answered');
    setQEditIsPublic(q.isPublic !== false);
  };

  const handleSaveEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (!qEditQuestion.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    onUpdateQuestion(editingQuestion.id, {
      studentName: qEditStudentName.trim() || 'Học sinh',
      className: qEditClass.trim() || '10',
      topic: qEditTopic,
      question: qEditQuestion.trim(),
      answer: qEditAnswer.trim() || undefined,
      answeredBy: qEditAnswer.trim() ? (qEditAnsweredBy.trim() || 'Tổ Tư vấn Học đường THPT Ba Chúc') : undefined,
      answeredAt: qEditAnswer.trim() ? new Date().toISOString() : undefined,
      status: qEditAnswer.trim() ? qEditStatus : 'pending',
      isPublic: qEditIsPublic,
    });
    setEditingQuestion(null);
  };

  // Story Full Edit Handlers
  const handleStoryImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingStoryImage(true);
      try {
        const compressed = await compressImageFile(file, 900, 700, 0.85);
        setSEditImage(compressed);
      } catch (err) {
        console.error('Error compressing story image:', err);
      } finally {
        setIsCompressingStoryImage(false);
      }
    }
  };

  const handleOpenEditStory = (s: Story) => {
    setEditingStory(s);
    setSEditTitle(s.title || '');
    setSEditAuthor(s.isAnonymous ? (s.authorName || 'Học sinh ẩn danh') : (s.authorName || (s as any).author || ''));
    setSEditIsAnonymous(s.isAnonymous || false);
    setSEditClass(s.className || '');
    setSEditTag((s.topic || (s as any).tag || 'Tâm lý') as TopicType);
    setSEditContent(s.content || '');
    setSEditImage(s.attachedImage || s.imageUrl || '');
    setSEditNote(s.counselorNote || '');
    setSEditStatus(s.status || 'approved');
    setSEditCreatedAt(s.createdAt ? s.createdAt.substring(0, 16) : new Date().toISOString().substring(0, 16));
    setSEditHearts(s.hearts ?? 1);
    setSEditCheers(s.cheers ?? s.likes ?? 0);
  };

  const handleSaveEditStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    if (!sEditTitle.trim() || !sEditContent.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung câu chuyện!');
      return;
    }
    onUpdateStory(editingStory.id, {
      title: sEditTitle.trim(),
      authorName: sEditIsAnonymous ? 'Học sinh ẩn danh' : (sEditAuthor.trim() || 'Học sinh giấu tên'),
      isAnonymous: sEditIsAnonymous,
      className: sEditClass.trim() || undefined,
      topic: sEditTag,
      content: sEditContent.trim(),
      attachedImage: sEditImage || undefined,
      imageUrl: sEditImage || undefined,
      counselorNote: sEditNote.trim() || undefined,
      status: sEditStatus,
      createdAt: sEditCreatedAt ? new Date(sEditCreatedAt).toISOString() : editingStory.createdAt,
      hearts: Number(sEditHearts) || 0,
      cheers: Number(sEditCheers) || 0,
      likes: Number(sEditCheers) || 0,
    });
    setEditingStory(null);
  };

  const handleQuickApproveStory = (sId: string) => {
    onUpdateStory(sId, { status: 'approved' });
  };

  const handleQuickRevertStory = (sId: string) => {
    onUpdateStory(sId, { status: 'pending' });
  };

  const handleQuickRejectStory = (sId: string) => {
    onUpdateStory(sId, { status: 'rejected' });
  };

  // Infographic Handlers & File Upload
  const handleInfographicFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingInfo(true);
      setInfoUploadStatus({ type: 'loading', message: 'Đang tải ảnh infographic lên Firebase Storage...' });
      try {
        const cloudUrl = await uploadImageToFirebase(file, 'images/infographics');
        setInfoUrl(cloudUrl);
        setInfoUploadStatus({ type: 'success', message: '✅ Tải lên Firebase Storage thành công!' });
        setTimeout(() => setInfoUploadStatus(null), 4000);
      } catch (err) {
        console.error('Error uploading infographic image:', err);
        setInfoUploadStatus({ type: 'error', message: '❌ Tải lên thất bại!' });
        setTimeout(() => setInfoUploadStatus(null), 5000);
      } finally {
        setIsUploadingInfo(false);
      }
    }
  };

  const handleOpenEditInfographic = (info: QAInfographic) => {
    setEditingInfo(info);
    setInfoTitle(info.title);
    setInfoUrl(info.imageUrl);
    setInfoDesc(info.description || '');
    setInfoCategory(info.category || 'Phương pháp học tập');
  };

  const handleSaveEditInfographic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInfo) return;
    if (!infoTitle.trim() || !infoUrl.trim()) {
      alert('Vui lòng nhập tiêu đề và ảnh infographic!');
      return;
    }
    // Delete existing and re-add or recreate
    onDeleteInfographic(editingInfo.id);
    onAddInfographic({
      title: infoTitle.trim(),
      imageUrl: infoUrl.trim(),
      description: infoDesc.trim() || 'Tài liệu tư vấn trực quan cho học sinh THPT',
      category: infoCategory,
      author: 'Tổ Tư vấn Học đường THPT Ba Chúc',
      uploadDate: new Date().toLocaleDateString('vi-VN'),
    });
    setEditingInfo(null);
    setInfoTitle('');
    setInfoUrl('');
    setInfoDesc('');
  };

  // Volunteer Union Member Management
  const handleApproveRegistration = (r: YouthRegistration) => {
    onUpdateRegistration(r.id, { status: 'accepted' });
  };

  const handleRevertRegistration = (r: YouthRegistration) => {
    onUpdateRegistration(r.id, { status: 'pending' });
  };

  const handleOpenVolEdit = (m: VolunteerMember) => {
    setEditingVolMember(m);
    setVolEditName(m.fullName);
    setVolEditClass(m.className);
    setVolEditPhone(m.phone);
    setVolEditSkills(m.skills || '');
    setVolEditCount(m.activitiesCount ?? 0);
  };

  const handleSaveVolEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolMember || !onUpdateVolunteerMember) return;
    onUpdateVolunteerMember(editingVolMember.id, {
      fullName: volEditName.trim(),
      className: volEditClass.trim(),
      phone: volEditPhone.trim(),
      skills: volEditSkills.trim(),
      activitiesCount: Number(volEditCount) >= 0 ? Number(volEditCount) : 0,
    });
    setEditingVolMember(null);
  };

  const handleQuickIncrementAttendance = (m: VolunteerMember) => {
    if (!onUpdateVolunteerMember) return;
    const newCount = (m.activitiesCount || 0) + 1;
    const shouldHonor = newCount >= 5 && !m.isHonored;
    onUpdateVolunteerMember(m.id, {
      activitiesCount: newCount,
      isHonored: shouldHonor ? true : m.isHonored,
      status: shouldHonor ? ('honored' as const) : m.status,
      honorTitle: shouldHonor ? 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện' : m.honorTitle,
      honorDate: shouldHonor ? new Date().toLocaleDateString('vi-VN') : m.honorDate,
    });
    if (onAddAttendance) {
      onAddAttendance({
        fullName: m.fullName,
        className: m.className,
        activityName: 'Hoạt động phong trào Đoàn trường',
        date: new Date().toISOString().split('T')[0],
        location: 'Trường THPT Ba Chúc',
        timesParticipated: newCount,
        counselorVerified: true,
      });
    }
  };

  const handleOpenVolHonor = (m: VolunteerMember) => {
    setHonoringVolMember(m);
    setHonorTitleText(m.honorTitle || 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện');
    setHonorPhotoUrl(m.honorPhoto || m.avatarUrl || '');
  };

  const handleVolHonorFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingHonor(true);
      setHonorUploadStatus({ type: 'loading', message: 'Đang tải ảnh vinh danh lên Firebase Storage...' });
      try {
        const cloudUrl = await uploadImageToFirebase(file, 'images/honors');
        setHonorPhotoUrl(cloudUrl);
        setHonorUploadStatus({ type: 'success', message: '✅ Tải lên Firebase Storage thành công!' });
        setTimeout(() => setHonorUploadStatus(null), 4000);
      } catch (err) {
        console.error('Error uploading honor photo:', err);
        setHonorUploadStatus({ type: 'error', message: '❌ Tải lên thất bại!' });
        setTimeout(() => setHonorUploadStatus(null), 5000);
      } finally {
        setIsUploadingHonor(false);
      }
    }
  };

  const handleSaveVolHonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!honoringVolMember || !onHonorMember) return;
    onHonorMember(honoringVolMember.id, honorTitleText.trim(), honorPhotoUrl.trim() || undefined);
    setHonoringVolMember(null);
  };

  const handleOpenVolDelete = (m: VolunteerMember) => {
    setDeletingVolMember(m);
    setVolDeleteReason('graduated_12');
    setVolDeleteCustomNote('');
  };

  const handleConfirmVolDelete = (actionType: 'remove_completely' | 'change_status' = 'remove_completely') => {
    if (!deletingVolMember) return;
    if (actionType === 'remove_completely') {
      if (onDeleteVolunteerMember) {
        onDeleteVolunteerMember(deletingVolMember.id);
      }
      setDeletingVolMember(null);
      return;
    }

    const reasonLabels: Record<VolunteerStatus, string> = {
      active: 'Đang hoạt động',
      honored: 'Đã vinh danh',
      graduated_12: 'Hoàn thành lớp 12 (Tốt nghiệp)',
      inactive_rules_violation: 'Không nghiêm túc trong phong trào tình nguyện',
      inactive_low_performance: 'Sức học giảm sút (Tạm dừng để tập trung học tập)',
    };
    const finalReason = volDeleteCustomNote.trim() 
      ? `${reasonLabels[volDeleteReason]} - ${volDeleteCustomNote.trim()}`
      : reasonLabels[volDeleteReason];

    if (onUpdateVolunteerMember) {
      onUpdateVolunteerMember(deletingVolMember.id, {
        status: volDeleteReason,
        statusReason: finalReason,
      });
    }
    setDeletingVolMember(null);
  };

  const handleSaveManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attFullName.trim() || !attClassName.trim()) {
      alert('Vui lòng nhập họ tên và lớp của học sinh!');
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
        counselorVerified: true,
      });
    }
    setAttSavedMsg(true);
    setAttFullName('');
    setAttClassName('');
    setTimeout(() => setAttSavedMsg(false), 3000);
  };

  const handleCreateInfographic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoTitle.trim() || !infoUrl.trim()) {
      alert('Vui lòng nhập tiêu đề và link ảnh infographic!');
      return;
    }
    onAddInfographic({
      title: infoTitle.trim(),
      imageUrl: infoUrl.trim(),
      description: infoDesc.trim() || 'Tài liệu tư vấn trực quan cho học sinh THPT',
      category: infoCategory,
      author: 'Tổ Tư vấn Học đường THPT Ba Chúc',
      uploadDate: new Date().toLocaleDateString('vi-VN'),
    });
    setInfoTitle('');
    setInfoUrl('');
    setInfoDesc('');
  };

  const handleSchoolLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const oldLogo = editConfig.schoolLogo;
      setIsUploadingLogo(true);
      setLogoUploadStatus({ type: 'loading', message: 'Đang tải logo lên Firebase Storage...' });
      try {
        const cloudUrl = await uploadImageToFirebase(file, 'images/logo');
        const updatedConfig = { ...editConfig, schoolLogo: cloudUrl };
        setEditConfig(updatedConfig);
        onUpdateConfig(updatedConfig);
        setLogoUploadStatus({ type: 'success', message: '✅ Tải lên Storage & Lưu Firestore thành công!' });
        if (oldLogo && oldLogo !== cloudUrl && oldLogo.includes('firebasestorage.googleapis.com')) {
          deleteImageFromFirebase(oldLogo);
        }
        setTimeout(() => setLogoUploadStatus(null), 5000);
      } catch (err) {
        console.error('Error uploading logo to Firebase Storage:', err);
        setLogoUploadStatus({ type: 'error', message: '❌ Tải lên thất bại, vui lòng thử lại!' });
        setTimeout(() => setLogoUploadStatus(null), 6000);
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleHeroBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const oldBanner = editConfig.heroBannerImage;
      setIsUploadingBanner(true);
      setBannerUploadStatus({ type: 'loading', message: 'Đang tải ảnh trung tâm lên Firebase Storage...' });
      try {
        const cloudUrl = await uploadImageToFirebase(file, 'images/banner');
        const updatedConfig = { ...editConfig, heroBannerImage: cloudUrl };
        setEditConfig(updatedConfig);
        onUpdateConfig(updatedConfig);
        setBannerUploadStatus({ type: 'success', message: '✅ Tải lên Storage & Lưu Firestore thành công!' });
        if (oldBanner && oldBanner !== cloudUrl && oldBanner.includes('firebasestorage.googleapis.com')) {
          deleteImageFromFirebase(oldBanner);
        }
        setTimeout(() => setBannerUploadStatus(null), 5000);
      } catch (err) {
        console.error('Error uploading hero banner to Firebase Storage:', err);
        setBannerUploadStatus({ type: 'error', message: '❌ Tải lên thất bại, vui lòng thử lại!' });
        setTimeout(() => setBannerUploadStatus(null), 6000);
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  const handleSaveConfigForm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editConfig);
    setSyncStatus('✅ Đã lưu cấu hình và đồng bộ toàn bộ hệ thống lên Cloud Firestore thành công!');
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const triggerGoogleSheetsSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Đang đồng bộ toàn bộ dữ liệu hệ thống sang Google Sheets...');
    const result = await syncAllToGoogleSheets();
    setIsSyncing(false);
    if (result.success) {
      setSyncStatus(`✅ ${result.message}`);
    } else {
      setSyncStatus(`⚠️ ${result.message}`);
    }
    setTimeout(() => setSyncStatus(null), 8000);
  };

  const handleManualSaveAll = () => {
    triggerAutoBackup();
    onUpdateConfig(editConfig);
    setSyncStatus('💾 Toàn bộ dữ liệu, danh sách và cấu hình đã được LƯU VÀ SAO LƯU AN TOÀN vào hệ thống bền vững!');
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const copyScriptToClipboard = () => {
    const code = generateGoogleAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // Export Chat Logs to JSON or CSV
  const exportAILogs = () => {
    const content = JSON.stringify(aiLogs, null, 2);
    downloadFile(`Nhat_Ky_Chat_AI_${new Date().toISOString().slice(0, 10)}.json`, content, 'application/json');
  };

  // Filtered AI Logs
  const filteredAILogs = aiLogs.filter(log => {
    const matchKeyword = !searchLogKeyword || 
      log.userQuestion.toLowerCase().includes(searchLogKeyword.toLowerCase()) ||
      log.aiResponse.toLowerCase().includes(searchLogKeyword.toLowerCase());
    const matchCat = filterLogCategory === 'Tất cả' || log.topicCategory === filterLogCategory;
    const matchEmerg = filterLogEmergency === 'Tất cả' || 
      (filterLogEmergency === 'Khẩn cấp' && log.isEmergency) ||
      (filterLogEmergency === 'Bình thường' && !log.isEmergency);
    return matchKeyword && matchCat && matchEmerg;
  });

  return (
    <div className="py-8 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>TRUNG TÂM ĐIỀU HÀNH & QUẢN TRỊ NỘI BỘ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              BAN QUẢN TRỊ TƯ VẤN HỌC ĐƯỜNG
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              TRƯỜNG THPT BA CHÚC - ĐOÀN THANH NIÊN & TỔ TƯ VẤN HỌC ĐƯỜNG
            </p>
          </div>

          {/* Action Buttons: Save & Sync & Export Monthly Report */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl text-xs font-black flex items-center space-x-2 shadow-lg transition cursor-pointer"
              title="Xuất báo cáo tình hình tư vấn tâm lý học đường định kỳ (File CSV / PDF)"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>XUẤT BÁO CÁO THÁNG (PDF/CSV)</span>
            </button>

            <button
              onClick={handleManualSaveAll}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>LƯU THAY ĐỔI & SAO LƯU</span>
            </button>

            <button
              onClick={triggerGoogleSheetsSync}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'ĐỒNG BỘ GOOGLE SHEETS'}</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg transition cursor-pointer"
                title="Đăng xuất khỏi bảng quản trị"
              >
                <LogOut className="w-4 h-4" />
                <span>ĐĂNG XUẤT</span>
              </button>
            )}
          </div>
        </div>

        {syncStatus && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{syncStatus}</span>
            </div>
            <button onClick={() => setSyncStatus(null)} className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 bg-white rounded-lg border border-slate-200">Đóng</button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>Thống Kê Hỏi Đáp (Bảo Mật)</span>
          </button>

          <button
            onClick={() => setActiveTab('counselors')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'counselors'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-yellow-400" />
            <span>Đội Ngũ Thầy Cô & Avatar ({counselors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_prompts')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'ai_prompts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Cập Nhật Câu Hỏi AI ({aiPrompts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_logs')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'ai_logs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Nhật Ký Lưu Trữ Chat ({aiLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'qa'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Hỏi & Đáp Web ({questions.length})</span>
            {totalPending > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-black">
                {totalPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('health_articles')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'health_articles'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Cẩm Nang Y Tế ({healthArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'stories'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chuyện Muốn Kể ({stories.length})</span>
            {stories.filter((s) => s.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
                {stories.filter((s) => s.status === 'pending').length} chờ duyệt
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('youth')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'youth'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flag className="w-4 h-4 text-red-500" />
            <span>Hồ Sơ Đoàn & Tình Nguyện ({registrations.length})</span>
            {registrations.filter(r => r.status === 'pending' || !r.status).length > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
                {registrations.filter(r => r.status === 'pending' || !r.status).length} mới
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-500" />
            <span>Bài Viết & Infographic ({activities.length + infographics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu Hình Trường & Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('firewall')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'firewall'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Tường Lửa & An Ninh Mã Nguồn</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        {/* TAB 1: THỐNG KÊ HỎI ĐÁP & PHÂN TÍCH CHUYÊN SÂU (BẢO MẬT ADMIN) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Sub-navigation */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setAnalyticsSubView('overview')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  analyticsSubView === 'overview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Tổng Quan Chung & AI</span>
              </button>

              <button
                onClick={() => setAnalyticsSubView('qa_charts')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  analyticsSubView === 'qa_charts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Biểu Đồ Hỏi Đáp & Tư Vấn</span>
              </button>

              <button
                onClick={() => setAnalyticsSubView('youth_charts')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                  analyticsSubView === 'youth_charts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-4 h-4 text-red-500" />
                <span>Biểu Đồ Đoàn & Tình Nguyện</span>
              </button>

              <div className="ml-auto flex items-center">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                  title="Mở bảng trích xuất & xuất báo cáo định kỳ tháng"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>📑 Xuất Báo Cáo Tháng (PDF/CSV)</span>
                </button>
              </div>
            </div>

            {analyticsSubView === 'qa_charts' && (
              <QAChartsView questions={questions} isAdmin={true} />
            )}

            {analyticsSubView === 'youth_charts' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                  <button
                    onClick={() => setYouthAnalyticsMode('activity_recharts')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                      youthAnalyticsMode === 'activity_recharts'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-300" />
                    <span>Thống Kê Tham Gia Từng Hoạt Động (Recharts 📊)</span>
                  </button>
                  <button
                    onClick={() => setYouthAnalyticsMode('member_demographics')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                      youthAnalyticsMode === 'member_demographics'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Cơ Cấu Đoàn Viên & Đăng Ký Mới</span>
                  </button>
                </div>

                {youthAnalyticsMode === 'activity_recharts' ? (
                  <VolunteerActivityCharts
                    volunteerMembers={volunteerMembers || []}
                    volunteerAttendance={volunteerAttendance || []}
                    activities={activities}
                    registrations={registrations}
                  />
                ) : (
                  <YouthChartsView
                    volunteerMembers={volunteerMembers || []}
                    registrations={registrations}
                    attendance={volunteerAttendance || []}
                  />
                )}
              </div>
            )}

            {analyticsSubView === 'overview' && (
              <div className="space-y-6">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Tổng Lượt Hỏi Đáp AI</span>
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-purple-700">{totalAILogs}</div>
                <p className="text-[11px] text-slate-500">
                  Lưu trữ tự động từ phiên trò chuyện của học sinh
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Câu Hỏi Web Đã Trả Lời</span>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600">{totalAnswered}</div>
                <p className="text-[11px] text-slate-500">
                  Thầy Cô đã duyệt và đăng công khai trên web
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Câu Hỏi Web Đang Chờ</span>
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600">{totalPending}</div>
                <p className="text-[11px] text-slate-500">
                  Cần Thầy Cô vào duyệt và trả lời chuyên sâu
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                  <span>Cảnh Báo Khẩn Cấp</span>
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-rose-600">{totalEmergencies}</div>
                <p className="text-[11px] text-slate-500">
                  Phát hiện từ khóa tâm lý nhạy cảm / nguy cơ can thiệp
                </p>
              </div>
            </div>

            {/* Visual Topic Breakdown Meter */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    <span>THỐNG KÊ PHÂN BỔ THEO CHỦ ĐỀ QUAN TÂM</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu tổng hợp từ các lượt hỏi đáp AI và câu hỏi gửi về trường (Chỉ hiển thị cho Quản trị viên)
                  </p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                  Tổng: {totalAllQueries} lượt
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOPIC_LIST.map((topic) => {
                  const count = topicCounts[topic] || 0;
                  const percent = totalAllQueries > 0 ? Math.round((count / totalAllQueries) * 100) : 0;
                  return (
                    <div key={topic} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          <span>{topic}</span>
                        </span>
                        <span className="font-extrabold text-indigo-700">
                          {count} câu ({percent}%)
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Khuyến nghị cho Ban Giám hiệu & Thầy Cô:</strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Vào các thời điểm cao điểm (mùa thi THPT, đầu năm học mới, mùa chọn trường Đại học), Quản trị viên nên cập nhật thêm các câu hỏi gợi ý trong mục <strong>"Cập nhật Câu hỏi AI"</strong> để định hướng học sinh tốt hơn.
                  </p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      )}

        {/* TAB: QUẢN LÝ ĐỘI NGŨ THẦY CÔ & ĐỔI AVATAR (NEW!) */}
        {activeTab === 'counselors' && (
          <div className="space-y-6">
            {/* Form Add / Edit Counselor */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <Users className="w-5 h-5 text-yellow-500" />
                    <span>{editingCounselorId ? 'CHỈNH SỬA THÔNG TIN & AVATAR THẦY CÔ' : 'THÊM MỚI THẦY CÔ VÀO ĐỘI NGŨ TƯ VẤN'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cập nhật tên giáo viên, chức vụ, chuyên môn, số điện thoại và thay đổi ảnh đại diện (avatar) cho từng thầy cô.
                  </p>
                </div>
                {editingCounselorId && (
                  <button
                    onClick={handleResetCounselorForm}
                    className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>

              {counselorSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã lưu thông tin Thầy Cô thành công!</span>
                </div>
              )}

              <form onSubmit={handleSaveCounselor} className="space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Họ và tên Thầy / Cô <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={counselorFormName}
                      onChange={(e) => setCounselorFormName(e.target.value)}
                      placeholder="Ví dụ: Thầy Trần Văn Được, Thầy Lê Hoàng Giang, Cô Nguyễn Thị Hiệp..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Chức vụ & Đơn vị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={counselorFormRole}
                      onChange={(e) => setCounselorFormRole(e.target.value)}
                      placeholder="Ví dụ: BT Đoàn, PBT Đoàn, Tổ trưởng Tổ GDKT&PL - Địa lý..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Lĩnh vực phụ trách / Chuyên môn tư vấn
                  </label>
                  <textarea
                    rows={2}
                    value={counselorFormSpecialty}
                    onChange={(e) => setCounselorFormSpecialty(e.target.value)}
                    placeholder="Ví dụ: Phụ trách phong trào Đoàn, Kỹ năng sống, Tư vấn Tâm lý, Pháp luật học đường & Định hướng nghề nghiệp..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                  />
                </div>

                {/* Avatar Selection Area */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <label className="font-bold text-slate-800 text-xs block">
                        Chọn Avatar (Ảnh Đại Diện) cho Thầy/Cô
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Nhấp vào ảnh mẫu bên dưới để đổi ngay, hoặc dán link ảnh / tải ảnh mới lên
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] text-slate-500">Xem trước:</span>
                      <img
                        src={counselorFormAvatar}
                        alt="Avatar preview"
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = sampleTeacherAvatars[0];
                        }}
                      />
                    </div>
                  </div>

                  {/* Preset Avatars Gallery */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">Kho ảnh đại diện mẫu:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {sampleTeacherAvatars.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCounselorFormAvatar(url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                            counselorFormAvatar === url
                              ? 'border-yellow-500 ring-2 ring-yellow-400 scale-105'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Preset ${idx + 1}`}
                            className="w-full h-12 object-cover rounded-lg"
                          />
                          {counselorFormAvatar === url && (
                            <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-yellow-600 bg-white rounded-full p-0.5 shadow" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom URL or Upload Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                    <div className="sm:col-span-8">
                      <input
                        type="url"
                        value={counselorFormAvatar}
                        onChange={(e) => setCounselorFormAvatar(e.target.value)}
                        placeholder="Hoặc dán trực tiếp đường link ảnh (URL) vào đây..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer transition">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tải ảnh từ máy tính</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Số điện thoại liên hệ / Hotline
                    </label>
                    <input
                      type="text"
                      value={counselorFormPhone}
                      onChange={(e) => setCounselorFormPhone(e.target.value)}
                      placeholder="0789 620 212"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">
                      Email liên hệ (Tuỳ chọn)
                    </label>
                    <input
                      type="email"
                      value={counselorFormEmail}
                      onChange={(e) => setCounselorFormEmail(e.target.value)}
                      placeholder="thayco@thptbachuc.edu.vn"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  {editingCounselorId && (
                    <button
                      type="button"
                      onClick={handleResetCounselorForm}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCounselorId ? 'CẬP NHẬT THẦY CÔ' : 'LƯU THẦY CÔ VÀO DANH SÁCH'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Existing Counselors */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span>DANH SÁCH ĐỘI NGŨ THẦY CÔ HIỆN TẠI ({counselors.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {counselors.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3 text-center">
                      <div className="relative inline-block mx-auto">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = sampleTeacherAvatars[0];
                          }}
                        />
                        <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-yellow-100 text-yellow-900 font-bold rounded-md text-[11px]">
                          {c.role}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed text-left line-clamp-3 bg-white p-3 rounded-xl border border-slate-100">
                        {c.specialty}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-1 text-left pl-1">
                        <p className="flex items-center space-x-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone || config.hotline}</span>
                        </p>
                        {c.email && (
                          <p className="flex items-center space-x-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{c.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditCounselorClick(c)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Chỉnh sửa / Đổi Avatar</span>
                      </button>

                      {onDeleteCounselor && counselors.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa thông tin của ${c.name}?`)) {
                              onDeleteCounselor(c.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Xóa Thầy/Cô"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ CÂU HỎI GỢI Ý & BỘ CÂU TRẢ LỜI CHUẨN CHO CHAT AI */}
        {activeTab === 'ai_prompts' && (() => {
          const filteredPrompts = aiPrompts.filter((prompt) => {
            const matchesCategory = promptCategoryFilter === 'Tất cả' ? true : prompt.category === promptCategoryFilter;
            const searchLower = promptSearchTerm.toLowerCase();
            const matchesSearch = 
              prompt.promptText.toLowerCase().includes(searchLower) ||
              (prompt.answer || '').toLowerCase().includes(searchLower) ||
              (prompt.timePeriod || '').toLowerCase().includes(searchLower);
            return matchesCategory && matchesSearch;
          });

          return (
            <div className="space-y-6">
              {/* Form Add / Edit Prompt */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-purple-600" />
                      <span>{editingPromptId ? 'CHỈNH SỬA CÂU HỎI & CÂU TRẢ LỜI ĐỊNH HƯỚNG CHAT AI' : 'THÊM MỚI CÂU HỎI GỢI Ý & CÂU TRẢ LỜI CHUẨN CHO CHAT AI'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Thầy Cô quản trị cập nhật câu hỏi gợi ý và bổ sung câu trả lời chuẩn xác. Khi học sinh hỏi các câu hỏi tương tự, Chat AI sẽ bám sát trả lời đúng ý của nhà trường, không gây hoang mang cho học sinh.
                    </p>
                  </div>
                  {editingPromptId && (
                    <button
                      onClick={() => {
                        setEditingPromptId(null);
                        setNewPromptText('');
                        setNewPromptAnswer('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 underline"
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleCreateOrUpdatePrompt} className="space-y-4 text-xs sm:text-sm">
                  {/* Question textarea with auto-wrap */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 block">
                        1. Nội dung câu hỏi băn khoăn của học sinh <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium">Tự động xuống dòng khi nội dung dài, dễ xóa, dễ sửa</span>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={newPromptText}
                      onChange={(e) => setNewPromptText(e.target.value)}
                      placeholder="Ví dụ: Làm sao để ghi nhớ nhanh công thức môn Hóa và Toán khi ôn thi tốt nghiệp THPT?"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed whitespace-pre-wrap break-words resize-y text-slate-900 bg-white font-medium shadow-xs"
                    />
                  </div>

                  {/* Standard Answer / Guidance textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 block flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>2. Câu trả lời chuẩn xác & Định hướng tư vấn của Thầy Cô / Nhà trường</span>
                      </label>
                      <span className="text-[11px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        Chat AI sẽ học và trả lời theo nội dung này
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={newPromptAnswer}
                      onChange={(e) => setNewPromptAnswer(e.target.value)}
                      placeholder="Nhập câu trả lời chuẩn xác, định hướng thấu đáo của Thầy Cô. Khi học sinh hỏi vấn đề tương tự, Chat AI sẽ trả lời bám sát theo định hướng này để không gây hoang mang cho học sinh..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed whitespace-pre-wrap break-words resize-y text-slate-900 bg-white shadow-xs"
                    />
                    <p className="text-[11px] text-slate-500">
                      💡 <em>Gợi ý:</em> Bạn có thể gạch đầu dòng các ý quan trọng hoặc lời khuyên chi tiết để AI truyền đạt một cách gần gũi và đầy đủ nhất tới học sinh.
                    </p>
                  </div>

                  {/* Time period and Topic category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        Khoảng thời gian áp dụng <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={newPromptPeriod}
                        onChange={(e) => setNewPromptPeriod(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                      >
                        {PRESET_PERIODS.map((period) => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>

                      {newPromptPeriod === 'Tùy chỉnh khác...' && (
                        <input
                          type="text"
                          required
                          value={customPeriodText}
                          onChange={(e) => setCustomPeriodText(e.target.value)}
                          placeholder="Nhập tên giai đoạn (Ví dụ: Tháng 11 - Tri ân Thầy Cô)"
                          className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-slate-200"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        Chủ đề tư vấn <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={newPromptCategory}
                        onChange={(e) => setNewPromptCategory(e.target.value as TopicType)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                      >
                        {TOPIC_LIST.map((topic) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                    {editingPromptId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPromptId(null);
                          setNewPromptText('');
                          setNewPromptAnswer('');
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingPromptId ? 'CẬP NHẬT CÂU HỎI & CÂU TRẢ LỜI' : 'LƯU VÀO BỘ CÂU HỎI & TRẢ LỜI AI'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List of active AI Prompts */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <span>BỘ CÂU HỎI & CÂU TRẢ LỜI ĐỊNH HƯỚNG AI ({aiPrompts.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Danh sách các câu hỏi gợi ý và định hướng trả lời chuẩn để trợ lý AI phục vụ học sinh.
                    </p>
                  </div>

                  {/* Filter and Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promptSearchTerm}
                        onChange={(e) => setPromptSearchTerm(e.target.value)}
                        placeholder="Tìm câu hỏi, câu trả lời..."
                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <select
                      value={promptCategoryFilter}
                      onChange={(e) => setPromptCategoryFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Tất cả">Tất cả chủ đề</option>
                      {TOPIC_LIST.map((topic) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredPrompts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    {aiPrompts.length === 0
                      ? 'Chưa có câu hỏi gợi ý nào. Hãy thêm câu hỏi đầu tiên ở khung phía trên!'
                      : 'Không tìm thấy câu hỏi nào phù hợp với bộ lọc tìm kiếm.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded-md text-[11px]">
                              {prompt.category}
                            </span>
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-[11px] flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{prompt.timePeriod}</span>
                            </span>
                            {prompt.isActive ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                                ● Đang hiển thị
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-bold rounded text-[10px]">
                                ○ Tạm ẩn
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                            <button
                              onClick={() => onUpdateAIPrompt(prompt.id, { isActive: !prompt.isActive })}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                              title={prompt.isActive ? 'Tạm ẩn câu hỏi này' : 'Bật hiển thị lại'}
                            >
                              {prompt.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            <button
                              onClick={() => handleEditPromptClick(prompt)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                              title="Chỉnh sửa câu hỏi & câu trả lời"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa câu hỏi gợi ý này?')) {
                                  onDeleteAIPrompt(prompt.id);
                                }
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question text with wrap */}
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-500 uppercase">Câu hỏi gợi ý của học sinh:</p>
                          <p className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-wrap break-words">
                            "{prompt.promptText}"
                          </p>
                        </div>

                        {/* Standard Answer box */}
                        {prompt.answer ? (
                          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                            <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Định hướng & Câu trả lời chuẩn của Nhà trường:</span>
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                              {prompt.answer}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-500 italic flex items-center justify-between">
                            <span>Chưa có câu trả lời mẫu cho câu hỏi này.</span>
                            <button
                              onClick={() => handleEditPromptClick(prompt)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold not-italic underline ml-2"
                            >
                              + Thêm câu trả lời mẫu
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 3: NHẬT KÝ LƯU TRỮ VÀ TRA CỨU HỎI ĐÁP AI (CHỈ QUẢN TRỊ VIÊN) */}
        {activeTab === 'ai_logs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>NHẬT KÝ LƯU TRỮ HỎI ĐÁP VỚI CHAT AI ({aiLogs.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tất cả các câu hỏi của học sinh trao đổi với AI được lưu trữ an toàn tại đây để phục vụ công tác quản lý và hỗ trợ học sinh.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportAILogs}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất File Báo Cáo</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchLogKeyword}
                  onChange={(e) => setSearchLogKeyword(e.target.value)}
                  placeholder="Tìm kiếm nội dung câu hỏi hoặc câu trả lời..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={filterLogCategory}
                  onChange={(e) => setFilterLogCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Tất cả">Tất cả chủ đề</option>
                  {TOPIC_LIST.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterLogEmergency}
                  onChange={(e) => setFilterLogEmergency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Tất cả">Tất cả mức độ</option>
                  <option value="Bình thường">Bình thường</option>
                  <option value="Khẩn cấp">🚨 Có cảnh báo khẩn cấp</option>
                </select>
              </div>
            </div>

            {/* Logs List / Table */}
            {filteredAILogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Không tìm thấy nhật ký hỏi đáp nào khớp với điều kiện tìm kiếm.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAILogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-2xl border transition ${
                      log.isEmergency 
                        ? 'bg-rose-50/70 border-rose-300' 
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-b border-slate-200/60 pb-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-md text-[10px]">
                          {log.topicCategory}
                        </span>
                        {log.isEmergency && (
                          <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded-md text-[10px] animate-pulse">
                            🚨 CẢNH BÁO TÂM LÝ
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10px]">Mã ID: {log.id}</span>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="font-black text-blue-700 shrink-0">Học sinh hỏi:</span>
                        <p className="text-slate-900 font-medium">{log.userQuestion}</p>
                      </div>
                      <div className="flex items-start space-x-2 bg-white/80 p-3 rounded-xl border border-slate-200/60">
                        <span className="font-black text-purple-700 shrink-0">AI trả lời:</span>
                        <p className="text-slate-700 whitespace-pre-line text-xs leading-relaxed">{log.aiResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: XỬ LÝ CÂU HỎI TƯ VẤN TỪ WEB FORM */}
        {activeTab === 'qa' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>DANH SÁCH CÂU HỎI TƯ VẤN TỪ HỌC SINH ({questions.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thầy Cô có thể chỉnh sửa nội dung câu hỏi, câu trả lời, thông tin học sinh/lớp cho phù hợp với trường Ba Chúc và tự động lưu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                  title="Xuất báo cáo tư vấn tâm lý học đường định kỳ"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Xuất Báo Cáo Tháng (PDF/CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={exportQuestionsCSV}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  title="Tải nhanh toàn bộ file CSV câu hỏi"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Tải CSV Nhanh</span>
                </button>
              </div>
            </div>

            {/* QA Edit Modal */}
            {editingQuestion && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5 my-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                      <Edit3 className="w-5 h-5 text-indigo-600" />
                      <span>CHỈNH SỬA CÂU HỎI & CÂU TRẢ LỜI TƯ VẤN</span>
                    </h4>
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditQuestion} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Họ tên học sinh:</label>
                        <input
                          type="text"
                          value={qEditStudentName}
                          onChange={(e) => setQEditStudentName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
                        <input
                          type="text"
                          value={qEditClass}
                          onChange={(e) => setQEditClass(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Chủ đề tư vấn:</label>
                        <select
                          value={qEditTopic}
                          onChange={(e) => setQEditTopic(e.target.value as TopicType)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          {TOPIC_LIST.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nội dung câu hỏi của học sinh:</label>
                      <textarea
                        rows={3}
                        required
                        value={qEditQuestion}
                        onChange={(e) => setQEditQuestion(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300 leading-relaxed font-sans whitespace-pre-wrap break-words resize-y text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nội dung câu trả lời của Thầy/Cô:</label>
                      <textarea
                        rows={5}
                        value={qEditAnswer}
                        onChange={(e) => setQEditAnswer(e.target.value)}
                        placeholder="Nhập lời tư vấn, hướng dẫn chi tiết gửi đến học sinh..."
                        className="w-full p-3 rounded-xl border border-slate-300 leading-relaxed font-sans whitespace-pre-wrap break-words resize-y text-slate-900 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Người trả lời:</label>
                        <input
                          type="text"
                          value={qEditAnsweredBy}
                          onChange={(e) => setQEditAnsweredBy(e.target.value)}
                          placeholder="Ví dụ: Thầy Trần Văn Được - BT Đoàn..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Trạng thái duyệt:</label>
                        <select
                          value={qEditStatus}
                          onChange={(e) => setQEditStatus(e.target.value as 'pending' | 'answered')}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="answered">Đã trả lời & Đăng công khai</option>
                          <option value="pending">Chờ xử lý / Bản nháp</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="qEditIsPublic"
                        checked={qEditIsPublic}
                        onChange={(e) => setQEditIsPublic(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="qEditIsPublic" className="font-semibold text-slate-700 text-xs cursor-pointer">
                        Công khai hiển thị trên trang chủ Hỏi & Đáp của trường
                      </label>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(null)}
                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Thay Đổi (Tự Sao Lưu)</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    q.status === 'answered'
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-amber-50/60 border-amber-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-200/60 pb-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        {q.code}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {q.isAnonymous ? 'Học sinh ẩn danh' : q.studentName} (Lớp {q.className})
                      </span>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded-md text-[10px]">
                        {q.topic}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      q.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-500 text-white animate-pulse'
                    }`}>
                      {q.status === 'answered' ? '✓ Đã trả lời' : 'Chờ xử lý'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <p className="text-slate-900 font-medium leading-relaxed">
                      <strong className="text-slate-900">Nội dung câu hỏi:</strong> {q.question}
                    </p>

                    {q.answer && (
                      <div className="mt-3 p-3.5 bg-white rounded-xl border border-emerald-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                          <span>Người trả lời: {q.answeredBy}</span>
                          <span>{q.answeredAt ? new Date(q.answeredAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                          {q.answer}
                        </p>
                      </div>
                    )}

                    {/* Answering Form if expanding */}
                    {answeringQuestionId === q.id && (
                      <div className="mt-3 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-3">
                        <label className="font-bold text-xs text-indigo-900 block">
                          Nhập câu trả lời nhanh của Thầy Cô / Chuyên gia:
                        </label>
                        <textarea
                          rows={5}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Nhập lời tư vấn, động viên và hướng giải quyết gửi đến học sinh..."
                          className="w-full p-3 text-xs bg-white rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-sans whitespace-pre-wrap break-words resize-y"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Chọn Thầy/Cô phụ trách trả lời:
                            </label>
                            <select
                              value={counselorName}
                              onChange={(e) => setCounselorName(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-200 bg-white"
                            >
                              {counselors.map((c) => (
                                <option key={c.id} value={`${c.name} (${c.role})`}>
                                  {c.name} - {c.role}
                                </option>
                              ))}
                              <option value="Tổ Tư vấn Học đường THPT Ba Chúc">Tổ Tư vấn Học đường THPT Ba Chúc</option>
                              <option value="Ban Chấp Hành Đoàn Trường THPT Ba Chúc">Ban Chấp Hành Đoàn Trường THPT Ba Chúc</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Trạng thái:
                            </label>
                            <select
                              value={answerStatusChoice}
                              onChange={(e) => setAnswerStatusChoice(e.target.value as 'answered' | 'pending')}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-200 bg-white font-semibold"
                            >
                              <option value="answered">Đã trả lời (Công khai lên Web)</option>
                              <option value="pending">Bản nháp (Đang chờ)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            onClick={() => setAnsweringQuestionId(null)}
                            className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleSaveAnswer(q.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Lưu & Đăng Trả Lời</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center space-x-1"
                        title="Chỉnh sửa toàn diện nội dung câu hỏi/trả lời/thông tin trường lớp"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Sửa toàn diện</span>
                      </button>

                      <button
                        onClick={() => handleOpenAnswerBox(q)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{q.status === 'answered' ? 'Sửa câu trả lời' : 'Trả lời ngay'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                            onDeleteQuestion(q.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: QUẢN LÝ CẨM NANG & TUYÊN TRUYỀN Y TẾ HỌC ĐƯỜNG */}
        {activeTab === 'health_articles' && (() => {
          const filteredArticles = healthArticles.filter(art => {
            const matchesCategory = healthCategoryFilter === 'all' || art.category === healthCategoryFilter;
            const searchLower = healthSearchTerm.toLowerCase();
            const matchesSearch = !searchLower ||
              art.title.toLowerCase().includes(searchLower) ||
              art.content.toLowerCase().includes(searchLower) ||
              (art.summary || '').toLowerCase().includes(searchLower) ||
              (art.author || '').toLowerCase().includes(searchLower);
            return matchesCategory && matchesSearch;
          });

          const handleOpenAddHealth = () => {
            setEditingHealthArticle(null);
            setHEditTitle('');
            setHEditCategory('Bệnh học đường');
            setHEditReadTime('3 phút đọc');
            setHEditAuthor(counselors.find(c => c.role.includes('Y tế'))?.name || 'Cô Nguyễn Thị Hiệp (Cán bộ Y tế)');
            setHEditSummary('');
            setHEditContent(`### 1. Thực trạng & Nguy cơ học đường\n...\n\n### 2. Biện pháp phòng tránh\n...\n\n### 3. Lời dặn từ Cán bộ Y tế\n...`);
            setHEditTips(['Uống đủ nước mỗi ngày', 'Giữ đúng tư thế khi ngồi học']);
            setHEditImage('https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80');
            setIsHealthModalOpen(true);
          };

          const handleOpenEditHealth = (art: HealthArticle) => {
            setEditingHealthArticle(art);
            setHEditTitle(art.title);
            setHEditCategory(art.category);
            setHEditReadTime(art.readTime || '3 phút đọc');
            setHEditAuthor(art.author || 'Cô Nguyễn Thị Hiệp');
            setHEditSummary(art.summary || '');
            setHEditContent(art.content || '');
            setHEditTips(art.tips && art.tips.length > 0 ? art.tips : ['']);
            setHEditImage(art.imageUrl || '');
            setIsHealthModalOpen(true);
          };

          const handleSaveHealth = (e: React.FormEvent) => {
            e.preventDefault();
            if (!hEditTitle.trim() || !hEditContent.trim()) {
              alert('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!');
              return;
            }
            const cleanTips = hEditTips.map(t => t.trim()).filter(t => t.length > 0);

            if (editingHealthArticle) {
              if (onUpdateHealthArticle) {
                onUpdateHealthArticle(editingHealthArticle.id, {
                  title: hEditTitle.trim(),
                  category: hEditCategory,
                  readTime: hEditReadTime.trim() || '3 phút đọc',
                  author: hEditAuthor.trim(),
                  summary: hEditSummary.trim() || hEditContent.substring(0, 150) + '...',
                  content: hEditContent.trim(),
                  tips: cleanTips.length > 0 ? cleanTips : ['Tuân thủ hướng dẫn của Cán bộ Y tế'],
                  imageUrl: hEditImage.trim() || undefined,
                });
              }
            } else {
              if (onAddHealthArticle) {
                onAddHealthArticle({
                  title: hEditTitle.trim(),
                  category: hEditCategory,
                  readTime: hEditReadTime.trim() || '3 phút đọc',
                  author: hEditAuthor.trim(),
                  summary: hEditSummary.trim() || hEditContent.substring(0, 150) + '...',
                  content: hEditContent.trim(),
                  tips: cleanTips.length > 0 ? cleanTips : ['Tuân thủ hướng dẫn của Cán bộ Y tế'],
                  imageUrl: hEditImage.trim() || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
                  publishedDate: new Date().toLocaleDateString('vi-VN'),
                  viewsCount: 0,
                });
              }
            }
            setIsHealthModalOpen(false);
          };

          const handleHImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                setIsCompressingHImg(true);
                const compressed = await compressImageFile(file, 1200, 800, 0.85);
                setHEditImage(compressed);
              } catch (err) {
                console.error(err);
              } finally {
                setIsCompressingHImg(false);
              }
            }
          };

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-teal-600" />
                    <span>QUẢN LÝ BÀI VIẾT CẨM NANG & TUYÊN TRUYỀN Y TẾ ({healthArticles.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Đăng tải bài viết mới, cập nhật chỉnh sửa bài viết đã có và quản lý kho tri thức y tế học đường.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddHealth}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Cẩm Nang Y Tế Mới</span>
                </button>
              </div>

              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={healthSearchTerm}
                    onChange={(e) => setHealthSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm bài viết cẩm nang y tế..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
                  {['all', 'Bệnh học đường', 'Dinh dưỡng', 'Sơ cấp cứu', 'Tâm sinh lý', 'Phòng chống dịch', 'Lối sống', 'Vấn đề sức khỏe khác'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setHealthCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                        healthCategoryFilter === cat
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'all' ? 'Tất cả chuyên mục' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-400 transition shadow-xs"
                  >
                    <div className="space-y-2.5">
                      {art.imageUrl && (
                        <div className="h-32 rounded-xl overflow-hidden bg-slate-200">
                          <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                          {art.category}
                        </span>
                        <span className="text-slate-400">{art.readTime || '3 phút'}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{art.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{art.summary}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">{art.author}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditHealth(art)}
                          className="p-1.5 text-teal-700 hover:bg-teal-100 rounded-lg transition cursor-pointer"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa bài viết "${art.title}"?`)) {
                              onDeleteHealthArticle && onDeleteHealthArticle(art.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin Modal for Health Articles */}
              {isHealthModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-black text-base sm:text-lg text-slate-900 flex items-center space-x-2">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                        <span>{editingHealthArticle ? 'Chỉnh Sửa Bài Viết Cẩm Nang' : 'Đăng Bài Cẩm Nang Mới'}</span>
                      </h4>
                      <button onClick={() => setIsHealthModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveHealth} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài viết:</label>
                        <input
                          type="text"
                          required
                          value={hEditTitle}
                          onChange={(e) => setHEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Chuyên mục:</label>
                          <select
                            value={hEditCategory}
                            onChange={(e) => setHEditCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                          >
                            <option value="Bệnh học đường">Bệnh học đường</option>
                            <option value="Dinh dưỡng">Dinh dưỡng</option>
                            <option value="Sơ cấp cứu">Sơ cấp cứu</option>
                            <option value="Tâm sinh lý">Tâm sinh lý</option>
                            <option value="Phòng chống dịch">Phòng chống dịch</option>
                            <option value="Lối sống">Lối sống</option>
                            <option value="Vấn đề sức khỏe khác">Vấn đề sức khỏe khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Thời gian đọc:</label>
                          <input
                            type="text"
                            value={hEditReadTime}
                            onChange={(e) => setHEditReadTime(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tác giả / Phụ trách:</label>
                          <input
                            type="text"
                            value={hEditAuthor}
                            onChange={(e) => setHEditAuthor(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tóm tắt ngắn:</label>
                        <textarea
                          rows={2}
                          value={hEditSummary}
                          onChange={(e) => setHEditSummary(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết (hỗ trợ ### 1. Tiêu đề):</label>
                        <textarea
                          rows={7}
                          required
                          value={hEditContent}
                          onChange={(e) => setHEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700">Lời dặn cốt lõi từ Cán bộ Y tế:</label>
                          <button
                            type="button"
                            onClick={() => setHEditTips([...hEditTips, ''])}
                            className="text-teal-600 font-bold hover:underline cursor-pointer"
                          >
                            + Thêm lời dặn
                          </button>
                        </div>
                        {hEditTips.map((tip, idx) => (
                          <div key={idx} className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={tip}
                              onChange={(e) => {
                                const next = [...hEditTips];
                                next[idx] = e.target.value;
                                setHEditTips(next);
                              }}
                              placeholder={`Lời dặn ${idx + 1}...`}
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (hEditTips.length > 1) {
                                  setHEditTips(hEditTips.filter((_, i) => i !== idx));
                                } else {
                                  setHEditTips(['']);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Ảnh minh họa:</label>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer font-bold">
                            <span>{isCompressingHImg ? 'Đang nén...' : 'Tải ảnh'}</span>
                            <input type="file" accept="image/*" onChange={handleHImageUpload} className="hidden" />
                          </label>
                          <input
                            type="text"
                            value={hEditImage}
                            onChange={(e) => setHEditImage(e.target.value)}
                            placeholder="Hoặc dán link ảnh..."
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsHealthModalOpen(false)}
                          className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                        >
                          Lưu bài viết
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 5: DUYỆT BÀI & QUẢN TRỊ CHUYỆN MUỐN KỂ */}
        {activeTab === 'stories' && (() => {
          const pendingCount = stories.filter((s) => s.status === 'pending').length;
          const approvedCount = stories.filter((s) => s.status === 'approved').length;
          const rejectedCount = stories.filter((s) => s.status === 'rejected').length;

          const filteredAdminStories = stories.filter((s) => {
            const matchesStatus = storyFilterStatus === 'all' ? true : s.status === storyFilterStatus;
            const searchLower = storySearchTerm.toLowerCase();
            const matchesSearch = 
              s.title.toLowerCase().includes(searchLower) ||
              s.content.toLowerCase().includes(searchLower) ||
              (s.authorName || '').toLowerCase().includes(searchLower) ||
              (s.className || '').toLowerCase().includes(searchLower) ||
              (s.code || '').toLowerCase().includes(searchLower);
            return matchesStatus && matchesSearch;
          });

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* Header & Description */}
              <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <span>QUẢN LÝ & DUYỆT BÀI CHUYỆN MUỐN KỂ ({stories.length})</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Quản trị viên có toàn quyền chỉnh sửa tiêu đề, họ tên, lớp, nội dung, hình ảnh và duyệt xuất bản lên trang chủ.
                  </p>
                </div>

                {pendingCount > 0 && (
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-xs font-bold shadow-xs animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Có {pendingCount} bài viết đang chờ Ban Quản trị phê duyệt</span>
                  </div>
                )}
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setStoryFilterStatus('all')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      storyFilterStatus === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({stories.length})
                  </button>
                  <button
                    onClick={() => setStoryFilterStatus('pending')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                      storyFilterStatus === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Chờ duyệt ({pendingCount})</span>
                  </button>
                  <button
                    onClick={() => setStoryFilterStatus('approved')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                      storyFilterStatus === 'approved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã xuất bản ({approvedCount})</span>
                  </button>
                  <button
                    onClick={() => setStoryFilterStatus('rejected')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                      storyFilterStatus === 'rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Đã ẩn / Từ chối ({rejectedCount})</span>
                  </button>
                </div>

                {/* Search input */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={storySearchTerm}
                    onChange={(e) => setStorySearchTerm(e.target.value)}
                    placeholder="Tìm theo tiêu đề, tác giả, lớp..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition"
                  />
                  {storySearchTerm && (
                    <button
                      onClick={() => setStorySearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Story Edit Modal */}
              {editingStory && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5 my-8 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                          <Edit3 className="w-5 h-5 text-indigo-600" />
                          <span>CHỈNH SỬA TOÀN DIỆN NỘI DUNG & HÌNH ẢNH CÂU CHUYỆN</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mã bài viết: <span className="font-mono font-bold text-slate-700">{editingStory.code}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingStory(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditStory} className="space-y-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
                      {/* Title */}
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Tiêu đề câu chuyện: <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={sEditTitle}
                          onChange={(e) => setSEditTitle(e.target.value)}
                          placeholder="Nhập tiêu đề ý nghĩa..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Author, Class, Anonymous toggle */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Tác giả / Học sinh:</label>
                          <input
                            type="text"
                            value={sEditAuthor}
                            onChange={(e) => setSEditAuthor(e.target.value)}
                            placeholder="Ví dụ: Nguyễn Văn An"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
                          <input
                            type="text"
                            value={sEditClass}
                            onChange={(e) => setSEditClass(e.target.value)}
                            placeholder="Ví dụ: 12A1"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div className="flex flex-col justify-center pt-2">
                          <label className="flex items-center space-x-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sEditIsAnonymous}
                              onChange={(e) => setSEditIsAnonymous(e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-bold text-slate-700 text-xs">Chế độ Ẩn Danh ngoài web</span>
                          </label>
                          <span className="text-[10px] text-slate-400 mt-0.5">Nếu chọn, người đọc sẽ thấy "Học sinh ẩn danh"</span>
                        </div>
                      </div>

                      {/* Topic & Date of Story */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Chủ đề câu chuyện:</label>
                          <select
                            value={sEditTag}
                            onChange={(e) => setSEditTag(e.target.value as TopicType)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                          >
                            {TOPIC_LIST.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Ngày & giờ đăng bài (Tùy chỉnh):</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={sEditCreatedAt}
                            onChange={(e) => setSEditCreatedAt(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Image Management: Upload / URL / Remove */}
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                        <label className="font-bold text-indigo-900 block flex items-center space-x-1.5">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          <span>Hình ảnh đính kèm bài viết:</span>
                        </label>

                        {sEditImage ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-indigo-200">
                            <img
                              src={sEditImage}
                              alt="Preview"
                              className="w-28 h-20 object-cover rounded-lg border border-slate-200 shadow-xs"
                            />
                            <div className="flex-1 space-y-1">
                              <p className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Đã có hình ảnh đính kèm</span>
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <label className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg cursor-pointer border border-indigo-200">
                                  <span>Thay ảnh khác từ máy</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleStoryImageFileUpload}
                                    className="hidden"
                                    disabled={isCompressingStoryImage}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setSEditImage('')}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200"
                                >
                                  Xóa hình ảnh
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label className="flex-1 px-4 py-3 bg-white hover:bg-indigo-50/80 text-indigo-700 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer flex items-center justify-center space-x-2 text-xs font-bold transition">
                                <Camera className="w-4 h-4 text-indigo-600" />
                                <span>{isCompressingStoryImage ? 'Đang nén ảnh...' : 'Tải ảnh từ máy tính / điện thoại'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleStoryImageFileUpload}
                                  className="hidden"
                                  disabled={isCompressingStoryImage}
                                />
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] text-slate-500 font-medium">Hoặc dán URL ảnh:</span>
                              <input
                                type="text"
                                value={sEditImage}
                                onChange={(e) => setSEditImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">
                          Nội dung câu chuyện: <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={7}
                          required
                          value={sEditContent}
                          onChange={(e) => setSEditContent(e.target.value)}
                          placeholder="Nội dung tâm sự của bạn học sinh..."
                          className="w-full p-3.5 rounded-xl border border-slate-300 leading-relaxed font-sans focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Counselor Note */}
                      <div>
                        <label className="font-bold text-slate-800 block mb-1">Lời nhắn gửi động viên của Thầy/Cô (Phòng Tư vấn):</label>
                        <textarea
                          rows={3}
                          value={sEditNote}
                          onChange={(e) => setSEditNote(e.target.value)}
                          placeholder="Nhập lời nhắn chia sẻ, động viên ấm áp của Thầy Cô dành cho học sinh..."
                          className="w-full p-3 rounded-xl border border-slate-300 leading-relaxed font-sans bg-amber-50/40 focus:border-amber-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Status & Reactions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                          <label className="font-bold text-slate-800 block mb-1.5">Trạng thái duyệt bài:</label>
                          <select
                            value={sEditStatus}
                            onChange={(e) => setSEditStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                          >
                            <option value="approved">✅ DUYỆT & XUẤT BẢN NGAY (Xuất hiện đầu trang)</option>
                            <option value="pending">🕒 LƯU DẠNG CHỜ DUYỆT (Chưa hiển thị)</option>
                            <option value="rejected">⛔ TẠM ẨN / TỪ CHỐI BÀI VIẾT</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="font-bold text-slate-700 block mb-1">Lượt Thả Tim ❤️:</label>
                            <input
                              type="number"
                              min={0}
                              value={sEditHearts}
                              onChange={(e) => setSEditHearts(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="font-bold text-slate-700 block mb-1">Lượt Vỗ Tay 👏:</label>
                            <input
                              type="number"
                              min={0}
                              value={sEditCheers}
                              onChange={(e) => setSEditCheers(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingStory(null)}
                          className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Lưu & Cập Nhật Bài Viết</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Story List Display */}
              {filteredAdminStories.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-600 text-sm">Không có bài viết nào phù hợp với bộ lọc</p>
                  <p className="text-xs text-slate-400">Hãy thử đổi trạng thái hoặc xóa từ khóa tìm kiếm</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAdminStories.map((s) => (
                    <div 
                      key={s.id} 
                      className={`p-5 rounded-2xl border transition-all duration-200 space-y-3.5 ${
                        s.status === 'pending'
                          ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                          : s.status === 'rejected'
                          ? 'border-rose-200 bg-rose-50/30 opacity-80'
                          : 'border-slate-200 bg-white shadow-xs'
                      }`}
                    >
                      {/* Top bar: Status, Title, Author, Code */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {s.status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>CHỜ DUYỆT</span>
                            </span>
                          )}
                          {s.status === 'approved' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ĐÃ XUẤT BẢN</span>
                            </span>
                          )}
                          {s.status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center space-x-1">
                              <EyeOff className="w-3 h-3" />
                              <span>ĐÃ ẨN / TỪ CHỐI</span>
                            </span>
                          )}

                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {s.code}
                          </span>

                          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full text-xs">
                            {s.topic || (s as any).tag || 'Tâm lý'}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(s.createdAt).toLocaleString('vi-VN')}</span>
                        </span>
                      </div>

                      {/* Main info */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <h4 className="text-base font-black text-slate-900">{s.title}</h4>
                          <span className="text-xs text-slate-600 font-medium">
                            Tác giả: <strong className="text-slate-800">{s.isAnonymous ? 'Học sinh ẩn danh' : (s.authorName || (s as any).author)}</strong>
                            {s.className && <span className="ml-1 text-slate-500">(Lớp {s.className})</span>}
                          </span>
                        </div>

                        {/* Image preview (if any) */}
                        {(s.attachedImage || s.imageUrl) && (
                          <div className="flex items-center space-x-3 p-2 bg-slate-100 rounded-xl max-w-md">
                            <img
                              src={s.attachedImage || s.imageUrl}
                              alt="Attached"
                              className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                            />
                            <div className="text-xs">
                              <p className="font-bold text-slate-700">Có hình ảnh đính kèm</p>
                              <a
                                href={s.attachedImage || s.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline text-[11px]"
                              >
                                Xem ảnh gốc toàn màn hình ↗
                              </a>
                            </div>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          {s.content}
                        </p>

                        {/* Counselor advice */}
                        {s.counselorNote && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                            <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                              <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                              <span>Lời nhắn gửi của Thầy/Cô:</span>
                            </div>
                            <p className="italic">{s.counselorNote}</p>
                          </div>
                        )}

                        {/* Inline Note Editor */}
                        {storyNoteId === s.id && (
                          <div className="space-y-2 pt-1 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                            <label className="text-xs font-bold text-indigo-900 block">Lời nhắn gửi của Thầy Cô:</label>
                            <textarea
                              rows={2}
                              value={counselorNoteText}
                              onChange={(e) => setCounselorNoteText(e.target.value)}
                              placeholder="Nhập lời động viên, chia sẻ của Thầy Cô..."
                              className="w-full p-2.5 text-xs bg-white rounded-xl border border-indigo-200 focus:outline-hidden"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setStoryNoteId(null)}
                                className="px-3 py-1 text-xs text-slate-600 font-bold hover:bg-slate-200 rounded-lg"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleSaveStoryNote(s.id)}
                                className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
                              >
                                Lưu Lời Nhắn
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                        {/* Reaction stats */}
                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>{s.hearts || 0} tim</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>👏</span>
                            <span>{s.cheers || s.likes || 0} vỗ tay</span>
                          </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Quick 1-click Approve / Revert */}
                          {s.status !== 'approved' ? (
                            <button
                              onClick={() => handleQuickApproveStory(s.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                              title="Duyệt và xuất bản ngay lên trang chủ"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Duyệt & Xuất Bản Ngay</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickRevertStory(s.id)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
                              title="Chuyển bài viết về trạng thái chờ duyệt"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              <span>Gỡ bài / Về chờ duyệt</span>
                            </button>
                          )}

                          {/* Full Edit Modal Button */}
                          <button
                            onClick={() => handleOpenEditStory(s)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Chỉnh sửa nội dung & ảnh</span>
                          </button>

                          {/* Counselor Note Button */}
                          <button
                            onClick={() => {
                              setStoryNoteId(s.id);
                              setCounselorNoteText(s.counselorNote || '');
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition flex items-center space-x-1 cursor-pointer"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>Gửi lời nhắn</span>
                          </button>

                          {/* Reject / Hide */}
                          {s.status !== 'rejected' && (
                            <button
                              onClick={() => handleQuickRejectStory(s.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                              title="Tạm ẩn bài viết khỏi web"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${s.title}" không?`)) {
                                onDeleteStory(s.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 6: HỒ SƠ ĐOÀN & QUẢN LÝ TÌNH NGUYỆN VIÊN */}
        {activeTab === 'youth' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Subtab navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <Flag className="w-5 h-5 text-red-600" />
                  <span>HỒ SƠ ĐOÀN & ĐỘI TÌNH NGUYỆN BA CHÚC</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý đăng ký mới, duyệt thành viên tự động vào cây dữ liệu, điểm danh chuyên cần và vinh danh học sinh tích cực.
                </p>
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setYouthSubTab('registrations')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    youthSubTab === 'registrations' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đăng Ký Vào Đoàn ({registrations.length})
                </button>
                <button
                  onClick={() => setYouthSubTab('tree')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    youthSubTab === 'tree' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thông Tin Đoàn ({volunteerMembers.length})
                </button>
                <button
                  onClick={() => setYouthSubTab('attendance')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    youthSubTab === 'attendance' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Điểm Danh Chuyên Cần ({volunteerAttendance.length})
                </button>
                <button
                  onClick={() => setYouthSubTab('activity_charts')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                    youthSubTab === 'activity_charts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Thống Kê Hoạt Động (Recharts 📊)</span>
                </button>
                <button
                  onClick={() => setIsMemoryModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer ml-1"
                  title="Trung tâm Quản lý Bộ nhớ Đa tầng & Khôi phục 152 đoàn viên"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Bộ Nhớ & Khôi Phục</span>
                </button>
              </div>
            </div>

            {/* Volunteer Honor Modal */}
            {honoringVolMember && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-base text-amber-900 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>VINH DANH HỌC SINH TÍCH CỰC TÌNH NGUYỆN</span>
                    </h4>
                    <button onClick={() => setHonoringVolMember(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                  </div>

                  <form onSubmit={handleSaveVolHonor} className="space-y-4 text-xs sm:text-sm">
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                      <strong>Học sinh:</strong> {honoringVolMember.fullName} - <strong>Lớp:</strong> {honoringVolMember.className}
                      <br />
                      <strong>Số hoạt động đã tham gia:</strong> {honoringVolMember.activitiesCount || 0} buổi
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Danh hiệu / Danh mục vinh danh:</label>
                      <input
                        type="text"
                        required
                        value={honorTitleText}
                        onChange={(e) => setHonorTitleText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tải ảnh vinh danh học sinh (Tự động nén):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVolHonorFileUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                      />
                      {isCompressingVolHonor && <p className="text-[11px] text-indigo-600 mt-1">Đang tối ưu & nén ảnh...</p>}
                      {honorPhotoUrl && (
                        <div className="mt-2 flex items-center space-x-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <img src={honorPhotoUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover border" />
                          <span className="text-xs text-emerald-700 font-bold">✓ Ảnh đã sẵn sàng lưu</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setHonoringVolMember(null)}
                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>Xác Nhận Vinh Danh</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Volunteer Removal Modal with 3 predefined reasons */}
            {deletingVolMember && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-base text-rose-900 flex items-center space-x-2">
                      <UserX className="w-5 h-5 text-rose-600" />
                      <span>XỬ LÝ TRẠNG THÁI / RỜI ĐỘI TÌNH NGUYỆN</span>
                    </h4>
                    <button onClick={() => setDeletingVolMember(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm">
                    <p className="text-slate-700">
                      Chọn lý do chuyển đổi trạng thái hoặc cho học sinh <strong>{deletingVolMember.fullName} (Lớp {deletingVolMember.className})</strong> tạm dừng/rời đội:
                    </p>

                    <div className="space-y-2">
                      <label className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition ${
                        volDeleteReason === 'graduated_12' ? 'bg-indigo-50 border-indigo-400 text-indigo-900' : 'border-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="delReason"
                          value="graduated_12"
                          checked={volDeleteReason === 'graduated_12'}
                          onChange={() => setVolDeleteReason('graduated_12')}
                          className="mt-1 text-indigo-600"
                        />
                        <div>
                          <strong className="block font-bold">1. Hoàn thành lớp 12 (Tốt nghiệp)</strong>
                          <span className="text-xs text-slate-500">Đã hoàn thành cấp THPT, chuyển sinh hoạt Đoàn hoặc tốt nghiệp.</span>
                        </div>
                      </label>

                      <label className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition ${
                        volDeleteReason === 'inactive_rules_violation' ? 'bg-rose-50 border-rose-400 text-rose-900' : 'border-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="delReason"
                          value="inactive_rules_violation"
                          checked={volDeleteReason === 'inactive_rules_violation'}
                          onChange={() => setVolDeleteReason('inactive_rules_violation')}
                          className="mt-1 text-rose-600"
                        />
                        <div>
                          <strong className="block font-bold">2. Không nghiêm túc trong phong trào tình nguyện</strong>
                          <span className="text-xs text-slate-500">Vắng mặt nhiều buổi không phép hoặc vi phạm quy chế hoạt động tình nguyện.</span>
                        </div>
                      </label>

                      <label className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition ${
                        volDeleteReason === 'inactive_low_performance' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'border-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="delReason"
                          value="inactive_low_performance"
                          checked={volDeleteReason === 'inactive_low_performance'}
                          onChange={() => setVolDeleteReason('inactive_low_performance')}
                          className="mt-1 text-amber-600"
                        />
                        <div>
                          <strong className="block font-bold">3. Sức học giảm sút (Tạm dừng để tập trung học tập)</strong>
                          <span className="text-xs text-slate-500">Đoàn trường tạo điều kiện để học sinh cải thiện kết quả học tập văn hóa.</span>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Ghi chú bổ sung của Ban Bí Thư Đoàn:</label>
                      <input
                        type="text"
                        value={volDeleteCustomNote}
                        onChange={(e) => setVolDeleteCustomNote(e.target.value)}
                        placeholder="Nhập quyết định hoặc ghi chú bổ sung..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleConfirmVolDelete('remove_completely')}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa vĩnh viễn khỏi danh sách</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setDeletingVolMember(null)}
                          className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmVolDelete('change_status')}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center space-x-1.5"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Lưu lý do & Tạm dừng</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Volunteer Member Edit Modal */}
            {editingVolMember && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                      <Edit3 className="w-5 h-5 text-indigo-600" />
                      <span>SỬA THÔNG TIN ĐOÀN VIÊN / TÌNH NGUYỆN VIÊN</span>
                    </h4>
                    <button onClick={() => setEditingVolMember(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                  </div>

                  <form onSubmit={handleSaveVolEdit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Họ và tên:</label>
                        <input
                          type="text"
                          required
                          value={volEditName}
                          onChange={(e) => setVolEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
                        <input
                          type="text"
                          required
                          value={volEditClass}
                          onChange={(e) => setVolEditClass(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Số điện thoại:</label>
                        <input
                          type="tel"
                          value={volEditPhone}
                          onChange={(e) => setVolEditPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Số buổi chuyên cần:</label>
                        <input
                          type="number"
                          min="0"
                          value={volEditCount}
                          onChange={(e) => setVolEditCount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sở trường / Kỹ năng:</label>
                      <input
                        type="text"
                        value={volEditSkills}
                        onChange={(e) => setVolEditSkills(e.target.value)}
                        placeholder="Ví dụ: Dẫn chương trình, văn nghệ, chụp ảnh..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingVolMember(null)}
                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Cập Nhật</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SUBTAB 1: ĐĂNG KÝ VÀO ĐOÀN */}
            {youthSubTab === 'registrations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-600">
                    Khi Thầy/Cô duyệt hồ sơ, hệ thống sẽ gửi thông báo: <strong>"Chúc mừng em là thành viên của đội tình nguyện"</strong> và tự động đưa học sinh vào Cây dữ liệu Đoàn viên.
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={() => setRegFilterStatus('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold ${regFilterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setRegFilterStatus('pending')}
                      className={`px-2.5 py-1 rounded-lg font-bold ${regFilterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      Chờ duyệt
                    </button>
                    <button
                      onClick={() => setRegFilterStatus('approved')}
                      className={`px-2.5 py-1 rounded-lg font-bold ${regFilterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      Đã duyệt
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {registrations
                    .filter((r) => {
                      if (regFilterStatus === 'pending') return r.status !== 'approved' && r.status !== 'accepted';
                      if (regFilterStatus === 'approved') return r.status === 'approved' || r.status === 'accepted';
                      return true;
                    })
                    .map((r) => {
                      const isApproved = r.status === 'approved' || r.status === 'accepted';
                      return (
                        <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900 text-sm">{r.fullName}</span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded">Lớp {r.className}</span>
                              <span className="text-slate-500">SĐT: {r.phone}</span>
                              {r.skills && (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded text-[10px]">
                                  Sở trường: {r.skills}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600"><strong className="text-slate-700">Nguyện vọng:</strong> {r.desires || 'Tham gia các phong trào Đoàn trường'}</p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isApproved ? '✓ Đã là Thành Viên Tình Nguyện' : 'Chờ duyệt'}
                            </span>

                            {isApproved ? (
                              <button
                                onClick={() => handleRevertRegistration(r)}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                              >
                                Thu hồi duyệt
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveRegistration(r)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt & Kết nạp</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm('Xóa hồ sơ này?')) {
                                  onDeleteRegistration(r.id);
                                }
                              }}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                              title="Xóa hồ sơ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SUBTAB 2: CÂY THÔNG TIN ĐOÀN VIÊN & TÌNH NGUYỆN VIÊN */}
            {youthSubTab === 'tree' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={volSearch}
                      onChange={(e) => setVolSearch(e.target.value)}
                      placeholder="Tìm theo tên học sinh, lớp hoặc sở trường..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-600">
                    Tổng số thành viên: <span className="text-indigo-600">{volunteerMembers.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {volunteerMembers
                    .filter((m) => {
                      if (!volSearch.trim()) return true;
                      const q = volSearch.toLowerCase();
                      return m.fullName.toLowerCase().includes(q) || m.className.toLowerCase().includes(q) || (m.skills && m.skills.toLowerCase().includes(q));
                    })
                    .map((m) => {
                      const isGraduated = m.status === 'graduated_12';
                      const isViolation = m.status === 'inactive_rules_violation';
                      const isLowPerf = m.status === 'inactive_low_performance';
                      const isHonored = m.isHonored || m.status === 'honored';

                      return (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isHonored
                              ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                              : isGraduated || isViolation || isLowPerf
                              ? 'bg-slate-100/80 border-slate-300 opacity-75'
                              : 'bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-3">
                              <div className="shrink-0 cursor-pointer" onClick={() => setAdminViewingCertMember(m)}>
                                <StudentAvatar
                                  fullName={m.fullName}
                                  photoUrl={m.honorPhoto || m.avatarUrl}
                                  size="md"
                                  border="border border-indigo-200 shadow-xs"
                                />
                              </div>

                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-extrabold text-sm text-slate-900">{m.fullName}</h4>
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded text-[11px]">
                                    Lớp {m.className}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">SĐT: {m.phone || 'Chưa cập nhật'}</p>
                              </div>
                            </div>

                            <div>
                              {isHonored && (
                                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] flex items-center space-x-1 shadow-xs">
                                  <Award className="w-3 h-3" />
                                  <span>ĐÃ VINH DANH</span>
                                </span>
                              )}
                              {isGraduated && (
                                <span className="px-2 py-0.5 bg-slate-300 text-slate-800 font-bold rounded text-[10px]">
                                  Tốt nghiệp 12
                                </span>
                              )}
                              {isViolation && (
                                <span className="px-2 py-0.5 bg-rose-200 text-rose-800 font-bold rounded text-[10px]">
                                  Vi phạm quy chế
                                </span>
                              )}
                              {isLowPerf && (
                                <span className="px-2 py-0.5 bg-amber-200 text-amber-800 font-bold rounded text-[10px]">
                                  Tạm dừng học tập
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Số buổi tham gia chuyên cần:</span>
                              <span className="font-black text-indigo-700 text-sm">{m.activitiesCount || 0} buổi</span>
                            </div>
                            {m.skills && (
                              <div className="text-[11px] text-slate-600">
                                <strong>Sở trường:</strong> {m.skills}
                              </div>
                            )}
                            {m.statusReason && (
                              <div className="text-[11px] text-rose-700 font-medium">
                                <strong>Lý do ghi nhận:</strong> {m.statusReason}
                              </div>
                            )}
                            {m.honorTitle && (
                              <div className="text-[11px] text-amber-800 font-bold">
                                <strong>Danh hiệu:</strong> {m.honorTitle}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                            <button
                              onClick={() => handleQuickIncrementAttendance(m)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                              title="Cộng 1 buổi điểm danh chuyên cần"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+1 Điểm danh</span>
                            </button>

                            <button
                              onClick={() => handleOpenVolHonor(m)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Award className="w-3 h-3" />
                              <span>Vinh danh</span>
                            </button>

                            <button
                              onClick={() => setAdminViewingCertMember(m)}
                              className="px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-amber-900 font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                              title="Xem và in Giấy Khen Điện Tử"
                            >
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>Giấy khen</span>
                            </button>

                            <button
                              onClick={() => handleOpenVolEdit(m)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đoàn viên "${m.fullName}" khỏi hệ thống Đoàn Trường?`)) {
                                  if (onDeleteVolunteerMember) onDeleteVolunteerMember(m.id);
                                }
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                              title="Xóa vĩnh viễn đoàn viên này khỏi danh sách"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SUBTAB 3: ĐIỂM DANH CHUYÊN CẦN */}
            {youthSubTab === 'attendance' && (
              <div className="space-y-6">
                {/* Direct Link to Recharts Analytics */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-amber-300">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white">Biểu Đồ Thống Kê Tham Gia Phong Trào (Recharts)</h5>
                      <p className="text-xs text-indigo-200">Phân tích chuyên sâu số lượng đoàn viên theo từng hoạt động, khối lớp và mức độ chuyên cần.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setYouthSubTab('activity_charts')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 shrink-0"
                  >
                    <span>Mở Biểu Đồ Recharts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-4">
                  <h4 className="font-extrabold text-sm text-emerald-950 uppercase flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>GHI NHẬN ĐIỂM DANH HOẠT ĐỘNG TÌNH NGUYỆN</span>
                  </h4>

                  <form onSubmit={handleSaveManualAttendance} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Họ và tên học sinh:</label>
                      <input
                        type="text"
                        required
                        value={attFullName}
                        onChange={(e) => setAttFullName(e.target.value)}
                        placeholder="Nguyễn Văn A..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
                      <input
                        type="text"
                        required
                        value={attClassName}
                        onChange={(e) => setAttClassName(e.target.value)}
                        placeholder="11A1..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tên hoạt động:</label>
                      <input
                        type="text"
                        required
                        value={attActivityName}
                        onChange={(e) => setAttActivityName(e.target.value)}
                        placeholder="Chiến dịch Hoa Phượng Đỏ..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Ngày diễn ra:</label>
                      <input
                        type="date"
                        required
                        value={attDate}
                        onChange={(e) => setAttDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lưu Điểm Danh</span>
                      </button>
                    </div>
                  </form>
                  {attSavedMsg && (
                    <p className="text-xs text-emerald-800 font-bold">✓ Đã ghi nhận buổi chuyên cần thành công!</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-700 uppercase">
                    NHẬT KÝ ĐIỂM DANH GẦN ĐÂY ({volunteerAttendance.length})
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-3">Học sinh</th>
                          <th className="p-3">Lớp</th>
                          <th className="p-3">Hoạt động tình nguyện</th>
                          <th className="p-3">Ngày</th>
                          <th className="p-3">Địa điểm</th>
                          <th className="p-3">Xác thực</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {volunteerAttendance.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{a.fullName}</td>
                            <td className="p-3 text-indigo-700 font-bold">{a.className}</td>
                            <td className="p-3 text-slate-700">{a.activityName}</td>
                            <td className="p-3 text-slate-500">{a.date}</td>
                            <td className="p-3 text-slate-500">{a.location || 'THPT Ba Chúc'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                ✓ Thầy/Cô Đã Duyệt
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: BIỂU ĐỒ RECHARTS THỐNG KÊ THAM GIA HOẠT ĐỘNG */}
            {youthSubTab === 'activity_charts' && (
              <div className="space-y-6">
                <VolunteerActivityCharts
                  volunteerMembers={volunteerMembers || []}
                  volunteerAttendance={volunteerAttendance || []}
                  activities={activities}
                  registrations={registrations}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 7: BÀI VIẾT & INFOGRAPHIC */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Infographic Edit Modal */}
            {editingInfo && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                      <Edit3 className="w-5 h-5 text-indigo-600" />
                      <span>CHỈNH SỬA INFOGRAPHIC TƯ VẤN</span>
                    </h4>
                    <button onClick={() => setEditingInfo(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                  </div>

                  <form onSubmit={handleSaveEditInfographic} className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tiêu đề Infographic:</label>
                      <input
                        type="text"
                        required
                        value={infoTitle}
                        onChange={(e) => setInfoTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Chủ đề:</label>
                      <select
                        value={infoCategory}
                        onChange={(e) => setInfoCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Phương pháp học tập">Phương pháp học tập</option>
                        <option value="Sức khỏe tinh thần & Tâm lý">Sức khỏe tinh thần & Tâm lý</option>
                        <option value="Hướng nghiệp & Chọn ngành">Hướng nghiệp & Chọn ngành</option>
                        <option value="Hoạt động Đoàn & Kỹ năng sống">Hoạt động Đoàn & Kỹ năng sống</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tải ảnh mới từ máy tính (Tự động nén):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleInfographicFileUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-800 hover:file:bg-indigo-200 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Hoặc đường dẫn ảnh URL:</label>
                      <input
                        type="text"
                        required
                        value={infoUrl}
                        onChange={(e) => setInfoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mô tả tóm tắt:</label>
                      <textarea
                        rows={3}
                        value={infoDesc}
                        onChange={(e) => setInfoDesc(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingInfo(null)}
                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Lưu Thay Đổi</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                <span>THÊM MỚI INFOGRAPHIC / ẢNH TƯ VẤN HỌC ĐƯỜNG</span>
              </h3>
              <form onSubmit={handleCreateInfographic} className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={infoTitle}
                    onChange={(e) => setInfoTitle(e.target.value)}
                    placeholder="Tiêu đề infographic (Ví dụ: Sơ đồ 5 bước chọn ngành Đại học)..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <select
                    value={infoCategory}
                    onChange={(e) => setInfoCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Phương pháp học tập">Phương pháp học tập</option>
                    <option value="Sức khỏe tinh thần & Tâm lý">Sức khỏe tinh thần & Tâm lý</option>
                    <option value="Hướng nghiệp & Chọn ngành">Hướng nghiệp & Chọn ngành</option>
                    <option value="Hoạt động Đoàn & Kỹ năng sống">Hoạt động Đoàn & Kỹ năng sống</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Tải ảnh từ máy tính (Tự động nén nhẹ):</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInfographicFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-800 hover:file:bg-indigo-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Hoặc nhập link URL ảnh:</label>
                    <input
                      type="text"
                      required
                      value={infoUrl}
                      onChange={(e) => setInfoUrl(e.target.value)}
                      placeholder="https://... hoặc data:image..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={infoDesc}
                  onChange={(e) => setInfoDesc(e.target.value)}
                  placeholder="Mô tả nội dung tóm tắt của infographic..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Infographic Mới</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                DANH SÁCH INFOGRAPHIC ĐÃ ĐĂNG ({infographics.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {infographics.map((info) => (
                  <div key={info.id} className="p-3 border border-slate-200 rounded-2xl space-y-2 bg-slate-50">
                    <img src={info.imageUrl} alt={info.title} className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{info.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{info.description}</p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => handleOpenEditInfographic(info)}
                        className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDeleteInfographic(info.id)}
                        className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: CẤU HÌNH TRƯỜNG & HÌNH ẢNH & GOOGLE SHEETS */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* 1. THÔNG TIN ĐỊNH DANH NHÀ TRƯỜNG */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <span>1. CẤU HÌNH THÔNG TIN TRƯỜNG & ĐOÀN TRƯỜNG</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thay đổi tên trường, số điện thoại hotline, email và địa chỉ phòng tư vấn hiển thị trên toàn bộ hệ thống.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveConfigForm} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Tên trường <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={editConfig.schoolName}
                      onChange={(e) => setEditConfig({ ...editConfig, schoolName: e.target.value })}
                      placeholder="Ví dụ: TRƯỜNG THPT BA CHÚC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Đơn vị phụ trách <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={editConfig.schoolSubName}
                      onChange={(e) => setEditConfig({ ...editConfig, schoolSubName: e.target.value })}
                      placeholder="ĐOÀN THANH NIÊN - TỔ TƯ VẤN HỌC ĐƯỜNG"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Hotline tư vấn 24/7 <span className="text-rose-500">*</span>:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={editConfig.hotline}
                        onChange={(e) => setEditConfig({ ...editConfig, hotline: e.target.value })}
                        placeholder="0789 620 212"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Email tư vấn:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={editConfig.email}
                        onChange={(e) => setEditConfig({ ...editConfig, email: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Phòng tư vấn trực tiếp:</label>
                    <input
                      type="text"
                      required
                      value={editConfig.consultingRoom}
                      onChange={(e) => setEditConfig({ ...editConfig, consultingRoom: e.target.value })}
                      placeholder="Phòng Đoàn Trường THPT Ba Chúc - An Bình - Ba Chúc - An Giang"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 block">Địa chỉ trường:</label>
                    <input
                      type="text"
                      required
                      value={editConfig.address}
                      onChange={(e) => setEditConfig({ ...editConfig, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thông Tin Trường & Hotline</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. QUẢN LÝ HÌNH ẢNH: LOGO TRƯỜNG & TẤM ẢNH TRUNG TÂM (HERO BANNER) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  <span>2. QUẢN LÝ HÌNH ẢNH: LOGO TRƯỜNG & TẤM ẢNH TRUNG TÂM (TRANG CHỦ)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tải lên logo nhà trường hoặc thay đổi tấm ảnh poster chính ở giữa Trang chủ. Có thể chọn ảnh từ máy tính hoặc dán link URL.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LOGO TRƯỜNG */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-sm">LOGO NHÀ TRƯỜNG</h4>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Logo Preview */}
                    <div className="w-20 h-20 rounded-full bg-white ring-2 ring-amber-400/90 p-1 shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {editConfig.schoolLogo ? (
                        <img 
                          src={editConfig.schoolLogo} 
                          alt="Logo Preview" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Award className="w-8 h-8 text-indigo-400" />
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="block text-xs font-bold text-slate-700">Tải ảnh & Căn chỉnh Logo:</label>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className={`inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-xs ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isUploadingLogo ? 'Đang tải lên Cloud...' : 'Chọn tệp Logo...'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSchoolLogoUpload}
                            disabled={isUploadingLogo}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsLogoCropperOpen(true)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                          title="Xén tròn, phóng to/thu nhỏ, xoay và đồng bộ kích thước logo giữa Máy tính & Điện thoại"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>XÉN & ĐỒNG BỘ LOGO</span>
                        </button>
                      </div>

                      {logoUploadStatus && (
                        <div className={`p-2 rounded-lg text-xs font-semibold ${
                          logoUploadStatus.type === 'loading' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          logoUploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {logoUploadStatus.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logo Cropper Modal */}
                  <LogoCropperModal
                    isOpen={isLogoCropperOpen}
                    onClose={() => setIsLogoCropperOpen(false)}
                    initialImage={editConfig.schoolLogo || sampleSchoolLogos[0]}
                    schoolName={editConfig.schoolName}
                    onSaveLogo={(croppedDataUrl) => {
                      const updated = { ...editConfig, schoolLogo: croppedDataUrl };
                      setEditConfig(updated);
                      onUpdateConfig(updated);
                      alert('✅ Đã xén và đồng bộ logo mới thành công trên toàn bộ hệ thống!');
                    }}
                  />

                  {/* Direct Logo URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Hoặc nhập link URL Logo:</label>
                    <input
                      type="url"
                      value={editConfig.schoolLogo}
                      onChange={(e) => setEditConfig({ ...editConfig, schoolLogo: e.target.value })}
                      placeholder="https://.../logo.png"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  {/* Preset Logos */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Kho Logo mẫu:</p>
                    <div className="flex items-center space-x-2">
                      {sampleSchoolLogos.map((logo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditConfig({ ...editConfig, schoolLogo: logo })}
                          className={`w-10 h-10 rounded-xl border-2 overflow-hidden cursor-pointer transition ${
                            editConfig.schoolLogo === logo ? 'border-indigo-600 ring-2 ring-indigo-500/30' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={logo} alt="Preset Logo" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TẤM ẢNH TRUNG TÂM (HERO BANNER) */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <h4 className="font-bold text-slate-900 text-sm">TẤM ẢNH Ở GIỮA TRANG CHỦ (HERO BANNER)</h4>
                  </div>

                  {/* Banner Preview */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md h-36 bg-slate-900">
                    <img 
                      src={editConfig.heroBannerImage || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80'} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                      Ảnh hiển thị chính trên Trang Chủ
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-xs ${isUploadingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isUploadingBanner ? 'Đang tải lên Cloud Storage...' : 'Tải ảnh từ máy tính lên Firebase Storage...'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroBannerUpload}
                        disabled={isUploadingBanner}
                        className="hidden"
                      />
                    </label>
                    {bannerUploadStatus && (
                      <div className={`p-2 rounded-lg text-xs font-semibold ${
                        bannerUploadStatus.type === 'loading' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        bannerUploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {bannerUploadStatus.message}
                      </div>
                    )}
                  </div>

                  {/* Direct Banner URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Hoặc nhập link URL ảnh trung tâm:</label>
                    <input
                      type="url"
                      value={editConfig.heroBannerImage || ''}
                      onChange={(e) => setEditConfig({ ...editConfig, heroBannerImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  {/* Preset Banner Gallery */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Kho ảnh trường học & học sinh mẫu:</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {sampleHeroBannerImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditConfig({ ...editConfig, heroBannerImage: imgUrl })}
                          className={`h-12 rounded-lg border-2 overflow-hidden cursor-pointer transition ${
                            editConfig.heroBannerImage === imgUrl ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={imgUrl} alt="Sample Banner" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig(editConfig);
                    alert('Đã cập nhật Logo và Tấm ảnh trung tâm Trang chủ thành công!');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>ÁP DỤNG & LƯU TẤT CẢ HÌNH ẢNH</span>
                </button>
              </div>
            </div>

            {/* 3. GOOGLE APPS SCRIPT & GOOGLE SHEETS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span>3. ĐỒNG BỘ GOOGLE SHEETS & XUẤT FILE EXCEL / CSV</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động kết nối Google Sheets để lưu trữ dữ liệu câu hỏi, chuyện kể, đoàn viên và điểm danh lên Google Drive của trường.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={triggerGoogleSheetsSync}
                  disabled={isSyncing}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ TOÀN BỘ SANG SHEETS'}</span>
                </button>
              </div>

              {/* URL Config */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block text-xs sm:text-sm">
                  URL Web App Google Apps Script (Nhận từ Google Sheets):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editConfig.googleScriptUrl}
                    onChange={(e) => setEditConfig({ ...editConfig, googleScriptUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateConfig(editConfig);
                      triggerAutoBackup();
                      alert('Đã lưu URL Google Apps Script thành công!');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Lưu URL
                  </button>
                </div>
              </div>

              {/* Quick CSV Export Cards & Monthly Report Center */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    XUẤT DỮ LIỆU BÁO CÁO & LƯU TRỮ ĐỊNH KỲ:
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Hỗ trợ trích xuất theo tháng dạng CSV & PDF</span>
                </div>

                {/* Primary Featured Monthly Report Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-amber-400/60 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-md shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md uppercase">
                          KHUYÊN DÙNG HẰNG THÁNG
                        </span>
                        <span className="text-xs font-bold text-indigo-950">Lưu Trữ Sư Phạm & Báo Cáo Sở GD&ĐT</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900">
                        Báo Cáo Tình Hình Tư Vấn Tâm Lý Học Đường (File CSV / PDF)
                      </h4>
                      <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                        Tự động tổng hợp số liệu tư vấn, tỷ lệ giải quyết, phân tích chuyên sâu các chủ đề học sinh quan tâm và xuất biểu mẫu in ấn A4 chuẩn hành chính kèm chữ ký phê duyệt.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer shrink-0"
                  >
                    <FileText className="w-4 h-4 text-slate-950" />
                    <span>MỞ TRÌNH TẠO BÁO CÁO</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={exportQuestionsCSV}
                    className="p-3.5 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left transition flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950">Xuất File CSV: Câu Hỏi</div>
                      <div className="text-[10px] text-blue-700">{questions.length} câu hỏi tư vấn</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={exportStoriesCSV}
                    className="p-3.5 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left transition flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-purple-950">Xuất File CSV: Chuyện Kể</div>
                      <div className="text-[10px] text-purple-700">{stories.length} bài viết tâm sự</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportVolunteersCSV()}
                    className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950">Xuất File CSV: Đoàn Viên</div>
                      <div className="text-[10px] text-emerald-700">{volunteerMembers.length} tình nguyện viên</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={exportAttendanceCSV}
                    className="p-3.5 bg-amber-50/70 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition flex items-center space-x-3 cursor-pointer group"
                  >
                    <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950">Xuất File CSV: Điểm Danh</div>
                      <div className="text-[10px] text-amber-700">{volunteerAttendance.length} lượt chuyên cần</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400 uppercase">MÃ APPS SCRIPT ĐỒNG BỘ GOOGLE SHEETS</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyScriptToClipboard}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedScript ? 'ĐÃ SAO CHÉP MÃ!' : 'Sao chép toàn bộ mã'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300">
                  📋 <strong>Hướng dẫn cài đặt nhanh:</strong> Mở Google Sheets &gt; chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong> &gt; Dán đoạn mã này vào &gt; Bấm <strong>Triển khai (Deploy)</strong> &gt; Chọn <strong>Ứng dụng web (Web app)</strong> &gt; Quyền truy cập chọn <strong>Bất kỳ ai (Anyone)</strong> &gt; Sao chép link URL dán vào ô bên trên.
                </p>
              </div>
            </div>

            {/* 4. TÀI KHOẢN & BẢO MẬT ĐĂNG NHẬP QUẢN TRỊ VIÊN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>4. TÀI KHOẢN & BẢO MẬT ĐĂNG NHẬP QUẢN TRỊ VIÊN</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black text-[11px] rounded-lg border border-emerald-200 flex items-center space-x-1">
                      <span>🔒 Đã ẩn khỏi Firestore</span>
                    </span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-black text-[11px] rounded-lg border border-blue-200 flex items-center space-x-1">
                      <span>🛡️ Chống rò rỉ & Chặn Kotomari</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Quản lý tên đăng nhập và mật khẩu an toàn dành riêng cho Quản trị viên, Ban Cố vấn & Ban Chấp Hành Đoàn Trường. <strong>Thông tin đăng nhập đã được tách biệt và ẩn hoàn toàn khỏi Firestore công cộng</strong>, chỉ lưu trữ mã hóa an toàn trên máy quản trị, ngăn chặn tuyệt đối các xâm nhập trái phép.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs sm:text-sm">
                    Tên đăng nhập quản trị:
                  </label>
                  <input
                    type="text"
                    required
                    value={editConfig.adminUsername || 'tuvanhocduongthptbachuc2025'}
                    onChange={(e) => setEditConfig({ ...editConfig, adminUsername: e.target.value })}
                    placeholder="tuvanhocduongthptbachuc2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500">Tài khoản chính thức duy nhất đăng nhập quản trị hệ thống (Mặc định: tuvanhocduongthptbachuc2025).</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs sm:text-sm">
                    Mật khẩu quản trị an toàn:
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      required
                      value={editConfig.adminPassword || 'Bachuc@2025'}
                      onChange={(e) => setEditConfig({ ...editConfig, adminPassword: e.target.value })}
                      placeholder="Nhập mật khẩu quản trị..."
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Mật khẩu bảo mật chống xâm nhập trái phép (Mặc định: Bachuc@2025).</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!editConfig.adminPassword || editConfig.adminPassword.length < 4) {
                      alert('Mật khẩu quản trị phải có ít nhất 4 ký tự!');
                      return;
                    }
                    onUpdateConfig(editConfig);
                    alert('Đã lưu thay đổi Tài khoản & Mật khẩu Quản trị viên thành công!');
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>LƯU TÀI KHOẢN & MẬT KHẨU QUẢN TRỊ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: BỨC TƯỜNG LỬA BẢO VỆ MÃ NGUỒN & AN NINH MẠNG */}
        {activeTab === 'firewall' && (
          <SecurityFirewallPanel />
        )}

        {/* ADMIN HONOR MEMORY CERTIFICATE MODAL */}
        {adminViewingCertMember && (
          <HonorMemoryCertificateModal
            member={adminViewingCertMember}
            onClose={() => setAdminViewingCertMember(null)}
            isAdmin={true}
            onEditHonor={(m) => {
              setAdminViewingCertMember(null);
              handleOpenVolHonor(m);
            }}
            onUpdateMemberPhoto={(memberId, photoUrl) => {
              if (onUpdateVolunteerMember) {
                onUpdateVolunteerMember(memberId, { honorPhoto: photoUrl });
              }
              if (adminViewingCertMember && adminViewingCertMember.id === memberId) {
                setAdminViewingCertMember({
                  ...adminViewingCertMember,
                  honorPhoto: photoUrl
                });
              }
            }}
          />
        )}

        {/* ADMIN MEMORY MANAGEMENT CENTER MODAL */}
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

        {/* MONTHLY PSYCHOLOGICAL COUNSELING REPORT MODAL (CSV & PDF EXPORT) */}
        {isReportModalOpen && (
          <CounselingReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            questions={questions}
            stories={stories}
            aiLogs={aiLogs}
            counselors={counselors}
            config={config}
          />
        )}
      </div>
    </div>
  );
};
