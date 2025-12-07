import { Router, type Request, type Response } from 'express';
import { getSetting } from '../db/queries.js';

const router = Router();

interface SubmitBody {
  code: string;
}

/**
 * POST /api/submit
 * Validate access code
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code } = req.body as SubmitBody;

    // Validate code format
    if (!code || typeof code !== 'string' || !/^\d{4}$/.test(code)) {
      res.status(400).json({
        success: false,
        error: 'Код должен содержать 4 цифры',
      });
      return;
    }

    // Get valid code from database
    const validCode = await getSetting('code');

    if (code !== validCode) {
      res.status(401).json({
        success: false,
        error: 'Неверный код',
      });
      return;
    }

    // Code is valid
    res.json({
      success: true,
      message: 'Код подтверждён',
    });
  } catch (error) {
    console.error('Error in submit:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
    });
  }
});

export default router;

