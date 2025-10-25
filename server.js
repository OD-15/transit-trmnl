import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Root-Route
app.get('/', (req, res) => {
  res.send('TRMNL Abfahrten-Server läuft. Nutze /departures?stop=<Haltestelle> oder /departures?stopId=<ID>');
});

// Abfahrten-Endpoint
app.get('/departures', async (req, res) => {
  try {
    const stopQuery = req.query.stop;
    const stopIdQuery = req.query.stopId;

    if (!stopQuery && !stopIdQuery) {
      return res.status(400).json({ error: 'Bitte stop oder stopId als Parameter angeben' });
    }

    let stopId = stopIdQuery || stopQuery;

    // Name → ID auflösen, falls nötig
    if (!/^\d+$/.test(stopId)) {
      const searchRes = await fetch(
        `https://v6.transport.rest/stops?query=${encodeURIComponent(stopId)}`
      );
      if (!searchRes.ok) throw new Error('Fehler bei der Haltestellensuche');
      const stops = await searchRes.json();
      if (!stops.length) return res.status(404).json({ error: 'Haltestelle nicht gefunden' });
      stopId = stops[0].id;
    }

    // Abfahrten abrufen
    const depRes = await fetch(
      `https://v6.transport.rest/stops/${stopId}/departures?results=4`
    );
    if (!depRes.ok) throw new Error('Fehler beim Abrufen der Abfahrten');
    const data = await depRes.json();

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
