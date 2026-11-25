import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class MemberEntitlementHistoryScreen extends StatefulWidget {
  const MemberEntitlementHistoryScreen({super.key});

  @override
  State<MemberEntitlementHistoryScreen> createState() =>
      _MemberEntitlementHistoryScreenState();
}

class _MemberEntitlementHistoryScreenState
    extends State<MemberEntitlementHistoryScreen> {
  List<Map<String, dynamic>> _entries = [];
  List<Map<String, dynamic>> _giftEntries = [];
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final responses = await Future.wait([
        FirebaseFunctions.instance.httpsCallable('getMyEntitlementGrantHistory').call(),
        FirebaseFunctions.instance.httpsCallable('getMyStoreGiftHistory').call(),
      ]);
      final grantData = Map<String, dynamic>.from(responses[0].data as Map);
      final giftData = Map<String, dynamic>.from(responses[1].data as Map);
      final grantRows = grantData['entries'] as List? ?? const [];
      final giftRows = giftData['entries'] as List? ?? const [];
      if (!mounted) return;
      setState(() {
        _entries = grantRows.whereType<Map>()
            .map((entry) => Map<String, dynamic>.from(entry)).toList();
        _giftEntries = giftRows.whereType<Map>()
            .map((entry) => Map<String, dynamic>.from(entry)).toList();
      });
    } on FirebaseFunctionsException catch (error) {
      if (mounted) setState(() => _error = error.message ?? 'تعذر تحميل سجل الاستحقاقات.');
    } catch (_) {
      if (mounted) setState(() => _error = 'تعذر تحميل سجل الاستحقاقات.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _formatTime(dynamic value) {
    if (value is! num) return 'غير محدد';
    final date = DateTime.fromMillisecondsSinceEpoch(value.toInt()).toLocal();
    return '${date.year.toString().padLeft(4, '0')}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')} '
        '${date.hour.toString().padLeft(2, '0')}:'
        '${date.minute.toString().padLeft(2, '0')}';
  }

  String _duration(dynamic hours) {
    switch (hours) {
      case 24:
        return '24 ساعة';
      case 168:
        return '7 أيام';
      case 720:
        return '30 يوماً';
      default:
        return 'مدة مخصصة';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سجل الاستحقاقات والهدايا'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _load,
            tooltip: 'تحديث',
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _loading && _entries.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  const Text(
                    'يعرض هذا السجل المنح الإدارية المجانية والهدايا التي أرسلتها أو استلمتها. '
                    'المنح المجانية لا تخصم BetaCoins، والهدايا المدفوعة تظهر بقيمتها المسجلة.',
                  ),
                  const SizedBox(height: 12),
                  if (_error != null)
                    Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  if (!_loading && _entries.isEmpty && _giftEntries.isEmpty && _error == null)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 36),
                      child: Center(child: Text('لا توجد منح مسجلة حتى الآن.')),
                    ),
                  const SizedBox(height: 20),
                  Text('الهدايا المرسلة والمستلمة', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  if (!_loading && _giftEntries.isEmpty && _error == null)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Text('لا توجد هدايا مسجلة حتى الآن.'),
                    ),
                  ..._giftEntries.map((entry) {
                    final isCoinPackage = entry['giftKind'] == 'coin_package';
                    final received = isCoinPackage || entry['direction'] == 'received';
                    final expiresAt = entry['expiresAtMs'];
                    final counterpart = received ? entry['senderUid'] : entry['recipientUid'];
                    final duration = entry['durationDays'] == null
                        ? 'دائم' : '\${entry['durationDays']} يوماً';
                    final title = isCoinPackage
                        ? (entry['packageName'] as String? ?? 'باقة BetaCoins')
                        : (entry['itemName'] as String? ?? 'هدية من متجر مودة');
                    final details = isCoinPackage
                        ? 'استلمت باقة من: \${counterpart ?? 'غير معروف'}\n'
                          'الكمية: \${entry['coins'] ?? 0} BetaCoins\n'
                          'التاريخ: \${_formatTime(entry['createdAtMs'])}'
                        : (received ? 'استلمت من: ' : 'أرسلت إلى: ') + '$counterpart\n' +
                          'القيمة: \${entry['priceCoins'] ?? 0} BetaCoins\n' +
                          'المدة: $duration\n' +
                          'التاريخ: \${_formatTime(entry['createdAtMs'])}\n' +
                          'الانتهاء: \${expiresAt == null ? 'دائم/غير محدد' : _formatTime(expiresAt)}';
                    return Card(
                      child: ListTile(
                        leading: Icon(isCoinPackage
                            ? Icons.monetization_on_outlined
                            : (received ? Icons.card_giftcard : Icons.redeem_outlined)),
                        title: Text(title),
                        subtitle: Text(details),
                        isThreeLine: true,
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
