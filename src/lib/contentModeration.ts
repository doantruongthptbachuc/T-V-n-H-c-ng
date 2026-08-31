/**
 * BỨC TƯỜNG LỬA KIỂM DUYỆT NỘI DUNG VÀ AN TOÀN HỌC ĐƯỜNG
 * Trường THPT Ba Chúc - An Giang
 * 
 * Chức năng:
 * - Kiểm duyệt từ ngữ nhạy cảm, đồi trụy, 18+, khiêu dâm
 * - Ngăn chặn bạo lực học đường, đe dọa, xúc phạm nhân phẩm
 * - Phát hiện và cảnh báo nguy cơ tự hại / khủng hoảng tâm lý
 * - Chống mã độc XSS, SQL Injection, Script Injection từ Burp Suite / DevTools
 * - Kiểm duyệt tệp ảnh đính kèm (MIME, Magic Bytes, kích thước, đuôi file)
 */

// 1. Danh sách từ khóa đồi trụy, khiêu dâm, 18+ (bao gồm cả biến thể và lách luật)
const ADULT_KEYWORDS = [
  'sex', 's.e.x', 'xxx', 'porn', 'p.o.r.n', 'hentai', 'khiêu dâm', 'khieu dam',
  'đồi trụy', 'doi truy', 'lộ clip', 'clip nóng', 'clip sex', 'gái gọi', 'gai goi',
  'bán dâm', 'ban dam', 'mua dâm', 'mua dam', 'kích dục', 'kich duc',
  'thủ dâm', 'thu dam', 'quay tay', 'quan hệ tình dục', 'tình một đêm',
  'nude', 'khỏa thân', 'khoa than', 'lộ hàng', 'lo hang', 'khoe hàng',
  'chat sex', 'phim sex', 'phim 18+', 'video 18+', 'web 18+', 'jav',
  'dâm đãng', 'dam dang', 'gạ chịch', 'ga chich', 'chịch', 'chich nhau',
  'đụ', 'du nhau', 'dit nhau', 'địt nhau', 'd.i.t', 'đ.ị.t', 'dcm', 'vlxx',
  'lồn', 'lon to', 'l.o.n', 'cặc', 'buồi', 'bú cu', 'bu cu', 'liếm lồn', 'buscu',
  'ấu dâm', 'au dam', 'hiếp dâm', 'hiep dam', 'cưỡng bức', 'cuong buc'
];

// 2. Danh sách từ khóa bạo lực nguy hiểm, xúc phạm nghiêm trọng, đe dọa
const VIOLENCE_TOXIC_KEYWORDS = [
  'đánh chết', 'danh chet', 'đâm chết', 'dam chet', 'chém chết', 'chem chet',
  'giết người', 'giet nguoi', 'thanh trừng', 'xử đẹp', 'xac chet', 'dao bấm',
  'súng hoa cải', 'bom xăng', 'hẹn solo đánh', 'hội đồng', 'đánh hội đồng',
  'tạt axit', 'tat axit', 'xé áo', 'lột đồ bắt nạt', 'tẩy chay tập thể',
  'chó chết', 'cho chet', 'mả mẹ', 'con đĩ', 'thằng cặc', 'đồ súc vật',
  'đụ má', 'du ma', 'dcm', 'đkm', 'vcl', 'vcln', 'đĩ chó', 'mẹ mày'
];

// 3. Danh sách từ khóa tệ nạn, cờ bạc, chất cấm
const ADDICTION_GAMBLING_KEYWORDS = [
  'tài xỉu', 'tai xiu', 'kubet', 'thabet', '88bet', 'cá độ bóng đá', 'ca do',
  'đánh bạc', 'danh bac', 'xóc đĩa', 'xoc dia', 'lô đề', 'lo de', 'bắn cá ăn tiền',
  'cỏ mỹ', 'co my', 'thuốc lắc', 'thuoc lac', 'ma túy', 'ma tuy', 'ke đá',
  'bóng cười', 'bong cuoi', 'hút cần', 'hut can', 'shisha', 'pod lậu', 'vape lậu'
];

// 4. Danh sách từ khóa nguy cơ tự hại / khủng hoảng khẩn cấp
const EMERGENCY_CRISIS_KEYWORDS = [
  'tự tử', 'tu tu', 'tự sát', 'tu sat', 'muốn chết', 'muon chet', 'kết liễu',
  'ket lieu', 'cắt cổ tay', 'cat co tay', 'rạch tay', 'rach tay', 'nhảy lầu',
  'nhay lau', 'nhảy cầu', 'nhay cau', 'uống thuốc chuột', 'uong thuoc sau',
  'treo cổ', 'treo co', 'chán sống muốn chết', 'không muốn sống nữa'
];

// 5. Danh sách mẫu tấn công an ninh (XSS, SQLi, Payload injection)
const SECURITY_PAYLOAD_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on(?:load|error|click|mouseover|submit|focus|blur)\s*=/gi,
  /eval\s*\(/gi,
  /union\s+select/gi,
  /drop\s+table/gi,
  /exec\s*\(|execute\s*\(/gi,
  /<iframe\b/gi,
  /<img\b[^>]*\bonerror\b/gi
];

/**
 * Chuẩn hóa chuỗi văn bản để phát hiện các hình thức lách bộ lọc:
 * - Bỏ dấu tiếng Việt
 * - Bỏ ký tự đặc biệt xen kẽ (. , - _ * @ /)
 * - Chuyển chữ thường
 */
export function normalizeTextForFilter(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kết quả kiểm duyệt nội dung
 */
export interface ModerationResult {
  isSafe: boolean;
  isEmergency: boolean;
  reason?: string;
  category?: 'adult' | 'violence' | 'gambling' | 'toxic' | 'security' | 'crisis';
  sanitizedText: string;
}

/**
 * Kiểm duyệt một chuỗi văn bản bất kỳ (câu hỏi, tâm sự, tìm kiếm, tin nhắn chat)
 */
export function moderateText(rawText: string): ModerationResult {
  if (!rawText || typeof rawText !== 'string') {
    return { isSafe: true, isEmergency: false, sanitizedText: '' };
  }

  const cleanRaw = rawText.trim();
  const lowerRaw = cleanRaw.toLowerCase();
  const normalized = normalizeTextForFilter(cleanRaw);

  // 1. Kiểm tra nguy cơ Tự hại / Khủng hoảng tâm lý khẩn cấp trước tiên
  for (const kw of EMERGENCY_CRISIS_KEYWORDS) {
    if (lowerRaw.includes(kw) || normalized.includes(normalizeTextForFilter(kw))) {
      return {
        isSafe: false,
        isEmergency: true,
        category: 'crisis',
        reason: 'Hệ thống phát hiện nội dung có dấu hiệu khủng hoảng tâm lý nghiêm trọng. Vui lòng liên hệ đường dây nóng tư vấn khẩn cấp.',
        sanitizedText: cleanRaw
      };
    }
  }

  // 2. Kiểm tra Payload tấn công bảo mật / XSS / SQLi / Burp Suite injection
  for (const pattern of SECURITY_PAYLOAD_PATTERNS) {
    if (pattern.test(cleanRaw)) {
      return {
        isSafe: false,
        isEmergency: false,
        category: 'security',
        reason: '🚫 TƯỜNG LỬA AN TOÀN: Nội dung chứa ký tự hoặc mã lệnh không hợp lệ, đã bị hệ thống chặn tự động.',
        sanitizedText: ''
      };
    }
  }

  // 3. Kiểm tra Nội dung Đồi trụy, 18+, Khiêu dâm
  for (const kw of ADULT_KEYWORDS) {
    const normKw = normalizeTextForFilter(kw);
    if (lowerRaw.includes(kw) || normalized.includes(normKw)) {
      return {
        isSafe: false,
        isEmergency: false,
        category: 'adult',
        reason: '🚫 TƯỜNG LỬA BẢO VỆ: Nội dung chứa từ ngữ nhạy cảm, đồi trụy hoặc không phù hợp với thuần phong mỹ tục và môi trường học đường THPT Ba Chúc.',
        sanitizedText: ''
      };
    }
  }

  // 4. Kiểm tra Bạo lực, Đe dọa, Xúc phạm nhân phẩm
  for (const kw of VIOLENCE_TOXIC_KEYWORDS) {
    const normKw = normalizeTextForFilter(kw);
    if (lowerRaw.includes(kw) || normalized.includes(normKw)) {
      return {
        isSafe: false,
        isEmergency: false,
        category: 'violence',
        reason: '🚫 TƯỜNG LỬA BẢO VỆ: Phát hiện từ ngữ bạo lực, xúc phạm hoặc lăng mạ. Môi trường tư vấn học đường yêu cầu ngôn từ văn minh, tôn trọng.',
        sanitizedText: ''
      };
    }
  }

  // 5. Kiểm tra Cờ bạc, Tệ nạn, Chất cấm
  for (const kw of ADDICTION_GAMBLING_KEYWORDS) {
    const normKw = normalizeTextForFilter(kw);
    if (lowerRaw.includes(kw) || normalized.includes(normKw)) {
      return {
        isSafe: false,
        isEmergency: false,
        category: 'gambling',
        reason: '🚫 TƯỜNG LỬA BẢO VỆ: Nghiêm cấm mọi nội dung liên quan đến tệ nạn, cờ bạc, chất cấm và cá cược học đường.',
        sanitizedText: ''
      };
    }
  }

  // An toàn - Loại bỏ các thẻ HTML tiềm ẩn nguy cơ
  const sanitized = cleanRaw
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return {
    isSafe: true,
    isEmergency: false,
    sanitizedText: sanitized
  };
}

/**
 * Kiểm duyệt Tệp ảnh tải lên (Kiểm tra dung lượng, định dạng MIME và Magic Bytes)
 */
export async function validateImageFile(file: File): Promise<{
  isValid: boolean;
  reason?: string;
}> {
  if (!file) {
    return { isValid: false, reason: 'Không tìm thấy tệp tải lên.' };
  }

  // 1. Kiểm tra kích thước (Tối đa 5MB)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      isValid: false,
      reason: 'Kích thước ảnh vượt quá giới hạn cho phép (Tối đa 5MB).'
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      reason: 'Tệp ảnh rỗng hoặc bị lỗi.'
    };
  }

  // 2. Kiểm tra phần mở rộng tệp (File Extension)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pjg', '.pjpeg', '.jfif', '.webp', '.gif'];
  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExt) {
    return {
      isValid: false,
      reason: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các tệp ảnh: .PNG, .PJG, .JPG, .JPEG, .WEBP, .GIF'
    };
  }

  // Chặn nghiêm ngặt các tệp nguy hiểm
  const dangerousExts = ['.exe', '.php', '.phtml', '.js', '.sh', '.bat', '.cmd', '.py', '.svg', '.html', '.htm', '.jar', '.dll'];
  if (dangerousExts.some(ext => fileName.endsWith(ext))) {
    return {
      isValid: false,
      reason: '🚫 CẢNH BÁO BẢO MẬT: Tệp tin có nguy cơ chứa mã thực thi nguy hiểm, bị từ chối tải lên.'
    };
  }

  // 3. Kiểm tra MIME Type (nếu trình duyệt xác định được)
  const allowedMimeTypes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/pjg',
    'image/x-png',
    'application/octet-stream',
    ''
  ];
  if (file.type && !allowedMimeTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      reason: 'Loại MIME của tệp không hợp lệ. Vui lòng chọn tệp ảnh thực sự (.PNG, .PJG, .JPG, .WEBP).'
    };
  }

  // 4. Kiểm tra Magic Bytes nhị phân (Chữ ký tệp thực tế)
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG / JFIF / Progressive JPEG / PJG: FF D8 (thường là FF D8 FF)
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    // GIF: 47 49 46 38
    const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
    // WEBP: 52 49 46 46 (RIFF)
    const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

    if (!isJpeg && !isPng && !isGif && !isWebp) {
      return {
        isValid: false,
        reason: '🚫 CẢNH BÁO: Chữ ký nhị phân của tệp không khớp với cấu trúc ảnh tiêu chuẩn (.PNG, .PJG, .JPG, .WEBP). Tệp bị chặn vì lý do bảo mật.'
      };
    }
  } catch (err) {
    console.warn('Lỗi đọc header file ảnh:', err);
  }

  return { isValid: true };
}

/**
 * Quản lý Rate Limiting / Chống tấn công dò mật khẩu (Anti-Brute Force Firewall)
 */
const LOGIN_ATTEMPTS_KEY = 'thpt_bachuc_auth_attempts_v1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

export interface RateLimitStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
}

export function checkLoginRateLimit(): RateLimitStatus {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!raw) {
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockedUntil && now < data.lockedUntil) {
      const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attemptsLeft: 0 };
    }

    // Đã hết thời gian khóa
    if (data.lockedUntil && now >= data.lockedUntil) {
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    const attempts = data.count || 0;
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts)
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
  }
}

export function recordFailedLoginAttempt(): RateLimitStatus {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : { count: 0 };
    data.count = (data.count || 0) + 1;
    data.lastAttempt = Date.now();

    if (data.count >= MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(data));
      return {
        isLocked: true,
        remainingSeconds: LOCKOUT_MINUTES * 60,
        attemptsLeft: 0
      };
    }

    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(data));
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - data.count)
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_ATTEMPTS };
  }
}

export function resetLoginAttempts(): void {
  try {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  } catch {}
}
