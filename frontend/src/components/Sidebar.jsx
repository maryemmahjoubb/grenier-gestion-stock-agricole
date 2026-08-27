import React from "react";

export default function Sidebar({ items, active, onSelect, color }) {
  return (
    <div style={styles.sidebar}>
      {items.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              ...styles.item,
              background: isActive ? color : "transparent",
              color: isActive ? "#fff" : "#4C5F45",
            }}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  sidebar: {
    width: 220, flexShrink: 0, background: "#fff", borderRadius: 12,
    border: "1px solid rgba(31,58,36,0.08)", padding: 10,
    display: "flex", flexDirection: "column", gap: 4, height: "fit-content",
    position: "sticky", top: 20,
  },
  item: {
    display: "flex", alignItems: "center", gap: 10, border: "none",
    padding: "10px 12px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
    cursor: "pointer", textAlign: "left",
  },
};