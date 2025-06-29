# CI/CD Pipeline Documentation

This repository uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD). Here's how each workflow works:

## 🚀 Workflows Overview

### 1. `ci.yml` - Main CI Pipeline

**Triggers:** Push to main/master/develop branches, Pull Requests to main/master

**What it does:**

- **Tests Product Service** - Runs lint, tests, and build with PostgreSQL database
- **Tests Web Frontend** - Runs lint and build for Next.js app
- **Builds Docker Images** - Creates Docker images if all tests pass

**Steps Explained:**

1. **Checkout code** - Downloads the repository code
2. **Setup Node.js** - Installs Node.js with caching for faster builds
3. **Install dependencies** - Runs `npm ci` for reproducible installs
4. **Database setup** - Starts PostgreSQL and runs Prisma migrations
5. **Code quality** - Runs ESLint to catch code issues
6. **Tests** - Executes all test suites
7. **Build** - Compiles TypeScript and builds applications
8. **Docker build** - Creates containerized versions

### 2. `deploy.yml` - Production Deployment

**Triggers:** Push to main/master branch, Published releases

**What it does:**

- **Builds & Pushes Images** - Creates Docker images and pushes to GitHub Container Registry
- **Deploys to Production** - Deploys the new images to production environment

**Key Features:**

- **Container Registry** - Uses GitHub Container Registry (ghcr.io)
- **Image Tagging** - Tags images with branch names, versions, and git SHA
- **Environment Protection** - Requires manual approval for production deployments
- **Rollback Support** - Tagged images allow easy rollbacks

### 3. `pr-checks.yml` - Pull Request Validation

**Triggers:** Pull Requests to main/master/develop branches

**What it does:**

- **Code Quality** - Runs linting and formatting checks
- **Security Scan** - Checks for vulnerable dependencies
- **Build Test** - Ensures applications build correctly
- **PR Size Check** - Warns about large pull requests

## 🛠 Setup Instructions

### Step 1: Enable GitHub Actions

1. Push these workflow files to your repository
2. Go to your GitHub repo → **Actions** tab
3. Workflows will automatically start running on the next push/PR

### Step 2: Set up Container Registry (Optional)

For deployment workflow:

1. Go to your GitHub repo → **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select "Read and write permissions"
3. This allows workflows to push to GitHub Container Registry

### Step 3: Configure Production Environment (Optional)

For protected deployments:

1. Go to **Settings** → **Environments**
2. Create an environment named "production"
3. Add protection rules (require reviewers, deployment branches, etc.)

### Step 4: Add Secrets (If needed)

For external deployments, add secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secrets like:
   - `DEPLOY_HOST` - Your server IP/domain
   - `DEPLOY_USER` - SSH username
   - `DEPLOY_KEY` - SSH private key

## 📊 Workflow Status

You can monitor workflow status:

- **Actions tab** - See all workflow runs
- **Pull Request checks** - See status directly on PRs
- **Branch protection** - Require checks to pass before merging
- **Status badges** - Add badges to README.md

## 🔧 Customization

### Adding New Jobs

Add to existing workflows or create new ones:

```yaml
new-job:
  name: New Job
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Your custom step
      run: echo "Custom logic here"
```

### Environment Variables

Set environment variables for all jobs:

```yaml
env:
  NODE_VERSION: "18"
  CUSTOM_VAR: "value"
```

### Conditional Execution

Run jobs only under certain conditions:

```yaml
deploy:
  if: github.ref == 'refs/heads/main'
  # Job only runs on main branch
```

## 🚨 Troubleshooting

### Common Issues:

1. **Tests failing** - Check logs in Actions tab
2. **Build errors** - Ensure all dependencies are in package.json
3. **Permission errors** - Check workflow permissions in repository settings
4. **Environment issues** - Verify environment variables are set correctly

### Best Practices:

- **Keep workflows fast** - Use caching and parallel jobs
- **Fail fast** - Put quick checks (lint) before slow ones (tests)
- **Secure secrets** - Never commit secrets, use GitHub Secrets
- **Monitor costs** - GitHub Actions has usage limits

## 📈 Next Steps

1. **Branch Protection** - Require PR checks before merging
2. **Notifications** - Set up Slack/email notifications for failures
3. **Performance** - Add performance testing workflows
4. **Security** - Add SAST (Static Application Security Testing)
5. **Monitoring** - Add deployment health checks
