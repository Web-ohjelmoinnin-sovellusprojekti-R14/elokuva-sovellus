# Use official Node.js base image
FROM node:20

# Create and set app directory inside Docker image
WORKDIR /app

# Copy only package.json and package-lock.json first (for faster layer caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Set your environment variables file (optional, see run command below)
# ENV NODE_ENV=production

# Expose the app port (adjust if needed)
EXPOSE 5000

# Run your main server (adjust if you use a script other than "start")
CMD ["npm", "start"]
