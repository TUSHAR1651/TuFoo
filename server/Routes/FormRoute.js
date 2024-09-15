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
          formId : result.insertId
        });
      }
    }
  );

});

FormRoute.post("/add_form_to_user", (req, res) => {
  const { form_id, userId } = req.body;
  console.log(req.body);
  console.log(form_id, userId);
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
  console.log("hi");
  console.log(req.query);
  const userId = req.query.userId;
  db.query("SELECT * FROM forms left join user_forms using(form_id) left join users using(user_id) where user_id = ? " , [userId] , (err, result) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(result);
      res.send(result);
    }
  });
});

FormRoute.get(`/get_form/:formId`, (req, res) => {
  const userId = req.query.userId;
  // const formId = req.query.formId;
  // console.log(req.query);
  // console.log(req.params);
  const formId = req.params.formId;
  
  db.query("SELECT * FROM forms left join user_forms using(form_id) left join users using(user_id) where user_id = ? and form_id = ?" , [userId , formId] , (err, result) => {
    if (err) {
      console.log(err);
    } else {
      // console.log("hi");
      // console.log(result);
      if(result.length > 0){
        res.send(result);
      }
      else res.send({message : "Form not found"});
    }
  });

  

});


module.exports = FormRoute;
