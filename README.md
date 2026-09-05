# dexa

## Quick setup

```bash
# 1. Install dependencies (backend + frontend)
bun run install:all

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Seed test accounts (admin@test.com / employee@test.com, password: test1234)
bun run seed

# 4. Run backend + frontend together
bun run dev
```

Backend: http://localhost:4000 · Frontend: http://localhost:3000

## Other commands

```bash
bun run dev:backend    # BE only
bun run dev:frontend   # FE only
bun run build          # build both for production
bun run start          # run both built apps
```
