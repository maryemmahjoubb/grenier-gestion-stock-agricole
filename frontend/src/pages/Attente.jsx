import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, Truck } from "lucide-react";
import api from "../api/axios";

const ROLE_INFO = {
  fournisseur: { label: "Fournisseur", color: "#C79A2E", icon: Truck },
  client: { label: "Client", color: "#D2673A", icon: ShieldCheck },
};

const DUREE_SECONDES = 5 * 60; // 5 minutes

export default function Attente() {
  const { role } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const info = ROLE_INFO[role] || ROLE_INFO.client;
  const Icon = info.icon;

  const [secondesRestantes, setSecondesRestantes] = useState(DUREE_SECONDES);
  const notifieRef = useRef(false);

  useEffect(() => {
    if (!email) {
      navigate("/");
      return;
    }

    // Vérifie toutes les 10s si le compte a été approuvé
    const poll = setInterval(async () => {
      try {
        const res = await api.get(`/auth/statut-compte?email=${encodeURIComponent(email)}`);
        if (res.data.statut === 1) {
          clearInterval(poll);
          navigate(`/login/${role}`, { state: { approuve: true } });
        }
      } catch (err) {
        // silencieux : on continue d'attendre
      }
    }, 10000);

    // Compte à rebours
    const timer = setInterval(() => {
      setSecondesRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          clearInterval(poll);
          if (!notifieRef.current) {
            notifieRef.current = true;
            api.post("/auth/relancer-notification").catch(() => {});
          }
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(poll);
      clearInterval(timer);
    };
  }, [email, role, navigate]);

  const minutes = Math.floor(secondesRestantes / 60);
  const secondes = secondesRestantes % 60;

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={{ ...styles.badge, background: info.color }}>
          <Icon size={22} color="#fff" />
        </div>
        <h2 style={styles.title}>En attente de validation</h2>
        <p style={styles.subtitle}>
          Votre demande a été envoyée à un administrateur. Vous serez redirigé automatiquement
          dès que votre compte {info.label.toLowerCase()} sera approuvé.
        </p>

        <div style={styles.timerBox}>
          <Clock size={16} color={info.color} />
          <span style={{ ...styles.timer, color: info.color }}>
            {String(minutes).padStart(2, "0")}:{String(secondes).padStart(2, "0")}
          </span>
        </div>
        <p style={styles.hint}>
          Passé ce délai, l'administrateur sera relancé et vous serez redirigé vers l'accueil.
        </p>

        <button style={styles.back} onClick={() => navigate("/")}>← Retour à l'accueil</button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#F6F1E4", fontFamily: "'Work Sans', sans-serif", padding: 20, boxSizing: "border-box",
  },
  card: {
    background: "#fff", borderRadius: 16, padding: "40px 32px", width: 400, maxWidth: "100%",
    boxShadow: "0 20px 50px rgba(31,58,36,0.15)", textAlign: "center",
  },
  badge: {
    width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 16px",
  },
  title: { fontSize: 20, margin: "0 0 10px", color: "#1F3A24" },
  subtitle: { fontSize: 13.5, color: "#6B7A63", lineHeight: 1.6, margin: "0 0 24px" },
  timerBox: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "#F6F1E4", borderRadius: 10, padding: "14px 0", marginBottom: 12,
  },
  timer: { fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  hint: { fontSize: 12, color: "#8B9A83", marginBottom: 20 },
  back: { background: "none", border: "none", color: "#8B9A83", fontSize: 12.5, cursor: "pointer" },
};