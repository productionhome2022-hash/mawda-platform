import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../policies/android_download_policy.dart';

/// Public pre-authentication distribution options.
///
/// Android stays disabled until a verified signed release URL is supplied.
/// iOS is intentionally a notice only for the experimental launch.
/// Desktop and mobile web installation is handled by the PWA browser prompt;
/// this widget provides a clear, accessible route to browser-specific guidance.
class MawddaAppDownloads extends StatelessWidget {
  const MawddaAppDownloads({super.key});

  static const androidUrl = String.fromEnvironment('MAWDDA_ANDROID_DOWNLOAD_URL');
  static const androidAllowedHosts =
      String.fromEnvironment('MAWDDA_ANDROID_DOWNLOAD_ALLOWED_HOSTS');

  bool get _androidReady =>
      isApprovedAndroidDownloadUrl(androidUrl, androidAllowedHosts);

  Future<void> _openAndroid(BuildContext context) async {
    final uri = Uri.tryParse(androidUrl.trim());
    if (!_androidReady || uri == null) {
      _message(context, 'رابط تنزيل Android غير متاح أو أن نطاقه غير معتمد؛ لن نعرض نسخة تجريبية أو غير موقّعة للتنزيل العام.');
      return;
    }
    try {
      final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!opened && context.mounted) {
        _message(context, 'تعذر فتح رابط التنزيل. حاول من المتصفح.');
      }
    } catch (_) {
      if (context.mounted) _message(context, 'تعذر فتح رابط التنزيل. تحقق من اتصالك.');
    }
  }

  void _message(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _showIosNotice(BuildContext context) async {
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        icon: const Icon(Icons.phone_iphone, size: 34),
        title: const Text('تطبيق مودة لنظام iOS'),
        content: const Text(
          'تطبيق iOS الأصلي قيد التجهيز والتجربة حالياً، ولا يتوفر تنزيله بعد. '
          'يمكنك استخدام مودة الآن من نسخة الويب، وإضافتها إلى الشاشة الرئيسية من Safari '
          'عبر زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».',
          textAlign: TextAlign.center,
        ),
        actions: [
          FilledButton.icon(
            onPressed: () => Navigator.of(dialogContext).pop(),
            icon: const Icon(Icons.open_in_browser),
            label: const Text('متابعة إلى نسخة الويب'),
          ),
        ],
      ),
    );
  }

  Future<void> _showWebInstallHelp(BuildContext context) async {
    await showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        icon: const Icon(Icons.install_desktop, size: 34),
        title: const Text('ثبّت مودة كتطبيق مستقل'),
        content: const Text(
          'إذا ظهر شريط التثبيت أعلى الصفحة، اضغط «تثبيت تطبيق مودة» ثم وافق في نافذة المتصفح. '
          'وإذا لم يظهر، افتح قائمة المتصفح (⋮ أو …) وابحث عن «Install app» أو «تثبيت مودة». '
          'في Safari على macOS استخدم File ثم Add to Dock. '
          'على iPhone وiPad افتح قائمة المشاركة في Safari ثم «إضافة إلى الشاشة الرئيسية». '
          'قد تختلف الخيارات حسب المتصفح وإصدار نظام التشغيل. بعض المتصفحات تضيف اختصاراً فقط '
          'ولا توفر تطبيق PWA مستقلاً.',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('حسناً'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final androidReady = _androidReady;
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
                Icon(Icons.devices, color: Color(0xFFE8A0B5)),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'استخدم مودة على جميع أجهزتك',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: androidReady ? () => _openAndroid(context) : null,
              icon: const Icon(Icons.android),
              label: Text(androidReady
                  ? 'تنزيل تطبيق Android (APK)'
                  : 'Android APK — بانتظار اعتماد النسخة الموقّعة'),
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: () => _showWebInstallHelp(context),
              icon: const Icon(Icons.install_desktop),
              label: const Text('تثبيت مودة كتطبيق مستقل على الجهاز'),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () => _showIosNotice(context),
              icon: const Icon(Icons.phone_iphone),
              label: const Text('iPhone / iPad — معلومات التوفر'),
            ),
            const SizedBox(height: 10),
            const Text(
              'تظهر نافذة تثبيت المتصفح تلقائياً عندما يسمح المتصفح بذلك. '
              'إذا لم تكن مدعومة، ستجد إرشادات التثبيت المناسبة أعلاه. '
              'لن نعرض رابط APK قبل التحقق من توقيعه بمفتاح مودة الأصلي.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white60, fontSize: 11, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}
