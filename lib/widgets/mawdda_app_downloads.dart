import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Download links are injected only after a signed, installable release is
/// published. Empty values deliberately keep the controls visible but disabled.
class MawddaAppDownloads extends StatelessWidget {
  const MawddaAppDownloads({super.key});

  static const androidUrl = String.fromEnvironment('MAWDDA_ANDROID_DOWNLOAD_URL');
  static const iosUrl = String.fromEnvironment('MAWDDA_IOS_DOWNLOAD_URL');

  Future<void> _open(BuildContext context, String value) async {
    final uri = Uri.tryParse(value);
    if (uri == null || !uri.hasScheme || !['https'].contains(uri.scheme)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('رابط التنزيل غير متاح حالياً.')),
      );
      return;
    }
    try {
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تعذر فتح رابط التنزيل. حاول من المتصفح.')),
        );
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تعذر فتح رابط التنزيل. تحقق من اتصالك.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final androidReady = androidUrl.trim().isNotEmpty;
    final iosReady = iosUrl.trim().isNotEmpty;
    return Card(
      color: const Color(0xFF211629),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.download_for_offline_outlined, color: Color(0xFFE8A0B5)),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'حمّل تطبيق مودة على جهازك',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: androidReady ? () => _open(context, androidUrl) : null,
              icon: const Icon(Icons.android),
              label: Text(androidReady ? 'تنزيل تطبيق Android (APK)' : 'Android APK — قيد التجهيز'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: iosReady ? () => _open(context, iosUrl) : null,
              icon: const Icon(Icons.phone_iphone),
              label: Text(iosReady ? 'تثبيت تطبيق iPhone / iPad' : 'iOS — بانتظار التوقيع والتوزيع'),
            ),
            const SizedBox(height: 8),
            const Text(
              'ستُفعّل روابط التنزيل بعد اعتماد الحزم والتأكد من سلامة التثبيت. لا تستخدم ملفات تجريبية غير موقّعة كتطبيق إصدار عام.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white60, fontSize: 11, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}
