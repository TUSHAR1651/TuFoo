if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const QuestionRoute = require("./Routes/QuestionRoutes");
const FormRoute = require("./Routes/FormRoute");
const UserRoute = require("./Routes/UserRoute");
const OptionsRoute = require("./Routes/OptionsRoute");
const ResponseRoute = require("./Routes/ResponseRoute");
const cors = require("cors");
const express = require("express");
const db = require("./utils/db");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const app = express();
app.use(express.json());
console.log("Client Url" , CLIENT_URL);
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.options('*', cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use("/form", FormRoute);
app.use("/user", UserRoute);
app.use("/question", QuestionRoute);
app.use("/options", OptionsRoute);
app.use("/response", ResponseRoute);

const PORT = process.env.SERVER_PORT || 8000;
console.log(PORT);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
