# Root Cause Analysis

## 1. invalid-argument in setStoreCatalogItem During Lifecycle Test
- **Symptom:** Failure in `setStoreCatalogItem.run` during setup of the 5,000-persona lifecycle test.
- **Root Cause:** `setStoreCatalogItem` validates `request.data?.expectedVersion` as a non-negative safe integer, which was omitted on initial emulator catalog publication.
- **Resolution:** Added `expectedVersion: 0` to the catalog publication payload in `test/persona-load.integration.test.js`.

## 2. exit code 124 / SIGTERM During 5,000-Persona Execution
- **Symptom:** Emulator step terminated before completing all 5,000-persona stages in prior runs (`46048630996`, `46050254882`, `46053231523`).
- **Root Cause:** Repeated batch loops (`inBatches`) across 5,000 personas exceeded previous timeout windows.
- **Resolution:** Increased batch sizes in `test/persona-load.integration.test.js` and increased emulator execution timeout to `1500s` in `.github/workflows/mawda-5000-emulator-integration.yml`, succeeding in run `#46055971553`.
