import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Espace from "./pages/Espace";
import Attente from "./pages/Attente";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/:role" element={<Login />} />
      <Route
        path="/espace/:role"
        element={
          <ProtectedRoute>
            <Espace />
          </ProtectedRoute>
        }
      />
      <Route path="/attente/:role" element={<Attente />} />
    </Routes>
  );
}

export default App;