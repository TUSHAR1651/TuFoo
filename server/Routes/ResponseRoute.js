const express = require("express");
const db = require("../utils/db");
const ResponseRoute = express.Router();

ResponseRoute.post("/create_response", (req, res) => {
    const answers = req.body.answers;
    console.log(answers);
    for (var i = 0; i < answers.length; i++) {
        const { text, questionId } = answers[i];
        console.log("Question-Id", questionId);
        console.log(typeof(text));
        if (typeof (text) === "object") {
            for (var j = 0; j < text.length; j++) {
                const answer_text = text[j];
                db.query(
                    "INSERT INTO answers (question_id, answer_text) VALUES (?, ?)",
                    [questionId, answer_text],
                    (err, result) => {
                        if (err) {
                            console.log(err);
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
    console.log("Query" , req.query);
    db.query("SELECT * FROM answers WHERE question_id = ?", [question_id], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
})

module.exports = ResponseRoute