import { StreamChat } from "stream-chat";
import "dotenv/config"
import type { User } from "stream-chat";

const apiKey=process.env.STREAM_API_KEY;
const apiSecret=process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    throw new Error("Stream API key or secret is missing");
}

const streamClient=StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUser=async (userData:User):Promise<User>=> {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.log("Error upserting user dataa",error);
        throw error;
        
    }
}

export const generateStreamToken=(userId:string) :string=> {
    try {
        const userIdStr = userId.toString();

        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);

        throw new Error("Failed to generate Stream token");
    }
}