# Use Node.js 20 official image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Set environment variables
ENV PORT=8080

# Expose port and start the app
EXPOSE 8080
CMD ["npm", "start"]
