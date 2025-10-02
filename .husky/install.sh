#!/usr/bin/env sh

# Install husky pre-commit hooks
# Run: chmod +x .husky/install.sh && ./.husky/install.sh

npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run typecheck:fast && npm run lint:fast"

echo "✅ Husky pre-commit hooks installed successfully!"
echo "Run 'npm install' to complete setup"
