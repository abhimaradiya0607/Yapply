import bcrypt from "bcrypt";
import "dotenv/config";

const saltRounds = Number(process.env.SALT_ROUNDS);

if (!Number.isInteger(saltRounds) || saltRounds < 1) {
  throw new Error("SALT_ROUNDS must be a positive integer");
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword=async (password:string,hashPassword:string):Promise<boolean> => {
    return bcrypt.compare(password,hashPassword);

}
