import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot } from 'lucide-react';
import type { RobotMood } from '../data/gameData';
import { GAME_IMAGES } from '../assets/images';

interface RobotMascotProps {
  mood: RobotMood;
  message: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'row' | 'column';
}

const MOOD_IMAGES: Record<RobotMood, string> = {
  happy: GAME_IMAGES.robotHappy,
  sad: GAME_IMAGES.robotSad,
  surprised: GAME_IMAGES.robotSurprised,
};

const MOOD_ALTS: Record<RobotMood, string> = {
  happy: 'Robot AIBOT vui vẻ vẫy tay chào',
  sad: 'Robot AIBOT đang bối rối vì dữ liệu lỗi',
  surprised: 'Robot AIBOT ngạc nhiên thích thú',
};

const MOOD_BUBBLE_STYLES: Record<RobotMood, string> = {
  happy: 'bg-emerald-950/75 border-emerald-400/60 text-emerald-50',
  sad: 'bg-amber-950/75 border-amber-400/60 text-amber-50',
  surprised: 'bg-slate-900/90 border-cyan-400/60 text-cyan-50',
};

const MOOD_RING_STYLES: Record<RobotMood, string> = {
  happy: 'border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.45)]',
  sad: 'border-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.4)]',
  surprised: 'border-cyan-400 shadow-[0_0_28px_rgba(34,211,238,0.45)]',
};

export function RobotMascot({
  mood,
  message,
  label,
  size = 'md',
  layout = 'row',
}: RobotMascotProps) {
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const imgDimensions =
    size === 'lg'
      ? 'w-44 h-44 sm:w-52 sm:h-52'
      : size === 'sm'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : 'w-32 h-32 sm:w-40 sm:h-40';

  const currentSrc = MOOD_IMAGES[mood];

  return (
    <div
      className={`flex items-center gap-4 ${
        layout === 'column' ? 'flex-col text-center' : 'flex-col sm:flex-row'
      }`}
    >
      <motion.div
        key={mood}
        initial={{ scale: 0.92, opacity: 0.85 }}
        animate={
          mood === 'sad'
            ? { scale: 1, opacity: 1, rotate: [0, -2, 2, 0] }
            : mood === 'surprised'
            ? { scale: [0.95, 1.05, 1], opacity: 1 }
            : { scale: 1, opacity: 1, y: [0, -5, 0] }
        }
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`relative shrink-0 ${imgDimensions} rounded-3xl overflow-hidden bg-sky-100 border-2 ${MOOD_RING_STYLES[mood]}`}
      >
        {!imgFailed[currentSrc] ? (
          <img
            src={currentSrc}
            alt={MOOD_ALTS[mood]}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed((prev) => ({ ...prev, [currentSrc]: true }))}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-600 text-white p-3 text-center">
            <Bot className="w-12 h-12 mb-1" />
            <span className="text-xs font-bold">AIBOT</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full flex-1 rounded-2xl border-2 px-4 py-3.5 shadow-lg ${MOOD_BUBBLE_STYLES[mood]}`}
        >
          {label && (
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
              {label}
            </div>
          )}
          <p className="text-sm sm:text-base font-semibold leading-relaxed tracking-wide">
            {message}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
