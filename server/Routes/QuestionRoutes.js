const express = require("express");
const db = require("../utils/db");
const QuestionRoute = express.Router();


function getQuestionTypeId(type) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT question_type_id FROM question_types WHERE type_name = ?",
      [type],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.length > 0) {
          const id = result[0].id;
          return resolve(id);
        } else {
          return resolve(-1); // Indicate that the type was not found
        }
      }
    );
  });
}

QuestionRoute.post("/create_question", async (req, res) => {
  const questions = req.body.questions;
    console.log("Questions:", questions);
    // console.log(req.body);

  try {
    for (let i = 0; i < questions.length; i++) {
      const { type , questionText } = questions[i];
        // if (text == "") continue;
        
     
      const id1 = await getQuestionTypeId(type);
      let question_id = -1;
      if (id1 !== -1) {
        await new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO questions ( question_text ,question_type_id, form_id) VALUES (?, ? ,?)",
              [questionText ,id1, req.body.form_id],
              (err, result) => {
                if (err) {
                  return reject(err);
                }
                else {
                    question_id = result.insertId;
                  // console.log("Question created successfully with id:", result.insertId);
                  resolve();
                }
              }
            );
            
        });
      }
      const options = questions[i].options;
      console.log(question_id);
        if (options.length > 0) {
          for (let i = 0; i < options.length; i++) {
            await new Promise((resolve, reject) => {
              db.query(
                "INSERT INTO options ( option_text , question_id) VALUES (?, ?)",
                [options[i], question_id],
                (err, result) => {
                  if (err) {
                    return reject(err);
                  }
                  else {
                    // console.log("Option created successfully with id:", result.insertId);
                    resolve();
                  }
                }
              );
            });
          }
        }


    }
       
    res.send("Questions Created Successfully");
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Error creating questions");
  }
});


module.exports = QuestionRoute;