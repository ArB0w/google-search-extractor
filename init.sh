npm init -y
npm install express dotenv

npm install
npm start
npm test


docker build -t google-search-extractor .
docker run --env-file .env -p 3000:3000 google-search-extractor


docker compose up --build

docker compose stop
docker compose start

docker compose logs

docker compose down



docker ps
docker ps -a

docker stop <container_id>



docker build -t google-search-extractor .
docker save -o google-search-extractor.tar google-search-extractor

docker load -i google-search-extractor.tar
docker images
docker run --env-file .env -p 3000:3000 google-search-extractor