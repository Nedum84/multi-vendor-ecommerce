import bcrypt from "bcrypt"

export class UserUtils{

    static async hashPassword(password:string){
        return await bcrypt.hash(password, 10);
     }
     static async isPasswordMatch(password:string, hash:string){
        return bcrypt.compare(password, hash);
     }
}