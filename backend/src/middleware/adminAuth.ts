import { type Request, type Response, type NextFunction } from 'express';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

/**
 * Basic authentication middleware for admin routes
 * Expects: Authorization: Basic base64(admin:password)
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({
      error: 'Требуется авторизация',
    });
    return;
  }

  try {
    const base64Credentials = authHeader.slice(6); // Remove 'Basic '
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username !== 'admin' || password !== ADMIN_PASSWORD) {
      res.status(401).json({
        error: 'Неверные учётные данные',
      });
      return;
    }

    next();
  } catch {
    res.status(401).json({
      error: 'Ошибка авторизации',
    });
  }
}

export default adminAuth;

