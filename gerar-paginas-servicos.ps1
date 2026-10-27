$ErrorActionPreference = 'Stop'
# As páginas geradas funcionam inclusive sem JavaScript.
$services = Get-Content (Join-Path $PSScriptRoot 'servicos/conteudo.json') -Raw -Encoding UTF8 | ConvertFrom-Json
function Encode($value) { [Net.WebUtility]::HtmlEncode([string]$value) }
foreach ($service in $services) {
  $title = Encode $service.title
  $category = Encode $service.category
  $intro = Encode $service.intro
  $about = Encode $service.about
  $audience = Encode $service.audience
  $note = Encode $service.note
  $sourceTitle = Encode $service.sourceTitle
  $support = ($service.support | ForEach-Object { '<li>' + (Encode $_) + '</li>' }) -join "`n"
  $steps = ($service.steps | ForEach-Object { '<li>' + (Encode $_) + '</li>' }) -join "`n"
  $html = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>$title | ConectGRU</title>
  <meta name="description" content="$intro" />
  <link rel="icon" href="../logo-guarulhos.png" />
  <link rel="stylesheet" href="../style.css" />
  <link rel="stylesheet" href="../inclusion.css" />
  <link rel="stylesheet" href="../service-pages.css" />
  <script defer src="../inclusion.js"></script>
</head>
<body>
  <a href="#main-content" class="skip-link">Ir ao conteúdo</a>
  <header class="navbar service-header">
    <div class="nav-container">
      <a class="logo" href="../index.html" aria-label="ConectGRU — página inicial"><img src="../logo-guarulhos.png" alt="" width="40" height="40" /><span class="logo-text"><span class="logo-main">Conect<strong>GRU</strong></span><span class="logo-sub">Informações e serviços</span></span></a>
      <a class="back-link" href="../index.html#programas">Voltar aos serviços</a>
    </div>
  </header>
  <main id="main-content" class="service-page" tabindex="-1">
    <nav class="service-breadcrumb" aria-label="Caminho de navegação"><a href="../index.html">Início</a> / <a href="../index.html#programas">Serviços</a> / <span aria-current="page">$title</span></nav>
    <div class="service-intro">
      <div><span class="section-badge">$category</span><h1>$title</h1><p>$intro</p></div>
      <img class="service-image" src="../assets/services/$($service.image).jpg" width="960" height="540" alt="" decoding="async" />
    </div>
    <div class="service-content">
      <section aria-labelledby="about-title"><h2 id="about-title">O que é esse serviço?</h2><p>$about</p></section>
      <section aria-labelledby="audience-title"><h2 id="audience-title">Para quem é?</h2><p>$audience</p></section>
      <section aria-labelledby="support-title"><h2 id="support-title">Como pode ajudar?</h2><ul>$support</ul></section>
      <section aria-labelledby="access-title"><h2 id="access-title">Como buscar atendimento?</h2><ol>$steps</ol></section>
      <aside class="service-notice" aria-label="Antes de solicitar atendimento"><p>$note</p><p>Confirme horários, documentos e condições de acesso diretamente com o serviço responsável.</p></aside>
      <section aria-labelledby="sources-title"><h2 id="sources-title">Saiba mais nos canais oficiais</h2><p><a href="$($service.source)" target="_blank" rel="noopener noreferrer">$sourceTitle (abre em outra aba)</a></p><p>Orientações consultadas em 26/10/2026.</p></section>
    </div>
    <nav class="service-links" aria-label="Próximos passos"><a href="../index.html#mapa">Consultar rede de atendimento</a><a href="../index.html#programas">Ver todos os serviços</a></nav>
  </main>
  <footer class="service-footer"><p>ConectGRU · Informações sobre serviços em Guarulhos.</p><p>Fotografias de banco de imagens; não identificam usuários ou unidades da rede.</p></footer>
</body>
</html>
"@
  [IO.File]::WriteAllText((Join-Path $PSScriptRoot "servicos/$($service.slug).html"), $html, [Text.UTF8Encoding]::new($false))
}
Write-Output "$($services.Count) páginas de serviços geradas."
