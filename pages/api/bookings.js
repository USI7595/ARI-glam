import { promises as fs } from "fs";
import path from "path";

const requiredFields = ["name", "phone", "email", "date", "service", "location"];
const defaultToEmail = "lawalayo407@gmail.com";
const defaultFromEmail = "ARI Glam <onboarding@resend.dev>";

function getBookingStorePath() {
  return process.env.BOOKING_STORE_PATH || path.join(process.cwd(), "data", "bookings.json");
}

async function saveBookingLocally(booking) {
  const storePath = getBookingStorePath();
  const storeDir = path.dirname(storePath);

  await fs.mkdir(storeDir, { recursive: true });

  let existingBookings = [];
  try {
    const raw = await fs.readFile(storePath, "utf8");
    existingBookings = JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  existingBookings.push(booking);
  await fs.writeFile(storePath, JSON.stringify(existingBookings, null, 2));
}

function cleanBooking(raw = {}) {
  const fields = [...requiredFields, "details"];
  const booking = {};

  for (const field of fields) {
    booking[field] = String(raw[field] || "").trim();
  }

  if (requiredFields.some((field) => !booking[field])) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    ...booking,
    createdAt: new Date().toISOString()
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bookingEmailHtml(booking) {
  const rows = [
    ["Name", booking.name],
    ["Phone or WhatsApp", booking.phone],
    ["Email", booking.email],
    ["Event date", booking.date],
    ["Service", booking.service],
    ["Location", booking.location],
    ["Details", booking.details || "No extra details provided."],
    ["Submitted", booking.createdAt]
  ];

  return `
    <div style="font-family:Arial,sans-serif;color:#2c2524;line-height:1.6">
      <h1 style="color:#71444c;font-family:Georgia,serif">New ARI Glam booking request</h1>
      <table style="border-collapse:collapse;width:100%;max-width:680px">
        <tbody>
          ${rows
            .map(([label, value]) => `
              <tr>
                <th style="border:1px solid #eadbd5;padding:10px;text-align:left;background:#fffaf3;width:180px">${escapeHtml(label)}</th>
                <td style="border:1px solid #eadbd5;padding:10px">${escapeHtml(value)}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bookingEmailText(booking) {
  return [
    "New ARI Glam booking request",
    "",
    `Name: ${booking.name}`,
    `Phone or WhatsApp: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Event date: ${booking.date}`,
    `Service: ${booking.service}`,
    `Location: ${booking.location}`,
    `Details: ${booking.details || "No extra details provided."}`,
    `Submitted: ${booking.createdAt}`
  ].join("\n");
}

async function sendBookingEmail(booking) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.BOOKING_FROM_EMAIL || defaultFromEmail,
      to: [process.env.BOOKING_TO_EMAIL || defaultToEmail],
      reply_to: booking.email,
      subject: `New ARI Glam booking request from ${booking.name}`,
      html: bookingEmailHtml(booking),
      text: bookingEmailText(booking)
    })
  });

  if (!response.ok) {
    const details = await response.text();
    const requestId = response.headers.get("x-request-id") || response.headers.get("resend-request-id");
    const requestNote = requestId ? ` Request ID: ${requestId}.` : "";
    throw new Error(`Email send failed with status ${response.status}.${requestNote} ${details}`);
  }
}

export async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json([]);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const booking = cleanBooking(req.body);

  if (!booking) {
    return res.status(400).json({ error: "Missing required booking fields." });
  }

  try {
    await sendBookingEmail(booking);
  } catch (error) {
    console.error("Booking email failed:", error);

    try {
      await saveBookingLocally(booking);
    } catch (storageError) {
      console.error("Booking backup save failed:", storageError);
      return res.status(503).json({
        error: "Booking request could not be delivered. Please email or WhatsApp ARI Glam directly.",
        nextStep: "Check RESEND_API_KEY, BOOKING_TO_EMAIL, and BOOKING_FROM_EMAIL in Vercel."
      });
    }

    return res.status(201).json({
      message: "Booking request saved locally. Email delivery is currently unavailable.",
      bookingId: booking.id,
      savedLocally: true
    });
  }

  try {
    await saveBookingLocally(booking);
  } catch (storageError) {
    console.warn("Booking archive save failed:", storageError);
  }

  return res.status(201).json({
    message: "Booking request sent.",
    bookingId: booking.id
  });
}

export default handler;
