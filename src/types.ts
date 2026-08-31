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
  academicYear?: string; // e.g. "2025 - 2026", "2024 - 2025"
  phone: string;
  email?: string;
  avatarUrl?: string; // Ảnh đại diện học sinh
  activities: string[]; // Công tác Đoàn, Tình nguyện, Hoa Phượng Đỏ, Văn nghệ, Thể thao, Truyền thông, Hoạt động xã hội, Câu lạc bộ
  skills: string;
  desires: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'approved' | 'contacted' | 'assigned' | 'rejected';
  isLeader?: boolean; // Cờ thủ lĩnh 🚩
  leaderRole?: string; // e.g. "Bí thư Chi đoàn", "Đội trưởng Xung kích", "Thủ lĩnh Thanh niên"
  assignedClub?: string;
  notes?: string;
}

export type VolunteerStatus = 
  | 'active'                       // Đang hoạt động tích cực
  | 'graduated_12'                // Đã hoàn thành lớp 12 / Tốt nghiệp
  | 'inactive_rules_violation'     // Không nghiêm túc trong phong trào tình nguyện
  | 'inactive_low_performance'     // Sức học giảm sút (tạm dừng để tập trung học tập)
  | 'honored';                     // Được vinh danh xuất sắc

export interface VolunteerMember {
  id: string;
  code: string;
  fullName: string;
  className: string;
  academicYear?: string; // e.g. "2025 - 2026"
  phone: string;
  email?: string;
  joinedDate: string;
  avatarUrl?: string;
  skills: string;
  activitiesCount: number; // Số lần tham gia phong trào tình nguyện
  status: VolunteerStatus;
  statusReason?: string;
  isLeader?: boolean; // Cờ thủ lĩnh 🚩
  leaderRole?: string; // e.g. "Đội trưởng Đội Tình nguyện"
  isHonored?: boolean;     // Được vinh danh học sinh tích cực
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
  timesParticipated: number; // Số lần đã tham gia tính đến hiện tại
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
  articleUrl?: string; // Đường dẫn bài viết chi tiết / tài liệu / Kế hoạch
  content?: string; // Toàn văn bài viết hướng dẫn / kế hoạch chi tiết
  actionSteps?: string[]; // Các bước tham gia / thực hiện
}

export interface QAInfographic {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  uploadDate: string;
  author: string;
  articleUrl?: string; // Đường dẫn bài viết chi tiết / tài liệu nguồn chính thức
  content?: string; // Toàn văn bài viết hướng dẫn & giải thích infographic
  actionSteps?: string[]; // Danh sách các bước thực hiện / hành động cụ thể
  keyTakeaways?: string[]; // Điểm then chốt cần ghi nhớ
  downloadUrl?: string; // Link tải ảnh gốc chất lượng cao / PDF
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
  readTime: string; // e.g. "3 phút đọc"
  badgeColor?: string;
  iconName?: string; // e.g. "Activity", "Apple", "Stethoscope", "HeartPulse", "ShieldCheck", "Zap"
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
  answer?: string; // Định hướng / Câu trả lời chuẩn của Nhà trường để AI trả lời đúng ý, không gây hoang mang
  category: TopicType | 'Tất cả';
  timePeriod: string; // e.g., 'Toàn thời gian', 'Mùa thi học kỳ & TN THPT', 'Đầu năm học mới', 'Mùa tuyển sinh & hướng nghiệp', 'Chiến dịch hè & Đoàn - Hội'
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
  heroBannerImages?: string[]; // Multiple photos (approx 7 photos) for Safe Space Auto Carousel
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
  role: string; // e.g. "BT Đoàn", "PBT Đoàn", "Tổ trưởng Tổ GDKT&PL - Địa lý"
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
