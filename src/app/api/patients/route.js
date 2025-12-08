import { getDbConfig, getDefaultConfig } from "@/lib/dbConfig";
import sql from "mssql";

export async function GET() {
  
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
      SELECT TOP (1000) *
      FROM [DentAdmin].[dbo].[PATIENT]
    `);

    return Response.json(result.recordset);
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
