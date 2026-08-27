import React, { useState } from "react";
import { Pencil, Trash2, ShoppingCart, Truck } from "lucide-react";

export default function ProduitsTable({ produits, color, mode, onEdit, onDelete, onOrder, onDeliver }) {
  const [quantites, setQuantites] = useState({});

  if (produits.length === 0) {
    return <p style={{ color: "#8B9A83" }}>Aucun produit dans le catalogue.</p>;
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Produit</th>
            <th style={styles.th}>Catégorie</th>
            <th style={styles.th}>Prix (DT)</th>
            <th style={styles.th}>Stock</th>
            {(mode === "client" || mode === "fournisseur") && <th style={styles.th}>Qté</th>}
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p) => (
            <tr key={p.id} style={styles.tr}>
              <td style={styles.td}><strong>{p.nom}</strong></td>
              <td style={styles.td}>{p.categorie}</td>
              <td style={styles.td}>{p.prixUnitaire}</td>
              <td style={styles.td}>{p.quantiteStock}</td>
              {(mode === "client" || mode === "fournisseur") && (
                <td style={styles.td}>
                  <input
                    type="number" min="1" style={styles.qtyInput}
                    value={quantites[p.id] || ""}
                    onChange={(e) => setQuantites({ ...quantites, [p.id]: e.target.value })}
                  />
                </td>
              )}
              <td style={styles.td}>
                <div style={{ display: "flex", gap: 6 }}>
                  {mode === "client" && (
                    <button style={{ ...styles.btn, background: color }}
                      onClick={() => onOrder(p.id, parseInt(quantites[p.id] || "1", 10))}>
                      <ShoppingCart size={13} /> Commander
                    </button>
                  )}
                  {mode === "fournisseur" && (
                    <button style={{ ...styles.btn, background: color }}
                      onClick={() => onDeliver(p.id, parseInt(quantites[p.id] || "1", 10))}>
                      <Truck size={13} /> Livrer
                    </button>
                  )}
                  {(mode === "admin" || mode === "fournisseur") && (
                    <>
                      <button style={{ ...styles.iconBtn, borderColor: color, color }} onClick={() => onEdit(p)}>
                        <Pencil size={13} />
                      </button>
                      <button style={{ ...styles.iconBtn, borderColor: "#B0413E", color: "#B0413E" }} onClick={() => onDelete(p.id)}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrapper: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(31,58,36,0.08)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: {
    textAlign: "left", padding: "12px 16px", background: "#F1EEE3",
    fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.5, color: "#6B7A63",
  },
  tr: { borderBottom: "1px solid rgba(31,58,36,0.06)" },
  td: { padding: "12px 16px", color: "#33422E" },
  qtyInput: { width: 55, padding: "6px", borderRadius: 6, border: "1px solid #E0DCCB", textAlign: "center" },
  btn: {
    display: "flex", alignItems: "center", gap: 5, border: "none", color: "#fff",
    padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
  iconBtn: {
    background: "#fff", border: "1.5px solid", borderRadius: 6, padding: "6px 8px",
    cursor: "pointer", display: "flex", alignItems: "center",
  },
};