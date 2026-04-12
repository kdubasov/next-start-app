# Instructions API Contract

## Общее

- Base URL: `/api/v1`
- Язык контента определяется заголовком `Accept-Language: ru | en`
- Все даты в формате ISO 8601 (`2026-04-12T15:22:34.184Z`)
- Время чтения в формате ISO 8601 Duration (`PT5M` = 5 минут)
- Пагинация: `page` (начинается с 1), `pageSize` (по умолчанию 12)

---

## 1. GET `/api/v1/instructions`

Список инструкций с фильтрацией, сортировкой, поиском и пагинацией.

### Query Parameters

| Параметр   | Тип      | Обязательный | По умолчанию | Описание |
|------------|----------|:---:|--------------|----------|
| `page`     | number   | нет | `1`          | Номер страницы (начинается с 1) |
| `pageSize` | number   | нет | `12`         | Количество элементов на странице (макс 50) |
| `category` | string   | нет | —            | Slug категории (`ai`, `crypto`). Если не передан — все категории |
| `sort`     | string   | нет | `newest`     | Сортировка: `newest` (по дате) или `popular` (по просмотрам) |
| `q`        | string   | нет | —            | Поисковый запрос (поиск по title). Минимум 2 символа |

### Response `200 OK`

```jsonc
{
  // Пагинация
  "page": 1,
  "pageSize": 12,
  "total": 50,
  "totalPages": 5,

  // Категории (для фильтров и SEO категорийных страниц)
  "categories": [
    {
      "id": 1,
      "slug": "ai",
      "label": "AI",                                    // Локализованное название
      "seo": {
        "title": "AI-инструкции — Open Academy",
        "description": "Гайды по AI, промпт-инжинирингу...",
        "keywords": ["ai", "llm", "промпты"],
        "ogImageUrl": "https://cdn.example.com/og/ai.jpg"
      }
    }
  ],

  // SEO для текущей страницы списка (root /instructions)
  "seo": {
    "title": "Инструкции — Open Academy",
    "description": "Пошаговые инструкции, разборы и гайды...",
    "keywords": ["инструкции", "гайды", "ai", "crypto"],
    "ogImageUrl": "https://cdn.example.com/og/instructions.jpg"
  },

  // Элементы списка
  "items": [
    {
      "id": 1,
      "slug": "kak-nastroit-claude-code",               // URL-safe slug (латиница)
      "title": "Как настроить Claude Code на проекте",
      "category": "ai",                                  // Slug категории

      // Визуальное оформление карточки
      "gradient": "linear-gradient(180deg, #DCEBFB 0%, #2F6BBE 100%)",
      "cardImage": "https://cdn.example.com/instructions/1.svg",
      "borderColor": "#96BFFF",

      // Автор
      "author": {
        "id": 1,
        "name": "Дмитрий Волков",
        "avatar": "https://cdn.example.com/avatars/1.jpg"
      },

      // Метаданные
      "viewsCount": 1250,
      "timeToRead": "PT5M",                              // ISO 8601 Duration
      "courseId": null,                                   // number | null — связь с курсом
      "lessonId": null,                                   // number | null — связь с уроком
      "published": true,
      "createdAt": "2026-03-15T10:30:00.000Z",
      "updatedAt": "2026-04-01T14:20:00.000Z",

      // SEO для страницы статьи (используется фронтом для <meta> тегов)
      "seo": {
        "title": "Как настроить Claude Code на проекте — Open Academy",
        "description": "Разбираем конфиг, хуки и настройку под команду.",
        "keywords": ["claude code", "ai", "инструкция"],
        "ogImageUrl": "https://cdn.example.com/og/instructions/1.jpg"
      }
    }
  ]
}
```

### Примеры запросов

```
GET /api/v1/instructions
GET /api/v1/instructions?page=2&pageSize=12
GET /api/v1/instructions?category=crypto&sort=popular
GET /api/v1/instructions?q=claude&sort=newest
GET /api/v1/instructions?category=ai&page=3
```

### Примечания

- Поле `categories` всегда возвращается в ответе (нужно для рендера фильтров на фронте)
- Поле `seo` на верхнем уровне — SEO для страницы списка `/instructions`. Если передан `category`, `seo` должен содержать данные для категорийной страницы (например, `/instructions/crypto`)
- Возвращаются только `published: true` инструкции
- При `q` < 2 символов — игнорировать поиск
- При `page` > `totalPages` — возвращать пустой `items: []`

---

## 2. GET `/api/v1/instructions/{slug}`

Полные данные одной инструкции для рендера страницы.

### Path Parameters

| Параметр | Тип    | Описание |
|----------|--------|----------|
| `slug`   | string | URL-safe slug инструкции |

### Response `200 OK`

```jsonc
{
  "id": 1,
  "slug": "kak-nastroit-claude-code",
  "title": "Как настроить Claude Code на проекте",
  "category": "ai",

  // Визуальное оформление (hero-секция)
  "gradient": "linear-gradient(180deg, #DCEBFB 0%, #2F6BBE 100%)",
  "cardImage": "https://cdn.example.com/instructions/1.svg",
  "borderColor": "#96BFFF",

  // Автор
  "author": {
    "id": 1,
    "name": "Дмитрий Волков",
    "avatar": "https://cdn.example.com/avatars/1.jpg"
  },

  // Контент
  "content": "## Установка Claude Code\n\nClaude Code — это CLI-инструмент...",  // Markdown

  // Метаданные
  "viewsCount": 1250,
  "timeToRead": "PT5M",
  "courseId": null,
  "lessonId": null,
  "published": true,
  "createdAt": "2026-03-15T10:30:00.000Z",
  "updatedAt": "2026-04-01T14:20:00.000Z",

  // SEO
  "seo": {
    "title": "Как настроить Claude Code на проекте — Open Academy",
    "description": "Разбираем конфиг, хуки и настройку под команду.",
    "keywords": ["claude code", "ai", "инструкция"],
    "ogImageUrl": "https://cdn.example.com/og/instructions/1.jpg"
  }
}
```

### Response `404 Not Found`

```json
{
  "error": "INSTRUCTION_NOT_FOUND",
  "message": "Instruction with slug 'nonexistent' not found"
}
```

### Примечания

- Контент (`content`) — в формате Markdown. Фронт парсит его на сервере через unified/remark/rehype
- При запросе неопубликованной (`published: false`) инструкции — возвращать 404
- Бек должен инкрементировать `viewsCount` при каждом GET-запросе (или отдельным механизмом)

---

## 3. Избранные инструкции (отдельные ручки)

> Сохранённые инструкции реализуются отдельными эндпоинтами. На данный момент закладки хранятся в `localStorage` на клиенте. При переходе на серверное хранение потребуются следующие эндпоинты:

### POST `/api/v1/instructions/{slug}/bookmark`

Добавить инструкцию в избранное текущего пользователя.

- Требует авторизации
- Response: `201 Created` (без тела) / `409 Conflict` (уже в избранном)

### DELETE `/api/v1/instructions/{slug}/bookmark`

Убрать инструкцию из избранного.

- Требует авторизации
- Response: `204 No Content` / `404 Not Found` (не была в избранном)

### GET `/api/v1/instructions/bookmarks`

Список избранных инструкций текущего пользователя.

- Требует авторизации
- Поддерживает `page`, `pageSize`
- Response: тот же формат, что у `GET /api/v1/instructions` (без `categories` и `seo` верхнего уровня)

---

## Маппинг: текущий бек → новый контракт

| Текущее поле (бек)       | Новое поле          | Примечание |
|--------------------------|---------------------|------------|
| `id`                     | `id`                | number, без изменений |
| `name`                   | `title`             | Переименование |
| `customLink`             | `slug`              | Переименование, должен быть URL-safe (латиница) |
| `text`                   | `content`           | Только в детальном ответе. Формат: Markdown |
| `banner`                 | `cardImage`         | Переименование |
| `published`              | `published`         | Без изменений |
| `timeToRead`             | `timeToRead`        | Без изменений (ISO 8601 Duration) |
| `courseId`               | `courseId`           | Без изменений |
| `watchesCount`           | `viewsCount`        | Переименование |
| `createdAt`              | `createdAt`         | Без изменений |
| —                        | `updatedAt`         | **Новое поле** — дата последнего обновления |
| —                        | `slug`              | **Новое поле** — URL-safe slug (латиница), генерируется из `name` |
| —                        | `category`          | **Новое поле** — slug категории (string) |
| —                        | `gradient`          | **Новое поле** — CSS-градиент для карточки |
| —                        | `borderColor`       | **Новое поле** — цвет рамки карточки |
| —                        | `lessonId`          | **Новое поле** — связь с уроком (number \| null) |
| —                        | `seo`               | **Новое поле** — объект с title, description, keywords, ogImageUrl |
| `author` (объект)        | `author` (упрощён)  | Оставляем только `id`, `name`, `avatar` |
| `author.username`        | `author.name`       | Маппинг |
| `author.avatar`          | `author.avatar`     | Без изменений |
| `videoId`                | —                   | Убрано (не используется на фронте инструкций) |
| `author.telegramUsername` | —                  | Убрано (не нужно на фронте) |
| `author.email`           | —                   | Убрано |
| `author.colour`          | —                   | Убрано |
| `author.categories`      | —                   | Убрано (категории теперь на уровне инструкции) |

---

## Категории

Категории должны быть отдельной сущностью в БД с полями:

| Поле          | Тип      | Описание |
|---------------|----------|----------|
| `id`          | number   | PK |
| `slug`        | string   | URL-safe идентификатор (`ai`, `crypto`) |
| `label`       | string   | Локализованное отображаемое название |
| `seo.title`       | string   | SEO title для категорийной страницы |
| `seo.description`  | string   | SEO description |
| `seo.keywords`     | string[] | SEO keywords |
| `seo.ogImageUrl`   | string   | OG Image URL |
| `order`       | number   | Порядок отображения в фильтрах |

Каждая инструкция привязывается к одной категории через `categoryId` (FK).

---

## Slug-генерация

- Slug должен быть **латиницей** (транслитерация кириллицы)
- URL-safe: только `[a-z0-9-]`
- Уникальный в рамках таблицы инструкций
- Пример: `"Как настроить Claude Code"` → `"kak-nastroit-claude-code"`
- Используется в URL: `/instruction/kak-nastroit-claude-code`
