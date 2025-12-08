import { NextResponse } from 'next/server'
import sql from 'mssql'
import { getDefaultConfig } from '@/lib/dbConfig'

export async function POST(req) {
  try {
    const configData = await req.json()

    // Validation des paramètres requis
    if (!configData.user || !configData.password || !configData.server || !configData.database) {
      return NextResponse.json(
        { success: false, error: 'Paramètres de connexion manquants' },
        { status: 400 }
      )
    }

    // Configuration de connexion
    const config = {
      user: configData.user,
      password: configData.password,
      server: configData.server,
      database: configData.database,
      port: configData.port || 1433,
      options: {
        encrypt: configData.encrypt || false,
        trustServerCertificate: configData.trustServerCertificate !== false,
        enableArithAbort: true,
      },
      pool: {
        max: 1, // Pour le test, une seule connexion suffit
        min: 0,
        idleTimeoutMillis: 5000,
        acquireTimeoutMillis: 10000,
      },
      requestTimeout: 10000,
      // connectionTimeout: 10000,
    }

    let pool

    try {
      // Tentative de connexion
      pool = new sql.ConnectionPool(config)
      await pool.connect()

      // Test simple pour vérifier que la connexion fonctionne
      const result = await pool.request().query('SELECT 1 as test')
      
      // Vérification de l'existence des tables principales
      const tablesCheck = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME IN ('VERSTREKKER', 'PATIENT', 'appointments')
      `)

      const foundTables = tablesCheck.recordset.map(row => row.TABLE_NAME)
      
      return NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        details: {
          server: configData.server,
          database: configData.database,
          tablesFound: foundTables,
          connectionTime: new Date().toISOString()
        }
      })

    } catch (connectionError) {
      console.error('Erreur de connexion:', connectionError)
      
      // Messages d'erreur plus explicites
      let errorMessage = 'Erreur de connexion inconnue'
      
      if (connectionError.code === 'ELOGIN') {
        errorMessage = 'Échec d\'authentification : nom d\'utilisateur ou mot de passe incorrect'
      } else if (connectionError.code === 'ENOTFOUND') {
        errorMessage = 'Serveur introuvable : vérifiez le nom du serveur et la connectivité réseau'
      } else if (connectionError.code === 'ECONNREFUSED') {
        errorMessage = 'Connexion refusée : vérifiez que SQL Server est démarré et accepte les connexions'
      } else if (connectionError.code === 'ETIMEOUT') {
        errorMessage = 'Délai d\'attente dépassé : le serveur ne répond pas'
      } else if (connectionError.message) {
        errorMessage = connectionError.message
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: {
            code: connectionError.code,
            server: configData.server,
            database: configData.database
          }
        },
        { status: 500 }
      )

    } finally {
      // Fermer la connexion de test
      if (pool && pool.connected) {
        await pool.close()
      }
    }

  } catch (parseError) {
    console.error('Erreur de parsing:', parseError)
    return NextResponse.json(
      { success: false, error: 'Données de requête invalides' },
      { status: 400 }
    )
  }
}