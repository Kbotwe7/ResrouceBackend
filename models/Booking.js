const db = require('../db');

class Booking {
    static async create({ user_id, resource_id, start_time, end_time, purpose, status }) {
        const query = `
            INSERT INTO bookings (user_id, resource_id, start_time, end_time, purpose, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [user_id, resource_id, start_time, end_time, purpose, status];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findAll() {
        const query = `
            SELECT b.*, u.username as user_name, r.name as resource_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN resources r ON b.resource_id = r.id
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async findById(id) {
        const query = `
            SELECT b.*, u.username as user_name, r.name as resource_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN resources r ON b.resource_id = r.id
            WHERE b.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByUserId(user_id) {
        const query = `
            SELECT b.*, r.name as resource_name
            FROM bookings b
            JOIN resources r ON b.resource_id = r.id
            WHERE b.user_id = $1
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    static async update(id, updates) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        
        const query = `
            UPDATE bookings
            SET ${setClause}
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id, ...values]);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM bookings WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = Booking; 