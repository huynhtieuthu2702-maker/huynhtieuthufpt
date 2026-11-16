import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  GitCompare,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import {
  MISSION_1_SCENARIOS,
  type Mission1Scenario,
  type RobotMood,
} from '../data/gameData';
import { GAME_IMAGES } from '../assets/images';
import {
  evaluateMission1,
  type Mission1ApiResponse,
  ApiRequestError,
} from '../utils/api';
import { ConfusionIllustrations } from './ConfusionIllustrations';
import { soundFX } from '../utils/sound';

interface Mission1PlayProps {
  teacherShowAnswer: boolean;
  onRobotUpdate: (mood: RobotMood, message: string) => void;
  onMissionComplete: (earnedPoints: number) => void;
  onNextMission: () => void;
}

interface ChatAttempt {
  attemptNumber: number;
  input: string;
  aiResult: Mission1ApiResponse;
}

function WordDiffDisplay({ original, revised }: { original: string; revised: string }) {
  const origWords = original.trim().split(/\s+/);
  const revWords = revised.trim().split(/\s+/);

  return (
    <div className="rounded-2xl bg-cyan-950/50 border-2 border-cyan-400/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold text-cyan-200">
        <GitCompare className="w-5 h-5 text-cyan-400 shrink-0" />
        <span>So sánh sự khác biệt giữa yêu cầu ban đầu và yêu cầu đã sửa:</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-950/80 border border-amber-400/50 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-300 mb-1.5">
            Yêu cầu ban đầu (Lần 1)
          </div>
          <div className="flex flex-wrap gap-1.5 text-base sm:text-lg font-bold">
            {origWords.map((w, idx) => {
              const changed = revWords[idx] !== w;
              return (
                <span
                  key={`${idx}-${w}`}
                  className={
                    changed
                      ? 'px-2 py-0.5 rounded-lg bg-amber-500/25 text-amber-200 line-through decoration-2 decoration-rose-400'
                      : 'text-slate-200'
                  }
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/80 border border-emerald-400/50 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-300 mb-1.5">
            Yêu cầu đã sửa
          </div>
          <div className="flex flex-wrap gap-1.5 text-base sm:text-lg font-bold">
            {revWords.map((w, idx) => {
              const changed = origWords[idx] !== w;
              return (
                <span
                  key={`${idx}-${w}`}
                  className={
                    changed
                      ? 'px-2 py-0.5 rounded-lg bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-400/70'
                      : 'text-slate-100'
                  }
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Mission1Play({
  teacherShowAnswer,
  onRobotUpdate,
  onMissionComplete,
  onNextMission,
}: Mission1PlayProps) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario: Mission1Scenario = MISSION_1_SCENARIOS[scenarioIndex];

  const [inputValue, setInputValue] = useState('');
  const [attempts, setAttempts] = useState<ChatAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const firstAttemptInput = attempts.length > 0 ? attempts[0].input : '';
  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

  const handleSwitchScenario = (idx: number) => {
    if (completed) return;
    soundFX.playClick();
    setScenarioIndex(idx);
    setInputValue('');
    setAttempts([]);
    setErrorMsg(null);
    onRobotUpdate('surprised', MISSION_1_SCENARIOS[idx].robotPrompt);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = inputValue; // Never auto-correct before sending!
    if (!raw.trim() || isLoading || completed) return;

    soundFX.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    const attemptNumber = attempts.length + 1;
    const originalInput = attempts.length > 0 ? attempts[0].input : raw;

    try {
      const aiResult = await evaluateMission1({
        missionGoal: scenario.title,
        expectedExample: scenario.correctExample,
        originalInput,
        currentInput: raw,
        attemptNumber,
      });

      const nextAttempts = [
        ...attempts,
        { attemptNumber, input: raw, aiResult },
      ];
      setAttempts(nextAttempts);

      if (aiResult.passed) {
        soundFX.playCorrect();
        setCompleted(true);
        onRobotUpdate('happy', aiResult.robotReply);
        onMissionComplete(25);
      } else {
        soundFX.playWrong();
        onRobotUpdate(aiResult.robotMood || 'sad', aiResult.robotReply);
      }
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : 'Không thể kết nối tới Gemini AI. Bạn hãy kiểm tra mạng và thử lại nhé!';
      setErrorMsg(msg);
      onRobotUpdate('sad', 'Ôi! Tín hiệu mạng kết nối với bộ não AI của mình vừa bị chập chờn rồi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
            Nhiệm vụ 1: AI hiểu nhầm rồi!
          </h2>
          <p className="text-sm sm:text-base font-medium text-cyan-200">
            Gõ câu lệnh bằng bàn phím để trò chuyện với AIBOT (tích hợp Gemini AI thật)
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-cyan-500/30 self-start">
          {MISSION_1_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              type="button"
              disabled={completed}
              onClick={() => handleSwitchScenario(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer disabled:cursor-default ${
                scenarioIndex === idx
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tình huống {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Show fun illustration contrast for Tree vs Gas scenario */}
      {scenario.id === 'm1_tree' && (
        <ConfusionIllustrations
          sceneType="tree_vs_gas"
          correctCaption="Ý muốn đúng: Chăm sóc cây xanh"
          wrongCaption="Nếu gõ nhầm: Chăm sóc cây xăng"
          correctImage={GAME_IMAGES.cayXanh}
          wrongImage={GAME_IMAGES.cayXang}
          resolved={completed}
        />
      )}

      {/* Goal Banner + Quick Classroom Demo Chips */}
      <div className="rounded-2xl bg-slate-950/70 border border-cyan-400/40 p-4 space-y-2.5">
        <div className="font-bold text-cyan-50 text-base sm:text-lg">
          {scenario.goalHint}
        </div>
        {!completed && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-cyan-300">Thử nhanh trên máy chiếu:</span>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setInputValue(scenario.typoExample);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Điền câu gõ nhầm: “{scenario.typoExample}”
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setInputValue(scenario.correctExample);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Điền câu đúng: “{scenario.correctExample}”
            </button>
          </div>
        )}
      </div>

      {/* Teacher Mode: Reveal Answer & Pedagogical Explanation */}
      {teacherShowAnswer && (
        <div className="rounded-2xl bg-indigo-950/80 border-2 border-indigo-400/60 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm sm:text-base">
            <Eye className="w-5 h-5 text-indigo-300 shrink-0" />
            <span>Gợi ý dành cho Giáo viên:</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-white">
            Câu mẫu chuẩn: “{scenario.correctExample}”
          </p>
          <p className="text-sm font-medium text-indigo-100">{scenario.teacherExplanation}</p>
        </div>
      )}

      {/* Chat History & Gemini Feedback */}
      {attempts.length > 0 && (
        <div className="space-y-3">
          {attempts.map((att) => (
            <motion.div
              key={att.attemptNumber}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 p-4 space-y-2.5 ${
                att.aiResult.passed
                  ? 'bg-emerald-950/60 border-emerald-400/70'
                  : 'bg-amber-950/55 border-amber-400/70'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-300">
                <span>Lần gửi thứ {att.attemptNumber}</span>
                <span
                  className={
                    att.aiResult.passed ? 'text-emerald-300' : 'text-amber-300'
                  }
                >
                  {att.aiResult.passed ? 'AIBOT đã hiểu đúng' : 'AIBOT bị hiểu nhầm'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-950/80 border border-slate-700 px-4 py-2.5 text-base sm:text-lg font-bold text-white">
                Em đã gõ: “{att.input}”
              </div>

              <div className="space-y-1.5 text-sm sm:text-base">
                <div className="font-bold text-white flex items-start gap-2">
                  {att.aiResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span>{att.aiResult.robotReply}</span>
                </div>
                <p className="text-slate-200 font-medium pl-7">
                  <strong className="text-cyan-300">Cách AIBOT hiểu:</strong>{' '}
                  {att.aiResult.misunderstoodMeaning}
                </p>
                <p className="text-slate-200 font-medium pl-7">
                  <strong className="text-cyan-300">Phân tích:</strong>{' '}
                  {att.aiResult.differenceAnalysis}
                </p>
                {!att.aiResult.passed && att.aiResult.hintForNextTry && (
                  <p className="text-cyan-300 font-bold pl-7">
                    Gợi ý sửa lại: {att.aiResult.hintForNextTry}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Visual Diff Comparison between Attempt 1 and Revised Attempt */}
      {attempts.length >= 2 && latestAttempt && firstAttemptInput !== latestAttempt.input && (
        <WordDiffDisplay original={firstAttemptInput} revised={latestAttempt.input} />
      )}

      {/* Error Banner with Retry */}
      {errorMsg && (
        <div className="rounded-2xl bg-rose-950/75 border-2 border-rose-400 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-rose-100 font-bold text-sm sm:text-base">
            <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSend()}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Thử gửi lại</span>
          </button>
        </div>
      )}

      {/* Keyboard Input Chat Box */}
      {!completed ? (
        <form onSubmit={handleSend} className="space-y-2.5">
          <label
            htmlFor="mission1-chat-input"
            className="block text-sm sm:text-base font-bold text-cyan-200"
          >
            {attempts.length === 0
              ? 'Nhập câu lệnh của em bằng bàn phím:'
              : 'Chỉnh sửa lại câu lệnh cho đúng rồi gửi lại cho AIBOT:'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="mission1-chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              placeholder="Gõ câu lệnh tiếng Việt vào đây..."
              className="flex-1 rounded-2xl border-2 border-cyan-400/60 focus:border-cyan-300 focus:outline-none bg-slate-950/90 px-5 py-4 text-lg sm:text-xl font-bold text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-display font-extrabold text-lg sm:text-xl shadow-[0_5px_0_0_#0891B2] disabled:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>AIBOT đang đọc...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>GỬI CHO AIBOT</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-emerald-50">
            <Sparkles className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-display font-extrabold text-xl">
                Hoàn thành Nhiệm vụ 1! (+25 điểm & 1 Ngôi sao)
              </div>
              <p className="text-sm sm:text-base font-medium text-emerald-200">
                Bạn đã thấy tầm quan trọng của việc gõ đúng chính tả để AI không hiểu nhầm rồi nhé!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onNextMission();
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-extrabold text-lg shadow-[0_5px_0_0_#059669] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span>MỞ KHÓA NHIỆM VỤ 2</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
