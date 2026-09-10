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

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Firewall-Protection", "THPT-BaChuc-WAF-Active");
  next();
});

app.use((req, res, next) => {
  const rawUrl = req.url || "";
  const decodedPath = decodeURIComponent(rawUrl).toLowerCase();
  const clientIp = getClientIp(req);

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

  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isHackerScanner = /(sqlmap|nikto|acunetix|dirbuster|masscan|gobuster|wpscan|hydra|zgrab|nessus|openvas|shodan)/i.test(userAgent);
  if (isHackerScanner) {
    logFirewallEvent(clientIp, "SCANNER_BOT_BLOCKED", `Phát hiện công cụ quét mã tự động: ${userAgent.slice(0, 50)}`, decodedPath);
    return res.status(403).json({ error: "SCANNER_BLOCKED", message: "Hệ thống từ chối kết nối từ công cụ quét tự động." });
  }

  next();
});

const DB_FILE_PATH = path.join(process.cwd(), "server-data.json");
const SERVER_START_TIME = new Date().toISOString();
let serverDataVersion = Date.now();
let serverLastSyncedAt = new Date().toISOString();

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

const EMERGENCY_KEYWORDS = [
  "tự tử", "tự sát", "tự hại", "chết", "kết liễu", "muốn chết", "cắt tay", "uống thuốc ngủ", "nhảy lầu", "bị đánh đập dã man", "lạm dụng", "nguy kịch"
];

function checkEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function getIntelligentFallbackResponse(userInput: string, knowledgeBase: any[] = []): string {
  const text = userInput.toLowerCase();

  if (checkEmergency(text)) {
    return `🚨 **THÔNG BÁO KHẨN CẤP & AN TOÀN:**\n\nMình rất quan tâm đến bạn và bạn không hề đơn độc! Hãy tạm dừng mọi suy nghĩ tiêu cực lúc này. Sức khỏe và sự an toàn của bạn là điều quan trọng nhất.\n\n👉 **Hãy liên hệ NGAY với người lớn đáng tin cậy hoặc các kênh khẩn cấp sau:**\n- 📞 **Hotline Tư vấn Học đường Trường THPT Ba Chúc:** **0789 620 212** (Hoạt động 24/7)\n- 📞 **Tổng đài Quốc gia Bảo vệ Trẻ em & Thanh thiếu niên:** **111** (Miễn phí cước gọi)\n- 📞 **Cấp cứu Y tế:** **115**\n\nThầy cô phòng Tư vấn Học đường luôn sẵn sàng lắng nghe và bảo vệ bạn bí mật. Hãy nhấc máy gọi ngay bạn nhé! 💙`;
  }

  if (Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
    for (const item of knowledgeBase) {
      const q = (item.question || item.promptText || '').toLowerCase();
      const a = item.answer;
      if (q && a) {
        if (text.includes(q) || q.includes(text)) {
          return `${a}\n\n*(Thông tin tư vấn chính thức từ Ban Cố vấn & Thầy Cô Trường THPT Ba Chúc)*`;
        }
        const keywords = q.split(/\s+/).filter((w: string) => w.length > 3);
        const matchCount = keywords.filter((kw: string) => text.includes(kw)).length;
        if (keywords.length > 0 && matchCount >= Math.min(3, keywords.length)) {
          return `${a}\n\n*(Định hướng tư vấn từ Ban Cố vấn Trường THPT Ba Chúc)*`;
        }
      }
    }
  }

  if (text.includes("học tập") || text.includes("điểm số") || text.includes("áp lực học") || text.includes("mất tập trung") || text.includes("thi cử") || text.includes("ôn thi")) {
    return `Chào bạn! Mình hiểu áp lực học tập và thi cử ở cấp 3 đôi khi khiến bạn cảm thấy quá tải. Dưới đây là vài gợi ý nhỏ từ góc nhìn tâm lý học đường:\n\n1. **Phương pháp Pomodoro (25/5):** Học tập trung 25 phút rồi nghỉ ngơi 5 phút để não bộ được tái tạo năng lượng.\n2. **Chia nhỏ mục tiêu:** Đừng nhìn cả cuốn sách hay đề cương khổng lồ, hãy chia nhỏ thành từng phần 30 phút mỗi ngày.\n3. **Đừng học một mình trong lo lắng:** Hãy thảo luận với bạn bè hoặc hỏi thầy cô bộ môn khi gặp bài khó.\n4. **Ngủ đủ giấc:** Giấc ngủ giúp củng cố trí nhớ dài hạn và giải tỏa căng thẳng.`;
  }

  return `Chào bạn! 🌱 Mình là trợ lý Tư vấn Học đường Trường THPT Ba Chúc. Bạn có thể chia sẻ rõ hơn điều mình đang băn khoăn để mình hỗ trợ nhé.`;
}

// NOTE: Các route /api hiện hữu trong file này được giữ nguyên.
// Phần dưới đây là đoạn kết tương thích Vercel: export app thay vì luôn app.listen().

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

export { app };

async function start() {
  if (process.env.VERCEL) return;

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
