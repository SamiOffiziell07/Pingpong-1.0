Pocket Pong — by SAMIX  (GAMES · APPS · INNOVATION)
====================================================

SPIELEN OHNE INTERNET
---------------------
1. ZIP komplett entpacken (nicht aus der ZIP heraus öffnen).
2. Die Datei  index.html  per Doppelklick im Browser öffnen
   (Safari, Chrome, Edge, Firefox). Fertig – es wird nichts aus dem Internet geladen.

Auf dem iPhone/iPad: Den entpackten Ordner z. B. über die Dateien-App öffnen oder den Ordner
auf einem Computer per lokalem Server bereitstellen:
    python3 -m http.server 8000      →  http://<IP-des-Computers>:8000
In Safari "Zum Home-Bildschirm" wählen für Vollbild (läuft danach auch ohne Netz,
solange Safari die Seite im Speicher hält; am zuverlässigsten ist der lokale Server im WLAN).

Was lokal im Ordner liegt
-------------------------
index.html            Seite, SAMIX-Ladebildschirm, Menüs, Pause, Spielende
styles.css            UI-Design
ui/settings.js        gespeicherte Einstellungen (Sound, letzte Schwierigkeit, Bilanz)
game.js               das komplette Spiel (gebündelt aus main.js und den Quelldateien)
vendor/phaser.min.js  Spiel-Engine Phaser 3.70.0 (MIT-Lizenz, unverändert)
assets/samix-logo.png SAMIX-Logo (zusätzlich in index.html als Reserve eingebettet)
Keine CDNs, keine Webfonts (es werden die Systemschriften genutzt, auf Apple-Geräten SF Pro),
keine Online-Dienste.

Quelldateien ändern (nur für Entwickler)
----------------------------------------
Der Spielcode liegt weiterhin in main.js, config.js, scenes/, systems/, entities/, sounds/, ui/.
index.html lädt aber die gebündelte game.js. Nach Änderungen neu bauen (Node.js nötig):
    sh build/build.sh
index.html?tune öffnet das Tuning-Panel (KI- und Ballparameter live ändern).

Wenn etwas nicht startet
------------------------
Der Ladebildschirm zeigt eine Meldung mit "Neu laden", falls game.js oder vendor/phaser.min.js
fehlen – dann wurde der Ordner nicht vollständig entpackt.
