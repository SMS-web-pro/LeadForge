$content = Get-Content "src\lib\ultimateTemplate.ts" -Raw
$content = $content -replace "</html>.*$", "</html>`;"
$content | Out-File "src\lib\ultimateTemplate.ts" -Encoding UTF8
