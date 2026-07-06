#!/bin/bash
# serve.sh — сервер прототипів (запускається LaunchAgent-ом з KeepAlive).
# Міслер-патерн «runs when nobody is looking»: launchd перезапускає
# процес при смерті І при зміні мережі (NetworkState).
exec /usr/bin/python3 -m http.server 8820 --bind 0.0.0.0 \
  --directory "$HOME/Downloads/award-re-plugin/library"
