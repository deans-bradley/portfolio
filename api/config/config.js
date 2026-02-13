import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config as _config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || "development";
_config({ path: resolve(__dirname, `./.env.${env}`) });

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  version: process.env.API_VERSION,
  appName: process.env.APP_NAME,
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.DB_NAME,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX),
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || ['http://localhost:3000'],
  emailConfig: {
    from: process.env.EMAIL_FROM,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 465,
    password: process.env.EMAIL_PASSWORD
  },
  ftpConfig: {
    host: process.env.FTP_HOST,
    port: process.env.FTP_PORT,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    remotePath: process.env.FTP_REMOTE_PATH,
    publicUrlBase: process.env.FTP_PUBLIC_URL_BASE
  }
};

export default config;