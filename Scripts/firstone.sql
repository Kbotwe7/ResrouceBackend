-- CREATE TABLE IF NOT EXISTS bookings (
--     id SERIAL PRIMARY KEY,
--     student_name VARCHAR(100),
--     student_email VARCHAR(100),
--     resource_type VARCHAR(50),
--     booking_date DATE,
--     booking_time TIME,
--     duration INT
-- );


-- To check for all the tables in the database
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

