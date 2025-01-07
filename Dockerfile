# Start with an Ubuntu base image
FROM ubuntu:22.04

# Set the working directory
WORKDIR /usr/src/app

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev

# Add NodeSource repository for Node.js 22.x
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# Install Node.js 22.12.0
RUN apt-get install -y nodejs

# Verify Node.js and npm versions
RUN node -v && npm -v

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild TensorFlow.js bindings if necessary
RUN npm rebuild @tensorflow/tfjs-node --build-from-source

# Copy the Prisma schema and configuration files
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the source code
COPY . .

# Build the app
RUN npm run build:tsc

# Expose the app port
EXPOSE 3000

# Default command
CMD ["node", "dist/run.js"]
