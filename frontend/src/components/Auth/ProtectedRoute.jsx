import { Navigate, useLocation } from "react-router-dom";
import Loading from "../Loading/Loading";
import useAuth from "../../context/UseAuth";

/**
 * ProtectedRoute-komponenten beskytter ruter basert på om brukeren:
 * 1. Er innlogget
 * 2. Har en rolle som er tillatt (f.eks. employee, store_manager eller admin)
 *
 * Dersom brukeren ikke er innlogget eller ikke har rett rolle,
 * blir de sendt tilbake til login-siden.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth(); // Henter brukerobjekt og loading-status fra global AuthContext
  const location = useLocation(); // Brukes for å huske hvor brukeren kom fra

  // Viser loader mens vi venter på at auth-data skal bli tilgjengelig
  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  // Hvis bruker ikke er innlogget, redirect til login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Hvis bruker er innlogget, men ikke har en av de tillatte rollene, redirect til login
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Hvis alt er OK, vis innholdet (f.eks. dashboard)
  return children;
}
