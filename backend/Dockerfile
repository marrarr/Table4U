FROM node:20

WORKDIR /app

# Kopiuj pliki zależności
COPY package*.json ./
COPY .env ./

RUN npm install

# Kopiuj resztę kodu
COPY . .

# Zbuduj aplikację
RUN npm run build

# Usuń plik .env jeśli jest w build (opcjonalnie)
# RUN rm -f .env

CMD ["npm", "run", "start:prod"]