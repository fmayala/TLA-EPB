# syntax=docker/dockerfile:1

FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn

# Copy the rest of the code
COPY . .

# Run the build script from package.json
RUN yarn run build

# Your start command
CMD ["node", "server.js"]

# Expose the port
EXPOSE 3000
