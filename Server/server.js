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
const axios = require('axios');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const API_KEY = process.env.ROYAL_MAIL_API_KEY;
const clientSecret = process.env.ROYAL_MAIL_CLIENT_SECRET;
app.use(express.json());


app.post('/track-order', async (req, res) => {
    const { trackingNumber } = req.body;  // Tracking number received from the frontend
  
    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }
  
    try {
      // Make a request to Royal Mail's tracking API
      const response = await axios.get(`https://api.royalmail.net/mailpieces/v2/summary?mailPieceId=${trackingNumber}`, {
        headers: {
          'X-IBM-Client-Id': process.env.API_KEY,          // Your Royal Mail API key
          'X-IBM-Client-Secret': process.env.CLIENT_SECRET, // Your Royal Mail client secret
          'X-Accept-RMG-Terms': 'yes',                     // Accept the Royal Mail terms
          'Accept': 'application/json'                     // Expect a JSON response
        },
      });
  
      // Send the tracking details back to the client
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching Royal Mail tracking data:', error.message);
      
      // Check if there's an error from Royal Mail's API
      if (error.response && error.response.data) {
        res.status(error.response.status).json({ message: error.response.data.moreInformation || 'Error retrieving tracking information' });
      } else {
        res.status(500).json({ message: 'Failed to retrieve tracking information' });
      }
    }
  });
  

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
    const { to, name, phoneModel, estimatedValue } = req.body;

    const subject = 'Confirmation of Your Phone Submission - The UK Phone Fixer';
    const text = `
        Dear ${name},

        Thank you for choosing The UK Phone Fixer to sell your phone. We have successfully received the details of your submission. Here are the details:

        Phone Model: ${phoneModel}
        Estimated Value: £${estimatedValue}

        Our team will review the information provided, and you will receive a follow-up email once your phone has been assessed and the final value confirmed.

        If you have any questions in the meantime, feel free to reply to this email, and our support team will be happy to assist you.

        Kind regards,
        The UK Phone Fixer Team
        Buyback Department
        buyback@theukphonefixer.co.uk
    `;

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


app.post('/submit-details-m', (req, res) => {
    const { name, email, address, phone, devices, accountNumber, sortCode } = req.body;

    // Get a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).send('Database connection error');
        }

        // Start a transaction
        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).send('Transaction initiation error');
            }

            // Insert into Orders table
            const orderQuery = `INSERT INTO Orders (name, email, address, phone, accountnumber, sortcode) VALUES (?, ?, ?, ?, ?, ?)`;
            connection.query(orderQuery, [name, email, address, phone, accountNumber, sortCode], (error, result) => {
                if (error) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error inserting order');
                    });
                }

                const orderId = result.insertId;

                // Insert each device into OrderDevices table
                const deviceQueries = devices.map(device => {
                    return new Promise((resolve, reject) => {
                        const deviceQuery = `INSERT INTO OrderDevices (order_id, phone_model, storage, \`condition\`, estimated_value, serialNumber) VALUES (?, ?, ?, ?, ?, ?)`;
                        connection.query(deviceQuery, [orderId, device.phoneModel, device.storage, device.condition, device.estimatedValue, device.serialNumber], (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });
                });

                // Execute all device queries
                Promise.all(deviceQueries)
                    .then(() => {
                        // Commit transaction if all queries are successful
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send('Transaction commit error');
                                });
                            }

                            connection.release();
                            res.status(201).send('Order submitted successfully with multiple devices');
                        });
                    })
                    .catch(err => {
                        connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Error inserting devices');
                        });
                    });
            });
        });
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

app.post('/estimate-values', (req, res) => {
    const { devices } = req.body;

    // Check if devices are provided
    if (!devices || !Array.isArray(devices)) {
        return res.status(400).json({ error: 'Invalid request, devices must be an array' });
    }

    // Process each device to estimate the value
    const estimatedValues = devices.map(device => {
        const { phoneModel, storage, condition } = device;

        console.log(`Received phoneModel: ${phoneModel}, storage: ${storage}, condition: ${condition}`);

        // Fetch model price using a callback or promise-based function
        let modelPrice = getModelPrice(phoneModel); 
        
        if (modelPrice === null) {
            return { phoneModel, error: `Model ${phoneModel} not found.` };
        }

        let basePrice = parseFloat(modelPrice);

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
                return { phoneModel, error: `Invalid storage option: ${storage}` };
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
                return { phoneModel, error: `Invalid condition: ${condition}` };
        }

        return { phoneModel, estimatedValue: basePrice.toFixed(2) };
    });

    res.json({ estimatedValues });
});




app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
