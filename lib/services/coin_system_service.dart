import 'package:cloud_functions/cloud_functions.dart';

class CoinTransferQuote {
  final int grossAmount;
  final int commissionBps;
  final int commissionAmount;
  final int netAmount;

  const CoinTransferQuote({
    required this.grossAmount,
    required this.commissionBps,
    required this.commissionAmount,
    required this.netAmount,
  });

  double get commissionPercent => commissionBps / 100;

  factory CoinTransferQuote.fromMap(Map<String, dynamic> data) {
    return CoinTransferQuote(
      grossAmount: (data['grossAmount'] as num).toInt(),
      commissionBps: (data['commissionBps'] as num).toInt(),
      commissionAmount: (data['commissionAmount'] as num).toInt(),
      netAmount: (data['netAmount'] as num).toInt(),
    );
  }
}

class CoinTransferReceipt extends CoinTransferQuote {
  final String transferId;
  final bool idempotentReplay;

  const CoinTransferReceipt({
    required super.grossAmount,
    required super.commissionBps,
    required super.commissionAmount,
    required super.netAmount,
    required this.transferId,
    required this.idempotentReplay,
  });

  factory CoinTransferReceipt.fromMap(Map<String, dynamic> data) {
    final quote = CoinTransferQuote.fromMap(data);
    return CoinTransferReceipt(
      grossAmount: quote.grossAmount,
      commissionBps: quote.commissionBps,
      commissionAmount: quote.commissionAmount,
      netAmount: quote.netAmount,
      transferId: data['transferId'] as String,
      idempotentReplay: data['idempotentReplay'] == true,
    );
  }
}

/// Wallet mutations are performed only by trusted Cloud Functions.
/// This client service deliberately has no method that edits coin balances.
class CoinSystemService {
  CoinSystemService({FirebaseFunctions? functions})
      : _functions = functions ?? FirebaseFunctions.instance;

  final FirebaseFunctions _functions;

  Future<CoinTransferQuote> getTransferQuote(int amount) async {
    final callable = _functions.httpsCallable('getTransferQuote');
    final response = await callable.call(<String, dynamic>{
      'amount': amount,
    });
    return CoinTransferQuote.fromMap(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  Future<CoinTransferReceipt> transferCoins({
    required String recipientUid,
    required int amount,
    required String requestId,
    required int expectedCommissionBps,
  }) async {
    final callable = _functions.httpsCallable('transferCoins');
    final response = await callable.call(<String, dynamic>{
      'recipientUid': recipientUid,
      'amount': amount,
      'requestId': requestId,
      'expectedCommissionBps': expectedCommissionBps,
    });
    return CoinTransferReceipt.fromMap(
      Map<String, dynamic>.from(response.data as Map),
    );
  }
}
