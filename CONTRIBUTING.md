# Mitwirken am CWC-Piechart

Danke für dein Interesse, zum CWC-Piechart beizutragen! Diese Datei
beschreibt kurz den Ablauf.

## Bevor du startest

- Für größere Änderungen (neue Properties, Layout-/Rendering-Änderungen)
  am besten vorher ein Issue eröffnen und kurz abstimmen, bevor du viel
  Arbeit investierst.
- Für kleinere Fixes (Tippfehler, Bugfixes) kannst du direkt einen Pull
  Request öffnen.

## Contributor License Agreement (CLA)

Dieses Projekt steht unter der
[GNU General Public License v3.0](LICENSE). Damit der Projektinhaber das
Projekt langfristig flexibel weiterentwickeln kann (z. B. bei einer
künftigen Umlizenzierung), gilt zusätzlich das
[Contributor License Agreement (.github/CLA.md)](.github/CLA.md).

**Ein automatisierter CLA-Check (CLA Assistant) läuft für dieses
Repository.** Bei deinem ersten Pull Request postet der Bot einen
Kommentar mit einem Link zum CLA — erst nach deiner Zustimmung (Kommentar
*„I have read the CLA Document and I hereby sign the CLA"*) wird der PR
mergebar. Bitte lies das CLA vorher durch — im Kern regelt es, dass du dem
Projekt ein zusätzliches, weitreichendes Nutzungsrecht an deinem Beitrag
einräumst, während du selbst Urheber deines Beitrags bleibst und ihn auch
weiterhin frei anderweitig verwenden darfst.

## Ablauf für einen Beitrag

1. Repository forken und einen aussagekräftig benannten Branch anlegen.
2. Änderungen vornehmen.
3. Manuell testen: `control/index.html` im Browser öffnen (WebCC.start()
   läuft ohne echte WinCC-Runtime in den Timeout-/Fallback-Modus) und über
   die Browser-Konsole testweise Properties setzen, z. B.:
   ```js
   setPropertyPiechart({ key: 'Segments', value: JSON.stringify([
       { label: 'Laufzeit', value: 72, color: '#4CAF50' },
       { label: 'Störung',  value: 15, color: '#F44336' },
       { label: 'Rüsten',   value: 13, color: '#FF9800' }
   ]) });
   setPropertyPiechart({ key: 'CenterText', value: '72 %' });
   ```
   und prüfen, dass das SVG korrekt rendert.
4. Pull Request öffnen und kurz beschreiben, was und warum geändert
   wurde.

## Hinweise zum Code

- Es gibt bewusst **kein Build-Tooling** (kein npm/Bundler) — die
  WebCC-Facade liegt als fertiger Build lokal unter `control/js/`, da CWCs
  zur Laufzeit keinen Internetzugriff haben. Neue Bibliotheken bitte
  ebenso lokal einbinden, nicht per CDN.
- `manifest.json`: `mver` muss `"1.2.0"` bleiben (sonst funktionieren
  Methods nicht). `events` ist im manifest.json ein Objekt, im
  `controlInit.events`-Array in `piechart.js` dagegen ein Array von Namen.
- `Segments` ist bewusst als `string`-Property (JSON), nicht als natives
  Array-of-Object deklariert — direktes Zuweisen eines JS-Arrays über
  `Properties.Segments` führt in WinCC zu einem COM-Fehler
  (`PROPERTY_SET Invoke failed`, `0x80000005`). `parseSegments()` in
  `piechart.js` muss ungültiges JSON weiterhin robust über try/catch
  abfangen (leeres Array statt Fehler).
- `body { background: transparent; }` in `styles.css` nicht entfernen —
  sonst scheint der WinCC-Hintergrund nicht durch.

## Lizenz

Mit deinem Beitrag erklärst du dich einverstanden, dass er unter der
[GNU General Public License v3.0](LICENSE) veröffentlicht wird (siehe
auch [.github/CLA.md](.github/CLA.md)).
