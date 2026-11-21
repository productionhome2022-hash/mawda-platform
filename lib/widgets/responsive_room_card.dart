import 'package:flutter/material.dart';

/// Room summary and actions that adapt to the available card width.
class ResponsiveRoomCard extends StatelessWidget {
  const ResponsiveRoomCard({
    super.key,
    required this.summary,
    required this.actions,
    this.compactBreakpoint = 520,
  });

  final Widget summary;
  final List<Widget> actions;
  final double compactBreakpoint;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < compactBreakpoint;
          final actionGroup = Wrap(
            spacing: 4,
            runSpacing: 4,
            alignment: WrapAlignment.end,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: actions,
          );

          return Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(12, 4, 8, 4),
            child: compact
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      summary,
                      Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: actionGroup,
                      ),
                    ],
                  )
                : Row(
                    children: [
                      Expanded(child: summary),
                      const SizedBox(width: 12),
                      actionGroup,
                    ],
                  ),
          );
        },
      ),
    );
  }
}
