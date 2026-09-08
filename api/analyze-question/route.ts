import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const VALID_TOPICS = [
  'Học tập',
  'Tâm lý',
  'Bạn bè',
  'Gia đình',
  'Hướng nghiệp',
  'Kỹ năng sống',
  'Sức khỏe học đường',
  'Hoạt động Đoàn',
  'Tình cảm học trò',
  'Khác',
] as const;

function localFallback(question: string, currentTopic?: string) {
  const text = question.toLowerCase();

  const emergency = [
    'tự tử', 'tự sát', 'tự hại', 'muốn chết', 'cắt tay',
    'uống thuốc ngủ', 'nhảy lầu', 'bị đánh đập dã man', 'xâm hại', 'nguy kịch',
  ].some(k => text.includes(k));

  let severity = emergency ? 'cao' : 'thấp';
  let topic = (VALID_TOPICS as readonly string[]).includes(currentTopic || '')
    ? currentTopic!
    : 'Tâm lý';

  if (!emergency && [
    'áp lực', 'mất ngủ', 'lo âu', 'cãi nhau', 'mâu thuẫn',
    'sa sút', 'sợ thi', 'bế tắc'
  ].some(k => text.includes(k))) severity = 'trung bình';

  if (['đại học', 'chọn ngành', 'hướng nghiệp', 'nghề nghiệp'].some(k => text.includes(k))) topic = 'Hướng nghiệp';
  else if (['đoàn', 'tình nguyện', 'hoa phượng đỏ', 'clb', 'câu lạc bộ'].some(k => text.includes(k))) topic = 'Hoạt động Đoàn';
  else if (['bạn bè', 'bạn thân', 'nhóm bạn', 'tình bạn'].some(k => text.includes(k))) topic = 'Bạn bè';
  else if (['ba mẹ', 'bố mẹ', 'gia đình', 'phụ huynh', 'cha mẹ'].some(k => text.includes(k))) topic = 'Gia đình';
  else if (['học tập', 'ôn thi', 'điểm số', 'môn học'].some(k => text.includes(k))) topic = 'Học tập';
  else if (['kỹ năng', 'giao tiếp', 'thuyết trình', 'tự tin'].some(k => text.includes(k))) topic = 'Kỹ năng sống';
  else if (['sức khỏe', 'dinh dưỡng', 'cận thị', 'thể chất'].some(k => text.includes(k))) topic = 'Sức khỏe học đường';

  return {
    success: true,
    topic,
    tags: emergency ? ['Khẩn cấp', 'Cần hỗ trợ trực tiếp'] : ['Tư vấn học đường'],
    severity,
    urgencyReason: emergency
      ? 'Câu hỏi có dấu hiệu cần được người lớn có trách nhiệm tiếp nhận và hỗ trợ trực tiếp.'
      : 'Phân loại sơ bộ bằng bộ quy tắc an toàn.',
    suggestedAction: emergency
      ? 'Ưu tiên kết nối học sinh với người lớn đáng tin cậy và bộ phận tư vấn của nhà trường.'
      : 'Thầy cô tiếp nhận và phản hồi theo quy trình tư vấn học đường.',
    analyzedAt: new Date().toISOString(),
    isAiClassified: false,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body?.question || '').trim();

    if (!question) {
      return NextResponse.json(localFallback(''));
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        localFallback(question, body?.currentTopic)
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Bạn là trợ lý phân loại câu hỏi cho hệ thống Tư vấn học đường THPT Ba Chúc.
Chỉ phân loại, không chẩn đoán y khoa. Trả về đúng JSON với các khóa:
topic, tags, severity, urgencyReason, suggestedAction.
topic phải là một trong: ${VALID_TOPICS.join(', ')}.
severity phải là: thấp, trung bình, cao.
Câu hỏi học sinh:
${question}

Nếu có dấu hiệu nguy cơ nghiêm trọng, hãy xếp severity cao và khuyến nghị kết nối ngay với người lớn có trách nhiệm/bộ phận tư vấn của nhà trường.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const raw = result.text?.trim() || '';
    const parsed = JSON.parse(raw);

    const topic = (VALID_TOPICS as readonly string[]).includes(parsed.topic)
      ? parsed.topic
      : (body?.currentTopic || 'Tâm lý');

    const severity =
      parsed.severity === 'cao' || parsed.severity === 'trung bình'
        ? parsed.severity
        : 'thấp';

    return NextResponse.json({
      success: true,
      topic,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6).map(String) : ['Tư vấn học đường'],
      severity,
      urgencyReason: String(parsed.urgencyReason || ''),
      suggestedAction: String(parsed.suggestedAction || ''),
      analyzedAt: new Date().toISOString(),
      isAiClassified: true,
    });
  } catch {
    try {
      const body = await request.clone().json();
      return NextResponse.json(localFallback(String(body?.question || ''), body?.currentTopic));
    } catch {
      return NextResponse.json(localFallback(''));
    }
  }
}
