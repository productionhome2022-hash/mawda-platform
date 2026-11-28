import { setGlobalOptions } from "firebase-functions/v2/options";

// This module is deliberately imported before every function module from index.ts.
// It enforces App Check on all callable exports without changing production resources.
setGlobalOptions({ enforceAppCheck: true });
