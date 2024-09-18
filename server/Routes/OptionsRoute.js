const express = require("express");
const db = require("../utils/db");
const OptionsRoute = express.Router();

OptionsRoute.get("/get_options", (req, res) => {
    const question_id = req.query.question_id;
    console.log(req.query);
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

OptionsRoute.delete("/delete_options", (req, res) => {
    const questions = req.body;
    console.log(questions);
    for (var i = 0; i < questions.length; i++) {
        const { question_id } = questions[i];
        db.query("DELETE FROM options WHERE question_id = ?", [question_id], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(message = "Options deleted successfully");
            }
        });
    }

});

OptionsRoute.delete("/delete_option/:option_id", (req, res) => {
    const { option_id } = req.params;
    db.query("DELETE FROM options WHERE id = ?", [option_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send(message = "Option deleted successfully");
        }
    });
});




module.exports = OptionsRoute;