# Use the official Node.js image for building the React app
FROM node:latest AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the React app into the container
COPY package.json ./
RUN npm install

# Copy the rest of the application files
COPY . ./

# Build the application
RUN npm run build

# Use the official Nginx image to serve the application
FROM nginx:latest

# Copy build files from the previous stage to the Nginx web root
COPY --from=build /app/dist /var/www/front-end

# Copy global nginx settings (worker_processes, worker_connections)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy a site Nginx configuration file
COPY nginx-site.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]