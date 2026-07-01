import { useState } from "react";
import { Mail, Phone } from "lucide-react";

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
  const [status, setStatus] = useState("");
  const year = new Date().getFullYear();

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = getBookingPayload(form);

    setStatus("Sending your request...");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Booking API unavailable");
      }

      const result = await response.json();
      form.reset();
      setStatus(
        result.savedLocally
          ? "Your booking request was saved, but the email could not be sent. Please email or WhatsApp ARI Glam directly."
          : "Thank you. Your booking request was sent."
      );
    } catch (error) {
      saveLocalBooking(payload);
      form.reset();
      setStatus("We could not send the booking email, so your request was saved in this browser. Please email or WhatsApp ARI Glam directly.");
    }
  }

  return (
    <>
      <header className="site-header" id="top">
        <a className="brand" href="#top" aria-label="ARI Glam home">
          <span className="brand-mark">ARI</span>
          <span>Glam</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#portfolio">Portfolio</a>
          <a href="#booking">Book</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
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

          <form className="booking-form" onSubmit={handleSubmit}>
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
            <button className="btn btn-primary" type="submit">Submit Request</button>
            <output className="form-status">{status}</output>
          </form>
        </section>

        <section className="contact section" id="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Ready when your calendar is.</h2>
          </div>
          <div className="contact-list">
            <a href="mailto:Oluwatosinolamide31@gmail.com">
              <Mail aria-hidden="true" size={20} strokeWidth={2.2} />
              <span>Oluwatosinolamide31@gmail.com</span>
            </a>
            <a href="tel:+447308725416">
              <Phone aria-hidden="true" size={20} strokeWidth={2.2} />
              <span>+44 7308725416</span>
            </a>
            <span>Available for appointments and events</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>&copy; {year} ARI Glam Makeup Artistry. All rights reserved.</p>
      </footer>
    </>
  );
}
