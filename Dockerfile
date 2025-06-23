# Use Node.js 20 (LTS)
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the full app
COPY . .

# Expose the port
EXPOSE 8080

# Start the app
CMD [ "npm", "start" ]
