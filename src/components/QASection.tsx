import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  MessageSquarePlus, 
  Sparkles, 
  Bot, 
  User, 
  UserX, 
  Image as ImageIcon, 
  ShieldCheck, 
  X, 
  CheckCircle,
  FileQuestion,
  GraduationCap,
  ExternalLink,
  Edit3,
  Check,
  UserCheck,
  Download,
  BookOpen,
  ListChecks,
  Lightbulb,
  ArrowRight,
  FileText,
  Lock,
  KeyRound,
  Copy,
  EyeOff,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, TopicType, QAInfographic, Counselor } from '../types';
import { initialCounselors } from '../data/initialData';
import { moderateText, validateImageFile } from '../lib/contentModeration';
import { compressImageFile } from '../utils/imageCompressor';
import { QAChartsView } from './QAChartsView';

interface QASectionProps {
  questions: Question[];
  infographics: QAInfographic[];
  counselors?: Counselor[];
  initialTopic?: TopicType;
  onAddQuestion: (q: Omit<Question, 'id' | 'code' | 'createdAt' | 'status' | 'isPublic'> & { code?: string }) => void;
  onUpdateQuestion?: (id: string, updates: Partial<Question>) => void;
  onOpenAIChat: () => void;
  isAdminLoggedIn?: boolean;
}

const TOPICS: (TopicType | 'Tất cả')[] = [
  'Tất cả',
  'Học tập',
  'Tâm lý',
  'Bạn bè',
  'Gia đình',
  'Hướng nghiệp',
  'Kỹ năng sống',
  'Hoạt động Đoàn',
  'Khác'
];

export const QASection: React.FC<QASectionProps> = ({
  questions,
  infographics,
  counselors = initialCounselors,
  initialTopic,
  onAddQuestion,
  onUpdateQuestion,
  onOpenAIChat,
  isAdminLoggedIn = false,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'infographics' | 'charts'>('questions');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'Tất cả');
  const [statusFilter, setStatusFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedInfographic, setSelectedInfographic] = useState<QAInfographic | null>(null);

  // Question Form States
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState<TopicType>('Học tập');
  const [questionText, setQuestionText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string>('');

  // Private Student Question Lookup States
  const [lookupInput, setLookupInput] = useState<string>('');
  const [searchedCode, setSearchedCode] = useState<string>('');
  const [copyToast, setCopyToast] = useState<boolean>(false);
  const [savedCodes, setSavedCodes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('thpt_bachuc_qa_codes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Admin Answer Modal States
  const [answeringQuestion, setAnsweringQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [answeredBy, setAnsweredBy] = useState('');
  const [answerStatus, setAnswerStatus] = useState<'answered' | 'pending'>('answered');
  const [answerSavedToast, setAnswerSavedToast] = useState(false);

  // Helper for lookup
  const handleLookupSubmit = (e?: React.FormEvent, codeToFind?: string) => {
    if (e) e.preventDefault();
    const query = (codeToFind !== undefined ? codeToFind : lookupInput).trim();
    if (!query) {
      alert('Vui lòng nhập Mã tra cứu câu hỏi (Ví dụ: HD-1234)!');
      return;
    }
    setSearchedCode(query);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  // Find question for student lookup
  const lookedUpQuestion = searchedCode
    ? questions.find(
        (q) =>
          q.code.toLowerCase() === searchedCode.toLowerCase() ||
          (!q.isAnonymous && q.studentName.toLowerCase() === searchedCode.toLowerCase())
      )
    : null;

  // Filter questions for Admin view
  const filteredQuestions = questions.filter((q) => {
    const matchesTopic = selectedTopic === 'Tất cả' || q.topic === selectedTopic;
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesSearch = 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      q.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTopic && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.reason || 'Tệp ảnh không hợp lệ hoặc bị từ chối bởi bức tường lửa bảo mật.');
        e.target.value = '';
        return;
      }
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.82);
        setAttachedImage(compressed);
      } catch (err) {
        console.error('Error compressing image:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    // Kiểm duyệt qua Tường lửa bảo vệ học đường
    const textMod = moderateText(questionText);
    if (!textMod.isSafe) {
      alert(textMod.reason || 'Nội dung câu hỏi không phù hợp với chuẩn mực học đường!');
      return;
    }

    if (!isAnonymous && studentName.trim()) {
      const nameMod = moderateText(studentName);
      if (!nameMod.isSafe) {
        alert('Tên người gửi không hợp lệ!');
        return;
      }
    }

    const uniqueCode = `HD-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastGeneratedCode(uniqueCode);

    onAddQuestion({
      studentName: isAnonymous ? 'Học sinh ẩn danh' : (studentName.trim() || 'Học sinh THPT'),
      isAnonymous,
      className: className.trim() || 'Học sinh THPT',
      topic,
      question: textMod.sanitizedText || questionText.trim(),
      attachedImage: attachedImage || undefined,
      code: uniqueCode,
    });

    // Save code to local storage for quick access
    try {
      const updatedCodes = Array.from(new Set([uniqueCode, ...savedCodes])).slice(0, 5);
      setSavedCodes(updatedCodes);
      localStorage.setItem('thpt_bachuc_qa_codes', JSON.stringify(updatedCodes));
    } catch (err) {
      console.error(err);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setFormSubmitted(true);
  };

  // Open Admin Answer Modal
  const handleOpenAnswerModal = (q: Question) => {
    setAnsweringQuestion(q);
    setAnswerContent(q.answer || '');
    setAnsweredBy(q.answeredBy || (counselors[0]?.name ? `${counselors[0].name} (${counselors[0].role})` : 'Tổ Tư vấn Học đường'));
    setAnswerStatus(q.status || 'answered');
  };

  // Save Answer
  const handleSaveAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringQuestion) return;

    if (onUpdateQuestion) {
      onUpdateQuestion(answeringQuestion.id, {
        answer: answerContent.trim(),
        answeredBy: answeredBy.trim() || 'Tổ Tư vấn Học đường',
        answeredAt: new Date().toISOString(),
        status: answerStatus,
      });
    }

    setAnswerSavedToast(true);
    setTimeout(() => {
      setAnswerSavedToast(false);
      setAnsweringQuestion(null);
    }, 1200);
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-blue-50/50 via-slate-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Header & Large Interactive Action Blocks */}
        <div className="space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>CHUYÊN MỤC GIẢI ĐÁP & TƯ VẤN TRỰC TUYẾN</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              HỎI VÀ ĐÁP HỌC ĐƯỜNG
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              Nơi học sinh THPT Ba Chúc gửi gắm mọi câu hỏi về tâm lý, cảm xúc, phương pháp học tập, chọn ngành nghề và kỹ năng sống. Bạn có thể trò chuyện tức thì với Chat AI hoặc gửi câu hỏi ẩn danh đến Thầy Cô Ban Tư vấn!
            </p>
          </div>

          {/* TWO GRAND ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: HỎI CHAT AI TRỰC TUYẾN */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-purple-300/40">
                    <Bot className="w-7 h-7 text-white animate-bounce" />
                  </div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>TRỰC TUYẾN 24/7</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-yellow-300 tracking-tight">
                    HỎI CHAT AI TRỰC TUYẾN
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-100 leading-relaxed mt-1">
                    Trợ lý AI tâm lý học đường phản hồi tức thì mọi thắc mắc học tập, cân bằng cảm xúc, bí quyết giảm stress và định hướng tương lai.
                  </p>
                </div>
              </div>

              <div className="pt-5 relative z-10">
                <button
                  onClick={onOpenAIChat}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2.5"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>TRÒ CHUYỆN VỚI CHAT AI NGAY (24/7)</span>
                </button>
              </div>
            </div>

            {/* Card 2: ĐẶT CÂU HỎI CHO THẦY CÔ BAN TƯ VẤN */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300/40">
                    <MessageSquarePlus className="w-7 h-7 text-white" />
                  </div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-yellow-300 text-xs font-black rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% ẨN DANH & BẢO MẬT</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-300 tracking-tight">
                    ĐẶT CÂU HỎI ĐẾN THẦY CÔ
                  </h3>
                  <p className="text-xs sm:text-sm text-teal-100 leading-relaxed mt-1">
                    Gửi gắm tâm sự và câu hỏi chuyên sâu đến Đội ngũ Thầy Cô & Chuyên gia Ban Tư vấn Trường THPT Ba Chúc để được giải đáp tận tình.
                  </p>
                </div>
              </div>

              <div className="pt-5 relative z-10">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2.5"
                >
                  <Send className="w-5 h-5 text-yellow-300" />
                  <span>GỬI CÂU HỎI MỚI CHO THẦY CÔ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation: Danh sách câu hỏi vs Ảnh & Infographics */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-3 px-4 font-black text-xs sm:text-sm transition cursor-pointer flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'border-blue-600 text-blue-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isAdminLoggedIn ? (
              <>
                <FileQuestion className="w-4 h-4" />
                <span>Quản Lý Hỏi & Đáp ({filteredQuestions.length})</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Tra Cứu Câu Hỏi Riêng Tư</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('infographics')}
            className={`pb-3 px-4 font-black text-xs sm:text-sm transition cursor-pointer flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'infographics'
                ? 'border-blue-600 text-blue-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Cẩm Nang & Infographic ({infographics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`pb-3 px-4 font-black text-xs sm:text-sm transition cursor-pointer flex items-center space-x-2 border-b-2 whitespace-nowrap ${
              activeTab === 'charts'
                ? 'border-blue-600 text-blue-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Biểu Đồ & Thống Kê Hỏi Đáp</span>
          </button>
        </div>

        {activeTab === 'questions' ? (
          <>
            {/* NON-ADMIN STUDENT VIEW: PRIVATE LOOKUP & PRIVACY LOCK */}
            {!isAdminLoggedIn ? (
              <div className="space-y-6">
                {/* 1. Privacy & Confidentiality Announcement */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider mb-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>100% BẢO MẬT TÂM TƯ HỌC ĐƯỜNG</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                          KHÔNG GIAN TƯ VẤN KÍN ĐÁO & RIÊNG TƯ
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      <span>GỬI CÂU HỎI MỚI</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                    Để đảm bảo quyền riêng tư, tôn trọng sự nhạy cảm và bảo vệ cảm xúc của mỗi học sinh, <strong className="text-yellow-300">hệ thống khóa chế độ công khai danh sách câu hỏi</strong>. Học sinh khác không thể xem câu hỏi của bạn. Chỉ có Thầy Cô Ban Tư vấn và chính bạn (thông qua Mã tra cứu) mới có quyền xem nội dung phản hồi.
                  </p>
                </div>

                {/* 2. Private Question Lookup Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-indigo-700 font-black text-xs uppercase tracking-wider">
                      <KeyRound className="w-4 h-4" />
                      <span>TRA CỨU CÂU TRẢ LỜI CỦA BẠN</span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900">
                      Nhập Mã Tra Cứu Để Xem Lời Khuyên Từ Thầy Cô
                    </h4>
                    <p className="text-xs text-slate-500">
                      Khi gửi câu hỏi, bạn được cấp một Mã số bí mật (ví dụ: <code className="font-mono font-bold text-indigo-600">HD-1234</code>). Hãy nhập mã để xem tiến độ và phản hồi.
                    </p>
                  </div>

                  <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={lookupInput}
                        onChange={(e) => setLookupInput(e.target.value)}
                        placeholder="Nhập mã câu hỏi (ví dụ: HD-1234, HD-5678)..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase font-mono placeholder:normal-case placeholder:font-sans"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2 shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>TRA CỨU NGAY</span>
                    </button>
                  </form>

                  {/* Saved Codes on this Device */}
                  {savedCodes.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mã câu hỏi đã gửi trên thiết bị này:</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {savedCodes.map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              setLookupInput(code);
                              handleLookupSubmit(undefined, code);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                              searchedCode.toLowerCase() === code.toLowerCase()
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{code}</span>
                            {searchedCode.toLowerCase() === code.toLowerCase() && (
                              <Check className="w-3 h-3 text-yellow-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Lookup Result Display */}
                  {searchedCode && (
                    <div className="pt-4 border-t border-slate-100">
                      {lookedUpQuestion ? (
                        <div className="bg-slate-50 rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 space-y-5">
                          {/* Result Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-extrabold px-3 py-1 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-200">
                                {lookedUpQuestion.code}
                              </span>
                              <span className="font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                {lookedUpQuestion.topic}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {lookedUpQuestion.status === 'answered' ? (
                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>ĐÃ ĐƯỢC THẦY CÔ TRẢ LỜI</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                                  <span>ĐANG CHỜ PHẢN HỒI</span>
                                </span>
                              )}
                              <span className="text-slate-400">
                                {new Date(lookedUpQuestion.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          {/* Question details */}
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2.5">
                              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                  {lookedUpQuestion.question}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Người gửi: <strong>{lookedUpQuestion.isAnonymous ? 'Học sinh ẩn danh' : lookedUpQuestion.studentName}</strong> • Lớp: <strong>{lookedUpQuestion.className}</strong>
                                </p>
                                {lookedUpQuestion.tags && lookedUpQuestion.tags.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {lookedUpQuestion.tags.map((tag, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-[11px] font-semibold"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {lookedUpQuestion.attachedImage && (
                              <div className="pl-8 pt-1">
                                <img
                                  src={lookedUpQuestion.attachedImage}
                                  alt="Ảnh đính kèm"
                                  className="max-h-56 rounded-2xl object-cover border border-slate-200"
                                />
                              </div>
                            )}
                          </div>

                          {/* Official Counselor Answer */}
                          {lookedUpQuestion.status === 'answered' && lookedUpQuestion.answer ? (
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border border-emerald-300 space-y-3 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-emerald-950">
                                      {lookedUpQuestion.answeredBy || 'Tổ Tư vấn Học đường THPT Ba Chúc'}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 font-semibold">Lời giải đáp và tư vấn chính thức</p>
                                  </div>
                                </div>
                                {lookedUpQuestion.answeredAt && (
                                  <span className="text-[11px] text-emerald-700 font-medium">
                                    Ngày trả lời: {new Date(lookedUpQuestion.answeredAt).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                                {lookedUpQuestion.answer}
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                              <p className="font-bold flex items-center space-x-1.5">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Thầy Cô đang nghiên cứu và soạn câu trả lời cho bạn</span>
                              </p>
                              <p className="text-amber-800 leading-relaxed">
                                Câu hỏi của bạn đã được chuyển đến Thầy/Cô chuyên trách chủ đề <strong>{lookedUpQuestion.topic}</strong>. Bạn vui lòng quay lại tra cứu sau hoặc trò chuyện ngay với Trợ lý AI để được giải đáp tức thì nhé!
                              </p>
                              <button
                                onClick={onOpenAIChat}
                                className="mt-1 inline-flex items-center space-x-1 text-xs font-black text-indigo-700 hover:underline cursor-pointer"
                              >
                                <Bot className="w-3.5 h-3.5" />
                                <span>Trò chuyện nhanh cùng Chat AI →</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                          <p className="text-sm font-bold text-slate-800">
                            Không tìm thấy câu hỏi với mã "{searchedCode}"
                          </p>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Bạn vui lòng kiểm tra lại chính xác Mã số (ví dụ: <code className="font-mono font-bold text-indigo-600">HD-1234</code>) hoặc đặt câu hỏi mới nếu bạn chưa gửi nhé.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Instructions Guide when no search yet */}
                  {!searchedCode && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                        <h5 className="font-bold text-xs text-slate-800">Gửi câu hỏi</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Nhấn nút Đặt câu hỏi cho Thầy Cô (có thể chọn ẩn danh 100%).</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                        <h5 className="font-bold text-xs text-slate-800">Lưu mã tra cứu</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Hệ thống cấp cho bạn 1 Mã tra cứu riêng (ví dụ: HD-1234) khi gửi thành công.</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</div>
                        <h5 className="font-bold text-xs text-slate-800">Xem câu trả lời</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Nhập mã vào ô trên bất cứ lúc nào để đọc phản hồi bảo mật của Thầy Cô.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ADMIN LOGGED-IN VIEW: FULL QUESTIONS MANAGEMENT */
              <div className="space-y-4">
                {/* Admin Notice Banner */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold">
                      🔒 CHẾ ĐỘ QUẢN TRỊ VIÊN: Bạn đang có quyền xem toàn bộ {filteredQuestions.length} câu hỏi của học sinh trên hệ thống.
                    </span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 bg-indigo-200/80 rounded-full font-extrabold text-indigo-950">
                    Bảo mật tuyệt đối
                  </span>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                  {/* Topic Pills */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTopic(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedTopic === t
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter & Search */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          statusFilter === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        onClick={() => setStatusFilter('answered')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          statusFilter === 'answered'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Đã trả lời
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          statusFilter === 'pending'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Chờ phản hồi
                      </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm câu hỏi, mã số, học sinh..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                    <FileQuestion className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-lg font-bold text-slate-700">Không tìm thấy câu hỏi phù hợp</p>
                    <p className="text-sm text-slate-500">Chưa có câu hỏi nào trong danh mục hoặc bộ lọc này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Result count indicator */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
                      <span>
                        Hiển thị <strong className="text-slate-800">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredQuestions.length)}</strong> trên tổng số <strong className="text-slate-800">{filteredQuestions.length}</strong> câu hỏi
                      </span>
                      <span>Trang {validCurrentPage} / {totalPages}</span>
                    </div>

                    {paginatedQuestions.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
                      >
                        {/* Header: Code, Topic, Status & Time */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                              {item.code}
                            </span>
                            <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {item.topic}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3">
                            {item.status === 'answered' ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>ĐÃ TRẢ LỜI</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                                <span>ĐANG CHỜ PHẢN HỒI</span>
                              </span>
                            )}
                            <span className="text-slate-400 hidden sm:inline">
                              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                            {/* Admin quick answer button */}
                            <button
                              onClick={() => handleOpenAnswerModal(item)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs flex items-center space-x-1 transition cursor-pointer"
                              title="Quản trị: Cập nhật câu trả lời"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{item.status === 'answered' ? 'Sửa câu trả lời' : 'Trả lời ngay'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2.5">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                {item.question}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center space-x-2">
                                <span>Người hỏi: <strong className="text-slate-700">{item.isAnonymous ? 'Học sinh ẩn danh' : item.studentName}</strong></span>
                                <span>•</span>
                                <span>Lớp: <strong className="text-slate-700">{item.className}</strong></span>
                              </p>
                              {/* AI Topic & Tags */}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                                  {item.tags.map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-medium"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Attached Image if any */}
                          {item.attachedImage && (
                            <div className="mt-2 pl-8">
                              <img
                                src={item.attachedImage}
                                alt="Ảnh đính kèm câu hỏi"
                                className="max-h-56 rounded-2xl object-cover border border-slate-200 shadow-xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* Answer Area (if answered) */}
                        {item.status === 'answered' && item.answer && (
                          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/80 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/50 pb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                  <GraduationCap className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-emerald-950">
                                    {item.answeredBy || 'Tổ Tư vấn Học đường'}
                                  </p>
                                  <p className="text-[10px] text-emerald-700 font-semibold">Phản hồi chính thức</p>
                                </div>
                              </div>
                              {item.answeredAt && (
                                <span className="text-[11px] text-emerald-700 font-medium">
                                  Ngày trả lời: {new Date(item.answeredAt).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </p>
                          </div>
                        )}

                        {/* Note if still pending */}
                        {item.status === 'pending' && (
                          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                            <span>⏳ Câu hỏi đang chờ Ban Tư vấn phản hồi.</span>
                            <button
                              onClick={() => handleOpenAnswerModal(item)}
                              className="font-bold bg-amber-600 text-white px-2.5 py-1 rounded-lg text-xs hover:bg-amber-700 transition cursor-pointer"
                            >
                              ✍️ Trả lời ngay
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 pt-4 pb-2">
                        <button
                          onClick={() => {
                            setCurrentPage(p => Math.max(p - 1, 1));
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          disabled={validCurrentPage === 1}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                        >
                          ← Trang trước
                        </button>

                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                            let pageNum = idx + 1;
                            if (totalPages > 7 && validCurrentPage > 4) {
                              pageNum = validCurrentPage - 3 + idx;
                              if (pageNum > totalPages) pageNum = totalPages - (6 - idx);
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => {
                                  setCurrentPage(pageNum);
                                  window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                                  validCurrentPage === pageNum
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => {
                            setCurrentPage(p => Math.min(p + 1, totalPages));
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          disabled={validCurrentPage === totalPages}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
                        >
                          Trang sau →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* INFOGRAPHICS & PHOTO GALLERY */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>KHO TRI THỨC TRỰC QUAN</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">CẨM NANG & INFOGRAPHIC TƯ VẤN HỌC ĐƯỜNG</h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
                Tài liệu trực quan, sơ đồ hướng nghiệp, bí kíp rèn luyện cảm xúc và kỹ năng giải quyết mâu thuẫn học đường do Tổ Tư vấn Trường THPT Ba Chúc biên soạn và tuyển chọn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {infographics.map((info) => (
                <div
                  key={info.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
                >
                  <div>
                    <div className="relative overflow-hidden h-52 bg-slate-900">
                      <img
                        src={info.imageUrl}
                        alt={info.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full shadow-md">
                          {info.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-black text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors">
                        {info.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {info.description}
                      </p>

                      {/* Action Steps Count or Key points pill */}
                      {info.actionSteps && info.actionSteps.length > 0 && (
                        <div className="flex items-center space-x-2 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
                          <ListChecks className="w-3.5 h-3.5" />
                          <span>Bao gồm {info.actionSteps.length} bước hướng dẫn thực hành</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Biên soạn: <strong className="text-slate-700">{info.author}</strong></span>
                      <span>{new Date(info.uploadDate).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <button
                      onClick={() => setSelectedInfographic(info)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>XEM BÀI VIẾT & HƯỚNG DẪN CHI TIẾT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BIỂU ĐỒ & THỐNG KÊ HỎI ĐÁP ================= */}
        {activeTab === 'charts' && (
          <QAChartsView questions={questions} isAdmin={isAdminLoggedIn} />
        )}

        {/* MODAL: CHI TIẾT INFOGRAPHIC & BÀI VIẾT CẨM NANG */}
        {selectedInfographic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 my-6 border border-slate-200">
              {/* Close Button */}
              <button
                onClick={() => setSelectedInfographic(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full cursor-pointer hover:bg-slate-100 transition z-10"
                aria-label="Đóng"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-full">
                    {selectedInfographic.category}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Đăng ngày {new Date(selectedInfographic.uploadDate).toLocaleDateString('vi-VN')} • Tác giả: {selectedInfographic.author}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {selectedInfographic.title}
                </h2>
              </div>

              {/* Infographic Banner Image */}
              <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-900 relative group">
                <img
                  src={selectedInfographic.imageUrl}
                  alt={selectedInfographic.title}
                  className="w-full max-h-96 object-contain mx-auto"
                />
              </div>

              {/* Summary Description */}
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs sm:text-sm text-blue-950 leading-relaxed font-medium">
                <div className="flex items-center space-x-2 font-black text-blue-900 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>TỔNG QUAN NỘI DUNG:</span>
                </div>
                {selectedInfographic.description}
              </div>

              {/* Full Article Content */}
              {selectedInfographic.content && (
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
                  <h3 className="font-black text-slate-900 text-base uppercase flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>NỘI DUNG CHI TIẾT CỦA BÀI VIẾT</span>
                  </h3>
                  <div className="whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-800 space-y-2">
                    {selectedInfographic.content}
                  </div>
                </div>
              )}

              {/* Action Steps Guidance */}
              {selectedInfographic.actionSteps && selectedInfographic.actionSteps.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h3 className="font-black text-slate-900 text-base uppercase flex items-center space-x-2">
                    <ListChecks className="w-4 h-4 text-emerald-600" />
                    <span>LỘ TRÌNH CÁC BƯỚC THỰC HÀNH CỤ THỂ</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedInfographic.actionSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {selectedInfographic.keyTakeaways && selectedInfographic.keyTakeaways.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h3 className="font-black text-slate-900 text-base uppercase flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>ĐIỂM THEN CHỐT CẦN GHI NHỚ</span>
                  </h3>
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                    {selectedInfographic.keyTakeaways.map((point, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-amber-950 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Link or Download Action Bar */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedInfographic.articleUrl && (
                    <a
                      href={selectedInfographic.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xem nguồn bài viết chính thức</span>
                    </a>
                  )}

                  <a
                    href={selectedInfographic.downloadUrl || selectedInfographic.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tải ảnh/Tài liệu về máy</span>
                  </a>
                </div>

                <button
                  onClick={() => {
                    const mappedTopic: TopicType = 
                      selectedInfographic.category === 'Tâm lý học đường' ? 'Tâm lý' :
                      selectedInfographic.category === 'Phương pháp học tập' ? 'Học tập' :
                      selectedInfographic.category === 'Định hướng nghề nghiệp' ? 'Hướng nghiệp' :
                      selectedInfographic.category === 'Kỹ năng sống' ? 'Kỹ năng sống' : 'Khác';
                    setTopic(mappedTopic);
                    setSelectedInfographic(null);
                    setIsModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Hỏi Thầy Cô về chủ đề này</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ĐẶT CÂU HỎI MỚI */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 my-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {formSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900">Gửi câu hỏi thành công!</h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                      Câu hỏi của bạn đã được gửi an toàn & bảo mật đến Thầy Cô Tổ Tư vấn THPT Ba Chúc.
                    </p>
                  </div>

                  {/* Secret Code Card */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl space-y-3 text-left">
                    <div className="flex items-center space-x-2 text-xs font-black text-indigo-900 uppercase">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>MÃ TRA CỨU RIÊNG TƯ CỦA BẠN</span>
                    </div>

                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-indigo-200 shadow-xs">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-900 tracking-wider">
                        {lastGeneratedCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(lastGeneratedCode)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        {copyToast ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã sao chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép mã</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      💡 <strong>Lưu ý:</strong> Hãy lưu lại mã số này hoặc chụp màn hình. Bạn có thể nhập mã này tại mục Hỏi & Đáp bất kỳ lúc nào để xem phản hồi của Thầy Cô mà không lo bị người khác đọc trộm!
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLookupInput(lastGeneratedCode);
                        handleLookupSubmit(undefined, lastGeneratedCode);
                        setIsModalOpen(false);
                        setFormSubmitted(false);
                        setStudentName('');
                        setClassName('');
                        setQuestionText('');
                        setAttachedImage(null);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Search className="w-4 h-4" />
                      <span>Xem trạng thái câu hỏi ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setFormSubmitted(false);
                        setStudentName('');
                        setClassName('');
                        setQuestionText('');
                        setAttachedImage(null);
                      }}
                      className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900">
                      ĐẶT CÂU HỎI TƯ VẤN MỚI
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mọi thông tin cá nhân đều được bảo mật 100% theo quy định tư vấn học đường.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Anonymous toggle */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        {isAnonymous ? (
                          <UserX className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <User className="w-5 h-5 text-emerald-600" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Chế độ ẩn danh
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {isAnonymous ? 'Tên của bạn sẽ hiển thị là "Học sinh ẩn danh"' : 'Hiển thị họ tên của bạn'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Họ và tên {isAnonymous && '(Tuỳ chọn)'}
                        </label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder={isAnonymous ? "Học sinh ẩn danh" : "Ví dụ: Lê Bảo Châu"}
                          disabled={isAnonymous}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lớp học <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          placeholder="Ví dụ: 12A1, 11 Lý, 10D..."
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Lĩnh vực cần tư vấn <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value as TopicType)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        {TOPICS.filter((t) => t !== 'Tất cả').map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Question Content */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nội dung câu hỏi cụ thể <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Hãy mô tả chi tiết vấn đề hoặc câu hỏi của bạn để thầy cô hỗ trợ chính xác nhất..."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tải ảnh minh họa / đề bài (Tuỳ chọn - .PNG, .PJG, .JPG, .JPEG, .WEBP)
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          <span>Tải ảnh lên (.PNG, .PJG, .JPG...)</span>
                          <input
                            type="file"
                            accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {attachedImage && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={attachedImage}
                              alt="Attached"
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => setAttachedImage(null)}
                              className="text-xs text-rose-600 hover:underline"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition cursor-pointer text-sm flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>GỬI CÂU HỎI TƯ VẤN</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          onOpenAIChat();
                        }}
                        className="py-3.5 px-4 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-2xl transition cursor-pointer text-sm flex items-center justify-center space-x-1.5"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Chat với AI ngay</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* MODAL: QUẢN TRỊ VIÊN CẬP NHẬT CÂU TRẢ LỜI */}
        {answeringQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 my-8">
              <button
                onClick={() => setAnsweringQuestion(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {answerSavedToast ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Đã cập nhật câu trả lời!</h3>
                  <p className="text-sm text-slate-600">
                    Phản hồi tư vấn đã được lưu và công khai trên bảng Hỏi & Đáp.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-xs font-bold rounded">
                        {answeringQuestion.code}
                      </span>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                        {answeringQuestion.topic}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      CẬP NHẬT CÂU TRẢ LỜI CỦA THẦY CÔ
                    </h3>
                    <p className="text-xs text-slate-500">
                      Học sinh: <strong>{answeringQuestion.isAnonymous ? 'Học sinh ẩn danh' : answeringQuestion.studentName}</strong> (Lớp {answeringQuestion.className})
                    </p>
                  </div>

                  {/* Original Question Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase">Nội dung câu hỏi của học sinh:</p>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      "{answeringQuestion.question}"
                    </p>
                  </div>

                  <form onSubmit={handleSaveAnswer} className="space-y-4">
                    {/* Answering Teacher Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Thầy/Cô phụ trách trả lời <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={answeredBy}
                        onChange={(e) => setAnsweredBy(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

                    {/* Answer Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Nội dung câu trả lời tư vấn <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400">Hỗ trợ xuống dòng và định dạng văn bản</span>
                      </div>
                      <textarea
                        required
                        rows={6}
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        placeholder="Nhập nội dung tư vấn, lời khuyên, giải pháp cụ thể của Thầy/Cô gửi đến học sinh..."
                        className="w-full px-3.5 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Status Selection */}
                    <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Trạng thái:</span>
                      <label className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="answered"
                          checked={answerStatus === 'answered'}
                          onChange={() => setAnswerStatus('answered')}
                          className="accent-emerald-600"
                        />
                        <span>Đã trả lời (Công khai)</span>
                      </label>
                      <label className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-800 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="pending"
                          checked={answerStatus === 'pending'}
                          onChange={() => setAnswerStatus('pending')}
                          className="accent-amber-600"
                        />
                        <span>Đang chờ phản hồi (Bản nháp)</span>
                      </label>
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-2 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setAnsweringQuestion(null)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>LƯU & CÔNG KHAI CÂU TRẢ LỜI</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
