import { axiosInstance } from "../lib/axios";

export const getLiveKitToken = async (roomName: string) => {
    const response = await axiosInstance.post(
        "/livekit/token",
        {
            roomName,
        }
    );

    return response.data.token;
};