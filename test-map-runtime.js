(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];
  const check = (name, ok) => results.push({ name, passed: !!ok });
  for (let i=0;i<100 && !window.initMap;i++) await wait(100);
  await wait(1500);
  const map = window.initMap?.();
  check('Mapa inicia independentemente de chat/login', !!map);
  check('Etiquetas das fotos removidas', !document.querySelector('.program-photo-label'));
  check('Oito links para páginas de serviço', document.querySelectorAll('.btn-program[href^="servicos/"]').length === 8);
  check('Cinco marcadores', document.querySelectorAll('.leaflet-marker-icon').length === 5);
  document.querySelector('.map-placeholder').scrollIntoView({behavior:'instant',block:'center'});
  for (let i=0;i<150 && !/Mapa carregado|Parte do mapa|Vista geral alternativa/.test(document.getElementById('mapStatus').textContent);i++) await wait(100);
  await wait(700);
  const tiles = [...document.querySelectorAll('.leaflet-tile-loaded')].filter(tile => tile.naturalWidth > 0 && getComputedStyle(tile).visibility !== 'hidden' && Number(getComputedStyle(tile).opacity) > 0);
  const embed = document.getElementById('mapEmbed');
  const alternative = !embed.hidden;
  check('Rede tratada: blocos visíveis ou mapa alternativo', tiles.length > 0 || alternative);
  if (alternative) {
    check('Alternativa tem URL e título', embed.src.includes('openstreetmap.org/export/embed.html') && embed.title);
    check('Área vazia do mapa principal oculta', document.getElementById('mapa-guarulhos').hidden);
    check('Mensagem explica alternativa sem afirmar carregamento', document.getElementById('mapStatus').textContent.includes('Vista geral alternativa'));
  } else {
    document.querySelector('.leaflet-marker-icon').click();
    check('Popup do marcador funciona', !!document.querySelector('.leaflet-popup-content strong'));
    map.closePopup();
    document.getElementById('mapAlternative').click();
    check('Alternativa pode ser escolhida pelo usuário', !embed.hidden);
    document.getElementById('mapPrimary').click();
    check('Retorna ao mapa principal', embed.hidden && !document.getElementById('mapa-guarulhos').hidden);
    for(let i=0;i<100 && document.getElementById('mapStatus').textContent==='Carregando mapa…';i++) await wait(100);
  }
  document.querySelector('.map-placeholder').scrollIntoView({behavior:'instant',block:'center'});
  await wait(500);
  check('Sem erros JavaScript', window.__testErrors.length === 0);
  return { results, tiles: tiles.length, status: document.getElementById('mapStatus').textContent, errors: window.__testErrors };
})()
