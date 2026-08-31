import Head from "next/head";
import { useEffect, useState } from "react";
import { defaultPortfolioMedia } from "../src/portfolioDefaults";

const ADMIN_USERNAME = "UsiAdmin";
const ADMIN_PASSWORD = "Usi@Ariglam";
const ADMIN_SESSION_TTL = 30 * 60 * 1000;

const initialForm = {
  file: "",
  fileName: "",
  caption: "",
  order: "",
  type: "image"
};

function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("ari_glam_admin_user");
  window.localStorage.removeItem("ari_glam_admin_password");
  window.localStorage.removeItem("ari_glam_admin_expiry");
}

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const expiry = Number(window.localStorage.getItem("ari_glam_admin_expiry") || 0);
    const hasValidSession =
      window.localStorage.getItem("ari_glam_admin_user") === ADMIN_USERNAME &&
      window.localStorage.getItem("ari_glam_admin_password") === ADMIN_PASSWORD &&
      expiry > Date.now();

    if (!hasValidSession) {
      clearAdminSession();
      return false;
    }

    return true;
  });

  async function loadMedia() {
    try {
      const response = await fetch("/api/media");
      if (!response.ok) {
        throw new Error("Could not load media");
      }

      const media = await response.json();
      const merged = [...defaultPortfolioMedia, ...(Array.isArray(media) ? media : [])]
        .filter((item, index, list) => {
          const firstMatch = list.findIndex((candidate) => candidate.id === item.id || candidate.url === item.url);
          return firstMatch === index;
        })
        .sort((first, second) => Number(second.order || 0) - Number(first.order || 0));

      setItems(merged);
    } catch (error) {
      setItems(defaultPortfolioMedia);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") {
      return;
    }

    let timerId;
    const refreshExpiry = () => {
      window.localStorage.setItem("ari_glam_admin_expiry", String(Date.now() + ADMIN_SESSION_TTL));
    };

    const resetTimer = () => {
      refreshExpiry();
      if (timerId) {
        window.clearTimeout(timerId);
      }
      timerId = window.setTimeout(() => {
        clearAdminSession();
        setIsAuthenticated(false);
      }, ADMIN_SESSION_TTL);
    };

    const activityEvents = ["click", "keydown", "mousemove", "touchstart", "pointerdown"];
    refreshExpiry();
    resetTimer();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [isAuthenticated]);

  function handleLogin(event) {
    event.preventDefault();

    if (username.trim() !== ADMIN_USERNAME) {
      setStatus({ type: "error", message: "Incorrect username. Please use UsiAdmin." });
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setStatus({ type: "error", message: "Incorrect password. Please use the correct admin password." });
      return;
    }

    window.localStorage.setItem("ari_glam_admin_user", ADMIN_USERNAME);
    window.localStorage.setItem("ari_glam_admin_password", ADMIN_PASSWORD);
    window.localStorage.setItem("ari_glam_admin_expiry", String(Date.now() + ADMIN_SESSION_TTL));
    setIsAuthenticated(true);
    setStatus({ type: "success", message: "Access granted." });
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!form.file && !editingId) {
      setStatus({ type: "error", message: "Choose an image or video first." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: editingId ? "Updating media..." : "Uploading media..." });

    try {
      const payload = {
        file: form.file || "",
        fileName: form.fileName,
        type: form.type,
        caption: form.caption,
        order: form.order === "" ? Math.max(0, ...items.map((item) => Number(item.order || 0))) + 1 : Number(form.order)
      };

      if (editingId) {
        if (String(editingId).startsWith("default-")) {
          setItems((current) =>
            current.map((item) =>
              item.id === editingId
                ? {
                    ...item,
                    ...payload,
                    caption: payload.caption || item.caption,
                    type: payload.type || item.type,
                    order: payload.order ?? item.order
                  }
                : item
            )
          );

          setStatus({ type: "success", message: "Default gallery item updated." });
        } else {
          const response = await fetch(`/api/media?id=${encodeURIComponent(editingId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const result = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(result.error || "Update failed");
          }

          setStatus({ type: "success", message: result.message || "Media updated." });
        }
      } else {
        const response = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        setStatus({ type: "success", message: result.message || "Media uploaded." });
      }

      setForm(initialForm);
      setEditingId(null);
      event.target.reset();
      await loadMedia();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not save media." });
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      file: "",
      fileName: item.url.split("/").pop() || "",
      caption: item.caption || "",
      order: String(item.order || ""),
      type: item.type || "image"
    });
    setStatus({ type: "", message: "Editing media." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Delete failed");
      }

      setStatus({ type: "success", message: result.message || "Media removed." });
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      if (String(id).startsWith("default-")) {
        setItems((current) => current.filter((item) => item.id !== id));
        setStatus({ type: "success", message: "Default gallery item removed from view." });
        return;
      }
      await loadMedia();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not delete media." });
    }
  }

  function handleFileSelection(event) {
    const currentFile = event.target.files?.[0];
    if (!currentFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        file: String(reader.result || ""),
        fileName: currentFile.name,
        type: currentFile.type.startsWith("video/") ? "video" : "image"
      }));
    };
    reader.readAsDataURL(currentFile);
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>ARI Glam Admin Login</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>

        <main className="admin-page">
          <div className="admin-shell">
            <div className="admin-panel admin-auth-panel">
              <p className="eyebrow">Restricted Access</p>
              <h1>ARI Glam Admin</h1>
              <p>Use the admin username to access the portfolio dashboard.</p>

              <form className="admin-upload-box" onSubmit={handleLogin}>
                <label>
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </label>

                <button className="btn btn-primary" type="submit">Enter Admin</button>
                <div className={`admin-status ${status.type}`}>{status.message}</div>
              </form>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>ARI Glam Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="admin-page">
        <div className="admin-shell">
          <div className="admin-panel">
            <div className="admin-header">
              <div>
                <p className="eyebrow">Portfolio Dashboard</p>
                <h1>ARI Glam Admin</h1>
                <p>Upload new photos and videos. They will appear automatically on the main portfolio.</p>
              </div>
              <div className="header-actions">
                <a className="admin-link" href="/">View Portfolio</a>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    clearAdminSession();
                    setIsAuthenticated(false);
                    setUsername("");
                    setPassword("");
                    setStatus({ type: "", message: "" });
                  }}
                >
                  Log out
                </button>
              </div>
            </div>

            <form className="admin-upload-box" onSubmit={handleUpload}>
              <label>
                Upload a file
                <input type="file" accept="image/*,video/*" onChange={handleFileSelection} />
              </label>

              <label>
                Caption
                <input
                  type="text"
                  value={form.caption}
                  onChange={(event) => setForm((previous) => ({ ...previous, caption: event.target.value }))}
                  placeholder="Bridal soft glam"
                />
              </label>

              <label>
                Display order
                <input
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={(event) => setForm((previous) => ({ ...previous, order: event.target.value }))}
                  placeholder="1"
                />
              </label>

              <button className="btn btn-primary" type="submit" disabled={loading || (!form.file && !editingId)}>
                {loading ? (editingId ? "Updating..." : "Uploading...") : editingId ? "Save Changes" : "Upload to Portfolio"}
              </button>

              {editingId && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                    setStatus({ type: "", message: "" });
                  }}
                >
                  Cancel Edit
                </button>
              )}

              <div className={`admin-status ${status.type}`}>{status.message}</div>
            </form>
          </div>

          <div className="admin-panel">
            <h2>Portfolio Items</h2>
            <div className="admin-grid">
              {items.length === 0 ? (
                <p>No media uploaded yet. Your first upload will appear here and on the portfolio page.</p>
              ) : (
                items.map((item) => (
                  <article key={item.id} className={`media-card preview-${item.type}`}>
                    {item.type === "video" ? (
                      <video controls playsInline preload="metadata">
                        <source src={item.url} type="video/mp4" />
                      </video>
                    ) : (
                      <img src={item.url} alt={item.caption || "Portfolio content"} />
                    )}
                    <h3>{item.caption}</h3>
                    <p>{item.type === "video" ? "Video" : "Photo"} · order {item.order}</p>
                    <div className="media-card-actions">
                      <button className="btn btn-secondary" type="button" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={() => handleDelete(item.id)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
