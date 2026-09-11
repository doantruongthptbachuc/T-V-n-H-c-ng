export type TopicType = 
  | 'Học tập'
  | 'Tâm lý'
  | 'Bạn bè'
  | 'Gia đình'
  | 'Hướng nghiệp'
  | 'Kỹ năng sống'
  | 'Sức khỏe học đường'
  | 'Hoạt động Đoàn'
  | 'Tình cảm học trò'
  | 'Khác';

export type QuestionSeverity = 'thấp' | 'trung bình' | 'cao';

export interface QuestionAIAnalysis {
  topicTag?: TopicType | string;
  tags?: string[];
  severity: QuestionSeverity;
  urgencyReason?: string;
  suggestedAction?: string;
  analyzedAt: string;
  isAiClassified?: boolean;
}

export interface Question {
  id: string;
  code: string;
  studentName: string;
  isAnonymous: boolean;
  className: string;
  topic: TopicType;
  question: string;
  attachedImage?: string;
  createdAt: string;
  status: 'pending' | 'answered';
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isPublic: boolean;
  notes?: string;
  tags?: string[];
  severity?: QuestionSeverity;
  aiAnalysis?: QuestionAIAnalysis;
}

export interface Story {
  id: string;
  code: string;
  authorName: string;
  isAnonymous: boolean;
  className: string;
  topic: string;
  title: string;
  content: string;
  attachedImage?: string;
  imageUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  counselorNote?: string;
  likes: number;
  hearts: number;
  cheers: number;
  userInteracted?: {
    liked?: boolean;
    hearted?: boolean;
    cheered?: boolean;
  };
}

export interface YouthRegistration {
  id: string;
  code: string;
  fullName: string;
  birthDate: string;
  className: string;
  academicYear?: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  activities: string[];
  skills: string;
  desires: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'approved' | 'contacted' | 'assigned' | 'rejected';
  isLeader?: boolean;
  leaderRole?: string;
  assignedClub?: string;
  notes?: string;
}

export type VolunteerStatus = 
  | 'active'
  | 'graduated_12'
  | 'inactive_rules_violation'
  | 'inactive_low_performance'
  | 'honored';

export interface VolunteerMember {
  id: string;
  code: string;
  fullName: string;
  className: string;
  academicYear?: string;
  phone: string;
  email?: string;
  joinedDate: string;
  avatarUrl?: string;
  skills: string;
  activitiesCount: number;
  activityPoints?: number;
  status: VolunteerStatus;
  statusReason?: string;
  isLeader?: boolean;
  leaderRole?: string;
  isHonored?: boolean;
  honorTitle?: string;
  honorDate?: string;
  honorPhoto?: string;
  notes?: string;
}

export interface VolunteerAttendance {
  id: string;
  memberId?: string;
  fullName: string;
  className: string;
  activityName: string;
  date: string;
  location?: string;
  timesParticipated: number;
  activityPoints?: number;
  createdAt: string;
  notes?: string;
  counselorVerified?: boolean;
}

export type ActivityCategory =
  | 'Hoạt động Đoàn'
  | 'Tình nguyện'
  | 'Văn nghệ'
  | 'Thể thao'
  | 'Tư vấn học đường'
  | 'Hoạt động trải nghiệm'
  | 'Hoạt động cộng đồng';

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  date: string;
  description: string;
  imageUrl: string;
  location?: string;
  participantsCount?: number;
  tags?: string[];
  likes?: number;
  hearts?: number;
  hahas?: number;
  fires?: number;
  cares?: number;
  userInteracted?: {
    liked?: boolean;
    hearted?: boolean;
    hahaed?: boolean;
    fired?: boolean;
    cared?: boolean;
  };
  articleUrl?: string;
  content?: string;
  actionSteps?: string[];
}

export interface QAInfographic {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  uploadDate: string;
  author: string;
  articleUrl?: string;
  content?: string;
  actionSteps?: string[];
  keyTakeaways?: string[];
  downloadUrl?: string;
}

export type HealthArticleCategory =
  | 'Bệnh học đường'
  | 'Dinh dưỡng'
  | 'Sơ cấp cứu'
  | 'Tâm sinh lý'
  | 'Phòng chống dịch'
  | 'Lối sống'
  | 'Vấn đề sức khỏe khác';

export interface HealthArticle {
  id: string;
  code?: string;
  title: string;
  category: HealthArticleCategory | string;
  readTime: string;
  badgeColor?: string;
  iconName?: string;
  summary: string;
  content: string;
  tips: string[];
  imageUrl?: string;
  author?: string;
  publishedDate?: string;
  updatedAt?: string;
  tags?: string[];
  viewsCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
}

export interface AIPromptQuestion {
  id: string;
  promptText: string;
  answer?: string;
  category: TopicType | 'Tất cả';
  timePeriod: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  order: number;
}

export interface AIChatLog {
  id: string;
  userQuestion: string;
  aiResponse: string;
  topicCategory: TopicType;
  timestamp: string;
  isEmergency?: boolean;
  userFeedback?: 'helpful' | 'unhelpful';
}

export interface SchoolConfig {
  schoolName: string;
  schoolSubName: string;
  slogan?: string;
  schoolLogo: string;
  heroBannerImage?: string;
  heroBannerImages?: string[];
  hotline: string;
  email: string;
  facebookUrl: string;
  address: string;
  consultingRoom: string;
  googleScriptUrl: string;
  googleSheetsWebAppUrl?: string;
  adminUsername?: string;
  adminPassword?: string;
  workingHours: string;
  aiProvider?: 'gemini' | 'openai' | 'hybrid';
  openaiApiKey?: string;
}

export interface Counselor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  phone?: string;
  email?: string;
  bio?: string;
  order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}