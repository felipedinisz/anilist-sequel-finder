# 🚀 Como Rodar o Projeto

## Opção 1: Script Rápido (Recomendado)

```bash
./start.sh
```

Isso iniciará o servidor em: **http://localhost:8000**

## Opção 2: Manualmente

```bash
cd backend
export PYTHONPATH=$(pwd)
../.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Opção 3: Diretamente com Python

```bash
cd backend
PYTHONPATH=/home/felipeard/Documentos/Programação/Python/anilist_api/backend \
/home/felipeard/Documentos/Programação/Python/anilist_api/.venv/bin/uvicorn \
app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 Acessar Documentação

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Root**: http://localhost:8000/

## 🧪 Testar a API

Em outro terminal:

```bash
# Endpoint raiz
curl http://localhost:8000/

# Health check
curl http://localhost:8000/health

# Com formatação
curl http://localhost:8000/ | python -m json.tool
```

## 🛑 Parar o Servidor

Pressione `Ctrl+C` no terminal onde o servidor está rodando.

## ⚠️ Troubleshooting

### Erro: "comando não encontrado"
```bash
# Dê permissão de execução
chmod +x start.sh
```

### Erro: "porta já em uso"
```bash
# Encontre o processo usando a porta 8000
lsof -i :8000

# Mate o processo
kill -9 <PID>
```

### Erro: "módulo não encontrado"
```bash
# Reinstale as dependências
pip install -r backend/requirements.txt
```

### Erro: "banco de dados"
```bash
# Reinicialize o banco
cd backend
python init_db.py
```

## 🎯 Primeira Execução

1. **Configure o ambiente**:
   ```bash
   cd backend
   cp .env.example .env
   # Edite .env com suas credenciais AniList
   ```

2. **Inicialize o banco de dados**:
   ```bash
   python backend/init_db.py
   ```

3. **Inicie o servidor**:
   ```bash
   ./start.sh
   ```

4. **Acesse**: http://localhost:8000/docs

## ✅ Checklist

- [ ] Ambiente virtual ativado
- [ ] Dependências instaladas
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados inicializado
- [ ] Servidor rodando
- [ ] Documentação acessível

---

**Pronto para desenvolvimento!** 🎊
