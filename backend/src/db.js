import knex from "knex";
import dotenv from "dotenv";
dotenv.config();
const isProd = process.env.NODE_ENV === "production";
const config = isProd
    ? {
        client: "pg",
        connection: process.env.DATABASE_URL,
        pool: { min: 2, max: 10 },
    }
    : {
        client: "sqlite3",
        connection: {
            filename: process.env.DB_PATH || "./whispers.db",
        },
        useNullAsDefault: true,
    };
export const db = knex(config);
export default db;
