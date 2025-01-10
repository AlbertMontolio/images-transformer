# about images sharp readstreams
https://obviy.us/blog/sharp-heic-on-aws-lambda/

mobilenet, image recognisition

# start queues and worker
docker run --name redis -p 6379:6379 -d redis

node dist/image/infraestructure/workers/transform-image.worker.js
node dist/image/infraestructure/workers/recognize-image.worker.js

# bullmq
read please: https://docs.bullmq.io/guide/telemetry about bullmq

# postgresql
run on warp
psql postgres # it connects to postgres db.
you could do psql -D but you need name of db

postgres=# \du
                                      List of roles
   Role name    |                         Attributes                         | Member of 
----------------+------------------------------------------------------------+-----------
 albertmontolio | Superuser, Create role, Create DB, Replication, Bypass RLS | {}


 sql -h localhost -U your_db_user -d your_db_name

# apply migration in prisma
npx prisma migrate dev --name image-optionals
it creates file and fires it in db

npx prisma migrate reset
npx prisma generate

node v working
v22.12.0

docker-compose down --volumes
docker system prune -af
rm -rf node_modules package-lock.json dist

docker-compose build --no-cache
docker-compose up -d

docker execute -it node_app batch

scale!!!

# todo: dockerfile improvements, do not copy . .
it requires to remove node_modules and dist

663020a5ccd3

docker exec -it images-transformer-app bash

'IMG_5302 4.jpeg'       'IMG_5306 4.jpeg'       'IMG_5311 4.HEIC.jpeg'  'IMG_5316 4.HEIC.jpeg'  'IMG_5320 4.HEIC.jpeg'   heics
'IMG_5303 4.jpeg'       'IMG_5307 4.HEIC.jpeg'  'IMG_5312 4.HEIC.jpeg'  'IMG_5317 4.HEIC.jpeg'  'IMG_5321 4.HEIC.jpeg'   jpegs
'IMG_5304 4.HEIC.jpeg'  'IMG_5308 4.HEIC.jpeg'  'IMG_5313 4.HEIC.jpeg'  'IMG_5317 4.jpeg'       'IMG_5322 4.HEIC.jpeg'   others
'IMG_5305 4.HEIC.jpeg'  'IMG_5309 4.HEIC.jpeg'  'IMG_5314 4.HEIC.jpeg'  'IMG_5318 4.HEIC.jpeg'   flower.jpg
'IMG_5306 4.HEIC.jpeg'  'IMG_5310 4.HEIC.jpeg'  'IMG_5315 4.HEIC.jpeg'  'IMG_5319 4.HEIC.jpeg'   flower_photos

/usr/src/app/input_images/IMG_5322 4.HEIC.jpeg


todo 
Add a request logger to monitor incoming requests. Use a library like morgan:

Uncaught promise rejections in your route handlers (e.g., if findOne or deleteAllImagesAndRelations fails) could crash the app. Use an error-handling middleware or a wrapper for async routes.

Refactor Example: Create an asyncHandler utility:

javascript
Copiar código
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

# TODO: add enums to filtertype and other places