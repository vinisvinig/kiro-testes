# Mudanças do protótipo funcional para levar ao Figma

**Protótipo:** https://vinisvinig.github.io/kiro-testes/ (senha: samambaia)
**Arquivo Figma:** Site Nova Experiência — Uhuu.com (2026), `UhHkJWka5QoNiaPGKQfOCY`

## Como chegar em cada estado

- **Eventos:** `#/evento/o-estranho-mundo-de-jack`, `#/evento/guns-n-roses`, `#/evento/kim-walker-smith`. Para abrir direto na compra, acrescente `?aba=ingressos`.
- **Cortesia no Guns N'Roses:** escolha 5 ingressos em qualquer setor.
- **Cortesia na Kim Walker-Smith:** escolha 5 inteiras, ou 2 inteiras + 1 meia-entrada.
- **Pacotes:** no evento do Jack, escolha "Pacote de ingressos".
- **Cartão:** qualquer número de 16 dígitos é aceito. O cartão 7777 7777 7777 7777 (validade 07/27, CVV 777) simula pagamento recusado.
- **Cupons:** DESCONTO10 (10%, aplica em 2 ingressos) e UHUU20 (R$ 20, aplica em 1 ingresso).

## Home

1. **Banner do celular com imagens próprias** (358×477):
   - Kim Walker-Smith: foto dela de cabelo vermelho (`public/figma/hero-1-mobile.png`).
   - O estranho mundo de Jack: recorte com Jack e Sally (`public/figma/hero-2-mobile.png`).
   - O banner do desktop não mudou.
2. **Banner da Kim:** período "14/11/26 a 27/11/26" e link para a página nova do evento.
3. **Selos dos cards:** o ícone tem a mesma cor da borda.
   - Mais vendidos e Popular agora: #F59E0B.
   - Acabando: #FF8000.
   - Últimos ingressos: #EF4444.
   - Corre, Sessão extra e É hoje já estavam certos.

## Busca

- **Busca por termo parecido:** aceita erros de digitação. Por exemplo, "gans n rozes" encontra Guns N'Roses e "kin waker" encontra Kim Walker-Smith. Não muda nenhuma tela, só os resultados.

## Página do evento

1. **Novo evento Kim Walker-Smith:** mesma estrutura dos outros eventos, com textos próprios.
   - Local: Auditório Araújo Vianna, Porto Alegre.
   - No celular, o topo usa a mesma foto do banner da home.
   - No desktop, a arte já escreve o nome do evento, então o título por cima foi tirado e só a data aparece.
2. **Componente "Reserva garantida por"** (Design System, Figma 9616:41464 e 9401:22481):
   - fundo #FDE8F1, borda #EE3680 e cantos totalmente arredondados;
   - espaçamento interno de 12px em cima e embaixo e 16px nas laterais;
   - textos em 14/20, com o tempo em negrito;
   - ícone de timer na versão Rounded;
   - o tempo ocupa uma largura fixa, para não "pular" a cada segundo.
3. **Tempo ao lado da aba "Comprar ingressos":**
   - Depois que o usuário entra na compra, o selo escuro com o tempo aparece ao lado da aba também em "Informações do evento", no celular e no desktop.
   - Na aba de compra, no desktop, o tempo continua aparecendo só no resumo.
   - O selo tem largura fixa e usa o ícone de timer Rounded.
4. **Celular:** o botão "Ver mapa completo" virou **"Visualizar mapa"** e abre o pop-up do mapa.
5. **Área VIP:** aparece um card só, marcado como "Esgotado". A versão à venda foi removida, então a Área VIP também saiu da tabela "Preços e tipos de ingresso".

## Seleção de ingressos

1. **Guns N'Roses:** o assento e a tarifa são escolhidos juntos, no balão que abre sobre o mapa, como no evento do Jack.
2. **Textos da cortesia** (caixa roxa com a barra de progresso):
   - Guns:
     - "Selecione mais 5 ingressos e um deles sai de graça."
     - "Selecione mais 4 ingressos e um deles sai de graça."
     - Ao completar: "Cortesia aplicada! 1 dos seus ingressos saiu de graça. Com mais 5, outro sai de graça." (caixa verde)
   - Kim, com duas caixas e duas barras:
     - "Selecione mais 5 inteiras e uma delas sai de graça." (barra de 5 partes)
     - "Selecione mais 2 inteiras e 1 meia-entrada, e a meia sai de graça." (barra de 3 partes: inteira, inteira, meia)
     - Ao completar cada uma: "Cortesia aplicada! 1 inteira saiu de graça." ou "Cortesia aplicada! 1 meia-entrada saiu de graça."
   - Para o usuário, o nome é sempre "Cortesia". "Desconto progressivo" é só o nome interno.
3. **"Combo" virou "Pacote" em todos os textos:**
   - Lista: etiqueta "Pacote" e título "Pacotes disponíveis".
   - Nomes: Pacote Conexões, Pacote Amizade Especial, Pacote Amizade Premium e Pacote Amigos.
   - Selo "Pacote" no resumo do pedido.
   - Frases de ajuda: "deste pacote" e "1 pacote no pedido".
4. **Card do pacote no celular** (Figma 11061:132029):
   - Ícone roxo ao lado do nome e da descrição.
   - Embaixo, sem recuo, o setor (18px, negrito) e o preço com "+taxa".
   - Por último, os botões − e + alinhados à direita.
5. **Cortesia no resumo durante a seleção** (Figma 11061:138879):
   - Card com fundo #F0FDF4 e borda #22C55E.
   - Data em negrito, "**Cortesia** · setor" e "1x ingresso grátis".
   - À direita, "Grátis" com o valor original riscado e um botão vermelho de lixeira (38×38, fundo #FEF2F2).

## Finalização de compra

### Serviços adicionais (seguro e Clube Planeta)

1. **Checkbox no lugar do interruptor.** Os dois começam desmarcados.
   - Desmarcado: quadrado branco com borda na cor do serviço.
   - Marcado: o card fica todo na cor do serviço e o quadrado branco mostra um check Rounded na cor do serviço (seguro #2563EB, clube #EE3680).
2. **"Ver mais" abre um painel branco** com texto escuro, igual com o serviço marcado ou desmarcado (referência Figma 10535:188904).
3. **Conteúdo do seguro:**
   - Chamada em negrito: "Se um imprevisto te impedir de ir, você pode receber de volta o valor do ingresso e da taxa de serviço."
   - "O QUE COBRE", com check azul: Doença grave, Internação hospitalar, Morte acidental, Fratura óssea e Desemprego involuntário.
   - "O QUE NÃO COBRE", com X vermelho: "Simples desistência ou mudança de planos".
   - Letras miúdas: "Seguro oferecido pela MetLife. O pedido de reembolso é feito diretamente com a MetLife, não com a Uhuu, e depende de análise e aprovação. Coberturas conforme a apólice; aplicam-se carências, limites e exclusões. Saiba mais"
4. **Conteúdo do Clube Planeta:** chamada, três benefícios com check rosa e, nas letras miúdas, o valor por ingresso com "Saiba mais".
5. **Termos do seguro:** "Ao ativar o seguro, eu declaro que li e tenho conhecimento e concordo com os Termos e Condições do seguro, e dos Termos de Privacidade de Dados e Demais Disposições do Seguro."

### Resumo

1. **Desktop:** coluna direita com um card mesclado "Resumo" (Figma 10635:226072). O card de espetáculo da esquerda foi removido. Ordem dentro do card:
   - tempo da reserva;
   - eyebrow "RESUMO", nome do evento e local;
   - ingressos;
   - linhas de valores;
   - total.

   O cupom continua num card próprio, logo abaixo.
2. **Eyebrow:** "ESPETÁCULO" virou **"RESUMO"**, no celular e no desktop.
3. **Linhas novas, sempre visíveis** (Decreto 7.962/2013):
   - "Juros do parcelamento": R$ 0,00 no Pix e à vista; no cartão parcelado, por exemplo, "Juros do parcelamento (3x) R$ 6,74".
   - "Taxa de processamento": R$ 0,00.
4. **Total:**
   - Com cartão: "Total no cartão R$ 231,57" e, embaixo, "3x de R$ 77,19 com juros".
   - Sem forma de pagamento escolhida: "Total à vista" e "Ou parcelado no cartão até 3x de…".
   - Com Pix: "Total à vista", sem a linha do parcelamento.
5. **Cortesia na finalização** (Figma 11061:132097):
   - Card com fundo #F0FDF4, borda #22C55E e raio 16.
   - Ícone de presente branco num quadrado verde #22C55E.
   - Data com o selo verde "Cortesia" e o título "1 ingresso grátis, Pista Premium".
   - À direita, "Grátis" com o valor original riscado.
   - Embaixo, "Um dos ingressos escolhidos sai de graça" e o link vermelho sublinhado "Remover cortesia".
6. **Cupom aplicado:** mostra só a linha "Aplica em 2 ingressos", que é o limite do cupom.

### Celular: nova ordem e fluxo

1. **Ordem da página:**
   - Voltar à seleção de ingressos;
   - "Reserva garantida por", sozinho, fora de qualquer card;
   - Serviços adicionais;
   - Escolha a modalidade de entrega;
   - Escolha como pagar;
   - Resumo.
2. **Cupom:** fica **dentro** do Resumo, numa caixa clara com borda (#FAFBFB, borda #D4D4D4, raio 24), entre os ingressos e as linhas de valores.
3. **"Escolha como pagar":** depois de escolher Pix ou preencher o cartão, aparece o botão **Confirmar** (largura total). No celular, os termos e o botão final não ficam mais nesta etapa.
4. **Depois do "Confirmar":**
   - A etapa minimiza como a de entrega: ícone verde, título "Pagamento", o resumo do que foi escolhido e "Editar".
   - Exemplos de resumo: "Cartão final 1111 · 3x de R$ 77,19 (com juros)" ou "Pix · R$ 224,83".
   - Não há rolagem automática.
5. **Fim do Resumo, só depois do Confirmar:**
   - Cartão: "Ao clicar em Finalizar compra eu declaro que li e tenho conhecimento e concordo com os Termos de Uso, Políticas de Privacidade e Política de Cancelamento." e o botão **Finalizar compra** (largura total).
   - Pix: o mesmo texto com "Gerar Pix" e o botão **Gerar Pix**.
6. **Barra fixa removida:** a barra do rodapé com "Total à vista + Comprar" não existe mais na finalização.
7. **Desktop:** os termos e os botões "Finalizar compra" e "Gerar Pix" continuam dentro de "Escolha como pagar".

### Outros detalhes da finalização

1. **Pagamento bloqueado:** ao tocar em "Escolha como pagar" antes de escolher a entrega:
   - a página leva até "Escolha a modalidade de entrega";
   - esse bloco ganha contorno de alerta #F59E0B (1px de borda + 1px de anel);
   - o texto "Disponível após escolher a entrega" fica em #F59E0B e semibold.
2. **Cabeçalho das etapas:** o ícone fica centralizado verticalmente com o título, também quando o título quebra em duas linhas.
3. **Tela do Pix:** o resumo não mostra mais "Ou parcelado no cartão até 3x".

## Sem mudança visual (não precisa ir para o Figma)

- As telas do Pix, de pagamento recusado e de pedido concluído abrem sempre no topo da página.
- A reserva continua contando ao trocar de aba e o pedido fica guardado.
- O seguro voltou a começar desmarcado.
- A senha de acesso voltou a ser pedida.
