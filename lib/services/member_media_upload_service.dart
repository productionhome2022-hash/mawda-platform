import 'dart:async';
import 'dart:typed_data';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import 'media_status_polling.dart';

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

  int _maxBytesForContentType(String contentType) {
    if (contentType.startsWith('image/')) return 3 * 1024 * 1024;
    if (contentType.startsWith('audio/')) return 5 * 1024 * 1024;
    if (contentType == 'video/mp4') return 25 * 1024 * 1024;
    if (contentType == 'application/pdf') return 20 * 1024 * 1024;
    throw const FormatException('نوع الملف غير مدعوم.');
  }

  Future<void> _validateFileLength(XFile file, String contentType) async {
    final length = await file.length();
    if (length <= 0) throw const FormatException('ملف المرفق فارغ.');
    if (length > _maxBytesForContentType(contentType)) {
      throw const FormatException('حجم الملف يتجاوز الحد المسموح لهذا النوع.');
    }
  }


  String _biometricContentType(XFile file, {required bool audio}) {
    final expected = audio ? 'audio/mp4' : 'video/mp4';
    final supplied = file.mimeType?.toLowerCase();
    if (supplied != null && supplied.isNotEmpty && supplied != expected) {
      throw const FormatException('صيغة ملف التوثيق غير مدعومة.');
    }
    final name = file.name.toLowerCase();
    if (audio && (name.endsWith('.m4a') || name.endsWith('.mp4'))) return expected;
    if (!audio && name.endsWith('.mp4')) return expected;
    throw const FormatException('الصوت يجب أن يكون M4A والفيديو MP4.');
  }

  Future<Map<String, dynamic>> startBiometricVerificationRequest() async {
    final response = await _functions
        .httpsCallable('startBiometricVerificationRequest')
        .call();
    final data = Map<String, dynamic>.from(response.data as Map);
    if (data['requestId'] is! String || data['phrase'] is! String ||
        data['uploadPurpose'] != 'biometric') {
      throw StateError('استجابة بدء التوثيق البيومتري غير مكتملة.');
    }
    return data;
  }

  Future<String> _uploadBiometricEvidenceFile({
    required XFile file,
    required String requestId,
    required bool audio,
  }) async {
    if (requestId.isEmpty) throw ArgumentError.value(requestId, 'requestId');
    final contentType = _biometricContentType(file, audio: audio);
    await _validateFileLength(file, contentType);
    final bytes = await file.readAsBytes();
    final intentResponse = await _functions.httpsCallable('createMediaUploadIntent').call({
      'originalName': file.name,
      'contentType': contentType,
      'sizeBytes': bytes.length,
      'purpose': 'biometric',
      'biometricRequestId': requestId,
    });
    final intent = Map<String, dynamic>.from(intentResponse.data as Map);
    final uploadUrl = intent['uploadUrl'] as String?;
    final mediaId = intent['mediaId'] as String?;
    final headers = Map<String, dynamic>.from(
      intent['requiredHeaders'] as Map? ?? const <String, dynamic>{},
    );
    if (uploadUrl == null || mediaId == null || headers.isEmpty) {
      throw StateError('استجابة رفع دليل التوثيق غير مكتملة.');
    }
    final uploadResponse = await _client.put(
      Uri.parse(uploadUrl),
      headers: headers.map((key, value) => MapEntry(key, '$value')),
      body: bytes,
    );
    if (uploadResponse.statusCode != 200) {
      throw StateError('فشل رفع دليل التوثيق إلى التخزين الآمن (HTTP ${uploadResponse.statusCode}).');
    }
    await _functions.httpsCallable('finalizeMediaUpload').call({'mediaId': mediaId});
    await waitForSafeAttachmentApproval(mediaId);
    return mediaId;
  }

  Future<String> uploadBiometricAudio({
    required XFile file,
    required String requestId,
  }) => _uploadBiometricEvidenceFile(file: file, requestId: requestId, audio: true);

  Future<String> uploadBiometricVideo({
    required XFile file,
    required String requestId,
  }) => _uploadBiometricEvidenceFile(file: file, requestId: requestId, audio: false);

  Future<void> submitBiometricVerificationRequest({
    required String requestId,
  }) async {
    await _functions.httpsCallable('submitBiometricVerificationRequest').call({
      'requestId': requestId,
    });
  }

  Future<List<Map<String, dynamic>>> listOwnerBiometricVerificationRequests() async {
    final response = await _functions
        .httpsCallable('listOwnerBiometricVerificationRequests')
        .call();
    final data = Map<String, dynamic>.from(response.data as Map);
    final requests = data['requests'] as List<dynamic>? ?? const [];
    return requests.whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> getOwnerBiometricEvidencePlayback({
    required String requestId,
  }) async {
    final response = await _functions
        .httpsCallable('getOwnerBiometricEvidencePlayback')
        .call({'requestId': requestId});
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<Map<String, dynamic>> decideBiometricVerificationRequest({
    required String requestId,
    required bool accepted,
  }) async {
    final response = await _functions
        .httpsCallable('decideBiometricVerificationRequest')
        .call({
      'requestId': requestId,
      'decision': accepted ? 'accepted' : 'rejected',
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<String> uploadImage({
    required XFile file,
    required String purpose,
    int? storyExpiresAtMs,
  }) async {
    if (!const {'avatar_cover', 'story', 'profile_album', 'chat', 'room'}.contains(purpose)) {
      throw ArgumentError.value(purpose, 'purpose');
    }
    if (purpose == 'story' &&
        (storyExpiresAtMs == null ||
            storyExpiresAtMs <= DateTime.now().millisecondsSinceEpoch)) {
      throw ArgumentError('يجب تحديد موعد انتهاء مستقبلي للقصة.');
    }
    final contentType = _imageContentType(file);
    await _validateFileLength(file, contentType);
    final Uint8List bytes = await file.readAsBytes();
    if ((purpose == 'chat' || purpose == 'room') && contentType == 'image/gif') {
      throw const FormatException(
        'إرسال الصور المتحركة GIF سيفتح بعد تفعيل معالج GIF الآمن؛ أرسل صورة ثابتة حالياً.',
      );
    }
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
    await waitForSafeApproval(mediaId);
    return mediaId;
  }

  Future<void> waitForSafeApproval(
    String mediaId, {
    Duration timeout = const Duration(seconds: 90),
  }) async {
    final deadline = DateTime.now().add(timeout);
    var pollCount = 0;
    while (DateTime.now().isBefore(deadline)) {
      final response = await _functions
          .httpsCallable('getMyMediaUploadStatus')
          .call({'mediaId': mediaId});
      final status = Map<String, dynamic>.from(response.data as Map);
      if (status['safePreviewReady'] == true) return;
      if (status['status'] == 'rejected') {
        throw StateError('رفض نظام الفحص الصورة: ${status['rejectionCode'] ?? 'MEDIA_REJECTED'}');
      }
      if (status['status'] == 'self_destructed' ||
          status['status'] == 'expired' ||
          status['status'] == 'manually_deleted') {
        throw StateError('انتهت صلاحية الصورة قبل اكتمال الفحص.');
      }
      final delay = mediaStatusPollDelay(pollCount);
      pollCount++;
      final remaining = deadline.difference(DateTime.now());
      await Future<void>.delayed(delay < remaining ? delay : remaining);
    }
    throw TimeoutException('لم يكتمل فحص الصورة خلال المهلة المحددة؛ بقيت الصورة غير متاحة.', timeout);
  }

  String _chatAttachmentContentType(XFile file) {
    final supplied = file.mimeType?.toLowerCase();
    const allowed = {
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav',
      'video/mp4', 'application/pdf',
    };
    if (supplied != null && allowed.contains(supplied)) return supplied;
    final name = file.name.toLowerCase();
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.gif')) return 'image/gif';
    if (name.endsWith('.mp3')) return 'audio/mpeg';
    if (name.endsWith('.m4a')) return 'audio/mp4';
    if (name.endsWith('.ogg')) return 'audio/ogg';
    if (name.endsWith('.wav')) return 'audio/wav';
    if (name.endsWith('.mp4')) return 'video/mp4';
    if (name.endsWith('.pdf')) return 'application/pdf';
    throw const FormatException('نوع المرفق غير مدعوم؛ المسموح الصور وGIF والصوت وMP4 وPDF.');
  }

  Future<String> uploadChatAttachment({
    required XFile file,
    required String scope,
  }) async {
    if (scope != 'direct' && scope != 'room') {
      throw ArgumentError.value(scope, 'scope');
    }
    final contentType = _chatAttachmentContentType(file);
    await _validateFileLength(file, contentType);
    final bytes = await file.readAsBytes();
    final intentResponse = await _functions.httpsCallable('createMediaUploadIntent').call({
      'originalName': file.name,
      'contentType': contentType,
      'sizeBytes': bytes.length,
      'purpose': scope == 'direct' ? 'chat' : 'room',
    });
    final intent = Map<String, dynamic>.from(intentResponse.data as Map);
    final uploadUrl = intent['uploadUrl'] as String?;
    final mediaId = intent['mediaId'] as String?;
    final headers = Map<String, dynamic>.from(
      intent['requiredHeaders'] as Map? ?? const <String, dynamic>{},
    );
    if (uploadUrl == null || mediaId == null || headers.isEmpty) {
      throw StateError('استجابة طلب رفع المرفق غير مكتملة.');
    }
    final uploadResponse = await _client.put(
      Uri.parse(uploadUrl),
      headers: headers.map((key, value) => MapEntry(key, '$value')),
      body: bytes,
    );
    if (uploadResponse.statusCode != 200) {
      throw StateError('فشل رفع المرفق الآمن (HTTP ${uploadResponse.statusCode}).');
    }
    await _functions.httpsCallable('finalizeMediaUpload').call({'mediaId': mediaId});
    await waitForSafeAttachmentApproval(mediaId);
    return mediaId;
  }

  Future<void> waitForSafeAttachmentApproval(
    String mediaId, {
    Duration timeout = const Duration(minutes: 3),
  }) async {
    final deadline = DateTime.now().add(timeout);
    var pollCount = 0;
    while (DateTime.now().isBefore(deadline)) {
      final response = await _functions.httpsCallable('getMyMediaUploadStatus')
          .call({'mediaId': mediaId});
      final status = Map<String, dynamic>.from(response.data as Map);
      if (status['safeDerivativeReady'] == true) return;
      if (status['status'] == 'rejected') {
        throw StateError('رفض نظام الأمان المرفق: ${status['rejectionCode'] ?? 'MEDIA_REJECTED'}');
      }
      if (['self_destructed', 'expired', 'manually_deleted'].contains(status['status'])) {
        throw StateError('انتهت صلاحية المرفق قبل اكتمال المعالجة.');
      }
      final delay = mediaStatusPollDelay(pollCount);
      pollCount++;
      final remaining = deadline.difference(DateTime.now());
      await Future<void>.delayed(delay < remaining ? delay : remaining);
    }
    throw TimeoutException('لم تكتمل معالجة المرفق الآمنة؛ بقي غير قابل للإرسال.', timeout);
  }

  Future<Map<String, dynamic>> sendChatMediaAttachment({
    required String scope,
    required String mediaId,
    required String clientMessageId,
    String? recipientUid,
    String? roomId,
    String caption = '',
  }) async {
    if (scope != 'direct' && scope != 'room') throw ArgumentError.value(scope, 'scope');
    if (scope == 'direct' && (recipientUid == null || recipientUid.isEmpty)) {
      throw ArgumentError('recipientUid is required for direct messages.');
    }
    if (scope == 'room' && (roomId == null || roomId.isEmpty)) {
      throw ArgumentError('roomId is required for room messages.');
    }
    final response = await _functions.httpsCallable('sendChatMediaAttachment').call({
      'scope': scope,
      'mediaId': mediaId,
      'clientMessageId': clientMessageId,
      'caption': caption,
      if (recipientUid != null) 'recipientUid': recipientUid,
      if (roomId != null) 'roomId': roomId,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<String> getChatMediaAttachmentUrl({
    required String scope,
    required String mediaId,
    required String messageId,
    String? chatId,
    String? roomId,
  }) async {
    final response = await _functions.httpsCallable('getChatMediaAttachmentUrl').call({
      'scope': scope,
      'mediaId': mediaId,
      'messageId': messageId,
      if (chatId != null) 'chatId': chatId,
      if (roomId != null) 'roomId': roomId,
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    final url = data['url'];
    if (url is! String || url.isEmpty) {
      throw StateError('لم يُرجع الخادم رابط المرفق الآمن.');
    }
    return url;
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

  Future<List<Map<String, dynamic>>> getProfileGalleryItems({
    required String userId,
  }) async {
    final response = await _functions
        .httpsCallable('listMemberProfileGallery')
        .call({'userId': userId});
    final data = Map<String, dynamic>.from(response.data as Map);
    final rawItems = data['items'] as List<dynamic>? ?? const [];
    return rawItems
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .where((item) => item['url'] is String && item['mediaId'] is String)
        .toList(growable: false);
  }

  Future<Map<String, dynamic>> sendChatImageAttachment({
    required String scope,
    required String mediaId,
    required String clientMessageId,
    String? recipientUid,
    String? roomId,
    String caption = '',
  }) async {
    if (scope != 'direct' && scope != 'room') {
      throw ArgumentError.value(scope, 'scope');
    }
    if (scope == 'direct' && (recipientUid == null || recipientUid.isEmpty)) {
      throw ArgumentError('recipientUid is required for direct messages.');
    }
    if (scope == 'room' && (roomId == null || roomId.isEmpty)) {
      throw ArgumentError('roomId is required for room messages.');
    }
    final response = await _functions.httpsCallable('sendChatImageAttachment').call({
      'scope': scope,
      'mediaId': mediaId,
      'clientMessageId': clientMessageId,
      'caption': caption,
      if (recipientUid != null) 'recipientUid': recipientUid,
      if (roomId != null) 'roomId': roomId,
    });
    return Map<String, dynamic>.from(response.data as Map);
  }

  Future<String> getChatImageAttachmentUrl({
    required String scope,
    required String mediaId,
    required String messageId,
    String? chatId,
    String? roomId,
  }) async {
    final response = await _functions.httpsCallable('getChatImageAttachmentUrl').call({
      'scope': scope,
      'mediaId': mediaId,
      'messageId': messageId,
      if (chatId != null) 'chatId': chatId,
      if (roomId != null) 'roomId': roomId,
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    final url = data['url'];
    if (url is! String || url.isEmpty) {
      throw StateError('لم يُرجع الخادم رابط الصورة الآمن.');
    }
    return url;
  }

  void close() => _client.close();
}
