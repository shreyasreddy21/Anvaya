/**
 * Authentication routes.
 *
 * POST /api/auth/login
 *   — Accepts username + password
 *   — Compares with bcrypt
 *   — Returns a signed JWT on success
 *
 * Security notes:
 *  • Passwords are ALWAYS hashed with bcrypt (SALT_ROUNDS=12) at save time.
 *  • A stored value that is not a bcrypt hash is rejected outright — there is
 *    no plaintext comparison path (verified: 0 plaintext passwords in the DB).
 *  • The token payload contains only non-sensitive identity fields.
 *  • Error messages are intentionally generic to prevent user enumeration.
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Child from '../models/Child.js';
import Therapist from '../models/Therapist.js';
import SuperAdmin from '../models/SuperAdmin.js';

const router = express.Router();

// Matches every bcrypt variant prefix ($2a$, $2b$, $2y$) so hashes from any
// bcrypt implementation are recognised and never mistaken for plaintext.
const BCRYPT_RE = /^\$2[aby]\$/;

// Verify a candidate password against a stored bcrypt hash.
// Non-hash stored values are rejected (no plaintext acceptance).
async function verifyPassword(candidate, stored) {
  if (typeof stored !== 'string' || !BCRYPT_RE.test(stored)) return false;
  return bcrypt.compare(candidate, stored);
}

function issueToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    algorithm: 'HS256',
  });
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || typeof username !== 'string' ||
      !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const normalised = username.trim().toLowerCase();

  try {
    // 1. SuperAdmin
    const superadmin = await SuperAdmin.findOne({ username: normalised });
    if (superadmin && await verifyPassword(password, superadmin.password)) {
      const token = issueToken({ userId: superadmin._id.toString(), role: 'superadmin', username: normalised });
      return res.json({ role: 'superadmin', token });
    }

    // 2. Therapist
    const therapist = await Therapist.findOne({ username: normalised });
    if (therapist && await verifyPassword(password, therapist.password)) {
      const token = issueToken({
        userId:      therapist._id.toString(),
        role:        'therapist',
        username:    normalised,
        therapistId: therapist.therapistId,
      });
      return res.json({ role: 'therapist', therapistId: therapist.therapistId, token });
    }

    // 3. Child
    const child = await Child.findOne({ username: normalised });
    if (child && await verifyPassword(password, child.password)) {
      const token = issueToken({
        userId:      child._id.toString(),
        role:        'child',
        username:    normalised,
        therapistId: child.therapistId,
      });
      return res.json({ role: 'child', token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });

  } catch (err) {
    console.error('[auth] Login error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
