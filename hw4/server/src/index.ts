import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(cors());
dotenv.config();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

interface UserSocketMap {
    [userId: string]: string[];
}

const userSocketMap: UserSocketMap = {}; // Maps userId to an array of socketIds

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const sendNotify = (users: number[], fromId: number) => {
    users.map((userId) => {
        const toSocketIds = userSocketMap[userId];
        if (toSocketIds) {
            const uniqueIds = toSocketIds.filter((value, index, array) => 
                array.indexOf(value) === index
            )
            uniqueIds.forEach(id => {
                io.to(id).emit('new message', fromId);
            });
        }
    })
}

const sendRead = (users: number[], fromId: number) => {
    users.map((userId) => {
        const toSocketIds = userSocketMap[userId];
        if (toSocketIds) {
            const uniqueIds = toSocketIds.filter((value, index, array) => 
                array.indexOf(value) === index
            )
            uniqueIds.forEach(id => {
                io.to(id).emit('read message', fromId);
            });
        }
    })
}


io.on('connection', (socket: Socket) => {
    socket.on('register', (userId: string) => {
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);
    });

    socket.on('new message', (users: number[], fromId: number) => {
        sendNotify(users, fromId);
    });

    socket.on('update message', (users: number[], fromId: number) => {
        sendNotify(users, fromId);
    });

    socket.on('read message', (users: number[], fromId: number) => {
        sendRead(users, fromId);
    });

    socket.on('new chatroom', (users: number[], fromId: number) => {
        sendNotify(users, fromId);
    });

    socket.on('update chatroom', (users: number[], fromId: number) => {
        sendNotify(users, fromId);
    });

    socket.on('delete chatroom', (users: number[], fromId: number) => {
        sendNotify(users, fromId);
    });

    socket.on('disconnect', () => {
        Object.keys(userSocketMap).forEach(userId => {
            userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
            if (userSocketMap[userId].length === 0) {
                delete userSocketMap[userId];
            }
        });
    });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
