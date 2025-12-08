export const getDefaultConfig = () => ({
  user: process.env.DB_DEFAULT_USER || "sa",
  password: process.env.DB_DEFAULT_PASSWORD || "",
  server: process.env.DB_DEFAULT_SERVER || "localhost\\ATX",
  database: process.env.DB_DEFAULT_DATABASE || "DentAdmin",
  port: parseInt(process.env.DB_DEFAULT_PORT || "1433"),
  options: {
    trustServerCertificate: process.env.DB_DEFAULT_TRUST_SERVER_CERTIFICATE === "true",
    encrypt: process.env.DB_DEFAULT_ENCRYPT === "true",
    enableArithAbort: true,
  },
});

export function getDbConfig(request) {
  const dbConfigHeader = request.headers.get('x-db-config')
  if (!dbConfigHeader) {
    throw new Error('Configuration de base de données manquante')
  }
  
  const dbConfig = JSON.parse(dbConfigHeader)
  
  return {
    user: dbConfig.user,
    password: dbConfig.password,
    server: dbConfig.server,
    database: dbConfig.database,
    port: dbConfig.port || 1433,
    options: {
      encrypt: dbConfig.encrypt || false,
      trustServerCertificate: dbConfig.trustServerCertificate !== false,
      enableArithAbort: true,
    },
  }
}

export function getConfig(request) {
  try {
    return getDbConfig(request)
  } catch (err) {
    console.warn('Configuration dynamique non trouvée, utilisation de la configuration par défaut:', err.message)
    return getDefaultConfig()
  }
}