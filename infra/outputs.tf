output "api_gateway_url" {
  description = "API Gateway invoke URL — use this as the backend URL in twin.tsx"
  value       = aws_apigatewayv2_api.twin.api_endpoint
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain — used to construct the CORS origins URL"
  value       = aws_cloudfront_distribution.twin.domain_name
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for conversation memory"
  value       = aws_dynamodb_table.conversations.name
}

output "frontend_bucket_name" {
  description = "S3 bucket name for the static frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.twin_api.function_name
}

output "secret_name" {
  description = "Secrets Manager secret name"
  value       = aws_secretsmanager_secret.twin_config.name
}