import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  MessageSquareQuote, 
  BookOpen, 
  ShieldCheck, 
  Phone, 
  Plus, 
  Send, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  HelpCircle, 
  Calendar, 
  User, 
  Camera, 
  X, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  FileText, 
  Activity, 
  Apple, 
  Zap, 
  Clock, 
  ArrowRight,
  Download,
  Share2,
  Info,
  Edit,
  Trash2,
  Tag,
  Copy,
  Check,
  Filter,
  Layers,
  Printer
} from 'lucide-react';
import { Question, Counselor, SchoolConfig, HealthArticle, HealthArticleCategory } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { initialHealthArticles } from '../data/healthData';
import { getHealthArticles, saveHealthArticles, addHealthArticle, updateHealthArticle, deleteHealthArticle } from '../utils/storage';

interface HealthCareSectionProps {
  questions: Question[];
  counselors: Counselor[];
  config: SchoolConfig;
  healthArticles?: HealthArticle[];
  onAddQuestion: (newQuestion: Omit<Question, 'id' | 'code' | 'createdAt' | 'status' | 'isPublic'> & { isPublic?: boolean }) => Promise<Question> | Question;
  onAddHealthArticle?: (article: Omit<HealthArticle, 'id'>) => Promise<HealthArticle> | HealthArticle;
  onUpdateHealthArticle?: (id: string, updates: Partial<HealthArticle>) => void;
  onDeleteHealthArticle?: (id: string) => void;
  isAdminLoggedIn?: boolean;
  onOpenQuestionModal?: () => void;
}

export const HealthCareSection: React.FC<HealthCareSectionProps> = ({
  questions,
  counselors,
  config,
  healthArticles: propHealthArticles,
  onAddQuestion,
  onAddHealthArticle,
  onUpdateHealthArticle,
  onDeleteHealthArticle,
  isAdminLoggedIn = false,
}) => {
  // Main sub-tabs: 'qa' (Hỏi đáp sức khỏe) | 'advocacy' (Tuyên truyền & Cẩm nang y tế)
  const [activeSubTab, setActiveSubTab] = useState<'qa' | 'advocacy'>('advocacy');

  // Local state for health articles fallback
  const [localArticles, setLocalArticles] = useState<HealthArticle[]>(() => {
    return propHealthArticles && propHealthArticles.length > 0 ? propHealthArticles : getHealthArticles();
  });

  // Effective articles list
  const healthArticles = useMemo(() => {
    if (propHealthArticles && propHealthArticles.length > 0) {
      return propHealthArticles;
    }
    return localArticles.length > 0 ? localArticles : initialHealthArticles;
  }, [propHealthArticles, localArticles]);

  // QA Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [className, setClassName] = useState('10A1');
  const [healthCategory, setHealthCategory] = useState('Dinh dưỡng & Thể lực');
  const [questionContent, setQuestionContent] = useState('');
  const [attachedImage, setAttachedImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSecretCode, setSubmittedSecretCode] = useState<string | null>(null);

  // Search & Lookup State for QA
  const [searchSecretCode, setSearchSecretCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Question | null>(null);
  const [lookupError, setLookupError] = useState(false);

  // Selected Advocacy Article Modal for Reading
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Advocacy Filter & Search
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tất cả');

  // Advocacy Article Add / Edit Modal State
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState<string>('Bệnh học đường');
  const [artReadTime, setArtReadTime] = useState('3 phút đọc');
  const [artAuthor, setArtAuthor] = useState('Cô Nguyễn Thị Hiệp (Cán bộ Y tế Trường THPT Ba Chúc)');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artTips, setArtTips] = useState<string[]>(['']);
  const [artImageUrl, setArtImageUrl] = useState('');
  const [isCompressingArtImg, setIsCompressingArtImg] = useState(false);
  const [artSubmitting, setArtSubmitting] = useState(false);

  // Find nurse counselor
  const nurseCounselor = useMemo(() => {
    return counselors.find(c => c.name.includes('Nguyễn Thị Hiệp') || c.role.toLowerCase().includes('y tế')) || {
      id: 'c-3',
      name: 'Cô Nguyễn Thị Hiệp',
      role: 'Y tế học đường (Cán bộ Y tế Trường THPT Ba Chúc)',
      specialty: 'Chuyên tư vấn chăm sóc sức khoẻ học sinh, dinh dưỡng học đường, sơ cấp cứu & sức khỏe sinh sản tuổi vị thành niên',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      phone: config.hotline || '0789 620 212',
      email: 'nguyenthihiep@thptbachuc.edu.vn',
      bio: 'Cán bộ Y tế trường học tận tâm, giàu kinh nghiệm chăm sóc sức khỏe thể chất, sơ cấp cứu học đường và tư vấn sức khỏe tuổi mới lớn.',
      order: 3,
    };
  }, [counselors, config.hotline]);

  // Filter public health questions
  const healthQuestions = useMemo(() => {
    return questions.filter(q => q.topic === 'Sức khỏe học đường' || (q.topic === 'Khác' && q.question.toLowerCase().includes('sức khỏe')));
  }, [questions]);

  const publicHealthQuestions = useMemo(() => {
    if (isAdminLoggedIn) return healthQuestions;
    return healthQuestions.filter(q => q.isPublic && q.status === 'answered');
  }, [healthQuestions, isAdminLoggedIn]);

  // Filtered health articles
  const filteredArticles = useMemo(() => {
    return healthArticles.filter(art => {
      const matchCategory = selectedCategoryFilter === 'Tất cả' || art.category === selectedCategoryFilter;
      const q = articleSearchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        art.title.toLowerCase().includes(q) || 
        art.summary.toLowerCase().includes(q) || 
        art.content.toLowerCase().includes(q) ||
        (art.tips && art.tips.some(t => t.toLowerCase().includes(q))) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(q)));
      return matchCategory && matchSearch;
    });
  }, [healthArticles, selectedCategoryFilter, articleSearchQuery]);

  // Categories list
  const categoryOptions = [
    'Tất cả',
    'Bệnh học đường',
    'Dinh dưỡng',
    'Sơ cấp cứu',
    'Tâm sinh lý',
    'Phòng chống dịch',
    'Lối sống',
    'Vấn đề sức khỏe khác'
  ];

  // Helper for Category Badge Color
  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Dinh dưỡng':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sơ cấp cứu':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Tâm sinh lý':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Phòng chống dịch':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lối sống':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Vấn đề sức khỏe khác':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Bệnh học đường':
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  // Helper for Category Icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Dinh dưỡng':
        return Apple;
      case 'Sơ cấp cứu':
        return Stethoscope;
      case 'Tâm sinh lý':
        return HeartPulse;
      case 'Phòng chống dịch':
        return ShieldCheck;
      case 'Lối sống':
        return Zap;
      case 'Vấn đề sức khỏe khác':
        return ShieldCheck;
      case 'Bệnh học đường':
      default:
        return Activity;
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Handle Question Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const compressed = await compressImageFile(file, 800, 800, 0.85);
        setAttachedImage(compressed);
      } catch (err) {
        console.error('Error compressing image:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle Article Image Upload
  const handleArticleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingArtImg(true);
        const compressed = await compressImageFile(file, 1200, 800, 0.85);
        setArtImageUrl(compressed);
      } catch (err) {
        console.error('Error compressing article image:', err);
      } finally {
        setIsCompressingArtImg(false);
      }
    }
  };

  // Submit Health Question (Strictly Private / Hidden by default)
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi hoặc triệu chứng cần tư vấn!');
      return;
    }

    try {
      setIsSubmitting(true);
      const combinedQuestion = `[Chủ đề: ${healthCategory}] ${questionContent.trim()}`;
      
      const created = await onAddQuestion({
        studentName: isAnonymous ? 'Ẩn danh' : (studentName.trim() || 'Học sinh THPT Ba Chúc'),
        isAnonymous: isAnonymous,
        className: className,
        topic: 'Sức khỏe học đường',
        question: combinedQuestion,
        attachedImage: attachedImage || undefined,
        isPublic: false, // MANDATORY: Strictly hidden by default
        notes: `Tư vấn sức khỏe gửi tới ${nurseCounselor.name} (Phòng Y Tế).`,
      });

      setSubmittedSecretCode(created.code);
      setQuestionContent('');
      setAttachedImage('');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Lỗi khi gửi câu hỏi sức khỏe:', err);
      alert('Đã gửi thành công câu hỏi tới Cán bộ Y tế trường!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Secret Code Lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = searchSecretCode.trim().toUpperCase();
    if (!cleanCode) return;

    const found = questions.find(q => q.code.toUpperCase() === cleanCode);
    if (found) {
      setLookupResult(found);
      setLookupError(false);
    } else {
      setLookupResult(null);
      setLookupError(true);
    }
  };

  // Open Modal to Add New Article
  const handleOpenAddArticleModal = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtCategory('Bệnh học đường');
    setArtReadTime('3 phút đọc');
    setArtAuthor(`${nurseCounselor.name} (Cán bộ Y tế Trường THPT Ba Chúc)`);
    setArtSummary('');
    setArtContent(`### 1. Thực trạng & Tác hại học đường
Mô tả chi tiết nguyên nhân và nguy cơ đối với sức khỏe học sinh...

### 2. Hướng dẫn & Biện pháp phòng tránh khoa học
- Điểm 1: Thực hiện thói quen lành mạnh...
- Điểm 2: Khoảng cách và tư thế khoa học...
- Điểm 3: Bổ sung dưỡng chất hoặc bài tập thể dục...

### 3. Khuyến nghị từ Cán bộ Y tế
- Lời khuyên thiết thực dành cho học sinh THPT Ba Chúc.`);
    setArtTips(['Uống đủ nước và giữ vệ sinh cá nhân', 'Thực hiện tư thế học tập chuẩn khoa học']);
    setArtImageUrl('https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80');
    setIsArticleModalOpen(true);
  };

  // Open Modal to Edit Article
  const handleOpenEditArticleModal = (art: HealthArticle) => {
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtReadTime(art.readTime || '3 phút đọc');
    setArtAuthor(art.author || `${nurseCounselor.name} (Cán bộ Y tế)`);
    setArtSummary(art.summary || '');
    setArtContent(art.content || '');
    setArtTips(art.tips && art.tips.length > 0 ? art.tips : ['']);
    setArtImageUrl(art.imageUrl || '');
    setIsArticleModalOpen(true);
  };

  // Save Article (Add or Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết cẩm nang!');
      return;
    }
    if (!artContent.trim()) {
      alert('Vui lòng nhập nội dung cẩm nang y tế!');
      return;
    }

    const cleanTips = artTips.map(t => t.trim()).filter(t => t.length > 0);
    const badgeColor = getBadgeColor(artCategory);

    setArtSubmitting(true);
    try {
      if (editingArticleId) {
        // Update existing article
        const updates: Partial<HealthArticle> = {
          title: artTitle.trim(),
          category: artCategory,
          readTime: artReadTime.trim() || '3 phút đọc',
          badgeColor: badgeColor,
          author: artAuthor.trim(),
          summary: artSummary.trim() || artContent.substring(0, 150) + '...',
          content: artContent.trim(),
          tips: cleanTips.length > 0 ? cleanTips : ['Tuân thủ chỉ dẫn của Cán bộ Y tế'],
          imageUrl: artImageUrl.trim() || undefined,
        };

        if (onUpdateHealthArticle) {
          onUpdateHealthArticle(editingArticleId, updates);
        } else {
          const updated = updateHealthArticle(editingArticleId, updates);
          setLocalArticles(updated);
        }
        alert('Cập nhật bài viết cẩm nang y tế thành công!');
      } else {
        // Add new article
        const newArtData: Omit<HealthArticle, 'id'> = {
          title: artTitle.trim(),
          category: artCategory,
          readTime: artReadTime.trim() || '3 phút đọc',
          badgeColor: badgeColor,
          author: artAuthor.trim() || `${nurseCounselor.name} (Cán bộ Y tế)`,
          summary: artSummary.trim() || artContent.substring(0, 150) + '...',
          content: artContent.trim(),
          tips: cleanTips.length > 0 ? cleanTips : ['Tuân thủ chỉ dẫn của Cán bộ Y tế'],
          imageUrl: artImageUrl.trim() || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
          publishedDate: new Date().toLocaleDateString('vi-VN'),
          viewsCount: 0,
        };

        if (onAddHealthArticle) {
          await onAddHealthArticle(newArtData);
        } else {
          const created = addHealthArticle(newArtData);
          setLocalArticles([created, ...localArticles]);
        }
        alert('Đăng tải bài viết cẩm nang y tế mới thành công!');
      }

      setIsArticleModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi lưu bài viết cẩm nang:', err);
      alert('Đã xảy ra lỗi khi lưu bài viết!');
    } finally {
      setArtSubmitting(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = (art: HealthArticle) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${art.title}" khỏi Cẩm nang Y tế không?`)) {
      if (onDeleteHealthArticle) {
        onDeleteHealthArticle(art.id);
      } else {
        const updated = deleteHealthArticle(art.id);
        setLocalArticles(updated);
      }
      if (selectedArticleId === art.id) {
        setSelectedArticleId(null);
      }
    }
  };

  // Tip input helpers
  const handleAddTipField = () => {
    setArtTips([...artTips, '']);
  };

  const handleUpdateTipField = (index: number, val: string) => {
    const updated = [...artTips];
    updated[index] = val;
    setArtTips(updated);
  };

  const handleRemoveTipField = (index: number) => {
    if (artTips.length === 1) {
      setArtTips(['']);
    } else {
      setArtTips(artTips.filter((_, idx) => idx !== index));
    }
  };

  const selectedArticle = useMemo(() => {
    return healthArticles.find(a => a.id === selectedArticleId);
  }, [healthArticles, selectedArticleId]);

  return (
    <div id="health-care-section" className="py-8 sm:py-12 bg-gradient-to-b from-teal-50/70 via-cyan-50/40 to-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        
        {/* Top Header Banner Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-teal-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-teal-500/20 text-teal-300 rounded-full text-xs font-black uppercase tracking-wider border border-teal-400/30 shadow-inner">
                <Stethoscope className="w-4 h-4 text-teal-300 animate-pulse" />
                <span>KHÔNG GIAN Y TẾ & CHĂM SÓC SỨC KHOẺ HỌC ĐƯỜNG</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                TƯ VẤN & CẨM NANG Y TẾ HỌC ĐƯỜNG
              </h1>
              <p className="text-sm sm:text-base text-teal-100/90 max-w-2xl font-medium leading-relaxed">
                Đồng hành chăm sóc thể chất, dinh dưỡng mùa thi, sơ cấp cứu ban đầu, sức khỏe sinh sản vị thành niên và tuyên truyền phòng chống bệnh học đường tại Trường THPT Ba Chúc.
              </p>

              {/* Privacy Guarantee Pill */}
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-teal-400/30 rounded-2xl px-4 py-2 text-xs text-teal-200">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Cam kết bảo mật:</strong> Mọi câu hỏi tư vấn sức khỏe của học sinh đều được <strong>ẨN RIÊNG TƯ</strong>, chỉ Cán bộ Y tế Cô Hiệp và Quản trị viên mới được xem.
                </span>
              </div>
            </div>

            {/* Nurse Officer Profile Card */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-xl space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={nurseCounselor.avatar} 
                      alt={nurseCounselor.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-300 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 bg-teal-500 rounded-full text-white shadow-xs">
                      <Stethoscope className="w-3 h-3" />
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-teal-300 tracking-wider">Cán Bộ Phụ Trách Y Tế</span>
                    <h3 className="text-base sm:text-lg font-black text-white">{nurseCounselor.name}</h3>
                    <p className="text-xs text-teal-200 font-semibold">{nurseCounselor.role}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed italic bg-black/20 p-3 rounded-2xl border border-white/10">
                  "{nurseCounselor.specialty}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-teal-200">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trực phòng Y tế: 07:00 - 17:00</span>
                  </div>
                  <a 
                    href={`tel:${nurseCounselor.phone || config.hotline}`}
                    className="inline-flex items-center space-x-1 bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1 rounded-full font-black text-xs shadow-md transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Gọi Ngay</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 2 MAIN TABS: TUYÊN TRUYỀN & CẨM NANG vs HỎI ĐÁP SỨC KHỎE */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                id="tab-health-advocacy-btn"
                onClick={() => setActiveSubTab('advocacy')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer ${
                  activeSubTab === 'advocacy'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>1. TUYÊN TRUYỀN & CẨM NANG Y TẾ</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                  {healthArticles.length} bài
                </span>
              </button>

              <button
                type="button"
                id="tab-health-qa-btn"
                onClick={() => setActiveSubTab('qa')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer ${
                  activeSubTab === 'qa'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <MessageSquareQuote className="w-4 h-4" />
                <span>2. HỎI ĐÁP SỨC KHỎE RIÊNG TƯ</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-teal-500/30 text-white font-bold">
                  Bảo mật
                </span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-3">
              {activeSubTab === 'advocacy' && (
                <button
                  type="button"
                  id="btn-add-health-article"
                  onClick={handleOpenAddArticleModal}
                  className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-800 hover:to-cyan-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Cẩm Nang Y Tế Mới</span>
                </button>
              )}

              {activeSubTab === 'qa' && (
                <button
                  type="button"
                  id="btn-open-health-qa-form"
                  onClick={() => setIsFormOpen(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Gửi Câu Hỏi Sức Khỏe Mới</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= TAB 1: TUYÊN TRUYỀN & CẨM NANG Y TẾ ================= */}
          {activeSubTab === 'advocacy' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Filter & Search Bar */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="search-health-article"
                      value={articleSearchQuery}
                      onChange={(e) => setArticleSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm cẩm nang, sơ cấp cứu, dinh dưỡng, bệnh học đường..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                    />
                    {articleSearchQuery && (
                      <button 
                        type="button"
                        onClick={() => setArticleSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Quick stats / count */}
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>Hiển thị <strong>{filteredArticles.length}</strong> / {healthArticles.length} bài viết cẩm nang y tế</span>
                  </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 pr-2 shrink-0">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Chuyên mục:</span>
                  </div>
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                        selectedCategoryFilter === cat
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Grid */}
              {filteredArticles.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
                  <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Không tìm thấy bài viết cẩm nang phù hợp</h3>
                    <p className="text-xs text-slate-500">
                      Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút "Đăng Cẩm Nang Y Tế Mới" để thêm bài viết đầu tiên.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddArticleModal}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-xs shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng Cẩm Nang Mới</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((art) => {
                    const IconComp = getCategoryIcon(art.category);
                    const badgeClass = getBadgeColor(art.category);

                    return (
                      <div 
                        key={art.id}
                        id={`health-article-card-${art.id}`}
                        className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-slate-200/80 hover:border-teal-400 transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Thumbnail / Header Area */}
                        <div>
                          {art.imageUrl ? (
                            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                              <img 
                                src={art.imageUrl} 
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                              
                              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${badgeClass}`}>
                                {art.category}
                              </span>

                              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] text-white/90 font-medium">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-teal-300" />
                                  <span>{art.readTime || '3 phút đọc'}</span>
                                </span>
                                {art.publishedDate && (
                                  <span>{art.publishedDate}</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 pb-0 flex items-center justify-between">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                                {art.category}
                              </span>
                              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                                <IconComp className="w-5 h-5" />
                              </div>
                            </div>
                          )}

                          {/* Text Body */}
                          <div className="p-6 space-y-3">
                            <h3 
                              onClick={() => setSelectedArticleId(art.id)}
                              className="text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition leading-snug cursor-pointer line-clamp-2"
                            >
                              {art.title}
                            </h3>

                            <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                              {art.summary}
                            </p>

                            {/* Core tips preview */}
                            {art.tips && art.tips.length > 0 && (
                              <div className="pt-2 space-y-1.5 bg-teal-50/50 p-3 rounded-2xl border border-teal-100">
                                <span className="text-[10px] font-black uppercase text-teal-900 tracking-wider flex items-center space-x-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>Lời dặn cốt lõi:</span>
                                </span>
                                {art.tips.slice(0, 2).map((tip, idx) => (
                                  <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-teal-950 font-semibold leading-tight">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer with Read & Edit / Delete Actions */}
                        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-bold gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedArticleId(art.id)}
                            className="inline-flex items-center space-x-1.5 text-teal-700 hover:text-teal-900 py-1.5 px-2 rounded-xl hover:bg-teal-50 transition cursor-pointer"
                          >
                            <span>Đọc toàn văn</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Edit & Delete Action Buttons */}
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              title="Chỉnh sửa bài viết cẩm nang"
                              onClick={() => handleOpenEditArticleModal(art)}
                              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              title="Xóa bài viết cẩm nang"
                              onClick={() => handleDeleteArticle(art)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Emergency Protocols Banner */}
              <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>TRƯỜNG HỢP KHẨN CẤP HỌC ĐƯỜNG</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">CẦN HỖ TRỢ Y TẾ & SƠ CẤP CỨU GẤP?</h3>
                  <p className="text-xs sm:text-sm text-red-100">
                    Nếu phát hiện bạn học bị ngất xỉu, co giật, chấn thương nặng hoặc sốt cao tại trường, hãy liên hệ ngay số hotline phòng Y tế trường để được hỗ trợ kịp thời.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={`tel:${nurseCounselor.phone || config.hotline}`}
                    className="inline-flex items-center space-x-2 bg-white text-red-700 hover:bg-red-50 font-black px-6 py-3 rounded-2xl shadow-lg transition transform hover:scale-105"
                  >
                    <Phone className="w-5 h-5 animate-bounce" />
                    <span className="text-sm">GỌI {nurseCounselor.phone || config.hotline}</span>
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: HỎI ĐÁP SỨC KHỎE RIÊNG TƯ ================= */}
          {activeSubTab === 'qa' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Success Notification with Secret Code */}
              {submittedSecretCode && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-2xl shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-emerald-950">
                        GỬI CÂU HỎI TƯ VẤN SỨC KHỎE THÀNH CÔNG!
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-800">
                        Câu hỏi của em đã được gửi trực tiếp và <strong>BẢO MẬT TUYỆT ĐỐI</strong> tới Cô Nguyễn Thị Hiệp (Phòng Y tế Trường).
                      </p>
                    </div>
                  </div>

                  {/* Secret code card */}
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-500 font-bold block">MÃ TRA CỨU BẢO MẬT CỦA EM:</span>
                      <span className="text-2xl font-black text-emerald-700 tracking-wider font-mono">
                        {submittedSecretCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm">
                      * Hãy lưu lại mã bí mật này để tra cứu câu trả lời riêng tư từ Cô Hiệp ở ô bên dưới bất cứ lúc nào.
                    </p>
                  </div>
                </div>
              )}

              {/* 2 COLUMNS: LOOKUP PRIVATE ANSWER + COUNSELOR INFO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Column 1: Secret Lookup Box */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-teal-100 text-teal-800 rounded-2xl">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          TRA CỨU CÂU TRẢ LỜI SỨC KHỎE RIÊNG TƯ
                        </h3>
                        <p className="text-xs text-slate-500">
                          Nhập mã câu hỏi bí mật đã nhận khi gửi câu hỏi để xem phản hồi từ Cô Hiệp.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleLookup} className="flex gap-2">
                      <input
                        type="text"
                        value={searchSecretCode}
                        onChange={(e) => setSearchSecretCode(e.target.value)}
                        placeholder="Nhập mã bí mật (VD: CH-1024, CH-8892...)"
                        className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono uppercase font-bold"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <Search className="w-4 h-4" />
                        <span>Tra Cứu</span>
                      </button>
                    </form>

                    {/* Lookup Result Box */}
                    {lookupResult && (
                      <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs font-bold text-teal-900 border-b border-teal-200/60 pb-2">
                          <span>Mã câu hỏi: {lookupResult.code}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            lookupResult.status === 'answered' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {lookupResult.status === 'answered' ? 'Đã có phản hồi' : 'Đang chờ Cô Hiệp tư vấn'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">Câu hỏi của em:</span>
                          <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                            {lookupResult.question}
                          </p>
                        </div>

                        {lookupResult.answer ? (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex items-center space-x-1.5 text-xs font-black text-teal-950">
                              <Stethoscope className="w-4 h-4 text-teal-600" />
                              <span>Lời khuyên & Tư vấn từ {lookupResult.answeredBy || nurseCounselor.name}:</span>
                            </div>
                            <div className="p-3.5 bg-emerald-50 text-slate-900 text-xs sm:text-sm leading-relaxed rounded-xl border border-emerald-200 font-medium whitespace-pre-line">
                              {lookupResult.answer}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-700 italic pt-1">
                            * Cô Hiệp đang tiếp nhận và sẽ phản hồi sớm nhất. Em hãy quay lại kiểm tra sau nhé!
                          </p>
                        )}
                      </div>
                    )}

                    {lookupError && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                        Không tìm thấy câu hỏi với mã bí mật này. Vui lòng kiểm tra lại chính xác ký tự mã của em!
                      </div>
                    )}
                  </div>

                  {/* Public Q&A Examples (Anonymized) */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-4">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
                      <HelpCircle className="w-5 h-5 text-teal-600" />
                      <span>CÂU HỎI THƯỜNG GẶP ĐÃ ĐƯỢC GIẢI ĐÁP</span>
                    </h3>

                    {publicHealthQuestions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Hiện tại các câu hỏi đều được bảo mật riêng tư theo yêu cầu của học sinh.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {publicHealthQuestions.slice(0, 5).map((q) => (
                          <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                              <span>Học sinh {q.className} (Ẩn danh)</span>
                              <span className="text-teal-700">{q.topic}</span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800">{q.question}</p>
                            {q.answer && (
                              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                                <strong>Trả lời:</strong> {q.answer}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Health Counselor & Guidance */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gradient-to-br from-teal-800 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <HeartPulse className="w-6 h-6 text-teal-300" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black">PHÒNG Y TẾ TRƯỜNG THPT BA CHÚC</h4>
                        <p className="text-xs text-teal-200">Địa chỉ: Dãy phòng chức năng - Tầng trệt</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-teal-100 font-medium leading-relaxed">
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                        <span>Sơ cấp cứu kịp thời các chấn thương, sốt, ngất xỉu, tụt huyết áp.</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                        <span>Tư vấn chế độ dinh dưỡng, nâng cao thể lực mùa thi tốt nghiệp.</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                        <span>Tư vấn sức khỏe sinh sản, tâm sinh lý tuổi dậy thì bảo mật 100%.</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/20 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="w-full py-3 bg-white text-teal-900 hover:bg-teal-50 rounded-2xl font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Gửi Câu Hỏi Riêng Tư Cho Cô Hiệp</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL 1: GỬI CÂU HỎI SỨC KHỎE RIÊNG TƯ ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    GỬI CÂU HỎI TƯ VẤN SỨC KHỎE
                  </h3>
                  <span className="text-[11px] text-teal-700 font-bold">
                    Gửi tới {nurseCounselor.name} (Phòng Y tế)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Alert */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                <strong>Bảo mật thông tin:</strong> Câu hỏi của em sẽ được <strong>Ẩn hoàn toàn</strong>. Chỉ có Cô Hiệp và Quản trị viên mới thấy được nội dung để phản hồi riêng tư.
              </span>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              {/* Anonymity switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  {isAnonymous ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                  <span className="text-xs font-bold text-slate-800">
                    {isAnonymous ? 'Chế độ Ẩn danh (Khuyên dùng)' : 'Hiện tên học sinh'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên của em:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp:
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <optgroup label="Khối 10">
                      <option value="10A1">10A1</option>
                      <option value="10A2">10A2</option>
                      <option value="10A3">10A3</option>
                      <option value="10A4">10A4</option>
                      <option value="10A5">10A5</option>
                      <option value="10C1">10C1</option>
                      <option value="10C2">10C2</option>
                      <option value="10C3">10C3</option>
                    </optgroup>
                    <optgroup label="Khối 11">
                      <option value="11A1">11A1</option>
                      <option value="11A2">11A2</option>
                      <option value="11A3">11A3</option>
                      <option value="11A4">11A4</option>
                      <option value="11A5">11A5</option>
                      <option value="11C1">11C1</option>
                      <option value="11C2">11C2</option>
                    </optgroup>
                    <optgroup label="Khối 12">
                      <option value="12A1">12A1</option>
                      <option value="12A2">12A2</option>
                      <option value="12A3">12A3</option>
                      <option value="12A4">12A4</option>
                      <option value="12A5">12A5</option>
                      <option value="12C1">12C1</option>
                      <option value="12C2">12C2</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chủ đề sức khỏe:
                  </label>
                  <select
                    value={healthCategory}
                    onChange={(e) => setHealthCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="Dinh dưỡng & Thể lực">Dinh dưỡng & Thể lực</option>
                    <option value="Thị lực & Cột sống">Thị lực & Cột sống</option>
                    <option value="Sức khỏe sinh sản & Dậy thì">Sức khỏe sinh sản & Dậy thì</option>
                    <option value="Sơ cấp cứu & Chấn thương">Sơ cấp cứu & Chấn thương</option>
                    <option value="Giấc ngủ & Căng thẳng thể chất">Giấc ngủ & Căng thẳng</option>
                    <option value="Vấn đề sức khỏe khác">Vấn đề sức khỏe khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung triệu chứng / Vấn đề cần tư vấn <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Mô tả cụ thể triệu chứng, băn khoăn sức khỏe hoặc thói quen ăn ngủ của em để Cô Hiệp tư vấn chính xác nhất..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Attach Image (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ảnh đính kèm mô tả triệu chứng (Không bắt buộc):
                </label>
                {attachedImage ? (
                  <div className="relative inline-block mt-1">
                    <img 
                      src={attachedImage} 
                      alt="Đính kèm" 
                      className="w-24 h-24 object-cover rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachedImage('')}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center space-x-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition text-xs text-slate-600">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <span>{isUploading ? 'Đang nén ảnh...' : 'Tải ảnh lên'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Câu Hỏi Riêng Tư'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: ĐĂNG / CHỈNH SỬA BÀI VIẾT CẨM NANG Y TẾ ================= */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-2xl">
                  {editingArticleId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900">
                    {editingArticleId ? 'CẬP NHẬT CHỈNH SỬA BÀI CẨM NANG Y TẾ' : 'ĐĂNG BÀI CẨM NANG & TUYÊN TRUYỀN Y TẾ MỚI'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nội dung sẽ được hiển thị trực tiếp trên chuyên mục Cẩm nang Y tế của Trường THPT Ba Chúc
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề bài viết cẩm nang <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="VD: Phòng Chống Say Nắng & Sốc Nhiệt Mùa Hè..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-900"
                />
              </div>

              {/* Category, Read Time, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chuyên mục <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời gian đọc:
                  </label>
                  <input
                    type="text"
                    value={artReadTime}
                    onChange={(e) => setArtReadTime(e.target.value)}
                    placeholder="VD: 3 phút đọc"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Người biên soạn:
                  </label>
                  <input
                    type="text"
                    value={artAuthor}
                    onChange={(e) => setArtAuthor(e.target.value)}
                    placeholder="VD: Cô Nguyễn Thị Hiệp..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tóm tắt ngắn (1-2 câu hiển thị ở thẻ bài viết):
                </label>
                <textarea
                  rows={2}
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  placeholder="Mô tả súc tích nội dung chính của bài viết để người đọc nắm bắt nhanh..."
                  className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Full Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nội dung bài viết chi tiết <span className="text-red-500">*</span>:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    (Hỗ trợ các đề mục <code>### 1. Tiêu đề</code>, gạch đầu dòng <code>- Ý chính</code>)
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Nhập toàn văn bài viết cẩm nang..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
                />
              </div>

              {/* Core Tips (Dynamic List) */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Các lời dặn cốt lõi / Điểm then chốt từ Cán bộ Y tế:</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTipField}
                    className="inline-flex items-center space-x-1 text-xs text-teal-700 font-bold hover:text-teal-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm lời dặn</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {artTips.map((tip, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-teal-700 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => handleUpdateTipField(idx, e.target.value)}
                        placeholder={`Lời dặn ${idx + 1} (VD: Uống đủ 2 lít nước ấm mỗi ngày...)`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTipField(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ảnh minh họa bài viết:
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition shrink-0">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <span>{isCompressingArtImg ? 'Đang nén ảnh...' : 'Tải ảnh từ máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArticleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={artImageUrl}
                    onChange={(e) => setArtImageUrl(e.target.value)}
                    placeholder="Hoặc dán liên kết URL ảnh minh họa..."
                    className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {artImageUrl && (
                  <div className="relative inline-block mt-2">
                    <img
                      src={artImageUrl}
                      alt="Xem trước ảnh"
                      className="w-40 h-24 object-cover rounded-xl border border-slate-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setArtImageUrl('')}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={artSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-800 hover:to-cyan-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{artSubmitting ? 'Đang lưu...' : (editingArticleId ? 'Lưu Thay Đổi Bài Viết' : 'Đăng Bài Lên Cẩm Nang')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 3: XEM CHI TIẾT BÀI VIẾT CẨM NANG Y TẾ ================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100 flex flex-col">
            
            {/* Top Banner Image if available */}
            {selectedArticle.imageUrl && (
              <div className="relative h-60 w-full overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedArticleId(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-xs transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-4 left-6 right-6 space-y-1.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-xs ${getBadgeColor(selectedArticle.category)}`}>
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 flex-1">
              
              {/* Header Info when no image */}
              {!selectedArticle.imageUrl && (
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1.5 pr-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor(selectedArticle.category)}`}>
                      {selectedArticle.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {selectedArticle.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedArticleId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Meta information bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium py-2.5 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span><strong>Biên soạn:</strong> {selectedArticle.author || `${nurseCounselor.name} (Phòng Y tế)`}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedArticle.readTime || '3 phút đọc'}</span>
                  </span>
                  {selectedArticle.publishedDate && (
                    <span>• {selectedArticle.publishedDate}</span>
                  )}
                </div>
              </div>

              {/* Summary quote */}
              {selectedArticle.summary && (
                <div className="p-4 bg-teal-50/60 border-l-4 border-teal-600 rounded-r-2xl text-xs sm:text-sm text-teal-950 font-medium italic leading-relaxed">
                  "{selectedArticle.summary}"
                </div>
              )}

              {/* Content Body */}
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-4 font-medium">
                {selectedArticle.content.split('\n\n').map((para, idx) => {
                  const trimmed = para.trim();
                  if (trimmed.startsWith('###')) {
                    return (
                      <h4 key={idx} className="text-base sm:text-lg font-black text-teal-900 mt-6 mb-2 border-b border-teal-100 pb-1">
                        {trimmed.replace('###', '').trim()}
                      </h4>
                    );
                  }

                  // Render markdown table if detected
                  if (trimmed.includes('|') && trimmed.includes('\n|')) {
                    const lines = trimmed.split('\n').filter(l => l.trim().startsWith('|'));
                    if (lines.length >= 2) {
                      const nonSeparator = lines.filter(l => !l.includes('---'));
                      if (nonSeparator.length >= 1) {
                        const headerCells = nonSeparator[0].split('|').map(c => c.trim()).filter(Boolean);
                        const bodyRows = nonSeparator.slice(1).map(r => r.split('|').map(c => c.trim()).filter(Boolean));
                        return (
                          <div key={idx} className="overflow-x-auto my-3 rounded-2xl border border-teal-200/80 shadow-xs">
                            <table className="w-full text-xs sm:text-sm text-left border-collapse">
                              <thead className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white uppercase text-[11px] tracking-wider">
                                <tr>
                                  {headerCells.map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 font-bold border-b border-teal-800">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-teal-100 bg-white">
                                {bodyRows.map((cols, rIdx) => (
                                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-teal-50/30' : 'bg-white hover:bg-teal-50/50 transition-colors'}>
                                    {cols.map((col, cIdx) => (
                                      <td key={cIdx} className={`px-4 py-2.5 text-slate-800 ${cIdx === 0 ? 'font-bold text-teal-950' : 'font-medium'}`}>
                                        {renderFormattedText(col)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                    }
                  }

                  return (
                    <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                      {renderFormattedText(trimmed)}
                    </p>
                  );
                })}
              </div>

              {/* Key Tips Box */}
              {selectedArticle.tips && selectedArticle.tips.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl border border-teal-200 shadow-xs space-y-3">
                  <h5 className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Lời Dặn Cốt Lõi Từ Cán Bộ Y Tế Cô Hiệp:</span>
                  </h5>
                  <div className="space-y-2">
                    {selectedArticle.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm font-bold text-teal-950">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions footer inside view */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${selectedArticle.title}\n\n${selectedArticle.summary}\n\n${selectedArticle.content}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Đã sao chép nội dung!' : 'Sao chép bài viết'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In cẩm nang</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const art = selectedArticle;
                      setSelectedArticleId(null);
                      handleOpenEditArticleModal(art);
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-xl font-bold text-xs transition cursor-pointer border border-teal-200"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa bài này</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedArticleId(null)}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
