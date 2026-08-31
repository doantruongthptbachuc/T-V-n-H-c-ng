import { 
  Question, 
  Story, 
  YouthRegistration, 
  Activity, 
  QAInfographic, 
  SchoolConfig,
  AIPromptQuestion,
  AIChatLog,
  Counselor,
  VolunteerMember,
  VolunteerAttendance
} from '../types';
import { sampleQuestionsData } from './questionsData';
import { sampleStoriesData } from './storiesData';
import { sampleActivitiesData } from './activitiesData';
import { volunteers2025_2026 } from './volunteers2025_2026';
import { attendance2025_2026 } from './attendance2025_2026';

import schoolLogoImg from '../assets/images/thpt_ba_chuc_logo.webp';

export const sampleHeroBannerImages = [
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80',
];

export const initialConfig: SchoolConfig = {
  schoolName: 'TRƯỜNG THPT BA CHÚC',
  schoolSubName: 'ĐOÀN THANH NIÊN - TỔ TƯ VẤN HỌC ĐƯỜNG',
  slogan: 'Lắng nghe – Thấu hiểu – Đồng hành – Phát triển',
  schoolLogo: schoolLogoImg,
  heroBannerImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80',
  heroBannerImages: sampleHeroBannerImages,
  hotline: '0789 620 212',
  email: 'tuvanhocduong.thptbachuc@edu.vn',
  facebookUrl: 'https://facebook.com/tuvanhocduong.thptbachuc',
  address: 'Ấp An Bình, Xã Ba Chúc, Tỉnh An Giang',
  consultingRoom: 'Phòng Đoàn Trường THPT Ba Chúc - An Bình - Ba Chúc - An Giang',
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbz_SAMPLE_APP_SCRIPT_URL/exec',
  adminUsername: 'tuvanhocduongthptbachuc2025',
  adminPassword: 'Bachuc@2025',
  workingHours: 'Thứ 2 - Thứ 7 (7h30 - 17h00) | Trực tuyến 24/7',
  aiProvider: 'hybrid',
};

export const sampleSchoolLogos = [
  schoolLogoImg,
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80',
];

export const sampleCounselorAvatars = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
];

export const initialQuestions: Question[] = sampleQuestionsData;

export const initialStories: Story[] = sampleStoriesData;

export const initialActivities: Activity[] = sampleActivitiesData;

export const initialYouthRegistrations: YouthRegistration[] = [
  {
    id: 'reg-1',
    code: 'DOAN-301',
    fullName: 'Trần Đăng Khoa',
    birthDate: '2007-03-14',
    className: '12A1',
    academicYear: '2024 - 2025',
    phone: '0912 345 678',
    email: 'khoatran.thpt@gmail.com',
    activities: ['Công tác Đoàn', 'Truyền thông', 'Tình nguyện'],
    skills: 'Quản trị Fanpage, chụp ảnh máy cơ, quay dựng video ngắn TikTok/CapCut.',
    desires: 'Em mong muốn được tham gia Ban Truyền thông của Đoàn trường để ghi lại những khoảnh khắc đẹp của các hoạt động ngoại khóa.',
    createdAt: '2025-09-15T09:20:00Z',
    status: 'approved',
    isLeader: true,
    leaderRole: 'Phó Ban Truyền thông & Báo chí Đoàn trường',
    assignedClub: 'CLB Truyền thông & Báo chí Trẻ',
    notes: 'Gương mặt năng nổ, được BCH Đoàn trường trao cờ thủ lĩnh truyền thông.',
  },
  {
    id: 'reg-2',
    code: 'DOAN-302',
    fullName: 'Huỳnh Thảo Nguyên',
    birthDate: '2007-11-22',
    className: '12A6',
    academicYear: '2025 - 2026',
    phone: '0978 112 233',
    email: 'thaonguyen.english@gmail.com',
    activities: ['Hoa Phượng Đỏ', 'Văn nghệ', 'Câu lạc bộ'],
    skills: 'Hát, chơi đàn Ukulele & Guitar cơ bản, tiếng Anh giao tiếp lưu loát (IELTS 7.0).',
    desires: 'Muốn góp sức vào Đội văn nghệ xung kích và tham gia chiến dịch tình nguyện Hoa Phượng Đỏ.',
    createdAt: '2025-10-20T08:15:00Z',
    status: 'pending',
    notes: 'Hồ sơ nổi bật về năng khiếu ngoại ngữ và âm nhạc.',
  },
  {
    id: 'reg-3',
    code: 'DOAN-303',
    fullName: 'Phạm Thị Cẩm Tú',
    birthDate: '2007-07-28',
    className: '12A4',
    academicYear: '2024 - 2025',
    phone: '0938 776 554',
    email: 'tuphamcam.11a1@gmail.com',
    activities: ['Công tác Đoàn', 'Tình nguyện', 'Văn nghệ'],
    skills: 'Dẫn chương trình MC, quản trò teambuilding, hoạt náo viên.',
    desires: 'Tổ chức các hoạt động vì cộng đồng và sinh hoạt chi đoàn.',
    createdAt: '2025-11-12T10:00:00Z',
    status: 'approved',
    isLeader: true,
    leaderRole: 'Bí thư Chi đoàn 12A4 - Đội trưởng Tình nguyện',
    assignedClub: 'Đội Tình Nguyện Thanh Niên',
    notes: 'Thủ lĩnh phong trào xuất sắc cấp trường.',
  },
  {
    id: 'reg-4',
    code: 'DOAN-304',
    fullName: 'Bùi Văn Minh',
    birthDate: '2007-03-12',
    className: '12A3',
    academicYear: '2024 - 2025',
    phone: '0981 223 445',
    email: 'vanminh10c2@gmail.com',
    activities: ['Tình nguyện', 'Thể thao'],
    skills: 'Hậu cần, thể thao bóng đá, năng động, nhiệt huyết.',
    desires: 'Tham gia các buổi tình nguyện ngày Chủ nhật Xanh.',
    createdAt: '2026-01-15T14:30:00Z',
    status: 'approved',
    assignedClub: 'Đội Thanh Niên Xung Kích',
    notes: 'Thành viên nòng cốt đội hậu cần.',
  }
];

export const initialVolunteerMembers: VolunteerMember[] = volunteers2025_2026;

export const initialVolunteerAttendance: VolunteerAttendance[] = attendance2025_2026;

export const initialInfographics: QAInfographic[] = [
  {
    id: 'info-1',
    title: 'Infographic: 5 Bước Vượt Qua Cơn Căng Thẳng & Áp Lực Học Tập',
    category: 'Tâm lý học đường',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    description: 'Hướng dẫn trực quan cách nhận diện cảm xúc tiêu cực, điều hòa nhịp thở 4-7-8 và tái lập cân bằng khi mùa thi đến gần.',
    uploadDate: '12/08/2026',
    author: 'Tổ Tư vấn Tâm lý THPT Ba Chúc',
    articleUrl: 'https://thptbachuc.angiang.edu.vn/tu-van-hoc-duong/5-buoc-giai-toa-ap-luc-thi-cu',
    content: `Khi đối mặt với áp lực thi cử và điểm số, hệ thần kinh của học sinh thường rơi vào trạng thái căng thẳng mạn tính. Infographic này tổng hợp phương pháp khoa học 5 bước giúp các em điều hòa nhịp tim, giải phóng hoocmon cortisol và khôi phục sự tập trung cao độ.

Cách đọc hiểu sơ đồ:
- Phần 1 (Màu đỏ cam): Các tín hiệu báo động cơ thể (mất ngủ, đau nửa đầu, lo lắng bồn chồn).
- Phần 2 (Màu xanh dương): Bài tập thở 4-7-8 giúp kích hoạt hệ thần kinh phó giao cảm trong vòng 2 phút.
- Phần 3 (Màu xanh lá): Lộ trình 5 bước hành động thực tế từ tự điều chỉnh đến tìm kiếm hỗ trợ.`,
    actionSteps: [
      'Bước 1 (Nhận diện cảm xúc): Khi cảm thấy tim đập nhanh hoặc lo âu, dừng lại 60 giây và thừa nhận "Tôi đang bị căng thẳng, đây là phản ứng tự nhiên của cơ thể".',
      'Bước 2 (Bài tập thở 4-7-8): Hít vào bằng mũi trong 4 giây, giữ hơi thở 7 giây, thở chậm ra bằng miệng trong 8 giây (lặp lại 4 chu kỳ liên tục).',
      'Bước 3 (Thải độc thị giác & Vận động nhẹ): Tạm rời màn hình điện thoại/máy tính, nhìn vào khoảng xanh thiên nhiên hoặc đi bộ thư giãn 5-10 phút.',
      'Bước 4 (Phân tách mục tiêu nhỏ): Viết ra 3 việc quan trọng nhất cần giải quyết ngay hôm nay thay vì ôm đồm toàn bộ cuốn sách.',
      'Bước 5 (Tìm kiếm sự đồng hành): Tâm sự ngay với Thầy Cô Tổ Tư vấn Học đường hoặc đặt câu hỏi ẩn danh trên ứng dụng này nếu lo âu kéo dài quá 3 ngày.'
    ],
    keyTakeaways: [
      'Không học dồn ép quá 50 phút liên tục mà không có quãng nghỉ 5-10 phút (Pomodoro).',
      'Uống đủ 1.5 - 2 lít nước ấm mỗi ngày để não bộ duy trì trạng thái tỉnh táo.',
      'Tuyệt đối không lạm dụng trà đặc hoặc cà phê đậm đặc vào ban đêm trước ngày thi.'
    ]
  },
  {
    id: 'info-2',
    title: 'Cẩm nang Hướng nghiệp: Khám phá Thế mạnh bản thân theo mô hình Holland',
    category: 'Hướng nghiệp & Chọn ngành',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    description: 'Bản đồ 6 nhóm tính cách nghề nghiệp (Kỹ thuật, Nghiên cứu, Nghệ thuật, Xã hội, Quản lý, Nghiệp vụ) dành cho học sinh THPT.',
    uploadDate: '08/08/2026',
    author: 'Tổ Cố vấn Hướng nghiệp THPT Ba Chúc',
    articleUrl: 'https://thptbachuc.angiang.edu.vn/huong-nghiep/trac-nghiem-nghe-nghiep-holland',
    content: `Mô hình Holland (RIASEC) là công cụ trắc nghiệm tính cách nghề nghiệp chuẩn quốc tế được áp dụng rộng rãi cho học sinh THPT. Sơ đồ phân chia thế giới nghề nghiệp thành 6 nhóm:
- R (Realistic - Kỹ thuật): Thích làm việc với máy móc, công cụ, hoạt động thể chất.
- I (Investigative - Nghiên cứu): Thích suy nghĩ, phân tích, khám phá chân lý khoa học.
- A (Artistic - Nghệ thuật): Yêu thích sáng tạo, thẩm mỹ, tự do biểu đạt.
- S (Social - Xã hội): Thích giúp đỡ, giảng dạy, kết nối và chăm sóc người khác.
- E (Enterprising - Quản lý): Thích lãnh đạo, thuyết phục, kinh doanh và ra quyết định.
- C (Conventional - Nghiệp vụ): Thích sự ngăn nắp, xử lý dữ liệu, quy trình chi tiết và chính xác.`,
    actionSteps: [
      'Bước 1 (Làm bài trắc nghiệm Holland): Thực hiện bảng câu hỏi trắc nghiệm RIASEC gồm 60 câu để tìm ra mã 3 chữ cái đặc trưng nhất của bạn.',
      'Bước 2 (Xác định nhóm nổi trội): Đánh dấu 2-3 nhóm tính cách đạt điểm số cao nhất của bản thân để làm trục định hướng chính.',
      'Bước 3 (Đối chiếu ngành nghề đào tạo): Tra cứu danh mục các ngành học Đại học/Cao đẳng tương ứng với nhóm tính cách và tổ hợp xét tuyển môn học.',
      'Bước 4 (Tham vấn chuyên gia): Đặt lịch hẹn hoặc gửi câu hỏi cho Thầy Cô Tổ Cố vấn Hướng nghiệp THPT Ba Chúc để được định hướng chọn trường sát với năng lực học tập.',
      'Bước 5 (Trải nghiệm thực tế): Tích cực tham gia các hoạt động Đoàn, câu lạc bộ học thuật và các chiến dịch tình nguyện để rèn luyện kỹ năng mềm.'
    ],
    keyTakeaways: [
      'Chọn nghề là sự giao thoa giữa: Sở thích (Điều mình thích) + Sở trường (Điều mình giỏi) + Nhu cầu thị trường (Xã hội cần).',
      'Tránh chọn ngành chỉ vì theo phong trào số đông bạn bè hoặc áp đặt một chiều.'
    ]
  },
  {
    id: 'info-3',
    title: 'Sổ tay Phòng chống Bạo lực Học đường & Kỹ năng Tự vệ An toàn',
    category: 'Kỹ năng sống & Pháp luật',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    description: 'Quy trình 5 bước xử lý an toàn khi chứng kiến hoặc đối mặt với bạo lực, bắt nạt trên không gian mạng và tại trường học.',
    uploadDate: '02/08/2026',
    author: 'Đoàn Thanh Niên & Công An Địa Phương',
    articleUrl: 'https://thptbachuc.angiang.edu.vn/doan-thanh-nien/phong-chong-bao-luc-hoc-duong',
    content: `Bạo lực học đường không chỉ là va chạm thể chất mà còn bao gồm bạo lực tinh thần, cô lập bạn bè và bắt nạt trên mạng xã hội (Cyberbullying). Infographic hướng dẫn quy trình phản ứng chuẩn mực giúp học sinh tự bảo vệ bản thân và bảo vệ bạn bè xung quanh một cách văn minh, an toàn.

Quy định an toàn học đường:
- Nhà trường cam kết bảo mật 100% danh tính học sinh thông báo vi phạm.
- Mọi mâu thuẫn đều được Thầy Cô lắng nghe và xử lý trên tinh thần giáo dục, công bằng và tôn trọng.`,
    actionSteps: [
      'Bước 1 (Giữ bình tĩnh & Không leo thang): Giữ thái độ kiềm chế, không sử dụng lời lẽ khiêu khích hay hành vi bạo lực trả đũa đối phương.',
      'Bước 2 (Rút lui an toàn): Nhanh chóng di chuyển đến khu vực có camera, đông người hoặc văn phòng Đoàn trường / phòng Giáo viên / phòng Giám thị.',
      'Bước 3 (Lưu giữ bằng chứng): Chụp ảnh màn hình, lưu tin nhắn hoặc video bắt nạt trên không gian mạng (tuyệt đối không phát tán công khai thêm).',
      'Bước 4 (Báo cáo khẩn cấp): Bấm nút "Đặt câu hỏi ẩn danh" trên Ứng dụng này hoặc gọi số Hotline trực ban của trường: 0296.3876.543.',
      'Bước 5 (Không làm người ngoài cuộc vô cảm): Khi thấy bạn bè bị bắt nạt, tuyệt đối không hò reo quay phim mà hãy nhanh chóng báo ngay cho Thầy Cô trực tuần.'
    ],
    keyTakeaways: [
      'Lên tiếng bảo vệ bản thân và bạn bè là biểu hiện của lòng dũng cảm và trách nhiệm.',
      'Phòng Tư vấn Học đường luôn là điểm tựa an toàn, sẵn sàng đồng hành cùng bạn 24/7.'
    ]
  },
  {
    id: 'info-4',
    title: 'Sơ đồ Phương pháp Học tập Chủ động (Active Recall & Spaced Repetition)',
    category: 'Phương pháp học tập',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    description: 'Bí kíp ghi nhớ sâu kiến thức các môn Tự nhiên & Xã hội bằng kỹ thuật lặp lại ngắt quãng và tự kiểm tra không cần học vẹt.',
    uploadDate: '15/08/2026',
    author: 'Tổ Chuyên môn & Tư vấn Học tập',
    articleUrl: 'https://thptbachuc.angiang.edu.vn/phuong-phap-hoc-tap/active-recall-spaced-repetition',
    content: `Thay vì đọc đi đọc lại thụ động sách giáo khoa, phương pháp Active Recall (Truy hồi chủ động) buộc não bộ phải vận động để truy xuất kiến thức, kết hợp Spaced Repetition (Lặp lại ngắt quãng theo đường cong lãng quên Ebbinghaus) giúp chuyển hóa kiến thức từ trí nhớ ngắn hạn sang trí nhớ dài hạn.`,
    actionSteps: [
      'Bước 1 (Gấp sách và tự nhớ lại): Sau khi đọc xong một bài học, gấp sách lại và viết ra giấy nháp toàn bộ ý chính bạn nhớ được.',
      'Bước 2 (Kiểm tra đối chiếu & Lập Sổ tay lỗi sai): Mở sách so sánh, đánh dấu những phần bị quên hoặc nhầm lẫn vào Sổ tay Mistake Log.',
      'Bước 3 (Kỹ thuật giải thích Feynman): Thử giảng lại kiến thức đó bằng ngôn ngữ đơn giản nhất cho một người bạn hoặc tự nói trước gương.',
      'Bước 4 (Chu kỳ lặp lại ngắt quãng): Ôn lại bài sau 1 ngày, sau 3 ngày, sau 7 ngày và sau 30 ngày để khắc sâu vĩnh viễn vào trí nhớ.'
    ],
    keyTakeaways: [
      'Hiệu quả ghi nhớ tăng gấp 3 lần so với việc đọc thụ động hoặc tô màu highlight đơn thuần.',
      'Giải đề thi thử và làm flashcard là 2 hình thức Active Recall tốt nhất cho học sinh THPT.'
    ]
  }
];

export const initialAIPromptQuestions: AIPromptQuestion[] = [
  {
    id: 'p-1',
    promptText: 'Em học nhiều nhưng điểm vẫn thấp, em nên làm gì?',
    answer: 'Học nhiều nhưng chưa hiệu quả thường do phương pháp học thụ động (chỉ đọc lại sách thay vì chủ động kiểm tra kiến thức). Thầy Cô khuyên em: 1. Áp dụng phương pháp Active Recall (tự giải đề và truy hồi kiến thức); 2. Lập Sổ tay lỗi sai (Mistake Log) ghi lại câu sai để ôn lại; 3. Chia nhỏ thời gian học 25 phút (Pomodoro); 4. Mạnh dạn hỏi Thầy Cô bộ môn ngay phần chưa hiểu.',
    category: 'Học tập',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 1,
  },
  {
    id: 'p-2',
    promptText: 'Có nên yêu khi còn học THPT và làm sao để không ảnh hưởng việc học?',
    answer: 'Tình cảm tuổi học trò là những rung động trong sáng tự nhiên. Tuy nhiên, để không ảnh hưởng đến tương lai, hai bạn cần: 1. Đặt mục tiêu học tập lên hàng đầu và cùng nhau tiến bộ; 2. Đặt ra ranh giới và chuẩn mực ứng xử văn minh trong môi trường học đường; 3. Không để cảm xúc chi phối thời gian học tập; 4. Luôn tâm sự với Thầy Cô tư vấn hoặc gia đình khi gặp băn khoăn.',
    category: 'Tâm lý',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 2,
  },
  {
    id: 'p-3',
    promptText: 'Làm thế nào để biết ngành nghề nào phù hợp với bản thân?',
    answer: 'Để chọn đúng ngành nghề, em nên áp dụng mô hình 3 vòng tròn: 1. Sở thích & Đam mê cá nhân; 2. Năng lực & Thế mạnh thực tế; 3. Nhu cầu xã hội và cơ hội việc làm. Em có thể làm bài trắc nghiệm tính cách nghề nghiệp Holland (RIASEC) hoặc đến Phòng Tư vấn Học đường trường THPT Ba Chúc để được Thầy Cô hướng dẫn trực tiếp.',
    category: 'Hướng nghiệp',
    timePeriod: 'Mùa tuyển sinh & hướng nghiệp',
    isActive: true,
    order: 3,
  },
  {
    id: 'p-4',
    promptText: 'Nên chọn ngành theo sở thích hay theo cơ hội việc làm?',
    answer: 'Cả hai yếu tố đều quan trọng. Nếu chỉ chọn theo sở thích mà không có năng lực và nhu cầu xã hội thì khó phát triển sự nghiệp; ngược lại nếu chọn chỉ vì trào lưu mà không có hứng thú thì dễ chán nản, bỏ cuộc. Hướng đi tốt nhất là tìm giao điểm giữa ngành em có năng khiếu, yêu thích và xã hội đang có nhu cầu tuyển dụng trong 3-5 năm tới.',
    category: 'Hướng nghiệp',
    timePeriod: 'Mùa tuyển sinh & hướng nghiệp',
    isActive: true,
    order: 4,
  },
  {
    id: 'p-5',
    promptText: 'Làm thế nào để lập kế hoạch ôn thi tốt nghiệp THPT hiệu quả?',
    answer: 'Kế hoạch ôn thi TN THPT hiệu quả gồm: 1. Nắm vững kiến thức trọng tâm SGK lớp 12; 2. Lập thời gian biểu phân bổ đều các môn thi theo tổ hợp xét tuyển; 3. Luyện đề thi thử theo đúng thời gian thực tế để rèn tâm lý phòng thi; 4. Giữ gìn sức khỏe, ngủ đủ 7-8 tiếng mỗi ngày để não bộ duy trì phong độ tốt nhất.',
    category: 'Học tập',
    timePeriod: 'Mùa thi học kỳ & TN THPT',
    isActive: true,
    order: 5,
  },
  {
    id: 'p-6',
    promptText: 'Làm thế nào để sử dụng AI và mạng xã hội an toàn, hiệu quả cho việc học?',
    answer: 'AI và MXH là công cụ tuyệt vời nếu em biết tận dụng đúng cách: 1. Dùng AI làm trợ lý giải thích khái niệm khó hoặc kiểm tra ngữ pháp/tổng hợp ý tưởng, không sao chép nguyên văn; 2. Giới hạn thời gian lướt mạng xã hội dưới 1 tiếng/ngày; 3. Tuyệt đối không chia sẻ thông tin cá nhân nhạy cảm, mật khẩu trên không gian mạng.',
    category: 'Kỹ năng sống',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 6,
  },
  {
    id: 'p-7',
    promptText: 'Làm thế nào để trở nên tự tin và giao tiếp tốt hơn?',
    answer: 'Để tự tin hơn trong giao tiếp: 1. Tích cực tham gia các phong trào, chiến dịch tình nguyện của Đoàn trường THPT Ba Chúc; 2. Luyện tập phát biểu ý kiến xây dựng bài trên lớp; 3. Học cách lắng nghe chân thành và mỉm cười thân thiện; 4. Đừng sợ mắc lỗi vì mỗi lần trải nghiệm là một cơ hội để trưởng thành.',
    category: 'Kỹ năng sống',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 7,
  },
  {
    id: 'p-8',
    promptText: 'Làm sao để xây dựng tính kỷ luật và quản lý thời gian hiệu quả?',
    answer: 'Xây dựng tính kỷ luật bằng các bước: 1. Quy tắc 2 phút: Việc nào làm dưới 2 phút thì làm ngay; 2. Lập danh sách 3 việc quan trọng nhất cần hoàn thành trong ngày (Top 3 Priority); 3. Tránh xa điện thoại khi bắt đầu giờ tự học; 4. Tự thưởng cho bản thân sau khi hoàn thành mục tiêu học tập.',
    category: 'Kỹ năng sống',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 8,
  },
  {
    id: 'p-9',
    promptText: 'Em đang bị bạo lực hoặc đe dọa, em có thể tìm sự giúp đỡ ở đâu?',
    answer: 'Em tuyệt đối không được chịu đựng một mình! Hãy liên hệ ngay với: 1. Thầy Bí thư Đoàn Trần Văn Được hoặc Thầy PBT Lê Hoàng Giang tại Phòng Đoàn Trường; 2. Gọi Hotline Tư vấn Trường: 0789 620 212; 3. Tổng đài Quốc gia Bảo vệ Trẻ em: 111 (miễn phí cước). Nhà trường luôn bảo mật danh tính và có quy trình bảo vệ an toàn 100% cho em.',
    category: 'Tâm lý',
    timePeriod: 'Hỗ trợ khẩn cấp',
    isActive: true,
    order: 9,
  },
  {
    id: 'p-10',
    promptText: 'Làm sao để tập trung ôn thi tốt nghiệp THPT và giảm bớt căng thẳng?',
    answer: 'Để giảm stress mùa thi: 1. Áp dụng kỹ thuật hít thở sâu 4-7-8 (Hít vào 4 giây, nín thở 7 giây, thở ra từ từ 8 giây); 2. Tập thể dục nhẹ hoặc đi dạo 15 phút mỗi ngày; 3. Uống đủ nước và ăn uống đủ chất dinh dưỡng; 4. Không học dồn vào ban đêm sát ngày thi.',
    category: 'Học tập',
    timePeriod: 'Mùa thi học kỳ & TN THPT',
    isActive: true,
    order: 10,
  }
];

export const initialAIChatLogs: AIChatLog[] = [
  {
    id: 'log-1',
    userQuestion: 'Làm sao để lập thời gian biểu ôn thi môn Toán và Tiếng Anh hiệu quả?',
    aiResponse: 'Phương pháp phân bổ thời gian hợp lý gồm kỹ thuật Pomodoro (25 phút học/5 phút nghỉ), làm đề mẫu vào khung giờ thi thực tế và ghi chú sổ tay lỗi sai (Mistake Book).',
    topicCategory: 'Học tập',
    timestamp: '2026-08-19 08:30:15',
    isEmergency: false,
    userFeedback: 'helpful',
  },
  {
    id: 'log-2',
    userQuestion: 'Em muốn đăng ký tham gia CLB Truyền thông và Tình nguyện của Đoàn trường thì gặp ai?',
    aiResponse: 'Em có thể liên hệ trực tiếp Thầy Trần Văn Được (BT Đoàn) hoặc Thầy Lê Hoàng Giang (PBT Đoàn) tại Phòng Đoàn trường THPT Ba Chúc (ấp An Bình, Ba Chúc) hoặc điền form Đăng ký tham gia Đoàn trên website.',
    topicCategory: 'Hoạt động Đoàn',
    timestamp: '2026-08-19 09:12:40',
    isEmergency: false,
    userFeedback: 'helpful',
  },
  {
    id: 'log-3',
    userQuestion: 'Em cảm thấy rất hồi hộp và tim đập nhanh mỗi khi bước vào phòng thi.',
    aiResponse: 'Thực hiện kỹ thuật thở 4-7-8 để ổn định nhịp tim: Hít vào sâu bằng mũi trong 4 giây, nín thở 7 giây và thở ra nhẹ nhàng bằng miệng trong 8 giây.',
    topicCategory: 'Tâm lý',
    timestamp: '2026-08-19 10:05:22',
    isEmergency: false,
    userFeedback: 'helpful',
  }
];

export const initialCounselors: Counselor[] = [
  {
    id: 'c-1',
    name: 'Thầy Trần Văn Được',
    role: 'BT Đoàn (Bí thư Đoàn Trường)',
    specialty: 'Phụ trách chung công tác Đoàn, phong trào Thanh niên, Kỹ năng sống & Hoạt động Tình nguyện',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    phone: '0789 620 212',
    email: 'tranvanduuoc@thptbachuc.edu.vn',
    bio: 'Bí thư Đoàn trường với hơn 10 năm kinh nghiệm đồng hành, dẫn dắt các phong trào thanh niên, câu lạc bộ sở thích và công tác tư vấn tâm lý học đường.',
    order: 1,
  },
  {
    id: 'c-2',
    name: 'Thầy Lê Hoàng Giang',
    role: 'PBT Đoàn (Phó Bí thư Đoàn Trường)',
    specialty: 'Phụ trách công tác Tư vấn Học đường, hướng dẫn hoạt động CLB, Chuyển đổi số & Hỗ trợ học sinh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    phone: '0789 620 212',
    email: 'lhgiang@thptbachuc.edu.vn',
    bio: 'Phó Bí thư Đoàn trường nhiệt huyết, luôn lắng nghe, đồng hành giải tỏa áp lực học đường và kết nối các cơ hội rèn luyện phát triển bản thân cho học sinh.',
    order: 2,
  },
  {
    id: 'c-3',
    name: 'Cô Nguyễn Thị Hiệp',
    role: 'Y tế học đường (Cán bộ Y tế Trường THPT Ba Chúc)',
    specialty: 'Chuyên tư vấn & chăm sóc sức khoẻ học sinh, dinh dưỡng học đường, sơ cấp cứu & sức khỏe sinh sản tuổi vị thành niên',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    phone: '0789 620 212',
    email: 'nguyenthihiep@thptbachuc.edu.vn',
    bio: 'Cán bộ Y tế trường học tận tâm, giàu kinh nghiệm chăm sóc sức khỏe thể chất, sơ cấp cứu học đường và tư vấn sức khỏe tuổi mới lớn.',
    order: 3,
  },
];

export const sampleTeacherAvatars = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
];

