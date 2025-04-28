const express = require("express");
const db = require("../utils/db");
const ResponseRoute = express.Router();

ResponseRoute.post("/create_response", (req, res) => {
    const answers = req.body.answers;
    for (var i = 0; i < answers.length; i++) {
        const { text, questionId } = answers[i];
        if (typeof (text) === "object") {
            for (var j = 0; j < text.length; j++) {
                const answer_text = text[j];
                db.query(
                    "INSERT INTO answers (question_id, answer_text) VALUES (?, ?)",
                    [questionId, answer_text],
                    (err, result) => {
                        if (err) {
                            return res.status(500).send({ err: err });
                        }
                    }
                );
            }
        }
        else {
            db.query(
                "INSERT INTO answers (question_id, answer_text) VALUES (?, ?)",
                [questionId, text],
                (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    }

    res.send(message = "Response created successfully");
})

ResponseRoute.get("/get_responses", (req, res) => {
    const question_id = req.query.question_id;
    db.query("SELECT * FROM answers WHERE question_id = ?", [question_id], (err, result) => {
        if (err) {
            res.status(500).send({ err: err });
        } else {
            res.send(result);
        }
    });
})

module.exports = ResponseRoute