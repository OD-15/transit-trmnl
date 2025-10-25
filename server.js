import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Wir erwarten einen Query-Parameter ?stop=<Haltestellenname oder ID>
app.get('/departures', async (req, res) => {
  try {
    const stopQuery = req.query.stop;
    if (!stopQuery) return res.status(400).json({ error: 'Bitte stop oder stopId angeben' });

    let stopId = stopQuery;

    // Wenn keine Zahl, interpretieren wir es als Name → ID suchen
    if (!/^\d+$/.test(stopId)) {
      const searchRes = await fetch(
        `https://v6.transport.rest/stops?query=${encodeURIComponent(stopQuery)}`
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
