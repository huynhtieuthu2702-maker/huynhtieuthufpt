import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  Eye,
  SearchCheck,
  Sparkles,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import type { Mission3Paragraph, RobotMood } from '../data/gameData';
import {
  checkMission3,
  type Mission3ApiResponse,
  ApiRequestError,
} from '../utils/api';
import { soundFX } from '../utils/sound';

interface Mission3PlayProps {
  paragraph: Mission3Paragraph;
  teacherShowAnswer: boolean;
  onRobotUpdate: (mood: RobotMood, message: string) => void;
  onMissionComplete: (earnedPoints: number) => void;
  onNextMission: () => void;
  onRequestNewParagraph: () => void;
}

export function Mission3Play({
  paragraph,
  teacherShowAnswer,
  onRobotUpdate,
  onMissionComplete,
  onNextMission,
  onRequestNewParagraph,
}: Mission3PlayProps) {
  const [selectedTokenIndices, setSelectedTokenIndices] = useState<number[]>([]);
  const [rewrittenText, setRewrittenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Mission3ApiResponse | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setSelectedTokenIndices([]);
    setRewrittenText('');
    setAiResult(null);
    setErrorMsg(null);
    setCompleted(false);
  }, [paragraph.id]);

  const toggleToken = (index: number) => {
    if (completed || isLoading) return;
    soundFX.playClick();
    setSelectedTokenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || completed) return;

    const clickedWords = selectedTokenIndices.map((i) => paragraph.tokens[i]);
    const trimmedRewrite = rewrittenText.trim();

    if (clickedWords.length === 0 && !trimmedRewrite) {
      soundFX.playWrong();
      onRobotUpdate('surprised', 'Bạn hãy bấm vào các chữ bị sai trong đoạn văn hoặc nhập lại câu đúng nhé!');
      return;
    }

    const mode: 'click' | 'rewrite' | 'both' =
      clickedWords.length > 0 && trimmedRewrite
        ? 'both'
        : trimmedRewrite
        ? 'rewrite'
        : 'click';

    soundFX.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await checkMission3({
        faultyParagraph: paragraph.faultyText,
        correctReference: paragraph.correctText,
        clickedWords,
        rewrittenSentence: trimmedRewrite,
        mode,
      });

      setAiResult(result);

      if (result.isCorrect) {
        soundFX.playCorrect();
        setCompleted(true);
        onRobotUpdate('happy', result.feedback);
        onMissionComplete(25);
      } else {
        soundFX.playWrong();
        onRobotUpdate(result.robotMood || 'sad', result.feedback);
      }
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : 'Không thể kết nối tới Gemini AI để kiểm tra. Bạn thử gửi lại nhé!';
      setErrorMsg(msg);
      onRobotUpdate('sad', 'Kết nối tới Gemini AI tạm thời bị gián đoạn. Hãy bấm thử lại nhé!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
            Nhiệm vụ 3: Thám tử dữ liệu
          </h2>
          <p className="text-sm sm:text-base font-medium text-cyan-200">
            Tìm lỗi sai chính tả, sai dấu hoặc thiếu ký tự và kiểm tra cùng Gemini AI
          </p>
        </div>

        {!completed && (
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onRequestNewParagraph();
            }}
            className="self-start px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Đổi đoạn văn khác</span>
          </button>
        )}
      </div>

      {/* Paragraph with clickable words */}
      <div className="rounded-2xl bg-slate-950/75 border border-cyan-400/40 p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-cyan-200">
            <SearchCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{paragraph.title} — Bấm chọn các chữ bị gõ sai:</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-cyan-300 tabular-nums">
            Đã chọn: {selectedTokenIndices.length} từ
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-2 pt-1">
          {paragraph.tokens.map((token, index) => {
            const isPicked = selectedTokenIndices.includes(index);
            const isTrueError = paragraph.errorIndices.includes(index);

            let tokenClass =
              'bg-slate-800/90 border-slate-600 hover:border-cyan-400 hover:bg-cyan-950 text-white shadow-[0_2px_0_0_#1E293B]';

            if (completed) {
              if (isTrueError) {
                tokenClass =
                  'bg-emerald-500/25 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50';
              } else {
                tokenClass = 'bg-slate-900/50 border-transparent text-slate-300';
              }
            } else if (isPicked) {
              tokenClass =
                'bg-amber-400 border-amber-200 text-slate-950 ring-2 ring-amber-300/60';
            }

            return (
              <button
                key={`${index}-${token}`}
                type="button"
                disabled={completed}
                onClick={() => toggleToken(index)}
                className={`px-3 py-1.5 rounded-xl border-2 text-lg sm:text-xl font-bold transition-all cursor-pointer disabled:cursor-default ${tokenClass}`}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>

      {/* Teacher Mode Answer Reveal */}
      {teacherShowAnswer && (
        <div className="rounded-2xl bg-indigo-950/80 border-2 border-indigo-400/60 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm sm:text-base">
            <Eye className="w-5 h-5 text-indigo-300 shrink-0" />
            <span>Đáp án dành cho Giáo viên:</span>
          </div>
          <p className="text-base font-bold text-white">
            Câu đúng: “{paragraph.correctText}”
          </p>
          <p className="text-sm font-medium text-indigo-100">{paragraph.explanation}</p>
        </div>
      )}

      {/* Optional / Combined Rewrite Box */}
      {!completed && (
        <form onSubmit={handleCheck} className="space-y-3">
          <label
            htmlFor="mission3-rewrite"
            className="block text-sm sm:text-base font-bold text-cyan-200"
          >
            Nhập lại câu đã sửa đúng hoàn chỉnh (hoặc bấm trực tiếp các từ sai ở trên rồi kiểm tra):
          </label>
          <textarea
            id="mission3-rewrite"
            rows={2}
            value={rewrittenText}
            onChange={(e) => setRewrittenText(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            placeholder="Ví dụ: Em có thể gõ lại cả câu đã sửa đúng vào đây..."
            className="w-full rounded-2xl border-2 border-cyan-400/60 focus:border-cyan-300 focus:outline-none bg-slate-950/90 px-5 py-3.5 text-lg font-bold text-white placeholder:text-slate-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setRewrittenText(paragraph.faultyText);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm cursor-pointer"
            >
              Chép nhanh câu gốc xuống để sửa
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-display font-extrabold text-lg shadow-[0_5px_0_0_#0891B2] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Gemini đang kiểm tra...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>KIỂM TRA VỚI GEMINI</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="rounded-2xl bg-rose-950/75 border-2 border-rose-400 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-rose-100 font-bold text-sm sm:text-base">
            <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCheck()}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Thử kiểm tra lại</span>
          </button>
        </div>
      )}

      {/* Gemini Evaluation Feedback */}
      {aiResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 p-5 space-y-3 ${
            aiResult.isCorrect
              ? 'bg-emerald-950/70 border-emerald-400 text-emerald-50'
              : 'bg-amber-950/60 border-amber-400 text-amber-50'
          }`}
        >
          <div className="flex items-center gap-2.5 font-display font-extrabold text-xl">
            {aiResult.isCorrect ? (
              <>
                <Sparkles className="w-7 h-7 text-emerald-400 shrink-0" />
                <span>Chính xác! Hoàn thành Nhiệm vụ 3 (+25 điểm & 1 Ngôi sao)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <span>Thám tử kiểm tra lại thêm chút nữa nhé!</span>
              </>
            )}
          </div>

          <p className="text-base font-semibold">{aiResult.feedback}</p>

          {aiResult.errorBreakdown.length > 0 && (
            <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base font-medium text-slate-200">
              {aiResult.errorBreakdown.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          {aiResult.isCorrect && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-emerald-500/30">
              <div className="text-sm sm:text-base font-bold text-emerald-200">
                Đoạn văn chuẩn: “{aiResult.correctedParagraph || paragraph.correctText}”
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onNextMission();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-extrabold text-lg shadow-[0_5px_0_0_#059669] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>MỞ KHÓA NHIỆM VỤ 4</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
