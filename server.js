const fs = require('fs');

const logEvent = (event) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${event}\n`;

    // Append the log message to a file
    fs.appendFile('user_events.log', logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'China123.', // Replace with your MySQL password
    database: 'user_auth'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Register Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).send('Error registering user');
        }
        // Log the registration event
        logEvent(`User registered: ${username}`);
        res.status(201).send('User registered successfully');
    });
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).send('Error logging in');
        }
        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }
        // Log the login event
        logEvent(`User logged in: ${username}`);
        res.status(200).send('Login successful');
    });
});

// logout event
app.post('/logout', (req, res) => {
    const { username } = req.body; // Assuming you pass the username in the request body

    // Log the logout event
    logEvent(`User logged out: ${username}`);
    res.status(200).send('Logged out successfully');
});

// Serve Static Files
app.use(express.static('public'));

// Logout Route
app.post('/logout', (req, res) => {
    // Clear session or token (example for session-based auth)
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.status(200).send('Logged out successfully');
    });
});

// collect data for user_event.log
const userIp = req.ip;
const userAgent = req.headers['user-agent'];
logEvent(`User registered: ${username}, IP: ${userIp}, User-Agent: ${userAgent}`);

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});