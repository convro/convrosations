# convrosations

# 🔥 Debate Arena

Real-time AI debate app — 5 agentów DeepSeek kłóci się na każdy temat w interfejsie jak Telegram.

## Struktura

```
debate-arena/
├── backend/          # Node.js + WebSocket + DeepSeek API
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/         # React + Vite
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/useDebateSocket.js
    │   ├── components/
    │   └── screens/
    ├── index.html
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Wklej swój DeepSeek API key do .env
nano .env
```

`.env`:
```
DEEPSEEK_API_KEY=sk-...
PORT=3001
FRONTEND_URL=https://twoja-domena.com   # lub * na dev
```

```bash
npm start
# lub na produkcji:
pm2 start server.js --name debate-arena-backend
```

### 2. Frontend

```bash
cd frontend
npm install
```

Ustaw URL backendu — stwórz plik `frontend/.env`:
```
VITE_WS_URL=ws://localhost:3001
# na produkcji z SSL:
# VITE_WS_URL=wss://twoja-domena.com:3001
```

```bash
# Development
npm run dev

# Build produkcyjny
npm run build
# pliki wyjdą do frontend/dist/ — serwuj przez nginx
```

### 3. Nginx (VPS, produkcja)

```nginx
server {
    listen 80;
    server_name twoja-domena.com;

    # Frontend (dist)
    root /var/www/debate-arena/frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 4. PM2 (żeby backend nie padał)

```bash
npm install -g pm2
cd backend
pm2 start server.js --name debate-arena
pm2 save
pm2 startup
```

## Ustawienia debaty

W panelu info grupy (klik w header) masz:
- **Czas odpowiedzi** — ile sekund agent "pisze" przed odpowiedzią
- **Liczba rund** — ile rund debaty (5/10/15/20)
- **Agresywność** — spokojny → agresywny
- **Możliwość dołączenia** — czy user może pisać do grupy

## WebSocket events

Backend → Frontend:
- `connected` — handshake z sessionId
- `loading_step` — krok ładowania
- `group_ready` — meta grupy gotowa
- `agents_ready` — agenci z przypisanymi stanowiskami
- `debate_start` — debata startuje
- `typing_start / typing_stop` — animacja pisania
- `message` — nowa wiadomość od agenta
- `group_update` — aktualizacja statystyk
- `debate_end` — debata zakończona
- `error` — błąd

Frontend → Backend:
- `start_debate` — `{ topic, settings }`
- `user_message` — `{ text }`
- `stop_debate` — resetuje sesję
- `ping` — keepalive
