const express = require('express')
const app = express()
const cors = require("cors")
const dotenv = require("dotenv")
const mysql = require("mysql2")

dotenv.config();
const port = process.env.PORT || 5000;

/// PHONE DATABASE
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });



  app.get('/phones', (req, res) => {
    pool.query('SELECT * FROM Phone', (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Database error');
        return;
      }
      res.json(results);
    });
  });

  process.on('SIGINT', () => {
    pool.end((err) => {
      if (err) {
        console.error('Error closing the database connection:', err);
      } else {
        console.log('Database connection closed.');
      }
      process.exit(err ? 1 : 0);
    });
  });


  app.get('/phone/:id/baseprice', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT baseprice FROM Phone WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Database error');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('Phone not found');
        return;
      }
      res.json(results[0]);
    });
  });

  /////////
app.use(cors());
app.use(express.json());

/// Encryption

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex")
const IV_LENGTH = 16;

function encrypt(text){
    let iv = crypto.randomBytes(IV_LENGT);
    let cipher = crypto.createCipherIV("aes-2560cbc", ENCRYPTION_KEY, iv)
    let encrypted = cipher.update(text);
}

app.post('/submit-details', (req, res) => {
    const { name, email, address, phone, phoneModel, storage, condition, estimatedValue,serialNumber } = req.body;
  
    const query = `
      INSERT INTO UserDetails (name, email, address, phone, phone_model, storage, \`condition\`, estimated_value,serialNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    pool.query(query, [name, email, address, phone, phoneModel, storage, condition, estimatedValue,serialNumber], (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).send('Database error');
        return;
      }
      res.status(201).send('Details submitted successfully');
    });
  });

app.post('/estimate-value',(req,res) =>{
    const {model, storage,condition} = req.body;

    
    let basePrice = 100;

    switch (storage){
        case '64GB':
            basePrice = basePrice
            break;
        case '128GB':
            basePrice = basePrice += 50
            break;
        case '256GB':
            basePrice = basePrice += 100
            break;
        case '512GB':
            basePrice = basePrice += 150
            break;
    }

    switch (condition){
        case 'poor':
            basePrice = basePrice
            break;
        case 'fair':
            basePrice  *=1.05
            break;
        case 'good':
            basePrice *=1.1
            break;
        case 'excellent':
            basePrice  *=1.2
            break;
        }

            

    res.json({ estimatedValue: basePrice.toFixed(2)}
    );
})


// })
app.listen(5000, () => {
    console.log(`Server started on http://localhost:${port}`)
})