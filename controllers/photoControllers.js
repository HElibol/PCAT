const Photo = require('../models/Photo');
const fs = require('fs');
exports.getAllPhotos = async (req, res) => {
  const photos = await Photo.find({}).sort('-dateCreated');

  res.render('index', {
    photoss: photos,
  });
};

exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', {
    photo: photo,
  });
};

exports.createPhoto = async (req, res) => {
  const uploadDir = 'public/uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  let uploadeImage = req.files.image;
  let uploadePath = __dirname + '/../public/uploads/' + uploadeImage.name;

  // .mv ile resmi klasore yükledik daha sonra veri tabanın görsel yolunu gönderdik
  uploadeImage.mv(uploadePath, async () => {
    await Photo.create({
      ...req.body,
      image: '/uploads/' + uploadeImage.name,
    });
    res.redirect('/');
  });
};

exports.updatePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  photo.title = req.body.title;
  photo.description = req.body.description;
  photo.save();

  res.redirect(`/photos/${req.params.id}`);
};

exports.deletePhoto = async (req, res) => {
  const photo = await Photo.findOne({ _id: req.params.id });
  let deleteImg = __dirname + '/../public' + photo.image;
  fs.unlinkSync(deleteImg);
  await Photo.findByIdAndDelete(req.params.id);

  res.redirect('/');
};
