param([int]$port = 5500)

$dir = $PSScriptRoot
if (-not $dir) { $dir = (Get-Location).Path }

$listener = New-Object System.Net.HttpListener
try {
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    $listener.Start()
    Write-Output "HTTP Server listening on http://localhost:$port/ and http://127.0.0.1:$port/"
} catch {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
        $listener.Start()
        Write-Output "HTTP Server listening on http://127.0.0.1:$port/"
    } catch {
        Write-Error "Failed to start listener on port $port : $_"
        exit 1
    }
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json; charset=utf-8"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        $mayaDir = Join-Path $dir "maya-leela"

        if ($urlPath -eq "maya-leela" -or $urlPath -eq "maya-leela/") {
            $filePath = Join-Path $mayaDir "index.html"
        } elseif ($urlPath.StartsWith("maya-leela/")) {
            $subPath = $urlPath.Substring("maya-leela/".Length)
            $filePath = Join-Path $mayaDir $subPath
        } else {
            $filePath = Join-Path $dir $urlPath
        }

        if (Test-Path -Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            if ($mimeTypes.ContainsKey($ext)) {
                $response.ContentType = $mimeTypes[$ext]
            } else {
                $response.ContentType = "application/octet-stream"
            }

            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # continue loop
    }
}
