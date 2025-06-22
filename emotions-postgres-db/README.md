# Emotions MCP Server

Ein Model Context Protocol (MCP) Server zur Verwaltung von Emotionen in einer PostgreSQL Datenbank.

## Installation

```bash
npm install emotions-mcp-server
```

## Konfiguration

Der Server benötigt eine Verbindung zu einer PostgreSQL Datenbank. Die Verbindungsdaten können über Umgebungsvariablen oder direkt beim Erstellen des Servers konfiguriert werden.

### Umgebungsvariablen

- `DATABASE_URL`: PostgreSQL Verbindungs-URL (z.B. `postgresql://postgres:password@localhost:5432/emotions`)

## Continuous Integration

Das Projekt verwendet GitHub Actions für kontinuierliche Integration. Bei jedem Push zum `main` Branch wird automatisch:

- Der Code gebaut und getestet
- Linting durchgeführt
- Ein GitHub Release erstellt (bei Tag-Erstellung)

Die Workflow-Datei befindet sich unter `.github/workflows/build-and-deploy.yml`.

## Verwendung

### Server starten

```typescript
import { EmotionsMcpServer } from 'emotions-mcp-server';

// Mit Standardverbindung oder Umgebungsvariablen
const server = new EmotionsMcpServer();

// Oder mit benutzerdefinierten Verbindungsdaten
const server = new EmotionsMcpServer('postgresql://benutzer:passwort@localhost:5432/meine_db', 4000);

// Server starten
await server.start();
```

### Client-Verwendung

```typescript
import { EmotionsMcpClient } from 'emotions-mcp-server';

// Client mit UserContext erstellen
const client = new EmotionsMcpClient('benutzer-123');

// Tabelle prüfen und erstellen
const exists = await client.tableExists();
if (!exists) {
  await client.createTable();
}

// Neue Emotion einfügen
const emotion = {
  emotion: 'Freude',
  quellenart: 'Eigene Emotion',
  datum: new Date(),
  alter: 30
};

const newEmotion = await client.insertEmotion(emotion);
console.log(`Neue Emotion erstellt: ID ${newEmotion.id}, Nummer ${newEmotion.nummer}`);

// Emotion aktualisieren
const updatedEmotion = await client.updateEmotion(newEmotion.id, {
  emotion: 'Große Freude',
  auswirkungen: 'Gesteigertes Wohlbefinden'
});
console.log(`Emotion aktualisiert: ${updatedEmotion.emotion}`);

// Emotionen abfragen
const emotions = await client.getEmotions();
console.log(`${emotions.length} Emotionen gefunden`);

// Mit Filter abfragen
const filteredEmotions = await client.getEmotions({
  quellenart: 'Eigene Emotion',
  datumVon: new Date('2023-01-01')
});

// Neueste Emotionen abfragen (Standard: 10)
const recentEmotions = await client.getRecentEmotions();
console.log(`Die ${recentEmotions.length} neuesten Emotionen wurden abgerufen`);

// Neueste Emotionen mit Limit abfragen
const last5Emotions = await client.getRecentEmotions(5);
console.log(`Die 5 neuesten Emotionen wurden abgerufen`);

// Emotion löschen
await client.deleteEmotion(newEmotion.id);
```

## Datenmodell

### Emotion

#### Eingabefelder

| Feld        | Typ      | Beschreibung                                                           |
|-------------|----------|------------------------------------------------------------------------|
| emotion     | string   | Name der Emotion (Erforderlich)                                        |
| datum       | Date     | Datum an dem die Emotion gelöst wurde (Erforderlich)                   |
| alter       | number   | Alter in dem die Emotion im Körper eingeschlossen wurde (Optional)     |
| quellenart  | string   | Art der Quelle: "Eigene Emotion", "Übernommene Emotion", "Geerbte Emotion" (Erforderlich) |
| quelle      | string   | Quelle der Emotion (Leer bei eigenen Emotionen, aber erforderlich bei übernommenen/geerbten Emotionen) |
| koerperteil | string   | "Herzmauer" oder Name des Organs in dem die Emotion eingeschlossen war (Optional)            |
| auswirkungen| string   | Körperliche oder emotionale Auswirkungen (Optional)                    |
| bemerkungen | string   | Zusätzliche Informationen (Optional)                                   |

#### Gespeicherte Felder (EmotionRecord)

| Feld        | Typ      | Beschreibung                                                           |
|-------------|----------|------------------------------------------------------------------------|
| id          | number   | Eindeutige ID (automatisch generiert)                                  |
| userContext | string   | Benutzerkontext (Tenant)                                               |
| nummer      | number   | Fortlaufende Nummer beginnend bei 1 (pro userContext, automatisch generiert) |
| emotion     | string   | Name der Emotion                                                       |
| datum       | Date     | Datum an dem die Emotion gelöst wurde                                  |
| alter       | number   | Alter in dem die Emotion im Körper eingeschlossen wurde                |
| quellenart  | string   | Art der Quelle: "Eigene Emotion", "Übernommene Emotion", "Geerbte Emotion" |
| quelle      | string   | Quelle der Emotion, wenn nicht eigene                                  |
| koerperteil | string   | "Herzmauer" oder Name des Organs in dem die Emotion eingeschlossen war                       |
| auswirkungen| string   | Körperliche oder emotionale Auswirkungen                               |
| bemerkungen | string   | Zusätzliche Informationen                                              |

## API-Methoden

| Methode         | Parameter                       | Beschreibung                            |
|-----------------|---------------------------------|-----------------------------------------|
| tableExists     | userContext: string             | Prüft ob die Tabelle existiert          |
| createTable     | -                               | Erstellt die Tabelle                    |
| insertEmotion   | userContext: string, emotion: Emotion | Fügt eine neue Emotion hinzu      |
| updateEmotion   | userContext: string, emotionNumber: number, emotion: Emotion | Aktualisiert eine bestehende Emotion |
| deleteEmotion   | userContext: string, emotionNumber: number | Löscht eine Emotion              |
| getEmotions     | userContext: string, filter?: EmotionFilter | Findet Emotionen mit Filter |
| getEmotionByNumber | userContext: string, emotionNumber: number | Findet eine Emotion nach Nummer |
| getRecentEmotions | userContext: string, limit?: number | Holt die neuesten Emotionen (Standard: 10) |

## Lizenz

ISC
