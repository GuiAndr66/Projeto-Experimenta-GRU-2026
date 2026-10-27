/* Mapa independente dos fluxos de chat e login. Não requer chave de API. */
(() => {
  'use strict';
  let map, layer, timer, embedded = false, failed = false;
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const element = () => document.getElementById('mapa-guarulhos');
  const status = text => { document.getElementById('mapStatus').textContent = text; };
  function alternate(reason) {
    embedded = true; clearTimeout(timer);
    if (layer) { layer.off(); map.removeLayer(layer); layer = null; }
    element().hidden = true;
    const frame = document.getElementById('mapEmbed'); frame.hidden = false;
    if (!frame.src) frame.src = frame.dataset.src;
    document.querySelector('.map-legend').hidden = true;
    document.getElementById('mapAlternative').setAttribute('aria-pressed', 'true');
    document.getElementById('mapPrimary').hidden = false;
    status(`${reason} Vista geral alternativa de Guarulhos; os marcadores de unidades ficam no mapa principal. Se esta vista também não abrir, use o link externo ou a lista de unidades.`);
  }
  function loadTiles() {
    clearTimeout(timer); failed = false;
    if (layer) { layer.off(); map.removeLayer(layer); }
    const next = L.tileLayer(tileUrl, { attribution, maxZoom: 19 });
    layer = next;
    let successes = 0, errors = 0, finished = false;
    const finish = () => {
      if (finished || layer !== next || embedded) return;
      finished = true; clearTimeout(timer);
      if (successes) {
        status(errors ? 'Parte do mapa carregou. Use Recarregar mapa se houver áreas vazias.' : 'Mapa carregado. Selecione um marcador para ver a unidade.');
      } else {
        // Leaflet ainda usa a camada depois de emitir "load". A remoção
        // síncrona nesse evento deixa _map nulo e quebra a recuperação.
        setTimeout(() => {
          if (layer !== next || embedded) return;
          failed = true;
          alternate('Não foi possível carregar o fundo do mapa principal. Verifique sua conexão.');
        }, 0);
      }
    };
    next.on('loading', () => {
      successes = 0; errors = 0; finished = false; clearTimeout(timer);
      timer = setTimeout(finish, 8000);
    });
    next.on('tileload', () => { successes++; });
    next.on('tileerror', () => { errors++; });
    next.on('load', finish);
    status('Carregando mapa…');
    next.addTo(map);
  }
  function primary() {
    embedded = false;
    element().hidden = false;
    document.getElementById('mapEmbed').hidden = true;
    document.querySelector('.map-legend').hidden = false;
    document.getElementById('mapAlternative').setAttribute('aria-pressed', 'false');
    document.getElementById('mapPrimary').hidden = true;
    if (!map) { initMap(); return; }
    map.invalidateSize({ pan: false }); loadTiles();
  }
  function initMap() {
    if (!element()) return null;
    if (location.protocol === 'file:') document.getElementById('mapLocalHint')?.removeAttribute('hidden');
    if (map) return map;
    document.getElementById('mapAlternative').onclick = () => alternate('Você escolheu o mapa alternativo.');
    document.getElementById('mapPrimary').onclick = primary;
    document.getElementById('mapRetry').onclick = () => {
      if (embedded) {
        const frame = document.getElementById('mapEmbed'); frame.src = frame.dataset.src;
        status('Recarregando a vista alternativa. Caso continue indisponível, use o link externo ou a lista de unidades.');
      } else primary();
    };
    if (typeof L === 'undefined') { alternate('O componente do mapa principal não iniciou.'); return null; }
    try {
      map = L.map(element(), { scrollWheelZoom: false, zoomControl: false }).setView([-23.4545, -46.5333], 12);
      L.control.zoom({ zoomInTitle: 'Ampliar mapa', zoomOutTitle: 'Reduzir mapa' }).addTo(map);
      const units = [
        ['CRAS Centro', 'R. das Acacia, 230', -23.4695, -46.5280, 'blue'],
        ['CRAS Pimentas', 'Av. dos Pimentas, 1.450', -23.4410, -46.4020, 'blue'],
        ['CRAS Sul', 'Av. Guarulhos, 800', -23.4655, -46.5510, 'blue'],
        ['CREAS Guarulhos', 'R. Voluntários da Pátria, 540', -23.4650, -46.5300, 'red'],
        ['UBS Norte', 'Diversas regiões', -23.4450, -46.5500, 'green']
      ];
      units.forEach(([name, address, lat, lng, color]) => {
        const icon = L.divIcon({ className: `custom-pin ${color}`, html: '<div class="pin-inner"></div>', iconSize: [22,22] });
        const content = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = name;
        const location = document.createElement('p'); location.textContent = address; content.append(title, location);
        L.marker([lat,lng], { icon, title: name, alt: name }).addTo(map).bindPopup(content);
      });
      const resize = () => { if (!embedded) map.invalidateSize({ pan: false }); };
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(element());
      window.addEventListener('resize', resize);
      // Reentrada na seção também corrige dimensões após mudanças de visibilidade.
      if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) resize(); }).observe(element());
      window.addEventListener('online', () => { if (failed) primary(); });
      loadTiles();
      return map;
    } catch (error) {
      console.error('Falha ao iniciar o mapa:', error);
      alternate('O componente do mapa principal não iniciou.'); return null;
    }
  }
  window.initMap = initMap;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMap, { once: true });
  else initMap();
})();
