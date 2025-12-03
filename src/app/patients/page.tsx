import React from "react";

type Patient = {
  PatientID: number;
  Naam: string | null;
  Voornaam: string | null;
  Emailadres: string | null;
  Telefoonnummer: string | null;
  // Ajoute d'autres champs si tu veux
};

async function getPatients(): Promise<Patient[]> {
  const res = await fetch("http://localhost:3000/api/patients", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des patients");
  }

  return res.json();
}

export default async function Page() {
  const patients = await getPatients();

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Liste des patients SQL Server
      </h1>

      <div style={{ marginTop: "20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ccc",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Prénom</th>
              <th style={thStyle}>Téléphone</th>
              <th style={thStyle}>Email</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <tr key={p.PatientID}>
                <td style={tdStyle}>{p.PatientID}</td>
                <td style={tdStyle}>{p.Naam}</td>
                <td style={tdStyle}>{p.Voornaam}</td>
                <td style={tdStyle}>{p.Telefoonnummer}</td>
                <td style={tdStyle}>{p.Emailadres}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
  background: "#f5f5f5",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px",
};
