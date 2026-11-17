import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/widgets/responsive_room_card.dart';

void main() {
  for (final width in [320.0, 390.0, 768.0, 1440.0]) {
    testWidgets('room card fits a ${width.toInt()}px viewport', (tester) async {
      tester.view.devicePixelRatio = 1;
      tester.view.physicalSize = Size(width, 900);
      addTearDown(tester.view.resetDevicePixelRatio);
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView(
              children: [
                ResponsiveRoomCard(
                  summary: const ListTile(
                    leading: CircleAvatar(child: Icon(Icons.meeting_room_outlined)),
                    title: Text('غرفة مودة التجريبية'),
                    subtitle: Text('غرفة خاصة • الأعضاء: 25 / 100'),
                  ),
                  actions: [
                    IconButton(
                      tooltip: 'إدارة مشرفي الغرفة',
                      onPressed: () {},
                      icon: const Icon(Icons.admin_panel_settings_outlined),
                    ),
                    IconButton(
                      tooltip: 'مغادرة الغرفة',
                      onPressed: () {},
                      icon: const Icon(Icons.logout),
                    ),
                    IconButton(
                      tooltip: 'فتح الغرفة',
                      onPressed: () {},
                      icon: const Icon(Icons.arrow_forward_ios),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('غرفة مودة التجريبية'), findsOneWidget);
      expect(find.byTooltip('إدارة مشرفي الغرفة'), findsOneWidget);
      expect(find.byTooltip('مغادرة الغرفة'), findsOneWidget);
      expect(find.byTooltip('فتح الغرفة'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }
}
