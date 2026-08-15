#!/usr/bin/env bash
# Eseguito sul server (ganimede) dalla pipeline GitHub Actions, via una chiave
# SSH dedicata con forced-command — vedi .github/workflows/deploy.yml e
# DEPLOY_TODO.md. Girato manualmente la prima volta, va bene anche da
# terminale se serve un deploy fuori dalla pipeline.
set -euo pipefail
cd ~/TerraScoperta

PREV_COMMIT=$(git rev-parse HEAD)
git fetch origin main
git reset --hard origin/main
NEW_COMMIT=$(git rev-parse HEAD)
echo "Deploy $PREV_COMMIT -> $NEW_COMMIT"

docker compose build
docker compose up -d

# docker compose up -d "riesce" anche se il processo dentro crasha subito
# dopo — questo controlla che risponda davvero, non solo che il container
# risulti "up". Il container ha ~20s per avviarsi.
HEALTHY=0
for _ in $(seq 1 10); do
  sleep 2
  if curl -sf -o /dev/null http://127.0.0.1:3001/api/health; then
    HEALTHY=1
    break
  fi
done

if [ "$HEALTHY" -ne 1 ]; then
  echo "Health check fallito su $NEW_COMMIT — rollback a $PREV_COMMIT"
  git reset --hard "$PREV_COMMIT"
  docker compose build
  docker compose up -d
  echo "Rollback completato. Deploy FALLITO, non toccato il frontend in prod."
  exit 1
fi

# Frontend solo se il backend è sano — build in un container Node usa-e-getta,
# nessun Node installato sull'host (vedi DEPLOY_TODO.md).
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine sh -c "npm ci && npm run build"
sudo cp -r dist/* /var/www/terrascoperta.it/

echo "Deploy completato: $NEW_COMMIT"
