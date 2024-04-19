const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');

const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const Photo = require('./models/Photo');

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
app.get('/', async (req, res) => {
  const photos = await Photo.find({}).sort('-dateCreated');

  res.render('index',{
    photoss: photos
  });
});

app.get('/photos/:id', async (req, res) => {

  const photo = await Photo.findById(req.params.id);
  res.render('photo',{
    photo: photo
  });

});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/add', (req, res) => {
  res.render('add');
});

//adde.js  /photos 
app.post('/photos', async (req, res) => {
  
  const uploadDir = 'public/uploads';

  if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
  }

  let uploadeImage = req.files.image;
  let uploadePath = __dirname + '/public/uploads/' + uploadeImage.name;

  // .mv ile resmi klasore yükledik daha sonra veri tabanın görsel yolunu gönderdik
  uploadeImage.mv(uploadePath, 
    async () => {
      await Photo.create({
        ...req.body,
        image: '/uploads/' + uploadeImage.name

      });
      res.redirect('/');
    });

});

app.get("/photos/edit/:id", async (req,res)=>{
  const photo = await Photo.findOne({_id: req.params.id});
  res.render('edit', {
    photo
  });
});

app.put("/photos/:id", async (req,res)=>{
  const photo = await Photo.findOne({_id: req.params.id});
  photo.title = req.body.title
  photo.description = req.body.description
  photo.save()

  res.redirect(`/photos/${req.params.id}`);

});

app.delete("/photos/:id", async (req, res) => {

  const photo = await Photo.findOne({_id : req.params.id});
  let deleteImg = __dirname + '/public' + photo.image;
  fs.unlinkSync(deleteImg);
  await Photo.findByIdAndDelete(req.params.id);
  
  res.redirect('/')

});


const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı..`);
});
