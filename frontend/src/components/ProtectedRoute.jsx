import React from "react";
import { useParams, Navigate } from "react-router-dom";

const ROLE_VALUE = { admin: 1, fournisseur: 2, client: 3 };

export default function ProtectedRoute({ children }) {
  const { role } = useParams();
  const token = localStorage.getItem("grenier_token");
  const user = JSON.parse(localStorage.getItem("grenier_user") || "null");

  // Pas connecté du tout → renvoie vers la connexion de l'espace demandé
  if (!token || !user) {
    return <Navigate to={`/login/${role}`} replace />;
  }

  // Connecté, mais avec un rôle différent de celui demandé dans l'URL → renvoie à l'accueil
  const roleAttendu = ROLE_VALUE[role];
  if (user.role !== roleAttendu) {
    return <Navigate to="/" replace />;
  }

  return children;
}