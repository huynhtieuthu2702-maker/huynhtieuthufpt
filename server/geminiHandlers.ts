import { GoogleGenAI, Type } from '@google/genai';

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-2.5-flash';

export function getApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return undefined;
  }
  return key;
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const BASE_GRADE3_SYSTEM_INSTRUCTION = `Bạn là AIBOT — một chú robot trợ lý học tập dễ thương, thân thiện trong tiết học Tin học lớp 3 ở Việt Nam.
QUY TẮC BẮT BUỘC:
1. Ngôn ngữ: Tiếng Việt trong sáng, gần gũi, dễ hiểu, xưng hô thân thiện ("mình" - "bạn" hoặc "các bạn nhỏ"), câu ngắn gọn phù hợp học sinh lớp 3 (8-9 tuổi).
2. An toàn trẻ em & Giáo dục: Chỉ phản hồi nội dung lành mạnh, giáo dục, tích cực, an toàn cho trẻ em. Nếu nội dung người dùng nhập không phù hợp lứa tuổi tiểu học, hãy từ chối khéo léo và hướng học sinh quay lại nhiệm vụ học tập.
3. Tuyệt đối KHÔNG yêu cầu học sinh cung cấp thông tin cá nhân (tên thật, địa chỉ, số điện thoại, trường lớp cụ thể).
4. Luôn phản hồi đúng theo dữ liệu thực tế học sinh vừa gửi, không tự ý sửa ngầm đầu vào khi phân tích.`;

async function generateJsonWithResilience<T>(
  ai: GoogleGenAI,
  prompt: string,
  responseSchema: Record<string, unknown>
): Promise<T> {
  const runCall = async (model: string) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: BASE_GRADE3_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });
    return JSON.parse((response.text ?? '{}').trim()) as T;
  };

  try {
    return await runCall(PRIMARY_MODEL);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    // If primary model is unavailable for an external Vercel key (404/NOT_FOUND), fallback gracefully
    if (msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('not found')) {
      return await runCall(FALLBACK_MODEL);
    }
    // Brief retry once on transient network hiccup
    await new Promise((r) => setTimeout(r, 600));
    return await runCall(PRIMARY_MODEL);
  }
}

export function formatGeminiError(error: unknown): { status: number; body: Record<string, unknown> } {
  const message =
    error instanceof Error ? error.message : 'Không thể kết nối tới máy chủ AI.';
  console.error('[Gemini API Error]:', message);

  if (
    message.includes('API_KEY_INVALID') ||
    message.includes('403') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('API key not valid')
  ) {
    return {
      status: 503,
      body: {
        error: true,
        code: 'KEY_UNAVAILABLE',
        message:
          'Dịch vụ AI chưa nhận được khóa API hợp lệ trên máy chủ. Bạn vẫn có thể chơi Nhiệm vụ 2 hoặc kiểm tra biến môi trường GEMINI_API_KEY!',
      },
    };
  }

  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      body: {
        error: true,
        code: 'RATE_LIMIT',
        message: 'AIBOT đang nhận nhiều yêu cầu quá, bạn chờ vài giây rồi bấm gửi lại nhé!',
      },
    };
  }

  return {
    status: 502,
    body: {
      error: true,
      code: 'AI_CONNECTION_ERROR',
      message: 'Mất kết nối tạm thời với trí tuệ nhân tạo Gemini. Hãy kiểm tra mạng và bấm thử lại nhé!',
    },
  };
}

export async function runMission1Evaluate(payload: {
  missionGoal?: string;
  expectedExample?: string;
  originalInput?: string;
  currentInput?: string;
  attemptNumber?: number;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: true,
        code: 'KEY_UNAVAILABLE',
        message:
          'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Hãy thêm biến môi trường GEMINI_API_KEY khi triển khai hoặc chuyển sang Nhiệm vụ 2!',
      },
    };
  }

  const { missionGoal, expectedExample, originalInput, currentInput, attemptNumber } = payload;

  if (!currentInput || !currentInput.trim()) {
    return {
      status: 400,
      body: {
        error: true,
        code: 'EMPTY_INPUT',
        message: 'Bạn chưa nhập câu lệnh nào cho AIBOT nè!',
      },
    };
  }

  const prompt = `Nhiệm vụ của học sinh lớp 3: "${missionGoal ?? 'Viết câu lệnh đúng chính tả tiếng Việt'}"
Ví dụ câu lệnh đúng mục tiêu: "${expectedExample ?? ''}"
Câu lệnh học sinh gửi LẦN ĐẦU (nếu có chỉnh sửa): "${originalInput ?? ''}"
Câu lệnh học sinh VỪA GỬI (Lần ${attemptNumber ?? 1}): "${currentInput}"

Hãy phân tích câu lệnh học sinh VỪA GỬI (giữ nguyên đúng từng chữ học sinh gõ, không tự giả định học sinh gõ đúng nếu thực tế bị sai):
1. Kiểm tra lỗi chính tả, sai dấu thanh (sắc, huyền, hỏi, ngã, nặng), thiếu ký tự, hoặc dùng nhầm từ gây hiểu lầm nghĩa (ví dụ "cây xăng" thay vì "cây xanh", "con cà" thay vì "con cá", "cái bát" thay vì "cái bàn", hoặc sai nghĩa so với mục tiêu).
2. Nếu câu lệnh có lỗi hoặc gây hiểu nhầm:
   - Đặt status = "confused" (nếu gây hiểu nhầm hài hước hoặc sai nghĩa rõ rệt) hoặc "partial" (nếu chỉ sai nhỏ dấu câu/lỗi nhẹ).
   - Trong "robotReply": Hãy nhập vai AIBOT trả lời TỰ NHIÊN theo đúng nghĩa của câu học sinh vừa gõ (ví dụ nếu gõ "cây xăng", AIBOT ngạc nhiên nói về cây xăng/trạm đổ xăng và hỏi lại xem có phải bạn muốn nói điều khác không), đồng thời chỉ ra từ dễ gây hiểu nhầm.
3. Nếu câu lệnh đã rõ ràng, đúng chính tả, đúng ý nghĩa giáo dục của nhiệm vụ:
   - Đặt status = "clear" và passed = true.
   - Trong "robotReply": Khen ngợi thân thiện và thực hiện/trả lời ngắn gọn (2-3 câu) yêu cầu của học sinh bằng ngôn ngữ lớp 3.
4. Trong "differenceAnalysis":
   - Nếu có câu lần đầu ("${originalInput ?? ''}") khác với câu vừa gửi ("${currentInput}"), hãy giải thích rõ sự khác biệt giữa 2 câu và vì sao thay đổi đó giúp AIBOT hiểu đúng (hoặc còn chỗ nào cần sửa).
   - Nếu đây là lần đầu, chỉ ra cụ thể từ nào bị lỗi hoặc vì sao câu đã rõ ràng.
5. Trong "misunderstoodMeaning": mô tả ngắn (1 câu) AIBOT đang hiểu câu vừa gửi theo nghĩa nào.`;

  try {
    const data = await generateJsonWithResilience(ai, prompt, {
      type: Type.OBJECT,
      properties: {
        passed: { type: Type.BOOLEAN },
        status: { type: Type.STRING, description: 'confused | partial | clear' },
        robotMood: { type: Type.STRING, description: 'sad | surprised | happy' },
        robotReply: { type: Type.STRING },
        misunderstoodMeaning: { type: Type.STRING },
        differenceAnalysis: { type: Type.STRING },
        wrongWords: { type: Type.ARRAY, items: { type: Type.STRING } },
        hintForNextTry: { type: Type.STRING },
      },
      required: [
        'passed',
        'status',
        'robotMood',
        'robotReply',
        'misunderstoodMeaning',
        'differenceAnalysis',
        'wrongWords',
        'hintForNextTry',
      ],
    });
    return { status: 200, body: data as Record<string, unknown> };
  } catch (err) {
    return formatGeminiError(err);
  }
}

export async function runMission3Check(payload: {
  faultyParagraph?: string;
  correctReference?: string;
  clickedWords?: string[];
  rewrittenSentence?: string;
  mode?: 'click' | 'rewrite' | 'both';
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: true,
        code: 'KEY_UNAVAILABLE',
        message: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để chấm bài. Bạn hãy kiểm tra cấu hình hoặc thử lại!',
      },
    };
  }

  const { faultyParagraph, correctReference, clickedWords, rewrittenSentence, mode } = payload;

  const prompt = `Kiểm tra bài làm Nhiệm vụ 3 (Thám tử dữ liệu - sửa lỗi đoạn văn tiếng Việt lớp 3).
Đoạn văn gốc có lỗi: "${faultyParagraph ?? ''}"
Đoạn văn đúng tham khảo: "${correctReference ?? ''}"
Chế độ học sinh làm: "${mode ?? 'both'}"
Các từ học sinh bấm đánh dấu là lỗi: ${JSON.stringify(clickedWords ?? [])}
Câu học sinh tự gõ sửa lại (nếu có): "${rewrittenSentence ?? ''}"

Hãy chấm bài chính xác và khích lệ học sinh lớp 3:
- Nếu chế độ có gõ lại câu ("${rewrittenSentence ?? ''}" không rỗng): kiểm tra xem câu gõ lại đã sửa đúng hết lỗi chính tả, dấu thanh, dấu câu của đoạn văn chưa (đánh giá công bằng).
- Nếu học sinh chỉ bấm đánh dấu từ lỗi: kiểm tra xem học sinh đã bấm trúng hết các từ có lỗi trong đoạn văn gốc chưa.
- Nếu cả bấm từ và gõ lại đều có: kiểm tra kết quả tổng thể công bằng, chỉ rõ từ nào sửa đúng, từ nào còn sót hoặc gõ nhầm.
- Giải thích ngắn gọn, dễ hiểu cho học sinh lớp 3.`;

  try {
    const data = await generateJsonWithResilience(ai, prompt, {
      type: Type.OBJECT,
      properties: {
        isCorrect: { type: Type.BOOLEAN },
        robotMood: { type: Type.STRING, description: 'happy | surprised | sad' },
        feedback: { type: Type.STRING },
        errorBreakdown: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctedParagraph: { type: Type.STRING },
      },
      required: [
        'isCorrect',
        'robotMood',
        'feedback',
        'errorBreakdown',
        'correctedParagraph',
      ],
    });
    return { status: 200, body: data as Record<string, unknown> };
  } catch (err) {
    return formatGeminiError(err);
  }
}

export async function runMission4Evaluate(payload: {
  missionTopic?: string;
  userCommand?: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error: true,
        code: 'KEY_UNAVAILABLE',
        message: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ để huấn luyện AIBOT. Vui lòng kiểm tra cấu hình!',
      },
    };
  }

  const { missionTopic, userCommand } = payload;

  if (!userCommand || !userCommand.trim()) {
    return {
      status: 400,
      body: {
        error: true,
        code: 'EMPTY_INPUT',
        message: 'Bạn hãy nhập một câu lệnh hoàn chỉnh cho AIBOT nhé!',
      },
    };
  }

  const prompt = `Học sinh lớp 3 đang thực hiện Nhiệm vụ 4: Huấn luyện trợ lý AI.
Chủ đề nhiệm vụ: "${missionTopic ?? 'Giao một nhiệm vụ rõ ràng, đúng chính tả cho AIBOT'}"
Câu lệnh học sinh vừa nhập: "${userCommand}"

Hãy thực hiện 2 việc:
1. Đánh giá câu lệnh theo 3 tiêu chí:
   - isClear: Câu lệnh có rõ ràng mục tiêu/yêu cầu không? (ví dụ nêu được muốn AI làm gì, chủ đề gì)
   - spellingOk: Có đúng chính tả tiếng Việt, không sai dấu thanh hay thiếu chữ không?
   - easyToUnderstand: Nội dung có mạch lạc, dễ hiểu và phù hợp lứa tuổi học sinh lớp 3 không?
   (Đặt passed = true nếu cả 3 tiêu chí đều đạt hoặc câu lệnh đủ rõ ràng, đúng chính tả, hoàn chỉnh).
2. Trong "evaluationSummary": Nhận xét ngắn gọn từng tiêu chí và nếu có lỗi chính tả thì chỉ rõ chữ cần sửa.
3. Trong "aiExecutionResponse":
   - Nếu passed = true: Thực hiện NGAY yêu cầu trong câu lệnh của học sinh bằng ngôn ngữ đơn giản, vui tươi, dễ hiểu với học sinh lớp 3 (trình bày gạch đầu dòng ngắn gọn, tối đa 4-5 dòng).
   - Nếu passed = false: Hướng dẫn học sinh sửa lại câu lệnh cho rõ ràng hoặc hết lỗi chính tả trước khi AIBOT thực hiện.`;

  try {
    const data = await generateJsonWithResilience(ai, prompt, {
      type: Type.OBJECT,
      properties: {
        passed: { type: Type.BOOLEAN },
        isClear: { type: Type.BOOLEAN },
        clarityNote: { type: Type.STRING },
        spellingOk: { type: Type.BOOLEAN },
        spellingNote: { type: Type.STRING },
        easyToUnderstand: { type: Type.BOOLEAN },
        understandabilityNote: { type: Type.STRING },
        robotMood: { type: Type.STRING, description: 'happy | surprised | sad' },
        evaluationSummary: { type: Type.STRING },
        aiExecutionResponse: { type: Type.STRING },
      },
      required: [
        'passed',
        'isClear',
        'clarityNote',
        'spellingOk',
        'spellingNote',
        'easyToUnderstand',
        'understandabilityNote',
        'robotMood',
        'evaluationSummary',
        'aiExecutionResponse',
      ],
    });
    return { status: 200, body: data as Record<string, unknown> };
  } catch (err) {
    return formatGeminiError(err);
  }
}
