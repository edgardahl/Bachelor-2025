# FROM node:23-slim AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM nginx:alpine
# COPY nginx.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]



# FROM node:23-slim AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM caddy:alpine

# COPY --from=build /app/dist /usr/share/caddy
# COPY Caddyfile /etc/caddy/Caddyfile



# FROM node:23-slim AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM caddy:alpine
# COPY --from=build /app/dist /srv
# COPY Caddyfile /etc/caddy/Caddyfile
# EXPOSE 80 443
# CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]



FROM node:23-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

