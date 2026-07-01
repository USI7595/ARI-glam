import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { handler } from '../pages/api/bookings.js';

function createResponse() {
  return {
    statusCode: 0,
    body: undefined,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    }
  };
}

function createBookingRequest() {
  return {
    method: 'POST',
    body: {
      name: 'Ada Lovelace',
      phone: '07123456789',
      email: 'ada@example.com',
      date: '2026-07-10',
      service: 'Soft Glam',
      location: 'London',
      details: 'Test booking'
    }
  };
}

test('stores bookings locally when email delivery is not configured', async () => {
  const storePath = path.join(process.cwd(), 'data', 'bookings.json');
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalStorePath = process.env.BOOKING_STORE_PATH;

  delete process.env.RESEND_API_KEY;
  process.env.BOOKING_STORE_PATH = storePath;
  await fs.rm(path.dirname(storePath), { recursive: true, force: true });

  try {
    const req = createBookingRequest();
    const res = createResponse();

    await handler(req, res);

    assert.equal(res.statusCode, 201);
    assert.match(res.body.message, /saved locally/i);

    const stored = JSON.parse(await fs.readFile(storePath, 'utf8'));
    assert.equal(stored[0].email, 'ada@example.com');
  } finally {
    await fs.rm(path.dirname(storePath), { recursive: true, force: true });

    if (originalStorePath) {
      process.env.BOOKING_STORE_PATH = originalStorePath;
    } else {
      delete process.env.BOOKING_STORE_PATH;
    }

    if (originalApiKey) {
      process.env.RESEND_API_KEY = originalApiKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  }
});

test('returns sent when email succeeds even if local archive fails', async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalStorePath = process.env.BOOKING_STORE_PATH;
  const originalFetch = globalThis.fetch;

  process.env.RESEND_API_KEY = 'test-key';
  process.env.BOOKING_STORE_PATH = path.join('/dev/null', 'bookings.json');
  globalThis.fetch = async () => ({
    ok: true,
    text: async () => ''
  });

  try {
    const req = createBookingRequest();
    const res = createResponse();

    await handler(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.message, 'Booking request sent.');
  } finally {
    if (originalApiKey) {
      process.env.RESEND_API_KEY = originalApiKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }

    if (originalStorePath) {
      process.env.BOOKING_STORE_PATH = originalStorePath;
    } else {
      delete process.env.BOOKING_STORE_PATH;
    }

    globalThis.fetch = originalFetch;
  }
});
