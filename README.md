# Nimbus Cement climate risk dashboard

The Next.js app reproduces the Stage 4 report on the fixed nine-plant Assessment Portfolio. It includes the Overview, Extreme heat and Carbon cost comparisons, Conclusions, and plant and method evidence drawers. The report keeps the Stage 4 hash links so readers can share a specific view or evidence panel.

## Run locally

From the repository root with Node.js 22.19 or later:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Use `npm run build` and `npm start` to run the production build.
The production command uses Next.js’s Webpack compiler because the Turbopack PostCSS worker exited on the Windows checkout.

## Structure

- `src/app` contains the Next.js entry point and report stylesheet.
- `src/features/assessment/assessment.ts` calculates plant rankings, scenario sensitivities, and portfolio metrics through `buildAssessment(records)`. Screens read the same assessment and format values for display.
- `src/features/assessment/navigation.tsx` owns the hash links, history, and focus restoration.
- `src/components/ui` contains the shadcn/ui primitives. `src/styles` holds the Oren token export and shadcn theme adapter from the prototype's design system.
- `public/docs` and `public/outputs` contain the local source material linked in the evidence drawers. The data generator reads the inventory and model-count CSVs directly from `public/docs`.

Add new feature-specific calculations and screens under `src/features` and reuse the shared UI primitives. Keep presentation formatting out of calculations and test each calculation module through its public interface.

## Verify

```sh
npm run lint
npm run typecheck
npm test
npm run check:data
npx playwright install chromium
npm run test:e2e
```

The calculation tests use the published Stage 4 heat and carbon results and the standalone report's portfolio scores as reference values. Browser tests cover navigation, evidence, and the portrait layout. `check:data` requires Python 3. Run `python scripts/build_data.py` to regenerate the TypeScript records after updating the source CSVs.
