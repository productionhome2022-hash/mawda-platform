import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/screens/featured_ads_screen.dart';

void main() {
  testWidgets('featured ads discovery shows honest empty state and approved geography', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdsScreen()));

    expect(find.text('الإعلانات المميزة'), findsOneWidget);
    expect(find.text('لا توجد حملات مميزة متاحة للعرض حالياً.'), findsOneWidget);
    expect(find.text('جميع الإعلانات العربية'), findsOneWidget);
    expect(find.text('سوريا'), findsOneWidget);
    expect(find.text('لبنان وفلسطين'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.textContaining('لا نستخدم لغة الجهاز أو موقعه لتحديد الاستهداف.'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.textContaining('لا نستخدم لغة الجهاز أو موقعه لتحديد الاستهداف.'), findsOneWidget);
  });

  testWidgets('featured reward page explains that opening the screen is not rewarded', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdRewardsScreen()));

    expect(find.text('مكافآت مشاهدة الإعلانات'), findsOneWidget);
    expect(find.textContaining('لا تمنح ضغطة الزر أو فتح الشاشة'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('سجل المكافآت'), 300);
    expect(find.text('سجل المكافآت'), findsOneWidget);
  });
}
