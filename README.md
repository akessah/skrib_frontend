# skrib_frontend

Frontend for skrib project, built with Vue 3 + Vite.

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:8000.

## Building

Build the app for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
skrib_frontend/
├── api_specs/          # API specification documents
├── src/
│   ├── main.js        # Application entry point
│   ├── App.vue        # Root component
│   ├── components/    # Reusable components
│   └── views/         # Page components
├── index.html         # HTML entry point
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies and scripts
```

## Features

This application includes support for:
- Authentication
- Posting
- Commenting
- Upvoting
- Tagging
- Notifications

See the `api_specs/` directory for detailed API specifications.