const redis = require('redis');
const bcrypt = require('bcrypt');

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

async function createUser() {
    try {
        await client.connect();
        
        const email = 'admin@delcarmen.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const userKey = `user:${email}`;
        
        // Store user data in Redis using separate HSET commands
        await Promise.all([
            client.hSet(userKey, 'email', email),
            client.hSet(userKey, 'password', hashedPassword),
            client.hSet(userKey, 'role', 'admin'),
            client.hSet(userKey, 'createdAt', new Date().toISOString())
        ]);
        
        console.log('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await client.quit();
    }
}

createUser(); 