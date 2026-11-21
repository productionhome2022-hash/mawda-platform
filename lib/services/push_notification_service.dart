import 'dart:async';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Registers device tokens only after an authenticated member session exists.
/// Web push remains disabled until the owner supplies the Firebase Web VAPID key.
class PushNotificationService {
  static const _webVapidKey = String.fromEnvironment('MAWDA_FCM_VAPID_KEY');
  StreamSubscription<String>? _tokenSubscription;
  StreamSubscription<RemoteMessage>? _foregroundSubscription;
  StreamSubscription<RemoteMessage>? _openedSubscription;

  String get _platform {
    if (kIsWeb) return 'web';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android: return 'android';
      case TargetPlatform.iOS: return 'ios';
      case TargetPlatform.macOS: return 'macos';
      case TargetPlatform.windows: return 'windows';
      case TargetPlatform.linux: return 'linux';
      case TargetPlatform.fuchsia: return 'other';
    }
  }

  Future<void> initialize({
    void Function(RemoteMessage message)? onForegroundMessage,
    void Function(RemoteMessage message)? onOpenedMessage,
  }) async {
    if (kIsWeb && _webVapidKey.isEmpty) {
      debugPrint('Mawda push notifications are disabled: MAWDA_FCM_VAPID_KEY is not configured.');
      return;
    }
    try {
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true, badge: true, sound: true, provisional: false,
      );
      if (settings.authorizationStatus == AuthorizationStatus.denied) return;
      final token = await messaging.getToken(
        vapidKey: kIsWeb ? _webVapidKey : null,
      );
      if (token != null && token.isNotEmpty) await _register(token);
      await _tokenSubscription?.cancel();
      await _foregroundSubscription?.cancel();
      await _openedSubscription?.cancel();
      if (onForegroundMessage != null) {
        _foregroundSubscription = FirebaseMessaging.onMessage.listen(onForegroundMessage);
      }
      if (onOpenedMessage != null) {
        _openedSubscription = FirebaseMessaging.onMessageOpenedApp.listen(onOpenedMessage);
        final initialMessage = await messaging.getInitialMessage();
        if (initialMessage != null) onOpenedMessage(initialMessage);
      }
      _tokenSubscription = messaging.onTokenRefresh.listen((value) {
        if (value.isNotEmpty) unawaited(_register(value));
      });
    } catch (error) {
      debugPrint('Mawda push token registration is unavailable: $error');
    }
  }

  Future<void> _register(String token) async {
    await FirebaseFunctions.instance.httpsCallable('registerPushToken').call({
      'token': token,
      'platform': _platform,
    });
  }

  Future<void> unregister() async {
    try {
      final token = await FirebaseMessaging.instance.getToken(
        vapidKey: kIsWeb && _webVapidKey.isNotEmpty ? _webVapidKey : null,
      );
      if (token != null && token.isNotEmpty) {
        await FirebaseFunctions.instance.httpsCallable('unregisterPushToken').call({
          'token': token,
        });
      }
    } catch (error) {
      debugPrint('Mawda push token deactivation failed: $error');
    }
  }

  Future<void> dispose() async {
    await _tokenSubscription?.cancel();
    await _foregroundSubscription?.cancel();
    await _openedSubscription?.cancel();
    _tokenSubscription = null;
    _foregroundSubscription = null;
    _openedSubscription = null;
  }
}
