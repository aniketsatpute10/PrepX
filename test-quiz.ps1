# Test quiz endpoint
Start-Sleep -Seconds 2
$url = 'http://localhost:5000/api/quiz/questions?role=fullstack&difficulty=easy&limit=1'
try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response body:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_"
    Write-Host "Exception: $($_.Exception.Message)"
}
