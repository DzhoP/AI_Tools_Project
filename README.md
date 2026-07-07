# AI_Tools — каталог за AI инструменти

Уеб приложение за организиране на AI инструменти по категории, тагове и роли в екипа.
Изградено с **Laravel 13** (API) + **Next.js 16** (frontend) + **MySQL** + **Redis**, изцяло в Docker.

## Структура на проекта

```
AI_Tools_Project/
├── vibe.project/     ← Laravel backend (API + Blade admin вход)
└── vibe-frontend/    ← Next.js frontend
```

---

## 1. Инсталация

**Изисквания:** Docker (Desktop или Engine) и git.

```bash
# 1. Клонирай репото
git clone https://github.com/DzhoP/AI_Tools_Project.git
cd AI_Tools_Project

# 2. Създай .env файла на Laravel
cd vibe.project
cp .env.example .env
```

Отвори `vibe.project/.env` и задай следните стойности (връзка с Docker контейнерите):

```env
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vibe_db
DB_USERNAME=vibe_user
DB_PASSWORD=secret

SESSION_DRIVER=redis
CACHE_STORE=redis
REDIS_HOST=redis

MAIL_MAILER=log
```

Създай и `.env.local` за frontend-а:

```bash
cp vibe-frontend/.env.local.example vibe-frontend/.env.local
```

---

## 2. Стартиране с Docker

От папката `vibe.project`:

```bash
docker compose up -d --build
```

Това вдига 5 контейнера:

| Контейнер | Роля | Порт |
|---|---|---|
| `vibe_app` | PHP 8.3 / Laravel | — |
| `vibe_nginx` | Уеб сървър | **8000** |
| `vibe_mysql` | База данни | 3306 |
| `vibe_redis` | Cache и сесии | 6379 |
| `vibe_nextjs` | Next.js frontend | **3000** |

След първото стартиране създай таблиците и демо данните:

```bash
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
```

**Готово:**
- Frontend: http://localhost:3000
- Laravel (Blade вход): http://localhost:8000

### Демо акаунти

Всички с парола `password`:

| Име | Имейл | Роля |
|---|---|---|
| Иван Попов | owner@vibe.test | Owner (администратор) |
| Георги Веселинов | backend@vibe.test | Backend Developer |
| Елена Проданова | frontend@vibe.test | Frontend Developer |
| Симеон Стефанов | pm@vibe.test | Project Manager |
| Виктор Павлов | qa@vibe.test | QA Engineer |
| Ралица Калева | designer@vibe.test | Designer |

---

## 3. Как се добавят инструменти

1. Влез от http://localhost:3000/login
2. Натисни **„+ Добави"** в навигацията
3. Попълни формата — задължителни са само **името** и **нивото на трудност**. Останалото е по желание:
   - линкове (сайт, документация, видео)
   - описание и „Как се използва" (поддържа **Markdown**)
   - категории и тагове (могат да се създават директно от формата)
   - препоръчителни роли
   - реални примери със скрийншоти — чрез URL или качване на файл (JPG/PNG/WebP до 5MB)
4. Запази

**Важно:** инструмент, добавен от обикновен потребител, влиза със статус **„Чакащ"** и не се вижда в публичния списък, докато Owner не го одобри от админ панела (**Админ → Инструменти → таб „Чакащи"**). Инструмент, добавен от Owner, се одобрява автоматично.

---

## 4. Ролева система и права

Ролята се избира при регистрация (ролята **Owner не е достъпна** за саморегистрация — задава се само ръчно в базата).

| Действие | Гост | Всяка роля | Owner |
|---|:---:|:---:|:---:|
| Разглеждане на одобрени инструменти | ✅ | ✅ | ✅ |
| Добавяне на инструмент (влиза като „чакащ") | — | ✅ | ✅ (директно одобрен) |
| Редакция/изтриване на **собствен** инструмент | — | ✅ | ✅ |
| Редакция/изтриване на **чужд** инструмент | — | — | ✅ |
| Одобрение/отказ на предложения | — | — | ✅ |
| Списък с потребители (`/admin/users`) | — | — | ✅ |
| Одит лог (`/admin/activity`) | — | — | ✅ |

Защитата е на **три нива**:
1. **Меню** — линковете, за които нямаш права, не се показват (UX)
2. **Страница** — директен URL без права пренасочва към таблото
3. **API** — middleware `role:owner` връща `403` при опит без права; това е истинската защита

Одит логът записва кой потребител какво действие е извършил върху кой инструмент (добавяне, редакция, изтриване, одобрение, отказ).

---

## Полезни команди

```bash
# Логове на всички контейнери
docker compose logs -f

# Изпълнение на artisan команди
docker compose exec app php artisan <команда>

# Изчистване на кеша (Redis)
docker compose exec app php artisan cache:clear

# Спиране
docker compose down
```

> **Забележка:** проектът върви на native Docker Engine — редакциите по файловете на хоста се
> отразяват в контейнерите в реално време чрез bind mount-ове, без нужда от ръчно копиране.
> Контейнерът `vibe_app` върви с UID/GID 1001, за да може да пише в bind-mount-натите папки;
> при различен host UID презапиши `PUID`/`PGID` build-args в `docker-compose.yml`.
