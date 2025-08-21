#!/bin/bash

echo "🔍 Running TypeScript check..."
npm run check

if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found. Please fix them before committing."
  exit 1
fi

echo "✅ TypeScript check passed!"

echo "🔍 Running lint check..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting errors found. Please fix them before committing."
  exit 1
fi

echo "✅ All checks passed!"