import { useState } from 'react';
import { CheckCircle2, AlertTriangle, TreePine, Fuel } from 'lucide-react';
import type { ConfusionSceneType } from '../data/gameData';

interface ConfusionIllustrationsProps {
  sceneType: ConfusionSceneType;
  correctCaption: string;
  wrongCaption: string;
  correctImage?: string;
  wrongImage?: string;
  resolved: boolean;
}

export function ConfusionIllustrations({
  sceneType,
  correctCaption,
  wrongCaption,
  correctImage,
  wrongImage,
  resolved,
}: ConfusionIllustrationsProps) {
  const [imgErr, setImgErr] = useState<{ correct?: boolean; wrong?: boolean }>({});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Wrong Interpretation */}
      <div
        className={`rounded-2xl border-2 p-3 transition-all duration-200 ${
          resolved
            ? 'bg-slate-800/60 border-slate-700 opacity-75'
            : 'bg-amber-950/45 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
        }`}
      >
        <div className="flex items-center gap-2 mb-2 text-amber-200 font-bold text-sm sm:text-base">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>{wrongCaption}</span>
        </div>
        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 border border-amber-400/40">
          {wrongImage && !imgErr.wrong ? (
            <img
              src={wrongImage}
              alt={wrongCaption}
              referrerPolicy="no-referrer"
              onError={() => setImgErr((p) => ({ ...p, wrong: true }))}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-amber-950 text-amber-200">
              <Fuel className="w-12 h-12 mb-2" />
              <span className="font-bold">Cây xăng</span>
            </div>
          )}
        </div>
      </div>

      {/* Intended Interpretation */}
      <div
        className={`rounded-2xl border-2 p-3 transition-all duration-200 ${
          resolved
            ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.3)]'
            : 'bg-cyan-950/45 border-cyan-400/60'
        }`}
      >
        <div className="flex items-center gap-2 mb-2 text-emerald-200 font-bold text-sm sm:text-base">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{correctCaption}</span>
        </div>
        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 border border-cyan-400/40">
          {correctImage && !imgErr.correct ? (
            <img
              src={correctImage}
              alt={correctCaption}
              referrerPolicy="no-referrer"
              onError={() => setImgErr((p) => ({ ...p, correct: true }))}
              className="w-full h-full object-cover"
            />
          ) : sceneType === 'tree_vs_gas' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950 text-emerald-200">
              <TreePine className="w-12 h-12 mb-2" />
              <span className="font-bold">Cây xanh</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
