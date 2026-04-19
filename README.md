# Chef Nova — AI Recipe & Nutrition Coach

A production-grade AI SaaS application that provides personalized recipe
recommendations, nutrition analysis, and cooking guidance powered by
Amazon Bedrock and deployed on AWS.

## Live Demo
- **Frontend (Vercel):** https://saas-practice-tau.vercel.app
- **Frontend (CloudFront):** https://d2c8ws8vzs2m90.cloudfront.net
- **API Health:** https://3bw7f0s4dg.execute-api.us-east-1.amazonaws.com/health

## Domain
Recipe & Nutrition Coaching — Chef Nova helps users discover personalized
recipes tailored to their dietary restrictions, cooking skill level,
available time, and health goals. It provides complete ingredient lists,
step-by-step instructions, nutritional breakdowns, and expert cooking tips.

## Architecture
User → Vercel → FastAPI (OpenAI streaming, SSE)
User → CloudFront → S3 (Next.js static frontend)
Frontend → API Gateway → Lambda → Amazon Bedrock (Nova Lite)
Lambda → DynamoDB (conversation memory with 30-day TTL)
Lambda → Secrets Manager (CORS config)
GitHub → GitHub Actions → Lambda + S3 + CloudFront (CI/CD)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Auth | Clerk (subscription gating with PricingTable) |
| Vercel Backend | FastAPI + OpenAI gpt-4o-mini + SSE streaming |
| AWS Backend | FastAPI + Amazon Bedrock Nova Lite + Mangum |
| Memory | Amazon DynamoDB (PAY_PER_REQUEST, 30-day TTL) |
| Secrets | AWS Secrets Manager |
| IaC | Terraform (7 .tf files, dev + prod workspaces) |
| CI/CD | GitHub Actions + AWS OIDC (no stored credentials) |
| CDN | Amazon CloudFront (PriceClass_100) |
| Storage | Amazon S3 (static website hosting) |

## Project Structure
recipe-coach/
├── api/index.py           # Vercel backend (OpenAI + SSE streaming)
├── pages/
│   ├── index.tsx          # Landing page with pricing
│   └── product.tsx        # Recipe form (Clerk protected)
├── server.py              # AWS Lambda backend (Bedrock)
├── lambda_handler.py      # Mangum ASGI adapter
├── dynamo_memory.py       # DynamoDB conversation storage
├── aws_secrets.py         # Secrets Manager client
├── requirements.txt       # Python dependencies
├── infra/
│   ├── main.tf            # AWS provider + locals
│   ├── variables.tf       # Input variables
│   ├── terraform.tfvars   # Variable values
│   ├── lambda.tf          # Lambda function + IAM roles
│   ├── storage.tf         # DynamoDB + S3 + Secrets Manager
│   ├── api_gateway.tf     # HTTP API Gateway v2
│   ├── cloudfront.tf      # CloudFront distribution
│   └── outputs.tf         # Output values
└── .github/
└── workflows/
└── deploy.yml     # CI/CD pipeline

## Pydantic Input Model
```python
class RecipeRecord(BaseModel):
    dish_name: str
    dietary_restrictions: str
    cooking_skill_level: str
    available_time_minutes: str
    health_goal: str
```

## Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

## AWS Deployment
```bash
cd infra
terraform init
terraform workspace select dev
terraform apply
```

## CI/CD Pipeline
Every push to `main` automatically:
1. Authenticates to AWS via OIDC (no stored credentials)
2. Packages Lambda with Linux-compatible binaries
3. Deploys Lambda function
4. Builds Next.js static frontend
5. Syncs build output to S3
6. Invalidates CloudFront cache

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `OPENAI_API_KEY` | Vercel | OpenAI API key |
| `CLERK_JWKS_URL` | Vercel + Lambda | Clerk JWT verification |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel + CI | Clerk frontend key |
| `CLERK_SECRET_KEY` | Vercel + CI | Clerk backend key |
| `BEDROCK_MODEL_ID` | Lambda | Amazon Bedrock model |
| `DYNAMODB_TABLE` | Lambda | DynamoDB table name |
| `SECRET_NAME` | Lambda | Secrets Manager path |
| `USE_DYNAMODB` | Lambda | Enable DynamoDB storage |

## GitHub Repository
https://github.com/jemishdankhara008/recipe-coach