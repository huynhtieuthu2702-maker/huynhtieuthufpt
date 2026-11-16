import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Trophy,
  Star,
  Lock,
  CheckCircle2,
  Keyboard,
  GraduationCap,
  ShieldCheck,
  Award,
  PauseCircle,
  Sparkles,
  Rocket,
} from 'lucide-react';
import {
  INITIAL_TEAMS,
  MISSION_1_SCENARIOS,
  MISSION_4_TASKS,
  getPlayerRank,
  pickNonRepeatingParagraph,
  type MissionId,
  type Mission3Paragraph,
  type RobotMood,
  type TeamInfo,
} from './data/gameData';
import { GalaxyBackground } from './components/GalaxyBackground';
import { RobotMascot } from './components/RobotMascot';
import { FireworksCanvas } from './components/FireworksCanvas';
import { TeacherControlBar } from './components/TeacherControlBar';
import { Mission1Play } from './components/Mission1Play';
import { Mission2Play } from './components/Mission2Play';
import { Mission3Play } from './components/Mission3Play';
import { Mission4Play } from './components/Mission4Play';
import { soundFX } from './utils/sound';
import { checkAiHealth } from './utils/api';

type AppScreen = 'START' | 'PLAYING' | 'FINAL_SUMMARY';

const MISSION_TITLES: Record<MissionId, { title: string; subtitle: string; introMsg: string }> = {
  1: {
    title: 'NV 1: AI hiểu nhầm rồi!',
    subtitle: 'Gõ câu lệnh trò chuyện với AIBOT và sửa lỗi gây hiểu nhầm',
    introMsg: MISSION_1_SCENARIOS[0].robotPrompt,
  },
  2: {
    title: 'NV 2: Dạy Robot gõ phím',
    subtitle: 'Nhận biết hàng phím, phím cơ sở A S D F J K L ; và ngón tay đặt phím',
    introMsg: 'Bộ nhớ bàn phím của mình bị xáo trộn rồi! Bạn hãy bấm lên hình bàn phím để dạy lại mình nhé!',
  },
  3: {
    title: 'NV 3: Thám tử dữ liệu',
    subtitle: 'Tìm lỗi chính tả trong đoạn văn và kiểm tra cùng Gemini AI',
    introMsg: 'Có mấy đoạn văn bị sai dấu nên mình không đọc được! Thám tử dữ liệu giúp mình tìm lỗi nhé!',
  },
  4: {
    title: 'NV 4: Huấn luyện trợ lý AI',
    subtitle: 'Tự viết câu lệnh hoàn chỉnh, rõ ràng để AIBOT thực hiện nhiệm vụ',
    introMsg: MISSION_4_TASKS[0].promptGoal,
  },
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('START');
  const [activeMission, setActiveMission] = useState<MissionId>(1);
  const [unlockedMissions, setUnlockedMissions] = useState<Record<MissionId, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
  });
  const [completedMissions, setCompletedMissions] = useState<Record<MissionId, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [missionScores, setMissionScores] = useState<Record<MissionId, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });
  const [playNonce, setPlayNonce] = useState(0);

  const [usedParagraphIds, setUsedParagraphIds] = useState<string[]>([]);
  const [currentParagraph, setCurrentParagraph] = useState<Mission3Paragraph>(() => {
    const initial = pickNonRepeatingParagraph([]);
    return initial.paragraph;
  });

  const [robotMood, setRobotMood] = useState<RobotMood>('sad');
  const [robotMessage, setRobotMessage] = useState(
    'Chào các bạn nhỏ! Mình là AIBOT. Vì nhận nhiều dữ liệu gõ sai quá nên bộ xử lý của mình đang bị lỗi. Hãy giúp mình vượt qua 4 nhiệm vụ để khôi phục hoạt động nhé!'
  );

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiAvailable, setAiAvailable] = useState(true);

  const [teacherModeOpen, setTeacherModeOpen] = useState(false);
  const [teacherShowAnswer, setTeacherShowAnswer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [teamMode, setTeamMode] = useState(false);
  const [teams, setTeams] = useState<TeamInfo[]>(INITIAL_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState<string>(INITIAL_TEAMS[0].id);

  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);

  useEffect(() => {
    checkAiHealth().then((status) => {
      setAiAvailable(status.ok && status.aiConfigured);
    });
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const totalScore = useMemo(
    () => missionScores[1] + missionScores[2] + missionScores[3] + missionScores[4],
    [missionScores]
  );

  const starsCount = useMemo(
    () => ([1, 2, 3, 4] as MissionId[]).filter((id) => completedMissions[id]).length,
    [completedMissions]
  );

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playClick();
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleRobotUpdate = (mood: RobotMood, message: string) => {
    setRobotMood(mood);
    setRobotMessage(message);
  };

  const startFreshGame = () => {
    soundFX.playClick();
    const { paragraph, nextUsedIds } = pickNonRepeatingParagraph(usedParagraphIds);
    setUsedParagraphIds(nextUsedIds);
    setCurrentParagraph(paragraph);

    setScreen('PLAYING');
    setActiveMission(1);
    setUnlockedMissions({ 1: true, 2: false, 3: false, 4: false });
    setCompletedMissions({ 1: false, 2: false, 3: false, 4: false });
    setMissionScores({ 1: 0, 2: 0, 3: 0, 4: 0 });
    setTeams(INITIAL_TEAMS.map((t) => ({ ...t, score: 0 })));
    setPlayNonce((n) => n + 1);
    setIsPaused(false);
    setUnlockNotice(null);
    setRobotMood('surprised');
    setRobotMessage(MISSION_TITLES[1].introMsg);
  };

  const handleMissionComplete = (missionId: MissionId, earnedPoints: number) => {
    const wasAlreadyDone = completedMissions[missionId];

    setCompletedMissions((prev) => ({ ...prev, [missionId]: true }));
    setMissionScores((prev) => ({
      ...prev,
      [missionId]: Math.max(prev[missionId], earnedPoints),
    }));

    if (teamMode && !wasAlreadyDone) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === activeTeamId ? { ...t, score: t.score + earnedPoints } : t
        )
      );
    }

    if (missionId < 4) {
      const nextId = (missionId + 1) as MissionId;
      setUnlockedMissions((prev) => ({ ...prev, [nextId]: true }));
      setUnlockNotice(`Đã nhận Ngôi sao Nhiệm vụ ${missionId} và mở khóa Nhiệm vụ ${nextId}!`);
    } else {
      setUnlockNotice('Đủ 4 Ngôi sao giải cứu! Sẵn sàng khôi phục AIBOT!');
    }
  };

  const goToMission = (missionId: MissionId, forceUnlock = false) => {
    if (!forceUnlock && !unlockedMissions[missionId]) return;
    soundFX.playClick();
    if (forceUnlock) {
      setUnlockedMissions((prev) => ({ ...prev, [missionId]: true }));
    }
    setActiveMission(missionId);
    setScreen('PLAYING');
    setUnlockNotice(null);
    setRobotMood('surprised');
    setRobotMessage(MISSION_TITLES[missionId].introMsg);
  };

  const handleFinishGame = () => {
    soundFX.playStageClear();
    setScreen('FINAL_SUMMARY');
    setUnlockNotice(null);
    setRobotMood('happy');
    setRobotMessage(
      'Cảm ơn các bạn! AIBOT đã được sửa chữa hoàn toàn rồi! Hãy luôn nhớ: Đặt tay ĐÚNG – Gõ phím ĐÚNG – Kiểm tra dữ liệu ĐÚNG trước khi gửi nhé!'
    );
  };

  const handleRequestNewParagraph = () => {
    const { paragraph, nextUsedIds } = pickNonRepeatingParagraph(usedParagraphIds);
    setUsedParagraphIds(nextUsedIds);
    setCurrentParagraph(paragraph);
    setRobotMood('surprised');
    setRobotMessage('Mình vừa đổi sang một đoạn văn mới rồi, thám tử cùng kiểm tra lỗi nhé!');
  };

  const rank = getPlayerRank(totalScore);
  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score),
    [teams]
  );

  return (
    <div className="relative min-h-screen w-full text-slate-50 flex flex-col">
      <GalaxyBackground />

      <FireworksCanvas
        active={screen === 'FINAL_SUMMARY'}
        intensity="grand"
      />

      {/* Full-Width Widescreen Top Command Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/35 px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_16px_rgba(34,211,238,0.6)]">
              <Keyboard className="w-6 h-6" />
            </div>
            <span className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight whitespace-nowrap">
              AI Cần Cứu Trợ!
            </span>
          </div>

          {/* Center Rescue Progress & Stars */}
          {screen !== 'START' && (
            <div className="flex-1 max-w-xl min-w-[220px] hidden lg:block">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-200 mb-1">
                <span>Tiến trình giải cứu AIBOT</span>
                <span className="tabular-nums flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{starsCount} / 4 sao</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300">{totalScore} / 100 điểm</span>
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${(starsCount / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {screen !== 'START' && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/60 font-display font-bold text-sm sm:text-base text-amber-300 tabular-nums whitespace-nowrap">
                {totalScore} điểm
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setTeacherModeOpen((v) => !v);
              }}
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                teacherModeOpen
                  ? 'bg-indigo-500 border-indigo-300 text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]'
                  : 'bg-slate-800 hover:bg-slate-700 border-indigo-400/40 text-indigo-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Chế độ Giáo viên</span>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh' : 'Đã tắt'}</span>
            </button>

            {screen !== 'START' && (
              <button
                type="button"
                onClick={startFreshGame}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Chơi lại</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Teacher Control Bar */}
      <TeacherControlBar
        visible={teacherModeOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        showAnswer={teacherShowAnswer}
        onToggleShowAnswer={() => setTeacherShowAnswer((s) => !s)}
        activeMission={activeMission}
        onJumpMission={(mId) => goToMission(mId, true)}
        onJumpSummary={handleFinishGame}
        teamMode={teamMode}
        onToggleTeamMode={() => setTeamMode((t) => !t)}
        teams={teams}
        activeTeamId={activeTeamId}
        onSelectActiveTeam={setActiveTeamId}
        onRenameTeam={(id, name) =>
          setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)))
        }
        onAdjustTeamScore={(id, delta) =>
          setTeams((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t
            )
          )
        }
      />

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 rounded-3xl border-2 border-cyan-400 p-8 sm:p-10 max-w-lg w-full text-center space-y-5 shadow-[0_0_50px_rgba(34,211,238,0.25)]">
            <PauseCircle className="w-16 h-16 text-cyan-400 mx-auto" />
            <h2 className="font-display font-extrabold text-3xl text-white">
              TRÒ CHƠI ĐANG TẠM DỪNG
            </h2>
            <p className="text-lg font-medium text-slate-200">
              Cả lớp cùng thảo luận với Thầy/Cô trước khi tiếp tục giải cứu AIBOT nhé!
            </p>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setIsPaused(false);
              }}
              className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold text-xl shadow-[0_5px_0_0_#0891B2] cursor-pointer"
            >
              TIẾP TỤC TRÒ CHƠI
            </button>
          </div>
        </div>
      )}

      {/* Full-Width Horizontal Laptop Stage */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 flex flex-col justify-center">
        {!aiAvailable && screen !== 'START' && (
          <div className="mb-4 rounded-2xl bg-amber-950/75 border border-amber-400/60 px-4 py-3 text-sm font-bold text-amber-100 flex flex-wrap items-center justify-between gap-2">
            <span>
              Lưu ý: Kết nối Gemini AI trên máy chủ hiện chưa sẵn sàng. Nhiệm vụ 2 (Dạy Robot gõ phím) vẫn hoạt động đầy đủ không cần AI!
            </span>
            <button
              type="button"
              onClick={() => goToMission(2, true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Chuyển sang Nhiệm vụ 2
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {screen === 'START' && (
            <motion.section
              key="start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              className="w-full bg-slate-900/80 backdrop-blur-md rounded-3xl border-2 border-cyan-400/35 shadow-[0_0_60px_rgba(6,182,212,0.14)] p-6 sm:p-8 lg:p-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Briefing Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-2">
                      <Rocket className="w-5 h-5 shrink-0" />
                      <span>Tin học Lớp 3 · Phiêu lưu giải cứu Robot cùng Gemini AI</span>
                    </p>
                    <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-6xl text-white tracking-tight">
                      AI CẦN CỨU TRỢ!
                    </h1>
                    <p className="text-base sm:text-lg font-medium text-slate-200 max-w-2xl leading-relaxed">
                      Robot AIBOT đang bị lỗi ngoài trạm vũ trụ vì nhận nhiều dữ liệu gõ sai. Hãy vượt qua 4 nhiệm vụ để thu thập 4 Ngôi sao và khôi phục AIBOT!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {([1, 2, 3, 4] as MissionId[]).map((mId) => (
                      <div
                        key={mId}
                        className="rounded-2xl bg-slate-950/75 border border-cyan-400/30 p-4 space-y-1"
                      >
                        <div className="font-display font-bold text-base text-cyan-300">
                          {MISSION_TITLES[mId].title}
                        </div>
                        <p className="text-sm font-medium text-slate-300 leading-snug">
                          {MISSION_TITLES[mId].subtitle}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={startFreshGame}
                      className="px-10 py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold text-2xl shadow-[0_6px_0_0_#0891B2,0_0_30px_rgba(34,211,238,0.4)] active:translate-y-1 transition-all inline-flex items-center gap-3 cursor-pointer"
                    >
                      <Play className="w-7 h-7 fill-current" />
                      <span>BẮT ĐẦU GIẢI CỨU</span>
                    </button>
                  </div>
                </div>

                {/* Right Holographic AIBOT Pod */}
                <div className="lg:col-span-5 bg-slate-950/75 rounded-3xl border border-cyan-400/35 p-6 flex flex-col items-center justify-center">
                  <RobotMascot
                    mood="sad"
                    layout="column"
                    label="Tín hiệu cấp cứu từ AIBOT"
                    message="Chào các bạn nhỏ! Mình là AIBOT. Vì nhận nhiều dữ liệu gõ sai quá nên bộ xử lý của mình đang bị lỗi. Hãy giúp mình vượt qua 4 nhiệm vụ nhé!"
                    size="lg"
                  />
                </div>
              </div>
            </motion.section>
          )}

          {screen === 'PLAYING' && (
            <motion.section
              key={`playing-${activeMission}-${playNonce}`}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
            >
              {/* Left Tactical Cockpit Column */}
              <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
                {/* Holographic Robot Card */}
                <div className="bg-slate-900/85 backdrop-blur-md rounded-3xl border-2 border-cyan-400/35 p-5 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
                  <RobotMascot
                    mood={robotMood}
                    layout="column"
                    label="Trạm điều khiển AIBOT"
                    message={robotMessage}
                    size="md"
                  />
                </div>

                {/* Vertical Mission Stepper (Horizontal 4-grid on smaller screens) */}
                <div className="bg-slate-900/85 backdrop-blur-md rounded-3xl border border-cyan-400/30 p-4 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 px-1">
                    Bản đồ 4 Nhiệm vụ
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {([1, 2, 3, 4] as MissionId[]).map((mId) => {
                      const isActive = mId === activeMission;
                      const isDone = completedMissions[mId];
                      const isUnlocked = unlockedMissions[mId];

                      return (
                        <button
                          key={mId}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => goToMission(mId)}
                          className={`rounded-2xl border px-3.5 py-2.5 text-left transition-all flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.4)]'
                              : isDone
                              ? 'bg-emerald-950/60 border-emerald-400/60 text-emerald-100 hover:bg-emerald-900/60 cursor-pointer'
                              : isUnlocked
                              ? 'bg-slate-800/80 border-cyan-400/40 text-white hover:bg-slate-800 cursor-pointer'
                              : 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-display font-bold text-xs sm:text-sm truncate">
                              {MISSION_TITLES[mId].title}
                            </div>
                            <div
                              className={`text-[11px] font-bold tabular-nums ${
                                isActive ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {missionScores[mId]} / 25 điểm
                            </div>
                          </div>
                          {isDone ? (
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                          ) : isUnlocked ? (
                            <CheckCircle2
                              className={`w-5 h-5 shrink-0 ${
                                isActive ? 'text-slate-950' : 'text-cyan-400'
                              }`}
                            />
                          ) : (
                            <Lock className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Right Widescreen Interactive Console */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                {unlockNotice && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-amber-400/15 border-2 border-amber-400/70 px-4 py-3 flex items-center gap-2.5 text-amber-200 font-bold text-sm sm:text-base"
                  >
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{unlockNotice}</span>
                  </motion.div>
                )}

                <div className="bg-slate-900/85 backdrop-blur-md rounded-3xl border-2 border-cyan-400/35 shadow-[0_0_40px_rgba(6,182,212,0.12)] p-5 sm:p-7">
                  {activeMission === 1 && (
                    <Mission1Play
                      key={`m1-${playNonce}`}
                      teacherShowAnswer={teacherShowAnswer}
                      onRobotUpdate={handleRobotUpdate}
                      onMissionComplete={(pts) => handleMissionComplete(1, pts)}
                      onNextMission={() => goToMission(2, true)}
                    />
                  )}

                  {activeMission === 2 && (
                    <Mission2Play
                      key={`m2-${playNonce}`}
                      teacherShowAnswer={teacherShowAnswer}
                      isPaused={isPaused}
                      onRobotUpdate={handleRobotUpdate}
                      onMissionComplete={(pts) => handleMissionComplete(2, pts)}
                      onNextMission={() => goToMission(3, true)}
                    />
                  )}

                  {activeMission === 3 && (
                    <Mission3Play
                      key={`m3-${playNonce}`}
                      paragraph={currentParagraph}
                      teacherShowAnswer={teacherShowAnswer}
                      onRobotUpdate={handleRobotUpdate}
                      onMissionComplete={(pts) => handleMissionComplete(3, pts)}
                      onNextMission={() => goToMission(4, true)}
                      onRequestNewParagraph={handleRequestNewParagraph}
                    />
                  )}

                  {activeMission === 4 && (
                    <Mission4Play
                      key={`m4-${playNonce}`}
                      teacherShowAnswer={teacherShowAnswer}
                      onRobotUpdate={handleRobotUpdate}
                      onMissionComplete={(pts) => handleMissionComplete(4, pts)}
                      onFinishGame={handleFinishGame}
                    />
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {screen === 'FINAL_SUMMARY' && (
            <motion.section
              key="final"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full bg-slate-900/85 backdrop-blur-md rounded-3xl border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(34,211,238,0.2)] p-6 sm:p-10 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 mb-1">
                  <Trophy className="w-9 h-9" />
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                  AIBOT ĐÃ ĐƯỢC KHÔI PHỤC HOÀN TOÀN!
                </h2>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {([1, 2, 3, 4] as MissionId[]).map((mId) => (
                    <Star
                      key={mId}
                      className={`w-8 h-8 ${
                        completedMissions[mId]
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6">
                  <RobotMascot
                    mood="happy"
                    label="Lời cảm ơn từ AIBOT"
                    message="Cảm ơn các bạn! Nhờ các bạn, mình đã hiểu đúng dữ liệu và hoạt động bình thường trở lại rồi. Hãy luôn nhớ: Đặt tay ĐÚNG – Gõ phím ĐÚNG – Kiểm tra dữ liệu ĐÚNG trước khi gửi nhé!"
                    size="lg"
                  />
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="rounded-2xl border-2 border-cyan-400/50 bg-slate-950/75 p-5 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                      <Award className="w-5 h-5" />
                      <span>Danh hiệu xuất sắc</span>
                    </div>
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-300">
                      {rank.title}
                    </div>
                    <div className="font-display font-extrabold text-4xl sm:text-5xl text-white tabular-nums pt-1">
                      {totalScore} / 100 điểm
                    </div>
                    <p className="text-sm font-bold text-emerald-300">
                      Hoàn thành {starsCount} / 4 nhiệm vụ giải cứu
                    </p>
                    <p className="text-sm font-medium text-slate-300">{rank.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {([1, 2, 3, 4] as MissionId[]).map((mId) => (
                      <div
                        key={mId}
                        className="rounded-2xl bg-slate-950/75 border border-cyan-400/30 p-3 text-center"
                      >
                        <div className="text-xs font-bold text-cyan-300 uppercase">
                          NV {mId}
                        </div>
                        <div className="font-display font-extrabold text-xl text-white tabular-nums mt-1">
                          {missionScores[mId]} / 25
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {teamMode && (
                <div className="rounded-2xl bg-slate-950/75 border border-indigo-400/40 p-5 space-y-3">
                  <div className="font-display font-bold text-lg text-indigo-200 text-center">
                    Bảng xếp hạng thi đua các Đội
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {sortedTeams.map((team, idx) => (
                      <div
                        key={team.id}
                        className="rounded-xl bg-slate-900 border border-indigo-400/40 p-3.5 flex items-center justify-between"
                      >
                        <div className="font-bold text-white">
                          Hạng {idx + 1}: {team.name}
                        </div>
                        <div className="font-display font-extrabold text-xl text-amber-300 tabular-nums">
                          {team.score} đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <div className="rounded-2xl bg-slate-950/70 border border-cyan-400/30 px-4 py-3 flex items-center gap-3 text-cyan-200 font-bold text-sm sm:text-base">
                  <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0" />
                  <span>
                    Quy tắc vàng: Đặt tay ĐÚNG – Gõ phím ĐÚNG – Kiểm tra dữ liệu ĐÚNG trước khi gửi!
                  </span>
                </div>

                <button
                  type="button"
                  onClick={startFreshGame}
                  className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-extrabold text-xl shadow-[0_6px_0_0_#0891B2] active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-6 h-6" />
                  <span>CHƠI LẠI VỚI CÂU HỎI MỚI</span>
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
