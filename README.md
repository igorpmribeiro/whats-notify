# WhatsApp Notify - Evolution API and ChatPro integration

Sistema simples de notificações via whatsapp através do recebimento de webhooks, possibilidade de integrsções com Evolution API e ChatPro API.

## 🚀 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Configure o arquivo `.env` com suas credenciais da Evolution API:

```env
# Server Configuration
PORT=3000

# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key-here
EVOLUTION_INSTANCE_NAME=your-instance-name

# ChatPro Configuration (Alternative WhatsApp Provider)
CHATPRO_INSTANCEID=your-chatpro-instance-id
CHATPRO_TOKEN=your-chatpro-token
```

### 2. Instalação

```bash
npm install
```

### 3. Execução

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

## 🚀 Deploy na Vercel

### 1. Preparação do Projeto

O projeto já está configurado para deploy na Vercel com:
- `vercel.json` - Configuração de deployment
- Scripts de build e start no `package.json`

### 2. Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Deploy via GitHub

1. Faça push do código para um repositório GitHub
2. Conecte o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no dashboard da Vercel
4. Deploy automático será realizado

### 4. Variáveis de Ambiente na Vercel

Configure as seguintes variáveis no dashboard da Vercel:

```
EVOLUTION_API_URL=your-evolution-api-url
EVOLUTION_API_KEY=your-api-key
EVOLUTION_INSTANCE_NAME=your-instance-name
CHATPRO_INSTANCEID=your-chatpro-instance-id
CHATPRO_TOKEN=your-chatpro-token
```

**Nota:** A variável `PORT` não é necessária na Vercel, pois ela é gerenciada automaticamente.

## 📡 Endpoints

### Webhook para Atualizações de Pedidos
```
POST /webhook/order-update
```

**Payload:**
```json
{
  "orderId": 1,
  "datePurchase": "2025-05-24 00:11:15",
  "total": 1795.1,
  "statusId": 1,
  "status": {
    "type": "pending",
    "color": "#ffffff",
    "label": "Pendente"
  },
  "channel": "website",
  "customer": {
    "id": 1,
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "phone": [
      {
        "ddd": "99",
        "number": "99999999",
        "type": "principal"
      }
    ]
  },
  "payment": {
    "gateway": "paghiper",
    "brand": "pix",
    "amount": 1795.1,
    "installments": 1,
    "type": "default",
    "currency": "BRL"
  },
  "type": "order-changed",
  "domain": "www.dominio.com.br"
}
```

**Status disponíveis:**
- `Pendente` - Pedido pendente
- `Confirmado` - Pedido confirmado
- `Em preparo` - Em preparo
- `Pronto` - Pronto para retirada
- `Entregue` - Entregue
- `Cancelado` - Cancelado

### Teste de Mensagem
```
POST /test-message
```

**Payload:**
```json
{
  "phoneNumber": "5511999999999",
  "message": "Mensagem de teste"
}
```

### Health Check
```
GET /webhook/health
```

## 🔧 Como Usar

### 1. Configurar Evolution API
1. Execute sua instância da Evolution API
2. Crie uma instância WhatsApp
3. Configure as variáveis de ambiente com suas credenciais

### 2. Conectar WhatsApp
1. Acesse o endpoint da Evolution API para gerar QR Code
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde a conexão ser estabelecida

### 3. Enviar Notificações
Use o webhook `/webhook/order-update` para enviar notificações automáticas quando o status de um pedido mudar.

## 📋 Exemplo de Uso

### Testando o Sistema
```bash
# Enviar mensagem de teste
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "message": "Olá! Sistema funcionando!"
  }'

# Simular atualização de pedido
curl -X POST http://localhost:3000/webhook/order-update \
  -H "Content-Type: application/json" \
  -d '{
  "orderId": 1,
  "datePurchase": "2025-05-24 00:11:15",
  "total": 1795.1,
  "statusId": 1,
  "status": {
    "type": "pending",
    "color": "#ffffff",
    "label": "Pendente"
  },
  "channel": "website",
  "customer": {
    "id": 1,
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "phone": [
      {
        "ddd": "99",
        "number": "99999999",
        "type": "principal"
      }
    ]
  },
  "payment": {
    "gateway": "paghiper",
    "brand": "pix",
    "amount": 1795.1,
    "installments": 1,
    "type": "default",
    "currency": "BRL"
  },
  "type": "order-changed",
  "domain": "www.dominio.com.br"
}'
```

## 🏗️ Arquitetura

O projeto está organizado em camadas:

- **Clients**: Comunicação com APIs externas (Evolution API)
- **Providers**: Abstração para provedores de mensagens
- **Services**: Lógica de negócio
- **Controllers**: Manipulação de requisições HTTP
- **Routers**: Definição de rotas

## 📱 Evolution API

Este projeto foi desenvolvido para funcionar com a [Evolution API](https://github.com/EvolutionAPI/evolution-api), uma API robusta para integração com WhatsApp.

### Recursos Suportados:
- ✅ Envio de mensagens de texto
- ✅ Verificação de status da instância
- ✅ Geração de QR Code
- 🚧 Envio de mídia (implementado, mas não usado no webhook)

## 🔐 Segurança

- Use HTTPS em produção
- Configure sua API Key corretamente
- Valide sempre os dados recebidos nos webhooks
- Monitore os logs para detectar problemas

## 🐛 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão com Evolution API**
   - Verifique se a URL está correta
   - Confirme se a API Key é válida
   - Certifique-se de que a instância existe

2. **Mensagens não enviadas**
   - Verifique se o WhatsApp está conectado
   - Confirme o formato do número de telefone
   - Veja os logs para detalhes do erro

3. **Webhook não funcionando**
   - Verifique o formato do JSON enviado
   - Confirme se todos os campos obrigatórios estão presentes
