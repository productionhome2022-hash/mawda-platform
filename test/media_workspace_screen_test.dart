import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/screens/media_workspace_screen.dart';

void main() {
  testWidgets(
    'Media Workspace exposes approved routes and opens only implemented creator and rewards flows',
    (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: MediaWorkspaceScreen()),
      );

      expect(find.text('عقودي واتفاقياتي'), findsOneWidget);
      expect(find.text('انضم كمندوب إعلاني معتمد'), findsOneWidget);
      expect(find.text('انضم إلى صُنّاع مودة'), findsOneWidget);
      expect(find.text('الإعلان المباشر'), findsOneWidget);
      expect(find.text('عروض المؤثرين وصنّاع المحتوى'), findsOneWidget);
      expect(find.text('مراسلة المشرفين العامين'), findsOneWidget);
      await tester.scrollUntilVisible(find.text('مراسلة الإدارة العامة'), 300);
      expect(find.text('مراسلة الإدارة العامة'), findsOneWidget);
      await tester.scrollUntilVisible(find.text('مكافآت مشاهدة الإعلانات'), 300);
      expect(find.text('مكافآت مشاهدة الإعلانات'), findsOneWidget);

      await tester.tap(find.text('عروض المؤثرين وصنّاع المحتوى'));
      await tester.pumpAndSettle();

      expect(find.text('طريقة تقديم المحتوى'), findsOneWidget);
      expect(find.text('النطاق الجغرافي المستهدف'), findsOneWidget);
      expect(find.textContaining('الحقوق أو الأذونات'), findsOneWidget);
      expect(find.textContaining('عقد مستقل'), findsOneWidget);

      await tester.pageBack();
      await tester.pumpAndSettle();
      await tester.tap(find.text('مكافآت مشاهدة الإعلانات'));
      await tester.pumpAndSettle();
      expect(find.text('كيف تحصل على المكافأة؟'), findsOneWidget);
    },
  );
}
