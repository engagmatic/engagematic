# Quick test script for Profile Coach API
Write-Host "`nTesting LinkedInPulse Profile Coach API`n" -ForegroundColor Cyan
Write-Host ("=" * 60)

$body = @{
    userType = "Early Professional"
    headline = "Software Engineer at Tech Corp"
    about = "I build scalable web applications using React and Node.js. Passionate about clean code and user experience."
    roleIndustry = "Software Engineer | Technology"
    location = "San Francisco, CA"
    targetAudience = "Tech recruiters and hiring managers"
    mainGoal = "get interviews"
    additionalText = ""
} | ConvertTo-Json

Write-Host "`nSending request to: http://localhost:5000/api/profile-coach/test`n" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/profile-coach/test" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "SUCCESS!`n" -ForegroundColor Green
    Write-Host "Profile Score: $($response.data.profile_score)/100" -ForegroundColor Cyan
    Write-Host "`nSummary Points:" -ForegroundColor Yellow
    $response.data.summary_points | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host "`nHeadline Suggestions:" -ForegroundColor Yellow
    $response.data.headline_suggestions | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host "`nQuick Wins:" -ForegroundColor Yellow
    $response.data.quick_wins | ForEach-Object { Write-Host "  - $_" }
    
    Write-Host "`nGenerated Post:" -ForegroundColor Yellow
    Write-Host "  $($response.data.generated_post_intro)"
    Write-Host "  $($response.data.generated_post)"
    
    Write-Host "`n" + ("=" * 60)
    Write-Host "`nTest completed successfully!`n" -ForegroundColor Green
} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nMake sure the backend server is running on http://localhost:5000`n" -ForegroundColor Yellow
}

