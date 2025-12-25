
$API_KEY = (Get-Content .env | Select-String "NCWALLET_API_KEY").ToString().Split('=')[1].Trim()
$PIN = "2171"
$URL = "https://ncwallet.africa/api/v1/user"

Write-Host "Testing CURL with Key: $API_KEY"

# Windows Curl (PowerShell 7+ or Alias) might vary, assuming standard curl.exe exists or using Invoke-RestMethod equivalent
# Using Invoke-RestMethod for better PS compatibility

$Headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "nc_afr_apikey" + $API_KEY
    "trnx_pin" = $PIN
}

try {
    $Response = Invoke-RestMethod -Uri $URL -Method Post -Headers $Headers -Body "{}" -ErrorAction Stop
    Write-Host "SUCCESS"
    $Response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR"
    $_.Exception.Response.StatusCode
    $Reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $Reader.ReadToEnd()
}
