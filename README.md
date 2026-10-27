# Projeto-Experimenta-GRU-2026
Projeto feito pra a Prefeitura de Guarulhos no Hackathon Experimenta

## Executar no ambiente local

Na pasta do projeto, execute no PowerShell:

```powershell
./iniciar-local.ps1
```

Abra **http://127.0.0.1:8765/index.html**. Para encerrar o servidor, pressione Ctrl+C no terminal. O servidor escuta somente neste computador e não publica o site na internet. Se precisar mudar a porta, use `./iniciar-local.ps1 -Port 8766` e abra o endereço exibido no terminal.

Use HTTP local (ou o Live Server do editor) em vez de abrir `index.html` por duplo clique. Arquivos `file://` não enviam o cabeçalho HTTP Referer esperado pelo servidor cartográfico do OSM.

## Mapa: OpenStreetMap e Leaflet

- Leaflet 1.9.4 está incluído em `assets/vendor/leaflet/`, com licença preservada.
- `map.js` utiliza exclusivamente `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, com atribuição visível ao OpenStreetMap. Não há chave de API, conta ou cobrança configurada.
- O navegador mantém o cache normal; não há download em massa ou pré-carregamento offline.
- Falhas de rede têm mensagem, nova tentativa e uma vista geral incorporada do OSM. Essa vista não inclui os marcadores locais das unidades.
- Ao recuperar a conexão, o mapa principal pode voltar a carregar sem recarregar toda a página.

O servidor público de mapas do OSM tem capacidade limitada e não oferece garantia de disponibilidade. Siga a [política oficial de uso](https://operations.osmfoundation.org/policies/tiles/) ao publicar ou aumentar o tráfego. A implementação segue a [documentação do Leaflet](https://leafletjs.com/examples/quick-start/).

## Verificação do mapa

Com o servidor local em execução e Chrome instalado:

```powershell
./browser-check.ps1 -BaseUrl 'http://127.0.0.1:8765/' -ExpressionFile test-osm.js -NetworkReport test-osm-network.json
./browser-check.ps1 -BaseUrl 'http://127.0.0.1:8765/' -ExpressionFile test-osm.js -BlockMaps -RecoverMaps
```

O primeiro cenário verifica carregamento real, zoom, marcadores e mudanças de modo. O segundo bloqueia o OSM e depois libera a conexão, verificando a recuperação. São usados um navegador sem janela visível e um perfil de teste separado. As evidências e limitações estão em `RELATORIO-ACESSIBILIDADE.md`.
