import { redis } from "../../common/utils/redis-connection.js"


export const checkboxes = async () => {
    const key = "CHECKBOXES";
    const result = [];

    for (let i = 0; i < 100; i++) {
        const bit = await redis.getbit(key, i);
        result.push(Boolean(bit));
    }

    

    return result;
}