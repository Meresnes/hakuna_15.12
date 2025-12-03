<!-- ac19adab-e86a-4194-8401-405a145b86a6 3da07876-10ba-49cd-b456-67ac20301d2c -->
# План разработки hakuna-light

## Архитектура проекта

```
hakuna-light/
├── frontend/                 # React + Vite + TypeScript
├── backend/                  # Express + Socket.IO + TypeScript
├── db/migrations/            # SQL миграции
├── docker-compose.yml        # Оркестрация контейнеров
└── README.md                 # Документация
```

---

## Block 1: Инициализация репозитория

### Структура frontend/

- `vite.config.ts` - конфигурация Vite с proxy на backend
- `tsconfig.json` - strict TypeScript
- `tailwind.config.js` - Tailwind CSS
- `index.html` - шрифты Cinzel, Great Vibes, Inter (Google Fonts)
- `src/App.tsx` - роутинг (react-router-dom)
- `src/main.tsx` - точка входа

### Структура backend/

- `src/server.ts` - Express + Socket.IO сервер
- `src/routes/` - API маршруты
- `src/db/` - работа с PostgreSQL
- `Dockerfile` - multi-stage build

### Docker

- `docker-compose.yml`: frontend (nginx), backend (node), postgres
- Volumes для данных postgres

---

## Block 2: База данных

### Миграции

- `db/migrations/001-create-votes.sql`:
  ```sql
  CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    choice SMALLINT NOT NULL CHECK (choice BETWEEN 1 AND 4),
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- `db/migrations/002-create-settings.sql`:
  ```sql
  CREATE TABLE settings (key VARCHAR PRIMARY KEY, value TEXT);
  INSERT INTO settings VALUES 
    ('code','8375'), ('target_count','110'),
    ('brightness_min','0.2'), ('brightness_max','1.10');
  ```


### Backend

- `backend/src/db/pool.ts` - pg Pool
- `backend/src/db/init.ts` - запуск миграций
- `backend/src/db/queries.ts` - SQL-запросы

---

## Block 3: REST API

### Endpoints

| Method | Path | Описание |

|--------|------|----------|

| GET | `/api/health` | Health check |

| GET | `/api/state` | Текущее состояние (counts, last50, target, brightness) |

| POST | `/api/submit` | Проверка кода `{name, code}` |

| POST | `/api/choice` | Сохранение выбора `{name, choice}` |

| GET | `/api/admin/last50` | Последние 50 голосов (auth) |

| GET | `/api/admin/export` | CSV экспорт (auth) |

| POST | `/api/admin/reset` | Сброс голосов (auth) |

### Файлы

- `backend/src/routes/health.ts`
- `backend/src/routes/state.ts`
- `backend/src/routes/submit.ts`
- `backend/src/routes/choice.ts`
- `backend/src/routes/admin.ts`
- `backend/src/middleware/adminAuth.ts`

---

## Block 4: Socket.IO

### События

| Событие | Направление | Payload |

|---------|-------------|---------|

| `handshake` | client→server | `{role: 'presenter'|'client'|'admin'}` |

| `sync_state` | server→client | `{counts, total, last50, brightness}` |

| `submit_choice` | client→server | `{name, choice}` |

| `new_vote` | server→all | `{id, name, choice, color}` |

| `update_counts` | server→all | `{counts, total, brightness}` |

### Файлы

- `backend/src/socket.ts` - полная логика Socket.IO
- Reconnection: при переподключении отправляется `sync_state`

---

## Block 5: Frontend страницы

### Роутинг

- `/` - Enter.tsx (имя + код)
- `/choose` - Choose.tsx (4 варианта)
- `/thanks` - Thanks.tsx
- `/presenter` - Presenter.tsx (анимации)
- `/admin` - Admin.tsx

### State management

- `src/context/AppContext.tsx` - React Context для состояния
- `src/hooks/useSocket.ts` - Socket.IO hook

### Компоненты

- `src/components/FlameButton.tsx` - кнопка-пламя
- `src/components/Modal.tsx` - модальное окно
- `src/pages/*.tsx` - страницы

---

## Block 6: PresenterCanvas

### Архитектура

- `src/components/PresenterCanvas.tsx` - Canvas рендеринг
- `src/hooks/useCanvasAnimation.ts` - анимационный hook

### Логика пламени

```typescript
interface Flame {
  id: string;
  name: string;
  color: string; // red|yellow|white|orange
  x: number;
  y: number;
  startTime: number;
  duration: 4000; // ms
}
```

### Яркость фона

```typescript
brightness = clamp(
  brightness_min + (total / target) * (brightness_max - brightness_min),
  brightness_min,
  brightness_max
);
```

---

## Ключевые технические решения

1. **Database**: node-postgres (pg) - простейший вариант без ORM
2. **Migrations**: простой runner на основе fs.readdir + pool.query
3. **Auth**: Basic auth через env `ADMIN_PASSWORD` для admin routes
4. **Animations**: Framer Motion для UI + Canvas API для пламён
5. **Styling**: Tailwind CSS + CSS variables для тем

---

## Команды запуска

### Development

```bash
# Терминал 1: Backend
cd backend && npm run dev

# Терминал 2: Frontend  
cd frontend && npm run dev
```

### Production (Docker)

```bash
docker-compose up --build
```

---

## Проверка работоспособности

1. Backend health: `curl http://localhost:3001/api/health` → `{"ok":true}`
2. Frontend: открыть `http://localhost:5173`
3. Presenter: открыть `http://localhost:5173/presenter`

---

## Входные данные (получены)

### 4 варианта "хороших дел" для /choose:

1. **Красный** (red): "Сегодня я добавил(а) света в мир, исполнив заповеди тфилин, цдаки или молитвы."
2. **Жёлтый** (yellow): "Я беру на себя добавить света в мир, регулярно зажигая свечи Шаббата / соблюдая Шаббат как положено."
3. **Белый** (white): "Я беру на себя добавить света в мир на неделе Хануки и зажигать ханукальные свечи каждый день."
4. **Оранжевый** (orange): "Я беру на себя зажечь свет в душе ещё одного еврея, приведя его в общину или побудив его выполнить ещё одну заповедь."

### Изображение планеты:

- Заглушка: CSS градиентная сфера с эффектом свечения
- Пользователь предоставит изображение позже

### To-dos

- [ ] Block 1: Инициализация репозитория (frontend, backend, docker-compose, configs)
- [ ] Block 2: SQL миграции и инициализация базы данных
- [ ] Block 3: REST API endpoints (health, state, submit, choice, admin)
- [ ] Block 4: Socket.IO события и логика real-time обновлений
- [ ] Block 5: Frontend страницы (Enter, Choose, Thanks, Presenter, Admin)
- [ ] Block 6: PresenterCanvas с анимацией пламени и яркостью