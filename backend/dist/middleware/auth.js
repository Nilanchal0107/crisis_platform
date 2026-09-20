import { UserRole } from '@vrl/shared';
import { db } from '../db/connection.js';
export function authMiddleware(req, res, next) {
    const actorId = req.headers['x-actor-id'] || 'rajesh';
    const actorRole = req.headers['x-actor-role'] || UserRole.COORDINATOR;
    // Verify actor exists in DB
    const user = db.prepare('SELECT id, role, display_name FROM users WHERE id = ?').get(actorId);
    if (user) {
        req.actor = {
            id: user.id,
            role: user.role,
            displayName: user.display_name
        };
    }
    else {
        // Fallback context if seed hasn't run yet or synthetic actor
        req.actor = {
            id: actorId,
            role: (Object.values(UserRole).includes(actorRole) ? actorRole : UserRole.COORDINATOR),
            displayName: actorId
        };
    }
    next();
}
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
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
