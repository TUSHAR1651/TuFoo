const express = require("express");
const db = require("../utils/db");
const OptionsRoute = express.Router();

OptionsRoute.get("/get_options", (req, res) => {
    const question_id = req.query.question_id;
    db.query("SELECT * FROM options WHERE question_id = ?" , [question_id], (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            res.send(result);
        }
    }
    );
});
module.exports = OptionsRoute;