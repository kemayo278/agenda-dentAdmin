import sql from "mssql";

// Fonction pour obtenir la configuration depuis les headers
function getDbConfig(request) {
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

// Configuration par défaut (fallback)
const defaultConfig = {
  user: "sa",
  password: "Messi1234@!",
  server: "localhost\\ATX",
  database: "DentAdmin",
  port: 1433,
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
  },
};

export async function GET(request) {
  try {
    // Essayer d'obtenir la configuration depuis les headers, sinon utiliser la config par défaut
    let config
    try {
      config = getDbConfig(request)
    } catch (err) {
      console.warn('Configuration dynamique non trouvée, utilisation de la configuration par défaut:', err.message)
      config = defaultConfig
    }
    
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT 
        VerstrekkerID,
        Voornaam,
        Naam,
        afkorting,
        Voornaam + ' ' + Naam AS FullName
      FROM VERSTREKKER
      WHERE Deleted = 0 OR Deleted IS NULL
      ORDER BY Naam, Voornaam
    `);

    // Transformation des données pour correspondre au format attendu par le frontend
    const practitioners = result.recordset.map((record, index) => {
      const colors = ['#EC4899', '#FBBF24', '#10B981', '#A855F7', '#06B6D4', '#059669', '#3B82F6', '#DC2626'];
      
      return {
        id: record.VerstrekkerID || record.afkorting || `prac-${index}`,
        name: record.FullName || `${record.Voornaam || ''} ${record.Naam || ''}`.trim(),
        initials: record.afkorting || 
                  `${(record.Voornaam || '').charAt(0)}${(record.Naam || '').charAt(0)}`,
        color: colors[index % colors.length],
        firstName: record.Voornaam,
        lastName: record.Naam
      };
    });

    return Response.json(practitioners);
  } catch (err) {
    console.error('Erreur API practitioners:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}