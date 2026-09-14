import { createSecretKey } from "crypto"
import "dotenv/config";
import { SignJWT, type JWTPayload } from "jose";

export interface JwtPayload extends JWTPayload {
    id:string,
    fullname:string,
    email:string,
}
export const generateToken=(payload:JwtPayload):Promise<string>=>{
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRE || "7d";
    
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const secretkey=createSecretKey(secret,'utf-8');

    return new SignJWT(payload)
    .setProtectedHeader({alg:'HS256'})
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secretkey);
}