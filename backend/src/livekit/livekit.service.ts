import { AccessToken } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API credentials are missing");
}

export const createLiveKitToken = async (
    identity: string,
    roomName: string,
    displayName: string,
) => {
    const token = new AccessToken(apiKey, apiSecret, {
        identity,
        name: displayName,
    });

    token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });

    return await token.toJwt();
};

