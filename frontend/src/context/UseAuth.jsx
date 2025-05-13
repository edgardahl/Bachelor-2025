// Denne filen definerer en custom hook som gjør det enkelt å hente autentiseringsdata
// fra AuthContext. Ved å bruke denne hooken kan komponenter få tilgang til brukerens
// autentiseringsstatus, innloggede brukerdata og funksjoner som setUser og logout
// uten å måtte bruke useContext direkte i hver komponent.

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Custom hook for å hente autentiseringsdata fra AuthContext
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
