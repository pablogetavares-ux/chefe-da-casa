# Fotos das ofertas (assets locais)

JPEGs usados por `npm run offers:sync-images` para o bucket `offer-images`.

**Por que local?** IDs de URL do Pexels não garantem a foto correta no CDN (ex.: iogurte mostrava tecido, ovos mostravam praia). Aqui cada arquivo foi conferido visualmente antes do upload.

| Arquivo               | Produto                                               |
| --------------------- | ----------------------------------------------------- |
| `tomate-vermelho.jpg` | Tomate                                                |
| `ovos-cartela.jpg`    | Cartela de ovos (bandeja completa)                    |
| `iogurte-natural.jpg` | Iogurte                                               |
| `azeite.jpg`          | Azeite                                                |
| `frango.jpg`          | Frango                                                |
| `arroz-pacote.jpg`    | Arroz (sacos/pacotes — não usar arroz frito no prato) |
| `arroz.jpg`           | Cópia legada; preferir `arroz-pacote.jpg` no sync     |
| `salmao.jpg`          | Salmão                                                |
| `folhas.jpg`          | Folhas / salada                                       |

Para trocar uma foto: substitua o `.jpg`, rode `npm run offers:sync-images` e recarregue Ofertas com Ctrl+Shift+R.
