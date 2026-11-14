import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'coin_purchase_screen.dart';

/// Read-only wallet history. All balance changes are performed by trusted
/// Cloud Functions; this screen only reads the member-scoped immutable ledger.
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key, required this.userId});

  final String userId;

  String _dateLabel(dynamic value) {
    if (value is! Timestamp) return 'وقت العملية غير متاح';
    final date = value.toDate().toLocal();
    String two(int part) => part.toString().padLeft(2, '0');
    return '${date.year}-${two(date.month)}-${two(date.day)} ${two(date.hour)}:${two(date.minute)}';
  }

  @override
  Widget build(BuildContext context) {
    final ledger = FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('walletLedger')
        .orderBy('createdAt', descending: true);

    return Scaffold(
      appBar: AppBar(title: const Text('محفظتي وسجل العمليات'), actions: [
        IconButton(tooltip: 'طلب شراء كوينز', icon: const Icon(Icons.add_card),
          onPressed: () => Navigator.of(context).push(MaterialPageRoute(
            builder: (_) => const CoinPurchaseScreen(),
          ))),
      ]),
      body: Column(
        children: [
          StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
            stream: FirebaseFirestore.instance.collection('users').doc(userId).snapshots(),
            builder: (context, balanceSnapshot) {
              final balance = balanceSnapshot.data?.data()?['coins'];
              final coins = balance is num ? balance.toInt() : null;
              return Card(
                margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: ListTile(
                  leading: const Icon(Icons.account_balance_wallet_outlined, size: 32),
                  title: const Text('رصيدك الحالي'),
                  subtitle: Text(coins == null ? 'الرصيد غير متاح حالياً' : '$coins كوين'),
                  trailing: const Icon(Icons.monetization_on_outlined),
                ),
              );
            },
          ),
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: ledger.snapshots(),
              builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'تعذر تحميل سجل المحفظة. تحقق من اتصالك ثم أعد المحاولة.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }
          final documents = snapshot.data?.docs ?? const [];
          if (documents.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.account_balance_wallet_outlined, size: 52),
                    SizedBox(height: 12),
                    Text('لا توجد عمليات مسجلة في محفظتك حتى الآن.'),
                  ],
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: documents.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final data = documents[index].data();
              final type = data['type'] as String? ?? 'wallet_activity';
              final sent = data['direction'] == 'debit';
              final amount = (data['amount'] as num?)?.toInt() ?? 0;
              final fee = (data['commissionAmount'] as num?)?.toInt();
              final net = (data['recipientNetAmount'] as num?)?.toInt();
              final relatedUid = sent
                  ? data['recipientUid'] as String?
                  : data['senderUid'] as String?;
              final title = type == 'coin_transfer_sent'
                  ? 'تحويل كوينز صادر'
                  : type == 'coin_transfer_received'
                      ? 'تحويل كوينز وارد'
                      : type == 'store_purchase'
                          ? 'شراء من متجر مودة'
                          : type.replaceAll('_', ' ');
              // Ledger amounts are signed by the trusted backend: debits are
              // negative and credits are positive, including store purchases.
              final amountLabel = '${amount > 0 ? '+' : ''}$amount كوين';
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            sent ? Icons.call_made : Icons.call_received,
                            color: sent ? Colors.deepOrange : Colors.green,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              title,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Text(
                            amountLabel,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: sent ? Colors.deepOrange : Colors.green,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (fee != null) Text('عمولة المنصة: $fee كوين'),
                      if (net != null) Text('الصافي الذي وصل للمستلم: $net كوين'),
                      if (relatedUid != null)
                        SelectableText(
                          sent ? 'معرف المستلم: $relatedUid' : 'معرف المرسل: $relatedUid',
                        ),
                      if (data['itemName'] is String)
                        Text('العنصر: ${data['itemName']}'),
                      if (data['purchaseId'] is String)
                        SelectableText(
                          'معرف الشراء: ${data['purchaseId']}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      if (data['transferId'] is String)
                        SelectableText(
                          'معرف التحويل: ${data['transferId']}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      const SizedBox(height: 4),
                      Text(
                        _dateLabel(data['createdAt']),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              );
            },
          );
              },
            ),
          ),
        ],
      ),
    );
  }
}
