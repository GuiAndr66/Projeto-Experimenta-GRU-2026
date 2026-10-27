param(
  [string]$Page = 'index.html',
  [string]$Expression = '({title:document.title})',
  [string]$ExpressionFile = '',
  [string]$Screenshot = '',
  [string]$BaseUrl = '',
  [string]$NetworkReport = '',
  [string]$ProfileName = 'connectgru-browser-check',
  [int]$Width = 1440,
  [switch]$BlockMaps,
  [switch]$RecoverMaps
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$profile = Join-Path $env:TEMP $ProfileName
$browser = Start-Process -FilePath 'C:/Program Files/Google/Chrome/Application/chrome.exe' -ArgumentList '--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9233','--allow-file-access-from-files',"--user-data-dir=$profile",'about:blank' -WindowStyle Hidden -PassThru
$client = New-Object Net.WebSockets.ClientWebSocket
try {
  $tab = $null
  for ($attempt=0; $attempt -lt 50; $attempt++) {
    try { $tabs = Invoke-RestMethod 'http://127.0.0.1:9233/json/list'; $tab = $tabs | Where-Object type -eq 'page' | Select-Object -First 1; if($tab){break} } catch {}
    Start-Sleep -Milliseconds 100
  }
  if (!$tab) { throw 'O navegador de teste não iniciou.' }
  $client.ConnectAsync([Uri]$tab.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  $script:messageId = 0
  $script:networkEvents = [Collections.Generic.List[object]]::new()
  function Send-CDP($method,$parameters) {
    $script:messageId++
    $id = $script:messageId
    $payload = @{id=$id;method=$method;params=$parameters} | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
    $client.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
    do {
      $stream = New-Object IO.MemoryStream
      do {
        $buffer = New-Object byte[] 65536
        $received = $client.ReceiveAsync([ArraySegment[byte]]::new($buffer),[Threading.CancellationToken]::None).GetAwaiter().GetResult()
        $stream.Write($buffer,0,$received.Count)
      } while (!$received.EndOfMessage)
      $reply = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
      $stream.Dispose()
      if ($reply.method -like 'Network.*' -and $NetworkReport) { $script:networkEvents.Add($reply) }
    } while ($reply.id -ne $id)
    if ($reply.error) { throw ($reply.error | ConvertTo-Json -Compress) }
    return $reply.result
  }
  Send-CDP 'Page.enable' @{} | Out-Null
  Send-CDP 'Emulation.setDeviceMetricsOverride' @{width=$Width;height=1000;deviceScaleFactor=1;mobile=$false} | Out-Null
  $expectedBlocked = $BlockMaps.IsPresent.ToString().ToLowerInvariant()
  Send-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source="window.__mapNetworkBlocked=$expectedBlocked;window.__testErrors=[];window.addEventListener('error',e=>{if(e.message)window.__testErrors.push(e.message)});"} | Out-Null
  Send-CDP 'Network.enable' @{} | Out-Null
  $blocked = @()
  if ($BlockMaps) { $blocked = @('*tile.openstreetmap.org/*') }
  Send-CDP 'Network.setBlockedURLs' @{urls=$blocked} | Out-Null
  $pageUrl = if ($BaseUrl) { ([Uri]::new([Uri]$BaseUrl,$Page)).AbsoluteUri } else { ([Uri](Join-Path $root $Page)).AbsoluteUri }
  Send-CDP 'Page.navigate' @{url=$pageUrl} | Out-Null
  Start-Sleep -Milliseconds 500
  if ($ExpressionFile) { $Expression = [IO.File]::ReadAllText((Join-Path $root $ExpressionFile)) }
  $result = Send-CDP 'Runtime.evaluate' @{expression=$Expression;awaitPromise=$true;returnByValue=$true}
  if ($result.exceptionDetails) { throw ($result.exceptionDetails | ConvertTo-Json -Depth 10) }
  $result.result.value | ConvertTo-Json -Depth 20
  if ($RecoverMaps) {
    Send-CDP 'Network.setBlockedURLs' @{urls=@()} | Out-Null
    $recovery=Send-CDP 'Runtime.evaluate' @{expression="(async()=>{window.dispatchEvent(new Event('online'));for(let i=0;i<150;i++){if(document.getElementById('mapStatus').textContent.startsWith('Mapa carregado'))break;await new Promise(r=>setTimeout(r,100));}return {recovery:document.getElementById('mapEmbed').hidden && document.querySelectorAll('.leaflet-tile-loaded').length>0,status:document.getElementById('mapStatus').textContent,errors:window.__testErrors};})()";awaitPromise=$true;returnByValue=$true}
    $recovery.result.value | ConvertTo-Json -Depth 10
  }
  if ($Screenshot) {
    $capture=Send-CDP 'Page.captureScreenshot' @{format='png'}
    [IO.File]::WriteAllBytes((Join-Path $root $Screenshot),[Convert]::FromBase64String($capture.data))
  }
  if ($NetworkReport) {
    $requests = @($script:networkEvents | Where-Object { $_.method -eq 'Network.requestWillBeSent' -and $_.params.request.url -like 'https://tile.openstreetmap.org/*' })
    $summary = @($requests | ForEach-Object {
      $request = $_.params
      $response = $script:networkEvents | Where-Object { $_.method -eq 'Network.responseReceived' -and $_.params.requestId -eq $request.requestId } | Select-Object -Last 1
      $extra = $script:networkEvents | Where-Object { $_.method -eq 'Network.requestWillBeSentExtraInfo' -and $_.params.requestId -eq $request.requestId } | Select-Object -Last 1
      $failure = $script:networkEvents | Where-Object { $_.method -eq 'Network.loadingFailed' -and $_.params.requestId -eq $request.requestId } | Select-Object -Last 1
      [PSCustomObject]@{url=$request.request.url;referer=$extra.params.headers.Referer;status=$response.params.response.status;diskCache=$response.params.response.fromDiskCache;failure=$failure.params.errorText}
    })
    [IO.File]::WriteAllText((Join-Path $root $NetworkReport), (ConvertTo-Json -InputObject $summary -Depth 6))
  }
  Send-CDP 'Browser.close' @{} | Out-Null
} finally {
  if ($client.State -eq [Net.WebSockets.WebSocketState]::Open) { try { Send-CDP 'Browser.close' @{} | Out-Null } catch {} }
  $client.Dispose()
}
