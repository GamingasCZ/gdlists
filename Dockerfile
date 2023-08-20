# Use an official Node.js runtime as a parent image
FROM node:slim

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 5173 to the outside world
EXPOSE 5173

# Define environment variable
ENV NODE_ENV=dev

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
