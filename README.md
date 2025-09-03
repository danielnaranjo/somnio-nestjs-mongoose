# SOMNIO Challenge


### First step
Set MongoBD URI

```.env
MONGODB_URI=mongodb://localhost:27017/nest # example
```
Then, run...
```
npm install
node scripts/seed.js # this will drop your database
```

### Develop
```
npm run start
npm run start:dev
npm run test
```

Open a web browser at API [http://localhost:3000/](http://localhost:3000/) or Swagger [http://localhost:3000/api](http://localhost:3000/api)

### Docker
```
npm run build:docker
npm run start:docker
```

September 2025
