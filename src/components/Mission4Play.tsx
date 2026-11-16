import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  RotateCw,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Trophy,
  WifiOff,
  Bot,
} from 'lucide-react';
import { MISSION_4_TASKS, type RobotMood } from '../data/gameData';
import {
  evaluateMission4,
  type Mission4ApiResponse,
  ApiRequestError,
} from '../utils/api';
import { soundFX } from '../utils/sound';

interface Mission4PlayProps {
  teacherShowAnswer: boolean;
  onRobotUpdate: (mood: RobotMood, message: string) => void;
  onMissionComplete: (earnedPoints: number) => void;
  onFinishGame: () => void;
}

export function Mission4Play({
  teacherShowAnswer,
  onRobotUpdate,
  onMissionComplete,
  onFinishGame,
}: Mission4PlayProps) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = MISSION_4_TASKS[taskIndex];

  const [commandInput, setCommandInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Mission4ApiResponse | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleSwitchTask = (idx: number) => {
    if (completed || isLoading) return;
    soundFX.playClick();
    setTaskIndex(idx);
    setCommandInput('');
    setAiResult(null);
    setErrorMsg(null);
    onRobotUpdate('surprised', MISSION_4_TASKS[idx].promptGoal);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim() || isLoading || completed) return;

    soundFX.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await evaluateMission4({
        missionTopic: task.promptGoal,
        userCommand: commandInput,
      });

      setAiResult(result);

      if (result.passed) {
        soundFX.playCorrect();
        setCompleted(true);
        onRobotUpdate(
          'happy',
          'Tuyệt đỉnh! Câu lệnh của bạn rất rõ ràng, đúng chính tả và dễ hiểu. AIBOT đã khôi phục hoàn toàn năng lượng!'
        );
        onMissionComplete(25);
      } else {
        soundFX.playWrong();
        onRobotUpdate(
          result.robotMood || 'sad',
          'Câu lệnh cần chỉnh thêm một chút nữa để AIBOT thực hiện thật chuẩn nhé!'
        );
      }
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : 'Không thể kết nối tới Gemini AI. Bạn hãy kiểm tra mạng và thử lại nhé!';
      setErrorMsg(msg);
      onRobotUpdate('sad', 'Ôi, tín hiệu AI vừa bị ngắt quãng rồi. Bạn bấm gửi lại thử xem nhé!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
            Nhiệm vụ 4: Huấn luyện trợ lý AI
          </h2>
          <p className="text-sm sm:text-base font-medium text-cyan-200">
            Tự nhập một câu lệnh hoàn chỉnh, rõ ràng và đúng chính tả để giao nhiệm vụ cho AIBOT
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-cyan-500/30 self-start">
          {MISSION_4_TASKS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              disabled={completed}
              onClick={() => handleSwitchTask(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer disabled:cursor-default ${
                taskIndex === idx
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Đề bài {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Card */}
      <div className="rounded-2xl bg-slate-950/75 border border-cyan-400/40 p-5 space-y-2">
        <div className="font-display font-bold text-lg sm:text-xl text-cyan-300">
          {task.title}
        </div>
        <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {task.promptGoal}
        </p>
      </div>

      {/* Teacher Mode Sample Answer */}
      {teacherShowAnswer && (
        <div className="rounded-2xl bg-indigo-950/80 border-2 border-indigo-400/60 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm sm:text-base">
            <Eye className="w-5 h-5 text-indigo-300 shrink-0" />
            <span>Câu lệnh mẫu dành cho Giáo viên:</span>
          </div>
          <p className="text-base font-bold text-white">“{task.sampleCommand}”</p>
          <p className="text-sm font-medium text-indigo-100">{task.teacherExplanation}</p>
        </div>
      )}

      {/* Student Input Form */}
      {!completed && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label
            htmlFor="mission4-command"
            className="block text-sm sm:text-base font-bold text-cyan-200"
          >
            Nhập câu lệnh giao nhiệm vụ cho AIBOT:
          </label>
          <textarea
            id="mission4-command"
            rows={2}
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            placeholder="Ví dụ: Hãy viết 3 việc làm giúp bảo vệ cây xanh trong trường học."
            className="w-full rounded-2xl border-2 border-cyan-400/60 focus:border-cyan-300 focus:outline-none bg-slate-950/90 px-5 py-3.5 text-lg sm:text-xl font-bold text-white placeholder:text-slate-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCommandInput(task.sampleCommand);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Điền câu mẫu tham khảo
            </button>

            <button
              type="submit"
              disabled={isLoading || !commandInput.trim()}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-display font-extrabold text-lg shadow-[0_5px_0_0_#0891B2] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Gemini đang đánh giá...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>GỬI LỆNH HUẤN LUYỆN</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error Box */}
      {errorMsg && (
        <div className="rounded-2xl bg-rose-950/75 border-2 border-rose-400 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-rose-100 font-bold text-sm sm:text-base">
            <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Thử gửi lại</span>
          </button>
        </div>
      )}

      {/* Gemini 3-Criteria Evaluation + Execution Result */}
      {aiResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                title: '1. Câu lệnh rõ ràng?',
                ok: aiResult.isClear,
                note: aiResult.clarityNote,
              },
              {
                title: '2. Đúng chính tả?',
                ok: aiResult.spellingOk,
                note: aiResult.spellingNote,
              },
              {
                title: '3. Dễ hiểu với lớp 3?',
                ok: aiResult.easyToUnderstand,
                note: aiResult.understandabilityNote,
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border-2 p-4 space-y-1.5 ${
                  item.ok
                    ? 'bg-emerald-950/60 border-emerald-400/70 text-emerald-50'
                    : 'bg-amber-950/60 border-amber-400/70 text-amber-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-bold text-sm sm:text-base">
                  <span>{item.title}</span>
                  {item.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </div>
                <p className="text-sm font-medium leading-snug text-slate-200">{item.note}</p>
              </div>
            ))}
          </div>

          <div
            className={`rounded-2xl border-2 p-5 space-y-3 ${
              aiResult.passed
                ? 'bg-cyan-950/60 border-cyan-400/60'
                : 'bg-amber-950/50 border-amber-400/60'
            }`}
          >
            <div className="flex items-center gap-2 font-display font-bold text-lg text-white">
              <Bot className="w-6 h-6 text-cyan-400 shrink-0" />
              <span>
                {aiResult.passed
                  ? 'AIBOT thực hiện nhiệm vụ bạn giao:'
                  : 'Nhận xét của AIBOT:'}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-cyan-100">
              {aiResult.evaluationSummary}
            </p>
            <div className="rounded-xl bg-slate-950/85 border border-cyan-400/30 p-4 text-base sm:text-lg font-semibold text-white whitespace-pre-line leading-relaxed">
              {aiResult.aiExecutionResponse}
            </div>
          </div>

          {completed && (
            <div className="rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-emerald-50">
                <Sparkles className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-display font-extrabold text-xl">
                    Hoàn thành Nhiệm vụ 4! (+25 điểm & Ngôi sao cuối cùng)
                  </div>
                  <p className="text-sm sm:text-base font-medium text-emerald-200">
                    Bạn đã thu thập đủ 4 ngôi sao giải cứu AIBOT rồi!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onFinishGame();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-extrabold text-xl shadow-[0_5px_0_0_#059669] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Trophy className="w-6 h-6" />
                <span>KHÔI PHỤC AIBOT NGAY!</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
