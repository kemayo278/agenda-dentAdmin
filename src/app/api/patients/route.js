import sql from "mssql";

const config = {
  user: "sa",                // Ton user SQL Server
  password: "Messi1234@!",  // Ton password SQL
  server: "localhost\\ATX",       // Using localhost instead of machine name
  database: "DentAdmin",
  port: 1433,
  options: {
    trustServerCertificate: true,
    encrypt: false,           // Disable encryption for local development
    enableArithAbort: true,   // Required for certain SQL Server versions
  },
};

export async function GET() {
  try {
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
