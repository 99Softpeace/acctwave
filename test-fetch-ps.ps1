
$API_KEY = (Get-Content .env | Select-String "NCWALLET_API_KEY").ToString().Split('=')[1].Trim()
$PIN = "2171"
$URL = "https://ncwallet.africa/api/v1/service/id/data"

Write-Host "Testing Fetch Plans with Key: $API_KEY"

$Headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "nc_afr_apikey" + $API_KEY
    "trnx_pin" = $PIN
}

try {
    $Response = Invoke-RestMethod -Uri $URL -Method Get -Headers $Headers -ErrorAction Stop
    Write-Host "SUCCESS"
    Write-Host "Fetched Plans Count: $(($Response | ConvertTo-Json).Length)"
} catch {
    Write-Host "ERROR"
    $_.Exception.Response.StatusCode
    $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $Reader.ReadToEnd()
}
