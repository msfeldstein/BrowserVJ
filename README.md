# BrowserVJ

BrowserVJ is an in-browser bindable VJ setup built with Backbone + WebGL.

## Modernized stack

- JavaScript sources (CoffeeScript removed)
- Vite-based dev/build workflow
- three.js upgraded to modern npm package version
- Generated runtime bundles for legacy global-style app architecture
- Playwright smoke tests

## Getting started

```bash
npm install
```

## Development

```bash
npm run dev
```

This runs the bundle generator first, then serves `app/` on port `9000`.

## Production build

```bash
npm run build
```

This produces a distributable `dist/` directory.

## Preview build

```bash
npm run preview
```

## Smoke tests

```bash
npm run test:smoke
```

## Project notes

- Runtime bundle sources are generated into `app/generated/`.
- The output page (`output.html`) can mirror the main output when opened as a popout from the main app.