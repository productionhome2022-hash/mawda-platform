import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/widgets/mawdda_app_downloads.dart';

void main() {
  Widget harness() => const MaterialApp(
        home: Scaffold(body: SingleChildScrollView(child: MawddaAppDownloads())),
      );

  testWidgets('keeps Android download disabled until a signed release URL is configured',
      (tester) async {
    await tester.pumpWidget(harness());

    final androidButton = tester.widget<OutlinedButton>(
      find.widgetWithText(OutlinedButton, 'Android APK — بانتظار اعتماد النسخة الموقّعة'),
    );
    expect(androidButton.onPressed, isNull);
  });

  testWidgets('iOS option opens the coming-soon notice and web fallback',
      (tester) async {
    await tester.pumpWidget(harness());
    await tester.tap(find.text('iPhone / iPad — معلومات التوفر'));
    await tester.pumpAndSettle();

    expect(find.text('تطبيق مودة لنظام iOS'), findsOneWidget);
    expect(find.textContaining('قيد التجهيز والتجربة'), findsOneWidget);
    expect(find.textContaining('إضافتها إلى الشاشة الرئيسية'), findsOneWidget);
    expect(find.text('متابعة إلى نسخة الويب'), findsOneWidget);
  });

  testWidgets('desktop install option explains native PWA prompt and fallback',
      (tester) async {
    await tester.pumpWidget(harness());
    await tester.tap(find.text('تثبيت مودة كتطبيق مستقل على الجهاز'));
    await tester.pumpAndSettle();

    expect(find.text('ثبّت مودة كتطبيق مستقل'), findsOneWidget);
    expect(find.textContaining('Install app'), findsOneWidget);
    expect(find.textContaining('Add to Dock'), findsOneWidget);
    expect(find.textContaining('إضافة إلى الشاشة الرئيسية'), findsOneWidget);
  });
}
