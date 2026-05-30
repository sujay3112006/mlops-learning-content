FROM node:22-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port for dev server
EXPOSE 5173

# Run Vite dev server by default for local development
CMD ["npm", "run", "dev", "--", "--host"]
