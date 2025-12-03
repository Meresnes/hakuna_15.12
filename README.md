# Hakuna Light

Интерактивное приложение для голосования с real-time анимациями пламени. Проект для мероприятий, где участники выбирают "добрые дела" и видят свой вклад на большом экране.

## Технологии

### Frontend
- **React 18** + **TypeScript** (strict mode)
- **Vite** - сборка и dev server
- **Tailwind CSS** - стилизация
- **Framer Motion** - анимации
- **Socket.IO Client** - real-time коммуникация

### Backend
- **Express.js** + **TypeScript**
- **Socket.IO** - WebSocket сервер
- **PostgreSQL** + **node-postgres** (pg)
- **Helmet** + **CORS** - безопасность

### Инфраструктура
- **Docker** + **Docker Compose** - контейнеризация
- **Nginx** - reverse proxy для production

## Структура проекта

```
hakuna-light/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/       # UI компоненты
│   │   ├── context/          # React Context
│   │   ├── hooks/            # Custom hooks
│   │   └── pages/            # Страницы
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # Express сервер
│   ├── src/
│   │   ├── db/               # База данных
│   │   ├── routes/           # API маршруты
│   │   └── server.ts         # Точка входа
│   └── Dockerfile
├── db/
│   └── migrations/           # SQL миграции
├── docker-compose.yml
└── README.md
```

## Быстрый старт

### Требования
- Node.js >= 18
- PostgreSQL >= 14 (или Docker)
- npm или yarn

### Development

1. **Клонировать репозиторий и установить зависимости:**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Настроить переменные окружения:**

```bash
# backend/.env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgres://hakuna:hakuna_secret@localhost:5432/hakuna_db
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:5173
```

3. **Запустить PostgreSQL** (если не через Docker):

```bash
# Создать базу данных
createdb hakuna_db
```

4. **Запустить миграции:**

```bash
cd backend
npm run migrate
```

5. **Запустить dev серверы:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Открыть в браузере:**
- Frontend: http://localhost:5173
- Health check: http://localhost:3001/api/health
- Presenter: http://localhost:5173/presenter
- Admin: http://localhost:5173/admin

### Production (Docker Compose)

1. **Скопировать и настроить .env:**

```bash
cp .env.example .env
# Отредактировать переменные
```

2. **Запустить все сервисы:**

```bash
docker-compose up --build
```

3. **Открыть:**
- Frontend: http://localhost
- Backend: http://localhost:3001

## API Документация

### REST Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/health` | Health check |
| GET | `/api/state` | Текущее состояние (счётчики, последние голоса) |
| POST | `/api/submit` | Проверка кода доступа |
| POST | `/api/choice` | Отправка выбора |
| GET | `/api/admin/last50` | Последние 50 голосов (требует auth) |
| GET | `/api/admin/export` | Экспорт CSV (требует auth) |
| POST | `/api/admin/reset` | Сброс БД (требует auth) |

### Socket.IO Events

**Namespace:** `/live`

| Event | Direction | Payload |
|-------|-----------|---------|
| `handshake` | client → server | `{ role: 'presenter' \| 'client' \| 'admin' }` |
| `sync_state` | server → client | `{ counts, total, last50, brightness }` |
| `submit_choice` | client → server | `{ name, choice }` |
| `new_vote` | server → all | `{ id, name, choice, color }` |
| `update_counts` | server → all | `{ counts, total, brightness }` |

## Страницы

1. **/** - Ввод имени и кода доступа
2. **/choose** - Выбор одного из 4 вариантов "добрых дел"
3. **/thanks** - Страница благодарности
4. **/presenter** - Экран для проекции (анимации пламени)
5. **/admin** - Панель администратора

## Настройка

### Изменение кода доступа

Код хранится в таблице `settings`:

```sql
UPDATE settings SET value = '1234' WHERE key = 'code';
```

### Изменение целевого количества голосов

```sql
UPDATE settings SET value = '200' WHERE key = 'target_count';
```

### Изменение диапазона яркости

```sql
UPDATE settings SET value = '0.3' WHERE key = 'brightness_min';
UPDATE settings SET value = '1.0' WHERE key = 'brightness_max';
```

## Разработка

### Скрипты

```bash
# Backend
npm run dev       # Запуск в dev режиме с hot reload
npm run build     # Сборка TypeScript
npm run start     # Запуск production сервера
npm run migrate   # Запуск миграций
npm run lint      # Проверка ESLint
npm run format    # Форматирование Prettier

# Frontend
npm run dev       # Запуск dev сервера
npm run build     # Production сборка
npm run preview   # Превью production сборки
npm run lint      # Проверка ESLint
```

### Линтинг

Проект использует ESLint + Prettier с TypeScript strict конфигурацией.

## Лицензия

MIT
