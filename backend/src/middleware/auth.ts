import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@vrl/shared';
import { db } from '../db/connection.js';

export interface ActorContext {
  id: string;
  role: UserRole;
  displayName?: string;
}

declare global {
  namespace Express {
    interface Request {
      actor?: ActorContext;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const actorId = (req.headers['x-actor-id'] as string) || 'rajesh';
  const actorRole = (req.headers['x-actor-role'] as string) || UserRole.COORDINATOR;

  // Verify actor exists in DB
  const user = db.prepare('SELECT id, role, display_name FROM users WHERE id = ?').get(actorId) as {
    id: string;
    role: string;
    display_name: string;
  } | undefined;

  if (user) {
    req.actor = {
      id: user.id,
      role: user.role as UserRole,
      displayName: user.display_name
    };
  } else {
    // Fallback context if seed hasn't run yet or synthetic actor
    req.actor = {
      id: actorId,
      role: (Object.values(UserRole).includes(actorRole as UserRole) ? actorRole : UserRole.COORDINATOR) as UserRole,
      displayName: actorId
    };
  }

  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.actor || !allowedRoles.includes(req.actor.role)) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Action requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.actor?.role || 'NONE'}`
      });
      return;
    }
    next();
  };
}
