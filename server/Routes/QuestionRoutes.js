const express = require("express");
const db = require("../utils/db");
const QuestionRoute = express.Router();


function getQuestionTypeId(type) {
  // console.log(type);
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id FROM question_types WHERE type_name = ?",
      [type],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.length > 0) {
          // console.log(result[0]);
          const id = result[0].id;
          return resolve(id);
        } else {
          return resolve(-1); 
        }
      }
    );
  });
}
QuestionRoute.get("/get_questions", (req, res) => {
  // console.log(req.query);
  const form_id = req.query.form_id;
  // console.log(form_id);
  db.query("SELECT questions.id , question_text , type_name , question_type_id , form_id , required FROM questions left join question_types on questions.question_type_id = question_types.id WHERE form_id = ?" , [form_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      // console.log("questions" , result);
      res.send(result);
    }
  });
});


QuestionRoute.post("/create_question", async (req, res) => {
  const questions = req.body.questions;
    // console.log("Questions:", questions);
    // console.log(req.body);

  try {
    for (let i = 0; i < questions.length; i++) {
      const { type , questionText , isOn } = questions[i];
        // if (text == "") continue;
        
      // console.log(type);
      const id1 = await getQuestionTypeId(type);
      // console.log("Question Type Id:", id1);
      let question_id = -1;
      if (id1 !== -1) {
        // console.log(id1);
        await new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO questions ( question_text ,question_type_id, form_id , required) VALUES (?, ? ,?, ?)",
              [questionText ,id1, req.body.form_id , isOn],
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
      // console.log(question_id);
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


QuestionRoute.put("/update_question/:form_id", async (req, res) => {
  const questions = req.body.questions;
  const { form_id } = req.params;
  // console.log(req.body);
  // console.log("uodate" , questions);
  // console.log(questions);
  for (let i = 0; i < questions.length; i++) {
    // console.log("Hi");
    const { type, questionText, options } = questions[i];
    var question_id = questions[i].question_id;
    const id = await getQuestionTypeId(type);
    // console.log(id);
    // console.log(questions[i]);
    if (question_id) {
      await new Promise((resolve, reject) => {
      db.query(
        "UPDATE questions SET question_text = ?, question_type_id = ? , required = ? WHERE id = ?",
        [questionText, id, questions[i].isOn, question_id],
        (err, result) => {
          if (err) {
            console.log(err);
          }else{
            resolve();
          }
        }
      );
      
    });
    } else {
      await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO questions ( question_text ,question_type_id, required, form_id) VALUES (?, ? ,? , ?)",
        [questionText, id, questions[i].isOn, form_id],
        (err, result) => {
          if (err) {
            console.log(err);
          }
          else {
            resolve();
            // console.log("result",result);
            question_id = result.insertId;
          }
        }
      );
      
    });
    }
    // console.log("id" , question_id);
    if (options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        if(options[i].option_id) {
          db.query(
            "UPDATE options SET option_text = ? WHERE id = ?",
            [options[i].option_text, options[i].option_id],
            (err, result) => {
              if (err) {
                console.log(err);
              }
            }
          );
        }
        else {
          db.query(
            "INSERT INTO options ( option_text , question_id) VALUES (?, ?)",
            [options[i].option_text, question_id],
            (err, result) => {
              if (err) {
                console.log(err);
              }
            }
          );
        }
      }
    }
  }

  res.send("Questions Updated Successfully");
});

QuestionRoute.delete("/delete_question/:question_id", (req, res) => {
  const { question_id } = req.params;
  // console.log("question_id", question_id);
  
  db.query(
    "DELETE FROM options WHERE question_id = ?",
    [question_id],
    (err, result) => {
      if (err) {
        // console.log("hi");
        console.log(err);
      } else {
        db.query(
          "DELETE FROM answers WHERE question_id = ?",
          [question_id],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            else {
              db.query(
                "DELETE FROM questions WHERE id = ?",
                [question_id],
                (err, result) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.status(200).send(message = "Question deleted successfully");
                  }
                }
              );
            }
          }
        );
      }
    }
  );
  
});
QuestionRoute.delete(`/delete_questions/:form_id`, (req, res) => {
  const questions = req.body;
  const { question_id } = req.body;
  db.query("DELETE FROM questions WHERE form_id = ?", [form_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(message = "Questions deleted successfully");
    }
  });
});

module.exports = QuestionRoute;