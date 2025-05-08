import helmet from "helmet";

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        process.env.BACKEND_URL ||
          "https://bachelor-backend-production.up.railway.app/api",
      ],
    },
  },
  frameguard: { action: "sameorigin" },
  hidePoweredBy: true,
  noSniff: true,
});

export default helmetMiddleware;
