const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());




const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other email services
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: 'Buyback@theukphonefixer.co.uk', 
        pass: process.env.EMAIL_PASSWORD   
    }
});


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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

app.use(session({
    secret: `${process.env.SECRECTKEY}`, 
    resave: false,                
    saveUninitialized: true,     
    ///cookie: { secure: false }     
  }));

const USERNAME = process.env.ADMINUSERNAME;
const PASSWORD_HASH = process.env.PASSWORD_HASH;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
 

///////// MAILING


app.post('/send-email', (req, res) => {
    const { to, subject, text } = req.body;

    const mailOptions = {
        from: 'Buyback@theukphonefixer.co.uk',
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent');
        }
    });
});





app.use('/phones', express.static(path.join(__dirname, 'public/phones')));

app.post('/adminlogin', (req, res) => {
    const { username, password } = req.body;
    
    if (username === USERNAME && bcrypt.compareSync(password, PASSWORD_HASH)) {
        req.session.user = username; 

        // Generate JWT token
        const accessToken = jwt.sign(
          { username: username, role: 'admin' }, 
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' } 
        );
    
        res.json({ success: true, accessToken }); 
      } else {
        res.status(401).json({ success: false, message: 'Authentication failed' });
      }
  });

  function isAuthenticated(req, res, next) {
    if (req.session.user === USERNAME) {
      return next();
    } else {
      res.status(403).json({ message: 'Unauthorized' });
    }
  }

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);
    
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); 
      req.user = user;
      next();
    });
  };
  

  app.get('/adminpage', isAuthenticated, (req, res) => {
    res.json({ message: 'Welcome to the admin interface' });
  });
  


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
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

app.get('/users',authenticateToken, (req, res) => {
    pool.query('SELECT * FROM userDetails', (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
            return;
        }
        res.json(results);
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

app.put('/phones/:id', authenticateToken, (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const { price } = req.body;

    if (!price || isNaN(price)) {
        return res.status(400).json({ message: 'Invalid price' });
    }

    // Update the price in the database
    const query = 'UPDATE Phone SET price = ? WHERE id = ?';
    pool.query(query, [price, productId], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Product not found');
            return;
        }
        res.json({ success: true, message: 'Price updated successfully' });
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

/// Encryption

// const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
// const IV_LENGTH = 16;

// function encrypt(text) {
//     let iv = crypto.randomBytes(IV_LENGTH);
//     let cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
//     let encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
//     return iv.toString('hex') + ':' + encrypted.toString('hex');
// }

app.post('/submit-details', (req, res) => {
    const { name, email, address, phone, phoneModel, storage, condition, estimatedValue, serialNumber, accountNumber, sortCode } = req.body;

    const query = `
        INSERT INTO UserDetails (name, email, address, phone, phone_model, storage, \`condition\`, estimated_value, serialNumber, accountnumber, sortcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(query, [name, email, address, phone, phoneModel, storage, condition, estimatedValue, serialNumber, accountNumber, sortCode], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
            return;
        }
        res.status(201).send('Details submitted successfully');
    });
});




function getModelPrice(modelName, callback) {
    pool.query('SELECT price FROM Phone WHERE model = ?', [modelName], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return callback(new Error('Database query error'));
        }
        
        if (results.length > 0) {
            return callback(null, results[0].price);
        } else {
            console.warn(`No price found for model: ${modelName}`);
            return callback(null, null);  // Returning null if no price is found
        }
    });
}

app.post('/estimate-value', (req, res) => {
    const { phoneModel, storage, condition } = req.body;

    console.log(`Received phoneModel: ${phoneModel}, storage: ${storage}, condition: ${condition}`);

    getModelPrice(phoneModel, (err, price) => {
        if (err) {
            console.error('Error fetching model price:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (price === null) {
            return res.status(404).json({ error: `Model ${phoneModel} not found.` });
        }

        let basePrice = parseFloat(price);

        // Adjust price based on storage
        switch (storage) {
            case '64GB':
                break;
            case '128GB':
                basePrice += 50;
                break;
            case '256GB':
                basePrice += 100;
                break;
            case '512GB':
                basePrice += 150;
                break;
            default:
                console.error(`Unknown storage option: ${storage}`);
                return res.status(400).json({ error: 'Invalid storage option' });
        }

        // Adjust price based on condition
        switch (condition) {
            case 'poor':
                break;
            case 'fair':
                basePrice *= 1.05;
                break;
            case 'good':
                basePrice *= 1.1;
                break;
            case 'excellent':
                basePrice *= 1.2;
                break;
            default:
                console.error(`Unknown condition: ${condition}`);
                return res.status(400).json({ error: 'Invalid condition' });
        }

        res.json({ estimatedValue: basePrice.toFixed(2) });
    });
});


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
