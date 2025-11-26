import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Use Supabase PostgreSQL via DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for Supabase connection");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
