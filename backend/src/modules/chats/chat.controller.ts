import type { Request, Response } from "express";
import { generateStreamToken } from "../../utils/stream.js";


export const getStreamToken=async (req:Request,res:Response) => {
    try {
        const token=generateStreamToken(req.user!.id);

        res.status(200).json({token});
    } catch (error) {
        console.log("Error in generating Stream Token",error);
        res.status(500).json({message:"Internal Server Error"});
    }
}