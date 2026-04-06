# 🚀 BetAnalytics — Guia de Deploy no Vercel

## O que você vai precisar
- Conta gratuita no GitHub (github.com)
- Conta gratuita no Vercel (vercel.com)
- Sua chave da API Anthropic (para a IA funcionar)

---

## PASSO 1 — Criar conta no GitHub

1. Acesse **github.com** e clique em "Sign up"
2. Crie uma conta com seu email
3. Confirme o email

---

## PASSO 2 — Fazer upload do projeto

1. Depois de logar no GitHub, clique em **"New repository"** (botão verde)
2. Nome: `betanalytics`
3. Deixe como **Private** (privado)
4. Clique em **"Create repository"**
5. Na próxima tela, clique em **"uploading an existing file"**
6. Arraste TODA a pasta `vercel-deploy` para a área de upload
7. Clique em **"Commit changes"**

---

## PASSO 3 — Conectar no Vercel

1. Acesse **vercel.com** e clique em "Sign up"
2. Escolha **"Continue with GitHub"** — conecta automaticamente
3. No painel, clique em **"Add New Project"**
4. Selecione o repositório `betanalytics`
5. Clique em **"Deploy"** — o Vercel detecta tudo automaticamente

---

## PASSO 4 — Configurar a chave da IA (IMPORTANTE)

A análise IA usa Claude (Anthropic). Você precisa adicionar sua chave:

1. No painel do Vercel, vá em **Settings → Environment Variables**
2. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave da API Anthropic (começa com `sk-ant-...`)
3. Clique em **Save**
4. Vá em **Deployments** e clique em **Redeploy**

> 💡 Para criar uma chave Anthropic: acesse console.anthropic.com, crie uma conta e gere uma API key. O custo é mínimo (~$0.002 por análise).

---

## PASSO 5 — Acessar o dashboard

Após o deploy (leva ~2 minutos), o Vercel te dá um link como:
```
https://betanalytics-XXXXX.vercel.app
```

Esse link funciona em **qualquer dispositivo**, **qualquer navegador**, **sem instalar nada**.

---

## Atualizando o dashboard no futuro

Quando tiver uma nova versão do `App.js`:
1. Vá no GitHub → repositório `betanalytics` → pasta `src`
2. Clique em `App.js` → ícone de lápis (editar)
3. Cole o novo conteúdo → "Commit changes"
4. O Vercel faz o deploy automaticamente em ~1 minuto ✅

---

## Diferenças da versão local vs Vercel

| Funcionalidade | Local (npm start) | Vercel (online) |
|---|---|---|
| Proxy local (proxy.js) | ✅ Necessário | ❌ Não precisa |
| Análise IA | Precisa chave OpenAI | ✅ Claude automático |
| Acesso | Só no seu PC | Qualquer dispositivo |
| Bat file (INICIAR_DASHBOARD) | ✅ Necessário | ❌ Não precisa |
| Velocidade | Depende do seu PC | ✅ Servidor rápido |

---

## Dúvidas frequentes

**O dashboard vai ficar lento no Vercel?**
Não — o Vercel usa servidores rápidos. A única demora é o rate limit da Football-Data.org (10 req/min no plano free), que é igual tanto local quanto online.

**Precisa deixar o computador ligado?**
Não! Na versão Vercel, o dashboard roda nos servidores deles 24/7. Você pode fechar o PC.

**Minhas chaves de API ficam seguras?**
Sim. As chaves ficam nas variáveis de ambiente do Vercel (criptografadas) e no localStorage do seu navegador. Ninguém mais tem acesso.

**Posso usar em outros dispositivos (celular, tablet)?**
Sim! O link do Vercel funciona em qualquer dispositivo com navegador.
