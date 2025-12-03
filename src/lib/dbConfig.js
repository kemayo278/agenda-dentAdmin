// Configuration globale pour la base de données
let globalDbConfig = null;

export function setGlobalDbConfig(config) {
  globalDbConfig = config;
}

export function getGlobalDbConfig() {
  return globalDbConfig;
}

export function isDbConfigured() {
  return globalDbConfig !== null && 
         globalDbConfig.user && 
         globalDbConfig.password && 
         globalDbConfig.server && 
         globalDbConfig.database;
}

// Configuration par défaut
export const defaultDbConfig = {
  user: "sa",
  password: "",
  server: "localhost\\ATX",
  database: "DentAdmin",
  port: 1433,
  trustServerCertificate: true,
  encrypt: false,
};

// Utilitaire pour créer la configuration SQL
export function createSqlConfig(config = globalDbConfig) {
  if (!config) {
    throw new Error('Configuration de base de données non définie');
  }

  return {
    user: config.user,
    password: config.password,
    server: config.server,
    database: config.database,
    port: config.port || 1433,
    options: {
      encrypt: config.encrypt || false,
      trustServerCertificate: config.trustServerCertificate !== false,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 60000,
    },
    requestTimeout: 30000,
    connectionTimeout: 15000,
  };
}