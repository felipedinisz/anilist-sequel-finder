# 🏗️ Arquitetura do Sistema - AniList Sequel Finder Dashboard

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   HTML/CSS     │  │   HTMX       │  │   Alpine.js      │   │
│  │  (Tailwind)    │  │  (AJAX)      │  │   (Reatividade)  │   │
│  └────────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (FastAPI)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Layer (Routes)                     │  │
│  │  /auth/  /anime/  /stats/  /sequels/  /user/            │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Business Logic Layer                     │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │   Auth      │  │   Sequel     │  │  Statistics   │  │  │
│  │  │   Service   │  │   Finder     │  │   Service     │  │  │
│  │  └─────────────┘  └──────────────┘  └───────────────┘  │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               ▼                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Data Access Layer                      │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │  Database   │  │    Cache     │  │   AniList     │  │  │
│  │  │   (ORM)     │  │   Manager    │  │   Client      │  │  │
│  │  └─────────────┘  └──────────────┘  └───────────────┘  │  │
│  └────────────┬─────────────────────────────────────────────┘  │
└───────────────┼──────────────────────────────────────────────────┘
                │
        ┌───────┴────────┬──────────────┬───────────────┐
        ▼                ▼              ▼               ▼
  ┌──────────┐    ┌──────────┐   ┌──────────┐   ┌──────────────┐
  │PostgreSQL│    │  Redis   │   │   File   │   │   AniList    │
  │(Prod) or │    │(Optional)│   │  System  │   │   GraphQL    │
  │ SQLite   │    │  Cache   │   │  Cache   │   │     API      │
  │  (Dev)   │    │          │   │(.cache/) │   │              │
  └──────────┘    └──────────┘   └──────────┘   └──────────────┘
```

---

## 🗂️ Estrutura de Diretórios

```
anilist-sequel-finder/
│
├── 📁 backend/                      # Backend FastAPI
│   ├── 📁 app/
│   │   ├── 📁 api/                  # Endpoints da API
│   │   │   ├── 📁 v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py          # Rotas de autenticação
│   │   │   │   ├── anime.py         # Rotas de anime
│   │   │   │   ├── sequels.py       # Rotas de sequências
│   │   │   │   ├── stats.py         # Rotas de estatísticas
│   │   │   │   └── users.py         # Rotas de usuários
│   │   │   └── deps.py              # Dependências compartilhadas
│   │   │
│   │   ├── 📁 core/                 # Configurações core
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Settings (Pydantic)
│   │   │   ├── security.py          # JWT, OAuth, hashing
│   │   │   └── logging.py           # Configuração de logs
│   │   │
│   │   ├── 📁 services/             # Lógica de negócio
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py      # Lógica de autenticação
│   │   │   ├── sequel_finder.py     # Refatorado do findanime.py
│   │   │   ├── anilist_client.py    # Client para API AniList
│   │   │   ├── cache_service.py     # Gerenciamento de cache
│   │   │   └── stats_service.py     # Cálculo de estatísticas
│   │   │
│   │   ├── 📁 models/               # Modelos SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # Model User
│   │   │   ├── anime.py             # Model Anime (cache)
│   │   │   ├── ignored_sequel.py    # Sequências ignoradas
│   │   │   └── notification.py      # Notificações
│   │   │
│   │   ├── 📁 schemas/              # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # UserSchema
│   │   │   ├── anime.py             # AnimeSchema
│   │   │   ├── sequel.py            # SequelSchema
│   │   │   └── stats.py             # StatsSchema
│   │   │
│   │   ├── 📁 db/                   # Database
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # Base model
│   │   │   ├── session.py           # DB session
│   │   │   └── init_db.py           # Inicialização
│   │   │
│   │   ├── 📁 middleware/           # Middlewares
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # Auth middleware
│   │   │   ├── rate_limit.py        # Rate limiting
│   │   │   └── error_handler.py     # Error handling
│   │   │
│   │   ├── 📁 utils/                # Utilitários
│   │   │   ├── __init__.py
│   │   │   ├── helpers.py           # Funções auxiliares
│   │   │   └── validators.py        # Validadores customizados
│   │   │
│   │   ├── __init__.py
│   │   └── main.py                  # Entry point FastAPI
│   │
│   ├── 📁 alembic/                  # Migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── 📁 tests/                    # Testes
│   │   ├── 📁 api/
│   │   ├── 📁 services/
│   │   └── conftest.py
│   │
│   ├── .env.example                 # Exemplo de variáveis de ambiente
│   ├── requirements.txt             # Dependências Python
│   └── alembic.ini                  # Config Alembic
│
├── 📁 frontend/                     # Frontend (HTML/CSS/JS)
│   ├── 📁 static/
│   │   ├── 📁 css/
│   │   │   ├── main.css             # Tailwind customizado
│   │   │   └── components.css       # Componentes
│   │   │
│   │   ├── 📁 js/
│   │   │   ├── main.js              # Script principal
│   │   │   ├── charts.js            # Configuração Chart.js
│   │   │   └── utils.js             # Utilidades JS
│   │   │
│   │   └── 📁 images/
│   │       ├── logo.png
│   │       └── favicon.ico
│   │
│   ├── 📁 templates/                # Templates HTML (Jinja2)
│   │   ├── base.html                # Template base
│   │   ├── index.html               # Landing page
│   │   ├── dashboard.html           # Dashboard principal
│   │   ├── sequels.html             # Lista de sequências
│   │   ├── stats.html               # Estatísticas
│   │   ├── profile.html             # Perfil do usuário
│   │   ├── anime_list.html          # Lista de animes
│   │   └── components/              # Componentes reutilizáveis
│   │       ├── navbar.html
│   │       ├── sidebar.html
│   │       ├── card.html
│   │       └── modal.html
│   │
│   └── tailwind.config.js           # Config Tailwind
│
├── 📁 scripts/                      # Scripts utilitários
│   ├── init_db.py                   # Inicializar banco
│   ├── seed_data.py                 # Dados de teste
│   └── migrate.sh                   # Script de migration
│
├── 📁 docs/                         # Documentação
│   ├── USER_STORIES.md              # User stories (já criado)
│   ├── ARCHITECTURE.md              # Este arquivo
│   ├── API.md                       # Documentação da API
│   └── DEPLOYMENT.md                # Guia de deploy
│
├── 📁 .cache/                       # Cache local (gitignored)
│   └── anilist_media_cache.json
│
├── .env                             # Variáveis de ambiente (gitignored)
├── .gitignore
├── docker-compose.yml               # Docker setup
├── Dockerfile                       # Docker image
├── README.md
├── LICENSE
└── requirements.txt                 # Root requirements
```

---

## 🔧 Stack Tecnológica

### Backend
- **Framework:** FastAPI 0.104+
- **Python:** 3.11+
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Validation:** Pydantic 2.0
- **Auth:** OAuth 2.0 + JWT
- **HTTP Client:** httpx (async)
- **Database (Dev):** SQLite
- **Database (Prod):** PostgreSQL 15+
- **Cache (Optional):** Redis 7+
- **Task Queue (Future):** Celery + Redis

### Frontend
- **HTML:** Jinja2 Templates
- **CSS:** Tailwind CSS 3.3+
- **Interactividade:** HTMX 1.9+
- **JS Framework:** Alpine.js 3.x
- **Charts:** Chart.js 4.x ou ApexCharts
- **Icons:** Heroicons ou Lucide

### DevOps
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Deploy:** Railway.app / Fly.io / Render
- **Monitoring (Future):** Sentry
- **Logs:** Python logging + Loguru

---

## 🗄️ Modelo de Dados

### Diagrama ER

```sql
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)            │
│ anilist_id (UNQ)   │
│ username           │
│ avatar_url         │
│ access_token (ENC) │
│ created_at         │
│ updated_at         │
│ last_sync          │
│ settings (JSON)    │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│  ignored_sequels    │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ anime_id           │
│ reason             │
│ created_at         │
└─────────────────────┘

┌─────────────────────┐
│   anime_cache       │
├─────────────────────┤
│ id (PK)            │
│ anilist_id (UNQ)   │
│ title              │
│ format             │
│ episodes           │
│ duration           │
│ relations (JSON)   │
│ cached_at          │
│ ttl                │
└─────────────────────┘

┌─────────────────────┐
│   notifications     │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ type               │
│ title              │
│ message            │
│ read               │
│ created_at         │
└─────────────────────┘
```

### Schemas Principais

#### User Schema
```python
class UserBase(BaseModel):
    anilist_id: int
    username: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    access_token: str

class User(UserBase):
    id: int
    created_at: datetime
    last_sync: Optional[datetime] = None
    settings: dict = {}
    
    class Config:
        from_attributes = True
```

#### Anime Schema
```python
class AnimeBase(BaseModel):
    anilist_id: int
    title: str
    format: str
    episodes: Optional[int] = None
    duration: Optional[int] = None

class AnimeWithRelations(AnimeBase):
    relations: List[AnimeRelation]
    
class AnimeCache(AnimeBase):
    id: int
    cached_at: datetime
    ttl: int = 86400  # 24 hours
```

#### Sequel Schema
```python
class SequelFound(BaseModel):
    base_anime: AnimeBase
    base_status: str  # COMPLETED or PLANNING
    sequel: AnimeBase
    sequel_format: str
    
class SequelBatch(BaseModel):
    sequels: List[SequelFound]
    total: int
    cache_hits: int
    cache_misses: int
```

---

## 🔌 Endpoints da API

### Autenticação
```
POST   /api/v1/auth/login          # Iniciar OAuth
GET    /api/v1/auth/callback       # Callback OAuth
POST   /api/v1/auth/refresh        # Refresh token
POST   /api/v1/auth/logout         # Logout
GET    /api/v1/auth/me             # Usuário atual
```

### Sequências
```
GET    /api/v1/sequels/find        # Buscar sequências pendentes
POST   /api/v1/sequels/add         # Adicionar à lista
POST   /api/v1/sequels/ignore      # Ignorar sequência
GET    /api/v1/sequels/ignored     # Listar ignoradas
DELETE /api/v1/sequels/ignored/:id # Remover do ignore
```

### Anime
```
GET    /api/v1/anime/list          # Lista do usuário
GET    /api/v1/anime/:id           # Detalhes de um anime
PUT    /api/v1/anime/:id/status    # Atualizar status
PUT    /api/v1/anime/:id/rating    # Atualizar nota
POST   /api/v1/anime/sync          # Sincronizar com AniList
```

### Estatísticas
```
GET    /api/v1/stats/overview      # Visão geral
GET    /api/v1/stats/charts        # Dados para gráficos
GET    /api/v1/stats/genres        # Análise de gêneros
GET    /api/v1/stats/timeline      # Timeline de consumo
POST   /api/v1/stats/export        # Exportar dados
```

### Usuário
```
GET    /api/v1/user/profile        # Perfil
PUT    /api/v1/user/settings       # Atualizar configurações
GET    /api/v1/user/notifications  # Listar notificações
PUT    /api/v1/user/notifications/:id/read  # Marcar como lida
```

---

## 🔐 Segurança

### Autenticação OAuth 2.0
```python
# Flow de autenticação
1. User clica "Login with AniList"
2. Redirect para: https://anilist.co/api/v2/oauth/authorize
3. Usuário autoriza
4. Redirect de volta com código
5. Exchange código por access_token
6. Gerar JWT interno
7. Armazenar token AniList criptografado
```

### JWT Structure
```json
{
  "sub": "user_id",
  "anilist_id": 123456,
  "username": "otaku_master",
  "exp": 1640000000,
  "iat": 1639000000
}
```

### Proteção de Rotas
```python
@router.get("/sequels/find")
async def find_sequels(
    current_user: User = Depends(get_current_user)
):
    # Route protegida
```

---

## 📊 Estratégia de Cache

### Níveis de Cache

#### 1. Application Cache (Memória)
```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_anime_details(anime_id: int):
    # Cache em memória para dados frequentes
```

#### 2. File System Cache
```python
# .cache/anilist_media_cache.json
{
  "123456": {
    "data": {...},
    "cached_at": "2025-11-14T12:00:00",
    "ttl": 86400
  }
}
```

#### 3. Database Cache
```python
# Tabela anime_cache
# TTL de 24 horas para dados de anime
# Atualizar quando detectar mudança
```

#### 4. Redis Cache (Opcional - Produção)
```python
# Session cache
redis.setex(f"user:{user_id}:sequels", 3600, json_data)

# Rate limiting
redis.incr(f"rate:{user_id}:{endpoint}", ex=60)
```

### Invalidação de Cache
- **Time-based:** TTL de 24h para dados de anime
- **Event-based:** Invalidar ao sincronizar
- **Manual:** Endpoint para forçar refresh

---

## 🚀 Performance e Otimizações

### Backend
- [ ] Queries assíncronas com SQLAlchemy async
- [ ] Connection pooling
- [ ] Lazy loading de relações
- [ ] Paginação em todas as listas
- [ ] Compressão de respostas (gzip)
- [ ] CDN para assets estáticos

### Frontend
- [ ] Lazy loading de imagens
- [ ] Debounce em buscas
- [ ] Virtual scrolling para listas longas
- [ ] Minificação de CSS/JS
- [ ] Service Worker (PWA - futuro)

### API AniList
- [ ] Batch requests quando possível
- [ ] Retry com exponential backoff
- [ ] Rate limit tracking
- [ ] Cache agressivo de dados imutáveis

---

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── unit/              # Testes unitários
│   ├── test_auth.py
│   ├── test_sequel_finder.py
│   └── test_cache.py
├── integration/       # Testes de integração
│   ├── test_api.py
│   └── test_db.py
└── e2e/              # Testes end-to-end (Playwright)
    └── test_user_flow.py
```

### Cobertura Mínima
- Unit: 80%
- Integration: 60%
- E2E: Fluxos críticos

---

## 📦 Deploy

### Development
```bash
docker-compose up -d
# SQLite + Hot reload
```

### Staging
```bash
# Railway.app com PostgreSQL
railway up
```

### Production
```bash
# Fly.io com PostgreSQL + Redis
fly deploy
```

### Variáveis de Ambiente
```env
# App
APP_ENV=production
SECRET_KEY=xxx
DEBUG=false

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# AniList OAuth
ANILIST_CLIENT_ID=xxx
ANILIST_CLIENT_SECRET=xxx
ANILIST_REDIRECT_URI=https://app.com/auth/callback

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=xxx
```

---

## 🔄 Próximos Passos

1. ✅ Documentação criada
2. 🔲 Setup do projeto FastAPI
3. 🔲 Configurar banco de dados
4. 🔲 Implementar autenticação OAuth
5. 🔲 Refatorar findanime.py em services
6. 🔲 Criar endpoints da API
7. 🔲 Desenvolver frontend
8. 🔲 Testes
9. 🔲 Deploy

---

**Arquitetura versão:** 1.0  
**Última atualização:** 14/11/2025  
**Autor:** Felipe Diniz
