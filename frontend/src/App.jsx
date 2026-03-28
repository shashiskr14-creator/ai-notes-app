import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5001";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleNoteChange = (e) => {
    setNoteForm({ ...noteForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API}/api/auth/register`, authForm);
      alert("Registered successfully. Please login.");
      setIsLogin(true);
      setAuthForm({ email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, authForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.user.email);
      setToken(res.data.token);
      setUserEmail(res.data.user.email);
      setAuthForm({ email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken("");
    setUserEmail("");
    setNotes([]);
    setSummary("");
    setNoteForm({ title: "", content: "" });
    setEditingId(null);
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API}/api/notes`, authHeaders);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      alert("Title and content are required");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API}/api/notes/${editingId}`, noteForm, authHeaders);
        setEditingId(null);
      } else {
        await axios.post(`${API}/api/notes`, noteForm, authHeaders);
      }

      setNoteForm({ title: "", content: "" });
      setSummary("");
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save note");
    }
  };

  const handleEditNote = (note) => {
    setEditingId(note._id);
    setNoteForm({
      title: note.title,
      content: note.content,
    });
    setSummary("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`${API}/api/notes/${id}`, authHeaders);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete note");
    }
  };

  const handleSummarize = async () => {
    if (!noteForm.content.trim()) {
      alert("Enter note content first");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/api/ai/summarize`,
        { text: noteForm.content },
        authHeaders
      );
      setSummary(res.data.summary);
    } catch (err) {
      alert(err.response?.data?.message || "Summarization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  if (!token) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <div className="brand-badge">AI Powered Notes</div>
          <h1>AI Notes App</h1>
          <p className="subtitle">
            Organize your thoughts, save notes securely, and generate quick summaries.
          </p>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={authForm.email}
              onChange={handleAuthChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={authForm.password}
              onChange={handleAuthChange}
            />
          </div>

          <button className="primary-btn" onClick={isLogin ? handleLogin : handleRegister}>
            {isLogin ? "Login" : "Register"}
          </button>

          <p className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="app-shell">
        <header className="topbar">
          <div>
            <p className="brand-badge">Full Stack + AI</p>
            <h1>AI Notes App</h1>
            <p className="subtitle">
              Create, manage, and summarize your notes with a clean dashboard.
            </p>
          </div>

          <div className="user-box">
            <span>{userEmail}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="grid-layout">
          <div className="card editor-card">
            <h2>{editingId ? "Edit Note" : "Create a New Note"}</h2>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter note title"
                value={noteForm.title}
                onChange={handleNoteChange}
              />
            </div>

            <div className="form-group">
              <label>Content</label>
              <textarea
                name="content"
                rows="8"
                placeholder="Write your note here..."
                value={noteForm.content}
                onChange={handleNoteChange}
              />
            </div>

            <div className="button-row">
              <button
                className="primary-btn"
                onClick={handleSaveNote}
                disabled={!noteForm.title.trim() || !noteForm.content.trim()}
              >
                {editingId ? "Update Note" : "Save Note"}
              </button>

              <button
                className="secondary-btn"
                onClick={handleSummarize}
                disabled={!noteForm.content.trim() || loading}
              >
                {loading ? "Summarizing..." : "Summarize"}
              </button>

              {editingId && (
                <button
                  className="ghost-btn"
                  onClick={() => {
                    setEditingId(null);
                    setNoteForm({ title: "", content: "" });
                    setSummary("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            {summary && (
              <div className="summary-box">
                <h3>AI Summary</h3>
                <p>{summary}</p>
              </div>
            )}
          </div>

          <div className="card notes-card">
            <h2>My Notes</h2>

            {notes.length === 0 ? (
              <p className="empty-state">
                No notes yet. Start by creating your first note 🚀
              </p>
            ) : (
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note._id} className="note-item">
                    <div className="note-head">
                      <h3>{note.title}</h3>
                    </div>
                    <p>{note.content}</p>
                    <div className="note-actions">
                      <button className="secondary-btn small-btn" onClick={() => handleEditNote(note)}>
                        Edit
                      </button>
                      <button className="danger-btn small-btn" onClick={() => handleDeleteNote(note._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;