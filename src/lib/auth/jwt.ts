import { SignJWT, jwtVerify } from "jose";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

// JWT 페이로드 타입 (jose JWTPayload 호환)
export interface UserPayload {
    sub: string; // member id
    name: string;
    isAdmin: boolean;
    [key: string]: unknown; // jose JWTPayload 호환을 위한 인덱스 시그니처
}

// 토큰 만료 시간
export const ACCESS_TOKEN_EXPIRY = 1000 * 60 * 15; // 15분
export const REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7; // 7일

// 비밀번호 해시 (SHA-256)
export function hashPassword(password: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(password)));
}

// 비밀번호 검증
export function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// JWT Secret 가져오기
function getSecret(secret: string): Uint8Array {
    return new TextEncoder().encode(secret);
}

// Access Token 생성
export async function createAccessToken(payload: UserPayload, secret: string): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(getSecret(secret));
}

// Refresh Token 생성 (랜덤 문자열)
export function generateRefreshToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return encodeHexLowerCase(bytes);
}

// Refresh Token 해시
export function hashRefreshToken(token: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

// JWT 검증
export async function verifyAccessToken(token: string, secret: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret(secret));
        return {
            sub: payload.sub as string,
            name: payload.name as string,
            isAdmin: payload.isAdmin as boolean,
        };
    } catch {
        return null;
    }
}

// 쿠키 설정
export interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    path: string;
    maxAge?: number;
}

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export function getAccessTokenCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_EXPIRY / 1000,
    };
}

export function getRefreshTokenCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_EXPIRY / 1000,
    };
}
