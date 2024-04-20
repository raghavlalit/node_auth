import knex from "knex";
import { config } from "./index.js";

const db = knex({
    client: 'mysql2',
    debug: false,
    connection: {
        host: config.db_host,
        port: config.db_port,
        user: config.db_user,
        password: config.db_password,
        database: config.db_database,
        dateStrings: true
    },
    pool: { 
        min: 0, 
        max: 5, 
        acquireTimeoutMillis: 1000,
        idleTimeoutMillis: 1000, 
    }
});
export default db;
