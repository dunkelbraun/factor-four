# Build the code.
FROM node:alpine AS builder

RUN apk add git && \
    git clone --depth=1 https://github.com/domdomegg/aws-ses-v2-local.git /srv/www

WORKDIR /srv/www

RUN npm install && npm run prepublishOnly

# Create the image.
FROM node:alpine

COPY --from=builder /srv/www/branding /srv/www/branding/
COPY --from=builder /srv/www/dist /srv/www/dist/
COPY --from=builder /srv/www/node_modules /srv/www/node_modules/
COPY --from=builder /srv/www/static /srv/www/static/
COPY --from=builder /srv/www/package.json /srv/www/package.json
COPY --from=builder /srv/www/package-lock.json /srv/www/package-lock.json

WORKDIR /srv/www/dist

ENTRYPOINT ["node", "cli.js", "--host", "0.0.0.0", "--port", "8005"]
