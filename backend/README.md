# FastAPI Practice - Проект для обучения

Этот проект создан для обучения начинающих backend разработчиков основам FastAPI, работе с базой данных и валидации данных с помощью Pydantic.

## 📁 Структура проекта

```
Practice/
├── app/                    # Основной пакет приложения
│   ├── __init__.py        # Инициализация пакета
│   ├── main.py            # Главный файл с API endpoints
│   ├── models.py          # SQLAlchemy модели (структура БД)
│   ├── schemas.py         # Pydantic схемы (валидация)
│   ├── crud.py            # Функции для работы с БД
│   ├── database.py        # Конфигурация БД и сессии
│   ├── config.py          # Настройки приложения
│   └── db.py              # (уже не используется)
├── requirements.txt       # Зависимости проекта
├── .env.example          # Пример файла конфигурации
├── .gitignore            # Файлы для игнорирования Git
└── README.md             # Этот файл
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Перейти в директорию проекта
cd Practice

# Установить зависимости
pip install -r requirements.txt
```

### 2. Подготовка конфигурации

```bash
# Копировать пример конфигурации
cp .env.example .env
```

### 3. Запуск приложения

```bash
# Запустить приложение с автоперезагрузкой
uvicorn app.main:app --reload

# Или с указанием порта
uvicorn app.main:app --reload --port 8000
```

Приложение запустится на http://localhost:8000

### 4. Интерактивная документация

После запуска приложения откройте в браузере:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 Основные концепции

### 1. **Models.py** - SQLAlchemy модели

Модели представляют таблицы в базе данных:

```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(100), unique=True)
```

### 2. **Schemas.py** - Pydantic валидация

Схемы используются для:
- Валидации входящих данных
- Сериализации выходящих данных

```python
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    
class User(BaseModel):
    id: int
    username: str
    email: str
    class Config:
        from_attributes = True  # Работа с ORM моделями
```

### 3. **CRUD операции** - Работа с БД

Create, Read, Update, Delete функции:

```python
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    return db_user
```

### 4. **API Endpoints** - REST API

```python
@app.post("/users/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.User)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db=db, user_id=user_id)
```

## 🔌 API Endpoints

### Users

| Метод | Endpoint | Описание |
|-------|----------|---------|
| POST | `/users/` | Создать пользователя |
| GET | `/users/` | Получить список пользователей |
| GET | `/users/{user_id}` | Получить пользователя по ID |
| PUT | `/users/{user_id}` | Обновить пользователя |
| DELETE | `/users/{user_id}` | Удалить пользователя |

### Posts

| Метод | Endpoint | Описание |
|-------|----------|---------|
| POST | `/posts/` | Создать пост |
| GET | `/posts/` | Получить список постов |
| GET | `/posts/{post_id}` | Получить пост по ID |
| GET | `/users/{user_id}/posts/` | Получить посты пользователя |
| PUT | `/posts/{post_id}` | Обновить пост |
| DELETE | `/posts/{post_id}` | Удалить пост |

## 📝 Примеры использования

### Создать пользователя

```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }'
```

### Получить пользователя

```bash
curl "http://localhost:8000/users/1"
```

### Обновить пользователя

```bash
curl -X PUT "http://localhost:8000/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Updated"
  }'
```

### Создать пост

```bash
curl -X POST "http://localhost:8000/posts/?owner_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is content of my first post",
    "is_published": true
  }'
```

### Получить посты пользователя

```bash
curl "http://localhost:8000/users/1/posts/"
```

## 🗄️ База данных

По умолчанию используется SQLite (`test.db`). 

Для использования PostgreSQL измените `DATABASE_URL` в `.env`:

```
DATABASE_URL=postgresql://user:password@localhost/dbname
```

## 📚 Ресурсы для обучения

- [FastAPI документация](https://fastapi.tiangolo.com/)
- [Pydantic документация](https://docs.pydantic.dev/)
- [SQLAlchemy документация](https://docs.sqlalchemy.org/)
- [HTTP методы](https://developer.mozilla.org/ru/docs/Web/HTTP/Methods)

## 💡 Советы для обучения

1. **Изучите каждый файл последовательно**:
   - Начните с `config.py` - понимайте конфигурацию
   - Затем `models.py` - структура БД
   - Потом `schemas.py` - валидация
   - Далее `crud.py` - работа с БД
   - Наконец `main.py` - API endpoints

2. **Экспериментируйте в Swagger UI**:
   - Откройте http://localhost:8000/docs
   - Попробуйте все endpoints
   - Смотрите запросы и ответы

3. **Добавляйте свои модели**:
   - Создайте новую модель в `models.py`
   - Добавьте Pydantic схемы в `schemas.py`
   - Реализуйте CRUD операции в `crud.py`
   - Создайте endpoints в `main.py`

4. **Изучите валидацию Pydantic**:
   - Попробуйте отправить неверные данные
   - Смотрите сообщения об ошибках
   - Экспериментируйте с Field параметрами

## 🐛 Troubleshooting

### Ошибка: ModuleNotFoundError

```bash
# Убедитесь, что вы запускаете из правильной директории
cd Practice
uvicorn app.main:app --reload
```

### Ошибка: Database is locked

Закройте другие подключения к БД или удалите `test.db`:

```bash
rm test.db
```

### Сессия БД не закрывается

Убедитесь, что используете `Depends(get_db)` в endpoints.

## 📄 Лицензия

Этот проект создан в образовательных целях.

## 🤝 Вклад

Если вы нашли ошибку или хотите улучшить проект, создайте issue или pull request.

---

**Удачи в обучении FastAPI! 🚀**
