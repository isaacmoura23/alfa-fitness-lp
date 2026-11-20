# Deploy da LP v5 (Alfa Fitness)

Nada vai ao ar sem o OK do CEO. Publique SOMENTE a pasta `dist/` (na Vercel: Root Directory = `dist`).

## 1. Gerar o dist
```bash
bash design/v5/build-dist.sh
```
O script copia só o necessário (index.html, styles.css, nojs.css, main.js, assets referenciados, vercel.json, robots.txt, sitemap.xml, .vercelignore), confere com grep que todo asset citado existe em `dist/` e que não há arquivo sem referência, e falha se algo estiver errado. As fontes dos arquivos de deploy ficam em `design/v5/deploy/`.

## 2. Trocar o domínio (obrigatório antes do deploy)
O domínio provisório é `https://SEU-DOMINIO.vercel.app` e aparece em 7 lugares de `index.html` (canonical, og:url, og:image, twitter:image e url/image/logo do JSON-LD) e também em `deploy/robots.txt` e `deploy/sitemap.xml`. Com o domínio final definido (sem barra no fim), rode da raiz do projeto:
```bash
NOVO="https://DOMINIO-FINAL-AQUI"   # troque pelo domínio real definido pelo CEO
sed -i '' "s#https://SEU-DOMINIO.vercel.app#${NOVO}#g" design/v5/index.html design/v5/deploy/robots.txt design/v5/deploy/sitemap.xml
grep -rn "SEU-DOMINIO" design/v5/index.html design/v5/deploy/ || echo "ok: placeholder trocado"
bash design/v5/build-dist.sh
```
(`sed -i ''` é a sintaxe do macOS; no Linux use `sed -i`.) O script avisa se o placeholder ainda estiver no dist.

## 3. Cabeçalhos e CSP (`deploy/vercel.json`)
Derivado de `qa/vercel.json.proposta`, com estes ajustes:
- Saiu o `'unsafe-hashes'` + hash de `style-src`: o sprite SVG agora usa a classe `.sprite`, e a página não tem nenhum estilo inline.
- `frame-src` em `https://www.google.com https://maps.google.com`: o iframe do mapa abre em `www.google.com/maps/embed`.
- Saiu o `manifest-src`, porque não há manifest (cai no `default-src 'none'`).

Validado localmente servindo `dist/` com estes cabeçalhos (servidor de teste que lê o vercel.json; só `upgrade-insecure-requests` e HSTS ficaram de fora, por ser http local): zero violações no console, mapa carregando com sandbox, menu, selo, fontes e ícones funcionando.

Efeito colateral conhecido: com `connect-src 'none'`, o Lighthouse não consegue baixar o robots.txt e marca SEO 92 (sem o CSP dá 100). Os buscadores leem o robots.txt direto, então não há impacto real.

Depois do deploy, confira no preview da Vercel: console sem violações, "Copiar endereço" funcionando (só aparece em HTTPS), prévia do link no WhatsApp com imagem.

## 4. Decisão pendente do CEO: rótulo "equivale a" nos preços
A alternativa já está no HTML e no CSS, mas **desativada**: os parágrafos `<p class="plan__pre">equivale a</p>` dos planos Anual e Semestral ficam ocultos. Para ativar, acrescente o atributo `data-preco="equivale"` na lista de planos:
```html
<ol class="plans" role="list" data-preco="equivale">
```
Isso mostra "equivale a" logo acima do valor mensal. Para desativar, remova o atributo. Prévia: `screenshots/qa-alternativa-equivale-a-1440.png`.

## 5. Outras pendências antes de publicar (CEO)
- Nomes dos autores nas Avaliações: falta autorização registrada (relatório de segurança, achado 1). A LP não foi alterada nesse ponto.
- Fotos: confirmar com a autora o "ok, pode usar no site" (relatório de segurança, achado 3).
- Ficha do Google: o endereço aparece como "João Liberato", não "Rua José Correia, 217". Corrigir no Google Business.
