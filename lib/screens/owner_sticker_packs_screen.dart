import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../services/member_media_upload_service.dart';

class OwnerStickerPacksScreen extends StatefulWidget {
  const OwnerStickerPacksScreen({super.key});

  @override
  State<OwnerStickerPacksScreen> createState() => _OwnerStickerPacksScreenState();
}

class _OwnerStickerPacksScreenState extends State<OwnerStickerPacksScreen> {
  final _service = MemberMediaUploadService();
  final _packId = TextEditingController();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final List<Map<String, dynamic>> _stickers = [];
  bool _busy = false;

  @override
  void dispose() {
    _packId.dispose();
    _title.dispose();
    _description.dispose();
    _service.close();
    super.dispose();
  }

  Future<void> _pickSticker(String kind) async {
    if (_busy) return;
    if (_stickers.length >= 120) {
      _showMessage('بلغت الحزمة الحد الأقصى البالغ 120 ملصقاً.');
      return;
    }
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: kind == 'animated'
          ? const ['gif']
          : const ['png', 'webp'],
      allowMultiple: false,
      withData: true,
    );
    if (picked == null || picked.files.isEmpty || !mounted) return;
    final selected = picked.files.single;
    final XFile? file = selected.path != null && selected.path!.isNotEmpty
        ? XFile(selected.path!, name: selected.name)
        : selected.bytes != null
            ? XFile.fromData(selected.bytes!, name: selected.name)
            : null;
    if (file == null) {
      _showMessage('تعذر قراءة الملف المحدد.');
      return;
    }

    setState(() => _busy = true);
    try {
      final mediaId = await _service.uploadStickerAsset(file: file, kind: kind);
      final metadata = await _service.getStickerAssetMetadata(mediaId);
      final entry = <String, dynamic>{
        'stickerId': const Uuid().v4(),
        'assetId': mediaId,
        'kind': metadata['kind'],
        'contentType': metadata['contentType'],
        'width': metadata['width'],
        'height': metadata['height'],
        'sizeBytes': metadata['sizeBytes'],
        if (metadata['kind'] == 'animated') ...{
          'durationMs': metadata['durationMs'],
          'frameCount': metadata['frameCount'],
        },
      };
      if (!mounted) return;
      setState(() => _stickers.add(entry));
      _showMessage('اجتاز الملصق الفحص وأضيف إلى مسودة الحزمة.');
    } catch (error) {
      _showMessage('تعذر رفع الملصق أو اعتماد بياناته: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _save(String status) async {
    if (_busy) return;
    if (_packId.text.trim().isEmpty || _title.text.trim().isEmpty || _stickers.isEmpty) {
      _showMessage('أدخل معرف الحزمة وعنوانها وأضف ملصقاً واحداً على الأقل.');
      return;
    }
    setState(() => _busy = true);
    try {
      final result = await _service.saveStickerPack(
        packId: _packId.text.trim(),
        title: _title.text.trim(),
        description: _description.text.trim(),
        sortOrder: 0,
        status: status,
        stickers: List<Map<String, dynamic>>.from(_stickers),
      );
      if (!mounted) return;
      _showMessage(status == 'published'
          ? 'تم نشر الحزمة واعتماد أصولها المفحوصة.'
          : 'تم حفظ مسودة الحزمة.');
      if (status == 'published') {
        setState(() => _stickers.clear());
      }
      debugPrint('Sticker pack saved: $result');
    } catch (error) {
      _showMessage('تعذر حفظ حزمة الملصقات: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إدارة حزم الملصقات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'رفع الملصقات محصور بجلسة المالك الموثقة. لا يصبح أي أصل متاحاً للأعضاء إلا بعد الفحص والتحقق ثم نشر الحزمة.',
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _packId,
            maxLength: 80,
            decoration: const InputDecoration(
              labelText: 'معرف الحزمة',
              helperText: 'حروف إنجليزية وأرقام وشرطة أو شرطة سفلية',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _title,
            maxLength: 80,
            decoration: const InputDecoration(
              labelText: 'اسم الحزمة',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _description,
            maxLength: 240,
            minLines: 2,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'وصف الحزمة (اختياري)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _busy ? null : () => _pickSticker('static'),
            icon: const Icon(Icons.image_outlined),
            label: const Text('رفع ملصق ثابت PNG أو WebP (حتى 256 KiB)'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _busy ? null : () => _pickSticker('animated'),
            icon: const Icon(Icons.gif),
            label: const Text('رفع ملصق متحرك GIF (حتى 512 KiB)'),
          ),
          if (_busy) ...[
            const SizedBox(height: 12),
            const LinearProgressIndicator(),
            const SizedBox(height: 6),
            const Text('جارٍ الرفع أو انتظار نتيجة الفحص الأمني...'),
          ],
          const SizedBox(height: 16),
          Text('الملصقات المضافة: ${_stickers.length}/120',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ..._stickers.map((sticker) => Card(
                child: ListTile(
                  leading: Icon(sticker['kind'] == 'animated'
                      ? Icons.gif
                      : Icons.image_outlined),
                  title: Text(sticker['stickerId'] as String),
                  subtitle: Text(
                    '${sticker['contentType']} • ${sticker['width']}×${sticker['height']} • ${sticker['sizeBytes']} bytes',
                  ),
                  trailing: IconButton(
                    tooltip: 'إزالة من المسودة',
                    onPressed: _busy
                        ? null
                        : () => setState(() => _stickers.remove(sticker)),
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                ),
              )),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: _busy ? null : () => _save('published'),
            icon: const Icon(Icons.publish_outlined),
            label: const Text('حفظ ونشر الحزمة'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: _busy ? null : () => _save('draft'),
            child: const Text('حفظ كمسودة'),
          ),
        ],
      ),
    );
  }
}
