import { useState } from "react";
import { Mail, Phone, Check } from "lucide-react";

const services = ["Soft Glam", "Full Glam", "Bridal Makeup", "Photoshoot Ready"];

function getBookingPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function saveLocalBooking(payload) {
  const key = "ari_glam_bookings_demo";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  current.push({ ...payload, createdAt: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(current));
}

export default function App() {
  const [step, setStep] = useState("form"); // "form" | "confirm" | "success"
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [status, setStatus] = useState("");
  const year = new Date().getFullYear();

  function handleReview(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = getBookingPayload(form);
    setBookingData(payload);
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleConfirm() {
    setSubmitting(true);
    setStatus("Sending your request...");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Booking API unavailable");
      }

      const result = await response.json();
      setBookingData((prev) => ({ ...prev, bookingId: result.bookingId, savedLocally: result.savedLocally }));
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      saveLocalBooking(bookingData);
      setBookingData((prev) => ({ ...prev, savedLocally: true }));
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
      setStatus("");
    }
  }

  function handleBack() {
    setStep("form");
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNewBooking() {
    setStep("form");
    setBookingData(null);
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <header className="site-header" id="top">
        <a className="brand" href="/" aria-label="ARI Glam home">
          <span className="brand-mark">ARI</span>
          <span>Glam</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {step === "form" && <a href="#portfolio">Portfolio</a>}
          {step === "form" && <a href="#booking">Book</a>}
          {step === "form" && <a href="#contact">Contact</a>}
          {(step === "confirm" || step === "success") && (
            <a href="/" onClick={handleNewBooking}>New Booking</a>
          )}
        </nav>
      </header>

      <main>
        {step === "form" && (
          <>
            <section className="hero" aria-label="ARI Glam Makeup Artistry">
              <img src="/assets/ari-glam-box.jpeg" alt="ARI Glam Makeup Artistry logo on a soft cream makeup box" />
              <div className="hero-overlay" />
              <div className="hero-content">
                <p className="eyebrow">Makeup Artistry</p>
                <h1>ARI Glam</h1>
                <p>Soft glam, bridal beauty, and event-ready makeup with a polished finish made for your moment.</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href="#booking">Book an Appointment</a>
                  <a className="btn btn-secondary" href="#portfolio">View Portfolio</a>
                </div>
              </div>
            </section>

            <section className="intro section">
              <div>
                <p className="eyebrow">Beauty With Intention</p>
                <h2>Looks that feel graceful in person and camera-ready in every photo.</h2>
              </div>
              <p>ARI Glam provides personal makeup artistry for weddings, birthdays, photoshoots, graduation days, and special occasions. Every booking starts with your skin, your outfit, your event, and the finish you want.</p>
            </section>

            <section className="portfolio section" id="portfolio">
              <div className="portfolio-copy">
                <p className="eyebrow">Portfolio</p>
                <h2>A feminine, polished brand presence.</h2>
                <p>Use this section for client photos, product shots, behind-the-scenes moments, or before-and-after results as the business grows.</p>
              </div>
              <div className="portfolio-grid" aria-label="ARI Glam brand gallery">
                <img src="/assets/ari-glam-card.jpeg" alt="ARI Glam Cosmetics and Artistry logo on cream fabric" />
                <img src="/assets/ari-glam-box.jpeg" alt="ARI Glam logo with makeup brush artwork" />
              </div>
            </section>

            <section className="booking section" id="booking">
              <div className="booking-copy">
                <p className="eyebrow">Book ARI Glam</p>
                <h2>Send a booking request.</h2>
                <p>Submit your details and ARI Glam will follow up to confirm availability, timing, and location.</p>
              </div>

              <form className="booking-form" onSubmit={handleReview} noValidate>
                <div className="form-row">
                  <label>
                    Full name
                    <input type="text" name="name" autoComplete="name" required />
                  </label>
                  <label>
                    Phone or WhatsApp
                    <input type="tel" name="phone" autoComplete="tel" required />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Email
                    <input type="email" name="email" autoComplete="email" required />
                  </label>
                  <label>
                    Event date
                    <input type="date" name="date" required />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Service
                    <select name="service" required defaultValue="">
                      <option value="">Choose a service</option>
                      {services.map((service) => (
                        <option key={service}>{service}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Location
                    <input type="text" name="location" placeholder="City or venue" required />
                  </label>
                </div>
                <label>
                  Details
                  <textarea name="details" rows="5" placeholder="Tell us the time, occasion, skin preferences, and how many faces need makeup." />
                </label>
                <button className="btn btn-primary" type="submit">Review Booking</button>
              </form>
            </section>

            <section className="contact section" id="contact">
              <div>
                <p className="eyebrow">Contact</p>
                <h2>Ready when your calendar is.</h2>
              </div>
              <div className="contact-list">
                <a href="mailto:ariglammakeupartistry@gmail.com">
                  <Mail aria-hidden="true" size={20} strokeWidth={2.2} />
                  <span>ariglammakeupartistry@gmail.com</span>
                </a>
                <a href="tel:+447308725416">
                  <Phone aria-hidden="true" size={20} strokeWidth={2.2} />
                  <span>+44 7308725416</span>
                </a>
                <span>Available for appointments and events</span>
              </div>
            </section>
          </>
        )}

        {step === "confirm" && bookingData && (
          <section className="confirm-section">
            <div className="confirm-header">
              <p className="eyebrow">Step 2 of 2</p>
              <h2>Confirm your booking</h2>
              <p style={{ color: "var(--muted)", marginTop: 12, fontSize: "1.05rem" }}>
                Please review your details before submitting.
              </p>
            </div>

            <div className="confirm-card">
              <div className="confirm-row">
                <span className="confirm-label">Name</span>
                <span className="confirm-value">{bookingData.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Phone</span>
                <span className="confirm-value">{bookingData.phone}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Email</span>
                <span className="confirm-value">{bookingData.email}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Event date</span>
                <span className="confirm-value">{bookingData.date}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Service</span>
                <span className="confirm-value">{bookingData.service}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Location</span>
                <span className="confirm-value">{bookingData.location}</span>
              </div>
              {bookingData.details && (
                <div className="confirm-row">
                  <span className="confirm-label">Details</span>
                  <span className="confirm-value">{bookingData.details}</span>
                </div>
              )}
            </div>

            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={handleBack} disabled={submitting}>
                Edit Details
              </button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner" style={{ marginRight: 8 }} />
                    Sending...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
            {status && <output className="form-status" style={{ textAlign: "center" }}>{status}</output>}
          </section>
        )}

        {step === "success" && bookingData && (
          <section className="success-section">
            <div className="success-icon">
              <Check />
            </div>

            <div>
              <p className="eyebrow">Booking Submitted</p>
              <h2>Thank you, {bookingData.name.split(" ")[0]}!</h2>
              <p style={{ color: "var(--muted)", marginTop: 12, fontSize: "1.05rem" }}>
                Your booking request has been received.
              </p>
            </div>

            <div className="success-details">
              <h3>What happens next?</h3>
              <p>
                ARI Glam will review your request and follow up within 24–48 hours to confirm
                availability, timing, and location for your <strong>{bookingData.service}</strong> appointment
                on <strong>{bookingData.date}</strong>.
              </p>
              {bookingData.savedLocally && (
                <p style={{ color: "var(--rose)", fontWeight: 600, marginTop: 8 }}>
                  ℹ️ Email delivery is currently unavailable. Your request has been saved in this browser.
                  Please contact ARI Glam directly to confirm.
                </p>
              )}
            </div>

            <div className="success-next">
              <h3>Need to reach us sooner?</h3>
              <p>
                If your event is within 48 hours, please contact ARI Glam directly to ensure availability.
              </p>
              <div className="contact-list" style={{ justifyContent: "center", justifyItems: "center" }}>
                <a href="mailto:ariglammakeupartistry@gmail.com">
                  <Mail aria-hidden="true" size={20} strokeWidth={2.2} />
                  <span>ariglammakeupartistry@gmail.com</span>
                </a>
                <a href="tel:+447308725416">
                  <Phone aria-hidden="true" size={20} strokeWidth={2.2} />
                  <span>+44 7308725416</span>
                </a>
              </div>
            </div>

            <div className="success-actions">
              <a className="btn btn-primary" href="/" onClick={handleNewBooking}>
                Book Another Appointment
              </a>
              <a className="btn btn-outline" href="/">
                Back to Home
              </a>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>&copy; {year} ARI Glam Makeup Artistry. All rights reserved.</p>
      </footer>
    </>
  );
}