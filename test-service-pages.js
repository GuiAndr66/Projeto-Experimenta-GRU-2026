(async () => {
  const results = [], check = (name, ok) => results.push({ name, passed: !!ok });
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
  while(document.readyState !== 'complete') await wait(50);
  const urls = [...document.querySelectorAll('.btn-program')].map(link => link.href);
  check('Oito destinos distintos', new Set(urls).size === 8);
  const frame = document.createElement('iframe'); frame.title = 'Teste de serviços'; frame.style.cssText='width:390px;height:900px;'; document.body.append(frame);
  const load = url => new Promise((resolve,reject) => { const timer=setTimeout(()=>reject(new Error('Tempo excedido: '+url)),8000); frame.onload=()=>{clearTimeout(timer);resolve();}; frame.src=url; });
  for (const url of urls) {
    await load(url);
    const doc=frame.contentDocument, win=frame.contentWindow;
    const slug=url.split('/').pop();
    check(slug+' conteúdo e títulos', doc.querySelectorAll('h1').length===1 && doc.querySelectorAll('.service-content h2').length===5);
    check(slug+' sem texto corrompido', !doc.body.textContent.includes('Ã'));
    check(slug+' voltar aos serviços', doc.querySelector('.back-link').getAttribute('href')==='../index.html#programas');
    check(slug+' fonte oficial', !!doc.querySelector('.service-content a[href^="https://"]'));
    check(slug+' imagem local', doc.querySelector('.service-image').complete && doc.querySelector('.service-image').naturalWidth>0);
    const button=doc.getElementById('accessibilityToggle');
    button?.click(); check(slug+' painel acessível', doc.getElementById('accessibilityPanel')?.open); doc.getElementById('accessibilityPanel')?.close();
    for (const width of [320,375,390,430,768,1024,1440]) {
      frame.style.width=width+'px'; void doc.documentElement.offsetWidth;
      doc.body.style.overflowX='visible';
      check(slug+' reflow '+width, doc.documentElement.scrollWidth<=width);
    }
    win.localStorage.setItem('connectgru.accessibility',JSON.stringify({fontScale:1.2,darkMode:true,reducedMotion:true}));
    await load(url);
    check(slug+' preferências restauradas na navegação', frame.contentDocument.body.classList.contains('dark-mode') && frame.contentDocument.documentElement.style.getPropertyValue('--font-scale')==='1.2');
    frame.contentDocument.getElementById('preferencesReset').click();
  }
  frame.remove();
  return { results, passed:results.filter(row=>row.passed).length, failed:results.filter(row=>!row.passed) };
})()
