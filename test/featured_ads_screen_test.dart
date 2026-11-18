import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/screens/featured_ads_screen.dart';

void main() {
  testWidgets('featured ads discovery renders geographic controls and honest empty state', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdsScreen()));
    await tester.pumpAndSettle();

    expect(find.text('الإعلانات المميزة'), findsOneWidget);
    expect(find.text('لا توجد حملات مميزة متاحة في هذا النطاق حالياً.'), findsOneWidget);
    expect(find.text('جميع الإعلانات العربية'), findsOneWidget);
    expect(find.text('سوريا'), findsOneWidget);
    expect(find.text('لبنان وفلسطين'), findsOneWidget);
    expect(find.textContaining('المعاينة لا تمنح كوينز'), findsOneWidget);
  });

  testWidgets('featured reward page renders server-backed empty history without promising fixed rewards', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdRewardsScreen()));
    await tester.pumpAndSettle();

    expect(find.text('مكافآت مشاهدة الإعلانات'), findsOneWidget);
    expect(find.textContaining('تُمنح الكوينز فقط بعد جلسة مشاهدة صريحة'), findsOneWidget);
    expect(find.text('لا توجد مكافآت مشاهدة مسجلة حتى الآن.'), findsOneWidget);
  });
}
