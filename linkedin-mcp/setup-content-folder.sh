#!/usr/bin/env bash
# Run this once on your Mac to create the content folder.
# Usage: bash setup-content-folder.sh

FOLDER="/Users/rosebonica/linkedin"

mkdir -p "$FOLDER"

for file in \
  "brand-voice.md" \
  "company-info.md" \
  "products.md" \
  "topics.md" \
  "post-calendar.md" \
  "faqs.md" \
  "example-posts.md"
do
  if [ ! -f "$FOLDER/$file" ]; then
    touch "$FOLDER/$file"
    echo "Created $FOLDER/$file"
  else
    echo "Skipped $FOLDER/$file (already exists)"
  fi
done

echo ""
echo "Done. Open /Users/rosebonica/linkedin/ and fill in the files."
