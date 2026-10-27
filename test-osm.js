(async () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [], check = (name, ok) => results.push({ name, passed: !!ok });
  for(let i=0;i<150 && !window.initMap;i++) await wait(100);
  const map = window.initMap?.();
  check('Página servida por HTTP', location.protocol === 'http:');
  check('Leaflet local 1.9.4', window.L?.version === '1.9.4');
  check('Inicialização única', map && map === window.initMap());
  check('Cinco marcadores preservados', document.querySelectorAll('.leaflet-marker-icon').length === 5);
  document.querySelector('.map-placeholder').scrollIntoView({behavior:'instant',block:'center'});
  for(let i=0;i<150 && !/Mapa carregado|Vista geral alternativa/.test(document.getElementById('mapStatus').textContent);i++) await wait(100);
  await wait(600);
  const layers=[]; map.eachLayer(layer=>{if(layer instanceof L.TileLayer)layers.push(layer)});
  if(window.__mapNetworkBlocked){
    check('Falha de rede abre alternativa', !document.getElementById('mapEmbed').hidden);
    check('Mensagem explica a falha', document.getElementById('mapStatus').textContent.includes('Não foi possível carregar'));
    document.getElementById('mapRetry').click();
    check('Nova tentativa da alternativa disponível', document.getElementById('mapStatus').textContent.includes('Recarregando'));
  }else{
    check('Fonte única oficial OSM', layers.length===1 && layers[0]._url==='https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    const tiles=[...document.querySelectorAll('.leaflet-tile-loaded')];
    check('Mapa principal carregou pela rede', document.getElementById('mapEmbed').hidden && tiles.some(tile=>tile.naturalWidth===256));
    check('Blocos cartográficos visíveis', tiles.some(tile=>getComputedStyle(tile).visibility==='visible' && Number(getComputedStyle(tile).opacity)>0));
    check('Créditos OSM visíveis', !!document.querySelector('.leaflet-control-attribution a[href="https://www.openstreetmap.org/copyright"]'));
    const zoom=map.getZoom(); document.querySelector('.leaflet-control-zoom-in').click(); await wait(500);
    check('Controle de zoom funciona', map.getZoom()===zoom+1);
    map.setZoom(zoom,{animate:false});
    document.querySelector('.leaflet-marker-icon').click();
    check('Detalhes das unidades funcionam', !!document.querySelector('.leaflet-popup-content strong'));
    map.closePopup();
    for(let i=0;i<3;i++){
      document.getElementById('mapAlternative').click();document.getElementById('mapPrimary').click();
      await wait(200);
    }
    const current=[];map.eachLayer(layer=>{if(layer instanceof L.TileLayer)current.push(layer)});
    check('Alternar modos não duplica camadas', current.length===1);
    check('Alternar modos preserva marcadores', document.querySelectorAll('.leaflet-marker-icon').length===5);
    for(let i=0;i<100&&!document.getElementById('mapStatus').textContent.startsWith('Mapa carregado');i++) await wait(100);
    check('Mapa volta a carregar após alternar modos', document.getElementById('mapStatus').textContent.startsWith('Mapa carregado'));
  }
  await wait(500);
  check('Sem exceções JavaScript', window.__testErrors.length===0);
  document.querySelector('.map-placeholder').scrollIntoView({behavior:'instant',block:'center'});
  return {results,passed:results.filter(row=>row.passed).length,failed:results.filter(row=>!row.passed),status:document.getElementById('mapStatus').textContent,errors:window.__testErrors};
})()
