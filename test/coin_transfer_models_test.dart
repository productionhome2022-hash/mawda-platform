import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/services/coin_system_service.dart';

void main() {
  group('CoinTransferQuote', () {
    test('parses a 20 percent transfer quote correctly', () {
      final quote = CoinTransferQuote.fromMap({
        'grossAmount': 1000,
        'commissionBps': 2000,
        'commissionAmount': 200,
        'netAmount': 800,
      });

      expect(quote.grossAmount, 1000);
      expect(quote.commissionBps, 2000);
      expect(quote.commissionPercent, 20);
      expect(quote.commissionAmount, 200);
      expect(quote.netAmount, 800);
    });

    test('parses a zero commission quote', () {
      final quote = CoinTransferQuote.fromMap({
        'grossAmount': 875,
        'commissionBps': 0,
        'commissionAmount': 0,
        'netAmount': 875,
      });

      expect(quote.commissionPercent, 0);
      expect(quote.netAmount, quote.grossAmount);
    });
  });

  group('CoinTransferReceipt', () {
    test('retains the unified transfer id and idempotency result', () {
      final receipt = CoinTransferReceipt.fromMap({
        'transferId': 'sender_request-123456',
        'grossAmount': 1000,
        'commissionBps': 2000,
        'commissionAmount': 200,
        'netAmount': 800,
        'idempotentReplay': true,
      });

      expect(receipt.transferId, 'sender_request-123456');
      expect(receipt.idempotentReplay, isTrue);
      expect(receipt.netAmount, 800);
    });
  });
}
