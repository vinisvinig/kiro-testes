# Kiro — protótipo para testes de usabilidade

Protótipo em React e Vite preparado para hospedagem gratuita no GitHub Pages e acesso por celular, tablet ou computador em redes diferentes.

## Publicação

1. Crie o repositório público `kiro-testes` na sua conta do GitHub e envie os arquivos desta pasta, incluindo `.github/workflows/deploy.yml`.
2. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
3. Na aba **Actions**, execute **Publicar protótipo no GitHub Pages**, se necessário.
4. Após a publicação, compartilhe `https://vinisvinig.github.io/kiro-testes/`.

Esse endereço é o previsto; só estará disponível depois que a publicação terminar. Cada atualização enviada para `main` publica uma nova versão automaticamente.

As rotas publicadas usam `/#/busca`, `/#/local/...` e `/#/evento/...`, permitindo abrir links diretamente e atualizar a página no GitHub Pages.

## Testes com participantes

- Login, pedidos e pagamentos são simulados. Use dados fictícios, inclusive e-mail, senha, endereço e cartão. Não há cobrança nem emissão real de ingressos.
- Cada navegador tem seu próprio estado; contas e pedidos não são compartilhados entre dispositivos. Use uma janela anônima para começar um teste sem o login anterior.
- O site ficará acessível pelo link público. O GitHub Free exige repositório público para o GitHub Pages.
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
