# Auth Template - Full Stack Authentication Boilerplate

Шаблон проекта с полной системой аутентификации на основе JWT + Cookies. Включает в себя:
- **Backend** (Node.js/Express) - порт 5000
- **Frontend** (React/Vite) - порт 3000
- **Admin Panel** (React/Vite) - порт 3001

## 🚀 Возможности

### Backend
- ✅ Регистрация и логин пользователей
- ✅ JWT аутентификация с HttpOnly cookies
- ✅ Защита от CSRF (sameSite: strict)
- ✅ Роли пользователей (user/admin)
- ✅ Middleware для защиты роутов
- ✅ Rate limiting
- ✅ MongoDB + Mongoose
- ✅ Хеширование паролей (bcryptjs)
- ✅ Глобальные обработчики ошибок
- ✅ **Система миграций БД** (up/down rollback, транзакции)

### Frontend
- ✅ Контекст аутентификации (AuthContext)
- ✅ Защищённые роуты (PrivateRoute)
- ✅ Автоматическая проверка токена
- ✅ Формы логина и регистрации
- ✅ Dashboard для авторизованных пользователей

### Admin Panel
- ✅ Проверка прав администратора (AdminRoute)
- ✅ Управление пользователями
- ✅ Таблица всех пользователей с фильтрами

---

## 📦 Установка

### 1. Backend

```bash
cd backend
cp .env.example .env
# Отредактируйте .env и укажите свои данные
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Panel

```bash
cd admin-panel
npm install
npm run dev
```

---

## 🔧 Переменные окружения

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-template
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
RUN_MIGRATIONS=true
```

---

## 🗄️ Миграции базы данных

Проект включает мощную систему миграций для MongoDB с поддержкой:

- Версионирование изменений схемы БД
- Up/Down миграции для отката изменений
- Автоматическое отслеживание применённых миграций
- Транзакции (для MongoDB 4.0+)
- Идмпотентность (безопасный повторный запуск)

### Запуск миграций

```bash
# Запустить все ожидающие миграции
npm run migrate:up

# Откатить последнюю миграцию
npm run migrate:down

# Откатить все миграции
npm run migrate:rollback-all

# Показать статус миграций
npm run migrate:status
```

### Создание новой миграции

Добавьте миграцию в `backend/src/migrations/index.js`:

```javascript
migrationRunner.addMigration(
    '005-add-new-field',
    
    // UP - применение
    async (session) => {
        const db = mongoose.connection.db;
        await db.collection('users').updateMany(
            {},
            { $set: { newField: 'defaultValue' } },
            { session }
        );
    },
    
    // DOWN - откат
    async (session) => {
        const db = mongoose.connection.db;
        await db.collection('users').updateMany(
            {},
            { $unset: { newField: '' } },
            { session }
        );
    }
);
```

📖 Полная документация по миграциям: [backend/src/migrations/README.md](backend/src/migrations/README.md)

---

## 📁 Структура проекта

```
auth-template/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── users.js
│   │   ├── middlewares/
│   │   │   └── auth.js
│   │   ├── migrations/           # Система миграций БД
│   │   │   ├── MigrationRunner.js
│   │   │   ├── index.js
│   │   │   └── README.md
│   │   ├── scripts/              # CLI скрипты
│   │   │   └── migrate.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── admin-panel/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── AdminRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Users.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🔑 API Endpoints

### Auth
| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/api/auth/register` | Регистрация нового пользователя | Public |
| POST | `/api/auth/login` | Логин пользователя | Public |
| GET | `/api/auth/me` | Получить текущего пользователя | Private |
| POST | `/api/auth/logout` | Выход из системы | Private |

### Users
| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/api/users` | Получить всех пользователей | Private/Admin |
| GET | `/api/users/:id` | Получить пользователя по ID | Private |

---

## 🎯 Как использовать в своих проектах

1. Скопируйте папку `backend` в свой проект
2. Скопируйте либо `frontend`, либо `admin-panel` (или оба)
3. Настройте переменные окружения
4. Запустите MongoDB
5. Запустите миграции: `npm run migrate:up`
6. Запустите все сервисы

---

## 🛡️ Безопасность

- Пароли хешируются с bcrypt (salt rounds: 10)
- JWT токены хранятся в HttpOnly cookies (недоступны через JavaScript)
- sameSite: strict защищает от CSRF атак
- secure: true в production (только HTTPS)
- Rate limiting предотвращает брутфорс атаки

---

## 👥 Роли пользователей

В проекте реализована система ролей:

- **user** - обычный пользователь (может регистрироваться на фронте, имеет доступ к dashboard)
- **admin** - администратор (имеет доступ к админ-панели для управления пользователями)

По умолчанию при регистрации создаётся пользователь с ролью `user`.
Администратор создаётся через миграцию при первом запуске:
- Email: `admin@example.com`
- Пароль: `admin123`

⚠️ **Важно:** Смените пароль администратора в production!

---

## 📝 Лицензия

MIT License - свободно используйте в своих проектах!
