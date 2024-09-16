const express = require("express");
const db = require("../utils/db");
const ResponseRoute = express.Router();

ResponseRoute.post("/create_response", (req, res) => {
    const answers = req.body.answers;
    for (var i = 0; i < answers.length; i++) {
        const { text, question_id } = answers[i];
        // console.log(typeof(text));
        if (typeof (text) === "object") {
            for (var j = 0; j < text.length; j++) {
                const answer_text = text[j];
                db.query(
                    "INSERT INTO answers (question_id, answer_text) VALUES (?, ?)",
                    [question_id, answer_text],
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
                [question_id, text],
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



module.exports = ResponseRoute