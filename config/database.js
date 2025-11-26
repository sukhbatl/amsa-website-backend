import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Support both DATABASE_URL (Supabase) and individual env vars
let sequelize;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for Supabase/PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
  });
} else {
  // Fallback to individual env vars for local development
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      logging: false,
    }
  );
}

export default sequelize;
