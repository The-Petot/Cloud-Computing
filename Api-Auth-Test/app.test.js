const request = require('supertest');

// URL Base API
const BASE_URL = 'https://auth-service-682643479451.asia-southeast2.run.app';

describe('Authentication Service API Tests', () => {
    // Variabel global
    const email = 'marines@example.com';
    const password = 'Marine123//';
    const firstName = 'this';
    const lastName = 'marine';
    let userId;
    let accessToken;
    let refreshToken;
    let sessionId;

    // Test untuk /register
    it('POST /register - should register a new user successfully', async () => {
        const response = await request(BASE_URL)
            .post('/register')
            .send({
                email,
                password,
                firstName,
                lastName,
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('data.userId');
        expect(response.body).toHaveProperty('message', 'User registered successfully');

        // Simpan userId dari respons
        userId = response.body.data.userId;
        console.log('Registered userId:', userId);
    });

    // Test untuk /login
    it('POST /login - should authenticate the user successfully', async () => {
        const response = await request(BASE_URL)
            .post('/login')
            .send({
                email,
                password,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data.userId');
        expect(response.body).toHaveProperty('message', 'User logged in successfully');

        // Simpan token dan session ID dari respons
        accessToken = response.headers.authorization;
        refreshToken = response.headers['x-refresh-token'];
        sessionId = response.headers['x-session-id'];

        // Log untuk memeriksa nilai header yang diterima
        console.log('Login Response Headers:', response.headers);
        console.log('accessToken:', accessToken);
        console.log('refreshToken:', refreshToken);
        console.log('sessionId:', sessionId);
    });

    // Test untuk /refresh
    it('POST /refresh - should refresh tokens successfully', async () => {
        const response = await request(BASE_URL)
            .post('/refresh')
            .set('X-Refresh-Token', refreshToken)
            .set('X-Session-Id', sessionId)
            .send({ userId });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
        expect(response.headers).toHaveProperty('authorization');
        expect(response.headers).toHaveProperty('x-refresh-token');
        expect(response.headers).toHaveProperty('x-session-id');

        // Perbarui token
        accessToken = response.headers.authorization;
        refreshToken = response.headers['x-refresh-token'];
        sessionId = response.headers['x-session-id'];

        // Log untuk memeriksa respons refresh token
        console.log('Refresh Response Headers:', response.headers);
        console.log('Updated accessToken:', accessToken);
        console.log('Updated refreshToken:', refreshToken);
        console.log('Updated sessionId:', sessionId);
    });

    // Test untuk /enable-2fa
    it('PUT /enable-2fa - should enable two-factor authentication successfully', async () => {
        const response = await request(BASE_URL)
            .put('/enable-2fa')
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken)
            .set('X-Session-Id', sessionId)
            .send({ userId });
    
        console.log('Enable 2FA Response:', response.status, response.body); 
    
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Two factor auth enabled successfully');
        expect(response.body).toHaveProperty('data.qrCode');
    });
    
    // Test untuk /disable-2fa
    it('PUT /disable-2fa - should disable two-factor authentication successfully', async () => {
        const response = await request(BASE_URL)
            .put('/disable-2fa')
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken)
            .set('X-Session-Id', sessionId)
            .send({ userId });

        console.log('Disable 2FA Response:', response.status, response.body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Two factor auth disabled successfully');
    });

    // Test validasi gagal untuk /enable-2fa tanpa Authorization header
    it('PUT /enable-2fa - should fail without Authorization header', async () => {
        const response = await request(BASE_URL)
            .put('/enable-2fa')
            .set('X-Refresh-Token', refreshToken)
            .set('X-Session-Id', sessionId)
            .send({ userId });
    
        console.log('Enable 2FA Error Response:', response.status, response.body);
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    // Test untuk /logout
    it('POST /logout - should log out the user successfully', async () => {
        const response = await request(BASE_URL)
            .post('/logout')
            .set('Authorization', accessToken)
            .set('X-Session-Id', sessionId)
            .set('X-Refresh-Token', refreshToken)
            .send({ userId });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User logged out successfully');

        // Log untuk memeriksa status logout
        console.log('Logout Response:', response.body);
    });
    
    // Test validasi gagal untuk login
    it('POST /login - should fail with wrong password', async () => {
        const response = await request(BASE_URL)
            .post('/login')
            .send({
                email,
                password: 'WrongPassword123', 
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Wrong password');
    });
});
