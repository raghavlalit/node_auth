import knex from "knex";
import { config } from "./index.js";

/**
 * Enhanced Database Connection Configuration
 * Provides optimized settings for different environments with proper error handling
 */

// Environment-specific database configuration
const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // Base connection configuration
  const baseConfig = {
    host: config.db_host,
    port: config.db_port || 3306,
    user: config.db_user,
    password: config.db_password,
    database: config.db_database,
    charset: 'utf8mb4', // Support for emojis and special characters
    timezone: 'UTC', // Consistent timezone handling
    dateStrings: true,
    multipleStatements: false, // Security: prevent SQL injection via multiple statements
  };

  // SSL configuration for production
  if (isProduction) {
    baseConfig.ssl = {
      rejectUnauthorized: false, // Set to true in production with proper certificates
      ca: process.env.DB_SSL_CA,
      cert: process.env.DB_SSL_CERT,
      key: process.env.DB_SSL_KEY,
    };
  }

  return baseConfig;
};

// Environment-specific pool configuration
const getPoolConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  if (isProduction) {
    return {
      min: 5, // Higher minimum for production
      max: 20, // Higher maximum for production load
      acquireTimeoutMillis: 60000, // 60 seconds
      createTimeoutMillis: 30000, // 30 seconds
      destroyTimeoutMillis: 5000, // 5 seconds
      idleTimeoutMillis: 30000, // 30 seconds
      reapIntervalMillis: 1000, // Check for idle connections every second
      createRetryIntervalMillis: 200, // Retry connection creation every 200ms
      propagateCreateError: false, // Don't propagate connection errors
    };
  }

  if (isDevelopment) {
    return {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000, // 30 seconds
      createTimeoutMillis: 10000, // 10 seconds
      destroyTimeoutMillis: 5000, // 5 seconds
      idleTimeoutMillis: 10000, // 10 seconds
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false,
    };
  }

  if (isTest) {
    return {
      min: 1,
      max: 5,
      acquireTimeoutMillis: 10000, // 10 seconds
      createTimeoutMillis: 5000, // 5 seconds
      destroyTimeoutMillis: 1000, // 1 second
      idleTimeoutMillis: 5000, // 5 seconds
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 50,
      propagateCreateError: false,
    };
  }

  // Default configuration
  return {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false,
  };
};

// Environment-specific debug configuration
const getDebugConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  return {
    debug: isDevelopment || isTest || config.db_debug === 'true',
    log: {
      warn(message) {
        console.warn(`[DB_WARN] ${message}`);
      },
      error(message) {
        console.error(`[DB_ERROR] ${message}`);
      },
      deprecate(message) {
        console.warn(`[DB_DEPRECATE] ${message}`);
      },
      debug(message) {
        if (isDevelopment || isTest) {
          console.log(`[DB_DEBUG] ${message}`);
        }
      }
    }
  };
};

// Create database connection with optimized configuration
const createDatabaseConnection = () => {
  try {
    const dbConfig = {
      client: 'mysql2',
      connection: getDatabaseConfig(),
      pool: getPoolConfig(),
      ...getDebugConfig(),
      // Migration and seeding configuration
      migrations: {
        directory: '../migrations',
        tableName: 'knex_migrations',
        extension: 'js'
      },
      seeds: {
        directory: '../seeds',
        extension: 'js'
      },
      // Query timeout configuration
      asyncStackTraces: true, // Better error stack traces
      postProcessResponse: (result, queryContext) => {
        // Post-process query results if needed
        return result;
      },
      wrapIdentifier: (value, origImpl, queryContext) => {
        // Custom identifier wrapping if needed
        return origImpl(value);
      }
    };

    const db = knex(dbConfig);

    // Test database connection
    db.raw('SELECT 1')
      .then(() => {
        console.log(`[DB_SUCCESS] Database connected successfully to ${config.db_database} on ${config.db_host}:${config.db_port}`);
      })
      .catch((error) => {
        console.error('[DB_CONNECTION_ERROR] Failed to connect to database:', error);
        process.exit(1); // Exit if database connection fails
      });

    return db;

  } catch (error) {
    console.error('[DB_CONFIG_ERROR] Failed to create database configuration:', error);
    throw error;
  }
};

// Create the database instance
const db = createDatabaseConnection();

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('[DB_SHUTDOWN] Gracefully shutting down database connections...');
  try {
    await db.destroy();
    console.log('[DB_SHUTDOWN] Database connections closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('[DB_SHUTDOWN_ERROR] Error during database shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT_EXCEPTION]', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', reason);
  gracefulShutdown();
});

// Database health check function
export const checkDatabaseHealth = async () => {
  try {
    await db.raw('SELECT 1');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date().toISOString() 
    };
  }
};

// Database statistics function
export const getDatabaseStats = async () => {
  try {
    const pool = db.client.pool;
    return {
      totalConnections: pool.numUsed() + pool.numFree(),
      usedConnections: pool.numUsed(),
      freeConnections: pool.numFree(),
      pendingConnections: pool.numPendingCreates(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { error: error.message, timestamp: new Date().toISOString() };
  }
};

// Export the database instance
export default db;
