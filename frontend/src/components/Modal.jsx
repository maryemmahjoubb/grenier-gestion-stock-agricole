import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, color, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.box} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.header, borderBottom: `2px solid ${color}` }}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(20,30,15,0.45)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 20,
  },
  box: {
    background: "#FBF8F0", borderRadius: 14, width: 420, maxWidth: "100%",
    boxShadow: "0 24px 60px rgba(0,0,0,0.3)", overflow: "hidden",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px",
  },
  title: { margin: 0, fontSize: 17, color: "#1F3A24" },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer", color: "#6B7A63",
    display: "flex", alignItems: "center",
  },
  body: { padding: 20 },
};