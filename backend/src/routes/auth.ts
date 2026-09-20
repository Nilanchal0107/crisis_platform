import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { UserRole, GUEST_REPORTER_ID } from '@vrl/shared';
import { db } from '../db/connection.js';

const router = Router();
const NON_SELECTABLE_IDS = ['system', GUEST_REPORTER_ID];

const RoleQuerySchema = z.object({
  role: z.nativeEnum(UserRole)
});

const LoginSchema = z.object({
  id: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(100).optional()
});

const RegisterSchema = z.object({
  display_name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20)
});

/**
 * GET /api/auth/accounts?role=REPORTER|COORDINATOR|RESPONDER
 * Lists login-selectable (i.e. password-protected) accounts for the given role.
 * Password-less accounts — 'system', 'guest', and phone-registered Reporters from
 * POST /register — never appear here; they aren't meant to be picked from a password
 * login list at all.
 */
router.get('/accounts', (req: Request, res: Response) => {
  const parsed = RoleQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A valid role query parameter is required.' });
    return;
  }

  const accounts = db.prepare(`
    SELECT id, display_name, role, contact_safe
    FROM users
    WHERE role = ? AND is_active = 1 AND password_hash IS NOT NULL
    ORDER BY display_name
  `).all(parsed.data.role);

  res.status(200).json({ accounts });
});

/**
 * POST /api/auth/register
 * Reporter self-registration: name + phone only, no password. This is the "Sign In"
 * path on the Reporter login screen — distinct from "Log In" (an existing password
 * account above) and "Quick Report" (fully anonymous, submits as the 'guest' actor).
 *
 * The phone number IS the identity: registering again with the same phone returns the
 * existing account (updating the display name to whatever was just entered) instead of
 * creating a duplicate, so a returning reporter's submissions stay attributed to one
 * consistent actor in the audit trail.
 */
router.post('/register', (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A name and a valid phone number are required.' });
    return;
  }

  const digitsOnly = parsed.data.phone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Phone number must have between 7 and 15 digits.' });
    return;
  }

  // Drop any country-code prefix (e.g. +91) so "+91 98200 11223" and "98200-11223"
  // resolve to the same identity — the last 10 digits are the actual subscriber number.
  const normalizedPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

  const id = `reporter_${normalizedPhone}`;
  const displayName = parsed.data.display_name;
  const contactSafe = `${displayName} (${normalizedPhone})`;

  const existing = db.prepare(`
    SELECT id, display_name, role, contact_safe
    FROM users
    WHERE id = ? AND is_active = 1
  `).get(id) as { id: string; display_name: string; role: string; contact_safe: string } | undefined;

  let account: { id: string; display_name: string; role: string; contact_safe: string };

  if (existing) {
    db.prepare('UPDATE users SET display_name = ?, contact_safe = ? WHERE id = ?').run(displayName, contactSafe, id);
    account = { ...existing, display_name: displayName, contact_safe: contactSafe };
  } else {
    db.prepare(`
      INSERT INTO users (id, display_name, role, contact_safe, phone, password_hash, is_active)
      VALUES (?, ?, ?, ?, ?, NULL, 1)
    `).run(id, displayName, UserRole.REPORTER, contactSafe, normalizedPhone);
    account = { id, display_name: displayName, role: UserRole.REPORTER, contact_safe: contactSafe };
  }

  res.status(200).json({ account });
});

/**
 * POST /api/auth/login
 * Every login-selectable account (Reporter, Coordinator, Responder) requires a password,
 * checked against a bcrypt hash stored on the user row — server-side role authorization
 * (requireRole / actor lookup in authMiddleware) remains the real enforcement boundary
 * regardless, this only gates who can select an identity. Reporters may skip this entirely
 * via "Quick Report", which never calls this endpoint.
 */
router.post('/login', (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A valid account id is required.' });
    return;
  }

  if (NON_SELECTABLE_IDS.includes(parsed.data.id)) {
    res.status(401).json({ error: 'INVALID_ACCOUNT', message: 'No active account found for that identity.' });
    return;
  }

  const account = db.prepare(`
    SELECT id, display_name, role, contact_safe, password_hash
    FROM users
    WHERE id = ? AND is_active = 1
  `).get(parsed.data.id) as
    | { id: string; display_name: string; role: string; contact_safe: string; password_hash: string | null }
    | undefined;

  if (!account) {
    res.status(401).json({ error: 'INVALID_ACCOUNT', message: 'No active account found for that identity.' });
    return;
  }

  if (!parsed.data.password) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Password is required for this role.' });
    return;
  }

  const passwordOk = !!account.password_hash && bcrypt.compareSync(parsed.data.password, account.password_hash);
  if (!passwordOk) {
    res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Incorrect username or password.' });
    return;
  }

  res.status(200).json({
    account: {
      id: account.id,
      display_name: account.display_name,
      role: account.role,
      contact_safe: account.contact_safe
    }
  });
});

export default router;
