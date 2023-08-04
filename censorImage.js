const express = require("express");
const multer = require("multer");
const jpeg = require("jpeg-js");
const jimp = require("jimp");

const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");

const app = express();

const storage = multer.memoryStorage();
// .diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
const upload = multer({ storage });
// const upload = multer();

let _model;

const convert = async (img) => {
  const image = await jpeg.decode(img, true);

  const numChannels = 3;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c];

  return tf.tensor3d(values, [image.height, image.width, numChannels], "int32");
};

app.post("/nsfw", upload.array("image", 2), async (req, res) => {
  if (req.files.length === 0)
    res.status(400).send("Missing image multipart/form-data");
  else {
    const response = {};
    let images = [];

    for (let i = 0; i < req.files.length; i++) {
      const image = await convert(req.files[i].buffer);
      const link = `${Date.now() + "-" + req.files[i].originalname}`;
      const predictions = await _model.classify(image);
      console.log(predictions);
      console.log({ prob: predictions[0].probability });
      if (
        predictions[0].probability > 0.9 &&
        (predictions[0].className === "Porn" ||
          predictions[0].className === "Hentai" ||
          predictions[0].className === "Sexy")
      ) {
        await jimp.read(req.files[i].buffer).then((img) => {
          img.blur(50).write("./public/" + `${link}`);
        });
        image.dispose();
        response[i] = predictions;
        const address = `${req.protocol}://${req.get("host")}/${link}`;
        images.push(address);
        return res.json({ message: "porn", images });
      }
      await jimp.read(req.files[i].buffer).then((img) => {
        img.write("./public/" + `${link}`);
      });
      image.dispose();
      response[i] = predictions;
      const address = `${req.protocol}://${req.get("host")}/${link}`;
      images.push(address);
    }
    res.json({ ...response, links: images });
  }
});

const load_model = async () => {
  _model = await nsfw.load();
};
app.use(express.static("public"));

load_model().then(() =>
  app.listen(8080, () => {
    console.log("Listening on port 8080");
  })
);
