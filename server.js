const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const RESOURCES_FILE = path.join(DATA_DIR, 'resources.json');

// Ensure data directory exists
async function ensureDataDirectory() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const files = [USERS_FILE, BOOKINGS_FILE, RESOURCES_FILE];
        for (const file of files) {
            try {
                await fs.access(file);
            } catch {
                await fs.writeFile(file, '[]');
            }
        }
    } catch (error) {
        console.error('Error setting up data directory:', error);
    }
}

// ─────── Routes ───────

// User Registration
app.post('/api/users/register', async (req, res) => {
    try {
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const newUser = {
            id: Date.now(),
            ...req.body,
            role: 'student'
        };
        users.push(newUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        res.json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// User Login
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get All Resources
app.get('/api/resources', async (req, res) => {
    try {
        const resources = JSON.parse(await fs.readFile(RESOURCES_FILE, 'utf8'));
        res.json({ success: true, resources });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create New Booking
app.post('/api/bookings', async (req, res) => {
    try {
        const bookings = JSON.parse(await fs.readFile(BOOKINGS_FILE, 'utf8'));
        const newBooking = {
            id: Date.now(),
            ...req.body,
            status: 'Pending'
        };
        bookings.push(newBooking);
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        res.json({ success: true, booking: newBooking });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Bookings for a User
app.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const bookings = JSON.parse(await fs.readFile(BOOKINGS_FILE, 'utf8'));
        const userBookings = bookings.filter(b => b.user_id === parseInt(req.params.userId));
        res.json({ success: true, bookings: userBookings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Booking Status
app.put('/api/bookings/:id', async (req, res) => {
    try {
        const bookings = JSON.parse(await fs.readFile(BOOKINGS_FILE, 'utf8'));
        const index = bookings.findIndex(b => b.id === parseInt(req.params.id));
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...req.body };
            await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
            res.json({ success: true, booking: bookings[index] });
        } else {
            res.status(404).json({ success: false, error: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve frontend
// app.use(express.static(path.join(__dirname, '../frontend')));

// // Catch-all for SPA routing
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// Start Server
async function startServer() {
    await ensureDataDirectory();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
