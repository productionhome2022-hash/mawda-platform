# 5,000-Persona Emulator Diagnostic Report - load_5000_emu_diag_20261127T22:04:58Z

- RUN_ID: load_5000_emu_diag_20261127T22:04:58Z
- START_UTC: 2026-11-27T22:04:58Z
- END_UTC: 2026-11-27T22:10:03Z
- DURATION_SEC: 305
- BRANCH: codex/mawda-full-platform-implementation
- EMU_DIAG_STATUS: failed_auth_firestore_functions_see_log

## Diagnostic & Execution Log
```text
=== CACHE & FIREBASE DEBUG CHECK ===
total 113923
drwx------. 2 u0_a253 u0_a253     3452 Nov 13 16:11 .
drwx------. 3 u0_a253 u0_a253     3452 Nov 13 15:50 ..
-rwxr-xr-x. 1 u0_a253 u0_a253 63634791 Nov 13 16:02 cloud-firestore-emulator-v1.19.8.jar
-rwxr-xr-x. 1 u0_a253 u0_a253 52892936 Nov 13 16:11 cloud-storage-rules-runtime-v1.1.3.jar
--- firebase-debug.log tail ---
[info] i  emulators: Starting emulators: auth, functions, firestore, hosting, storage, extensions {"metadata":{"emulator":{"name":"hub"},"message":"Starting emulators: auth, functions, firestore, hosting, storage, extensions"}}
[info] i  emulators: Detected demo project ID "demo-mawda-5000", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail. {"metadata":{"emulator":{"name":"hub"},"message":"Detected demo project ID \"demo-mawda-5000\", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail."}}
[debug] [2026-11-27T21:59:52.856Z] [logging] Logging Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.857Z] [auth] Authentication Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.857Z] [firestore] Firestore Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.858Z] [firestore.websocket] websocket server for firestore only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.858Z] [hosting] Hosting Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.858Z] [storage] Storage Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.859Z] assigned listening specs for emulators {"user":{"hub":[{"address":"127.0.0.1","family":"IPv4","port":4400},{"address":"::1","family":"IPv6","port":4400}],"logging":[{"address":"127.0.0.1","family":"IPv4","port":4500}],"auth":[{"address":"127.0.0.1","family":"IPv4","port":9099}],"firestore":[{"address":"127.0.0.1","family":"IPv4","port":8080}],"firestore.websocket":[{"address":"127.0.0.1","family":"IPv4","port":9150}],"hosting":[{"address":"127.0.0.1","family":"IPv4","port":5000}],"storage":[{"address":"127.0.0.1","family":"IPv4","port":9199}]},"metadata":{"message":"assigned listening specs for emulators"}}
[debug] [2026-11-27T21:59:52.874Z] Write emulator hub locator at /data/data/com.termux/files/usr/tmp/hub-demo-mawda-5000.json
[debug] [2026-11-27T21:59:52.892Z] [Extensions] Started Extensions emulator, this is a noop.
[debug] [2026-11-27T21:59:52.898Z] [functions] Functions Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.898Z] [eventarc] Eventarc Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.898Z] [tasks] Cloud Tasks Emulator only supports listening on one address (127.0.0.1). Not listening on ::1
[debug] [2026-11-27T21:59:52.898Z] late-assigned ports for functions and eventarc emulators {"user":{"hub":[{"address":"127.0.0.1","family":"IPv4","port":4400},{"address":"::1","family":"IPv6","port":4400}],"logging":[{"address":"127.0.0.1","family":"IPv4","port":4500}],"auth":[{"address":"127.0.0.1","family":"IPv4","port":9099}],"firestore":[{"address":"127.0.0.1","family":"IPv4","port":8080}],"firestore.websocket":[{"address":"127.0.0.1","family":"IPv4","port":9150}],"hosting":[{"address":"127.0.0.1","family":"IPv4","port":5000}],"storage":[{"address":"127.0.0.1","family":"IPv4","port":9199}],"functions":[{"address":"127.0.0.1","family":"IPv4","port":5001}],"eventarc":[{"address":"127.0.0.1","family":"IPv4","port":9299}],"tasks":[{"address":"127.0.0.1","family":"IPv4","port":9499}]},"metadata":{"message":"late-assigned ports for functions and eventarc emulators"}}
[debug] [2026-11-27T21:59:53.062Z] defaultcredentials: writing to file /data/data/com.termux/files/home/.config/firebase/productionhome2022_gmail_com_application_default_credentials.json
[debug] [2026-11-27T21:59:53.070Z] Setting GAC to /data/data/com.termux/files/home/.config/firebase/productionhome2022_gmail_com_application_default_credentials.json {"metadata":{"emulator":{"name":"functions"},"message":"Setting GAC to /data/data/com.termux/files/home/.config/firebase/productionhome2022_gmail_com_application_default_credentials.json"}}
[info] i  firestore: downloading cloud-firestore-emulator-v1.22.0.jar... {"metadata":{"emulator":{"name":"firestore"},"message":"downloading cloud-firestore-emulator-v1.22.0.jar..."}}
[debug] [2026-11-27T21:59:53.119Z] >>> [apiv2][query] GET https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.22.0.jar 
[debug] [2026-11-27T21:59:53.838Z] <<< [apiv2][status] GET https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.22.0.jar 200
[debug] [2026-11-27T21:59:53.839Z] <<< [apiv2][body] GET https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.22.0.jar [stream]
[debug] [2026-11-27T22:02:09.399Z] TypeError: terminated
    at Fetch.onAborted (node:internal/deps/undici/undici:13826:53)
    at Fetch.emit (node:events:509:28)
    at Fetch.terminate (node:internal/deps/undici/undici:12956:14)
    at Object.onError (node:internal/deps/undici/undici:13960:38)
    at Request.onError (/data/data/com.termux/files/usr/lib/node_modules/firebase-tools/node_modules/undici/lib/core/request.js:369:27)
    at Object.errorRequest (/data/data/com.termux/files/usr/lib/node_modules/firebase-tools/node_modules/undici/lib/core/util.js:638:13)
    at TLSSocket.<anonymous> (/data/data/com.termux/files/usr/lib/node_modules/firebase-tools/node_modules/undici/lib/dispatcher/client-h1.js:801:12)
    at TLSSocket.emit (node:events:521:24)
    at node:net:351:12
    at TCP.done (node:internal/tls/wrap:751:7)
[error] 
[error] Error: An unexpected error has occurred.
[debug] [2026-11-27T22:02:09.702Z] Found emulator hub locator: {"version":"15.35.0","origins":["http://127.0.0.1:4400","http://[::1]:4400"],"pid":23451}
=== TRYING EMULATORS --only auth,firestore,functions ===
i  emulators: Starting emulators: auth, functions, firestore
i  emulators: Detected demo project ID "demo-mawda-5000", emulated services will use a demo configuration and attempts to access non-emulated services for this project will fail.
i  firestore: downloading cloud-firestore-emulator-v1.22.0.jar...
 
i  emulators: Received SIGTERM for the first time. Starting a clean shutdown.
i  emulators: Please wait for a clean shutdown or send the SIGTERM signal again to stop right now.
i  emulators: Shutting down emulators.
i  functions: Stopping Functions Emulator
i  firestore: Stopping Firestore Emulator
i  eventarc: Stopping Eventarc Emulator
i  tasks: Stopping Cloud Tasks Emulator
i  hub: Stopping emulator hub
```
