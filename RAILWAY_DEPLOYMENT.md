# 🚂 Railway Deployment Guide для AstroLuna

Полное руководство по деплою fullstack приложения AstroLuna на Railway.

## 📋 Что нужно перед началом

- [x] Аккаунт на [Railway](https://railway.app)
- [x] GitHub репозиторий с кодом проекта
- [x] Git настроен локально

## 🚀 Пошаговая инструкция деплоя

### 1. Подготовка GitHub репозитория

```bash
# 1. Инициализируем git (если еще не сделано)
git init
git add .
git commit -m "Initial commit: AstroLuna fullstack app"

# 2. Создаем репозиторий на GitHub и пушим
git remote add origin https://github.com/your-username/astroluna-platform.git
git branch -M main
git push -u origin main
```

### 2. Создание проекта на Railway

1. Заходим на [Railway](https://railway.app)
2. Кликаем **"New Project"**
3. Выбираем **"Deploy from GitHub repo"**
4. Выбираем репозиторий `astroluna-platform`
5. Railway автоматически определит Node.js проект

### 3. Добавление PostgreSQL базы данных

1. В дашборде проекта кликаем **"+ New"**
2. Выбираем **"Database"** → **"Add PostgreSQL"**
3. Railway создаст новую PostgreSQL базу и предоставит `DATABASE_URL`

### 4. Настройка Environment Variables

В разделе **Variables** добавляем:

```bash
# Основные настройки
NODE_ENV=production
PORT=5000

# Database (автоматически от PostgreSQL сервиса)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Секреты (генерируем случайные строки)
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars

# Frontend URL (заполняем после первого деплоя)
FRONTEND_URL=https://your-app-name.railway.app
ALLOWED_ORIGINS=https://your-app-name.railway.app

# Email (опционально)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@astroluna.com

# Безопасность
COOKIE_SECRET=your-cookie-secret-min-32-chars
BCRYPT_ROUNDS=12

# Логирование
LOG_LEVEL=info
```

### 5. Настройка Build Settings

Railway автоматически использует наш `package.json`:

```json
{
  "scripts": {
    "build": "npm run client:build && npm run server:build",
    "start": "npm run start:railway"
  }
}
```

### 6. Первый деплой

1. Railway автоматически запустит деплой после коммита в `main`
2. Процесс займет 3-5 минут
3. После деплоя получим URL: `https://your-app-name.railway.app`

### 7. Обновление FRONTEND_URL

1. Копируем полученный URL из Railway
2. Обновляем переменные среды:
   ```bash
   FRONTEND_URL=https://your-actual-railway-url.railway.app
   ALLOWED_ORIGINS=https://your-actual-railway-url.railway.app
   ```
3. Сохраняем - Railway автоматически перезапустит

## 🗄️ Управление базой данных

### Подключение к базе

Railway предоставляет несколько способов:

1. **Railway CLI**:
   ```bash
   railway login
   railway connect postgres
   ```

2. **Прямое подключение**:
   - Host: `containers-us-west-xxx.railway.app`
   - Port: `6543`
   - Database: `railway`
   - User/Password: в переменных среды

### Миграции

Railway автоматически запустит миграции при деплое:

```bash
# В server/package.json
"start:railway": "npm run db:migrate && node dist/index.js"
```

### Просмотр данных

1. В Railway → PostgreSQL сервис → **Data** tab
2. Или через Railway CLI: `railway connect postgres`

## 🔧 Мониторинг и отладка

### Просмотр логов

1. **Railway Dashboard**: Deploy → View Logs
2. **Railway CLI**: 
   ```bash
   railway logs
   railway logs --follow
   ```

### Полезные команды

```bash
# Просмотр статуса
railway status

# Локальное подключение к переменным среды
railway shell

# Перезапуск сервиса
railway redeploy

# Откат к предыдущей версии
railway rollback
```

## 🌍 Настройка кастомного домена (опционально)

1. Railway Dashboard → Settings → Domains
2. Кликаем **"Custom Domain"**
3. Вводим домен: `astroluna.yourdomain.com`
4. Настраиваем DNS записи согласно инструкции Railway
5. Обновляем `FRONTEND_URL` на новый домен

## 🚨 Troubleshooting

### Частые проблемы

1. **Build Error: "Cannot find module"**
   ```bash
   # Проверяем dependencies в package.json
   npm install --production
   ```

2. **Database Connection Failed**
   ```bash
   # Проверяем DATABASE_URL в Variables
   # Убеждаемся что PostgreSQL сервис запущен
   ```

3. **Frontend не загружается**
   ```bash
   # Проверяем что client собрался корректно
   npm run client:build
   # Проверяем CORS настройки в server/src/app.ts
   ```

4. **Migration Errors**
   ```bash
   # Ручной запуск миграций через Railway CLI
   railway shell
   cd server && npm run db:migrate
   ```

### Debug команды

```bash
# Локальная проверка перед деплоем
npm run build
npm run start:railway

# Проверка БД схемы
railway connect postgres
\dt  # список таблиц
\d users  # схема таблицы users
```

## 📊 Мониторинг производительности

Railway предоставляет:
- ✅ Метрики CPU/Memory
- ✅ Network usage
- ✅ Database connections
- ✅ Response times
- ✅ Error rates

## 💰 Ценообразование Railway

- **Hobby Plan**: $5/месяц - до 5GB RAM, 5GB сторадж
- **Pro Plan**: $20/месяц - до 32GB RAM, безлимит проектов
- **Team Plan**: $20/пользователь/месяц - коллаборация

## 🎯 Рекомендации

1. **Используйте Environment Variables** для всех секретов
2. **Настройте Health Checks** в Dockerfile
3. **Мониторьте логи** в реальном времени
4. **Делайте регулярные бекапы БД**
5. **Тестируйте локально** перед каждым деплоем

---

## 📞 Поддержка

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: создавайте issue в репозитории проекта