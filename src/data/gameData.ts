export type RobotMood = 'happy' | 'sad' | 'surprised';
export type MissionId = 1 | 2 | 3 | 4;
export type ConfusionSceneType =
  | 'tree_vs_gas'
  | 'fish_vs_eggplant'
  | 'desk_vs_bowl'
  | 'sun_vs_float';

export type FingerId =
  | 'left_pinky'
  | 'left_ring'
  | 'left_middle'
  | 'left_index'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_pinky'
  | 'none';

export interface TeamInfo {
  id: string;
  name: string;
  score: number;
  colorClass: string;
  ringClass: string;
}

export interface Mission1Scenario {
  id: string;
  title: string;
  robotPrompt: string;
  goalHint: string;
  typoExample: string;
  correctExample: string;
  teacherExplanation: string;
}

export interface Mission2Challenge {
  id: string;
  type: 'select_row' | 'find_key' | 'select_finger';
  prompt: string;
  targetRow?: 'top' | 'home' | 'bottom';
  targetKey?: string;
  targetFinger?: FingerId;
  teacherAnswer: string;
  explanation: string;
}

export interface Mission3Paragraph {
  id: string;
  title: string;
  faultyText: string;
  tokens: string[];
  errorIndices: number[];
  correctText: string;
  explanation: string;
}

export interface Mission4Task {
  id: string;
  title: string;
  promptGoal: string;
  sampleCommand: string;
  teacherExplanation: string;
}

export const MISSION_1_SCENARIOS: Mission1Scenario[] = [
  {
    id: 'm1_tree',
    title: 'Tình huống 1: Hướng dẫn chăm sóc cây xanh',
    robotPrompt:
      'Chào bạn nhỏ! Bạn hãy gõ một câu lệnh nhờ AIBOT hướng dẫn cách chăm sóc CÂY XANH nhé. Thử xem điều gì xảy ra nếu lỡ gõ nhầm một chữ nhé!',
    goalHint: 'Gõ câu yêu cầu hướng dẫn chăm sóc cây xanh (Ví dụ: "Hãy hướng dẫn em chăm sóc cây xanh.")',
    typoExample: 'Hãy hướng dẫn em chăm sóc cây xăng.',
    correctExample: 'Hãy hướng dẫn em chăm sóc cây xanh.',
    teacherExplanation:
      'Nếu gõ nhầm "cây xanh" thành "cây xăng", AI sẽ hiểu là trạm đổ xăng. Khi sửa lại đúng "cây xanh", AI mới đưa ra hướng dẫn tưới nước và chăm cây phù hợp.',
  },
  {
    id: 'm1_fish',
    title: 'Tình huống 2: Kể chuyện về con cá vàng',
    robotPrompt:
      'Mình rất thích nghe kể chuyện! Bạn hãy gõ câu lệnh nhờ AIBOT kể một câu chuyện ngắn về CON CÁ VÀNG nhé!',
    goalHint: 'Ví dụ: "Hãy kể cho em nghe câu chuyện về con cá vàng."',
    typoExample: 'Hãy kể cho em nghe câu chuyện về con cà vàng.',
    correctExample: 'Hãy kể cho em nghe câu chuyện về con cá vàng.',
    teacherExplanation:
      'Chỉ sai dấu sắc thành dấu huyền ("con cá" thành "con cà") làm AI hiểu nhầm sang quả cà. Học sinh cần kiểm tra kỹ dấu thanh trước khi gửi.',
  },
  {
    id: 'm1_keyboard',
    title: 'Tình huống 3: Cách giữ gìn bàn phím sạch đẹp',
    robotPrompt:
      'Bạn hãy nhắn cho AIBOT một câu hỏi về cách giữ gìn BÀN PHÍM MÁY TÍNH sạch sẽ nhé!',
    goalHint: 'Ví dụ: "Hãy hướng dẫn em cách giữ gìn bàn phím sạch sẽ."',
    typoExample: 'Hãy hướng dẫn em cách giữ gìn ban phim sạch sẽ.',
    correctExample: 'Hãy hướng dẫn em cách giữ gìn bàn phím sạch sẽ.',
    teacherExplanation:
      'Khi thiếu dấu ở "bàn phím" thành "ban phim", dữ liệu trở nên thiếu chính xác. Gõ đủ dấu giúp AI hiểu ngay và trả lời chuẩn xác.',
  },
];

export const MISSION_2_POOL: Mission2Challenge[] = [
  {
    id: 'm2_row_home',
    type: 'select_row',
    prompt: 'Thử thách 1: Em hãy bấm vào một phím bất kỳ thuộc HÀNG PHÍM CƠ SỞ (A, S, D, F, J, K, L, ;) trên bàn phím!',
    targetRow: 'home',
    teacherAnswer: 'Hàng phím cơ sở gồm: A, S, D, F, G, H, J, K, L, ;',
    explanation: 'Hàng phím cơ sở nằm ở hàng giữa các phím chữ cái, là vị trí đặt tay xuất phát khi gõ 10 ngón.',
  },
  {
    id: 'm2_row_top',
    type: 'select_row',
    prompt: 'Thử thách 2: Em hãy bấm vào một phím thuộc HÀNG PHÍM TRÊN (Q, W, E, R, T, Y, U, I, O, P)!',
    targetRow: 'top',
    teacherAnswer: 'Hàng phím trên gồm: Q, W, E, R, T, Y, U, I, O, P',
    explanation: 'Hàng phím trên nằm ngay phía trên hàng phím cơ sở.',
  },
  {
    id: 'm2_row_bottom',
    type: 'select_row',
    prompt: 'Thử thách 3: Em hãy bấm vào một phím thuộc HÀNG PHÍM DƯỚI (Z, X, C, V, B, N, M)!',
    targetRow: 'bottom',
    teacherAnswer: 'Hàng phím dưới gồm: Z, X, C, V, B, N, M, , , . , /',
    explanation: 'Hàng phím dưới nằm ngay phía dưới hàng phím cơ sở và phía trên phím Space.',
  },
  {
    id: 'm2_key_f',
    type: 'find_key',
    prompt: 'Thử thách 4: Tìm và bấm đúng phím F (phím có gai nhỏ bên tay trái) trên bàn phím!',
    targetKey: 'F',
    teacherAnswer: 'Phím F nằm ở hàng phím cơ sở, vị trí thứ 4 từ trái sang.',
    explanation: 'Phím F có gai nhỏ giúp ngón trỏ tay trái đặt đúng vị trí mà không cần nhìn xuống bàn phím.',
  },
  {
    id: 'm2_key_j',
    type: 'find_key',
    prompt: 'Thử thách 5: Tìm và bấm đúng phím J (phím có gai nhỏ bên tay phải) trên bàn phím!',
    targetKey: 'J',
    teacherAnswer: 'Phím J nằm ở hàng phím cơ sở, ngay bên phải phím H.',
    explanation: 'Phím J có gai nhỏ để ngón trỏ tay phải đặt làm điểm tựa.',
  },
  {
    id: 'm2_key_semi',
    type: 'find_key',
    prompt: 'Thử thách 6: Em hãy tìm và bấm phím dấu chấm phẩy (;) trên hàng phím cơ sở!',
    targetKey: ';',
    teacherAnswer: 'Phím ; nằm ở bên phải phím L trên hàng phím cơ sở.',
    explanation: 'Ngón út tay phải đặt lên phím dấu chấm phẩy (;) trên hàng phím cơ sở.',
  },
  {
    id: 'm2_finger_a',
    type: 'select_finger',
    prompt: 'Thử thách 7: Để gõ phím A trên hàng phím cơ sở, em bấm chọn NGÓN TAY nào trên sơ đồ bàn tay?',
    targetKey: 'A',
    targetFinger: 'left_pinky',
    teacherAnswer: 'Ngón út tay trái gõ phím A.',
    explanation: 'Bên tay trái: Út → A, Áp út → S, Giữa → D, Trỏ → F.',
  },
  {
    id: 'm2_finger_k',
    type: 'select_finger',
    prompt: 'Thử thách 8: Để gõ phím K trên hàng phím cơ sở, em bấm chọn NGÓN TAY nào trên sơ đồ bàn tay?',
    targetKey: 'K',
    targetFinger: 'right_middle',
    teacherAnswer: 'Ngón giữa tay phải gõ phím K.',
    explanation: 'Bên tay phải: Trỏ → J, Giữa → K, Áp út → L, Út → ;.',
  },
  {
    id: 'm2_finger_s',
    type: 'select_finger',
    prompt: 'Thử thách 9: Để gõ phím S trên hàng phím cơ sở, em bấm chọn NGÓN TAY nào?',
    targetKey: 'S',
    targetFinger: 'left_ring',
    teacherAnswer: 'Ngón áp út tay trái gõ phím S.',
    explanation: 'Ngón áp út tay trái phụ trách gõ phím S trên hàng phím cơ sở.',
  },
  {
    id: 'm2_finger_l',
    type: 'select_finger',
    prompt: 'Thử thách 10: Để gõ phím L trên hàng phím cơ sở, em bấm chọn NGÓN TAY nào?',
    targetKey: 'L',
    targetFinger: 'right_ring',
    teacherAnswer: 'Ngón áp út tay phải gõ phím L.',
    explanation: 'Ngón áp út tay phải phụ trách gõ phím L trên hàng phím cơ sở.',
  },
];

export const MISSION_3_POOL: Mission3Paragraph[] = [
  {
    id: 'm3_p1',
    title: 'Đoạn văn: Giờ học Tin học',
    faultyText: 'Hôm nay lớp em hoc môn Tin học. Cô giáo dạy chúng em cách gõ bàn phim đúng cách.',
    tokens: ['Hôm', 'nay', 'lớp', 'em', 'hoc', 'môn', 'Tin', 'học.', 'Cô', 'giáo', 'dạy', 'chúng', 'em', 'cách', 'gõ', 'bàn', 'phim', 'đúng', 'cách.'],
    errorIndices: [4, 16],
    correctText: 'Hôm nay lớp em học môn Tin học. Cô giáo dạy chúng em cách gõ bàn phím đúng cách.',
    explanation: 'Lỗi sai: "hoc" thiếu dấu nặng → "học"; "phim" thiếu dấu sắc → "phím".',
  },
  {
    id: 'm3_p2',
    title: 'Đoạn văn: Thư viện trường em',
    faultyText: 'Giờ ra chơi, bạn Nam rủ em vào thư viên đọc sach rất vui.',
    tokens: ['Giờ', 'ra', 'chơi,', 'bạn', 'Nam', 'rủ', 'em', 'vào', 'thư', 'viên', 'đọc', 'sach', 'rất', 'vui.'],
    errorIndices: [9, 11],
    correctText: 'Giờ ra chơi, bạn Nam rủ em vào thư viện đọc sách rất vui.',
    explanation: 'Lỗi sai: "viên" thiếu dấu nặng → "viện"; "sach" thiếu dấu sắc → "sách".',
  },
  {
    id: 'm3_p3',
    title: 'Đoạn văn: Ngồi học đúng tư thế',
    faultyText: 'Khi ngồi trước máy tinh, em luôn ngồi thẳng lưng và gõ nhe tay.',
    tokens: ['Khi', 'ngồi', 'trước', 'máy', 'tinh,', 'em', 'luôn', 'ngồi', 'thẳng', 'lưng', 'và', 'gõ', 'nhe', 'tay.'],
    errorIndices: [4, 12],
    correctText: 'Khi ngồi trước máy tính, em luôn ngồi thẳng lưng và gõ nhẹ tay.',
    explanation: 'Lỗi sai: "tinh," thiếu dấu sắc → "tính,"; "nhe" thiếu dấu nặng → "nhẹ".',
  },
  {
    id: 'm3_p4',
    title: 'Đoạn văn: Vườn hoa sân trường',
    faultyText: 'Buổi sang, em cùng các bạn tưới nước cho khóm hoa trước cưa lớp.',
    tokens: ['Buổi', 'sang,', 'em', 'cùng', 'các', 'bạn', 'tưới', 'nước', 'cho', 'khóm', 'hoa', 'trước', 'cưa', 'lớp.'],
    errorIndices: [1, 12],
    correctText: 'Buổi sáng, em cùng các bạn tưới nước cho khóm hoa trước cửa lớp.',
    explanation: 'Lỗi sai: "sang," thiếu dấu sắc → "sáng,"; "cưa" thiếu dấu hỏi → "cửa".',
  },
  {
    id: 'm3_p5',
    title: 'Đoạn văn: Hai phím có gai nhỏ',
    faultyText: 'Trên hàng phím cơ sơ, hai phím F và J có gai nho giúp em đặt tay đúng.',
    tokens: ['Trên', 'hàng', 'phím', 'cơ', 'sơ,', 'hai', 'phím', 'F', 'và', 'J', 'có', 'gai', 'nho', 'giúp', 'em', 'đặt', 'tay', 'đúng.'],
    errorIndices: [4, 12],
    correctText: 'Trên hàng phím cơ sở, hai phím F và J có gai nhỏ giúp em đặt tay đúng.',
    explanation: 'Lỗi sai: "sơ," thiếu dấu hỏi → "sở,"; "nho" thiếu dấu hỏi → "nhỏ".',
  },
  {
    id: 'm3_p6',
    title: 'Đoạn văn: Giúp đỡ bạn bè',
    faultyText: 'Bạn Lan bị đau chân nên các bạn trong tổ thay nhau xach cặp giúp bạn ấy đến lơp.',
    tokens: ['Bạn', 'Lan', 'bị', 'đau', 'chân', 'nên', 'các', 'bạn', 'trong', 'tổ', 'thay', 'nhau', 'xach', 'cặp', 'giúp', 'bạn', 'ấy', 'đến', 'lơp.'],
    errorIndices: [12, 18],
    correctText: 'Bạn Lan bị đau chân nên các bạn trong tổ thay nhau xách cặp giúp bạn ấy đến lớp.',
    explanation: 'Lỗi sai: "xach" thiếu dấu sắc → "xách"; "lơp." thiếu dấu sắc → "lớp.".',
  },
  {
    id: 'm3_p7',
    title: 'Đoạn văn: Bảo vệ môi trường',
    faultyText: 'Chúng em không vứt rac bừa bãi để sân trương luôn xanh sạch đẹp.',
    tokens: ['Chúng', 'em', 'không', 'vứt', 'rac', 'bừa', 'bãi', 'để', 'sân', 'trương', 'luôn', 'xanh', 'sạch', 'đẹp.'],
    errorIndices: [4, 9],
    correctText: 'Chúng em không vứt rác bừa bãi để sân trường luôn xanh sạch đẹp.',
    explanation: 'Lỗi sai: "rac" thiếu dấu sắc → "rác"; "trương" thiếu dấu huyền → "trường".',
  },
  {
    id: 'm3_p8',
    title: 'Đoạn văn: Đọc sách mỗi ngày',
    faultyText: 'Mỗi tối trước khi đi ngu, em thường đọc một câu chuyên cổ tích ngắn.',
    tokens: ['Mỗi', 'tối', 'trước', 'khi', 'đi', 'ngu,', 'em', 'thường', 'đọc', 'một', 'câu', 'chuyên', 'cổ', 'tích', 'ngắn.'],
    errorIndices: [5, 11],
    correctText: 'Mỗi tối trước khi đi ngủ, em thường đọc một câu chuyện cổ tích ngắn.',
    explanation: 'Lỗi sai: "ngu," thiếu dấu hỏi → "ngủ,"; "chuyên" thiếu dấu nặng → "chuyện".',
  },
];

export const MISSION_4_TASKS: Mission4Task[] = [
  {
    id: 'm4_green_school',
    title: 'Huấn luyện AIBOT bảo vệ cây xanh trường học',
    promptGoal: 'Em hãy tự gõ một câu lệnh hoàn chỉnh, rõ ràng và đúng chính tả để giao nhiệm vụ cho AIBOT viết về những việc làm bảo vệ cây xanh trong trường học.',
    sampleCommand: 'Hãy viết 3 việc làm giúp bảo vệ cây xanh trong trường học.',
    teacherExplanation:
      'Câu lệnh tốt cần nêu rõ yêu cầu ("Hãy viết 3 việc làm..."), đối tượng ("bảo vệ cây xanh trong trường học") và viết đúng chính tả tiếng Việt.',
  },
  {
    id: 'm4_computer_care',
    title: 'Huấn luyện AIBOT hướng dẫn giữ gìn phòng máy tính',
    promptGoal: 'Em hãy tự gõ một câu lệnh hoàn chỉnh nhờ AIBOT nêu các quy tắc an toàn và giữ gìn máy tính sạch sẽ trong phòng Tin học.',
    sampleCommand: 'Hãy nêu 3 cách giữ gìn máy tính sạch sẽ và an toàn trong phòng Tin học.',
    teacherExplanation:
      'Câu lệnh rõ ràng về số lượng ý muốn xem, chủ đề cụ thể và không bị sai dấu thanh sẽ giúp trợ lý AI thực hiện đúng ngay lần đầu.',
  },
  {
    id: 'm4_reading_habit',
    title: 'Huấn luyện AIBOT gợi ý cách rèn luyện gõ phím nhanh',
    promptGoal: 'Em hãy gõ một câu lệnh hoàn chỉnh nhờ AIBOT hướng dẫn các bạn lớp 3 cách luyện gõ bàn phím bằng 10 ngón thật đúng.',
    sampleCommand: 'Hãy hướng dẫn 3 bước giúp học sinh lớp 3 luyện gõ bàn phím đúng cách.',
    teacherExplanation:
      'Câu lệnh đủ chủ ngữ/đối tượng (học sinh lớp 3), yêu cầu cụ thể (3 bước luyện gõ bàn phím) và viết đúng chính tả.',
  },
];

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickMission2Challenges(): Mission2Challenge[] {
  const rows = shuffleArray(MISSION_2_POOL.filter((c) => c.type === 'select_row')).slice(0, 2);
  const keys = shuffleArray(MISSION_2_POOL.filter((c) => c.type === 'find_key')).slice(0, 2);
  const fingers = shuffleArray(MISSION_2_POOL.filter((c) => c.type === 'select_finger')).slice(0, 2);
  return [...rows, ...keys, ...fingers];
}

export function pickNonRepeatingParagraph(usedIds: string[]): {
  paragraph: Mission3Paragraph;
  nextUsedIds: string[];
} {
  let available = MISSION_3_POOL.filter((p) => !usedIds.includes(p.id));
  let resetList = usedIds;
  if (available.length === 0) {
    available = [...MISSION_3_POOL];
    resetList = [];
  }
  const chosen = shuffleArray(available)[0];
  return {
    paragraph: chosen,
    nextUsedIds: [...resetList, chosen.id],
  };
}

export interface PlayerRank {
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
}

export function getPlayerRank(score: number): PlayerRank {
  if (score >= 80) {
    return {
      title: 'Siêu chuyên gia cứu trợ AI',
      subtitle: 'Xuất sắc! Các bạn đã sửa lỗi dữ liệu, làm chủ bàn phím và huấn luyện AIBOT thành công rực rỡ!',
      accentColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 border-emerald-300',
    };
  }
  if (score >= 40) {
    return {
      title: 'Thám tử dữ liệu tài ba',
      subtitle: 'Tuyệt lắm! Các bạn đã giúp AIBOT hiểu đúng nhiều yêu cầu và sửa lỗi chính tả rất tốt!',
      accentColor: 'text-sky-700',
      badgeBg: 'bg-sky-50 border-sky-300',
    };
  }
  return {
    title: 'Trợ lý AI tập sự',
    subtitle: 'Hoan hô tinh thần cố gắng! Hãy luyện tập thêm gõ phím đúng dấu và thử thách lại cùng AIBOT nhé!',
    accentColor: 'text-amber-700',
    badgeBg: 'bg-amber-50 border-amber-300',
  };
}

export const INITIAL_TEAMS: TeamInfo[] = [
  {
    id: 'team_blue',
    name: 'Đội Tia Chớp',
    score: 0,
    colorClass: 'bg-sky-600 text-white border-sky-700',
    ringClass: 'ring-sky-300',
  },
  {
    id: 'team_green',
    name: 'Đội Cây Xanh',
    score: 0,
    colorClass: 'bg-emerald-600 text-white border-emerald-700',
    ringClass: 'ring-emerald-300',
  },
  {
    id: 'team_amber',
    name: 'Đội Mặt Trời',
    score: 0,
    colorClass: 'bg-amber-500 text-slate-950 border-amber-600',
    ringClass: 'ring-amber-300',
  },
];
