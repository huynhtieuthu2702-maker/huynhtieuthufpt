import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Eye,
  EyeOff,
  Users,
  Plus,
  Minus,
  GraduationCap,
} from 'lucide-react';
import type { MissionId, TeamInfo } from '../data/gameData';
import { soundFX } from '../utils/sound';

interface TeacherControlBarProps {
  visible: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  showAnswer: boolean;
  onToggleShowAnswer: () => void;
  activeMission: MissionId;
  onJumpMission: (missionId: MissionId) => void;
  onJumpSummary: () => void;
  teamMode: boolean;
  onToggleTeamMode: () => void;
  teams: TeamInfo[];
  activeTeamId: string;
  onSelectActiveTeam: (teamId: string) => void;
  onRenameTeam: (teamId: string, name: string) => void;
  onAdjustTeamScore: (teamId: string, delta: number) => void;
}

export function TeacherControlBar({
  visible,
  isFullscreen,
  onToggleFullscreen,
  isPaused,
  onTogglePause,
  showAnswer,
  onToggleShowAnswer,
  activeMission,
  onJumpMission,
  onJumpSummary,
  teamMode,
  onToggleTeamMode,
  teams,
  activeTeamId,
  onSelectActiveTeam,
  onRenameTeam,
  onAdjustTeamScore,
}: TeacherControlBarProps) {
  if (!visible) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white border-b border-indigo-400/40 px-4 sm:px-6 lg:px-8 py-3">
      <div className="w-full space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display font-bold text-cyan-200 text-sm sm:text-base">
            <GraduationCap className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Bảng điều khiển Giáo viên</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Chuyển nhanh:</span>
            {([1, 2, 3, 4] as MissionId[]).map((mId) => (
              <button
                key={mId}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onJumpMission(mId);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activeMission === mId
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                NV {mId}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onJumpSummary();
              }}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Tổng kết
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onToggleShowAnswer();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showAnswer
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700'
              }`}
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onTogglePause();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onToggleTeamMode();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                teamMode
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{teamMode ? 'Chế độ Đội: Bật' : 'Chơi theo đội'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onToggleFullscreen();
              }}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Thu gọn</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Toàn màn hình</span>
                </>
              )}
            </button>
          </div>
        </div>

        {teamMode && (
          <div className="pt-2 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {teams.map((team) => {
              const isTurn = team.id === activeTeamId;
              return (
                <div
                  key={team.id}
                  onClick={() => onSelectActiveTeam(team.id)}
                  className={`rounded-xl px-3 py-2 border-2 flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isTurn
                      ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-slate-950/60 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isTurn && (
                        <span className="text-[11px] font-extrabold text-amber-300 uppercase whitespace-nowrap">
                          Đang lượt ·
                        </span>
                      )}
                      <input
                        type="text"
                        value={team.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onRenameTeam(team.id, e.target.value)}
                        aria-label={`Tên ${team.name}`}
                        className="bg-transparent border-b border-transparent focus:border-cyan-400 focus:outline-none text-sm font-bold text-white w-full truncate"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        onAdjustTeamScore(team.id, -5);
                      }}
                      aria-label={`Trừ 5 điểm ${team.name}`}
                      className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-display font-extrabold text-lg text-amber-300 tabular-nums min-w-[36px] text-center">
                      {team.score}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        onAdjustTeamScore(team.id, 5);
                      }}
                      aria-label={`Cộng 5 điểm ${team.name}`}
                      className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
