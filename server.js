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

    const departures = data.map(d => {
      const time = new Date(d.when).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      const line = d.line?.name || 'Unbekannt';
      const direction = d.direction || '–';
      return `<li>${time} – ${line} Richtung ${direction}</li>`;
    }).join('');

    res.send(`
      <h2>🚉 Abfahrten</h2>
      <ul style="list-style:none; padding:0; margin:0;">
        ${departures}
      </ul>
    `);
  } catch (err) {
    res.send(`<p>❌ Fehler: ${err.message}</p>`);
  }
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
