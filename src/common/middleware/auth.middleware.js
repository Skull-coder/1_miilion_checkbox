import { verifyAccessToken } from "../utils/jwt.utils.js"
import User from "../../modules/auth/auth.model.js"
import ApiError from "../utils/api.error.js";


export const authenticated = async (req, _, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("No token provided");
        }

        const accessToken = authHeader.split(" ")[1];

        let decoded;

        try {
            decoded = verifyAccessToken(accessToken);
        } catch (err) {
            throw ApiError.unauthorized("Invalid access token");
        }


        const user = await User.findById(decoded.id);
        if (!user) throw ApiError.notfound("User not found");

        req.userId = decoded.id;

        next();
    } catch (err) {
        next(err);
    }
}