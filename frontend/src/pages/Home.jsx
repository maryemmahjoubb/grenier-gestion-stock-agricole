import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, ShieldCheck, Truck, ShoppingBasket, TrendingUp, Lock, Leaf } from "lucide-react";

const roles = [
  {
    key: "admin",
    label: "Administrateur",
    desc: "Gestion globale et accès aux paramètres du système.",
    icon: ShieldCheck,
    color: "#3F6B3F",
    tint: "rgba(63,107,63,0.12)",
  },
  {
    key: "fournisseur",
    label: "Fournisseur",
    desc: "Suivi des stocks, gestion des livraisons et commandes.",
    icon: Truck,
    color: "#C79A2E",
    tint: "rgba(199,154,46,0.14)",
  },
  {
    key: "client",
    label: "Client",
    desc: "Passer des commandes et consulter vos achats.",
    icon: ShoppingBasket,
    color: "#D2673A",
    tint: "rgba(210,103,58,0.14)",
  },
];

const features = [
  { label: "Fiabilité", desc: "Données sécurisées et traçables", icon: ShieldCheck },
  { label: "Traçabilité", desc: "Suivi complet des mouvements", icon: Sprout },
  { label: "Performance", desc: "Gérez mieux, décidez mieux", icon: TrendingUp },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="g-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Work+Sans:wght@400;500;600&display=swap');

        .g-root {
          font-family: 'Work Sans', sans-serif;
          position: relative;
          min-height: 100vh;
          background:
            linear-gradient(120deg, rgba(251,248,240,0.94) 0%, rgba(251,248,240,0.55) 38%, rgba(20,30,15,0.15) 70%),
            url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80') center/cover no-repeat;
          color: #1F3A24;
          padding: 40px 56px;
          box-sizing: border-box;
        }
        .g-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 56px; }
        .g-logo-badge {
          width: 34px; height: 34px; border-radius: 50%; background: #ffffffcc;
          display: flex; align-items: center; justify-content: center;
        }
        .g-logo-text { font-weight: 700; font-size: 18px; letter-spacing: 1px; }
        .g-logo-sub { font-size: 10.5px; letter-spacing: 1.5px; color: #4C5F45; margin-top: -2px; }

        .g-layout { display: flex; gap: 40px; justify-content: space-between; flex-wrap: wrap; }
        .g-left { max-width: 540px; padding-top: 20px; }
        .g-left h1 {
          font-family: 'Fraunces', serif; font-weight: 700; font-size: 46px;
          line-height: 1.14; margin: 0 0 22px;
        }
        .g-left h1 em { font-style: normal; color: #9B9A46; }
        .g-left p { font-size: 15.5px; line-height: 1.7; color: #3E4E39; max-width: 460px; }

        .g-features { display: flex; gap: 40px; margin-top: 70px; flex-wrap: wrap; }
        .g-feature { max-width: 160px; }
        .g-feature-icon {
          width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
        }
        .g-feature h4 { font-size: 15px; margin: 0 0 6px; color: #fff; }
        .g-feature p { font-size: 12.5px; color: rgba(255,255,255,0.85); line-height: 1.5; margin: 0; }

        .g-copyright { margin-top: 60px; font-size: 12px; color: rgba(255,255,255,0.85); }

        .g-panel {
          width: 460px; max-width: 100%; background: #FBF8F0; border-radius: 18px;
          box-shadow: 0 24px 60px rgba(20,30,15,0.22); overflow: hidden; height: fit-content;
        }
        .g-panel-head { text-align: center; padding: 34px 32px 4px; }
        .g-panel-badge {
          width: 44px; height: 44px; border-radius: 50%; background: #EDE9D8;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;
        }
        .g-panel-head h2 { font-family: 'Fraunces', serif; font-size: 22px; margin: 0 0 6px; color: #1F3A24; }
        .g-panel-head p { font-size: 13px; color: #6B7A63; margin: 0 0 26px; }

        .g-cards { display: flex; align-items: stretch; gap: 12px; padding: 0 20px; }
        .g-card {
          flex: 1; display: flex; flex-direction: column; background: #ffffff;
          border: 1px solid rgba(31,58,36,0.08); border-radius: 12px;
          padding: 18px 14px 20px; text-align: center; cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .g-card:hover { transform: translateY(-3px); box-shadow: 0 10px 22px rgba(31,58,36,0.12); }
        .g-card-icon {
          width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .g-card h3 { font-family: 'Fraunces', serif; font-size: 16px; margin: 0 0 8px; }
        .g-card p { font-size: 11.5px; color: #5C6B55; line-height: 1.45; margin: 0 0 16px; flex: 1; }
        .g-card button {
          width: 100%; border: none; color: #fff; font-size: 12px; font-weight: 600;
          padding: 9px 0; border-radius: 8px; cursor: pointer; white-space: nowrap;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        .g-panel-footer {
          margin-top: 26px; background: #EEF0E4; padding: 18px 24px; display: flex;
          align-items: center; justify-content: space-between; gap: 12px;
        }
        .g-panel-footer-icon {
          width: 30px; height: 30px; border-radius: 50%; border: 1px solid #B9C4AE;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .g-panel-footer p { font-size: 12.5px; color: #33422E; margin: 0; line-height: 1.4; }

        @media (max-width: 900px) {
          .g-root { padding: 28px 22px; }
          .g-left h1 { font-size: 32px; }
          .g-layout { flex-direction: column; }
          .g-cards { flex-direction: column; }
        }
      `}</style>

      <div className="g-logo">
        <div className="g-logo-badge"><Sprout size={18} color="#3F6B3F" /></div>
        <div>
          <div className="g-logo-text">GRENIER</div>
          <div className="g-logo-sub">GESTION DE STOCK AGRICOLE</div>
        </div>
      </div>

      <div className="g-layout">
        <div className="g-left">
          <h1>Chaque sac.<br />Chaque silo.<br />Chaque <em>mouvement</em>,<br />consigné.</h1>
          <p>
            Grenier consigne vos produits, vos mouvements de stock et vos
            fournisseurs dans un registre unique — du fondateur jusqu'au
            client final.
          </p>

          <div className="g-features">
            {features.map(({ label, desc, icon: Icon }) => (
              <div className="g-feature" key={label}>
                <div className="g-feature-icon"><Icon size={18} color="#fff" /></div>
                <h4>{label}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>

          <div className="g-copyright">© 2026 Grenier. Tous droits réservés.</div>
        </div>

        <div className="g-panel">
          <div className="g-panel-head">
            <div className="g-panel-badge"><Sprout size={20} color="#3F6B3F" /></div>
            <h2>Espace Connexion</h2>
            <p>Connectez-vous à votre espace</p>
          </div>

          <div className="g-cards">
            {roles.map(({ key, label, desc, icon: Icon, color, tint }) => (
              <div className="g-card" key={key}>
                <div className="g-card-icon" style={{ background: tint }}>
                  <Icon size={22} color={color} strokeWidth={2} />
                </div>
                <h3 style={{ color }}>{label}</h3>
                <p>{desc}</p>
                <button style={{ background: color }} onClick={() => navigate(`/login/${key}`)}>
                  <Lock size={12} /> Se connecter
                </button>
              </div>
            ))}
          </div>

          <div className="g-panel-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="g-panel-footer-icon"><Sprout size={14} color="#3F6B3F" /></div>
              <p>Du champ à l'assiette,<br />nous gérons chaque étape avec soin.</p>
            </div>
            <Leaf size={30} color="#B9C4AE" strokeWidth={1.2} />
          </div>
        </div>
      </div>
    </div>
  );
} 