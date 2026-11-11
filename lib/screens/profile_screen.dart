import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../services/coin_system_service.dart';

class ProfileScreen extends StatefulWidget {
  final String profileUserId;
  final String currentUserId;

  const ProfileScreen({
    Key? key,
    required this.profileUserId,
    required this.currentUserId,
  }) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final CoinSystemService _coinService = CoinSystemService();
  bool _isTransferringCoins = false;
  String? _pendingTransferKey;
  String? _pendingTransferRequestId;

  Future<Map<String, dynamic>> _loadProfile() async {
    final callable = FirebaseFunctions.instance.httpsCallable('getMemberProfile');
    final response = await callable.call(<String, dynamic>{
      'userId': widget.profileUserId,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<void> _showGiftCoinsDialog() async {
    final amountController = TextEditingController();
    final amount = await showDialog<int>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تحويل كوينز إلى العضو 🪙'),
        content: TextField(
          controller: amountController,
          autofocus: true,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'المبلغ الإجمالي للتحويل',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              final value = int.tryParse(amountController.text.trim());
              if (value != null && value > 0) Navigator.pop(dialogContext, value);
            },
            child: const Text('متابعة'),
          ),
        ],
      ),
    );
    amountController.dispose();
    if (amount == null || !mounted || _isTransferringCoins) return;
    await _quoteAndConfirmCoinTransfer(amount);
  }

  Future<void> _quoteAndConfirmCoinTransfer(int amount) async {
    setState(() => _isTransferringCoins = true);
    try {
      final quote = await _coinService.getTransferQuote(amount);
      if (!mounted) return;
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('مراجعة التحويل والعمولة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _summaryRow('المبلغ الذي سيُخصم منك', '${quote.grossAmount} كوين'),
              _summaryRow(
                'عمولة المنصة (${quote.commissionPercent.toStringAsFixed(2)}%)',
                '${quote.commissionAmount} كوين',
              ),
              const Divider(),
              _summaryRow('الصافي الذي سيصل للعضو', '${quote.netAmount} كوين'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('تأكيد التحويل'),
            ),
          ],
        ),
      );
      if (confirmed != true || !mounted) return;

      final transferKey = '${widget.profileUserId}:$amount';
      if (_pendingTransferKey != transferKey || _pendingTransferRequestId == null) {
        _pendingTransferKey = transferKey;
        _pendingTransferRequestId = const Uuid().v4();
      }
      final receipt = await _coinService.transferCoins(
        recipientUid: widget.profileUserId,
        amount: amount,
        requestId: _pendingTransferRequestId!,
        expectedCommissionBps: quote.commissionBps,
      );
      _pendingTransferKey = null;
      _pendingTransferRequestId = null;
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'تم التحويل: وصل ${receipt.netAmount} كوين، وعمولة المنصة ${receipt.commissionAmount} كوين. رقم العملية: ${receipt.transferId}',
          ),
        ),
      );
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إتمام التحويل. حاول مرة أخرى.')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('حدث خطأ أثناء التحويل. لم نعرض نجاحاً غير مؤكد.')),
      );
    } finally {
      if (mounted) setState(() => _isTransferringCoins = false);
    }
  }

  Widget _summaryRow(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: Text(label)),
            const SizedBox(width: 12),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    final isMyProfile = widget.currentUserId == widget.profileUserId;
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي | مودة'),
        backgroundColor: Colors.black87,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _loadProfile(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.lock_outline, size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'تعذر عرض الملف. قد يكون خاصاً أو غير متاح حالياً.',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => setState(() {}),
                      child: const Text('إعادة المحاولة'),
                    ),
                  ],
                ),
              ),
            );
          }

          final data = snapshot.data!;
          final name = (data['displayName'] as String?) ?? 'Mawda Member';
          final username = (data['username'] as String?) ?? '';
          final bio = (data['bio'] as String?) ?? '';
          final profession = (data['profession'] as String?) ?? '';
          final country = (data['country'] as String?) ?? '';
          final region = (data['region'] as String?) ?? '';
          final interests = (data['interests'] as List<dynamic>? ?? const []);

          return ListView(
            padding: const EdgeInsets.only(bottom: 32),
            children: [
              Container(
                height: 150,
                color: Colors.blueGrey.shade900,
                child: const Center(
                  child: Icon(Icons.favorite, color: Colors.white, size: 52),
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -42),
                child: CircleAvatar(
                  radius: 48,
                  backgroundColor: Colors.deepPurple,
                  child: Text(
                    name.isNotEmpty ? name.substring(0, 1) : 'M',
                    style: const TextStyle(fontSize: 32, color: Colors.white),
                  ),
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -30),
                child: Column(
                  children: [
                    Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    if (username.isNotEmpty) Text('@$username'),
                    if (bio.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                        child: Text(bio, textAlign: TextAlign.center),
                      ),
                    if (profession.isNotEmpty || region.isNotEmpty || country.isNotEmpty)
                      Text([profession, region, country].where((value) => value.isNotEmpty).join(' • ')),
                    if (interests.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          alignment: WrapAlignment.center,
                          children: interests.map((item) => Chip(label: Text('$item'))).toList(),
                        ),
                      ),
                  ],
                ),
              ),
              if (!isMyProfile)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.monetization_on),
                    label: Text(_isTransferringCoins ? 'جارٍ التحويل...' : 'إهداء كوينز'),
                    onPressed: _isTransferringCoins ? null : _showGiftCoinsDialog,
                  ),
                ),
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'تُعرض هنا المعلومات التي سمح العضو بمشاركتها فقط. معرض الصور والمزايا المدفوعة سيُعاد تفعليهما بعد اكتمال خدمات الوسائط والتحقق من صلاحياتها.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
