/**
 * MCP Server für den Zugriff auf die Emotionen-Datenbank in PostgreSQL.
 * 
 * Dieser Server bietet eine sichere Schnittstelle für die Interaktion mit der 
 * emotions Tabelle in einer PostgreSQL Datenbank, ohne direkten SQL-Zugriff zu erlauben.
 */

import { EmotionsMcpServer } from '../src';

// DB Verbindungsdaten aus Umgebungsvariablen oder mit Standardwerten
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/emotions';
const port = parseInt(process.env.PORT || '3000');

// Server erstellen und starten
const server = new EmotionsMcpServer(connectionString, port);

// Server starten
server.start().catch(err => {
  console.error('Fehler beim Starten des Servers:', err);
  process.exit(1);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Server wird heruntergefahren...');
  try {
    await server.stop();
    console.log('Server gestoppt');
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Herunterfahren:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`MCP Server gestartet auf Port ${port}`);
console.log('Verwendete Datenbank: ', connectionString);
console.log('Server läuft. Drücken Sie CTRL+C zum Beenden.');
