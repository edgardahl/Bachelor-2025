// Helmet is an Express middleware that adds security-related HTTP headers to help
// protect your app from common web vulnerabilities such as cross-site scripting (XSS),
// clickjacking, and MIME-type sniffing. This configuration sets a basic Content Security Policy (CSP),
// hides the "X-Powered-By" header, and prevents MIME sniffing.

import helmet from 'helmet';

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Only allow resources from same origin
        scriptSrc: ["'self'"], // Only allow JS from your domain
        styleSrc: ["'self'"], // Only allow CSS from your domain
        objectSrc: ["'none'"], // Block plugins like Flash/Java
        imgSrc: ["'self'", "data:"], // Allow local and inline images
        connectSrc: ["'self'", "https://your-backend-url.com"], // Allow API requests to your backend
      },
    },
    frameguard: { action: 'sameorigin' }, // Prevent clickjacking by allowing iframes only from same origin
    hidePoweredBy: true, // Remove X-Powered-By header (hides tech stack)
    noSniff: true, // Prevent MIME-type sniffing (forces correct content type)
  });

export default helmetMiddleware;
