const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const ejs = require('ejs');

const photoController = require('./controllers/photoControllers')
const pageController = require('./controllers/pageController');
const app = express();

//Connect DB
(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/pcat-test-db');
  } catch (err) {
    console.log(err);
  }
})();

//TEMPLATE ENGINE
app.set('view engine', 'ejs');

//MIDDLEWARES
app.use(express.static('public'));
app.use(express.urlencoded({extended: true})); //body bilgis için okuma
app.use(express.json()); //body bilgisi için donusturme
app.use(fileUpload());
app.use(methodOverride('_method', {
  methods: ['POST', 'GET']
})); //hangi metodları overide olacağını belirtik

//ROUTERS
app.get('/',photoController.getAllPhotos );
app.get('/photos/:id', photoController.getPhoto );
app.post('/photos', photoController.createPhoto);//adde.js  /photos 
app.put("/photos/:id", photoController.updatePhoto);
app.delete("/photos/:id", photoController.deletePhoto);

app.get('/about', pageController.getAboutPage);
app.get('/add', pageController.getAddPage);
app.get("/photos/edit/:id", pageController.getEditPage);

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı..`);
});
