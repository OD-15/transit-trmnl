import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Root-Route
app.get('/', (req, res) => {
  res.send('TRMNL DB-Abfahrten-Server läuft. Nutze /departures/<Haltestellen-ID>');
});

// Endpoint: Station direkt in URL
app.get('/departures/:stopId', async (req, res) => {
  const stopId = req.params.stopId;

  try {
    const response = await fetch(`https://v6.db.transport.rest/stops/${stopId}/departures?results=4`);
    if (!response.ok) throw new Error('DB API antwortet nicht');

    const data = await response.json();

    // TRMNL-kompatibles flaches Array
    const simplified = data.map(d => ({
      time: d.when ? new Date(d.when).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '–',
      line: d.line?.name || '–',
      direction: d.direction || '–'
    }));

    res.status(200).json(simplified);
  } catch (err) {
    console.error(err.message);

    // Fallback-Daten bei Fehler
    res.status(200).json([
      { time: "09:12", line: "S1", direction: "Trier Hbf" },
      { time: "09:18", line: "RE1", direction: "Mannheim Hbf" },
      { time: "09:24", line: "S2", direction: "Homburg Hbf" },
      { time: "09:30", line: "RB70", direction: "Neunkirchen" }
    ]);
  }
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
