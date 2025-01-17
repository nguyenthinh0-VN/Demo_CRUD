const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db.js');

const app = express();
const port = 3010;
const saltRounds = 11;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key', // Replace with a real secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/register', async (req, res) => {
    const { username, password, confirm_password, email } = req.body;

    if (!username || !password || !confirm_password || !email) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    try {
        const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists.' });
        }

        const [existingEmails] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingEmails.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
        res.status(201).json({ success: true, message: 'Registration successful.' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: 'An error occurred during registration.' });
    }
});
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        req.session.user = { id: user.id, username: user.username, role: user.role };

        //req.session.user = { id: user.id, username: user.username };
        res.json({ success: true, message: 'Login successful.' });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ success: false, message: 'Unable to log out.' });
        }
        res.json({ success: true, message: 'Logout successful.' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username , role: req.session.user.role});
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/api/change-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'You must be logged in to change your password.' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please fill in all password fields.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [req.session.user.username]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found.' });
        }
        const user = users[0];
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid current password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await db.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, req.session.user.username]);
        req.session.destroy(err => {
            if (err) {
                console.error("Change password error: ", err);
                return res.status(500).json({success: false, message: "Failed to update password and logout."})
            }
            res.json({ success: true, message: 'Password changed successfully.' });
        })

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: 'An error occurred while changing password.' });
    }
});

app.get('/api/users', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập trang này.' });
    }

    try {
        const [users] = await db.query('SELECT username, email, role FROM users');
        res.json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});