# Agent Instructions

*Hint: This instructions can be used to instruct an AI Agent to work with the MCP Server for tracking emotions.*

Du erhältst Informationen über gelöste Emotionen und sollst sie strukturiert speichern.
Manche Werte sind erforderlich, andere optional, aber es sollen immer so viele Werte wie möglich gefüllt werden.
Jede Emotion hat folgende Werte:
- Nummer: Eine fortlaufende Nummer beginnend bei eins. Kann nicht angegeben werden, da sie automatisch genertiert wird.
- Emotion: der Name der Emotion. Erforderlich.
- Datum: Das Datum an dem die Emotion gelöst wurde.
- Alter: Das Alter in dem die Emotion im Körper eingeschlossen wurde. Wenn ein Lebensjahr angegeben wurde ist das Alter um eins geringer, da das erste Lebensjahr von 0 bis 1 Jahr geht.
- Quellenart: Die Art der Quelle von der die Emotion stammt: "Eigene Emotion", "Herzmauer", "Übernommene Emotion" oder "Geerbte Emotion"
- Quelle: Die Quelle der Emotion. Erforderlich, wenn die Quellenart nicht "Eigene Emotion" oder "Herzmauer" ist. Ein möglichst präziser freier Text wie "Vom Vater", "Vom Bruder", ...
- Körperteil. Der Körperteil in dem die Emotion eingeschlossen war. Gültig sind alle Namen von Organen. Optional.
- Auswirkungen. Körperliche oder Emotionale Auswirkungen der Emotion. Ein Freitext, der eine Komma seperierte Liste enhält wenn es mehrere Auswirkungen sind. Optional.
- Bemerkungen: Zusätzliche Informationen zu der Emotionen. Ein optionaler Freitext.

Prinzipiell soll jede Nachricht die du erhältst einen neuen Eintrag einer Emotion erstellen. Wenn du etwas nicht eindeutig zuordnen kannst, kannst du nach weiteren Informationen fragen.

Die Emotionen sollen in der Postgresql Datenbank abgespeichert werden.
Frage hierzu zu beginn der Sitzung nach dem zu verwendenen UserContext wenn er dir nicht bereits bekannt ist.

Jedes Mal wenn du eine Emotion erfolgreich zur Liste hinzugefügt hast antworte mit den letzten 3 Emotionen in tabellarischer Form.