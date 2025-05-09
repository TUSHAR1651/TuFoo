const express = require("express");
const db = require("../utils/db");
const ResponseRoute = express.Router();
const auth = require("../utils/gAuth");
const google = require("googleapis").google;

ResponseRoute.post("/create_response", (req, res) => {
    const answers = req.body.answers;
    const formId = req.body.formId;
    const userId = req.body.userId;
    for (var i = 0; i < answers.length; i++) {
        const { text, questionId } = answers[i];
        if (typeof (text) === "object") {
            for (var j = 0; j < text.length; j++) {
                const answer_text = text[j];
                db.query(
                    "INSERT INTO answers (question_id, answer_text, form_id, user_id) VALUES (?, ?, ?, ?)",
                    [questionId, answer_text, formId, userId],
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
                "INSERT INTO answers (question_id, answer_text, form_id, user_id) VALUES (?, ?, ?, ?)",
                [questionId, text, formId, userId],
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

ResponseRoute.post("/create_sheet", async (req, res) => {

    const formId = req.query.formId;
    try{
        const result = db.query("SELECT * , answers.created_at as answer_created_at FROM answers join forms on forms.id = answers.form_id join questions on questions.id = answers.question_id where answers.form_id = ?", [formId], async (err, result) => {

            if (err) {
                return res.status(500).send({ err: err });
            }
            if(result.length > 0) {
                const formName = result[0].form_name;
                const sheetId = await createSheetForForm(formName);
                await overwriteSheetData(sheetId, result);
                await makeSheetPublic(sheetId);
                res.send({ message: "Sheet created and made public successfully." , sheetId: sheetId });
            }
            else {
                res.status(404).send({ message: "No responses found for the given form ID." });
            }
        });
    }
    catch(error){
        res.status(500).send({ err: error });
    }
});

  async function createSheetForForm(formName) {
    const sheets = google.sheets({ version: 'v4', auth });
  
    const response = await sheets.spreadsheets.create({
      resource: {
        properties: { title: formName },
      },
    });
  
    return response.data.spreadsheetId;
  }

  
  async function overwriteSheetData(sheetId, dbData) {
    const sheets = google.sheets({ version: 'v4', auth });
  
    try {
      const questionMap = new Map(); 
      dbData.forEach(row => {
        if (!questionMap.has(row.question_id)) {
          questionMap.set(row.question_id, row.question_text);
        }
      });
  
      const questionIds = Array.from(questionMap.keys()); 
      const questionTexts = Array.from(questionMap.values()); 
  

      const responseMap = new Map();
  
      dbData.forEach(row => {
        let createdAt = row.answer_created_at;
        createdAt = createdAt.toISOString();
        if (!responseMap.has(createdAt)) {
          responseMap.set(createdAt, new Map());
        }
        
        const userAnswers = responseMap.get(createdAt);
  
        if (!userAnswers.has(row.question_id)) {
          userAnswers.set(row.question_id, []);
        }
        userAnswers.get(row.question_id).push(row.answer_text);
      });

      const sheetData = [];
  

      sheetData.push([...questionTexts]);
  

      responseMap.forEach((userAnswers) => {
        const row = [];
        for (const qId of questionIds) {
          const answers = userAnswers.get(qId);
          if (answers) {
            row.push(answers.join(", "));
          } else {
            row.push("");
          }
        }
        sheetData.push(row);
      });
  
  

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1', 
        valueInputOption: 'RAW',
        requestBody: {
          values: sheetData,
        },
      });
  

    } catch (error) {
      res.status(500).send({ error: 'Error updating sheet data' });
    }
  }
  
  
  const drive = google.drive({ version: 'v3', auth });

  async function makeSheetPublic(sheetId) {
    await drive.permissions.create({
      fileId: sheetId,
      requestBody: {
        role: 'reader',             
        type: 'anyone',             
      },
    });
  
  }
module.exports = ResponseRoute