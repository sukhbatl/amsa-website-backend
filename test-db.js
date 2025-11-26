import mysql from 'mysql2/promise';

const config = {
    host: '164.92.104.38',
    user: 'amsamn_website_admin',
    password: 'AmsaIT2019db$Password',
    database: 'amsamn_website_db',
    port: 3306
};

console.log('Attempting to connect with:', config);

try {
    const connection = await mysql.createConnection(config);
    console.log('Successfully connected!');
    await connection.end();
} catch (error) {
    console.error('Connection failed:', error);
}
