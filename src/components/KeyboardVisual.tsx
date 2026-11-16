import { CornerDownLeft, Delete } from 'lucide-react';
import type { FingerId } from '../data/gameData';
import { soundFX } from '../utils/sound';

interface KeyboardVisualProps {
  highlightRow?: 'top' | 'home' | 'bottom' | 'none';
  highlightKey?: string;
  correctFlashKey?: string | null;
  wrongFlashKey?: string | null;
  showHands?: boolean;
  highlightFinger?: FingerId;
  correctFlashFinger?: FingerId | null;
  wrongFlashFinger?: FingerId | null;
  interactiveKeys?: boolean;
  interactiveFingers?: boolean;
  onKeyClick?: (keyId: string, row: 'number' | 'top' | 'home' | 'bottom' | 'space') => void;
  onFingerClick?: (fingerId: FingerId, label: string) => void;
  disabled?: boolean;
}

interface KeyDef {
  id: string;
  label: string;
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  widthClass?: string;
  hasBump?: boolean;
}

const KEY_ROWS: KeyDef[][] = [
  [
    { id: '1', label: '1', row: 'number' },
    { id: '2', label: '2', row: 'number' },
    { id: '3', label: '3', row: 'number' },
    { id: '4', label: '4', row: 'number' },
    { id: '5', label: '5', row: 'number' },
    { id: '6', label: '6', row: 'number' },
    { id: '7', label: '7', row: 'number' },
    { id: '8', label: '8', row: 'number' },
    { id: '9', label: '9', row: 'number' },
    { id: '0', label: '0', row: 'number' },
    { id: 'BACKSPACE', label: 'Backspace', row: 'number', widthClass: 'w-24 sm:w-28' },
  ],
  [
    { id: 'Q', label: 'Q', row: 'top' },
    { id: 'W', label: 'W', row: 'top' },
    { id: 'E', label: 'E', row: 'top' },
    { id: 'R', label: 'R', row: 'top' },
    { id: 'T', label: 'T', row: 'top' },
    { id: 'Y', label: 'Y', row: 'top' },
    { id: 'U', label: 'U', row: 'top' },
    { id: 'I', label: 'I', row: 'top' },
    { id: 'O', label: 'O', row: 'top' },
    { id: 'P', label: 'P', row: 'top' },
  ],
  [
    { id: 'A', label: 'A', row: 'home' },
    { id: 'S', label: 'S', row: 'home' },
    { id: 'D', label: 'D', row: 'home' },
    { id: 'F', label: 'F', row: 'home', hasBump: true },
    { id: 'G', label: 'G', row: 'home' },
    { id: 'H', label: 'H', row: 'home' },
    { id: 'J', label: 'J', row: 'home', hasBump: true },
    { id: 'K', label: 'K', row: 'home' },
    { id: 'L', label: 'L', row: 'home' },
    { id: ';', label: ';', row: 'home' },
    { id: 'ENTER', label: 'Enter', row: 'home', widthClass: 'w-20 sm:w-24' },
  ],
  [
    { id: 'Z', label: 'Z', row: 'bottom' },
    { id: 'X', label: 'X', row: 'bottom' },
    { id: 'C', label: 'C', row: 'bottom' },
    { id: 'V', label: 'V', row: 'bottom' },
    { id: 'B', label: 'B', row: 'bottom' },
    { id: 'N', label: 'N', row: 'bottom' },
    { id: 'M', label: 'M', row: 'bottom' },
    { id: ',', label: ',', row: 'bottom' },
    { id: '.', label: '.', row: 'bottom' },
    { id: '/', label: '/', row: 'bottom' },
  ],
  [{ id: 'SPACE', label: 'Space (Phím cách)', row: 'space', widthClass: 'w-56 sm:w-72' }],
];

function HandGuide({
  highlightFinger,
  correctFlashFinger,
  wrongFlashFinger,
  interactiveFingers,
  onFingerClick,
  disabled,
}: {
  highlightFinger: FingerId;
  correctFlashFinger?: FingerId | null;
  wrongFlashFinger?: FingerId | null;
  interactiveFingers?: boolean;
  onFingerClick?: (fingerId: FingerId, label: string) => void;
  disabled?: boolean;
}) {
  const leftFingers: { id: FingerId; name: string; fullName: string; key: string; height: string }[] = [
    { id: 'left_pinky', name: 'Út trái', fullName: 'Ngón út tay trái', key: 'A', height: 'h-12 sm:h-14' },
    { id: 'left_ring', name: 'Áp út trái', fullName: 'Ngón áp út tay trái', key: 'S', height: 'h-14 sm:h-16' },
    { id: 'left_middle', name: 'Giữa trái', fullName: 'Ngón giữa tay trái', key: 'D', height: 'h-16 sm:h-20' },
    { id: 'left_index', name: 'Trỏ trái', fullName: 'Ngón trỏ tay trái', key: 'F', height: 'h-14 sm:h-16' },
  ];

  const rightFingers: { id: FingerId; name: string; fullName: string; key: string; height: string }[] = [
    { id: 'right_index', name: 'Trỏ phải', fullName: 'Ngón trỏ tay phải', key: 'J', height: 'h-14 sm:h-16' },
    { id: 'right_middle', name: 'Giữa phải', fullName: 'Ngón giữa tay phải', key: 'K', height: 'h-16 sm:h-20' },
    { id: 'right_ring', name: 'Áp út phải', fullName: 'Ngón áp út tay phải', key: 'L', height: 'h-14 sm:h-16' },
    { id: 'right_pinky', name: 'Út phải', fullName: 'Ngón út tay phải', key: ';', height: 'h-12 sm:h-14' },
  ];

  const renderFinger = (f: (typeof leftFingers)[number]) => {
    const isCorrect = correctFlashFinger === f.id;
    const isWrong = wrongFlashFinger === f.id;
    const isHighlighted = highlightFinger === f.id;

    let style =
      'bg-slate-800 border-cyan-500/40 text-cyan-100 hover:border-cyan-300 hover:bg-cyan-950/80';
    if (isCorrect) {
      style =
        'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.75)] scale-105';
    } else if (isWrong) {
      style = 'bg-rose-500 border-rose-300 text-white animate-gentle-shake';
    } else if (isHighlighted) {
      style = 'bg-cyan-400 border-cyan-200 text-slate-950 shadow-md scale-105';
    }

    return (
      <button
        key={f.id}
        type="button"
        disabled={!interactiveFingers || disabled}
        onClick={() => {
          if (interactiveFingers && onFingerClick && !disabled) {
            onFingerClick(f.id, f.fullName);
          }
        }}
        className={`flex flex-col items-center gap-1.5 ${
          interactiveFingers && !disabled ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div
          className={`w-12 sm:w-14 ${f.height} rounded-t-full border-2 flex flex-col items-center justify-end pb-2 transition-all ${style}`}
        >
          <span className="font-mono-key text-xs sm:text-sm font-bold">{f.key}</span>
        </div>
        <span
          className={`text-xs font-bold text-center leading-tight ${
            isCorrect
              ? 'text-emerald-300'
              : isWrong
              ? 'text-rose-300'
              : isHighlighted
              ? 'text-cyan-300'
              : 'text-slate-300'
          }`}
        >
          {f.name}
        </span>
      </button>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-cyan-500/25 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-cyan-500/30">
        <div className="text-xs font-bold uppercase tracking-wide text-cyan-300 text-center mb-3">
          Bàn tay trái
        </div>
        <div className="flex items-end justify-center gap-2.5 sm:gap-3">
          {leftFingers.map(renderFinger)}
        </div>
      </div>

      <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-cyan-500/30">
        <div className="text-xs font-bold uppercase tracking-wide text-cyan-300 text-center mb-3">
          Bàn tay phải
        </div>
        <div className="flex items-end justify-center gap-2.5 sm:gap-3">
          {rightFingers.map(renderFinger)}
        </div>
      </div>
    </div>
  );
}

export function KeyboardVisual({
  highlightRow = 'none',
  highlightKey,
  correctFlashKey,
  wrongFlashKey,
  showHands = false,
  highlightFinger = 'none',
  correctFlashFinger,
  wrongFlashFinger,
  interactiveKeys = false,
  interactiveFingers = false,
  onKeyClick,
  onFingerClick,
  disabled = false,
}: KeyboardVisualProps) {
  const handlePress = (key: KeyDef) => {
    soundFX.playClick();
    if (onKeyClick && interactiveKeys && !disabled) {
      onKeyClick(key.id, key.row);
    }
  };

  return (
    <div className="bg-slate-950/85 rounded-2xl border-2 border-cyan-500/35 p-3 sm:p-5 shadow-[inset_0_0_24px_rgba(6,182,212,0.12)]">
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
        {KEY_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-1 sm:gap-2">
            {row.map((k) => {
              const isRowHighlighted =
                highlightRow !== 'none' &&
                k.row === highlightRow &&
                k.id !== 'ENTER' &&
                k.id !== 'BACKSPACE';
              const isCorrectFlash = correctFlashKey === k.id;
              const isWrongFlash = wrongFlashKey === k.id;
              const isKeyHighlighted = highlightKey === k.id;

              let keyStyle =
                'bg-slate-800/95 text-slate-100 border-slate-600 shadow-[0_3px_0_0_#1E293B] hover:bg-cyan-950 hover:border-cyan-400 hover:text-cyan-200';

              if (isCorrectFlash) {
                keyStyle =
                  'bg-emerald-400 text-slate-950 border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.85)] scale-105';
              } else if (isWrongFlash) {
                keyStyle =
                  'bg-rose-500 text-white border-rose-300 shadow-[0_3px_0_0_#9F1239] animate-gentle-shake';
              } else if (isKeyHighlighted) {
                keyStyle =
                  'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.8)] scale-105';
              } else if (isRowHighlighted) {
                keyStyle =
                  'bg-emerald-400 text-slate-950 border-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.65)]';
              }

              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => handlePress(k)}
                  aria-label={`Phím ${k.label}`}
                  className={`relative ${
                    k.widthClass ?? 'w-9 sm:w-12 lg:w-13'
                  } h-11 sm:h-12 lg:h-13 rounded-xl border-2 font-mono-key text-xs sm:text-base font-bold flex items-center justify-center gap-1 transition-all active:translate-y-0.5 select-none ${keyStyle} ${
                    interactiveKeys && !disabled ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {k.id === 'BACKSPACE' && <Delete className="w-4 h-4 shrink-0" />}
                  {k.id === 'ENTER' && <CornerDownLeft className="w-4 h-4 shrink-0" />}
                  <span className="truncate px-1">{k.label}</span>
                  {k.hasBump && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-1 rounded-full ${
                        isRowHighlighted || isKeyHighlighted || isCorrectFlash
                          ? 'bg-slate-950'
                          : 'bg-cyan-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {showHands && (
        <HandGuide
          highlightFinger={highlightFinger}
          correctFlashFinger={correctFlashFinger}
          wrongFlashFinger={wrongFlashFinger}
          interactiveFingers={interactiveFingers}
          onFingerClick={onFingerClick}
          disabled={disabled}
        />
      )}
    </div>
  );
}
