import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Sprout, LogOut, Check, X, Clock, ShoppingCart, Package, Truck,
  PlusCircle, Pencil, Trash2, AlertTriangle, Users, Store, LayoutDashboard, TrendingUp,
} from "lucide-react";
import api from "../api/axios";
import Modal from "../components/Modal";

const ROLE_LABEL = { admin: "Administrateur", fournisseur: "Fournisseur", client: "Client" };
const ROLE_COLOR = { admin: "#3F6B3F", fournisseur: "#C79A2E", client: "#D2673A" };
const ROLE_OVERLAY = {
  admin: "linear-gradient(120deg, rgba(31,58,36,0.88) 0%, rgba(31,58,36,0.55) 45%, rgba(20,30,15,0.3) 100%)",
  fournisseur: "linear-gradient(120deg, rgba(90,66,15,0.85) 0%, rgba(122,90,20,0.5) 45%, rgba(20,30,15,0.3) 100%)",
  client: "linear-gradient(120deg, rgba(90,40,20,0.85) 0%, rgba(120,55,30,0.5) 45%, rgba(20,30,15,0.3) 100%)",
};
const DUREE_SESSION_MS = 30 * 60 * 1000;

const SECTIONS = {
  admin: [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { key: "comptes", label: "Comptes en attente", icon: Clock },
    { key: "commandes", label: "Commandes en attente", icon: ShoppingCart },
    { key: "livraisons", label: "Livraisons en attente", icon: Truck },
    { key: "produits", label: "Produits", icon: Package },
    { key: "clients", label: "Clients", icon: Users },
    { key: "fournisseurs", label: "Fournisseurs", icon: Store },
  ],
  fournisseur: [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { key: "catalogue", label: "Catalogue produits", icon: Package },
    { key: "mesLivraisons", label: "Mes livraisons", icon: Truck },
  ],
  client: [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { key: "catalogue", label: "Catalogue produits", icon: Package },
    { key: "mesCommandes", label: "Mes commandes", icon: ShoppingCart },
  ],
};

export default function Espace() {
  const { role } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("grenier_user") || "null");
  const color = ROLE_COLOR[role] || "#3F6B3F";
  const sections = SECTIONS[role] || [];
  const [activeSection, setActiveSection] = useState(sections[0]?.key);
  const timerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("grenier_token");
    localStorage.removeItem("grenier_user");
    localStorage.removeItem("grenier_login_time");
    navigate("/");
  };

  useEffect(() => {
    const token = localStorage.getItem("grenier_token");
    if (!token) {
      navigate(`/login/${role}`);
      return;
    }

    const loginTime = parseInt(localStorage.getItem("grenier_login_time") || Date.now(), 10);
    const ecoule = Date.now() - loginTime;
    const restant = DUREE_SESSION_MS - ecoule;

    if (restant <= 0) {
      handleLogout();
      return;
    }

    timerRef.current = setTimeout(() => {
      handleLogout();
    }, restant);

    return () => clearTimeout(timerRef.current);
  }, [role, navigate]);

  return (
    <div style={styles.root}>
      <nav style={{ ...styles.nav, borderBottom: `3px solid ${color}` }}>
        <div style={styles.navLeft}>
          <Sprout size={20} color={color} />
          <span style={styles.navTitle}>Grenier — Espace {ROLE_LABEL[role]}</span>
        </div>
        <div style={styles.navRight}>
          {user && <span style={styles.userName}>{user.nom}</span>}
          <button style={styles.logout} onClick={handleLogout}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </nav>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                ...styles.sideItem,
                ...(activeSection === key ? { background: color, color: "#fff" } : {}),
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <main style={styles.mainArea}>
          {role === "admin" && <AdminDashboard color={color} section={activeSection} user={user} role={role} />}
          {role === "client" && <ClientDashboard color={color} section={activeSection} user={user} role={role} />}
          {role === "fournisseur" && <FournisseurDashboard color={color} section={activeSection} user={user} role={role} />}
        </main>
      </div>
    </div>
  );
}

// ---------- ÉCRAN D'ACCUEIL / TABLEAU DE BORD ----------
function WelcomeHero({ role, color, user, stats }) {
  return (
    <div
      style={{
        ...styles.hero,
        backgroundImage: `${ROLE_OVERLAY[role]}, url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')`,
      }}
    >
      <div style={styles.heroBadge}><Sprout size={22} color="#fff" /></div>
      <h1 style={styles.heroTitle}>Bienvenue, {user?.nom || ""} 👋</h1>
      <p style={styles.heroSubtitle}>
        Espace {ROLE_LABEL[role]} — voici un aperçu de votre activité sur Grenier.
      </p>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: color + "22" }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// ---------- TABLEAU PRODUITS RÉUTILISABLE ----------
function ProductsTable({ produits, renderActions }) {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.tableEl}>
        <thead>
          <tr>
            <th style={styles.th}>Produit</th>
            <th style={styles.th}>Catégorie</th>
            <th style={styles.th}>Prix (DT)</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p) => (
            <tr key={p.id}>
              <td style={styles.td}><strong>{p.nom}</strong></td>
              <td style={styles.td}>{p.categorie}</td>
              <td style={styles.td}>{p.prixUnitaire}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.stockBadge,
                  background: p.quantiteStock <= p.seuilAlerte ? "#F5D9D2" : "#E4EEDD",
                  color: p.quantiteStock <= p.seuilAlerte ? "#B0413E" : "#3F6B3F",
                }}>
                  {p.quantiteStock}
                </span>
              </td>
              <td style={styles.td}>{renderActions(p)}</td>
            </tr>
          ))}
          {produits.length === 0 && (
            <tr><td colSpan={5} style={{ ...styles.td, textAlign: "center", color: "#8B9A83" }}>Aucun produit.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------- ESPACE CLIENT ----------
function ClientDashboard({ color, section, user, role }) {
  const [produits, setProduits] = useState([]);
  const [mesCommandes, setMesCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [quantites, setQuantites] = useState({});

  const charger = async () => {
    setLoading(true);
    try {
      const [resProduits, resCommandes] = await Promise.all([
        api.get("/produits"),
        api.get("/commandes/mes-commandes"),
      ]);
      setProduits(resProduits.data);
      setMesCommandes(resCommandes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const commander = async (produitId) => {
    const quantite = parseInt(quantites[produitId] || "0", 10);
    const produit = produits.find((p) => p.id === produitId);

    if (!quantite || quantite < 1) {
      setMsg("Veuillez indiquer une quantité valide (minimum 1).");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    if (produit && quantite > produit.quantiteStock) {
      setMsg(`Quantité trop élevée : seulement ${produit.quantiteStock} unité(s) disponible(s) en stock.`);
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    try {
      const res = await api.post("/commandes", { produitId, quantite });
      setMsg(res.data.message);
      setTimeout(() => setMsg(""), 3000);
      charger();
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de la commande.");
    }
  };

  const statutLabel = (s) => (s === 0 ? "En attente" : s === 1 ? "Validée" : "Refusée");
  const statutColor = (s) => (s === 0 ? "#C79A2E" : s === 1 ? "#3F6B3F" : "#B0413E");

  if (loading) return <p>Chargement...</p>;

  const enAttente = mesCommandes.filter((c) => c.statut === 0).length;
  const validees = mesCommandes.filter((c) => c.statut === 1).length;
  const refusees = mesCommandes.filter((c) => c.statut === 2).length;

  return (
    <div>
      {msg && <div style={styles.actionMsg}>{msg}</div>}

      {section === "dashboard" && (
        <div>
          <WelcomeHero role={role} color={color} user={user} />
          <div style={styles.statsGrid}>
            <StatCard label="Produits disponibles" value={produits.length} color={color} icon={Package} />
            <StatCard label="Commandes en attente" value={enAttente} color="#C79A2E" icon={Clock} />
            <StatCard label="Commandes validées" value={validees} color="#3F6B3F" icon={Check} />
            <StatCard label="Commandes refusées" value={refusees} color="#B0413E" icon={X} />
          </div>
        </div>
      )}

      {section === "catalogue" && (
        <div>
          <h2 style={styles.sectionTitle}><Package size={18} color={color} /> Catalogue produits</h2>
          <ProductsTable
            produits={produits}
            renderActions={(p) => (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="number" min="1" max={p.quantiteStock} placeholder="Qté"
                  style={styles.qtyInputSm}
                  value={quantites[p.id] || ""}
                  onChange={(e) => setQuantites({ ...quantites, [p.id]: e.target.value })}
                />
                <button style={{ ...styles.actionBtn, background: color }} onClick={() => commander(p.id)}>
                  <ShoppingCart size={13} /> Commander
                </button>
              </div>
            )}
          />
        </div>
      )}

      {section === "mesCommandes" && (
        <div>
          <h2 style={styles.sectionTitle}>Mes commandes</h2>
          <div style={styles.table}>
            {mesCommandes.length === 0 && <p style={{ color: "#8B9A83" }}>Aucune commande pour le moment.</p>}
            {mesCommandes.map((c) => (
              <div key={c.id} style={styles.row}>
                <div style={{ fontWeight: 600 }}>{c.produit}</div>
                <div style={{ fontSize: 12.5, color: "#8B9A83" }}>Qté : {c.quantite}</div>
                <span style={{ ...styles.statutTag, background: statutColor(c.statut) }}>{statutLabel(c.statut)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- ESPACE FOURNISSEUR ----------
function FournisseurDashboard({ color, section, user, role }) {
  const [produits, setProduits] = useState([]);
  const [mesLivraisons, setMesLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [quantites, setQuantites] = useState({});
  const [modalProduit, setModalProduit] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ nom: "", categorie: "", prixUnitaire: "", quantiteStock: "", seuilAlerte: "10" });

  const charger = async () => {
    setLoading(true);
    try {
      const [resProduits, resLivraisons] = await Promise.all([
        api.get("/produits"),
        api.get("/livraisons/mes-livraisons"),
      ]);
      setProduits(resProduits.data);
      setMesLivraisons(resLivraisons.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const proposerLivraison = async (produitId) => {
    const quantite = parseInt(quantites[produitId] || "0", 10);

    if (!quantite || quantite < 1) {
      setMsg("Veuillez indiquer une quantité valide (minimum 1).");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    if (quantite > 100000) {
      setMsg("Quantité trop élevée, vérifiez la valeur saisie.");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    try {
      const res = await api.post("/livraisons", { produitId, quantite });
      setMsg(res.data.message);
      setTimeout(() => setMsg(""), 3000);
      charger();
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de la proposition.");
    }
  };

  const ouvrirNouveau = () => {
    setFormError("");
    setForm({ nom: "", categorie: "", prixUnitaire: "", quantiteStock: "", seuilAlerte: "10" });
    setModalProduit("new");
  };

  const ouvrirEdition = (p) => {
    setFormError("");
    setForm({
      nom: p.nom, categorie: p.categorie, prixUnitaire: p.prixUnitaire,
      quantiteStock: p.quantiteStock, seuilAlerte: p.seuilAlerte,
    });
    setModalProduit(p);
  };

  const enregistrerProduit = async (e) => {
    e.preventDefault();
    setFormError("");
    const payload = {
      nom: form.nom,
      categorie: form.categorie,
      prixUnitaire: parseFloat(form.prixUnitaire),
      quantiteStock: parseInt(form.quantiteStock, 10),
      seuilAlerte: parseInt(form.seuilAlerte, 10),
    };
    try {
      if (modalProduit === "new") {
        await api.post("/produits", payload);
        setMsg("Produit ajouté au catalogue.");
      } else {
        await api.put(`/produits/${modalProduit.id}`, payload);
        setMsg("Produit modifié.");
      }
      setTimeout(() => setMsg(""), 3000);
      setModalProduit(null);
      charger();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Erreur inconnue.");
    }
  };

  const supprimerProduit = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/produits/${id}`);
      setMsg("Produit supprimé.");
      setTimeout(() => setMsg(""), 3000);
      charger();
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const statutLabel = (s) => (s === 0 ? "En attente" : s === 1 ? "Validée" : "Refusée");
  const statutColor = (s) => (s === 0 ? "#C79A2E" : s === 1 ? "#3F6B3F" : "#B0413E");

  if (loading) return <p>Chargement...</p>;

  const enAttente = mesLivraisons.filter((l) => l.statut === 0).length;
  const validees = mesLivraisons.filter((l) => l.statut === 1).length;
  const refusees = mesLivraisons.filter((l) => l.statut === 2).length;

  return (
    <div>
      {msg && <div style={styles.actionMsg}>{msg}</div>}

      {section === "dashboard" && (
        <div>
          <WelcomeHero role={role} color={color} user={user} />
          <div style={styles.statsGrid}>
            <StatCard label="Produits au catalogue" value={produits.length} color={color} icon={Package} />
            <StatCard label="Livraisons en attente" value={enAttente} color="#C79A2E" icon={Clock} />
            <StatCard label="Livraisons validées" value={validees} color="#3F6B3F" icon={Check} />
            <StatCard label="Livraisons refusées" value={refusees} color="#B0413E" icon={X} />
          </div>
        </div>
      )}

      {section === "catalogue" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={styles.sectionTitle}><Package size={18} color={color} /> Catalogue produits</h2>
            <button style={{ ...styles.actionBtn, background: color }} onClick={ouvrirNouveau}>
              <PlusCircle size={14} /> Nouveau produit
            </button>
          </div>

          <ProductsTable
            produits={produits}
            renderActions={(p) => (
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="number" min="1" placeholder="Qté" style={styles.qtyInputSm}
                  value={quantites[p.id] || ""}
                  onChange={(e) => setQuantites({ ...quantites, [p.id]: e.target.value })}
                />
                <button style={styles.iconBtn(color)} title="Proposer une livraison" onClick={() => proposerLivraison(p.id)}>
                  <Truck size={14} />
                </button>
                <button style={styles.iconBtn("#6B7A63")} title="Modifier" onClick={() => ouvrirEdition(p)}>
                  <Pencil size={14} />
                </button>
                <button style={styles.iconBtn("#B0413E")} title="Supprimer" onClick={() => supprimerProduit(p.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {section === "mesLivraisons" && (
        <div>
          <h2 style={styles.sectionTitle}>Mes propositions de livraison</h2>
          <div style={styles.table}>
            {mesLivraisons.length === 0 && <p style={{ color: "#8B9A83" }}>Aucune livraison proposée pour le moment.</p>}
            {mesLivraisons.map((l) => (
              <div key={l.id} style={styles.row}>
                <div style={{ fontWeight: 600 }}>{l.produit}</div>
                <div style={{ fontSize: 12.5, color: "#8B9A83" }}>Qté : {l.quantite}</div>
                <span style={{ ...styles.statutTag, background: statutColor(l.statut) }}>{statutLabel(l.statut)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalProduit && (
        <Modal title={modalProduit === "new" ? "Nouveau produit" : "Modifier le produit"} onClose={() => setModalProduit(null)} color={color}>
          <form onSubmit={enregistrerProduit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={styles.input} placeholder="Nom du produit" required
              value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <input style={styles.input} placeholder="Catégorie" required
              value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
            <input style={styles.input} type="number" step="0.01" placeholder="Prix unitaire (DT)" required
              value={form.prixUnitaire} onChange={(e) => setForm({ ...form, prixUnitaire: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Stock" required
              value={form.quantiteStock} onChange={(e) => setForm({ ...form, quantiteStock: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Seuil d'alerte" required
              value={form.seuilAlerte} onChange={(e) => setForm({ ...form, seuilAlerte: e.target.value })} />
            {formError && <p style={{ color: "#B0413E", fontSize: 12.5, margin: 0 }}>{formError}</p>}
            <button type="submit" style={{ ...styles.actionBtn, background: color, justifyContent: "center" }}>
              {modalProduit === "new" ? "Créer le produit" : "Enregistrer les modifications"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------- ESPACE ADMIN ----------
function AdminDashboard({ color, section, user, role }) {
  const [comptes, setComptes] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [modalProduit, setModalProduit] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ nom: "", categorie: "", prixUnitaire: "", quantiteStock: "", seuilAlerte: "10" });

  const charger = async () => {
    setLoading(true);
    try {
      const [resComptes, resCommandes, resLivraisons, resProduits, resClients, resFournisseurs] = await Promise.all([
        api.get("/auth/comptes-en-attente"),
        api.get("/commandes/en-attente"),
        api.get("/livraisons/en-attente"),
        api.get("/produits"),
        api.get("/auth/utilisateurs/client"),
        api.get("/auth/utilisateurs/fournisseur"),
      ]);
      setComptes(resComptes.data);
      setCommandes(resCommandes.data);
      setLivraisons(resLivraisons.data);
      setProduits(resProduits.data);
      setClients(resClients.data);
      setFournisseurs(resFournisseurs.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const traiterCompte = async (id, action) => {
    try {
      const res = await api.put(`/auth/${action}/${id}`);
      setActionMsg(res.data.message);
      setTimeout(() => setActionMsg(""), 3000);
      charger();
    } catch (err) {
      setActionMsg("Erreur lors du traitement.");
    }
  };

  const traiterCommande = async (id, action) => {
    try {
      const res = await api.put(`/commandes/${action}/${id}`);
      setActionMsg(res.data.message);
      setTimeout(() => setActionMsg(""), 3000);
      charger();
    } catch (err) {
      setActionMsg(err.response?.data?.message || "Erreur lors du traitement.");
    }
  };

  const attendreReapprovisionnement = (produitNom) => {
    setActionMsg(`Commande de "${produitNom}" laissée en attente jusqu'au réapprovisionnement.`);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const traiterLivraison = async (id, action) => {
    try {
      const res = await api.put(`/livraisons/${action}/${id}`);
      setActionMsg(res.data.message);
      setTimeout(() => setActionMsg(""), 3000);
      charger();
    } catch (err) {
      setActionMsg(err.response?.data?.message || "Erreur lors du traitement.");
    }
  };

  const ouvrirNouveau = () => {
    setFormError("");
    setForm({ nom: "", categorie: "", prixUnitaire: "", quantiteStock: "", seuilAlerte: "10" });
    setModalProduit("new");
  };

  const ouvrirEdition = (p) => {
    setFormError("");
    setForm({
      nom: p.nom, categorie: p.categorie, prixUnitaire: p.prixUnitaire,
      quantiteStock: p.quantiteStock, seuilAlerte: p.seuilAlerte,
    });
    setModalProduit(p);
  };

  const enregistrerProduit = async (e) => {
    e.preventDefault();
    setFormError("");
    const payload = {
      nom: form.nom,
      categorie: form.categorie,
      prixUnitaire: parseFloat(form.prixUnitaire),
      quantiteStock: parseInt(form.quantiteStock, 10),
      seuilAlerte: parseInt(form.seuilAlerte, 10),
    };
    try {
      if (modalProduit === "new") {
        await api.post("/produits", payload);
        setActionMsg("Produit ajouté au catalogue.");
      } else {
        await api.put(`/produits/${modalProduit.id}`, payload);
        setActionMsg("Produit modifié.");
      }
      setTimeout(() => setActionMsg(""), 3000);
      setModalProduit(null);
      charger();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Erreur inconnue.");
    }
  };

  const supprimerProduit = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/produits/${id}`);
      setActionMsg("Produit supprimé.");
      setTimeout(() => setActionMsg(""), 3000);
      charger();
    } catch (err) {
      setActionMsg(err.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  const statutCompteLabel = (s) => (s === 0 ? "En attente" : s === 1 ? "Approuvé" : "Refusé");
  const statutCompteColor = (s) => (s === 0 ? "#C79A2E" : s === 1 ? "#3F6B3F" : "#B0413E");

  return (
    <div>
      {actionMsg && <div style={styles.actionMsg}>{actionMsg}</div>}

      {section === "dashboard" && (
        <div>
          <WelcomeHero role={role} color={color} user={user} />
          <div style={styles.statsGrid}>
            <StatCard label="Comptes en attente" value={comptes.length} color="#C79A2E" icon={Clock} />
            <StatCard label="Commandes en attente" value={commandes.length} color={color} icon={ShoppingCart} />
            <StatCard label="Livraisons en attente" value={livraisons.length} color="#C79A2E" icon={Truck} />
            <StatCard label="Produits au catalogue" value={produits.length} color={color} icon={Package} />
            <StatCard label="Clients actifs" value={clients.filter((c) => c.statutCompte === 1).length} color="#D2673A" icon={Users} />
            <StatCard label="Fournisseurs actifs" value={fournisseurs.filter((f) => f.statutCompte === 1).length} color="#C79A2E" icon={Store} />
          </div>
        </div>
      )}

      {section === "comptes" && (
        <div>
          <h2 style={styles.sectionTitle}><Clock size={18} color={color} /> Comptes en attente de validation</h2>
          {comptes.length === 0 ? (
            <p style={{ color: "#8B9A83" }}>Aucune demande de compte en attente.</p>
          ) : (
            <div style={styles.table}>
              {comptes.map((c) => (
                <div key={c.id} style={styles.row}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.nom}</div>
                    <div style={{ fontSize: 12.5, color: "#8B9A83" }}>{c.email}</div>
                  </div>
                  <span style={styles.roleTag}>{c.role === 2 ? "Fournisseur" : c.role === 3 ? "Client" : "Rôle " + c.role}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...styles.actionBtn, background: "#3F6B3F" }} onClick={() => traiterCompte(c.id, "approuver")}>
                      <Check size={14} /> Approuver
                    </button>
                    <button style={{ ...styles.actionBtn, background: "#B0413E" }} onClick={() => traiterCompte(c.id, "refuser")}>
                      <X size={14} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "commandes" && (
        <div>
          <h2 style={styles.sectionTitle}><ShoppingCart size={18} color={color} /> Commandes en attente</h2>
          {commandes.length === 0 ? (
            <p style={{ color: "#8B9A83" }}>Aucune commande en attente.</p>
          ) : (
            <div style={styles.table}>
              {commandes.map((c) => {
                const rupture = c.quantite > c.stockDisponible;
                return (
                  <div key={c.id} style={{ ...styles.row, ...(rupture ? styles.rowAlert : {}) }}>
                    <div>
                      <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        {rupture && <AlertTriangle size={14} color="#B0413E" />}
                        {c.produit}
                      </div>
                      <div style={{ fontSize: 12.5, color: rupture ? "#B0413E" : "#8B9A83" }}>
                        Client : {c.clientNom} — Qté demandée : {c.quantite} (stock dispo : {c.stockDisponible})
                        {rupture && " — Stock insuffisant !"}
                      </div>
                    </div>
                    {rupture ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ ...styles.actionBtn, background: "#C79A2E" }} onClick={() => attendreReapprovisionnement(c.produit)}>
                          <Clock size={14} /> Attendre le stock
                        </button>
                        <button style={{ ...styles.actionBtn, background: "#B0413E" }} onClick={() => traiterCommande(c.id, "refuser")}>
                          <X size={14} /> Produit indisponible
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ ...styles.actionBtn, background: "#3F6B3F" }} onClick={() => traiterCommande(c.id, "valider")}>
                          <Check size={14} /> Valider
                        </button>
                        <button style={{ ...styles.actionBtn, background: "#B0413E" }} onClick={() => traiterCommande(c.id, "refuser")}>
                          <X size={14} /> Refuser
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {section === "livraisons" && (
        <div>
          <h2 style={styles.sectionTitle}><Truck size={18} color={color} /> Livraisons en attente</h2>
          {livraisons.length === 0 ? (
            <p style={{ color: "#8B9A83" }}>Aucune livraison en attente.</p>
          ) : (
            <div style={styles.table}>
              {livraisons.map((l) => (
                <div key={l.id} style={styles.row}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{l.produit}</div>
                    <div style={{ fontSize: 12.5, color: "#8B9A83" }}>
                      Fournisseur : {l.fournisseurNom} — Qté : {l.quantite} (stock actuel : {l.stockActuel})
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...styles.actionBtn, background: "#3F6B3F" }} onClick={() => traiterLivraison(l.id, "valider")}>
                      <Check size={14} /> Valider
                    </button>
                    <button style={{ ...styles.actionBtn, background: "#B0413E" }} onClick={() => traiterLivraison(l.id, "refuser")}>
                      <X size={14} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "produits" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={styles.sectionTitle}><Package size={18} color={color} /> Tous les produits</h2>
            <button style={{ ...styles.actionBtn, background: color }} onClick={ouvrirNouveau}>
              <PlusCircle size={14} /> Nouveau produit
            </button>
          </div>
          <ProductsTable
            produits={produits}
            renderActions={(p) => (
              <div style={{ display: "flex", gap: 6 }}>
                <button style={styles.iconBtn("#6B7A63")} title="Modifier" onClick={() => ouvrirEdition(p)}>
                  <Pencil size={14} />
                </button>
                <button style={styles.iconBtn("#B0413E")} title="Supprimer" onClick={() => supprimerProduit(p.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        </div>
      )}

      {section === "clients" && (
        <div>
          <h2 style={styles.sectionTitle}><Users size={18} color={color} /> Tous les clients</h2>
          <div style={styles.tableWrap}>
            <table style={styles.tableEl}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td style={styles.td}><strong>{c.nom}</strong></td>
                    <td style={styles.td}>{c.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statutTag, background: statutCompteColor(c.statutCompte) }}>
                        {statutCompteLabel(c.statutCompte)}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(c.dateCreation).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: "#8B9A83" }}>Aucun client.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === "fournisseurs" && (
        <div>
          <h2 style={styles.sectionTitle}><Store size={18} color={color} /> Tous les fournisseurs</h2>
          <div style={styles.tableWrap}>
            <table style={styles.tableEl}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map((f) => (
                  <tr key={f.id}>
                    <td style={styles.td}><strong>{f.nom}</strong></td>
                    <td style={styles.td}>{f.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statutTag, background: statutCompteColor(f.statutCompte) }}>
                        {statutCompteLabel(f.statutCompte)}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(f.dateCreation).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
                {fournisseurs.length === 0 && (
                  <tr><td colSpan={4} style={{ ...styles.td, textAlign: "center", color: "#8B9A83" }}>Aucun fournisseur.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalProduit && (
        <Modal title={modalProduit === "new" ? "Nouveau produit" : "Modifier le produit"} onClose={() => setModalProduit(null)} color={color}>
          <form onSubmit={enregistrerProduit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={styles.input} placeholder="Nom du produit" required
              value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <input style={styles.input} placeholder="Catégorie" required
              value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
            <input style={styles.input} type="number" step="0.01" placeholder="Prix unitaire (DT)" required
              value={form.prixUnitaire} onChange={(e) => setForm({ ...form, prixUnitaire: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Stock" required
              value={form.quantiteStock} onChange={(e) => setForm({ ...form, quantiteStock: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Seuil d'alerte" required
              value={form.seuilAlerte} onChange={(e) => setForm({ ...form, seuilAlerte: e.target.value })} />
            {formError && <p style={{ color: "#B0413E", fontSize: 12.5, margin: 0 }}>{formError}</p>}
            <button type="submit" style={{ ...styles.actionBtn, background: color, justifyContent: "center" }}>
              {modalProduit === "new" ? "Créer le produit" : "Enregistrer les modifications"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#F6F1E4", fontFamily: "'Work Sans', sans-serif" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#fff" },
  navLeft: { display: "flex", alignItems: "center", gap: 10 },
  navTitle: { fontWeight: 700, fontSize: 15, color: "#1F3A24" },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  userName: { fontSize: 13.5, color: "#4C5F45" },
  logout: {
    display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #E0DCCB",
    borderRadius: 8, padding: "7px 12px", fontSize: 12.5, cursor: "pointer", color: "#5C6B55",
  },
  layout: { display: "flex", minHeight: "calc(100vh - 65px)" },
  sidebar: {
    width: 220, background: "#fff", borderRight: "1px solid rgba(31,58,36,0.08)",
    padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0,
  },
  sideItem: {
    display: "flex", alignItems: "center", gap: 10, border: "none", background: "transparent",
    padding: "10px 12px", borderRadius: 8, fontSize: 13.5, cursor: "pointer", textAlign: "left",
    color: "#4C5F45", fontFamily: "'Work Sans', sans-serif",
  },
  mainArea: { flex: 1, padding: "32px", maxWidth: 940 },
  hero: {
    borderRadius: 16, padding: "40px 36px", backgroundSize: "cover", backgroundPosition: "center",
    marginBottom: 28,
  },
  heroBadge: {
    width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  heroTitle: { color: "#fff", fontSize: 26, margin: "0 0 6px", fontWeight: 700 },
  heroSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0 },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14,
  },
  statCard: {
    display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 12,
    padding: "16px 18px", border: "1px solid rgba(31,58,36,0.08)",
  },
  statIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontWeight: 700, color: "#1F3A24" },
  statLabel: { fontSize: 12, color: "#8B9A83" },
  sectionTitle: { display: "flex", alignItems: "center", gap: 8, fontSize: 18, color: "#1F3A24" },
  actionMsg: { background: "#E9F3E9", color: "#2E7D32", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 },
  table: { display: "flex", flexDirection: "column", gap: 10, marginTop: 16 },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "#fff", borderRadius: 10, padding: "14px 18px", border: "1px solid rgba(31,58,36,0.08)",
  },
  rowAlert: { background: "#FDF3EF", border: "1px solid #E8A98F" },
  roleTag: { fontSize: 11.5, fontWeight: 600, color: "#6B7A63", background: "#F1EEE3", padding: "4px 10px", borderRadius: 6 },
  statutTag: { fontSize: 11.5, fontWeight: 600, color: "#fff", padding: "4px 10px", borderRadius: 6 },
  actionBtn: {
    display: "flex", alignItems: "center", gap: 5, border: "none", color: "#fff",
    padding: "7px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
  iconBtn: (color) => ({
    display: "flex", alignItems: "center", justifyContent: "center", border: "none", color: "#fff",
    background: color, width: 28, height: 28, borderRadius: 6, cursor: "pointer",
  }),
  qtyInputSm: { width: 50, padding: "6px 4px", borderRadius: 6, border: "1px solid #E0DCCB", fontSize: 12.5, textAlign: "center" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #E0DCCB", fontSize: 13.5 },
  tableWrap: {
    marginTop: 16, background: "#fff", borderRadius: 12, border: "1px solid rgba(31,58,36,0.08)",
    overflow: "hidden", overflowX: "auto",
  },
  tableEl: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: {
    textAlign: "left", padding: "12px 16px", background: "#F1EEE3", color: "#4C5F45",
    fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600,
  },
  td: { padding: "12px 16px", borderTop: "1px solid rgba(31,58,36,0.06)", color: "#1F3A24" },
  stockBadge: { padding: "3px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 600 },
};