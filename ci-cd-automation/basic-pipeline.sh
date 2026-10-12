
#!/usr/bin/env bash

set -Eeuo pipefail

# Move to the project root.
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    echo "Error: Not inside a Git repository."
    exit 1
}

cd "$ROOT_DIR"

# Detect the current branch and set the commit message.
CURRENT_BRANCH="$(git branch --show-current)"

if [[ -z "$CURRENT_BRANCH" ]]; then
    echo "Error: Could not determine the current Git branch."
    echo "Detached HEAD is not supported."
    exit 1
fi

COMMIT_MESSAGE="${1:-Update project}"

echo "Google Search Extractor - CI/CD Pipeline"
echo "Project: $ROOT_DIR"
echo "Branch:  $CURRENT_BRANCH"
echo

# Check that the required tools and project files exist.
for tool in git npm docker; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        echo "Error: Required command '$tool' is not installed."
        exit 1
    fi
done

if ! docker compose version >/dev/null 2>&1; then
    echo "Error: Docker Compose is not available."
    exit 1
fi

if [[ ! -f "package.json" || ! -f "package-lock.json" ]]; then
    echo "Error: package.json or package-lock.json is missing."
    exit 1
fi

if [[ ! -f "docker-compose.yml" && ! -f "compose.yml" && ! -f "compose.yaml" ]]; then
    echo "Error: Docker Compose configuration was not found."
    exit 1
fi

# Prevent accidentally committing the .env file containing secrets.
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    echo "Error: .env is tracked by Git."
    echo "Remove it from version control and add it to .gitignore."
    exit 1
fi

# Collect tracked changes and non-ignored untracked files.
mapfile -d '' -t TRACKED_CHANGES < <(
    git diff --name-only -z HEAD --
)

mapfile -d '' -t UNTRACKED_FILES < <(
    git ls-files --others --exclude-standard -z
)

CHANGED_FILES=("${TRACKED_CHANGES[@]}" "${UNTRACKED_FILES[@]}")

# Remove duplicate file paths.
if [[ ${#CHANGED_FILES[@]} -gt 0 ]]; then
    mapfile -t CHANGED_FILES < <(
        printf '%s\n' "${CHANGED_FILES[@]}" | sort -u
    )
fi

if [[ ${#CHANGED_FILES[@]} -eq 0 ]]; then
    echo "No changes detected."
    exit 0
fi

echo "Changed files:"
printf '  %s\n' "${CHANGED_FILES[@]}"
echo

# Determine whether application files or dependencies have changed.
APP_CHANGED=false
DEPENDENCIES_CHANGED=false

for file in "${CHANGED_FILES[@]}"; do
    case "$file" in
        README*|*.md|docs/*)
            # Documentation changes do not require tests or a rebuild.
            ;;
        package.json|package-lock.json)
            APP_CHANGED=true
            DEPENDENCIES_CHANGED=true
            ;;
        *)
            APP_CHANGED=true
            ;;
    esac
done

# Install dependencies, run tests and build the Docker image when needed.
if [[ "$APP_CHANGED" == true ]]; then

    if [[ ! -d "node_modules" || "$DEPENDENCIES_CHANGED" == true ]]; then
        echo "Installing dependencies..."
        npm ci
    else
        echo "Dependencies are already installed."
    fi

    echo
    echo "Running tests..."
    npm test

    echo
    echo "Validating Docker Compose configuration..."
    docker compose config --quiet

    echo
    echo "Building Docker image..."
    docker compose build

else
    echo "Documentation-only changes detected."
    echo "Skipping dependency installation, tests and Docker build."
fi

# Ask before staging changes.
echo
read -r -p "Stage changes and review them? [y/N] " answer

if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Pipeline stopped before staging."
    exit 0
fi

# Stage changes while respecting .gitignore.
git add -A

echo
echo "Staged change summary:"
git diff --cached --stat

if git diff --cached --quiet; then
    echo "No staged changes to commit."
    exit 0
fi

# Display the exact changes before committing.
echo
echo "Staged changes:"
git diff --cached

read -r -p "Commit and push to '$CURRENT_BRANCH'? [y/N] " answer

if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Pipeline stopped before commit and push."
    echo "Your changes remain in the working tree and staging area."
    exit 0
fi

# Commit the changes and push them to the current branch.
git commit -m "$COMMIT_MESSAGE"

echo
echo "Pushing to origin/$CURRENT_BRANCH..."
git push -u origin "$CURRENT_BRANCH"

# Update the development environment only when application files changed.
if [[ "$APP_CHANGED" == true ]]; then
    echo
    echo "Updating Docker Compose environment..."
    docker compose up -d

    echo
    echo "Container status:"
    docker compose ps
else
    echo
    echo "Documentation-only changes. The running application remains unchanged."
fi

echo
echo "Pipeline completed successfully."
