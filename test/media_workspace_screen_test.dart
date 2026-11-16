import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/screens/media_workspace_screen.dart';

void main() {
  testWidgets('Media Workspace exposes five approved routes and only opens the implemented creator intake', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: MediaWorkspaceScreen()));

    expect(find.text('طلبات التعاون والانضمام إلى فريق Mawdda'), findsOneWidget);
    expect(find.text('مراسلة المشرفين العامين'), findsOneWidget);
    expect(find.text('مراسلة الإدارة العامة'), findsOneWidget);
    expect(find.text('الإعلان المباشر'), findsOneWidget);
    expect(find.text('عرض محتوى المؤثرين وصنّاع المحتوى'), findsOneWidget);

    await tester.tap(find.text('عرض محتوى المؤثرين وصنّاع المحتوى'));
    await tester.pumpAndSettle();

    expect(find.text('طريقة تقديم المحتوى'), findsOneWidget);
    expect(find.text('النطاق الجغرافي المستهدف'), findsOneWidget);
    expect(find.textContaining('الحقوق أو الأذونات'), findsOneWidget);
  });
}
