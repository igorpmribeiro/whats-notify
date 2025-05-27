# 🚀 Deploy realizado com sucesso na Vercel!

## 📍 URLs do seu projeto:

- **Produção:** https://whats-notify-9oai4lsur-igor-ribeiros-projects-fb09bd2e.vercel.app
- **Dashboard:** https://vercel.com/igor-ribeiros-projects-fb09bd2e/whats-notify

## ⚙️ Próximos passos - Configurar variáveis de ambiente:

1. Acesse o dashboard da Vercel: https://vercel.com/igor-ribeiros-projects-fb09bd2e/whats-notify
2. Vá em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

### Variáveis obrigatórias:

```
EVOLUTION_API_URL=sua-url-da-evolution-api
EVOLUTION_API_KEY=sua-chave-da-evolution-api
EVOLUTION_INSTANCE_NAME=nome-da-sua-instancia

CHATPRO_INSTANCEID=seu-instance-id-chatpro
CHATPRO_TOKEN=seu-token-chatpro
```

### Exemplo de valores:
```
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=B6D882DC-5A4C-4E73-8F25-1234567890AB
EVOLUTION_INSTANCE_NAME=minha-instancia-whatsapp

CHATPRO_INSTANCEID=chatpro-48h9frer6t
CHATPRO_TOKEN=5d6cdcbb9aa4fcd7157108e787982388
```

## 📋 Endpoints disponíveis:

- **Root:** https://whats-notify-9oai4lsur-igor-ribeiros-projects-fb09bd2e.vercel.app/
- **Webhook:** https://whats-notify-9oai4lsur-igor-ribeiros-projects-fb09bd2e.vercel.app/webhook/order-update
- **Health Check:** https://whats-notify-9oai4lsur-igor-ribeiros-projects-fb09bd2e.vercel.app/webhook/health
- **Test Message:** https://whats-notify-9oai4lsur-igor-ribeiros-projects-fb09bd2e.vercel.app/test-message

## 🔄 Para fazer redeploy:

```bash
vercel --prod
```

## 📝 Notas importantes:

1. **Não esqueça de configurar as variáveis de ambiente** no dashboard da Vercel
2. Após configurar as variáveis, faça um novo deploy ou aguarde o próximo deploy automático
3. Use a URL de produção para configurar webhooks em serviços externos
4. O arquivo `.env` local não será usado em produção - apenas as variáveis configuradas na Vercel
