const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
    static async create({ username, password, email, role, student_id, course }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (username, password, email, role, student_id, course)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, username, email, role, student_id, course
        `;
        const values = [username, hashedPassword, email, role, student_id, course];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User; 