import { cors } from 'hono/cors'

export const corsConfig = cors({
  // make localhost port take any value in port
  origin: [
    'http://localhost:3000',
    'http://localhost:8787',
    'https://ajebo_camp_ui-production.koredujar.workers.dev',
  ],
  // allowHeaders: ['Content-Type', 'Upgrade-Insecure-Requests', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
})
