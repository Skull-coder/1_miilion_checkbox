import ApiResponse from "../../common/utils/api.response.js"
import * as service from "./checkbox.service.js"

export const checkboxes = async (req, res, next)=>{
    try {
        const checkboxes = await service.checkboxes();

        return res.json(checkboxes)
    } catch (error) {
        next(error)
    }
}