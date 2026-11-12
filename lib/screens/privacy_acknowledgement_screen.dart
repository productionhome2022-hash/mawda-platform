import 'package:flutter/material.dart';
import '../privacy_policy.dart';

class PrivacyAcknowledgementScreen extends StatefulWidget {
  const PrivacyAcknowledgementScreen({
    super.key,
    required this.onAccepted,
    this.busy = false,
    this.error,
  });

  final Future<void> Function() onAccepted;
  final bool busy;
  final String? error;

  @override
  State<PrivacyAcknowledgementScreen> createState() =>
      _PrivacyAcknowledgementScreenState();
}

class _PrivacyAcknowledgementScreenState
    extends State<PrivacyAcknowledgementScreen> {
  bool _accepted = false;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('إشعار خصوصية مودة')),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text(
                      'قبل متابعة استخدام مودة، يرجى قراءة إشعار الخصوصية الحالي.',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: Card(
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.all(16),
                          child: SelectableText(
                            'الإصدار $mawdaPrivacyPolicyVersion\n\n$mawdaPrivacyNoticeArabic',
                          ),
                        ),
                      ),
                    ),
                    if (widget.error != null) ...[
                      const SizedBox(height: 8),
                      Text(widget.error!, style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      )),
                    ],
                    CheckboxListTile(
                      value: _accepted,
                      onChanged: widget.busy
                          ? null
                          : (value) => setState(() => _accepted = value == true),
                      controlAffinity: ListTileControlAffinity.leading,
                      title: const Text(
                        'قرأت إشعار الخصوصية أعلاه وأقر بالاطلاع على هذا الإصدار.',
                      ),
                    ),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: !_accepted || widget.busy
                            ? null
                            : () => widget.onAccepted(),
                        child: widget.busy
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('أوافق وأتابع'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
