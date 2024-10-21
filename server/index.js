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

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/form", FormRoute);
app.use("/user", UserRoute);
app.use("/question", QuestionRoute);
app.use("/options", OptionsRoute);
app.use("/response", ResponseRoute);

const PORT = process.env.DATABASE_PORT;
console.log(PORT);
app.listen(PORT, () => {
  console.log("Listening on port 8000");
});
