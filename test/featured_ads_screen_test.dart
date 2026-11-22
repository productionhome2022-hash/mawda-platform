import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/screens/featured_ads_screen.dart';

void main() {
  testWidgets('featured ads use a separate non-geographic showcase with an honest empty state', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdsScreen()));

    expect(find.text('الإعلانات التجارية المميزة'), findsOneWidget);
    expect(find.textContaining('ترتيب العرض والأولوية والتنوع'), findsOneWidget);
    expect(find.text('لا يوجد تصفح جغرافي في هذا القسم.'), findsOneWidget);
    expect(find.text('عرض الإعلانات المميزة'), findsOneWidget);
    expect(find.text('سوريا'), findsNothing);
    expect(find.text('لبنان وفلسطين'), findsNothing);
  });

  testWidgets('featured reward page does not promise a reward for opening the screen', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: FeaturedAdRewardsScreen()));

    expect(find.text('استحقاق المشاهدة'), findsOneWidget);
    expect(
      find.textContaining('فتح الشاشة أو معاينة الإعلان أو انتهاء المؤقت المحلي لا يمنح مكافأة'),
      findsOneWidget,
    );
    expect(find.textContaining('قيمة المكافأة والمدة والميزانية وحدود التكرار'), findsOneWidget);
    expect(find.textContaining('الحد الأعلى للمشاهدة المميزة: 10 مشاهدات مؤهلة'), findsOneWidget);
    expect(find.textContaining('سجل المحفظة المركزي'), findsOneWidget);
  });
}
