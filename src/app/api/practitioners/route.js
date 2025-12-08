import sql from "mssql";
import { getDbConfig, getDefaultConfig } from "@/lib/dbConfig";

export async function GET(request) {
  try {
    let config
    try {
      // config = getDbConfig(request)
      // const config = getDefaultConfig();
      config = getDefaultConfig();
    } catch (err) {
      console.warn('Configuration dynamique non trouvée, utilisation de la configuration par défaut:', err.message)
      config = getDefaultConfig()
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