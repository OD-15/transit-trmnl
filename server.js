import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Root-Route (Info-Seite)
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
      `
