import { runMission1Evaluate } from '../_lib/geminiHandlers.js';

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: true, message: 'Method Not Allowed' });
    return;
  }

  const rawBody =
    typeof req.body === 'string'
      ? (JSON.parse(req.body || '{}') as Record<string, unknown>)
      : ((req.body ?? {}) as Record<string, unknown>);

  const result = await runMission1Evaluate(rawBody);
  res.status(result.status).json(result.body);
}
