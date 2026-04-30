import express, { Request, Response } from 'express';
import axios from 'axios';

export function createFeedbackRoutes() {
  const router = express.Router();

  router.post('/bug', async (req: Request, res: Response) => {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const webhookUrl = process.env.DISCORD_BUG_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(503).json({ message: 'Bug reporting is not configured.' });
    }

    try {
      await axios.post(webhookUrl, {
        embeds: [{
          title: `🐛 ${title.trim()}`,
          description: description?.trim() || '_No description provided._',
          color: 0xe74c3c,
          footer: { text: 'EliteCode Bug Report' },
          timestamp: new Date().toISOString(),
        }],
      });

      return res.status(200).json({ message: 'Report sent.' });
    } catch {
      return res.status(502).json({ message: 'Failed to send report.' });
    }
  });

  router.post('/feedback', async (req: Request, res: Response) => {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(503).json({ message: 'Feedback reporting is not configured.' });
    }

    try {
      await axios.post(webhookUrl, {
        embeds: [{
          title: `📝 ${title.trim()}`,
          description: description?.trim() || '_No description provided._',
          color: 0xe74c3c,
          footer: { text: 'EliteCode Feedback Report' },
          timestamp: new Date().toISOString(),
        }],
      });

      return res.status(200).json({ message: 'Report sent.' });
    } catch {
      return res.status(502).json({ message: 'Failed to send report.' });
    }
  });

  return router;
}
