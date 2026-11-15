import 'package:flutter_test/flutter_test.dart';
import 'package:mawda_app/services/direct_message_page.dart';

void main() {
  test('merges message pages without duplicates and orders timestamp ties by ID', () {
    final merged = mergeDirectMessagePages(
      existing: [
        {'messageId': 'b', 'createdAt': 100, 'text': 'cached'},
        {'messageId': 'a', 'createdAt': 100, 'text': 'first'},
      ],
      incoming: [
        {'messageId': 'b', 'createdAt': 100, 'text': 'server copy'},
        {'messageId': 'c', 'createdAt': 101, 'text': 'new'},
      ],
    );

    expect(merged.map((message) => message['messageId']).toList(), ['a', 'b', 'c']);
    expect(merged.where((message) => message['messageId'] == 'b').length, 1);
    expect(merged[1]['text'], 'server copy');
  });

  test('reconciles outgoing read indicators without changing incoming messages', () {
    final updated = applyPeerReadCursor(
      currentUserId: 'alice',
      peerLastReadAt: 100,
      messages: [
        {'messageId': 'one', 'senderUid': 'alice', 'createdAt': 100, 'isReadByPeer': false},
        {'messageId': 'two', 'senderUid': 'alice', 'createdAt': 101, 'isReadByPeer': true},
        {'messageId': 'three', 'senderUid': 'bob', 'createdAt': 102, 'isReadByPeer': false},
      ],
    );

    expect(updated[0]['isReadByPeer'], true);
    expect(updated[1]['isReadByPeer'], false);
    expect(updated[2]['isReadByPeer'], false);
  });
}
