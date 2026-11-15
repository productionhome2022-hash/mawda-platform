int? _directMessageTimestampMillis(dynamic value) {
  if (value is num && value.isFinite) return value.toInt();
  if (value is DateTime) return value.millisecondsSinceEpoch;
  return null;
}

/// Merges a message page by immutable message ID and sorts by timestamp + ID.
/// Incoming copies replace cached copies so server-computed read state stays fresh.
List<Map<String, dynamic>> mergeDirectMessagePages({
  required List<Map<String, dynamic>> existing,
  required List<Map<String, dynamic>> incoming,
}) {
  final byId = <String, Map<String, dynamic>>{};
  for (final message in [...existing, ...incoming]) {
    final id = message['messageId'];
    if (id is! String || id.isEmpty) continue;
    byId[id] = Map<String, dynamic>.from(message);
  }

  final merged = byId.values.toList(growable: true);
  merged.sort((a, b) {
    final aTime = _directMessageTimestampMillis(a['createdAt']) ?? -1;
    final bTime = _directMessageTimestampMillis(b['createdAt']) ?? -1;
    final byTimestamp = aTime.compareTo(bTime);
    if (byTimestamp != 0) return byTimestamp;
    return (a['messageId'] as String).compareTo(b['messageId'] as String);
  });
  return merged;
}

/// Reconciles outgoing read indicators from the peer's monotonic read cursor.
List<Map<String, dynamic>> applyPeerReadCursor({
  required List<Map<String, dynamic>> messages,
  required String currentUserId,
  required dynamic peerLastReadAt,
}) {
  final cursor = peerLastReadAt is num ? peerLastReadAt.toInt() : null;
  return messages.map((message) {
    final copy = Map<String, dynamic>.from(message);
    if (copy['senderUid'] == currentUserId) {
      final createdAt = _directMessageTimestampMillis(copy['createdAt']);
      copy['isReadByPeer'] = cursor != null && createdAt != null && createdAt <= cursor;
    }
    return copy;
  }).toList(growable: false);
}
