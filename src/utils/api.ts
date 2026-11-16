import type { RobotMood } from '../data/gameData';

export interface Mission1ApiResponse {
  passed: boolean;
  status: 'confused' | 'partial' | 'clear';
  robotMood: RobotMood;
  robotReply: string;
  misunderstoodMeaning: string;
  differenceAnalysis: string;
  wrongWords: string[];
  hintForNextTry: string;
}

export interface Mission3ApiResponse {
  isCorrect: boolean;
  robotMood: RobotMood;
  feedback: string;
  errorBreakdown: string[];
  correctedParagraph: string;
}

export interface Mission4ApiResponse {
  passed: boolean;
  isClear: boolean;
  clarityNote: string;
  spellingOk: boolean;
  spellingNote: string;
  easyToUnderstand: boolean;
  understandabilityNote: string;
  robotMood: RobotMood;
  evaluationSummary: string;
  aiExecutionResponse: string;
}

export class ApiRequestError extends Error {
  public code: string;
  constructor(message: string, code = 'NETWORK_ERROR') {
    super(message);
    this.code = code;
  }
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(
      'Không thể kết nối tới máy chủ AIBOT. Hãy kiểm tra mạng và bấm thử lại nhé!',
      'OFFLINE'
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiRequestError('Máy chủ phản hồi chưa hợp lệ. Vui lòng thử lại!', 'INVALID_JSON');
  }

  if (!response.ok || (typeof data === 'object' && data !== null && 'error' in data && (data as { error: boolean }).error)) {
    const errObj = data as { message?: string; code?: string };
    throw new ApiRequestError(
      errObj.message || 'AIBOT gặp sự cố khi xử lý yêu cầu. Bạn thử gửi lại nhé!',
      errObj.code || 'API_ERROR'
    );
  }

  return data as T;
}

export async function checkAiHealth(): Promise<{ ok: boolean; aiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { ok: false, aiConfigured: false };
    return (await res.json()) as { ok: boolean; aiConfigured: boolean };
  } catch {
    return { ok: false, aiConfigured: false };
  }
}

export function evaluateMission1(payload: {
  missionGoal: string;
  expectedExample: string;
  originalInput: string;
  currentInput: string;
  attemptNumber: number;
}): Promise<Mission1ApiResponse> {
  return postJson<Mission1ApiResponse>('/api/mission1/evaluate', payload);
}

export function checkMission3(payload: {
  faultyParagraph: string;
  correctReference: string;
  clickedWords: string[];
  rewrittenSentence: string;
  mode: 'click' | 'rewrite' | 'both';
}): Promise<Mission3ApiResponse> {
  return postJson<Mission3ApiResponse>('/api/mission3/check', payload);
}

export function evaluateMission4(payload: {
  missionTopic: string;
  userCommand: string;
}): Promise<Mission4ApiResponse> {
  return postJson<Mission4ApiResponse>('/api/mission4/evaluate', payload);
}
