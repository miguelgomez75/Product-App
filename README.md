# Portal de Productos (Práctica)

Requisitos:
- Node.js 18+, MongoDB corriendo localmente (o URI Mongo Atlas)

Instalación:
1. npm install
2. Crear .env con MONGODB_URI y JWT_SECRET
3. npm start
4. Ir a http://localhost:3000

Rutas principales:
- POST /api/auth/register { username, password, role }
- POST /api/auth/login { username, password }
- GET /api/products
- CRUD /api/products (POST/PUT/DELETE) protegidos con JWT y rol admin
- Chat: /chat.html (requiere token en localStorage)

Notas:
- Socket.IO exige token JWT en `auth` durante la conexión.
- Para persistir historial de chat, crear modelo Message y guardar en evento 'message' en server.js.
