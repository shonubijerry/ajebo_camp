import { cors } from 'hono/cors'

export const corsConfig = cors({
  // make localhost port take any value in port
  origin: ['http://localhost:3000', 'http://localhost:8787'],
  allowHeaders: ['Content-Type', 'Upgrade-Insecure-Requests', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
})
