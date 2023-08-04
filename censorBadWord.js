const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const Product = require("./models/product");
const badwords = require("indonesian-badwords");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:5173"],
  })
);

app.use(express.json());
app.use(express.static("public"));

app.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = { name, description };
    const product = await Product.create(data);
    res.status(200).send(product);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.get("/", async (req, res) => {
  try {
    const { show = 0 } = req.query;
    const data = await Product.findAll({});
    if (parseInt(show) === 0) {
      data.map((item) => {
        item.description = badwords.censor(item.description);
        return item;
      });
      return res.status(200).send(data);
    }
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

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
