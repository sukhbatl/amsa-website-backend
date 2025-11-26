// server/config/validateEnv.js
import { cleanEnv, str, port } from "envalid";

export const validateEnv = () => {
    return cleanEnv(process.env, {
        // Supabase PostgreSQL connection string (REQUIRED)
        DATABASE_URL: str({ 
            desc: "Supabase PostgreSQL connection string (required)",
            example: "postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
        }),
        JWT_SECRET: str({ desc: "JWT secret key for authentication" }),
        PORT: port({ default: 4000, desc: "Server port" }),
        NODE_ENV: str({
            choices: ["development", "production", "test"],
            default: "development",
            desc: "Node environment"
        }),
        ALLOWED_ORIGINS: str({
            default: "http://localhost:5173",
            desc: "Comma-separated list of allowed CORS origins"
        })
    });
};
