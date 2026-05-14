#!/bin/bash
# build.sh — Railway deploy paytida GROQ_API_KEY ni index.html ga qo'yadi
# Railway -> Settings -> Deploy Command: bash webapp/build.sh

set -e

echo "🔧 webapp/index.html ga GROQ_API_KEY qo'yilmoqda..."

if [ -z "$GROQ_API_KEY" ]; then
  echo "⚠️  GROQ_API_KEY topilmadi — bo'sh qoladi"
  SAFE_KEY=""
else
  SAFE_KEY="$GROQ_API_KEY"
  echo "✅ GROQ_API_KEY topildi"
fi

# %%GROQ_API_KEY%% ni haqiqiy kalit bilan almashtirish
sed -i "s|%%GROQ_API_KEY%%|${SAFE_KEY}|g" webapp/index.html

echo "✅ build.sh tugadi"
