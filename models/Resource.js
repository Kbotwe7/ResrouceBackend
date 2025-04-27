const db = require('../db');

class Resource {
    static async create({ name, category, description, status, location, capacity, image_url }) {
        const query = `
            INSERT INTO resources (name, category, description, status, location, capacity, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [name, category, description, status, location, capacity, image_url];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findAll() {
        const query = 'SELECT * FROM resources';
        const result = await db.query(query);
        return result.rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM resources WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, updates) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        
        const query = `
            UPDATE resources
            SET ${setClause}
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id, ...values]);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM resources WHERE id = $1 RETURNING *';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = Resource; 