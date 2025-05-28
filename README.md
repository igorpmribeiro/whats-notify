# WhatsApp Notify - Evolution API and ChatPro integration

Sistema avançado de notificações via WhatsApp através do recebimento de webhooks, com integração completa com Evolution API, ChatPro API e API de produtos para mensagens personalizadas.

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

# Store API Configuration (Product Information)
CUSTOMER_STORE_ID=your-store-id
CUSTOMER_API_KEY=your-store-api-key
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
CUSTOMER_STORE_ID=your-store-id
CUSTOMER_API_KEY=your-store-api-key
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
- `RESERVADO` - Produto reservado para o cliente
- `AGUARDANDO PAGAMENTO` - Pedido criado, aguardando pagamento
- `PAGO` - Pagamento confirmado
- `PEDIDO RETIRADO` - Produto retirado pelo cliente
- `EM ASSISTÊNCIA` - Produto em assistência técnica
- `RESERVA CONFIRMADA` - Reserva do produto confirmada
- `Cancelado` - Pedido cancelado

### ChatPro Status Check
```
GET /chatpro/status
```

### ChatPro QR Code Generation
```
GET /chatpro/qrcode
```

### ChatPro QR Code Display (HTML Page)
```
GET /chatpro/qrcode/display
```

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

### API Root (Lista de Endpoints)
```
GET /
```

**Resposta:**
```json
{
  "message": "WhatsApp Notify API is running!",
  "version": "1.0.0",
  "endpoints": {
    "webhook": "/webhook/order-update",
    "health": "/webhook/health",
    "status": "/chatpro/status",
    "qrcode": "/chatpro/qrcode",
    "qrcodeDisplay": "/chatpro/qrcode/display",
    "test": "/test-message"
  }
}
```

## 🔧 Como Usar

### 1. Configurar APIs

#### Evolution API (Opcional)
1. Execute sua instância da Evolution API
2. Crie uma instância WhatsApp
3. Configure as variáveis de ambiente com suas credenciais

#### ChatPro API (Recomendado)
1. Crie uma conta no [ChatPro](https://chatpro.com.br)
2. Obtenha seu Instance ID e Token
3. Configure as variáveis de ambiente

#### Store API (Para buscar produtos)
1. Obtenha as credenciais da API da sua loja
2. Configure `CUSTOMER_STORE_ID` e `CUSTOMER_API_KEY`

### 2. Conectar WhatsApp

#### Via ChatPro (Interface Web)
1. Acesse: `http://localhost:3000/chatpro/qrcode/display`
2. Siga as instruções na tela
3. Escaneie o QR Code com seu WhatsApp

#### Via Evolution API
1. Acesse o endpoint da Evolution API para gerar QR Code
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde a conexão ser estabelecida

### 3. Enviar Notificações
Use o webhook `/webhook/order-update` para enviar notificações automáticas quando o status de um pedido mudar.

## 📋 Exemplo de Uso

### Testando o Sistema
```bash
# Verificar status do ChatPro
curl -X GET http://localhost:3000/chatpro/status

# Gerar QR Code (JSON)
curl -X GET http://localhost:3000/chatpro/qrcode

# Enviar mensagem de teste
curl -X POST http://localhost:3000/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "message": "Olá! Sistema funcionando!"
  }'

# Simular atualização de pedido com status específico
curl -X POST http://localhost:3000/webhook/order-update \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "PED-001",
    "status": {
      "label": "RESERVADO"
    },
    "customer": {
      "name": "João Silva",
      "phone": [
        {
          "ddd": "11",
          "number": "999999999",
          "type": "principal"
        }
      ]
    }
  }'
```

### Exemplo de Mensagem Gerada

Para um pedido com status `RESERVADO`, o sistema gera uma mensagem como:

```
📋 Olá João Silva! Sua reserva foi feita com sucesso!

🔢 Pedido: #PED-001
📦 Produto(s): • Smartphone XYZ
• Capa Protetora

⏰ O produto ficará reservado até o próximo dia útil.
📞 Para cancelar a reserva, entre em contato pelo WhatsApp.

⚠️ ATENÇÃO: Produtos reservados e não retirados nos impedem de atender outros lojistas.
```

## 🏗️ Arquitetura

O projeto está organizado em camadas com arquitetura hexagonal:

- **Clients**: Comunicação com APIs externas
  - `evolution.client.js` - Cliente para Evolution API
  - `chatpro.client.js` - Cliente para ChatPro API
  - `storeapi.client.js` - Cliente para API de produtos da loja
- **Providers**: Abstração para provedores de mensagens WhatsApp
- **Services**: Lógica de negócio
  - `notification.service.js` - Serviço de notificações
  - `order.service.js` - Processamento de pedidos
  - `product.service.js` - Busca de informações de produtos
- **Controllers**: Manipulação de requisições HTTP
- **Routers**: Definição de rotas

### Funcionalidades Avançadas

#### 📦 Integração com API de Produtos
- Busca automática de nomes dos produtos por ID do pedido
- Cache inteligente de tokens de autenticação
- Formatação elegante de listas de produtos nas mensagens

#### 🎨 Mensagens Personalizadas
O sistema cria mensagens personalizadas baseadas no status do pedido:
- Emojis apropriados para cada status
- Informações relevantes (número do pedido, produtos, instruções)
- Mensagens específicas para assistência técnica com contato dedicado
- Avisos especiais para reservas

#### 🔄 Sistema de Fallback
- Suporte a múltiplos provedores (Evolution API e ChatPro)
- Configuração flexível para alternar entre provedores
- Tratamento robusto de erros

## 📱 Provedores de WhatsApp

### Evolution API
Este projeto foi desenvolvido para funcionar com a [Evolution API](https://github.com/EvolutionAPI/evolution-api), uma API robusta para integração com WhatsApp.

**Recursos Suportados:**
- ✅ Envio de mensagens de texto
- ✅ Verificação de status da instância
- ✅ Geração de QR Code
- 🚧 Envio de mídia (implementado, mas não usado no webhook)

### ChatPro API
Alternativa comercial à Evolution API com interface mais simples.

**Recursos Suportados:**
- ✅ Envio de mensagens de texto
- ✅ Verificação de status da conexão
- ✅ Geração de QR Code com interface web
- ✅ Display HTML do QR Code com instruções

## 🛍️ API de Produtos (Store API)

O sistema integra com uma API de loja para buscar informações dos produtos:

**Funcionalidades:**
- ✅ Autenticação automática com cache de token
- ✅ Busca de produtos por ID do pedido
- ✅ Renovação automática de tokens expirados
- ✅ Tratamento robusto de erros de autenticação

**Exemplo de resposta da API:**
```json
{
  "order": {
    "products": [
      {
        "id": 1,
        "name": "Produto Exemplo",
        "quantity": 2,
        "price": 899.99
      }
    ]
  }
}
```

## 🔐 Segurança

- Use HTTPS em produção
- Configure sua API Key corretamente
- Valide sempre os dados recebidos nos webhooks
- Monitore os logs para detectar problemas

## 🐛 Troubleshooting

### Problemas Comuns:

1. **Erro de conexão com APIs**
   - Verifique se as URLs estão corretas
   - Confirme se as API Keys são válidas
   - Certifique-se de que as instâncias existem

2. **Mensagens não enviadas**
   - Verifique se o WhatsApp está conectado (`/chatpro/status`)
   - Confirme o formato do número de telefone (+55DDNNNNNNNNN)
   - Veja os logs para detalhes do erro

3. **Webhook não funcionando**
   - Verifique o formato do JSON enviado
   - Confirme se todos os campos obrigatórios estão presentes
   - Teste com o endpoint `/webhook/health`

4. **Erro na busca de produtos**
   - Verifique as credenciais da Store API
   - Confirme se o `CUSTOMER_STORE_ID` está correto
   - Veja se o token não expirou (sistema renova automaticamente)

5. **QR Code não carrega**
   - Verifique se o ChatPro está configurado corretamente
   - Tente acessar `/chatpro/qrcode/display` diretamente
   - Confirme se o Instance ID e Token estão válidos

## 🎯 Próximas Funcionalidades

- [ ] Suporte a envio de mídia (imagens, documentos)
- [ ] Webhooks de status de entrega das mensagens
- [ ] Dashboard web para monitoramento
- [ ] Integração com mais provedores de WhatsApp
- [ ] Sistema de filas para mensagens em massa
- [ ] Relatórios de mensagens enviadas

## 📁 Estrutura do Projeto

```
whats-notify/
├── api/
│   ├── index.js                    # Ponto de entrada da aplicação
│   └── app/
│       ├── setup.js                # Configuração e inicialização dos serviços
│       ├── webhook.controller.js   # Controller para webhooks
│       ├── webhook.router.js       # Rotas de webhook
│       ├── chatpro.router.js       # Rotas específicas do ChatPro
│       ├── clients/                # Clientes para APIs externas
│       │   ├── evolution.client.js # Cliente Evolution API
│       │   ├── chatpro.client.js   # Cliente ChatPro API
│       │   └── storeapi.client.js  # Cliente Store API
│       ├── config/
│       │   └── index.js            # Configurações da aplicação
│       ├── providers/
│       │   └── whatsapp.provider.js # Abstração dos provedores WhatsApp
│       └── services/               # Lógica de negócio
│           ├── notification.service.js # Serviço de notificações
│           ├── order.service.js    # Processamento de pedidos
│           └── product.service.js  # Busca de produtos
├── examples/
│   └── test-requests.js            # Exemplos de uso da API
├── .env.example                    # Exemplo de variáveis de ambiente
├── package.json                    # Dependências e scripts
├── vercel.json                     # Configuração para deploy na Vercel
├── biome.json                      # Configuração do linter/formatter
└── README.md                       # Documentação
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `package.json` para mais detalhes.
