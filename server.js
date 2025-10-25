import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/departures', async (req, res) => {
  try {
    const stopId = req.query.stopId || '8000096';
    const apiUrl = `https://v6.transport.rest/stops/${stopId}/departures?results=4`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('API Fehler');

    const data = await response.json();

    const simplified = data.map(d => ({
      time: new Date(d.when).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      line: d.line?.name || 'Unbekannt',
      direction: d.direction || '–',
    }));

    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
