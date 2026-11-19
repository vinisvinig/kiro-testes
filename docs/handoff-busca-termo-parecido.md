# Busca por termo parecido (tolerância a erro de digitação)

**Para:** PO / Dev
**Protótipo:** https://vinisvinig.github.io/kiro-testes/ (senha de acesso com o time de produto)
**Código de referência:** `src/search/search.js`, commit `39627bf`

## Problema

No teste com usuários, quem digitava o nome do evento errado ("gans n rozes", "estanho mundo") não encontrava nada e desistia.

## Comportamento esperado

1. A busca aceita erros de digitação: letras trocadas, faltando ou sobrando.
2. Espaços, acentos e pontuação são ignorados. "gunsnroses", "guns n roses" e "Guns N'Roses" são equivalentes.
3. A partir de **~40% de semelhança**, o resultado já aparece.
4. O resultado **mais parecido vem sempre primeiro**.
5. Resultado exato (o texto digitado aparece no nome) fica sempre acima de resultado parecido.
6. Para não encher a lista de resultados fracos:
   - **Sem resultado exato:** mostra só os parecidos próximos do melhor (até 15 pontos percentuais abaixo dele).
   - **Com resultado exato:** um parecido só entra se tiver pelo menos 75% de semelhança.
7. Vale para a página de resultados e para as sugestões do campo de busca (eventos, cidades e locais).
   - Nas sugestões, o corte dos parecidos é feito com os três grupos juntos, para não aparecer cidade ou local sem relação.
8. Buscas com menos de 3 letras não usam termo parecido, só o exato.

## Regra técnica (resumo)

- Normalizar os dois textos: minúsculas, sem acento e só letras e números.
- Semelhança = `1 − distância de Levenshtein / maior tamanho`, calculada contra o **trecho** do nome com tamanho próximo ao da busca (tamanho da busca ±2). Assim "kin waker" casa com "Kim Walker-Smith — Worship Nights".
- Pontuação para ordenar:

| Tipo | Pontuação |
|---|---|
| Exato no início do nome | 3 |
| Exato no início de uma palavra | 2 |
| Exato no meio | 1 |
| Parecido | semelhança × 0,9 (sempre abaixo de 1) |

- Na página de resultados, o exato no título pesa 3×, no local 2×, e na cidade ou categoria 1×.

Na versão real, isso pode ficar no motor de busca. Elasticsearch/OpenSearch (`fuzziness: AUTO`), Algolia (typo tolerance) e Postgres (`pg_trgm`, `similarity()`) já fazem algo equivalente. Vale ajustar os limites para chegar perto dos números acima.

## Casos de teste (critérios de aceite)

| Digitado | Resultado esperado |
|---|---|
| `guns n roses` | Guns N'Roses (1º) |
| `gans n rozes` | Guns N'Roses (1º) |
| `gunsnroses` | Guns N'Roses (1º) |
| `estanho mundo` | O estranho mundo de Jack de Tim Burton (1º) |
| `estranho mundo de jak` | O estranho mundo de Jack de Tim Burton (1º) |
| `kin waker` | Kim Walker-Smith (1º) |
| `kim walker` | Só Kim Walker-Smith (sem parecidos fracos) |
| `rock` | Rock in Rio Experience (1º) |
| `xyzwq` | Nenhum resultado |
| Sugestões com `gans n rozes` | Só Guns N'Roses (sem cidades ou locais) |

## Pontos em aberto

- **Limite de 40%:** é permissivo. Palavras sem relação (ex.: "paçoca") ainda trazem alguns eventos. Se incomodar, subir para 50–60%.
- **Aviso "Mostrando resultados para…":** sugerido quando o resultado vem de termo parecido, para o usuário entender o que aconteceu. Ainda não foi feito.
