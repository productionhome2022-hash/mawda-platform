import 'dart:typed_data';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

/// Client for the trusted media-intake pipeline. The original upload URL is
/// short-lived and create-only; the app never reads or displays quarantine data.
class MemberMediaUploadService {
  MemberMediaUploadService({
    FirebaseFunctions? functions,
    http.Client? client,
  })  : _functions = functions ?? FirebaseFunctions.instance,
        _client = client ?? http.Client();

  final FirebaseFunctions _functions;
  final http.Client _client;

  String _imageContentType(XFile file) {
    final supplied = file.mimeType?.toLowerCase();
    if (supplied == 'image/jpeg' ||
        supplied == 'image/png' ||
        supplied == 'image/webp' ||
        supplied == 'image/gif') {
      return supplied!;
    }
    final name = file.name.toLowerCase();
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.gif')) return 'image/gif';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    throw const FormatException('صيغة الصورة غير مدعومة.');
  }

  Future<String> uploadImage({
    required XFile file,
    required String purpose,
    int? storyExpiresAtMs,
  }) async {
    if (!const {'avatar_cover', 'story', 'profile_album'}.contains(purpose)) {
      throw ArgumentError.value(purpose, 'purpose');
    }
    if (purpose == 'story' &&
        (storyExpiresAtMs == null ||
            storyExpiresAtMs <= DateTime.now().millisecondsSinceEpoch)) {
      throw ArgumentError('يجب تحديد موعد انتهاء مستقبلي للقصة.');
    }
    final Uint8List bytes = await file.readAsBytes();
    if (bytes.isEmpty) throw const FormatException('ملف الصورة فارغ.');
    final contentType = _imageContentType(file);
    final request = <String, dynamic>{
      'originalName': file.name,
      'contentType': contentType,
      'sizeBytes': bytes.length,
      'purpose': purpose,
      if (purpose == 'story') 'storyExpiresAtMs': storyExpiresAtMs,
    };
    final intentResponse =
        await _functions.httpsCallable('createMediaUploadIntent').call(request);
    final intent = Map<String, dynamic>.from(intentResponse.data as Map);
    final uploadUrl = intent['uploadUrl'] as String?;
    final mediaId = intent['mediaId'] as String?;
    final headers = Map<String, dynamic>.from(
      intent['requiredHeaders'] as Map? ?? const <String, dynamic>{},
    );
    if (uploadUrl == null || mediaId == null || headers.isEmpty) {
      throw StateError('استجابة طلب الرفع غير مكتملة.');
    }

    final uploadResponse = await _client.put(
      Uri.parse(uploadUrl),
      headers: headers.map((key, value) => MapEntry(key, '$value')),
      body: bytes,
    );
    if (uploadResponse.statusCode != 200) {
      throw StateError('فشل رفع الصورة إلى التخزين الآمن (HTTP ${uploadResponse.statusCode}).');
    }

    await _functions.httpsCallable('finalizeMediaUpload').call({'mediaId': mediaId});
    return mediaId;
  }

  Future<void> selectProfileImage({
    required String mediaId,
    required String slot,
  }) async {
    if (slot != 'avatar' && slot != 'cover') {
      throw ArgumentError.value(slot, 'slot');
    }
    await _functions.httpsCallable('setMemberProfileMedia').call({
      'mediaId': mediaId,
      'slot': slot,
    });
  }

  Future<String?> getSafeProfileImageUrl({
    required String userId,
    required String slot,
  }) async {
    final response = await _functions
        .httpsCallable('getMemberProfileMediaUrl')
        .call({'userId': userId, 'slot': slot});
    final data = Map<String, dynamic>.from(response.data as Map);
    return data['url'] as String?;
  }

  void close() => _client.close();
}
