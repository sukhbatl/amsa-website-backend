// server/config/validateEnv.js
import { cleanEnv, str, port } from "envalid";

export const validateEnv = () => {
    // Support either DATABASE_URL (Supabase) or individual DB vars (local)
    const dbUrl = process.env.DATABASE_URL;
    
    return cleanEnv(process.env, {
        // Make individual DB vars optional if DATABASE_URL is provided
        DB_HOST: str({ desc: "Database host", default: dbUrl ? "" : undefined }),
        DB_NAME: str({ desc: "Database name", default: dbUrl ? "" : undefined }),
        DB_USER: str({ desc: "Database user", default: dbUrl ? "" : undefined }),
        DB_PASS: str({ desc: "Database password", default: dbUrl ? "" : undefined }),
        DATABASE_URL: str({ desc: "Database URL (PostgreSQL)", default: "" }),
        JWT_SECRET: str({ desc: "JWT secret key" }),
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
