Write-Host "Packaging Lambda function..."

$rootPath = "F:\Ai Ml\sem 2\MLOps\recipe-coach"
$infraPath = "F:\Ai Ml\sem 2\MLOps\recipe-coach\infra"
$packagePath = "$rootPath\package"

Set-Location $rootPath

pip install -r requirements.txt -t $packagePath `
  --platform manylinux2014_x86_64 `
  --only-binary=:all: `
  --python-version 3.12 `
  --quiet

Copy-Item *.py $packagePath\

Compress-Archive -Path "$packagePath\*" -DestinationPath "$infraPath\lambda.zip" -Force

Remove-Item -Recurse -Force $packagePath

Write-Host "Done: infra\lambda.zip created"