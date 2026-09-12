import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { handler as mediaHandler, config as mediaConfig } from '../pages/api/media.js';

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

test('media API exposes a larger JSON upload body parser limit for admin image uploads', () => {
  assert.equal(mediaConfig.api.bodyParser.sizeLimit, '8mb');
});

test('media API handles production environment with graceful fallback', async () => {
  const storeDir = path.join(process.cwd(), 'tmp-test-data', 'media-production');
  const storePath = path.join(storeDir, 'media.json');
  process.env.MEDIA_STORE_PATH = storePath;
  process.env.VERCEL = '1';
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(storePath, '[]');

  try {
    const uploadReq = {
      method: 'POST',
      body: {
        file: 'data:image/jpeg;base64,AAAA',
        fileName: 'deployed-look.jpg',
        type: 'image',
        caption: 'Deployed look',
        order: 1
      }
    };

    const uploadRes = createResponse();
    await mediaHandler(uploadReq, uploadRes);

    assert.equal(uploadRes.statusCode, 201);
    // In production mode without valid blob credentials, it falls back to data URL
    assert.ok(uploadRes.body.item.url, 'URL should be set');
    assert.equal(uploadRes.body.item.caption, 'Deployed look');
    assert.equal(uploadRes.body.item.type, 'image');
  } finally {
    await fs.rm(storeDir, { recursive: true, force: true });
    delete process.env.MEDIA_STORE_PATH;
    delete process.env.VERCEL;
  }
});

test('media API serves portfolio media from the local store', async () => {
  const storeDir = path.join(process.cwd(), 'tmp-test-data', 'media');
  const storePath = path.join(storeDir, 'media.json');
  process.env.MEDIA_STORE_PATH = storePath;
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify([
    { id: 'demo-1', name: 'Demo image', type: 'image', url: '/uploads/demo.jpg', caption: 'Demo look', order: 1 }
  ]));

  try {
    const res = createResponse();
    await mediaHandler({ method: 'GET' }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(Array.isArray(res.body), true);
    assert.equal(res.body[0].caption, 'Demo look');
  } finally {
    await fs.rm(storeDir, { recursive: true, force: true });
    delete process.env.MEDIA_STORE_PATH;
  }
});

test('media API appends new uploads without replacing older portfolio items', async () => {
  const storeDir = path.join(process.cwd(), 'tmp-test-data', 'media-append');
  const storePath = path.join(storeDir, 'media.json');
  process.env.MEDIA_STORE_PATH = storePath;
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify([
    { id: 'demo-1', type: 'image', url: '/uploads/old.jpg', caption: 'Old look', order: 1 }
  ]));

  try {
    const uploadReq = {
      method: 'POST',
      body: {
        file: 'data:image/jpeg;base64,AAAA',
        fileName: 'new-look.jpg',
        type: 'image',
        caption: 'New look',
        order: 2
      }
    };

    const uploadRes = createResponse();
    await mediaHandler(uploadReq, uploadRes);

    assert.equal(uploadRes.statusCode, 201);

    const readRes = createResponse();
    await mediaHandler({ method: 'GET' }, readRes);

    assert.equal(readRes.statusCode, 200);
    assert.equal(readRes.body.length, 2);
    assert.equal(readRes.body[0].caption, 'New look');
    assert.equal(readRes.body[1].caption, 'Old look');
  } finally {
    await fs.rm(storeDir, { recursive: true, force: true });
    delete process.env.MEDIA_STORE_PATH;
  }
});

test('media API updates existing stored portfolio items', async () => {
  const storeDir = path.join(process.cwd(), 'tmp-test-data', 'media-update');
  const storePath = path.join(storeDir, 'media.json');
  process.env.MEDIA_STORE_PATH = storePath;
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify([
    { id: 'demo-update', type: 'image', url: '/uploads/old.jpg', caption: 'Old look', order: 1 }
  ]));

  try {
    const updateRes = createResponse();
    await mediaHandler({
      method: 'PUT',
      query: { id: 'demo-update' },
      body: {
        type: 'image',
        caption: 'Updated look',
        order: 5
      }
    }, updateRes);

    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.item.caption, 'Updated look');

    const readRes = createResponse();
    await mediaHandler({ method: 'GET' }, readRes);

    assert.equal(readRes.body[0].caption, 'Updated look');
    assert.equal(readRes.body[0].order, 5);
  } finally {
    await fs.rm(storeDir, { recursive: true, force: true });
    delete process.env.MEDIA_STORE_PATH;
  }
});
