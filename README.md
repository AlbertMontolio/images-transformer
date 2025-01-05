# about images sharp readstreams
https://obviy.us/blog/sharp-heic-on-aws-lambda/

mobilenet, image recognisition

# start queues and worker
docker run --name redis -p 6379:6379 -d redis

node dist/image/infraestructure/workers/image-transformation.worker.js
node dist/image/infraestructure/workers/image-recognition.worker.js

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
