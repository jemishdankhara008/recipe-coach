# ─── HTTP API ─────────────────────────────────────────────────────────────────

resource "aws_apigatewayv2_api" "twin" {
  name          = "${local.name_prefix}-api-gateway"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_origins = ["https://${aws_cloudfront_distribution.twin.domain_name}"]
    max_age       = 300
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_apigatewayv2_stage" "twin_default" {
  api_id      = aws_apigatewayv2_api.twin.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "twin_lambda" {
  api_id                 = aws_apigatewayv2_api.twin.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.twin_api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "chat_route" {
  api_id    = aws_apigatewayv2_api.twin.id
  route_key = "POST /chat"
  target    = "integrations/${aws_apigatewayv2_integration.twin_lambda.id}"
}

resource "aws_apigatewayv2_route" "health_route" {
  api_id    = aws_apigatewayv2_api.twin.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.twin_lambda.id}"
}

# Permission: allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.twin_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.twin.execution_arn}/*/*"
}