/** make all config variables here */
import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: process.env.API_PORT || '5002',
    db_port: process.env.DB_PORT || '',
    db_host: process.env.DB_HOST || 'localhost',
    db_user: process.env.DB_USERNAME || 'root',
    db_password: process.env.DB_PASSWORD || '',
    db_database: process.env.DB_DATABASE || 'node_auth',
    db_dialect: process.env.DB_DIALECT || 'mysql',
    db_debug: process.env.DB_DEBUG || 'false',
    login_master_password: process.env.LOGIN_MASTER_PASSWORD || 'admin123',
    log_history: true,
    default_dropdown_limit: 30,
    default_page_limit: 20,
    default_page_index: 1,
    token_key: process.env.TOKEN_KEY || '123456789789456123',

};