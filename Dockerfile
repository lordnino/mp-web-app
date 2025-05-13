FROM node:20.18.3-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the app for production
RUN npm run build:prod

# Stage 2: Use Nginx to serve the built app
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/dist/fuse/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"] 