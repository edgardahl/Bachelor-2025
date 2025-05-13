// Denne filen oppretter AuthContext, som gjør det mulig å dele autentiseringsdata
// (som brukerens informasjon og autentiseringsfunksjoner) globalt gjennom appen.
// AuthContext kan importeres og brukes i andre komponenter for å få tilgang til
// eller oppdatere autentiseringsrelaterte data.

import { createContext } from 'react';

// Oppretter AuthContext som kan importeres og brukes globalt
export const AuthContext = createContext();
