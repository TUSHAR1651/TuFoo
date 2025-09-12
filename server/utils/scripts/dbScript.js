const cron = require('node-cron'); 
const db = require('../db');


async function pingDB(){
    db.query('SELECT 1', (err, results) => {
        if (err) {
            console.error('Error pinging database:', err);
        }
        else {
            console.log('Database ping successful');
        }
    }
    );
}

cron.schedule("0 18 * * *", pingDB);

