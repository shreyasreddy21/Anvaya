# -- Stage 1: build ------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# REACT_APP_API_URL is OPTIONAL at build time.
#   • If set (e.g. --build-arg REACT_APP_API_URL=https://joyv.it.com), the app
#     calls that origin directly.
#   • If left empty (the default), the app uses SAME-ORIGIN relative requests
#     ('/api/...'), which the nginx reverse proxy forwards to the backend. This
#     is the safe production default — see src/config/api.js. We intentionally do
#     NOT default to http://localhost:4000, which would bake the visitor's own
#     machine into the build and break every API call behind HTTPS.
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# -- Stage 2: serve with nginx -------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
