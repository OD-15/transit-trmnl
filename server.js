import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const STATION_ID = '8000096'; // Saarbrücken Hbf

app.get('/departures', async (req, res) => {
  try {
    const response = await fetch(`https://v6.db.transport.rest/stops/${STATION_ID}/departures?results=4`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Abfahrtsdaten');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
