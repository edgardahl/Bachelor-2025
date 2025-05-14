// Helmet brukes for å sikre Express-applikasjoner ved å sette forskjellige HTTP-headere.
// Det bidrar til å beskytte mot vanlige sikkerhetstrusler som XSS, clickjacking og data sniffing.
// Vi brukte en egendefinert konfigurasjon av Helmet i stedet for å bare kalle helmet() med default-verdier fordi vi ønsket mer kontroll over sikkerhetsnivået

import helmet from "helmet";

// Konfigurerer Helmet for å sette sikre HTTP-headere
const helmetMiddleware = helmet({
  // Aktiverer Content Security Policy (CSP) for å begrense hvilke ressurser som kan lastes inn
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Bare tillat innhold fra samme opprinnelse
      scriptSrc: ["'self'"], // Tillat bare scripts fra samme opprinnelse
      styleSrc: ["'self'"], // Tillat bare stylesheets fra samme opprinnelse
      objectSrc: ["'none'"], // Blokker all <object>, <embed> og <applet>
      imgSrc: ["'self'", "data:"], // Tillat bilder fra samme opprinnelse + data-URIs
      connectSrc: [
        "'self'",
        process.env.BACKEND_URL ||
          "https://bachelor-backend-production.up.railway.app/api",
        // Tillat API-kall til backend (f.eks. via fetch/AJAX)
      ],
    },
  },
  frameguard: { action: "sameorigin" }, // Hindrer side fra å bli vist i iframe på andre domener (clickjacking-beskyttelse)
  hidePoweredBy: true, // Fjerner "X-Powered-By"-header for å skjule at appen kjører på Express
  noSniff: true, // Hindrer nettlesere fra å gjette MIME-type (X-Content-Type-Options: nosniff)
});

export default helmetMiddleware;
