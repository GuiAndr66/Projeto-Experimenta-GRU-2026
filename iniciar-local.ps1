param([ValidateRange(1024,65535)][int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PSScriptRoot)
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$Port)
$types = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.json'='application/json; charset=utf-8';'.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.svg'='image/svg+xml';'.ico'='image/x-icon';'.woff2'='font/woff2'}
try {
  $listener.Start()
  Write-Output "ConnectGRU: http://127.0.0.1:$Port/index.html"
  Write-Output 'Servidor local. Para encerrar, pressione Ctrl+C.'
  while ($true) {
    $connection = $listener.AcceptTcpClient()
    $connection.ReceiveTimeout = 3000
    $connection.SendTimeout = 3000
    try {
      $stream = $connection.GetStream()
      $reader = [IO.StreamReader]::new($stream,[Text.Encoding]::ASCII,$false,1024,$true)
      $line = $reader.ReadLine()
      if (!$line) { continue }
      $parts = $line.Split(' ')
      if ($parts.Length -lt 2) { continue }
      $headerCount = 0
      do { $header = $reader.ReadLine(); $headerCount++ } while ($header -and $headerCount -lt 100)
      $method = $parts[0]
      $requestPath = [Uri]::UnescapeDataString(($parts[1] -split '\?',2)[0]).Replace('/',[IO.Path]::DirectorySeparatorChar)
      $relative = $requestPath.TrimStart([IO.Path]::DirectorySeparatorChar)
      if (!$relative) { $relative = 'index.html' }
      $target = [IO.Path]::GetFullPath((Join-Path $root $relative))
      $extension = [IO.Path]::GetExtension($target).ToLowerInvariant()
      $allowed = $target.StartsWith($root+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -and $types.ContainsKey($extension) -and $relative -notmatch '(^|[\\/])\.'
      if ($method -notin @('GET','HEAD')) { $code='405 Method Not Allowed'; $body=[Text.Encoding]::UTF8.GetBytes('Método não permitido.'); $type='text/plain; charset=utf-8' }
      elseif (!$allowed -or ![IO.File]::Exists($target)) { $code='404 Not Found'; $body=[Text.Encoding]::UTF8.GetBytes('Arquivo não encontrado.'); $type='text/plain; charset=utf-8' }
      else { $code='200 OK'; $body=[IO.File]::ReadAllBytes($target); $type=$types[$extension] }
      $head="HTTP/1.1 $code`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nReferrer-Policy: strict-origin-when-cross-origin`r`nX-Content-Type-Options: nosniff`r`n`r`n"
      $bytes=[Text.Encoding]::ASCII.GetBytes($head)
      $stream.Write($bytes,0,$bytes.Length)
      if ($method -ne 'HEAD') { $stream.Write($body,0,$body.Length) }
    } catch { Write-Verbose $_.Exception.Message }
    finally { $connection.Dispose() }
  }
} finally { $listener.Stop() }
