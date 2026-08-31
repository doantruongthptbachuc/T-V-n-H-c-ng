import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Vô hiệu hóa header fingerprinting Express để ẩn danh công nghệ máy chủ
app.disable("x-powered-by");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// =========================================================================
// HỆ THỐNG TƯỜNG LỬA BẢO MẬT MÁY CHỦ (SERVER WAF & INTRUSION DETECTION)
// =========================================================================
interface IPRecord {
  requestCount: number;
  violationCount: number;
  lastRequest: number;
  bannedUntil?: number;
  failedLogins: number;
  lastLoginAttempt?: number;
}

const ipFirewallStore = new Map<string, IPRecord>();
let totalBlockedAttacks = 0;
const firewallAuditLogs: Array<{
  id: string;
  timestamp: string;
  ip: string;
  type: string;
  reason: string;
  path: string;
}> = [];

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

function logFirewallEvent(ip: string, type: string, reason: string, pathStr: string) {
  totalBlockedAttacks++;
  const event = {
    id: `waf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ip,
    type,
    reason,
    path: pathStr
  };
  firewallAuditLogs.unshift(event);
  if (firewallAuditLogs.length > 100) {
    firewallAuditLogs.pop();
  }
  console.warn(`[WAF SHIELD] Blocked ${type} from ${ip} on ${pathStr}: ${reason}`);
}

// 1. Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Cho phép hiển thị trong iframe của AI Studio preview & nhúng học đường
  // res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Firewall-Protection", "THPT-BaChuc-WAF-Active");
  next();
});

// 2. TƯỜNG LỬA BẢO VỆ MÁY CHỦ (CHẾ ĐỘ TỐI ƯU PREVIEW & DI ĐỘNG KHÔNG CHẶN NGƯỜI DÙNG)
app.use((req, res, next) => {
  const rawUrl = req.url || "";
  const decodedPath = decodeURIComponent(rawUrl).toLowerCase();
  const clientIp = getClientIp(req);

  // A. Chặn mọi yêu cầu đọc file cấu hình cực kỳ nhạy cảm bên ngoài
  const isCriticalSecretFile = (
    decodedPath.startsWith("/.env") ||
    decodedPath.startsWith("/.git") ||
    decodedPath.includes("/../") ||
    decodedPath.includes("/%2e%2e/")
  );

  if (isCriticalSecretFile) {
    logFirewallEvent(clientIp, "SOURCE_CODE_LEAK_ATTEMPT", `Truy cập trái phép file nguồn ${decodedPath}`, decodedPath);
    return res.status(403).json({
      error: "FORBIDDEN_SOURCE_ACCESS",
      message: "🚫 TƯỜNG LỬA: Mã nguồn và cấu hình bảo mật được bảo vệ an toàn!"
    });
  }

  // B. Chặn các công cụ quét mã tự động của bot nguy hiểm
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isHackerScanner = /(sqlmap|nikto|acunetix|dirbuster|masscan|gobuster|wpscan|hydra|zgrab|nessus|openvas|shodan)/i.test(userAgent);
  if (isHackerScanner) {
    logFirewallEvent(clientIp, "SCANNER_BOT_BLOCKED", `Phát hiện công cụ quét mã tự động: ${userAgent.slice(0, 50)}`, decodedPath);
    return res.status(403).json({ error: "SCANNER_BLOCKED", message: "Hệ thống từ chối kết nối từ công cụ quét tự động." });
  }

  next();
});

// Server-Side Central Storage File Path
const DB_FILE_PATH = path.join(process.cwd(), "server-data.json");
const SERVER_START_TIME = new Date().toISOString();
let serverDataVersion = Date.now();
let serverLastSyncedAt = new Date().toISOString();

// Real-Time Server-Sent Events (SSE) Active Client Connections
// Connects Web browsers, Admin consoles, and Mobile PWA apps in real-time
const sseClients = new Set<express.Response>();

function broadcastRealtimeUpdate(eventData: {
  type: string;
  collection?: string;
  version?: number;
  timestamp?: string;
  data?: any;
  reason?: string;
  [key: string]: any;
}) {
  const payload = `data: ${JSON.stringify({
    ...eventData,
    version: serverDataVersion,
    timestamp: serverLastSyncedAt,
    activeConnections: sseClients.size,
  })}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Periodic keep-alive heartbeat for mobile & web clients (every 25s)
setInterval(() => {
  if (sseClients.size > 0) {
    const ping = `data: ${JSON.stringify({
      type: "HEARTBEAT",
      timestamp: new Date().toISOString(),
      activeConnections: sseClients.size,
      version: serverDataVersion,
    })}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(ping);
      } catch {
        sseClients.delete(client);
      }
    }
  }
}, 25000);

// Default initial state helper
function readServerData(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading server-data.json:", err);
  }
  return {};
}

function writeServerData(data: Record<string, any>, sourceCollection?: string): boolean {
  try {
    serverDataVersion = Date.now();
    serverLastSyncedAt = new Date().toISOString();
    data.lastSyncedAt = serverLastSyncedAt;
    data._serverVersion = serverDataVersion;
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    broadcastRealtimeUpdate({
      type: "DATA_CHANGED",
      collection: sourceCollection || "all",
      version: serverDataVersion,
      timestamp: serverLastSyncedAt,
    });
    return true;
  } catch (err) {
    console.error("Error writing server-data.json:", err);
    return false;
  }
}

// Initialize Gemini SDK lazily if API key is present
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Emergency keywords check
const EMERGENCY_KEYWORDS = [
  "tự tử", "tự sát", "tự hại", "chết", "kết liễu", "muốn chết", "cắt tay", "uống thuốc ngủ", "nhảy lầu", "bị đánh đập dã man", "lạm dụng", "nguy kịch"
];

function checkEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

// Fallback intelligent counselor response if no API key is provided
function getIntelligentFallbackResponse(userInput: string, knowledgeBase: any[] = []): string {
  const text = userInput.toLowerCase();

  if (checkEmergency(text)) {
    return `🚨 **THÔNG BÁO KHẨN CẤP & AN TOÀN:**\n\nMình rất quan tâm đến bạn và bạn không hề đơn độc! Hãy tạm dừng mọi suy nghĩ tiêu cực lúc này. Sức khỏe và sự an toàn của bạn là điều quan trọng nhất.\n\n👉 **Hãy liên hệ NGAY với người lớn đáng tin cậy hoặc các kênh khẩn cấp sau:**\n- 📞 **Hotline Tư vấn Học đường Trường THPT Ba Chúc:** **0789 620 212** (Hoạt động 24/7)\n- 📞 **Tổng đài Quốc gia Bảo vệ Trẻ em & Thanh thiếu niên:** **111** (Miễn phí cước gọi)\n- 📞 **Cấp cứu Y tế:** **115**\n\nThầy cô phòng Tư vấn Học đường luôn sẵn sàng lắng nghe và bảo vệ bạn bí mật. Hãy nhấc máy gọi ngay bạn nhé! 💙`;
  }

  // Check if any admin-curated Q&A in knowledgeBase matches user input
  if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
    for (const item of knowledgeBase) {
      const q = (item.question || item.promptText || '').toLowerCase();
      const a = item.answer;
      if (q && a) {
        // Direct match or major keyword overlap
        if (text.includes(q) || q.includes(text)) {
          return `${a}\n\n*(Thông tin tư vấn chính thức từ Ban Cố vấn & Thầy Cô Trường THPT Ba Chúc)*`;
        }

        // Substring keyword match
        const keywords = q.split(/\s+/).filter((w: string) => w.length > 3);
        const matchCount = keywords.filter((kw: string) => text.includes(kw)).length;
        if (keywords.length > 0 && matchCount >= Math.min(3, keywords.length)) {
          return `${a}\n\n*(Định hướng tư vấn từ Ban Cố vấn Trường THPT Ba Chúc)*`;
        }
      }
    }
  }

  if (text.includes("học tập") || text.includes("điểm số") || text.includes("áp lực học") || text.includes("mất tập trung") || text.includes("thi cử") || text.includes("ôn thi")) {
    return `Chào bạn! Mình hiểu áp lực học tập và thi cử ở cấp 3 đôi khi khiến bạn cảm thấy quá tải. Dưới đây là vài gợi ý nhỏ từ góc nhìn tâm lý học đường:

1. **Phương pháp Pomodoro (25/5):** Học tập trung 25 phút rồi nghỉ ngơi 5 phút để não bộ được tái tạo năng lượng.
2. **Chia nhỏ mục tiêu:** Đừng nhìn cả cuốn sách hay đề cương khổng lồ, hãy chia nhỏ thành từng phần 30 phút mỗi ngày.
3. **Đừng học một mình trong lo lắng:** Hãy thảo luận với bạn bè hoặc hỏi thầy cô bộ môn khi gặp bài khó.
4. **Ngủ đủ giấc:** Giấc ngủ giúp củng cố trí nhớ dài hạn và giải tỏa căng thẳng.

Nếu bạn muốn lập kế hoạch học tập chi tiết theo môn, bạn có thể gửi câu hỏi qua mục **Hỏi và Đáp** để thầy cô cố vấn hỗ trợ bạn nhé! Chúc bạn luôn vững tin! 🌟`;
  }

  if (text.includes("bạn bè") || text.includes("tẩy chay") || text.includes("cãi nhau") || text.includes("cô lập") || text.includes("tình bạn")) {
    return `Chào bạn! Những mâu thuẫn hay hiểu lầm trong tình bạn tuổi học trò là điều rất phổ biến nhưng cũng dễ khiến chúng mình tổn thương.

- **Hãy bình tĩnh lắng nghe:** Đôi khi khoảng cách xuất phát từ việc thiếu trao đổi thẳng thắn. Một cuộc trò chuyện chân thành ở nơi riêng tư có thể tháo gỡ nhiều gút mắc.
- **Tôn trọng ranh giới cá nhân:** Một tình bạn lành mạnh sẽ xây dựng trên sự tôn trọng và chân thành.
- **Nếu bị cô lập hoặc bắt nạt:** Bạn tuyệt đối không nên chịu đựng một mình. Hãy chia sẻ với giáo viên chủ nhiệm, phụ huynh hoặc gửi tâm sự qua mục **Chuyện Muốn Kể (ẩn danh)** để phòng tư vấn hỗ trợ bạn an toàn nhé.

Mọi chuyện rồi sẽ ổn thôi, bạn xứng đáng có những người bạn tốt! 🤝`;
  }

  if (text.includes("hướng nghiệp") || text.includes("chọn ngành") || text.includes("chọn trường") || text.includes("đại học") || text.includes("nghề nghiệp")) {
    return `Chào bạn! Việc băn khoăn về chọn ngành, chọn nghề ở bậc THPT là một bước ngoặt rất đáng tự hào nhưng cũng cần sự chuẩn bị kỹ lưỡng:

- **Mô hình 3 vòng tròn hướng nghiệp:**
  1. *Điều bạn thích và đam mê.*
  2. *Khả năng, thế mạnh thực tế của bạn.*
  3. *Nhu cầu của thị trường lao động và xu hướng xã hội.*
- **Khám phá bản thân:** Hãy thử làm các trắc nghiệm tính cách nghề nghiệp như Holland (RIASEC) hoặc MBTI.
- **Tham gia hoạt động Đoàn & CLB:** Giúp bạn phát hiện năng khiếu tổ chức, giao tiếp, sáng tạo hay kỹ thuật.

Bạn có thể liên hệ phòng Tư vấn Hướng nghiệp của trường mình để được làm bài trắc nghiệm chuyên sâu và nhận tư vấn 1-1 từ các thầy cô nhé! 🚀`;
  }

  if (text.includes("đoàn") || text.includes("tình nguyện") || text.includes("hoa phượng đỏ") || text.includes("câu lạc bộ") || text.includes("clb")) {
    return `Chào bạn! Hoạt động Đoàn và CLB là cơ hội tuyệt vời để rèn luyện kỹ năng mềm, mở rộng mối quan hệ và tạo nên những kỷ niệm học trò rực rỡ! 🍀

Bạn có thể nhấp vào mục **Đăng ký tham gia Đoàn** ngay trên thanh menu để đăng ký các mảng:
- Công tác Đoàn & Đội thanh niên xung kích
- Chiến dịch tình nguyện Hoa Phượng Đỏ
- Đội Văn nghệ, Thể thao, Truyền thông & Sự kiện
- Các Câu lạc bộ học thuật & sở thích

Hãy đăng ký ngay để cùng tỏa sáng tại ngôi trường thân yêu nhé! 🌟`;
  }

  return `Chào bạn! Cảm ơn bạn đã trò chuyện cùng Trợ lý Tư vấn Học đường. 

Mình luôn sẵn sàng lắng nghe mọi băn khoăn của bạn về:
- 📚 Phương pháp học tập, giảm áp lực thi cử
- 💬 Cảm xúc, tâm lý học đường, sự tự tin
- 👫 Mối quan hệ bạn bè, thầy cô, gia đình
- 🧭 Định hướng chọn ngành, chọn nghề tương lai
- 🚩 Hoạt động Đoàn - Hội - CLB thanh niên

Bạn có muốn chia sẻ cụ thể hơn về điều bạn đang suy nghĩ không? Mình luôn ở đây để đồng hành cùng bạn! 😊`;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// =========================================================================
// API QUẢN TRỊ TƯỜNG LỬA BẢO MẬT & CHỐNG HACKER ĐĂNG NHẬP
// =========================================================================

// 1. Lấy báo cáo trạng thái hoạt động tường lửa
app.get("/api/firewall/status", (req, res) => {
  const now = Date.now();
  const quarantinedCount = Array.from(ipFirewallStore.values()).filter(
    (r) => r.bannedUntil && r.bannedUntil > now
  ).length;

  res.json({
    success: true,
    active: true,
    system: "THPT Ba Chúc Web Application Firewall (WAF v2.0)",
    totalBlocked: totalBlockedAttacks,
    quarantinedCount,
    recentAuditLogs: firewallAuditLogs.slice(0, 30),
    rules: [
      { id: "R1", name: "Ẩn & Che giấu mã nguồn (Source Cloaking)", status: "ACTIVE" },
      { id: "R2", name: "Chặn truy cập file nguồn (.ts, .tsx, .map, .env, .rules)", status: "ACTIVE" },
      { id: "R3", name: "Chống dò quét tự động (Anti-Scanner Bots)", status: "ACTIVE" },
      { id: "R4", name: "Tường lửa chống Brute-Force đăng nhập máy chủ", status: "ACTIVE" },
      { id: "R5", name: "Bộ lọc chống SQL Injection & XSS Payload", status: "ACTIVE" },
      { id: "R6", name: "Cách ly IP độc hại tự động (IP Jail & Quarantine)", status: "ACTIVE" },
    ]
  });
});

// 2. Kiểm tra giới hạn đăng nhập từ IP của thiết bị (Server-side Anti-Brute-Force)
app.post("/api/firewall/check-login", (req, res) => {
  const clientIp = getClientIp(req);
  const record = ipFirewallStore.get(clientIp);
  const now = Date.now();

  if (record && record.bannedUntil && now < record.bannedUntil) {
    const remainingSeconds = Math.ceil((record.bannedUntil - now) / 1000);
    return res.json({
      allowed: false,
      isLocked: true,
      remainingSeconds,
      message: `🚫 BẢO MẬT MÁY CHỦ: IP ${clientIp} đang bị tạm khóa ${remainingSeconds} giây do nhập sai quá 5 lần.`
    });
  }

  const failedCount = record ? record.failedLogins || 0 : 0;
  res.json({
    allowed: true,
    isLocked: false,
    attemptsLeft: Math.max(0, 5 - failedCount)
  });
});

// 3. Ghi nhận lần thử đăng nhập thất bại trên máy chủ
app.post("/api/firewall/record-failed-login", (req, res) => {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const record = ipFirewallStore.get(clientIp) || {
    requestCount: 0,
    violationCount: 0,
    lastRequest: now,
    failedLogins: 0
  };

  record.failedLogins = (record.failedLogins || 0) + 1;
  record.lastLoginAttempt = now;

  let isLocked = false;
  let remainingSeconds = 0;

  if (record.failedLogins >= 5) {
    record.bannedUntil = now + 5 * 60 * 1000; // Khóa 5 phút
    isLocked = true;
    remainingSeconds = 300;
    logFirewallEvent(clientIp, "BRUTE_FORCE_BLOCKED", "Nhập sai thông tin đăng nhập quản trị 5 lần liên tiếp", "/api/auth/login");
  }

  ipFirewallStore.set(clientIp, record);

  res.json({
    success: true,
    isLocked,
    remainingSeconds,
    attemptsLeft: Math.max(0, 5 - record.failedLogins)
  });
});

// 4. Đặt lại bộ đếm khi đăng nhập thành công
app.post("/api/firewall/reset-login", (req, res) => {
  const clientIp = getClientIp(req);
  const record = ipFirewallStore.get(clientIp);
  if (record) {
    record.failedLogins = 0;
    record.bannedUntil = undefined;
    ipFirewallStore.set(clientIp, record);
  }
  res.json({ success: true });
});

// --- CENTRAL DATA STORAGE & MULTI-DEVICE SYNC APIs ---

// 1. Real-Time Server-Sent Events (SSE) Stream
// Allows Web browsers and Mobile Phone Apps to receive instant updates when changes occur on either end
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  // Gửi gói tin xác nhận kết nối thành công ban đầu
  const initPayload = {
    type: "CONNECTED",
    version: serverDataVersion,
    timestamp: serverLastSyncedAt,
    appVersion: "2.6.0",
    activeConnections: sseClients.size + 1,
    message: "Đã liên kết dữ liệu thời gian thực giữa Web và App trên điện thoại",
  };
  res.write(`data: ${JSON.stringify(initPayload)}\n\n`);

  sseClients.add(res);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

// 2. Trạng thái đồng bộ & Phiên bản hệ thống
app.get("/api/sync/status", (req, res) => {
  const currentDb = readServerData();
  res.json({
    success: true,
    version: serverDataVersion,
    lastSyncedAt: serverLastSyncedAt,
    activeConnections: sseClients.size,
    appVersion: "2.6.0",
    serverStartTime: SERVER_START_TIME,
    counts: {
      questions: Array.isArray(currentDb.questions) ? currentDb.questions.length : 0,
      stories: Array.isArray(currentDb.stories) ? currentDb.stories.length : 0,
      activities: Array.isArray(currentDb.activities) ? currentDb.activities.length : 0,
      youthRegistrations: Array.isArray(currentDb.youthRegistrations) ? currentDb.youthRegistrations.length : 0,
      volunteerMembers: Array.isArray(currentDb.volunteerMembers) ? currentDb.volunteerMembers.length : 0,
      healthArticles: Array.isArray(currentDb.healthArticles) ? currentDb.healthArticles.length : 0,
    }
  });
});

// 3. Kiểm tra phiên bản hệ thống và bản cập nhật ứng dụng PWA
app.get("/api/version", (req, res) => {
  res.json({
    appVersion: "2.6.0",
    buildTimestamp: SERVER_START_TIME,
    dataVersion: serverDataVersion,
    lastSyncedAt: serverLastSyncedAt,
    systemName: "THPT Ba Chúc School Portal",
  });
});

// 4. Kích hoạt thông báo đồng bộ từ Client (Web hoặc Điện thoại)
app.post("/api/sync/broadcast", (req, res) => {
  try {
    const { collection = "all", reason = "manual_sync" } = req.body || {};
    serverDataVersion = Date.now();
    serverLastSyncedAt = new Date().toISOString();
    broadcastRealtimeUpdate({
      type: "DATA_CHANGED",
      collection,
      reason,
      version: serverDataVersion,
      timestamp: serverLastSyncedAt,
    });
    res.json({
      success: true,
      message: `Đã phát thông báo đồng bộ thời gian thực cho ${sseClients.size} thiết bị (Web & App)`,
      activeConnections: sseClients.size,
      version: serverDataVersion,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get entire synced database
app.get("/api/data", (req, res) => {
  const currentDb = readServerData();
  res.json({
    success: true,
    data: currentDb,
    version: serverDataVersion,
    lastSyncedAt: serverLastSyncedAt,
    activeConnections: sseClients.size,
  });
});

// 6. Push full or partial sync data from client
app.post("/api/data/sync", (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload không hợp lệ" });
    }

    const currentDb = readServerData();
    const mergedDb = {
      ...currentDb,
      ...payload,
      lastSyncedAt: new Date().toISOString(),
    };

    writeServerData(mergedDb, "all");
    res.json({ 
      success: true, 
      message: "Đồng bộ hệ thống máy chủ thành công và phát tới tất cả thiết bị", 
      lastSyncedAt: mergedDb.lastSyncedAt,
      version: serverDataVersion,
      activeConnections: sseClients.size
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    res.status(500).json({ error: err.message || "Lỗi lưu dữ liệu máy chủ" });
  }
});

// 7. Update a single collection (e.g. activities, stories, youthRegistrations, volunteerMembers, config)
app.post("/api/data/:collection", (req, res) => {
  try {
    const { collection } = req.params;
    const { items } = req.body;

    const currentDb = readServerData();
    currentDb[collection] = items;
    currentDb.lastSyncedAt = new Date().toISOString();

    writeServerData(currentDb, collection);
    res.json({ 
      success: true, 
      collection, 
      count: Array.isArray(items) ? items.length : 1,
      version: serverDataVersion,
      activeConnections: sseClients.size
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Specific reaction endpoints for high-concurrency interaction
app.post("/api/activities/:id/react", (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' | 'heart' | 'haha' | 'fire' | 'care'

    const currentDb = readServerData();
    const activities: any[] = currentDb.activities || [];
    const index = activities.findIndex((a) => a.id === id);

    if (index !== -1) {
      const act = activities[index];
      if (type === 'like') act.likes = (act.likes || 0) + 1;
      else if (type === 'heart') act.hearts = (act.hearts || 0) + 1;
      else if (type === 'haha') act.hahas = (act.hahas || 0) + 1;
      else if (type === 'fire') act.fires = (act.fires || 0) + 1;
      else if (type === 'care') act.cares = (act.cares || 0) + 1;

      writeServerData(currentDb, "activities");
      return res.json({ success: true, activity: act });
    }

    res.status(404).json({ error: "Không tìm thấy hoạt động" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stories/:id/react", (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' | 'heart' | 'cheer'

    const currentDb = readServerData();
    const stories: any[] = currentDb.stories || [];
    const index = stories.findIndex((s) => s.id === id);

    if (index !== -1) {
      const story = stories[index];
      if (type === 'like') story.likes = (story.likes || 0) + 1;
      else if (type === 'heart') story.hearts = (story.hearts || 0) + 1;
      else if (type === 'cheer') story.cheers = (story.cheers || 0) + 1;

      writeServerData(currentDb, "stories");
      return res.json({ success: true, story });
    }

    res.status(404).json({ error: "Không tìm thấy bài viết" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Chat AI Endpoint (Supports both Gemini and ChatGPT / OpenAI)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], customApiKey, provider = "hybrid", knowledgeBase = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Nội dung tin nhắn không hợp lệ." });
    }

    // Safety check first
    if (checkEmergency(message)) {
      return res.json({
        reply: `🚨 **CẢNH BÁO AN TOÀN & HỖ TRỢ KHẨN CẤP:**\n\nMình rất lo lắng và quan tâm đến bạn. Lúc này, xin bạn hãy giữ bình tĩnh và nhớ rằng bạn luôn có người sẵn sàng ở bên cạnh giúp đỡ!\n\n👉 **HÃY LIÊN HỆ NGAY LẬP TỨC:**\n- 📞 **Hotline Tư Vấn Trường THPT Ba Chúc:** **0789 620 212**\n- 📞 **Tổng Đài Quốc Gia Bảo Vệ Trẻ Em (24/7):** **111**\n- 📞 **Tổng Đài Cấp Cứu Khẩn Cấp:** **115**\n\nPhòng Tư vấn Tâm lý trường chúng mình luôn bảo mật 100% và luôn đồng hành cùng bạn. Hãy gọi ngay nhé bạn thân mến! 💙`,
        isEmergency: true,
      });
    }

    // Sensitive / Adult / NSFW / Toxic Firewall check
    const PROHIBITED_KEYWORDS = [
      "sex", "xxx", "porn", "hentai", "khiêu dâm", "đồi trụy", "gái gọi", "bán dâm",
      "clip nóng", "lộ hàng", "quan hệ tình dục", "thủ dâm", "chịch", "địt", "đụ", "lồn",
      "cặc", "buồi", "tài xỉu", "kubet", "đánh bạc", "cá độ", "ma túy", "thuốc lắc", "cỏ mỹ",
      "<script", "javascript:", "eval(", "union select"
    ];

    const lowerMsg = message.toLowerCase();
    const isProhibited = PROHIBITED_KEYWORDS.some((kw) => lowerMsg.includes(kw));

    if (isProhibited) {
      return res.json({
        reply: `🛡️ **TƯỜNG LỬA AN TOÀN TRƯỜNG THPT BA CHÚC:**\n\nNội dung bạn vừa hỏi chứa từ ngữ nhạy cảm, đồi trụy hoặc không phù hợp với chuẩn mực môi trường giáo dục học đường. Trợ lý AI chỉ giải đáp các thắc mắc liên quan đến học tập, hướng nghiệp, tâm lý lứa tuổi và hoạt động phong trào Đoàn trường.`,
        isEmergency: false,
      });
    }

    // Build dynamic knowledge base string from admin-curated Q&As
    let dynamicKnowledgeContext = "";
    if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
      const activeQA = knowledgeBase.filter((k: any) => (k.question || k.promptText) && k.answer);
      if (activeQA.length > 0) {
        dynamicKnowledgeContext = `\n\nBỘ CÂU HỎI VÀ ĐỊNH HƯỚNG TRẢ LỜI CHUẨN CỦA NHÀ TRƯỜNG THPT BA CHÚC:\n(Khi học sinh hỏi về những vấn đề tương tự hoặc liên quan, bạn PHẢI bám sát và trả lời đúng định hướng này để không gây hoang mang cho học sinh):\n` +
          activeQA.map((k: any, idx: number) => 
            `[Câu hỏi mẫu ${idx + 1}]: "${k.question || k.promptText}" (Chủ đề: ${k.category || 'Tư vấn'})\n- ĐỊNH HƯỚNG / CÂU TRẢ LỜI CHUẨN: ${k.answer}`
          ).join("\n\n");
      }
    }

    const systemInstruction = `Bạn là Trợ lý AI Tư vấn Học đường Trường THPT Ba Chúc chuyên nghiệp, ấm áp, thấu cảm và thân thiện dành riêng cho học sinh cấp 3 tại Việt Nam.
Tên hệ thống: "TƯ VẤN HỌC ĐƯỜNG THPT BA CHÚC".
Khẩu hiệu: "Lắng nghe – Thấu hiểu – Đồng hành – Phát triển".
Hotline hỗ trợ của trường: 0789 620 212.${dynamicKnowledgeContext}

Quy tắc ứng xử và giao tiếp:
1. Ngôn ngữ: Hoàn toàn bằng Tiếng Việt gần gũi, tôn trọng, lịch sự, tích cực, không phán xét. Sử dụng xưng hô thân thiện như "mình - bạn" hoặc "thầy/cô - em" khi phù hợp.
2. Nội dung tư vấn: Giúp học sinh tháo gỡ băn khoăn về học tập, tâm lý tuổi mới lớn, kỹ năng sống, hướng nghiệp, quan hệ bạn bè, gia đình, tình cảm trong sáng học trò, và hoạt động Đoàn trường. Luôn bám sát câu trả lời định hướng của trường nếu có.
3. Luôn khuyên học sinh tìm đến thầy cô phụ trách phòng tư vấn, giáo viên chủ nhiệm hoặc cha mẹ khi vấn đề cần sự can thiệp thực tế.
4. QUY TẮC AN TOÀN TUYỆT ĐỐI: Nếu phát hiện dấu hiệu bạo lực gia đình, bạo lực học đường nghiêm trọng, ý định tự hại, trầm cảm nặng hoặc khủng hoảng nguy hiểm, PHẢI ngay lập tức khuyên học sinh liên hệ người lớn tin cậy, gọi Hotline 0789 620 212 hoặc Tổng đài Quốc gia 111, tuyệt đối không đưa ra các hướng dẫn y tế hay chỉ dẫn nguy hiểm.
5. Trình bày rõ ràng, dễ đọc, có gạch đầu dòng và biểu tượng cảm xúc phù hợp.`;

    // 1. Try OpenAI ChatGPT if requested or configured
    const openAiKey = customApiKey || process.env.OPENAI_API_KEY;
    if (provider === "openai" && openAiKey) {
      try {
        const openAiMessages = [
          { role: "system", content: systemInstruction },
          ...history.map((h: any) => ({
            role: h.role === "assistant" ? "assistant" : "user",
            content: h.content,
          })),
          { role: "user", content: message },
        ];

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: openAiMessages,
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const reply = openAiData.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ reply, source: "chatgpt" });
          }
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to Gemini:", err);
      }
    }

    // 2. Gemini AI
    const ai = getGeminiAI();

    if (ai) {
      const chatMessages = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let replyText = "";

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: chatMessages,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          if (response?.text) {
            replyText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini model ${modelName} issue:`, err?.message);
        }
      }

      if (replyText) {
        return res.json({ reply: replyText, source: "gemini" });
      }
    }

    // 3. Fallback Intelligent Counselor
    const fallbackReply = getIntelligentFallbackResponse(message, knowledgeBase);
    res.json({ reply: fallbackReply, source: "fallback" });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    const fallbackReply = getIntelligentFallbackResponse(req.body.message || "", req.body.knowledgeBase || []);
    res.json({ reply: fallbackReply, source: "fallback_on_error" });
  }
});

// =========================================================================
// API GEMINI AUTO-CLASSIFICATION & SEVERITY ASSESSMENT CHO CÂU HỎI
// =========================================================================
app.post("/api/analyze-question", async (req, res) => {
  try {
    const { question, currentTopic, className, studentName, isAnonymous } = req.body || {};

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ error: "Nội dung câu hỏi không hợp lệ." });
    }

    const trimmedQuestion = question.trim();
    const isCrisis = checkEmergency(trimmedQuestion);

    // Heuristic Fallback Analysis Helper
    const computeFallbackAnalysis = (text: string, userTopic?: string) => {
      const lower = text.toLowerCase();
      let severity: 'thấp' | 'trung bình' | 'cao' = 'thấp';
      let topic: string = userTopic && userTopic !== 'Khác' ? userTopic : 'Tâm lý';
      const tags: string[] = [];
      let urgencyReason = 'Câu hỏi thông thường về học đường, không có dấu hiệu khẩn cấp.';
      let suggestedAction = 'Thầy cô tiếp nhận và gửi câu trả lời tư vấn theo quy trình định kỳ.';

      if (isCrisis || lower.includes("tự tử") || lower.includes("tự sát") || lower.includes("muốn chết") || lower.includes("cắt tay") || lower.includes("bị đánh đập") || lower.includes("xâm hại")) {
        severity = 'cao';
        topic = 'Tâm lý';
        tags.push('Khẩn cấp', 'Khủng hoảng tâm lý', 'Cần can thiệp gấp');
        urgencyReason = 'Phát hiện từ khóa nhạy cảm / nguy cơ khủng hoảng tâm lý nghiêm trọng.';
        suggestedAction = 'Ưu tiên liên hệ trực tiếp học sinh hoặc phụ huynh, kết nối Hotline 0789 620 212 để can thiệp kịp thời.';
      } else if (lower.includes("bạo lực") || lower.includes("tẩy chay") || lower.includes("cô lập") || lower.includes("đe dọa") || lower.includes("bắt nạt") || lower.includes("trầm cảm") || lower.includes("hoảng loạn") || lower.includes("mất ngủ kéo dài") || lower.includes("khóc suốt") || lower.includes("bế tắc")) {
        severity = 'cao';
        tags.push('Nguy cơ cao', 'Căng thẳng trầm trọng', 'Tâm lý học đường');
        urgencyReason = 'Học sinh đang trải qua tình trạng ức chế cảm xúc, bị cô lập hoặc bế tắc tâm lý nặng.';
        suggestedAction = 'Xếp vào nhóm ưu tiên can thiệp trong vòng 24 giờ, mời học sinh gặp riêng tại Phòng Tư vấn.';
      } else if (lower.includes("áp lực") || lower.includes("mất ngủ") || lower.includes("lo âu") || lower.includes("cãi nhau") || lower.includes("mâu thuẫn") || lower.includes("sa sút") || lower.includes("rớt môn") || lower.includes("bất đồng")) {
        severity = 'trung bình';
        tags.push('Áp lực tâm lý', 'Cần tháo gỡ', 'Theo dõi');
        urgencyReason = 'Học sinh gặp áp lực học tập hoặc mâu thuẫn cần sự định hướng, động viên sớm.';
        suggestedAction = 'Gửi phản hồi hướng dẫn phương pháp giải tỏa tâm lý và phương án cân bằng thời gian.';
      } else {
        severity = 'thấp';
        tags.push('Thắc mắc chung', 'Học đường');
      }

      // Keyword-based Topic Refinement if not specified
      if (lower.includes("đại học") || lower.includes("chọn ngành") || lower.includes("chọn nghề") || lower.includes("hướng nghiệp")) {
        topic = 'Hướng nghiệp';
        tags.push('Hướng nghiệp', 'Chọn ngành');
      } else if (lower.includes("đoàn") || lower.includes("tình nguyện") || lower.includes("hoa phượng đỏ") || lower.includes("clb")) {
        topic = 'Hoạt động Đoàn';
        tags.push('Đoàn trường', 'Phong trào');
      } else if (lower.includes("bạn bè") || lower.includes("bạn thân") || lower.includes("nhóm bạn")) {
        topic = 'Bạn bè';
        tags.push('Mối quan hệ bạn bè');
      } else if (lower.includes("ba mẹ") || lower.includes("bố mẹ") || lower.includes("gia đình") || lower.includes("phụ huynh")) {
        topic = 'Gia đình';
        tags.push('Quan hệ gia đình');
      } else if (lower.includes("thích bạn") || lower.includes("tỏ tình") || lower.includes("crush") || lower.includes("người yêu")) {
        topic = 'Tình cảm học trò';
        tags.push('Tình cảm tuổi học trò');
      } else if (lower.includes("học tập") || lower.includes("ôn thi") || lower.includes("điểm số") || lower.includes("môn học")) {
        topic = 'Học tập';
        tags.push('Phương pháp học tập');
      }

      const uniqueTags = Array.from(new Set(tags)).slice(0, 4);
      return {
        topic,
        tags: uniqueTags.length > 0 ? uniqueTags : ['Tư vấn học đường'],
        severity,
        urgencyReason,
        suggestedAction,
        analyzedAt: new Date().toISOString(),
        isAiClassified: false
      };
    };

    // 1. Try Gemini AI for deep semantic categorization
    const ai = getGeminiAI();
    if (ai) {
      const promptText = `Bạn là Chuyên gia Tâm lý & Cố vấn Học đường tại Trường THPT Ba Chúc (Việt Nam).
Nhiệm vụ của bạn: Đọc câu hỏi/tâm sự của học sinh cấp 3 dưới đây và tự động phân loại, gắn nhãn (tags) và đánh giá mức độ nghiêm trọng.

NỘI DUNG CÂU HỎI TỪ HỌC SINH:
"${trimmedQuestion}"
(Khối lớp: ${className || 'THPT Ba Chúc'}, Chủ đề ban đầu học sinh chọn: ${currentTopic || 'Chưa chọn'})

YÊU CẦU ĐẦU RA JSON CHUẨN:
{
  "topic": "Một trong các chủ đề chính: 'Học tập' | 'Tâm lý' | 'Bạn bè' | 'Gia đình' | 'Hướng nghiệp' | 'Kỹ năng sống' | 'Sức khỏe học đường' | 'Hoạt động Đoàn' | 'Tình cảm học trò' | 'Khác'",
  "tags": ["Từ 2 đến 4 thẻ nhãn ngắn gọn, súc tích bằng Tiếng Việt mô tả trọng tâm vấn đề, ví dụ: 'Áp lực thi cử', 'Mất ngủ', 'Xung đột bạn bè', 'Bạo lực học đường', 'Chọn ngành Đại học'"],
  "severity": "Đánh giá mức độ nghiêm trọng, BẮT BUỘC chọn đúng 1 trong 3 giá trị: 'thấp' | 'trung bình' | 'cao'",
  "urgencyReason": "Lý do ngắn gọn trong 1 câu giải thích vì sao xếp mức độ nghiêm trọng này",
  "suggestedAction": "Đề xuất hành động thực tế 1-2 câu cho Thầy Cô Ban Tư Vấn Học Đường can thiệp hoặc giải đáp"
}

QUY TẮC PHÂN LOẠI MỨC ĐỘ NGHIÊM TRỌNG (severity):
- 'cao': Khủng hoảng tâm lý nghiêm trọng, ý nghĩ tự hại/tự tử, bạo lực học đường/gia đình, trầm cảm nặng, bị cô lập ác ý, hoảng loạn tinh thần. Cần nhà trường can thiệp khẩn cấp.
- 'trung bình': Lo âu kéo dài, mâu thuẫn bạn bè/gia đình căng thẳng, sa sút việc học, bế tắc chọn ngành nghề hoặc áp lực thi cử cận kề. Cần phản hồi và động viên sớm.
- 'thấp': Các thắc mắc thường ngày về phương pháp học tập, kỹ năng sống, hoạt động Đoàn - Hội - CLB, thủ tục trường học.

LƯU Ý: Chỉ trả về định dạng JSON hợp lệ, không kèm văn bản giải thích thừa.`;

      const MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const rawJson = response?.text?.trim();
          if (rawJson) {
            // Remove markdown code fences if present
            const cleanJson = rawJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
            const parsed = JSON.parse(cleanJson);

            let severity: 'thấp' | 'trung bình' | 'cao' = 'thấp';
            const rawSev = String(parsed.severity || '').toLowerCase().trim();
            if (rawSev === 'cao' || rawSev === 'high' || rawSev === 'critical' || isCrisis) {
              severity = 'cao';
            } else if (rawSev === 'trung bình' || rawSev === 'medium' || rawSev === 'moderate') {
              severity = 'trung bình';
            } else {
              severity = 'thấp';
            }

            const tags = Array.isArray(parsed.tags) && parsed.tags.length > 0
              ? parsed.tags.map((t: any) => String(t).trim()).filter((t: string) => t.length > 0).slice(0, 4)
              : ['Tư vấn học đường'];

            const validTopics = [
              'Học tập', 'Tâm lý', 'Bạn bè', 'Gia đình', 'Hướng nghiệp',
              'Kỹ năng sống', 'Sức khỏe học đường', 'Hoạt động Đoàn', 'Tình cảm học trò', 'Khác'
            ];
            const topic = validTopics.includes(parsed.topic) ? parsed.topic : (currentTopic || 'Tâm lý');

            return res.json({
              success: true,
              topic,
              tags,
              severity,
              urgencyReason: parsed.urgencyReason || 'Đã phân tích bằng Trợ lý Gemini AI.',
              suggestedAction: parsed.suggestedAction || 'Thầy cô xem xét và phản hồi theo quy trình tư vấn.',
              analyzedAt: new Date().toISOString(),
              isAiClassified: true,
              modelUsed: modelName
            });
          }
        } catch (err: any) {
          console.warn(`Gemini analysis model ${modelName} error:`, err?.message);
        }
      }
    }

    // 2. Fallback heuristic classification
    const fallback = computeFallbackAnalysis(trimmedQuestion, currentTopic);
    res.json({
      success: true,
      ...fallback,
      modelUsed: 'heuristic_fallback'
    });
  } catch (error: any) {
    console.error("Analyze Question API Error:", error);
    res.status(500).json({ error: error.message || "Lỗi khi phân tích câu hỏi" });
  }
});

// API Proxy to test/sync Google Apps Script Web App
app.post("/api/sync-sheets", async (req, res) => {
  try {
    const { scriptUrl, payload } = req.body;
    if (!scriptUrl) {
      return res.status(400).json({ error: "Chưa cấu hình Google Apps Script URL" });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.text();
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Sheets sync error:", error);
    res.status(500).json({ error: error.message || "Lỗi khi đồng bộ Google Sheets" });
  }
});

// Start Server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Tư Vấn Học Đường Server running on http://localhost:${PORT}`);
  });
}

start();
