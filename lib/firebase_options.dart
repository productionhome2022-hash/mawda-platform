// File: lib/firebase_options.dart
// Production Home 2022 - Mawda Platform Configuration
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyA-MawdaPlatformWebApiKey-2026Placeholder',
    appId: '1:100020260000:web:mawdaff2026web',
    messagingSenderId: '202620262026',
    projectId: 'mawda-app-2026',
    authDomain: 'mawda-app-2026.firebaseapp.com',
    storageBucket: 'mawda-app-2026.appspot.com',
    measurementId: 'G-MAWDA2026',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyA-MawdaPlatformAndroidApiKey-2026Placeholder',
    appId: '1:100020260000:android:mawdaff2026android',
    messagingSenderId: '202620262026',
    projectId: 'mawda-app-2026',
    storageBucket: 'mawda-app-2026.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyA-MawdaPlatformIOSApiKey-2026Placeholder',
    appId: '1:100020260000:ios:mawdaff2026ios',
    messagingSenderId: '202620262026',
    projectId: 'mawda-app-2026',
    storageBucket: 'mawda-app-2026.appspot.com',
    iosBundleId: 'com.productionhome.mawda',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyA-MawdaPlatformMacosApiKey-2026Placeholder',
    appId: '1:100020260000:macos:mawdaff2026macos',
    messagingSenderId: '202620262026',
    projectId: 'mawda-app-2026',
    storageBucket: 'mawda-app-2026.appspot.com',
    iosBundleId: 'com.productionhome.mawda',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyA-MawdaPlatformWindowsApiKey-2026Placeholder',
    appId: '1:100020260000:windows:mawdaff2026windows',
    messagingSenderId: '202620262026',
    projectId: 'mawda-app-2026',
    storageBucket: 'mawda-app-2026.appspot.com',
  );
}
