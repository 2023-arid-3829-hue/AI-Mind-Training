# AI-Based Puzzle & Brain Training Game – Backend

A beginner-friendly Node.js, Express.js, MongoDB, and Mongoose REST API.

## 1. Install

```powershell
cd "d:\Shoaib\Ai Mind Training\backend"
npm install
```

## 2. Configure MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP address in Atlas Network Access.
4. Copy the connection string.
5. Copy `.env.example` to `.env`.
6. Replace `MONGODB_URI` with the Atlas connection string.
7. Replace `JWT_SECRET` with a long random value.

## 3. Run

```powershell
npm run dev
```

Or:

```powershell
npm start
```

## API Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/games`
- `GET /api/games/:id`
- `POST /api/sessions`
- `GET /api/sessions/user/:userId`
- `GET /api/progress/:userId`

Register and login return a JWT. Send it to protected APIs later using:

```text
Authorization: Bearer YOUR_TOKEN
```

## Testing With Postman

1. Start the server.
2. Open `http://localhost:5000/api/health`.
3. Register: `POST http://localhost:5000/api/auth/register`
4. Use JSON such as `{"name":"Test User","email":"test@example.com","password":"123456"}`.
5. Login using the same email and password.

React Native and Flutter should use `http://YOUR_COMPUTER_IP:5000/api/...` while running on a physical device. Android Emulator commonly uses `http://10.0.2.2:5000/api/...` instead of `localhost`.
