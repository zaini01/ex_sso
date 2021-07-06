const path = require("path");
const express = require("express");
// const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const app = express();
const { port } = require("../src/config");
const errorHandler = require("./errorHandler/errorHandler");

app.use(express.static(path.join(__dirname, "..", "build")));

app.use(bodyParser.json());
app.use(cors());
app.use(routes);
app.use(errorHandler);

app.listen(port, function () {
  console.log(`Started at port ${port}`);
});
