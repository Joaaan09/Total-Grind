# Etapa 1: Build de la aplicación React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci --include=dev

# Copiar código fuente
COPY . .

# Argumentos de build para Vite (Sentry)
ARG VITE_SENTRY_DSN
ARG VITE_APP_VERSION
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Build de producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto (no publish, para reverse proxy)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
