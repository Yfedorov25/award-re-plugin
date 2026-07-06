#!/bin/bash
# linkcheck.sh — ЗАКОН ЛІНКА одною командою (SessionStart-хук + перед лінками).
# Друкує: стабільне mDNS-ім'я, поточний IP, здоров'я сервера, вік live-archive.
HOST="$(scutil --get LocalHostName 2>/dev/null | tr '[:upper:]' '[:lower:]').local"
IP="$(ipconfig getifaddr en0 2>/dev/null || echo 'нема-мережі')"
CODE="$(curl -s -o /dev/null -m 2 -w '%{http_code}' "http://localhost:8820/s2.html" 2>/dev/null)"
if [ "$CODE" != "200" ]; then
  # САМОЛІКУВАННЯ (Міслер: «runs when nobody is looking»; launchd не може —
  # TCC блокує йому ~/Downloads, тож лікуємось із сесійного шелла)
  nohup /usr/bin/python3 -m http.server 8820 --bind 0.0.0.0 \
    --directory "$HOME/Downloads/award-re-plugin/library" >/dev/null 2>&1 &
  sleep 1
  CODE="$(curl -s -o /dev/null -m 2 -w '%{http_code}' "http://localhost:8820/s2.html" 2>/dev/null)"
  SRV="перепіднято ($CODE)"
else
  SRV="живий (200)"
fi
ARCH="$HOME/Downloads/award-re-plugin/skills/teardowns/live-archive/air/air-shared.js"
AGE="?"
[ -f "$ARCH" ] && AGE="$(( ( $(date +%s) - $(stat -f %m "$ARCH") ) / 86400 )) дн."
echo "ПРОТОТИПИ: http://${HOST}:8820/ (стабільне ім'я, IP не потрібен) · запасний IP: ${IP} · сервер: ${SRV} · live-archive вік: ${AGE}"
