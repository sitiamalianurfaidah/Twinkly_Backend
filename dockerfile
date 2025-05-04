# 1. Pakai image Node.js
FROM node:18

# 2. Set tempat kerja di dalam container
WORKDIR /app

# 3. Salin package.json dan install dependencies
COPY package*.json ./
RUN npm install

# 4. Salin semua file project ke container
COPY . .

# 5. Port yang mau dibuka
EXPOSE 5000

# 6. Perintah untuk jalanin server
CMD ["node", "index.js"]
