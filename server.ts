import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getApiKey,
  runMission1Evaluate,
  runMission3Check,
  runMission4Evaluate,
} from './server/geminiHandlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(getApiKey()),
      model: process.env.GEMINI_MODEL || 'gemini-4-hydrogen',
    });
  });

  app.post('/api/mission1/evaluate', async (req: Request, res: Response) => {
    const result = await runMission1Evaluate(req.body ?? {});
    res.status(result.status).json(result.body);
  });

  app.post('/api/mission3/check', async (req: Request, res: Response) => {
    const result = await runMission3Check(req.body ?? {});
    res.status(result.status).json(result.body);
  });

  app.post('/api/mission4/evaluate', async (req: Request, res: Response) => {
    const result = await runMission4Evaluate(req.body ?? {});
    res.status(result.status).json(result.body);
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Cần Cứu Trợ! server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
