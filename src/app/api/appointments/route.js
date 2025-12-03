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
    const { searchParams } = new URL(request.url);
    
    // Paramètres de filtrage
    const date = searchParams.get('date'); // Format: YYYY-MM-DD
    const practitionerId = searchParams.get('practitionerId');
    const patientSearch = searchParams.get('patientSearch');
    const status = searchParams.get('status'); // confirmed, pending, cancelled, etc.
    
    let whereConditions = ["A.Deleted = 0"];
    
    // Filtre par date (par défaut 17 mars 2023 si aucune date fournie)
    const defaultDate = '2023-03-17';
    const targetDate = date || defaultDate;
    const startDate = `${targetDate}T00:30:00`;
    const endDate = `${targetDate}T23:30:00`;
    whereConditions.push(`A.Start >= '${startDate}' AND A.Start < '${endDate}'`);
    
    // Filtre par praticien(s)
    if (practitionerId) {
      const practitionerIds = practitionerId.split(',').map(id => id.trim()).filter(id => id);
      if (practitionerIds.length === 1) {
        whereConditions.push(`A.VerstrekkerID = '${practitionerIds[0]}'`);
      } else if (practitionerIds.length > 1) {
        const idsString = practitionerIds.map(id => `'${id}'`).join(',');
        whereConditions.push(`A.VerstrekkerID IN (${idsString})`);
      }
    }
    
    // Filtre par recherche patient
    if (patientSearch) {
      whereConditions.push(`(P.Voornaam LIKE '%${patientSearch}%' OR P.Naam LIKE '%${patientSearch}%')`);
    }
    
    // Filtre par statut (mapping avec le champ Geannuleerd)
    if (status) {
      switch (status) {
        case 'cancelled':
          whereConditions.push("A.Geannuleerd = 1");
          break;
        case 'confirmed':
        case 'pending':
        case 'completed':
          whereConditions.push("A.Geannuleerd = 0");
          break;
      }
    }

    const whereClause = whereConditions.join(' AND ');

    const result = await pool.request().query(`
      SELECT 
        A.AgendaID,
        A.Start,
        A.Finish,
        A.Caption,
        A.Message,
        A.AgendaType,
        A.EventType,
        A.PatientID,
        A.VerstrekkerID,

        -- Patient : depuis la table PATIENT
        P.Voornaam AS PatientFirstname,
        P.Naam AS PatientName,
        P.Voornaam + ' ' + P.Naam AS PatientFullName,

        -- Praticien
        V.Voornaam AS PratFirstname,
        V.Naam AS PratName,
        V.afkorting AS PratCode,

        -- Couleur & infos
        A.LabelColor AS LabelColorId,

        -- Autres données
        A.Geannuleerd,
        A.annulatieReden
      FROM AGENDA A
      LEFT JOIN VERSTREKKER V ON A.VerstrekkerID = V.VerstrekkerID
      LEFT JOIN PATIENT P ON A.PatientID = P.PatientID
      LEFT JOIN AgendaLabelColor C ON A.LabelColor = C.AgendaLabelColorId
      WHERE ${whereClause}
      ORDER BY A.Start
    `);

    // Transformation des données pour correspondre au format attendu par le frontend
    const appointments = result.recordset.map(record => {
      const startTime = new Date(record.Start);
      const endTime = new Date(record.Finish);
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // durée en minutes

      return {
        id: record.AgendaID,
        time: startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        duration: duration,
        patient: record.PatientFullName || 'Patient inconnu',
        practitionerId: record.VerstrekkerID || 'unknown',
        type: record.Caption || record.AgendaType || 'Consultation',
        color: getColorForType(record.AgendaType, record.LabelColorId),
        notes: record.Message || '',
        hasPhone: false, // À déterminer selon vos données
        hasDocument: false, // À déterminer selon vos données
        status: determineStatus(record.Geannuleerd, record.annulatieReden, startTime),
        // Données supplémentaires pour référence
        startDateTime: record.Start,
        endDateTime: record.Finish,
        patientId: record.PatientID,
        practitionerName: `${record.PratFirstname || ''} ${record.PratName || ''}`.trim(),
        practitionerCode: record.PratCode,
        cancelReason: record.annulatieReden
      };
    });

    return Response.json(appointments);
  } catch (err) {
    console.error('Erreur API appointments:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
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
    const appointmentData = await request.json();
    
    const result = await pool.request()
      .input('Start', sql.DateTime, new Date(appointmentData.startDateTime))
      .input('Finish', sql.DateTime, new Date(appointmentData.endDateTime))
      .input('Caption', sql.NVarChar, appointmentData.type)
      .input('Message', sql.NVarChar, appointmentData.notes || '')
      .input('AgendaType', sql.NVarChar, appointmentData.type)
      .input('EventType', sql.NVarChar, appointmentData.eventType || 'appointment')
      .input('PatientID', sql.Int, appointmentData.patientId)
      .input('VerstrekkerID', sql.NVarChar, appointmentData.practitionerId)
      .input('LabelColor', sql.Int, appointmentData.labelColorId || 1)
      .input('Geannuleerd', sql.Bit, false)
      .input('Deleted', sql.Bit, false)
      .query(`
        INSERT INTO AGENDA (
          Start, Finish, Caption, Message, AgendaType, EventType,
          PatientID, VerstrekkerID, LabelColor, Geannuleerd, Deleted
        )
        OUTPUT INSERTED.AgendaID
        VALUES (
          @Start, @Finish, @Caption, @Message, @AgendaType, @EventType,
          @PatientID, @VerstrekkerID, @LabelColor, @Geannuleerd, @Deleted
        )
      `);

    return Response.json({ 
      success: true, 
      appointmentId: result.recordset[0].AgendaID 
    });
  } catch (err) {
    console.error('Erreur création rendez-vous:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
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
    const appointmentData = await request.json();
    
    const result = await pool.request()
      .input('AgendaID', sql.Int, appointmentData.id)
      .input('Start', sql.DateTime, new Date(appointmentData.startDateTime))
      .input('Finish', sql.DateTime, new Date(appointmentData.endDateTime))
      .input('Caption', sql.NVarChar, appointmentData.type)
      .input('Message', sql.NVarChar, appointmentData.notes || '')
      .input('PatientID', sql.Int, appointmentData.patientId)
      .input('VerstrekkerID', sql.NVarChar, appointmentData.practitionerId)
      .input('LabelColor', sql.Int, appointmentData.labelColorId || 1)
      .input('Geannuleerd', sql.Bit, appointmentData.status === 'cancelled')
      .input('AnnulatieReden', sql.NVarChar, appointmentData.cancelReason || '')
      .query(`
        UPDATE AGENDA SET
          Start = @Start,
          Finish = @Finish,
          Caption = @Caption,
          Message = @Message,
          PatientID = @PatientID,
          VerstrekkerID = @VerstrekkerID,
          LabelColor = @LabelColor,
          Geannuleerd = @Geannuleerd,
          annulatieReden = @AnnulatieReden
        WHERE AgendaID = @AgendaID AND Deleted = 0
      `);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Erreur mise à jour rendez-vous:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
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
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');
    
    const result = await pool.request()
      .input('AgendaID', sql.Int, appointmentId)
      .query(`
        UPDATE AGENDA SET Deleted = 1 
        WHERE AgendaID = @AgendaID
      `);

    return Response.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression rendez-vous:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// Fonctions utilitaires
function getColorForType(agendaType, labelColorId) {
  // Mapping des couleurs basé sur le type ou l'ID de couleur
  const typeColors = {
    'extraction': '#EC4899',
    'obturation': '#06B6D4',
    'endo': '#059669',
    'prothese': '#3B82F6',
    'couronne': '#DC2626',
    'dpsi': '#6B7280',
    'implant': '#10B981',
    'annulation': '#84CC16',
    'purge': '#EAB308',
    'urgence': '#EF4444',
    'bilan': '#F59E0B',
    'retard': '#9CA3AF',
    'nouveau': '#FBBF24',
    'gouttiere': '#22C55E',
    'reevaluation': '#94A3B8',
    'diagnostic': '#CBD5E1',
    'clincheck': '#F472B6',
    'radio': '#0EA5E9'
  };
  
  const lowerType = (agendaType && typeof agendaType === 'string') ? agendaType.toLowerCase() : '';
  return typeColors[lowerType] || '#3B82F6';
}

function determineStatus(geannuleerd, annulatieReden, startDateTime) {
  if (geannuleerd) return 'cancelled';
  
  const now = new Date();
  const appointmentTime = new Date(startDateTime);
  
  if (appointmentTime < now) {
    return 'completed';
  } else if (appointmentTime.toDateString() === now.toDateString()) {
    return 'confirmed';
  } else {
    return 'pending';
  }
}