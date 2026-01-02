import { cors } from 'hono/cors'

export const corsConfig = cors({
  origin: ['http://localhost:3000'],
  allowHeaders: [
    'Content-Type',
    'Upgrade-Insecure-Requests',
    'Authorization',
  ],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
})
