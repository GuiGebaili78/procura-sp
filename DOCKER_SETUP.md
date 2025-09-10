# 🐳 Configuração Docker - Procura SP

## ⚠️ **IMPORTANTE: TUDO RODA DENTRO DO DOCKER**

### **Configuração Atual:**
- **Aplicação:** `procura-sp-app` (Next.js) - Porta 3000
- **Banco:** `procura-sp-db` (PostgreSQL) - Porta 5434
- **Ambiente:** Docker Compose já configurado e funcionando

### **Comandos Corretos:**
```bash
# Verificar status dos containers
docker-compose ps

# Ver logs da aplicação
docker-compose logs -f procura-sp-app

# Ver logs do banco
docker-compose logs -f procura-sp-db

# Executar migrações (via API)
curl http://localhost:3000/api/migrate

# Verificar status do sistema
curl http://localhost:3000/api/status
```

### **❌ NUNCA FAZER:**
- `npm run dev` localmente
- `npm run build` localmente
- Conectar diretamente ao banco local
- Parar processos Node.js locais

### **✅ SEMPRE FAZER:**
- Usar o ambiente Docker
- Acessar via http://localhost:3000
- Executar migrações via API
- Verificar logs via docker-compose

### **Estrutura do Projeto:**
- **Frontend/Backend:** http://localhost:3000
- **Banco de Dados:** localhost:5434
- **Arquivo de Config:** `.env.development` (já existe)

### **Resolução de Problemas:**
1. Verificar se Docker está rodando: `docker-compose ps`
2. Ver logs: `docker-compose logs -f procura-sp-app`
3. Reiniciar containers: `docker-compose restart`
4. Executar migrações: `curl http://localhost:3000/api/migrate`

---
**Data:** 2024-12-19  
**Status:** ✅ FUNCIONANDO - Docker Compose ativo
