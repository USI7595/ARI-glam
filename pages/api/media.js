import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb"
    }
  }
};

const defaultStorePath = path.join(process.cwd(), "data", "media.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

function getMediaStorePath() {
  return process.env.MEDIA_STORE_PATH || defaultStorePath;
}

function getSafeFileName(name = "media") {
  const sanitized = String(name).trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return sanitized || "media";
}

function normalizeMediaItem(raw = {}, fallbackOrder = 0) {
  const type = raw.type === "video" ? "video" : "image";
  const url = String(raw.url || "").trim();

  if (!url) {
    return null;
  }

  return {
    id: raw.id || crypto.randomUUID(),
    type,
    url,
    caption: String(raw.caption || "").trim() || (type === "video" ? "Portfolio video" : "Portfolio image"),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : fallbackOrder,
    createdAt: raw.createdAt || new Date().toISOString()
  };
}

async function readMediaStore() {
  const mediaStorePath = getMediaStorePath();

  try {
    const raw = await fs.readFile(mediaStorePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (["ENOENT", "EPERM", "EACCES"].includes(error.code)) {
      return [];
    }

    throw error;
  }
}

async function writeMediaStore(items) {
  const mediaStorePath = getMediaStorePath();

  try {
    await fs.mkdir(path.dirname(mediaStorePath), { recursive: true });
    await fs.writeFile(mediaStorePath, JSON.stringify(items, null, 2));
  } catch (error) {
    if (["EPERM", "EACCES"].includes(error.code)) {
      return;
    }

    throw error;
  }
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(?:;base64)?,(.*)$/s.exec(String(dataUrl || ""));
  if (!match) {
    return null;
  }

  const mimeType = match[1] || "application/octet-stream";
  const base64 = match[2];
  const isBase64 = dataUrl.includes(";base64,");

  if (!isBase64 || !base64) {
    return null;
  }

  return { mimeType, base64 };
}

async function saveUploadedFile(fileData, fileName) {
  const parsed = parseDataUrl(fileData);
  if (!parsed) {
    throw new Error("Uploaded media was not a valid data URL.");
  }

  // Use Vercel Blob Storage in production
  if (process.env.VERCEL || process.env.NETLIFY || process.env.NODE_ENV === "production") {
    try {
      const extensionMap = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "video/mp4": "mp4",
        "video/webm": "webm",
        "video/quicktime": "mov",
        "video/x-matroska": "mkv"
      };

      const extension = extensionMap[parsed.mimeType] || path.extname(fileName || "media").replace(/^\./, "") || "bin";
      const safeName = getSafeFileName(fileName || `media-${Date.now()}`);
      const blobName = `${Date.now()}-${safeName.replace(/\.[^/.]+$/, "")}.${extension}`;
      
      const buffer = Buffer.from(parsed.base64, "base64");
      const blob = await put(blobName, buffer, {
        access: "public",
        contentType: parsed.mimeType
      });

      return { url: blob.url };
    } catch (error) {
      console.error("Blob upload failed:", error);
      // Fallback to data URL if blob upload fails
      return { url: fileData };
    }
  }

  // Local development: save to public/uploads
  const extensionMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-matroska": "mkv"
  };

  const extension = extensionMap[parsed.mimeType] || path.extname(fileName || "media").replace(/^\./, "") || "bin";
  const safeName = getSafeFileName(fileName || `media-${Date.now()}`);
  const finalName = `${Date.now()}-${safeName.replace(/\.[^/.]+$/, "")}.${extension}`;

  await fs.mkdir(uploadsDir, { recursive: true });
  const fullPath = path.join(uploadsDir, finalName);
  const buffer = Buffer.from(parsed.base64, "base64");
  await fs.writeFile(fullPath, buffer);

  return { url: `/uploads/${finalName}` };
}

async function getStoredMedia() {
  const items = await readMediaStore();
  return items
    .map((item, index) => normalizeMediaItem(item, index + 1))
    .filter(Boolean)
    .sort((first, second) => Number(second.order) - Number(first.order));
}

export async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const media = await getStoredMedia();
      return res.status(200).json(media);
    } catch (error) {
      console.error("Media fetch failed:", error);
      return res.status(500).json({ error: "Unable to load portfolio media." });
    }
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const fileData = body.file;
      const fileName = body.fileName || "media";
      const type = body.type === "video" ? "video" : "image";

      if (!fileData) {
        return res.status(400).json({ error: "No media uploaded." });
      }

      const saved = await saveUploadedFile(fileData, fileName);
      const items = await readMediaStore();
      const nextItem = normalizeMediaItem(
        {
          id: body.id || crypto.randomUUID(),
          type,
          url: saved.url,
          caption: body.caption || fileName,
          order: Number(body.order ?? items.length + 1),
          createdAt: new Date().toISOString()
        },
        items.length + 1
      );

      if (!nextItem) {
        return res.status(400).json({ error: "Unable to process uploaded media." });
      }

      const updatedMedia = [...items, nextItem].sort((first, second) => Number(second.order) - Number(first.order));
      await writeMediaStore(updatedMedia);
      return res.status(201).json({ message: "Media uploaded successfully.", item: nextItem });
    } catch (error) {
      console.error("Media upload failed:", error);
      return res.status(500).json({ error: "Media upload failed. Please try again." });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id } = req.query || {};
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const items = await readMediaStore();
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Media item not found." });
      }

      const currentItem = items[index];
      const updatedItem = normalizeMediaItem(
        {
          ...currentItem,
          type: body.type === "video" ? "video" : "image",
          caption: body.caption ?? currentItem.caption,
          order: Number(body.order ?? currentItem.order ?? index + 1),
          url: body.file ? (await saveUploadedFile(body.file, body.fileName || currentItem.caption || "media")).url : currentItem.url
        },
        index + 1
      );

      if (!updatedItem) {
        return res.status(400).json({ error: "Unable to update media item." });
      }

      const updatedMedia = [...items]
        .map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
        .sort((first, second) => Number(second.order) - Number(first.order));

      await writeMediaStore(updatedMedia);
      return res.status(200).json({ message: "Media updated successfully.", item: updatedItem });
    } catch (error) {
      console.error("Media update failed:", error);
      return res.status(500).json({ error: "Media update failed. Please try again." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query || {};
      const media = await readMediaStore();
      const target = media.find((item) => item.id === id);

      if (!target) {
        return res.status(404).json({ error: "Media not found." });
      }

      const remaining = media.filter((item) => item.id !== id);
      await writeMediaStore(remaining);

      if (String(target.url || "").startsWith("/uploads/")) {
        const absolutePath = path.join(process.cwd(), "public", target.url.replace(/^\//, ""));
        try {
          await fs.unlink(absolutePath);
        } catch (unlinkError) {
          if (unlinkError.code !== "ENOENT") {
            console.warn("Failed to remove uploaded file:", unlinkError);
          }
        }
      }

      return res.status(200).json({ message: "Media removed successfully." });
    } catch (error) {
      console.error("Media delete failed:", error);
      return res.status(500).json({ error: "Unable to delete media." });
    }
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed." });
}

export default handler;
