# Environment Configuration

This project uses environment variables to automatically switch between development and production API endpoints.

## Environment Files

### Development (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### Production (`.env.production`)
```
VITE_API_BASE_URL=https://tayaria-warranty-be.onrender.com/api
```

## How It Works

1. **Local Development**: When you run `npm run dev`, Vite automatically loads `.env.local` and uses `localhost:8080/api`
2. **Production Build**: When you build for production (`npm run build`), Vite loads `.env.production` and uses your Render URL
3. **Vercel Deployment**: Vercel automatically detects the production environment and uses the Render URL

## Environment Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | `https://tayaria-warranty-be.onrender.com/api` | Backend API base URL |

## API Endpoints

The base URL is combined with specific endpoints on the client side:

- **Warranty Registration**: `{BASE_URL}/user/warranty`
- **Warranty Status**: `{BASE_URL}/user/warranties/car-plate/{carPlate}`

## Debugging

In development mode, the API configuration is logged to the console:
```
🔧 API Configuration: {
  BASE_URL: "http://localhost:8080/api",
  ENV: "development",
  DEV: true
}
```

## File Structure

```
├── .env.local          # Development environment (gitignored)
├── .env.production     # Production environment (gitignored)
├── src/
│   ├── config/
│   │   └── api.ts      # API configuration
│   └── services/
│       └── warrantyApi.ts  # API service functions
```

## Deployment

### Vercel
- Environment variables are automatically handled
- Production builds use `.env.production`
- No additional configuration needed

### Other Platforms
If deploying to other platforms, set the environment variable:
```bash
VITE_API_BASE_URL=https://tayaria-warranty-be.onrender.com/api
```

## Testing

1. **Local Development**: 
   ```bash
   npm run dev
   # Uses localhost:8080/api
   ```

2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   # Uses Render URL
   ```

## Adding New Environment Variables

1. Add to `.env.local` for development
2. Add to `.env.production` for production
3. Access in code: `import.meta.env.VITE_YOUR_VARIABLE`

## Security Notes

- `.env.local` and `.env.production` are gitignored
- Only variables prefixed with `VITE_` are exposed to the frontend
- Sensitive data should be handled server-side 