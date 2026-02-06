# Deployment Guide

This guide explains how to deploy Yukti to AWS.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **SAM CLI** installed (`pip install aws-sam-cli`)
4. **Bun** installed (`curl -fsSL https://bun.sh/install | bash`)

## Environment Setup

### 1. Configure AWS Cognito

Follow `docs/COGNITO_SETUP.md` to set up:

- User Pool
- App Client
- Note down User Pool ID and Client ID

### 2. Set up PostgreSQL

Options:

- **AWS RDS**: Create a PostgreSQL instance
- **Neon/Supabase**: Use a serverless PostgreSQL
- **EC2**: Self-hosted PostgreSQL

Get your connection string: `postgresql://user:pass@host:5432/yukti`

### 3. Get Gemini API Key

Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to generate an API key.

## Manual Deployment

### Build the project

```bash
bun install
bun run build
```

### Deploy with SAM

```bash
# Package and deploy
sam build --template-file infrastructure/template.yaml

sam deploy \
  --stack-name yukti-prod \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Stage=prod \
    DatabaseUrl="your-database-url" \
    CognitoUserPoolId="your-user-pool-id" \
    CognitoClientId="your-client-id" \
    GeminiApiKey="your-gemini-api-key" \
  --resolve-s3
```

### Sync Frontend to S3

After deployment, sync the frontend:

```bash
# Get bucket name from CloudFormation outputs
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name yukti-prod \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucket'].OutputValue" \
  --output text)

# Sync Next.js static files
aws s3 sync apps/web/.next/static s3://$BUCKET/_next/static --delete
```

### Invalidate CloudFront Cache

```bash
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name yukti-prod \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## CI/CD with GitHub Actions

### Configure Secrets

In your GitHub repository, go to Settings → Secrets and add:

| Secret                  | Description                  |
| ----------------------- | ---------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS IAM access key           |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key           |
| `DATABASE_URL`          | PostgreSQL connection string |
| `COGNITO_USER_POOL_ID`  | Cognito User Pool ID         |
| `COGNITO_CLIENT_ID`     | Cognito App Client ID        |
| `GEMINI_API_KEY`        | Google Gemini API key        |

### Trigger Deployment

- **Automatic**: Push to `main` branch
- **Manual**: Go to Actions → Deploy to AWS → Run workflow

## Outputs

After deployment, get your URLs:

```bash
aws cloudformation describe-stacks \
  --stack-name yukti-prod \
  --query "Stacks[0].Outputs"
```

This will show:

- `ApiUrl`: API Gateway endpoint
- `CloudFrontUrl`: Frontend URL
- `FrontendBucket`: S3 bucket name

## Cleanup

To delete all resources:

```bash
# Empty S3 bucket first
aws s3 rm s3://yukti-frontend-prod-YOUR_ACCOUNT_ID --recursive

# Delete stack
sam delete --stack-name yukti-prod
```

## Cost Estimation

With AWS Free Tier eligible services:

- **Lambda**: 1M requests/month free
- **API Gateway**: 1M requests/month free
- **S3**: 5GB storage free
- **CloudFront**: 1TB transfer free

Estimated monthly cost after free tier: **$5-20** depending on usage.
