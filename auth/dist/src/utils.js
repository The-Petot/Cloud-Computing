import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { generateSecret, totp } from 'speakeasy';
import QRcode from 'qrcode';
export function getEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}
export function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function isPasswordValid(password) {
    return password.length >= 8;
}
export function isServiceMethodSuccess(result) {
    return result.data !== undefined;
}
export async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        return password;
    }
}
export async function isPasswordMatch(password, hashedPassword) {
    try {
        const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
        return isPasswordMatch;
    } catch (error) {
        console.error('ERR:BCRYPT: Unknown error happen when comparing password', error);
        return false;
    }
}
export async function createSessionId(userId) {
    const sessionId = await bcrypt.hash(`${String(userId)}:${v4()}`, 2);
    return sessionId;
}
export async function generateAccessToken(jwt, userId) {
    const accessToken = await jwt.sign({
        userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60
    });
    return accessToken;
}
export async function generateRefreshToken(jwt, userId) {
    const refreshToken = await jwt.sign({
        userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
    });
    return refreshToken;
}
export function generateTwoFactorSecret() {
    const secret = generateSecret({
        name: 'Mindcraft'
    });
    return secret;
}
export function isGenerateQRCodeSuccess(result) {
    return result.qrCode !== undefined;
}
export async function generateQRCode(url) {
    try {
        const qrCode = await QRcode.toDataURL(url);
        return {
            qrCode
        };
    } catch (error) {
        console.error('ERR:QR: Unable to generate QR code', error);
        return {
            error: `Unable to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
export async function verifyTwoFactorToken(secret, token) {
    const isTokenValid = totp.verify({
        secret,
        encoding: 'base32',
        token
    });
    return isTokenValid;
}
