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
    queueLimit: 0,
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


app.delete("/phones/:id", (req, res) => {
    const phoneId = req.params.id; 

    const query = 'DELETE FROM phone WHERE id = ?';
    
    pool.query(query, [phoneId], (error, result) => {
        if (error) {
            console.error('Error deleting phone:', error);
            return res.status(500).send('Error deleting phone');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Phone not found');
        }

        res.send('Phone deleted successfully');
    });
});


app.post("/addPhone", async(req, res) => {
    const { brand, model, price, year } = req.body;
    const imageUrl = 'iPhone-11.png'; // Hardcoded image URL
  
    if (!brand || !model || !price || !year) {
      return res.status(400).json({ message: 'Brand, model, price, and year are required' });
    }
  
    const query = 'INSERT INTO phone (brand, model, price, release_year, url) VALUES (?, ?, ?, ?, ?)';
    pool.query(query, [brand, model, price, year, imageUrl], (error, result) => {
      if (error) {
        console.error('Error adding phone:', error);
        return res.status(500).json({ message: 'Database error' });
      }
  
      res.status(201).json({ message: 'Phone added successfully', phoneId: result.insertId });
    });
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

const retryQuery = (queryFunc, retries = 3) => {
    return new Promise((resolve, reject) => {
        const attemptQuery = (retriesLeft) => {
            queryFunc((err, result) => {
                if (err && retriesLeft > 0) {
                    console.warn(`Retrying... ${retriesLeft} attempts left`);
                    return attemptQuery(retriesLeft - 1);
                }
                if (err) return reject(err);
                resolve(result);
            });
        };
        attemptQuery(retries);
    });
};


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



///////////////// ORDER TRACKING

function generateOrderNumber(userId) {
    const timestamp = Date.now(); // Get current timestamp
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Generate random 4-digit number
    return `ORD-${userId}-${randomNum}-${timestamp}`;
  }

  app.post('/create-order', (req, res) => {
    const { userId, devices, shipmentProvider } = req.body;
  
    const orderNumber = generateOrderNumber(userId); // Generate unique order number
  
    // Insert new order with order number
    const query = `INSERT INTO orders (user_id, order_number, order_status, shipment_provider, created_at) VALUES (?, ?, 'Processing', ?, NOW())`;
    connection.query(query, [userId, orderNumber, shipmentProvider], (error, result) => {
      if (error) throw error;
  
      const orderId = result.insertId;
  
      // Link devices to the order
      const deviceQuery = `UPDATE devices SET order_id = ? WHERE device_id IN (?)`;
      connection.query(deviceQuery, [orderId, devices], (deviceError) => {
        if (deviceError) throw deviceError;
        res.send({ success: true, orderNumber });
      });
    });
  });





  app.get('/track-order/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;  // Destructure the order number
  
    // Query to fetch the order details based on the order number
    const query = `SELECT * FROM orders WHERE order_number = ?`;
  
    // Execute the query
    pool.query(query, [orderNumber], (error, results) => {
        if (error) {
            console.error('Error fetching order:', error);
            return res.status(500).send({ message: 'Server error' });
        }
  
        if (results.length === 0) {
            return res.status(404).send({ message: 'Order not found' });
        }
        const order = results[0];

        // Add progress logic based on order status or other factors
        let progress = 0;

        let progressColor = 'bg-warning';

        if (order.order_status === 'Processing') {
            progress =25;
        } else if (order.order_status === 'Awaiting Delivery') {
            progress = 50;
            progressColor = 'bg-info';
        } else if (order.order_status === 'Inspecting Device') {
            progress = 75;
            progressColor = 'bg-info';
        }
         else if (order.order_status === 'Awaiting Payment') {
            progress = 100;
            progressColor = 'bg-success';
        }
  
        // Send the found order details
        res.json({
            order_status: order.order_status,
            progress,
            progressColor,
        });
    });
});



app.get('/users-with-devices', (req, res) => {
    const query = `
        SELECT u.*, d.phone_model, d.storage, d.device_condition, d.estimated_value, d.serial_number, o.order_status, o.order_number
        FROM users u
        LEFT JOIN devices d ON u.id = d.user_id
        LEFT JOIN orders o ON u.id = o.user_id
    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users, devices, and orders:', err);
            return res.status(500).send('Database error');
        }

        // Group results by user
        const users = {};
        results.forEach(row => {
            if (!users[row.id]) {
                users[row.id] = {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    address: row.address,
                    phone: row.phone,
                    account_number: row.account_number,
                    sort_code: row.sort_code,
                    order_status: row.order_status, // Add order status
                    devices: []
                };
            }
            users[row.id].devices.push({
                phone_model: row.phone_model,
                storage: row.storage,
                device_condition: row.device_condition,
                estimated_value: row.estimated_value,
                serial_number: row.serial_number
            });
        });

        res.json(Object.values(users));
    });
});


app.post('/update-status/:userId', (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    const query = 'UPDATE orders SET order_status = ? WHERE user_id = ?';

    pool.query(query, [status, userId], (err, result) => {
        if (err) {
            console.error('Error updating status:', err);
            return res.status(500).send('Database error');
        }

        res.json({ success: true });
    });
});


app.post('/submit-details', (req, res) => {
    const { name, email, address, phone, phoneModel, storage, condition, estimatedValue, serialNumber, accountNumber, sortCode } = req.body;

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).send('Database connection error');
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                connection.release();
                return res.status(500).send('Transaction error');
            }

            const userQuery = `
                INSERT INTO users (name, email, address, phone, account_number, sort_code)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            connection.query(userQuery, [name, email, address, phone, accountNumber, sortCode], (error, results) => {
                if (error) {
                    console.error('Error inserting user:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Database error while inserting user');
                    });
                }

                const userId = results.insertId;  // Get the inserted user ID


                const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

                const orderQuery = `
                    INSERT INTO orders (user_id, order_number, order_status)
                    VALUES (?, ?, ?)
                `;

                connection.query(orderQuery, [userId, orderNumber, 'Processing'], (orderError, orderResult) => {
                    if (orderError) {
                        console.error('Error inserting order:', orderError);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Database error while inserting order');
                        });
                    }

                    const orderId = orderResult.insertId; // Get the inserted order ID

                    const deviceQuery = `
                        INSERT INTO devices (user_id, phone_model, storage, device_condition, estimated_value, serial_number)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    connection.query(deviceQuery, [userId, phoneModel, storage, condition, estimatedValue, serialNumber], (deviceError, deviceResult) => {
                        if (deviceError) {
                            console.error('Error inserting device:', deviceError);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Error inserting device, transaction rolled back');
                            });
                        }

                        // Commit the transaction if everything is successful
                        connection.commit((commitError) => {
                            if (commitError) {
                                console.error('Error committing transaction:', commitError);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).send('Commit error, transaction rolled back');
                                });
                            }

                            connection.release();
                            res.status(201).json({ order_number: orderNumber, message: 'Order submitted successfully with the device' });
                        });
                    });
                });
            });
        });
    });
});


app.post('/submit-details-m', (req, res) => {
    const { name, email, address, phone, devices, accountNumber, sortCode } = req.body;

    const orderQuery = `
        INSERT INTO users (name, email, address, phone, account_number, sort_code)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    pool.query(orderQuery, [name, email, address, phone, accountNumber, sortCode], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.status(500).send('Database error');
            return;
        }

        const orderId = results.insertId;

        // Insert each device into device table
        const deviceQueries = devices.map(device => {
            const deviceQuery = `
                INSERT INTO devices (user_id, phone_model, storage, device_condition, estimated_value, serial_number)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            return new Promise((resolve, reject) => {
                pool.query(deviceQuery, [orderId, device.model, device.storage, device.condition, device.estimatedValue, device.serialNumber], (deviceError, deviceResult) => {
                    if (deviceError) return reject(deviceError);
                    resolve(deviceResult);
                });
            });
        });

        // Execute all device queries
        Promise.all(deviceQueries)
            .then(() => {
                res.status(201).send('Order submitted successfully with multiple devices');
            })
            .catch(deviceError => {
                console.error('Error inserting devices:', deviceError);
                res.status(500).send('Error inserting devices');
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
            retryQuery();
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
            case '1TB':
                basePrice += 200;
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
