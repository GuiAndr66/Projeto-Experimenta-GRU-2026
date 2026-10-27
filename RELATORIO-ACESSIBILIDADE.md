# ConnectGRU — implementação local

## Atualização vigente — OSM + Leaflet, 27/10/2026

O mapa principal usa exclusivamente OpenStreetMap com Leaflet 1.9.4 local. Retirada a troca para CARTO. Foram mantidos os cinco marcadores, seus detalhes, zoom, redimensionamento e vista geral incorporada do OSM como alternativa em falhas de conexão. A troca de camada continua adiada para depois dos eventos internos do Leaflet, evitando o erro `_fadeAnimated` reproduzido na etapa anterior. Ajustado também o contraste da legenda no modo escuro.

### Execução e diagnóstico

Adicionado `iniciar-local.ps1`: servidor HTTP somente em loopback, padrão na porta 8765. A porta 8080 foi recusada pelo sistema durante os testes; 8765 iniciou normalmente. Abra `http://127.0.0.1:8765/index.html#mapa`. Ao encerrar o servidor, execute `./iniciar-local.ps1` para iniciá-lo novamente. Nenhum deploy foi realizado.

Abrir HTML diretamente com `file://` não envia um Referer HTTP. A política do servidor público do OSM exige esse cabeçalho para páginas web: https://operations.osmfoundation.org/policies/tiles/. Isso pode causar restrições de acesso; não se afirma que foi a única causa da falha observada pelo usuário. Em HTTP local, foram confirmados Referer válido e respostas 200 nas imagens cartográficas. A página agora informa como abrir a versão HTTP quando detecta `file://`.

`browser-check.ps1` passou a aceitar `-BaseUrl`, perfil separado, captura das respostas de rede e teste de reconexão. `test-osm-network.json` registra 22 respostas 200 sem cache de disco e uma resposta 200 do cache, durante o teste de carregamento, zoom e mudança de modo. As solicitações efetivas enviaram `Referer: http://127.0.0.1:8765/`. O cabeçalho ausente no registro da resposta em cache não indica uma nova requisição sem identificação.

### Resultados finais

- `test-osm-results.json`: 14 verificações aprovadas, sem exceções JavaScript. Inclui fonte única OSM, inicialização única, imagens visíveis, créditos, zoom, marcadores, popups e três ciclos de troca de modo sem duplicar camadas.
- `test-osm-recovery-results.txt`: oito verificações aprovadas com o OSM bloqueado. Após retirar o bloqueio e emitir o evento de conexão, o mapa principal voltou a carregar; `recovery: true`, sem erros JavaScript. A vista incorporada continua sendo uma visão geral, sem os marcadores locais.
- `test-media-map-results.txt`: 41 verificações aprovadas, executadas por HTTP. Inclui imagens, mapa, dimensões e ausência de overflow nas larguras 320, 375, 390, 430, 768, 1024 e 1440 px.
- `test-results.txt`: 47 verificações de acessibilidade e responsividade aprovadas novamente por HTTP.
- Verificação posterior às últimas alterações: mapa carregado em outro perfil limpo por HTTP; evidência de rede em `test-osm-origin-http.json`.

Os detalhes de execução estão no README. O servidor respeita o cache padrão do navegador e não realiza downloads em massa dos mapas. O uso do serviço público não exige chave ou configuração de cobrança, mas depende de internet, capacidade do provedor e cumprimento da política do OSM. Não há garantia de disponibilidade externa nem promessa de ausência absoluta de falhas futuras. As coordenadas preexistentes não foram verificadas cadastralmente.

## Etapa anterior — correção do mapa e páginas dos serviços (26/10/2026)

Concluída a alteração solicitada em 26/10/2026, sem publicação. Este registro descreve a implementação daquela etapa; a seção de 27/10/2026 acima representa o estado atual do mapa.

### Mapa

Reproduzido um erro real ao bloquear os servidores cartográficos: a troca síncrona de camada dentro do evento `load` do Leaflet removia a referência interna `_map` enquanto a biblioteca ainda a usava, provocando `Cannot read properties of null (reading '_fadeAnimated')`. A troca agora ocorre depois do término desse evento. O teste com bloqueio de rede passou sem erros JavaScript.

O componente está isolado em `map.js`, carregado com `defer`, para não depender do código de chat/login. As fontes externas passaram a carregar sem bloquear o início dos scripts locais. OpenStreetMap é a primeira fonte e CARTO é a segunda. O controle de erros considera cada lote de carregamento, evitando somar falhas antigas durante a navegação. Foram mantidos os cinco marcadores e seus detalhes.

Se as fontes falharem, uma vista geral incorporada do OpenStreetMap é oferecida automaticamente. O usuário também pode escolher essa vista, recarregá-la ou voltar aos marcadores. A vista alternativa não contém os cinco marcadores de unidades; a interface informa essa diferença. Há link externo e lista de unidades como alternativas adicionais. A recuperação de conectividade permite tentar novamente o mapa principal.

Verificado no Chrome: nove blocos cartográficos visíveis, cinco marcadores, popup, troca manual de modo e ausência de erros. Também foram bloqueados os dois servidores diretamente pelo protocolo de depuração do navegador: a recuperação para a vista incorporada ocorreu sem exceções. Capturas em `map-corrigido.png` e `map-alternativo.png`. O acesso aos mapas continua dependendo da internet e das políticas da conexão do usuário; nenhum teste local garante que um provedor externo esteja liberado em todas as redes.

### Serviços

As etiquetas “Imagem ilustrativa” foram removidas das fotos. Os créditos e o esclarecimento geral sobre o banco de imagens foram preservados.

Os oito cartões agora têm links “Conhecer serviço” para páginas HTML próprias em `servicos/`: CRAS, CREAS, Auxílio Alimentação, Apoio Psicológico, Proteção à Mulher, Atendimento ao Idoso, Cadastro Social e Juventude Ativa. Cada página explica o serviço, público, formas de apoio, como buscar atendimento e fontes oficiais. Os links funcionam sem JavaScript e não exigem login. Não são feitas inscrições ou promessas de concessão de benefícios.

As páginas compartilham `service-pages.css` e o painel de `inclusion.js`; as preferências são restauradas ao navegar. O conteúdo é mantido em `servicos/conteudo.json`; execute `./gerar-paginas-servicos.ps1` após alterar esse conteúdo para regenerar as páginas. Captura móvel em `servico-mobile.png`.

### Validação atual

219 verificações aprovadas, sem falhas:

- 47 de acessibilidade e responsividade em `test-results.txt`.
- 41 de imagens, mapa e reflow em `test-media-map-results.txt`.
- 9 de execução real do mapa em `test-map-runtime-results.json`.
- 9 com os servidores cartográficos bloqueados em `test-map-blocked-results.json`.
- 113 das páginas de serviços em `test-service-pages-results.json`: oito destinos, conteúdo, imagens, links de retorno, painel acessível, preferências entre páginas e larguras 320, 375, 390, 430, 768, 1024 e 1440 px.

`browser-check.ps1` executa um Chrome de teste sem janela visível e usa um perfil separado no diretório temporário. Os cenários estão em `test-map-runtime.js`, `test-service-pages.js`, `test-inclusion.html` e `test-media-map.html`. Exemplos: `./browser-check.ps1 -ExpressionFile test-map-runtime.js`, `./browser-check.ps1 -BlockMaps -ExpressionFile test-map-runtime.js` e `./browser-check.ps1 -ExpressionFile test-service-pages.js`. Não executar os testes de preferências no perfil pessoal.

Continuam válidas as limitações de auditoria WCAG e testes manuais descritas abaixo. A integridade cadastral dos endereços preexistentes não foi verificada. Nenhum deploy realizado.

## Diagnóstico e arquivos

Aplicação estática, sem gerenciador de pacotes ou backend. A barra superior e a navegação estão em `index.html`; os estilos existentes estão em `style.css`; menu, modal, chatbot, mapa e controles antigos estavam em `script.js`.

- `index.html`: retirada da barra, link de salto independente, sino, inclusão dos novos arquivos; corrigidos doctype duplicado e link aninhado no logotipo. Preservadas alterações que já estavam no arquivo.
- `script.js`: removidos os handlers antigos de acessibilidade; corrigidos links `#`, acionamento duplicado por Enter, modal nativo e ausência da biblioteca de mapa; respeitada redução de movimento nos scrolls e contadores.
- `inclusion.css`: painel responsivo, botão universal, estados de preferências e ajustes de reflow.
- `inclusion.js`: preferências, leitura Web Speech e notificações locais, sem dependências novas.
- `test-inclusion.html`: verificações de navegador reproduzíveis; usar perfil de teste, pois o teste modifica preferências e marca os exemplos como lidos.

## Funcionalidades

Botão circular de acessibilidade acima do chat; painel com categorias, foco nativo de dialog, fechamento e retorno de foco. Fonte de 80% a 200%, restauração, alto contraste, modo escuro, links destacados, espaçamento de letras/linhas, foco reforçado, leitura simplificada, decoração oculta e animações reduzidas. Preferências em localStorage, com tratamento para armazenamento indisponível. Tema e movimento seguem o sistema até escolha explícita.

Leitura pt-BR de seleção ou títulos/parágrafos visíveis, por trechos, com início, pausa, retomada, interrupção, velocidade e contorno do trecho. Navegadores sem Web Speech recebem explicação. A disponibilidade e a qualidade da voz dependem do navegador e das vozes instaladas.

Sino com contagem, categorias, datas/horários de Brasília, detalhes, leitura individual/em lote, filtro de não lidas e estado vazio. Quatro exemplos claramente identificados, sem comunicados oficiais ou solicitações pessoais. A fonte assíncrona `notificationSource.list()` separa os dados da apresentação para futura API.

## Preservação

Mantidos identidade visual, conteúdo, catálogo, navegação entre seções, chat e avaliação, mapa Leaflet e formulário de login demonstrativo. Verificada abertura do login; não houve teste completo dos fluxos do chat/mapa. O fluxo antigo de agendamento do chatbot continua sendo uma simulação preexistente; não há criação real de agendamento, envio de SMS ou autenticação.

## Testes e limites

Chrome headless: 47 verificações aprovadas, incluindo ausência de overflow sem esconder overflow do body, painéis de acessibilidade/notificações nas larguras 320, 375, 390, 430, 768, 1024 e 1440 px, texto ampliado a 200%, preferências salvas, reset, retorno de foco, notificações e abertura do login. Os ajustes posteriores de viewport visual e cancelamento nativo do login precisam de confirmação em dispositivo real.

Ampliação de texto a 200% foi testada; isso não substitui zoom real do navegador a 200%. Escape, sequência de Tab, leitor de tela, áudio real, mudança de preferências do sistema, teclado virtual e áreas seguras precisam de validação manual em dispositivos reais. O painel usa dialog nativo e visualViewport para apoiar esses cenários. Não foi executado axe-core nem auditoria completa de contraste; não se declara conformidade WCAG 2.2 AA. Não há evidência de cobertura integral de regressões.

## Próximos passos

Executar axe-core e revisão manual com NVDA/VoiceOver, zoom real e teclado móvel. Revisar contraste de todo o conteúdo legado e veracidade dos dados antes de publicação. Integrar API autenticada, avisos verificados, paginação e armazenamento de leituras por usuário quando houver backend. Notificações pessoais e atualizações de protocolos dependem dessa integração real. Nenhum push externo ou deploy foi realizado.

## Atualização — fotos dos serviços e mapa

Adicionadas oito fotos reais do Pexels em `assets/services/`, com compressão, dimensões explícitas, carregamento sob demanda, textos alternativos e indicação de imagem ilustrativa. Fontes e licença em `assets/services/CREDITOS.md`. Não são fotos das unidades ou de usuários reais do ConnectGRU.

O Leaflet 1.9.4 passou a ser servido localmente em `assets/vendor/leaflet/`, com licença preservada. Isso remove a dependência do CDN unpkg para inicializar o mapa. Antes, se a biblioteca externa falhasse, a função retornava silenciosamente, deixando a área vazia. A causa específica no navegador do usuário não pôde ser reproduzida; o teste local confirmou carregamento dos blocos cartográficos.

Definidas dimensões do mapa e atualização via ResizeObserver/evento resize. Mantidos os cinco marcadores e os popups existentes. Adicionados atribuições completas, rótulos dos controles, orientações de teclado, link externo, troca automática de CARTO para OpenStreetMap, limite de espera, mensagens de erro, nova tentativa e recuperação quando a conexão retorna.

Validação: 40 verificações de fotos/mapa aprovadas em `test-media-map-results.txt` e 47 verificações anteriores aprovadas novamente em `test-results.txt`. Testados carregamento das oito fotos, cinco marcadores e popup, dimensões/reflow em sete larguras (320, 375, 390, 430, 768, 1024 e 1440 px), recebimento de blocos cartográficos pela rede, falha simulada do provedor, fallback e botão de nova tentativa. Testes disponíveis em `test-media-map.html` e `test-inclusion.html`; executar em perfil de teste porque os testes de acessibilidade alteram preferências locais.

O fundo cartográfico continua dependendo de internet e dos provedores externos. As coordenadas e informações de unidades já existentes foram preservadas; não houve verificação cadastral dos endereços. Nenhum deploy realizado.

## Ajuste do rodapé

Corrigidos alinhamento do logotipo, contraste dos textos e títulos no modo escuro, distribuição das colunas e links dos serviços. Retirados os links sem destino e os ícones de redes sociais que apontavam apenas para `#`. Os oito serviços agora podem ser acessados pelo rodapé. Eliminado o padding inferior global que criava uma faixa vazia depois do rodapé; o espaço para os botões flutuantes fica dentro do próprio rodapé. O rodapé compacto das páginas de serviços recebeu o mesmo tratamento de espaçamento.

Verificação no Chrome: 42 combinações das sete larguras, fontes a 100%/200% e temas normal/escuro/alto contraste, sem overflow, com contraste de texto acima de 4,5:1, links com altura mínima de 44 px e sem sobreposição dos links pelos botões flutuantes. Captura em `footer-desktop.png`. Nenhum deploy realizado.
