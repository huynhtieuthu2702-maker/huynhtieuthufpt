import { getApiKey } from './_lib/geminiHandlers.js';

interface VercelReq {
  method?: string;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: true, message: 'Method Not Allowed' });
    return;
  }
  res.status(200).json({
    ok: true,
    aiConfigured: Boolean(getApiKey()),
    model: process.env.GEMINI_MODEL || 'gemini-4-hydrogen',
  });
}
