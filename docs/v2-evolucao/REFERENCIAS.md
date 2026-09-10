# Referências e origem dos dados

Consulta: 10/09/2026. Base de trabalho: commit `7076033`, branch `codex/rs-modas-v2-evolucao`. Nenhum AGENTS.md encontrado no projeto. A árvore estava limpa antes das alterações.

## Padrões aplicados

- [Zara — vestidos](https://www.zara.com/us/en/woman-dresses-l1066.html): entrada por categoria e foco no produto. Aplicação: fotografia livre de selos e nomes legíveis fora das imagens.
- [Mango — vestidos](https://shop.mango.com/us/en/c/women/dresses-and-jumpsuits/e6bb8705): atalhos por ocasião, preço, cores e tamanhos na listagem. Aplicação: preservar atalhos úteis, preço visível e seleção explícita na peça.
- [Uniqlo](https://www.uniqlo.com/us/en/): busca e navegação por categorias. Aplicação: menu acessível também no tablet e categorias com rótulos consistentes.
- [Baymard — filtros aplicados](https://baymard.com/blog/how-to-design-applied-filters): mostrar a seleção ativa. Aplicação: preservar chips e limpeza de filtros.
- [NN/g — campos obrigatórios](https://www.nngroup.com/articles/required-fields/): distinguir os campos opcionais. Aplicação: detalhes recolhidos, essenciais primeiro, validação próxima aos campos.
- [Shopify — estados do estoque](https://help.shopify.com/en/manual/products/inventory/fundamentals/inventory-states): separar físico, reservado e a receber. Aplicação: encomenda confirmada não cria saldo; recebimento cria físico e reserva; entrega baixa ambos uma vez.

Esses padrões orientam decisões de interface. Não constituem evidência de aumento de conversão ou economia de tempo da RS Modas.

## Amostra verificável

As referências ficam em `apps/web/src/lib/supplierReferences.js`, separadas dos produtos operacionais. Nenhum produto foi importado em massa ou sobrescrito. Quantidades da demonstração não representam estoque do fornecedor nem da RS Modas.

| Marca | Produto | Página específica | Referência / Código | Preço cartão | Pix | Parcelamento informado |
| --- | --- | --- | --- | --- | --- | --- |
| Maria Dondoca | Conjunto Ana | https://www.mariadondoca.com.br/produtos/conjunto-ana-ovw0j/ | Não informado pelo fornecedor (MD-ANA na loja) | R$ 359,80 | R$ 341,81 | 3x de R$ 119,93 sem juros |
| Maria Dondoca | Conjunto Liz | https://www.mariadondoca.com.br/produtos/conjunto-liz-13tma/ | Não informado pelo fornecedor (MD-LIZ na loja) | R$ 379,80 | R$ 360,81 | 3x de R$ 126,60 sem juros |
| Pit Bull Jeans | Calça Cintura Perfeita Modeladora e Sofisticada | https://www.pitbulljeans.com.br/calca-cintura-perfeita-modeladora-e-sofisticada-pit-bull-jeans-premium-92083-p37746 | 92083 | R$ 279,99 | R$ 251,99 | até 4x de R$ 70,00 sem juros |
| Pit Bull Jeans | Calça Skinny Preta Modeladora e Sofisticada | https://www.pitbulljeans.com.br/calca-skinny-preta-modeladora-e-sofisticada-pit-bull-jeans-90666-p29782 | 90666 | R$ 149,99 | R$ 134,99 | até 3x de R$ 50,00 sem juros |
| Rhero | Calça Flare Jeans | https://rhero.com.br/58019-calca-jeans-1225342965/p | 58019 | R$ 359,90 | — | Consulte com a loja |

Valores de referência do fornecedor, consultados em 10/09/2026 e sujeitos à confirmação pela RS Modas. As páginas distinguem o preço no cartão do desconto Pix; não foi tratado o Pix como preço geral.

Imagens oficiais utilizadas: URLs e arquivos oficiais diretos mantidos, preservando a autoria e integridade das peças (sem remoção de marcas-d'água nem geração por IA).

## Limitações externas e registros

- Pit Bull Jeans: as páginas ativas das referências 92083 e 90666 foram consultadas e confirmadas com sucesso via requisição com cabeçalho de navegador padrão em 10/09/2026.
- Rhero: a página específica da Calça Flare Jeans 58019 foi confirmada com sucesso em 10/09/2026. As categorias gerais da home continuam retornando seções vazias/404; portanto, preservou-se estritamente 1 produto real verificado para a marca, sem inventar peças inexistentes.
- Maria Dondoca: Conjuntos Ana e Liz foram verificados diretamente no catálogo oficial em 10/09/2026 com fotos, preços, descontos Pix e tabelas de medidas reais.
- Produtos antigos da base de demonstração foram preservados e identificados como demonstração/legado (`dataKind: "demo"` ou `"legacy"`). Não são apresentados como verificação comercial atual.
- Não há nova afirmação de composição, tecido ou grupo societário. A informação de revenda oficial é atribuída ao responsável pela RS Modas.

## Marca e fontes

A marca usa a imagem caligráfica original fornecida (150 × 150 px), sem substituição das iniciais. Não havia vetor no repositório; não foi criado um falso vetor nem uma aproximação tipográfica apresentada como exata. No restante da interface: Archivo, com Arial/sans-serif como fallback. Archivo é distribuída pelo Google Fonts; carregamento conferido no navegador. A pequena resolução da logo limita ampliações futuras.

O seletor de cor é preservado. A função `accessibleAccent` escurece tons que não alcançam contraste de 4,5:1 contra creme; categorias permanecem pretas em fundo claro, independentemente da cor selecionada.
