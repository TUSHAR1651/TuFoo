const express = require("express");
const db = require("../utils/db");
const FormRoute = express.Router();

FormRoute.post("/create_form", (req, res) => {
  const { formName, formDescription } = req.body;
  // console.log(req.body);
  // console.log(formName, formDescription);
  db.query(
    "INSERT INTO forms (form_name, description) VALUES (?, ?)",
    [formName, formDescription],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //   console.log(result);
        res.status(200).json({
          message: "Form Created Successfully",
          formId: result.insertId,
        });
      }
    }
  );
});

FormRoute.put(`/update_form/:formId`, (req, res) => {
  const { formName, formDescription } = req.body;
  const formId = req.params.formId;
  console.log("body ", req.params);
  db.query(
    "UPDATE forms SET form_name = ?, description = ? WHERE id = ?",
    [formName, formDescription, formId],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        //   console.log(result);
        res.status(200).json({
          message: "Form Updated Successfully",
        });
      }
    }
  );
});

FormRoute.post("/add_form_to_user", (req, res) => {
  const { form_id, userId } = req.body;
  // console.log(req.body);
  console.log(req.body);
  db.query(
    "INSERT INTO user_forms (user_id, form_id) VALUES (?, ?)",
    [userId, form_id],
    (err, result) => {
      if (err) {
        // console.log(err);
      } else {
        //   console.log(result);
        res.status(200).json({
          message: "Form Added Successfully",
        });
      }
    }
  );
});

FormRoute.get(`/get_forms`, (req, res) => {
  // console.log("hi");
  // console.log(req.query);
  const userId = req.query.id;
  db.query(
    "SELECT * FROM forms left join user_forms on forms.id = user_forms.form_id left join users on users.id = user_forms.user_id where user_id = ? ",
    [userId],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result);
        res.send(result);
      }
    }
  );
});

FormRoute.get(`/get_form_view/:formId`, (req, res) => {
  const formId = req.params.formId;
  db.query("SELECT * FROM forms where id = ?", [formId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) res.send(result);
      else res.send({ message: "Form not found" });
    }
  });
});

FormRoute.get(`/get_form/:formId`, (req, res) => {
  const userId = req.query.userId;
  // const formId = req.query.formId;
  // console.log(req.query);
  // console.log(req.params);
  const formId = req.params.formId;
  console.log(userId);
  db.query(
    "SELECT * FROM forms left join user_forms on forms.id = user_forms.form_id left join users on users.id = user_forms.user_id where user_id = ? and form_id = ?",
    [userId, formId],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log("hi");
        console.log(result);
        if (result.length > 0) {
          res.send(result);
        } else res.send({ message: "Form not found" });
      }
    }
  );
});

FormRoute.delete("/delete_form/:formId", (req, res) => {
  const { formId } = req.params;
  console.log(formId);
  db.query(
    "Delete answers from answers join questions on answers.question_id = questions.id where form_id = ?",
    [formId],
    (err, result) => {
      if (err) {
        console.log("A");
        console.log(err);
      } else {
        db.query(
          "Delete options from options join questions on options.question_id = questions.id where form_id = ?",
          [formId],
          (err, result) => {
            if (err) {
              console.log("A");
              console.log(err);
            } else {
              db.query(
                "Delete questions from questions where form_id = ?",
                [formId],
                (err, result) => {
                  if (err) {
                    console.log("A");
                    console.log(err);
                  } else {
                    db.query(
                      "Delete from user_forms where form_id = ?",
                      [formId],
                      (err, result) => {
                        if (err) {
                          console.log("B");
                          console.log(err);
                        } else {
                          // console.log("C");
                          db.query(
                            "Delete from forms where id = ?",
                            [formId],
                            (err, result) => {
                              if (err) {
                                console.log(err);
                              } else {
                                res.send(
                                  (message = "Form deleted successfully")
                                );
                              }
                            }
                          );
                        }
                      }
                    );
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


FormRoute.put(`/toggle_form_status`, (req, res) => {
  const { formId, newState } = req.body;
  console.log(formId, newState);
  db.query(
    "UPDATE forms SET form_open = ? WHERE id = ?",
    [newState, formId],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

module.exports = FormRoute;
