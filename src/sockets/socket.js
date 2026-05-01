import { Server } from "socket.io";
import { redis, publisher, subscriber } from "../common/utils/redis-connection.js";

const key = "CHECKBOXES";

export const initSocket = async (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("toggleCheckbox", async ({ index, state }) => {
            try {
                const cooldownKey = `cooldown:${socket.id}`;

                // 🔹 Try to acquire cooldown lock
                const isAllowed = await redis.set(
                    cooldownKey,
                    "1",
                    "NX",   // only if not exists
                    "EX",   // expiry
                    5       // seconds
                );

                if (!isAllowed) {
                    // ❌ User is in cooldown
                    socket.emit("cooldown", {
                        message: "You are cooling down. Try again in 5 seconds.",
                        index
                    });
                    return;
                }

                // ✅ Allowed
                const bit = state === true ? 1 : 0;

                await redis.setbit(key, index, bit);

                await publisher.publish(
                    "update",
                    JSON.stringify({ index, state })
                );

            } catch (err) {
                console.error("Error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    await subscriber.subscribe("update");

    subscriber.on("message", (channel, message) => {
        if (channel === "update") {
            const data = JSON.parse(message);
            io.emit("update", data);
        }
    });

    return io;
};