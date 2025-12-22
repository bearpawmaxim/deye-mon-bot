FROM node:latest AS build

WORKDIR /app

COPY front-end/package.json front-end/package-lock.json* ./front-end/
WORKDIR /app/front-end
RUN npm install

COPY front-end/ ./

COPY shared/i18n ../shared/i18n

RUN npm run build

FROM nginx:latest

COPY --from=build /app/front-end/dist /var/www/front-end

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-site.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
