import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

// Mirrors the BCRYPT_RE used in Routes/auth.js — matches every bcrypt prefix.
const BCRYPT_RE = /^\$2[aby]\$/;

test('bcryptjs produces a recognised bcrypt hash', async () => {
  const hash = await bcrypt.hash('correct horse battery', 12);
  assert.ok(BCRYPT_RE.test(hash), `hash ${hash.slice(0, 4)} not recognised`);
});

test('correct password verifies, wrong password does not', async () => {
  const hash = await bcrypt.hash('s3cret-pass', 12);
  assert.equal(await bcrypt.compare('s3cret-pass', hash), true);
  assert.equal(await bcrypt.compare('wrong-pass', hash), false);
});

test('prefix check accepts $2a/$2b/$2y and rejects plaintext', () => {
  assert.ok(BCRYPT_RE.test('$2a$12$abcdefghijklmnopqrstuv'));
  assert.ok(BCRYPT_RE.test('$2b$12$abcdefghijklmnopqrstuv'));
  assert.ok(BCRYPT_RE.test('$2y$12$abcdefghijklmnopqrstuv'));
  assert.equal(BCRYPT_RE.test('plaintextpassword'), false);
  assert.equal(BCRYPT_RE.test('$1$md5salt$'), false);
});
