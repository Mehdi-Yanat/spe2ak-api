# Use an official Node.js runtime as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install application dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your Nest.js application listens on
EXPOSE 3000

# Start the Nest.js application
CMD ["yarn", "start:dev"]