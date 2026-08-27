import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sprout, Lock, ShieldCheck, Truck, ShoppingBasket } from "lucide-react";
import api from "../api/axios";

const ROLE_INFO = {
  admin: {
    label: "Administrateur",
    color: "#3F6B3F",
    roleValue: 1,
    icon: ShieldCheck,
    overlay: "linear-gradient(135deg, rgba(31,58,36,0.88) 0%, rgba(31,58,36,0.55) 45%, rgba(20,30,15,0.35) 100%)",
  },
  fournisseur: {
    label: "Fournisseur",
    color: "#C79A2E",
    roleValue: 2,
    icon: Truck,
    overlay: "linear-gradient(135deg, rgba(90,66,15,0.85) 0%, rgba(122,90,20,0.55) 45%, rgba(20,30,15,0.35) 100%)",
  },
  client: {
    label: "Client",
    color: "#D2673A",
    roleValue: 3,
    icon: ShoppingBasket,
    overlay: "linear-gradient(135deg, rgba(90,40,20,0.85) 0%, rgba(120,55,30,0.55) 45%, rgba(20,30,15,0.35) 100%)",
  },
};

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const info = ROLE_INFO[role] || ROLE_INFO.client;
  const RoleIcon = info.icon;

  const [mode, setMode] = useState("login");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await api.post("/auth/login", { email, motDePasse });
        localStorage.setItem("grenier_token", res.data.token);
        localStorage.setItem("grenier_user", JSON.stringify(res.data.user));
        localStorage.setItem("grenier_login_time", Date.now().toString());
        navigate(`/espace/${role}`);
     } else {
        const res = await api.post("/auth/register", {
          nom,
          email,
          motDePasse,
          role: info.roleValue,
        });
        if (role === "admin") {
          setSuccess(res.data.message);
          setMode("login");
        } else {
          navigate(`/attente/${role}`, { state: { email } });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...styles.root,
        backgroundImage: `${info.overlay}, url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80')`,
      }}
    >
      <RoleIcon size={420} color="rgba(255,255,255,0.08)" strokeWidth={1} style={styles.watermark} />

      <div style={styles.card}>
        <div style={{ ...styles.badge, background: info.color }}>
          <RoleIcon size={20} color="#fff" />
        </div>
        <h2 style={styles.title}>Espace {info.label}</h2>
        <p style={styles.subtitle}>
          {mode === "login" ? "Connectez-vous à votre espace" : "Créez votre compte"}
        </p>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive(info.color) : {}) }}
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
          >
            Connexion
          </button>
          <button
            style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive(info.color) : {}) }}
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {mode === "register" && (
            <input
              style={styles.input}
              placeholder="Nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" disabled={loading} style={{ ...styles.submit, background: info.color }}>
            <Lock size={14} />
            {loading ? "Veuillez patienter..." : mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <button style={styles.back} onClick={() => navigate("/")}>← Retour à l'accueil</button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    backgroundSize: "cover", backgroundPosition: "center", fontFamily: "'Work Sans', sans-serif",
    padding: 20, boxSizing: "border-box", position: "relative", overflow: "hidden",
  },
  watermark: { position: "absolute", bottom: -80, right: -60, pointerEvents: "none" },
  card: {
    background: "#FBF8F0", borderRadius: 16, padding: "36px 32px", width: 380, maxWidth: "100%",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)", textAlign: "center", position: "relative", zIndex: 1,
  },
  badge: {
    width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 14px",
  },
  title: { fontSize: 20, margin: "0 0 4px", color: "#1F3A24" },
  subtitle: { fontSize: 13, color: "#6B7A63", margin: "0 0 20px" },
  tabs: { display: "flex", background: "#F1EEE3", borderRadius: 8, padding: 4 },
  tab: {
    flex: 1, border: "none", background: "transparent", padding: "8px 0", borderRadius: 6,
    fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6B7A63",
  },
  tabActive: (color) => ({ background: "#fff", color, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }),
  input: {
    width: "100%", padding: "11px 14px", marginBottom: 12, borderRadius: 8,
    border: "1px solid #E0DCCB", fontSize: 14, boxSizing: "border-box",
  },
  submit: {
    width: "100%", border: "none", color: "#fff", padding: "12px 0", borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 8, marginTop: 6,
  },
  error: { color: "#C0392B", fontSize: 12.5, marginBottom: 10 },
  success: { color: "#2E7D32", fontSize: 12.5, marginBottom: 10 },
  back: {
    marginTop: 18, background: "none", border: "none", color: "#fff", opacity: 0.75,
    fontSize: 12.5, cursor: "pointer",
  },
};