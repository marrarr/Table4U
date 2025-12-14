# Build Angular
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production --output-path=dist/app

# Serve static files with Nginx
FROM nginx:stable
RUN rm -rf /usr/share/nginx/html/*

# Angular (application builder) wkłada pliki do dist/.../browser
COPY --from=build /app/dist/app/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
