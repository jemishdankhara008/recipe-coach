variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used as a prefix for all resource names"
  type        = string
  default     = "twin"
}

variable "environment" {
  description = "Environment label used in resource tags. Note: resource names use the Terraform workspace name, not this variable."
  type        = string
  default     = "dev"
}

variable "bedrock_model_id" {
  description = "Bedrock model ID. Use the global. cross-region inference prefix for best availability."
  type        = string
  default     = "global.amazon.nova-2-lite-v1:0"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "clerk_jwks_url" {
  description = "Clerk JWKS URL for JWT verification"
  type        = string
  default     = ""
}