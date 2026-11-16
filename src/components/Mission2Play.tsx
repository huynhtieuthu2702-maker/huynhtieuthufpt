import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  ArrowRight,
  Eye,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import {
  pickMission2Challenges,
  type FingerId,
  type Mission2Challenge,
  type RobotMood,
} from '../data/gameData';
import { KeyboardVisual } from './KeyboardVisual';
import { soundFX } from '../utils/sound';

interface Mission2PlayProps {
  teacherShowAnswer: boolean;
  isPaused: boolean;
  onRobotUpdate: (mood: RobotMood, message: string) => void;
  onMissionComplete: (earnedPoints: number) => void;
  onNextMission: () => void;
}

export function Mission2Play({
  teacherShowAnswer,
  isPaused,
  onRobotUpdate,
  onMissionComplete,
  onNextMission,
}: Mission2PlayProps) {
  const [challenges] = useState<Mission2Challenge[]>(() => pickMission2Challenges());
  const [idx, setIdx] = useState(0);
  const [correctFlashKey, setCorrectFlashKey] = useState<string | null>(null);
  const [wrongFlashKey, setWrongFlashKey] = useState<string | null>(null);
  const [correctFlashRow, setCorrectFlashRow] = useState<'top' | 'home' | 'bottom' | 'none'>('none');
  const [correctFlashFinger, setCorrectFlashFinger] = useState<FingerId | null>(null);
  const [wrongFlashFinger, setWrongFlashFinger] = useState<FingerId | null>(null);
  const [stepSolved, setStepSolved] = useState(false);
  const [mistakesInCurrent, setMistakesInCurrent] = useState(false);
  const [scoreAccumulated, setScoreAccumulated] = useState(0);
  const [missionDone, setMissionDone] = useState(false);

  const current = challenges[idx];

  const handleSuccess = useCallback(
    (msg: string) => {
      soundFX.playCorrect();
      setStepSolved(true);
      const pts = mistakesInCurrent ? 2 : 4;
      const nextTotal = Math.min(25, scoreAccumulated + pts);
      setScoreAccumulated(nextTotal);
      onRobotUpdate('happy', msg);
    },
    [mistakesInCurrent, onRobotUpdate, scoreAccumulated]
  );

  const handleKeyInteraction = useCallback(
    (keyId: string, row: 'number' | 'top' | 'home' | 'bottom' | 'space') => {
      if (stepSolved || missionDone || isPaused) return;

      if (current.type === 'select_row') {
        if (row === current.targetRow && keyId !== 'ENTER' && keyId !== 'BACKSPACE') {
          setCorrectFlashRow(current.targetRow);
          setWrongFlashKey(null);
          handleSuccess(`Chính xác! Phím ${keyId} nằm ở đúng hàng phím cần tìm!`);
        } else {
          soundFX.playWrong();
          setMistakesInCurrent(true);
          setWrongFlashKey(keyId);
          setTimeout(() => setWrongFlashKey(null), 500);
          onRobotUpdate('sad', `Phím ${keyId} không nằm ở hàng phím đó rồi! Bạn thử nhìn kỹ lại xem.`);
        }
        return;
      }

      if (current.type === 'find_key') {
        if (keyId === current.targetKey) {
          setCorrectFlashKey(keyId);
          setWrongFlashKey(null);
          handleSuccess(`Tuyệt vời! Bạn đã tìm đúng phím ${keyId} trên hàng phím cơ sở!`);
        } else {
          soundFX.playWrong();
          setMistakesInCurrent(true);
          setWrongFlashKey(keyId);
          setTimeout(() => setWrongFlashKey(null), 500);
          onRobotUpdate('sad', `Bạn vừa bấm phím ${keyId}, chưa phải phím ${current.targetKey} rồi!`);
        }
      }
    },
    [current, handleSuccess, isPaused, missionDone, onRobotUpdate, stepSolved]
  );

  const handleFingerClick = (fingerId: FingerId, label: string) => {
    if (stepSolved || missionDone || isPaused || current.type !== 'select_finger') return;

    if (fingerId === current.targetFinger) {
      setCorrectFlashFinger(fingerId);
      setWrongFlashFinger(null);
      handleSuccess(`Xuất sắc! ${label} chính là ngón tay dùng để gõ phím ${current.targetKey}!`);
    } else {
      soundFX.playWrong();
      setMistakesInCurrent(true);
      setWrongFlashFinger(fingerId);
      setTimeout(() => setWrongFlashFinger(null), 500);
      onRobotUpdate('sad', `Bạn vừa chọn ${label}, thử chọn ngón tay tương ứng với phím ${current.targetKey} nhé!`);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (stepSolved || missionDone || isPaused) return;
      if (current.type === 'select_finger') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const upper = e.key === ';' ? ';' : e.key.toUpperCase();
      let row: 'number' | 'top' | 'home' | 'bottom' | 'space' = 'home';
      if ('1234567890'.includes(upper)) row = 'number';
      else if ('QWERTYUIOP'.includes(upper)) row = 'top';
      else if ('ASDFGHJKL;'.includes(upper)) row = 'home';
      else if ('ZXCVBNM,./'.includes(upper)) row = 'bottom';
      else if (upper === ' ') row = 'space';
      else return;

      const normalizedId = upper === ' ' ? 'SPACE' : upper;
      handleKeyInteraction(normalizedId, row);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current.type, handleKeyInteraction, isPaused, missionDone, stepSolved]);

  const handleNextChallenge = () => {
    soundFX.playClick();
    if (idx + 1 < challenges.length) {
      setIdx(idx + 1);
      setCorrectFlashKey(null);
      setWrongFlashKey(null);
      setCorrectFlashRow('none');
      setCorrectFlashFinger(null);
      setWrongFlashFinger(null);
      setStepSolved(false);
      setMistakesInCurrent(false);
      onRobotUpdate('surprised', 'Cùng qua thử thách gõ phím tiếp theo nào!');
    } else {
      setMissionDone(true);
      soundFX.playStageClear();
      const finalScore = Math.max(15, Math.min(25, scoreAccumulated + 1));
      onRobotUpdate(
        'happy',
        'Hoan hô! Nhờ các bạn dạy, AIBOT đã nhớ hết các hàng phím và cách đặt ngón tay chuẩn rồi!'
      );
      onMissionComplete(finalScore);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide">
            Nhiệm vụ 2: Dạy Robot gõ phím
          </h2>
          <p className="text-sm sm:text-base font-medium text-cyan-200">
            Tương tác trực tiếp trên bàn phím minh họa (hoặc gõ từ bàn phím thật)
          </p>
        </div>
        <div className="font-display font-bold text-base sm:text-lg text-cyan-300 tabular-nums">
          Vòng {idx + 1} / {challenges.length}
        </div>
      </div>

      {!missionDone ? (
        <>
          <div className="rounded-2xl bg-slate-950/70 border border-cyan-400/40 p-4 sm:p-5 flex items-start gap-3">
            <Keyboard className="w-7 h-7 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-lg sm:text-xl font-bold text-white">
                {current.prompt}
              </div>
              <div className="text-sm font-semibold text-cyan-300">
                {current.type === 'select_finger'
                  ? 'Bấm chọn trực tiếp vào ngón tay trên sơ đồ hai bàn tay bên dưới bàn phím.'
                  : 'Bấm chuột trực tiếp vào phím trên màn hình hoặc nhấn phím thật trên bàn phím!'}
              </div>
            </div>
          </div>

          {teacherShowAnswer && (
            <div className="rounded-2xl bg-indigo-950/80 border-2 border-indigo-400/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm sm:text-base">
                <Eye className="w-5 h-5 text-indigo-300 shrink-0" />
                <span>Đáp án dành cho Giáo viên: {current.teacherAnswer}</span>
              </div>
              <p className="text-sm font-medium text-indigo-100">{current.explanation}</p>
            </div>
          )}

          <KeyboardVisual
            highlightRow={correctFlashRow}
            highlightKey={current.type === 'select_finger' ? current.targetKey : undefined}
            correctFlashKey={correctFlashKey}
            wrongFlashKey={wrongFlashKey}
            showHands={current.type === 'select_finger'}
            correctFlashFinger={correctFlashFinger}
            wrongFlashFinger={wrongFlashFinger}
            interactiveKeys={current.type !== 'select_finger'}
            interactiveFingers={current.type === 'select_finger'}
            onKeyClick={handleKeyInteraction}
            onFingerClick={handleFingerClick}
            disabled={stepSolved}
          />

          {stepSolved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-lg text-emerald-300">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>Chính xác!</span>
                </div>
                <p className="text-base font-medium text-emerald-50">{current.explanation}</p>
              </div>
              <button
                type="button"
                onClick={handleNextChallenge}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold text-lg shadow-[0_4px_0_0_#0891B2] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>{idx + 1 < challenges.length ? 'Thử thách tiếp theo' : 'Hoàn thành Nhiệm vụ 2'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-emerald-950/70 border-2 border-emerald-400 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-emerald-50">
            <Sparkles className="w-9 h-9 text-emerald-400 shrink-0" />
            <div>
              <div className="font-display font-extrabold text-2xl">
                Hoàn thành Nhiệm vụ 2! (+{Math.max(15, Math.min(25, scoreAccumulated + 1))} điểm & 1 Ngôi sao)
              </div>
              <p className="text-base font-medium text-emerald-200">
                AIBOT đã thuộc lòng vị trí các hàng phím và ngón tay đặt lên hàng phím cơ sở rồi!
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
            <span>MỞ KHÓA NHIỆM VỤ 3</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
