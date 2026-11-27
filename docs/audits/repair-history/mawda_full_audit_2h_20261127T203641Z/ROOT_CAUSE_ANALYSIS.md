# Root Cause Analysis

1. **`invalid-argument` in `setStoreCatalogItem`:** Initial catalog publication in `test/persona-load.integration.test.js` lacked `expectedVersion: 0`, which is required by `setStoreCatalogItem` validation. Fixed by supplying `expectedVersion: 0` and fulfillment fields.
2. **`exit code 124` / `SIGTERM` on 5,000-Persona Run:** Earlier runs (`46048630996`, `46050254882`, `46053231523`) hit timeout limits while iterating over 5,000 personas across batch loops. Addressed by increasing `inBatches` sizes in `test/persona-load.integration.test.js` and raising emulator timeout to `1500s` in `.github/workflows/mawda-5000-emulator-integration.yml`, succeeding in run `#46055971553`.
