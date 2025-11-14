# 📖 User Stories - AniList Sequel Finder Dashboard

## 🎯 Visão do Produto

**Nome:** AniList Sequel Finder Dashboard  
**Objetivo:** Fornecer uma plataforma web interativa para gerenciar e descobrir sequências de anime automaticamente, com estatísticas detalhadas e sincronização com AniList.

---

## 👥 Personas

### Persona 1: Otaku Casual - "Maria"
- **Idade:** 22 anos
- **Perfil:** Assiste anime regularmente mas não acompanha todas as sequências
- **Necessidade:** Descobrir facilmente quais sequências ela perdeu
- **Objetivo:** Manter sua lista organizada sem muito esforço

### Persona 2: Anime Enthusiast - "João"
- **Idade:** 28 anos
- **Perfil:** Assiste muitos animes, gosta de estatísticas e comparações
- **Necessidade:** Análises detalhadas de seus hábitos de consumo
- **Objetivo:** Otimizar seu tempo e descobrir padrões em suas preferências

### Persona 3: Completionista - "Ana"
- **Idade:** 19 anos
- **Perfil:** Quer assistir todas as sequências de suas séries favoritas
- **Necessidade:** Notificações automáticas de novas sequências
- **Objetivo:** Nunca perder uma sequência ou continuação

---

## 🎭 Épicos

### Épico 1: Autenticação e Perfil
Gerenciamento de usuários e integração com AniList

### Épico 2: Descoberta de Sequências
Sistema de análise e descoberta de sequências pendentes

### Épico 3: Dashboard e Estatísticas
Visualização de dados e insights sobre anime

### Épico 4: Gerenciamento de Lista
Operações CRUD na lista de anime do usuário

### Épico 5: Notificações e Automação
Sistema de alertas e sincronização automática

---

## 📝 User Stories Detalhadas

### Épico 1: Autenticação e Perfil

#### US1.1 - Login com AniList
**Como** usuário  
**Quero** fazer login usando minha conta AniList  
**Para que** eu possa acessar minha lista de anime de forma segura

**Critérios de Aceitação:**
- [ ] Botão "Login with AniList" na página inicial
- [ ] OAuth 2.0 implementado corretamente
- [ ] Redirecionamento após autenticação bem-sucedida
- [ ] Token armazenado de forma segura
- [ ] Mensagem de erro clara se falhar

**Prioridade:** 🔴 Alta  
**Estimativa:** 5 pontos  
**Dependências:** Nenhuma

---

#### US1.2 - Visualizar Perfil
**Como** usuário autenticado  
**Quero** ver informações do meu perfil AniList  
**Para que** eu confirme que estou logado na conta correta

**Critérios de Aceitação:**
- [ ] Avatar do usuário exibido
- [ ] Nome de usuário visível
- [ ] Total de animes assistidos/planejados
- [ ] Link para perfil AniList original
- [ ] Botão de logout

**Prioridade:** 🟡 Média  
**Estimativa:** 3 pontos  
**Dependências:** US1.1

---

#### US1.3 - Logout Seguro
**Como** usuário autenticado  
**Quero** fazer logout da aplicação  
**Para que** minha conta fique protegida em dispositivos compartilhados

**Critérios de Aceitação:**
- [ ] Botão de logout acessível
- [ ] Token removido do armazenamento
- [ ] Redirecionamento para página inicial
- [ ] Confirmação visual de logout

**Prioridade:** 🔴 Alta  
**Estimativa:** 2 pontos  
**Dependências:** US1.1

---

### Épico 2: Descoberta de Sequências

#### US2.1 - Buscar Sequências Pendentes
**Como** usuário autenticado  
**Quero** descobrir todas as sequências que estão faltando na minha lista  
**Para que** eu possa decidir quais assistir

**Critérios de Aceitação:**
- [ ] Botão "Buscar Sequências" no dashboard
- [ ] Barra de progresso durante a busca
- [ ] Lista de sequências encontradas com detalhes
- [ ] Cache utilizado para otimizar performance
- [ ] Indicador de tempo estimado de busca

**Prioridade:** 🔴 Alta  
**Estimativa:** 8 pontos  
**Dependências:** US1.1

---

#### US2.2 - Filtrar Sequências Encontradas
**Como** usuário  
**Quero** filtrar as sequências encontradas por tipo, status e formato  
**Para que** eu possa focar no que me interessa

**Critérios de Aceitação:**
- [ ] Filtro por formato (TV, Movie, OVA, Special)
- [ ] Filtro por status do anime base (Completed, Planning)
- [ ] Filtro por ano de lançamento
- [ ] Busca por nome
- [ ] Contador de resultados filtrados

**Prioridade:** 🟡 Média  
**Estimativa:** 5 pontos  
**Dependências:** US2.1

---

#### US2.3 - Ver Detalhes da Sequência
**Como** usuário  
**Quero** ver detalhes completos de uma sequência  
**Para que** eu possa decidir se quero assistir

**Critérios de Aceitação:**
- [ ] Modal ou página com detalhes expandidos
- [ ] Sinopse da sequência
- [ ] Capa/poster
- [ ] Número de episódios
- [ ] Data de lançamento
- [ ] Score médio
- [ ] Link direto para AniList

**Prioridade:** 🟡 Média  
**Estimativa:** 5 pontos  
**Dependências:** US2.1

---

#### US2.4 - Adicionar Sequência à Lista
**Como** usuário  
**Quero** adicionar uma sequência encontrada à minha lista de Planning  
**Para que** eu não precise fazer isso manualmente no AniList

**Critérios de Aceitação:**
- [ ] Botão "Add to Planning" em cada sequência
- [ ] Confirmação visual de sucesso
- [ ] Atualização imediata da interface
- [ ] Tratamento de erros
- [ ] Opção de adicionar múltiplas de uma vez

**Prioridade:** 🔴 Alta  
**Estimativa:** 5 pontos  
**Dependências:** US2.1

---

#### US2.5 - Ignorar Sequência
**Como** usuário  
**Quero** marcar uma sequência como "ignorada"  
**Para que** ela não apareça mais nas próximas buscas

**Critérios de Aceitação:**
- [ ] Botão "Ignore" em cada sequência
- [ ] Lista de sequências ignoradas acessível
- [ ] Possibilidade de remover do ignore
- [ ] Persistência entre sessões

**Prioridade:** 🟢 Baixa  
**Estimativa:** 4 pontos  
**Dependências:** US2.1

---

### Épico 3: Dashboard e Estatísticas

#### US3.1 - Ver Dashboard Principal
**Como** usuário autenticado  
**Quero** ver um dashboard com minhas estatísticas de anime  
**Para que** eu tenha uma visão geral rápida

**Critérios de Aceitação:**
- [ ] Cards com números principais (total assistido, planejado, etc)
- [ ] Gráfico de distribuição de status
- [ ] Tempo total estimado para PLANNING
- [ ] Últimas sequências adicionadas
- [ ] Design responsivo

**Prioridade:** 🔴 Alta  
**Estimativa:** 8 pontos  
**Dependências:** US1.1

---

#### US3.2 - Visualizar Gráficos de Consumo
**Como** usuário  
**Quero** ver gráficos sobre meus hábitos de anime  
**Para que** eu possa entender meus padrões de consumo

**Critérios de Aceitação:**
- [ ] Gráfico de animes por ano
- [ ] Distribuição por formato (TV, Movie, OVA)
- [ ] Top 10 studios assistidos
- [ ] Evolução temporal da lista
- [ ] Gráficos interativos (hover, zoom)

**Prioridade:** 🟡 Média  
**Estimativa:** 8 pontos  
**Dependências:** US3.1

---

#### US3.3 - Análise de Gêneros
**Como** usuário  
**Quero** ver estatísticas sobre os gêneros que mais assisto  
**Para que** eu descubra minhas preferências

**Critérios de Aceitação:**
- [ ] Lista de gêneros ordenada por quantidade
- [ ] Gráfico de pizza ou barras
- [ ] Percentuais calculados
- [ ] Filtro por status (completed, planning, etc)

**Prioridade:** 🟢 Baixa  
**Estimativa:** 5 pontos  
**Dependências:** US3.1

---

#### US3.4 - Exportar Estatísticas
**Como** usuário  
**Quero** exportar minhas estatísticas em diferentes formatos  
**Para que** eu possa compartilhar ou arquivar

**Critérios de Aceitação:**
- [ ] Export em CSV
- [ ] Export em JSON
- [ ] Export em PDF com gráficos
- [ ] Seleção de quais dados exportar

**Prioridade:** 🟢 Baixa  
**Estimativa:** 5 pontos  
**Dependências:** US3.1

---

### Épico 4: Gerenciamento de Lista

#### US4.1 - Visualizar Minha Lista Completa
**Como** usuário  
**Quero** ver todos os meus animes em uma tabela paginada  
**Para que** eu possa gerenciar minha lista facilmente

**Critérios de Aceitação:**
- [ ] Tabela com paginação
- [ ] Ordenação por colunas
- [ ] Busca rápida
- [ ] Filtros múltiplos
- [ ] Ações rápidas (editar status, nota, etc)

**Prioridade:** 🟡 Média  
**Estimativa:** 8 pontos  
**Dependências:** US1.1

---

#### US4.2 - Atualizar Status de Anime
**Como** usuário  
**Quero** alterar o status de um anime (Watching → Completed)  
**Para que** minha lista fique sempre atualizada

**Critérios de Aceitação:**
- [ ] Dropdown de status em cada anime
- [ ] Sincronização com AniList
- [ ] Feedback visual imediato
- [ ] Opção de atualizar múltiplos de uma vez

**Prioridade:** 🟡 Média  
**Estimativa:** 5 pontos  
**Dependências:** US4.1

---

#### US4.3 - Adicionar Nota e Review
**Como** usuário  
**Quero** adicionar/editar minha nota e comentário sobre um anime  
**Para que** eu registre minha opinião

**Critérios de Aceitação:**
- [ ] Campo de nota (0-10 ou sistema de estrelas)
- [ ] Campo de texto para review
- [ ] Sincronização com AniList
- [ ] Auto-save

**Prioridade:** 🟢 Baixa  
**Estimativa:** 5 pontos  
**Dependências:** US4.1

---

### Épico 5: Notificações e Automação

#### US5.1 - Configurar Notificações
**Como** usuário  
**Quero** configurar quais notificações receber  
**Para que** eu seja alertado apenas sobre o que me interessa

**Critérios de Aceitação:**
- [ ] Página de configurações de notificações
- [ ] Toggle para cada tipo de notificação
- [ ] Opção de frequência (diária, semanal)
- [ ] Preview de como será a notificação

**Prioridade:** 🟢 Baixa  
**Estimativa:** 5 pontos  
**Dependências:** US1.1

---

#### US5.2 - Receber Alertas de Novas Sequências
**Como** usuário  
**Quero** ser notificado quando uma nova sequência for anunciada  
**Para que** eu não perca nenhum lançamento importante

**Critérios de Aceitação:**
- [ ] Sistema de verificação periódica
- [ ] Notificação in-app
- [ ] Email opcional
- [ ] Listagem de novos animes detectados

**Prioridade:** 🟢 Baixa  
**Estimativa:** 8 pontos  
**Dependências:** US5.1, US2.1

---

#### US5.3 - Sincronização Automática
**Como** usuário  
**Quero** que minha lista seja sincronizada automaticamente com AniList  
**Para que** eu sempre veja dados atualizados

**Critérios de Aceitação:**
- [ ] Sincronização a cada X horas (configurável)
- [ ] Botão de sincronização manual
- [ ] Indicador de última sincronização
- [ ] Log de mudanças detectadas

**Prioridade:** 🟡 Média  
**Estimativa:** 8 pontos  
**Dependências:** US1.1

---

#### US5.4 - Backup e Restore
**Como** usuário  
**Quero** fazer backup da minha configuração e listas ignoradas  
**Para que** eu não perca meus dados se trocar de dispositivo

**Critérios de Aceitação:**
- [ ] Botão "Download Backup"
- [ ] Arquivo JSON com todas as configurações
- [ ] Opção de restaurar de arquivo
- [ ] Confirmação antes de sobrescrever

**Prioridade:** 🟢 Baixa  
**Estimativa:** 4 pontos  
**Dependências:** US1.1

---

## 🎨 Histórias Técnicas

### TS1 - Arquitetura da API
**Como** desenvolvedor  
**Quero** definir uma arquitetura escalável com FastAPI  
**Para que** o sistema seja performático e fácil de manter

**Tarefas:**
- [ ] Definir estrutura de pastas
- [ ] Configurar FastAPI + Uvicorn
- [ ] Implementar middleware de autenticação
- [ ] Configurar CORS
- [ ] Documentação automática (Swagger)

**Estimativa:** 5 pontos

---

### TS2 - Banco de Dados
**Como** desenvolvedor  
**Quero** implementar um sistema de banco de dados eficiente  
**Para que** os dados sejam armazenados e recuperados rapidamente

**Tarefas:**
- [ ] Escolher ORM (SQLAlchemy)
- [ ] Definir models/schemas
- [ ] Configurar migrations (Alembic)
- [ ] SQLite para dev, PostgreSQL para prod
- [ ] Índices otimizados

**Estimativa:** 8 pontos

---

### TS3 - Sistema de Cache Avançado
**Como** desenvolvedor  
**Quero** implementar cache em múltiplas camadas  
**Para que** a aplicação seja rápida e econômica em requisições

**Tarefas:**
- [ ] Cache em memória (Redis opcional)
- [ ] Cache de queries do banco
- [ ] Cache de respostas da API AniList
- [ ] Estratégia de invalidação
- [ ] TTL configurável

**Estimativa:** 8 pontos

---

### TS4 - Frontend Moderno
**Como** desenvolvedor  
**Quero** criar um frontend responsivo e interativo  
**Para que** a experiência do usuário seja excelente

**Tarefas:**
- [ ] Setup Tailwind CSS
- [ ] Componentes reutilizáveis
- [ ] HTMX para interatividade
- [ ] Alpine.js para lógica leve
- [ ] Chart.js para gráficos

**Estimativa:** 13 pontos

---

### TS5 - CI/CD Pipeline
**Como** desenvolvedor  
**Quero** automatizar testes e deploy  
**Para que** entregas sejam rápidas e confiáveis

**Tarefas:**
- [ ] GitHub Actions configurado
- [ ] Testes automatizados
- [ ] Linting e formatação
- [ ] Deploy automático
- [ ] Badges no README

**Estimativa:** 5 pontos

---

## 📊 Priorização (MVP)

### Must Have (MVP - Versão 1.0) 🔴
- US1.1 - Login com AniList
- US1.3 - Logout Seguro
- US2.1 - Buscar Sequências Pendentes
- US2.4 - Adicionar Sequência à Lista
- US3.1 - Ver Dashboard Principal
- TS1 - Arquitetura da API
- TS2 - Banco de Dados
- TS4 - Frontend Moderno

**Estimativa Total MVP:** ~50 pontos (~5-6 semanas)

### Should Have (Versão 1.1) 🟡
- US1.2 - Visualizar Perfil
- US2.2 - Filtrar Sequências
- US2.3 - Ver Detalhes da Sequência
- US3.2 - Visualizar Gráficos
- US4.1 - Visualizar Lista Completa
- US5.3 - Sincronização Automática
- TS3 - Sistema de Cache Avançado

**Estimativa Total v1.1:** ~38 pontos (~3-4 semanas)

### Could Have (Versão 2.0) 🟢
- US2.5 - Ignorar Sequência
- US3.3 - Análise de Gêneros
- US3.4 - Exportar Estatísticas
- US4.2 - Atualizar Status
- US4.3 - Adicionar Nota
- US5.1 - Configurar Notificações
- US5.2 - Alertas de Sequências
- US5.4 - Backup e Restore
- TS5 - CI/CD Pipeline

**Estimativa Total v2.0:** ~44 pontos (~4-5 semanas)

---

## 🚀 Roadmap Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: MVP (6 semanas)                  │
├─────────────────────────────────────────────────────────────┤
│ Semana 1-2: Backend (API + Auth + DB)                      │
│ Semana 3-4: Core Features (Busca + Dashboard)              │
│ Semana 5-6: Frontend + Polish + Deploy                     │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              FASE 2: Enhancements (4 semanas)               │
├─────────────────────────────────────────────────────────────┤
│ Semana 7-8: Filtros + Gráficos Avançados                   │
│ Semana 9-10: Gerenciamento de Lista + Sync                 │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            FASE 3: Advanced Features (5 semanas)            │
├─────────────────────────────────────────────────────────────┤
│ Semana 11-13: Notificações + Automação                     │
│ Semana 14-15: CI/CD + Otimizações + Docs                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas

- Estimativas em pontos de história (1 ponto ≈ 0.5 dia de trabalho)
- Prioridades podem mudar baseadas em feedback
- User stories serão refinadas durante o desenvolvimento
- Aceitar feedback dos usuários após MVP

