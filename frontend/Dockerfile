# Use Node.js as the base image
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Use a lightweight web server to serve the built files
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]