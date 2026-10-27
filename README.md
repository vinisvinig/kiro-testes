# Kiro — protótipo para testes de usabilidade

Protótipo em React e Vite preparado para hospedagem gratuita no GitHub Pages e acesso por celular, tablet ou computador em redes diferentes.

## Link para os participantes

[Abrir o protótipo](https://vinisvinig.github.io/kiro-testes/)

O GitHub Pages está configurado para publicar pelo GitHub Actions. Cada atualização enviada para `main` publica uma nova versão automaticamente. Aguarde a execução mais recente de **Publicar protótipo no GitHub Pages** ficar verde na [aba Actions](https://github.com/vinisvinig/kiro-testes/actions) antes de iniciar uma sessão de teste.

Para recriar a hospedagem em outro repositório, envie os arquivos, mantenha a branch `main` e selecione **Settings → Pages → Build and deployment → Source → GitHub Actions**. O workflow adapta o caminho de publicação ao nome do repositório.

As rotas publicadas usam `/#/busca`, `/#/local/...` e `/#/evento/...`, permitindo abrir links diretamente e atualizar a página no GitHub Pages.

## Testes com participantes

- Login, pedidos e pagamentos são simulados. Use dados fictícios, inclusive e-mail, senha, endereço e cartão. Não há cobrança nem emissão real de ingressos.
- Cada navegador tem seu próprio estado; contas e pedidos não são compartilhados entre dispositivos. Use uma janela anônima para começar um teste sem o login anterior.
- O site é acessível pelo link público. O GitHub Free exige repositório público para o GitHub Pages.
- Fontes do Google, mapas e consulta de CEP dependem de serviços externos e de internet. A localização pode solicitar permissão no navegador.
- Este projeto se destina a testes do protótipo, sem operação de vendas reais.

## Desenvolvimento local

Use Node.js 22 e execute:

```sh
npm ci
npm run dev
```

Para verificar a versão de publicação:

```sh
VITE_BASE_PATH=/kiro-testes/ VITE_ROUTER_MODE=hash npm run build
npm run preview
```

Esta cópia foi preparada a partir da pasta Kiro. Alterações feitas na pasta original precisam ser trazidas para esta cópia antes de enviar uma nova versão ao GitHub. Não envie `node_modules`, `dist`, `.env` ou credenciais.
