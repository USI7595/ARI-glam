import { useState, useRef, useEffect } from "react";
import { Mail, Phone, Check, ChevronDown, Search } from "lucide-react";

const services = ["Soft Glam", "Full Glam", "Bridal Makeup", "Photoshoot Ready"];

const countries = [
  { code: "+1", label: "United States / Canada", flag: "🇺🇸/🇨🇦" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+234", label: "Nigeria", flag: "🇳🇬" },
  { code: "+233", label: "Ghana", flag: "🇬🇭" },
  { code: "+254", label: "Kenya", flag: "🇰🇪" },
  { code: "+27", label: "South Africa", flag: "🇿🇦" },
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "+353", label: "Ireland", flag: "🇮🇪" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+39", label: "Italy", flag: "🇮🇹" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+31", label: "Netherlands", flag: "🇳🇱" },
  { code: "+46", label: "Sweden", flag: "🇸🇪" },
  { code: "+47", label: "Norway", flag: "🇳🇴" },
  { code: "+45", label: "Denmark", flag: "🇩🇰" },
  { code: "+358", label: "Finland", flag: "🇫🇮" },
  { code: "+41", label: "Switzerland", flag: "🇨🇭" },
  { code: "+43", label: "Austria", flag: "🇦🇹" },
  { code: "+32", label: "Belgium", flag: "🇧🇪" },
  { code: "+351", label: "Portugal", flag: "🇵🇹" },
  { code: "+30", label: "Greece", flag: "🇬🇷" },
  { code: "+48", label: "Poland", flag: "🇵🇱" },
  { code: "+7", label: "Russia", flag: "🇷🇺" },
  { code: "+81", label: "Japan", flag: "🇯🇵" },
  { code: "+82", label: "South Korea", flag: "🇰🇷" },
  { code: "+86", label: "China", flag: "🇨🇳" },
  { code: "+55", label: "Brazil", flag: "🇧🇷" },
  { code: "+52", label: "Mexico", flag: "🇲🇽" },
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", label: "Qatar", flag: "🇶🇦" },
  { code: "+965", label: "Kuwait", flag: "🇰🇼" },
  { code: "+20", label: "Egypt", flag: "🇪🇬" },
  { code: "+212", label: "Morocco", flag: "🇲🇦" },
  { code: "+64", label: "New Zealand", flag: "🇳🇿" },
  { code: "+65", label: "Singapore", flag: "🇸🇬" },
  { code: "+60", label: "Malaysia", flag: "🇲🇾" },
  { code: "+63", label: "Philippines", flag: "🇵🇭" },
  { code: "+62", label: "Indonesia", flag: "🇮🇩" },
  { code: "+66", label: "Thailand", flag: "🇹🇭" },
  { code: "+84", label: "Vietnam", flag: "🇻🇳" },
  { code: "+92", label: "Pakistan", flag: "🇵🇰" },
  { code: "+880", label: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", label: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", label: "Nepal", flag: "🇳🇵" },
  { code: "+54", label: "Argentina", flag: "🇦🇷" },
  { code: "+56", label: "Chile", flag: "🇨🇱" },
  { code: "+57", label: "Colombia", flag: "🇨🇴" },
  { code: "+51", label: "Peru", flag: "🇵🇪" },
  { code: "+593", label: "Ecuador", flag: "🇪🇨" },
  { code: "+598", label: "Uruguay", flag: "🇺🇾" },
  { code: "+595", label: "Paraguay", flag: "🇵🇾" },
  { code: "+1", label: "Trinidad & Tobago", flag: "🇹🇹" },
  { code: "+1", label: "Bahamas", flag: "🇧🇸" },
  { code: "+1", label: "Jamaica", flag: "🇯🇲" },
  { code: "+1", label: "Barbados", flag: "🇧🇧" },
  { code: "+1", label: "Dominican Republic", flag: "🇩🇴" },
  { code: "+501", label: "Belize", flag: "🇧🇿" },
  { code: "+503", label: "El Salvador", flag: "🇸🇻" },
  { code: "+502", label: "Guatemala", flag: "🇬🇹" },
  { code: "+504", label: "Honduras", flag: "🇭🇳" },
  { code: "+505", label: "Nicaragua", flag: "🇳🇮" },
  { code: "+507", label: "Panama", flag: "🇵🇦" },
  { code: "+506", label: "Costa Rica", flag: "🇨🇷" },
  { code: "+216", label: "Tunisia", flag: "🇹🇳" },
  { code: "+213", label: "Algeria", flag: "🇩🇿" },
  { code: "+218", label: "Libya", flag: "🇱🇾" },
  { code: "+249", label: "Sudan", flag: "🇸🇩" },
  { code: "+251", label: "Ethiopia", flag: "🇪🇹" },
  { code: "+256", label: "Uganda", flag: "🇺🇬" },
  { code: "+255", label: "Tanzania", flag: "🇹🇿" },
  { code: "+260", label: "Zambia", flag: "🇿🇲" },
  { code: "+263", label: "Zimbabwe", flag: "🇿🇼" },
  { code: "+265", label: "Malawi", flag: "🇲🇼" },
  { code: "+258", label: "Mozambique", flag: "🇲🇿" },
  { code: "+350", label: "Gibraltar", flag: "🇬🇮" },
  { code: "+356", label: "Malta", flag: "🇲🇹" },
  { code: "+357", label: "Cyprus", flag: "🇨🇾" },
  { code: "+370", label: "Lithuania", flag: "🇱🇹" },
  { code: "+371", label: "Latvia", flag: "🇱🇻" },
  { code: "+372", label: "Estonia", flag: "🇪🇪" },
  { code: "+373", label: "Moldova", flag: "🇲🇩" },
  { code: "+374", label: "Armenia", flag: "🇦🇲" },
  { code: "+375", label: "Belarus", flag: "🇧🇾" },
  { code: "+380", label: "Ukraine", flag: "🇺🇦" },
  { code: "+381", label: "Serbia", flag: "🇷🇸" },
  { code: "+382", label: "Montenegro", flag: "🇲🇪" },
  { code: "+385", label: "Croatia", flag: "🇭🇷" },
  { code: "+386", label: "Slovenia", flag: "🇸🇮" },
  { code: "+387", label: "Bosnia & Herzegovina", flag: "🇧🇦" },
  { code: "+389", label: "North Macedonia", flag: "🇲🇰" },
  { code: "+40", label: "Romania", flag: "🇷🇴" },
  { code: "+420", label: "Czech Republic", flag: "🇨🇿" },
  { code: "+421", label: "Slovakia", flag: "🇸🇰" },
  { code: "+36", label: "Hungary", flag: "🇭🇺" },
  { code: "+359", label: "Bulgaria", flag: "🇧🇬" },
  { code: "+90", label: "Turkey", flag: "🇹🇷" },
  { code: "+98", label: "Iran", flag: "🇮🇷" },
  { code: "+964", label: "Iraq", flag: "🇮🇶" },
  { code: "+962", label: "Jordan", flag: "🇯🇴" },
  { code: "+961", label: "Lebanon", flag: "🇱🇧" },
  { code: "+963", label: "Syria", flag: "🇸🇾" },
  { code: "+967", label: "Yemen", flag: "🇾🇪" },
  { code: "+968", label: "Oman", flag: "🇴🇲" },
  { code: "+973", label: "Bahrain", flag: "🇧🇭" },
];

function PhoneInput({ value, onChange, name }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(countries.find((c) => c.code === "+44") || countries[0]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Deduplicate by code for the selector list (show first match per code)
  const uniqueByCode = [];
  const seenCodes = new Set();
  for (const c of countries) {
    if (!seenCodes.has(c.code)) {
      seenCodes.add(c.code);
      uniqueByCode.push(c);
    }
  }

  const filtered = search.trim()
    ? uniqueByCode.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      )
    : uniqueByCode;

  function handleSelect(country) {
    setSelected(country);
    setOpen(false);
    setSearch("");
    if (onChange) onChange(country.code);
  }

  return (
    <div className="phone-input-root" ref={dropdownRef}>
      <div className="phone-input-group">
        <button
          type="button"
          className="phone-code-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Select country code"
        >
          <span className="phone-code-flag">{selected.flag}</span>
          <span className="phone-code-value">{selected.code}</span>
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={`phone-chevron ${open ? "phone-chevron-open" : ""}`}
          />
        </button>
        <input
          ref={inputRef}
          type="tel"
          name={name}
          placeholder="Phone number"
          autoComplete="tel"
          required
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
        />
      </div>

      {open && (
        <div className="phone-dropdown">
          <div className="phone-search-wrap">
            <Search size={16} strokeWidth={2} className="phone-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="phone-search-input"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="phone-country-list" role="listbox">
            {filtered.length === 0 ? (
              <li className="phone-no-results">No countries found</li>
            ) : (
              filtered.map((country, i) => (
                <li
                  key={`${country.code}-${country.label}-${i}`}
                  role="option"
                  aria-selected={selected.code === country.code && selected.label === country.label}
                  className={`phone-country-item ${
                    selected.code === country.code && selected.label === country.label
                      ? "phone-country-item-active"
                      : ""
                  }`}
                  onClick={() => handleSelect(country)}
                >
                  <span className="phone-country-flag">{country.flag}</span>
                  <span className="phone-country-label">{country.label}</span>
                  <span className="phone-country-code">{country.code}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  const [phoneCode, setPhoneCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");
  const year = new Date().getFullYear();

  function handleReview(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = getBookingPayload(form);
    // Combine country code and phone number
    payload.phone = `${phoneCode} ${phoneNumber}`;
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
                    <PhoneInput
                      name="phone"
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                    />
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
                    City
                    <input type="text" name="city" placeholder="e.g. London" required />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    State / Region
                    <input type="text" name="state" placeholder="e.g. Greater London" required />
                  </label>
                  <label>
                    Country
                    <input type="text" name="country" placeholder="e.g. United Kingdom" required />
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
                <span className="confirm-label">City</span>
                <span className="confirm-value">{bookingData.city}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">State</span>
                <span className="confirm-value">{bookingData.state}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Country</span>
                <span className="confirm-value">{bookingData.country}</span>
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