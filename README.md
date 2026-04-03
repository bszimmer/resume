# brennan-resume

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

> **Note:** `infra/` is a separate Node.js project (AWS CDK). After a fresh clone, also run:
> ```sh
> cd infra && npm install
> ```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Deploy to AWS

```sh
npm run deploy
```

This runs `npm run build` then `npx cdk deploy` from `infra/`. Requires AWS credentials in the environment and `infra/node_modules` to be installed (see above).

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Troubleshooting

**`npm install` fails with "Exit handler never called!"**
Your `package-lock.json` likely has `resolved` URLs pointing to a private registry (e.g. a corporate Artifactory). Delete `package-lock.json` and re-run `npm install` to regenerate it against the public registry.

**Changes to `.ts` files not picked up by Vite**
If `vue-tsc --build` emits compiled `.js` files into `src/`, Vite will resolve those instead of the TypeScript sources (`.js` takes precedence over `.ts` in Vite's default resolution order). Delete any `.js` files under `src/` and ensure `tsconfig.app.json` has `"noEmit": true`.
