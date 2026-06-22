$migrations = @('00002','00003','00004','00005','00006','00007','00008','00009','00010','00011')
$jobs = @()
foreach ($m in $migrations) {
  $jobs += Start-Job -ScriptBlock {
    param($ver)
    npx supabase migration repair --status applied $ver --linked 2>&1
  } -ArgumentList $m
  Write-Host "Started repair for $m"
}
Write-Host "Waiting for all repair jobs to complete..."
$jobs | Wait-Job | Receive-Job
Write-Host "All repairs done!"
