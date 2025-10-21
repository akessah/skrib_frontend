# skrib_frontend

Frontend for skrib project, built with Vue 3 + Deno.

## Development

Start the development server:

```bash
deno task dev
```

The app will be available at http://localhost:8000.

## Building

Build the app for production:

```bash
deno task build
```

Preview the production build:

```bash
deno task preview
```

## Notes

- No Node.js required - uses Deno for serving and building
- Vue is loaded from esm.sh CDN
- Components are plain JavaScript modules using Vue's render functions
- Static file serving with Deno's std/http server