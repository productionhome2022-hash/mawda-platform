import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

/// Gift history is projected by a callable so members cannot query another
/// member's private gift records directly from Firestore.
class MemberGiftHistoryScreen extends StatefulWidget {
  const MemberGiftHistoryScreen({super.key});

  @override
  State<MemberGiftHistoryScreen> createState() => _MemberGiftHistoryScreenState();
}

class _MemberGiftHistoryScreenState extends State<MemberGiftHistoryScreen> {
  late Future<List<Map<String, dynamic>>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = _loadHistory();
  }

  Future<List<Map<String, dynamic>>> _loadHistory() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('getMyStoreGiftHistory')
        .call();
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['entries'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((entry) => Map<String, dynamic>.from(entry))
        .toList(growable: false);
  }

  String _dateLabel(dynamic value) {
    if (value is! num) return 'التاريخ غير متاح';
    final date = DateTime.fromMillisecondsSinceEpoch(value.toInt()).toLocal();
    String two(int part) => part.toString().padLeft(2, '0');
    return '${date.year}-${two(date.month)}-${two(date.day)} ${two(date.hour)}:${two(date.minute)}';
  }

  String _subtitle(Map<String, dynamic> entry) {
    if (entry['giftKind'] == 'coin_package') {
      final coins = (entry['coins'] as num?)?.toInt() ?? 0;
      return '$coins BetaCoins وصلت إلى محفظتك';
    }
    if (entry['giftKind'] == 'coin_transfer') {
      final coins = (entry['coins'] as num?)?.toInt() ?? 0;
      final commission = (entry['commissionAmount'] as num?)?.toInt() ?? 0;
      return commission > 0
          ? '$coins BetaCoins وصلت بعد عمولة $commission'
          : '$coins BetaCoins وصلت إلى محفظتك';
    }
    final price = (entry['priceCoins'] as num?)?.toInt() ?? 0;
    final duration = (entry['durationDays'] as num?)?.toInt();
    return duration == null
        ? 'ميزة دائمة • قيمة الهدية $price BetaCoins'
        : 'مدة الاستحقاق $duration يوماً • قيمة الهدية $price BetaCoins';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سجل الهدايا المستلمة'),
        actions: [
          IconButton(
            tooltip: 'تحديث',
            onPressed: () => setState(() => _historyFuture = _loadHistory()),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 44),
                    const SizedBox(height: 12),
                    const Text(
                      'تعذر تحميل سجل الهدايا. حاول مرة أخرى.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => setState(() => _historyFuture = _loadHistory()),
                      child: const Text('إعادة المحاولة'),
                    ),
                  ],
                ),
              ),
            );
          }
          final entries = snapshot.data ?? const [];
          if (entries.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.card_giftcard_outlined, size: 52),
                    SizedBox(height: 12),
                    Text('لا توجد هدايا مستلمة حتى الآن.'),
                  ],
                ),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async {
              final next = _loadHistory();
              setState(() => _historyFuture = next);
              await next;
            },
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: entries.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final entry = entries[index];
                final isCoins = entry['giftKind'] == 'coin_package';
                final title = entry['itemName'] as String? ??
                    (isCoins ? 'باقة BetaCoins' : 'هدية من متجر مودة');
                final senderUid = entry['senderUid'] as String?;
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Icon(isCoins ? Icons.monetization_on_outlined : Icons.card_giftcard_outlined),
                    ),
                    title: Text(title),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_subtitle(entry)),
                        if (senderUid != null) Text('من العضو: $senderUid'),
                        Text(_dateLabel(entry['createdAtMs'])),
                      ],
                    ),
                    isThreeLine: true,
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
