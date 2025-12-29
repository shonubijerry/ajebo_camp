# Ajebo Camp Management System

A full-stack camp management system built with Next.js, Cloudflare Workers, and D1 database.

## Architecture

- **UI** (`/ui`) - Next.js 16 frontend with Material-UI
- **API** (`/api`) - Cloudflare Workers with Hono framework
- **Database** (`/packages/database`) - D1 database with Drizzle ORM
- **Shared** (`/packages/shared`) - Shared utilities and helpers

## Quick Start

### Prerequisites
- Node.js 18+
- npm/pnpm
- Cloudflare account (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

This starts:
- UI: http://localhost:3000
- API: http://localhost:6001

## Development

### Database Migrations

```bash
# Run migrations
cd packages/database
npm run migrate:prisma-afterwards -- migrations/db/<migration-file>.sql
```

### API Development

```bash
cd api
npm run dev        # Start dev server
npx tsc --noEmit  # Type check
```

### UI Development

```bash
cd ui
npm run dev                    # Start dev server
npx openapi-typescript ...    # Generate API types from OpenAPI
```

## Key Features

### Admin Panel
- **Users Management** - CRUD operations for users
- **Camps Management** - Create camps with allocations
- **Districts** - Manage districts with zones
- **Entities** - Organizational entities
- **Camp Allocations** - View and manage allocations

### Camp Registration
- Public registration form
- District and age group selection
- Paystack payment integration
- Free camps with optional donations
- Automatic camp allocation assignment

### Payment Integration
- **Paystack** - Secure payment processing
- Real-time payment verification
- Webhook for payment confirmation
- Support for free camps with donations

### Technical Features
- OpenAPI type-safe API client
- React Query for data fetching
- Material-UI v7 for UI components
- Role-based authentication (admin/user/super-admin)

## Project Structure

```
/api
  /src
    /routes        # API endpoints
    /middlewares   # Auth, etc.
    /schemas       # Validation schemas
    
/ui
  /src
    /app           # Next.js app router pages
    /components    # Reusable components
    /lib/api       # API client and types
    /interfaces    # TypeScript types
    
/packages
  /database        # Database schema and migrations
  /shared          # Shared utilities
```

## Environment Variables

### API (.dev.vars or Cloudflare Dashboard)
```
JWT_SECRET=your-secret-key
SALT_ROUND=10
RESEND_API_KEY=your-resend-key
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
R2_PUBLIC_BASE_URL=https://ajebo-camp-media.r2.dev
```

### UI (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:6001
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key
```

### Paystack Webhook Setup
Configure webhook URL in Paystack dashboard:
```
https://your-api-domain.com/api/v1/webhooks/paystack
```

Enable the `charge.success` event.

## Deployment

### API (Cloudflare Workers)
```bash
cd api
npm run deploy
```

### UI (Vercel/Netlify)
```bash
cd ui
npm run build
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, Material-UI v7, TanStack Query
- **Backend**: Cloudflare Workers, Hono, D1
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle
- **Auth**: JWT
- **Payment**: Paystack
- **Types**: TypeScript, OpenAPI

## Contributing

1. Create feature branch
2. Make changes
3. Run type checks: `npx tsc --noEmit`
4. Test locally
5. Submit PR

## License

Private project

