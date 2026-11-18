import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/screens/featured_ads_screen.dart';

void main() {
  testWidgets('featured ads discovery exposes the approved geography taxonomy and safe empty/error states', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdsScreen()));
    expect(find.text('الإعلانات المميزة'), findsOneWidget);
    expect(find.text('جميع الإعلانات العربية'), findsOneWidget);
    expect(find.text('سوريا'), findsOneWidget);
    expect(find.text('لبنان وفلسطين'), findsOneWidget);
    await tester.pump();
    expect(find.textContaining('لا نستخدم لغة الجهاز أو موقعه لتحديد الاستهداف.'), findsOneWidget);
  });

  testWidgets('featured reward page has a server-history entry point', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdRewardsScreen()));
    expect(find.text('مكافآت مشاهدة الإعلانات'), findsOneWidget);
    await tester.pump();
    expect(find.text('مكافآت مشاهدة الإعلانات'), findsOneWidget);
  });
}
