const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const db = require("./config/database");
const Product = require("./models/product");
const Image = require("./models/image");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"],
  })
);

app.use(express.json());
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const data = await Product.findAll({
      include: [{ model: Image }],
    });
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
app.post(
  "/photos/upload",
  upload.array("photos", 2),
  async function (req, res) {
    try {
      let image = [];
      for (let i = 0; i < req.files.length; i++) {
        const link = `${req.protocol}://${req.get("host")}/${
          req.files[i].filename
        }`;

        await Image.create({ url: link });

        image.push(link);
      }
      res.status(200).send({ message: "uploaded", image });
    } catch (error) {
      console.log(error);

      res.status(500).send(error);
    }
  }
);

(async () => {
  await db
    .sync()
    .then(() => console.log("Connected to database"))
    .catch((error) => {
      console.log(error);
    });
})();
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
