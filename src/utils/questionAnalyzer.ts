import { TopicType, QuestionSeverity, QuestionAIAnalysis } from '../types';

export interface QuestionAnalysisResult {
  topic: TopicType;
  tags: string[];
  severity: QuestionSeverity;
  aiAnalysis: QuestionAIAnalysis;
  isAiClassified: boolean;
}

const EMERGENCY_KEYWORDS = [
  "tự tử", "tự sát", "tự hại", "chết", "kết liễu", "muốn chết", "cắt tay", "uống thuốc ngủ", "nhảy lầu", "bị đánh đập dã man", "lạm dụng", "nguy kịch"
];

function checkLocalEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Client-Side Heuristic Fallback Analyzer
 * Dùng khi thiết bị mất mạng hoặc khi ứng dụng chạy ở chế độ tĩnh (GitHub Pages)
 */
export function analyzeQuestionLocally(
  questionText: string,
  userTopic?: TopicType,
  className?: string
): QuestionAnalysisResult {
  const lower = questionText.toLowerCase();
  const isEmergency = checkLocalEmergency(lower);
  
  let severity: QuestionSeverity = 'thấp';
  let topic: TopicType = userTopic && userTopic !== 'Khác' ? userTopic : 'Tâm lý';
  const tags: string[] = [];
  let urgencyReason = 'Câu hỏi thông thường về học đường, không có dấu hiệu khẩn cấp.';
  let suggestedAction = 'Thầy cô tiếp nhận và gửi câu trả lời tư vấn theo quy trình định kỳ.';

  if (isEmergency || lower.includes("tự tử") || lower.includes("tự sát") || lower.includes("muốn chết") || lower.includes("cắt tay") || lower.includes("bị đánh đập") || lower.includes("xâm hại")) {
    severity = 'cao';
    topic = 'Tâm lý';
    tags.push('Khẩn cấp', 'Khủng hoảng tâm lý', 'Can thiệp gấp');
    urgencyReason = 'Phát hiện từ khóa nhạy cảm / nguy cơ khủng hoảng tâm lý nghiêm trọng.';
    suggestedAction = 'Ưu tiên liên hệ trực tiếp học sinh hoặc phụ huynh, kết nối Hotline 0789 620 212 để can thiệp kịp thời.';
  } else if (lower.includes("bạo lực") || lower.includes("tẩy chay") || lower.includes("cô lập") || lower.includes("đe dọa") || lower.includes("bắt nạt") || lower.includes("trầm cảm") || lower.includes("hoảng loạn") || lower.includes("mất ngủ kéo dài") || lower.includes("khóc suốt") || lower.includes("bế tắc")) {
    severity = 'cao';
    tags.push('Nguy cơ cao', 'Căng thẳng trầm trọng', 'Tâm lý học đường');
    urgencyReason = 'Học sinh đang trải qua tình trạng ức chế cảm xúc, bị cô lập hoặc bế tắc tâm lý nặng.';
    suggestedAction = 'Xếp vào nhóm ưu tiên can thiệp trong vòng 24 giờ, mời học sinh gặp riêng tại Phòng Tư vấn.';
  } else if (lower.includes("áp lực") || lower.includes("mất ngủ") || lower.includes("lo âu") || lower.includes("cãi nhau") || lower.includes("mâu thuẫn") || lower.includes("sa sút") || lower.includes("rớt môn") || lower.includes("bất đồng") || lower.includes("sợ thi")) {
    severity = 'trung bình';
    tags.push('Áp lực tâm lý', 'Cần tháo gỡ', 'Theo dõi');
    urgencyReason = 'Học sinh gặp áp lực học tập hoặc mâu thuẫn cần sự định hướng, động viên sớm.';
    suggestedAction = 'Gửi phản hồi hướng dẫn phương pháp giải tỏa tâm lý và phương án cân bằng thời gian.';
  } else {
    severity = 'thấp';
    tags.push('Thắc mắc chung', 'Học đường');
  }

  // Topic auto-detection from keywords
  if (lower.includes("đại học") || lower.includes("chọn ngành") || lower.includes("chọn nghề") || lower.includes("hướng nghiệp") || lower.includes("nghề nghiệp")) {
    topic = 'Hướng nghiệp';
    tags.push('Hướng nghiệp', 'Chọn ngành');
  } else if (lower.includes("đoàn") || lower.includes("tình nguyện") || lower.includes("hoa phượng đỏ") || lower.includes("clb") || lower.includes("câu lạc bộ")) {
    topic = 'Hoạt động Đoàn';
    tags.push('Đoàn trường', 'Phong trào');
  } else if (lower.includes("bạn bè") || lower.includes("bạn thân") || lower.includes("nhóm bạn") || lower.includes("tình bạn")) {
    topic = 'Bạn bè';
    tags.push('Mối quan hệ bạn bè');
  } else if (lower.includes("ba mẹ") || lower.includes("bố mẹ") || lower.includes("gia đình") || lower.includes("phụ huynh") || lower.includes("cha mẹ")) {
    topic = 'Gia đình';
    tags.push('Quan hệ gia đình');
  } else if (lower.includes("thích bạn") || lower.includes("tỏ tình") || lower.includes("crush") || lower.includes("người yêu") || lower.includes("tình cảm")) {
    topic = 'Tình cảm học trò';
    tags.push('Tình cảm tuổi học trò');
  } else if (lower.includes("học tập") || lower.includes("ôn thi") || lower.includes("điểm số") || lower.includes("môn học") || lower.includes("phương pháp học")) {
    topic = 'Học tập';
    tags.push('Phương pháp học tập');
  } else if (lower.includes("kỹ năng") || lower.includes("giao tiếp") || lower.includes("thuyết trình") || lower.includes("tự tin")) {
    topic = 'Kỹ năng sống';
    tags.push('Kỹ năng sống', 'Giao tiếp');
  } else if (lower.includes("sức khỏe") || lower.includes("dinh dưỡng") || lower.includes("cận thị") || lower.includes("thể chất")) {
    topic = 'Sức khỏe học đường';
    tags.push('Sức khỏe học đường');
  }

  if (className) {
    tags.push(`Lớp ${className}`);
  }

  const uniqueTags = Array.from(new Set(tags)).slice(0, 4);

  return {
    topic,
    tags: uniqueTags.length > 0 ? uniqueTags : ['Tư vấn học đường'],
    severity,
    aiAnalysis: {
      topicTag: topic,
      tags: uniqueTags,
      severity,
      urgencyReason,
      suggestedAction,
      analyzedAt: new Date().toISOString(),
      isAiClassified: false
    },
    isAiClassified: false
  };
}

/**
 * Gọi API Gemini (hoặc fallback thông minh) để tự động gắn nhãn (tag) và mức độ nghiêm trọng
 */
export async function analyzeQuestionWithGemini(
  questionText: string,
  userTopic?: TopicType,
  className?: string,
  studentName?: string,
  isAnonymous?: boolean
): Promise<QuestionAnalysisResult> {
  if (!questionText || !questionText.trim()) {
    return analyzeQuestionLocally('', userTopic, className);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch('/api/analyze-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: questionText,
        currentTopic: userTopic,
        className,
        studentName,
        isAnonymous,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        const severity: QuestionSeverity = 
          data.severity === 'cao' ? 'cao' :
          data.severity === 'trung bình' ? 'trung bình' : 'thấp';

        const validTopics: TopicType[] = [
          'Học tập', 'Tâm lý', 'Bạn bè', 'Gia đình', 'Hướng nghiệp',
          'Kỹ năng sống', 'Sức khỏe học đường', 'Hoạt động Đoàn', 'Tình cảm học trò', 'Khác'
        ];
        const topic: TopicType = validTopics.includes(data.topic) 
          ? (data.topic as TopicType) 
          : (userTopic || 'Tâm lý');

        const tags: string[] = Array.isArray(data.tags) && data.tags.length > 0
          ? data.tags.map((t: any) => String(t).trim()).filter((t: string) => t.length > 0)
          : ['Tư vấn học đường'];

        return {
          topic,
          tags,
          severity,
          aiAnalysis: {
            topicTag: topic,
            tags,
            severity,
            urgencyReason: data.urgencyReason || 'Đã phân tích mức độ ưu tiên bằng Trợ lý Gemini AI.',
            suggestedAction: data.suggestedAction || 'Thầy cô xem xét giải đáp theo quy trình tư vấn.',
            analyzedAt: data.analyzedAt || new Date().toISOString(),
            isAiClassified: Boolean(data.isAiClassified),
          },
          isAiClassified: Boolean(data.isAiClassified),
        };
      }
    }
  } catch (error) {
    console.warn('Gemini auto-analysis API call skipped or timed out, using local analyzer:', error);
  }

  // Seamless fallback to client-side heuristic analyzer
  return analyzeQuestionLocally(questionText, userTopic, className);
}
