# brennan-resume

An interactive resume presented as a retro platformer game. Built with Vue 3, Vite, and deployed to AWS via CDK.

## Development

```sh
npm install
npm run dev       # dev server with hot reload
npm run build     # type-check + production build
npm run lint      # oxlint + eslint (both with --fix)
npm run deploy    # build + CDK deploy to AWS
```

## Infrastructure

The `infra/` directory is a separate AWS CDK project. After a fresh clone, install its dependencies separately:

```sh
cd infra && npm install
```

`npm run deploy` (from the root) runs `vite build` then `npx cdk deploy`. Requires AWS credentials in the environment.

## Troubleshooting

**`npm install` fails with "Exit handler never called!"**
Your `package-lock.json` likely has `resolved` URLs pointing to a private registry (e.g. a corporate Artifactory). Delete `package-lock.json` and re-run `npm install` to regenerate it against the public registry.

**Changes to `.ts` files not picked up by Vite**
If `vue-tsc --build` emits compiled `.js` files into `src/`, Vite will resolve those instead of the TypeScript sources. Delete any `.js` files under `src/` and ensure `tsconfig.app.json` has `"noEmit": true`.
