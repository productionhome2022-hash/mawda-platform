import 'package:flutter/material.dart';

import '../services/member_media_upload_service.dart';

Future<Map<String, dynamic>?> showMawddaStickerPicker({
  required BuildContext context,
  required MemberMediaUploadService service,
}) {
  return showModalBottomSheet<Map<String, dynamic>>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _MawddaStickerPicker(service: service),
  );
}

class _MawddaStickerPicker extends StatefulWidget {
  const _MawddaStickerPicker({required this.service});

  final MemberMediaUploadService service;

  @override
  State<_MawddaStickerPicker> createState() => _MawddaStickerPickerState();
}

class _MawddaStickerPickerState extends State<_MawddaStickerPicker> {
  late Future<List<Map<String, dynamic>>> _catalogFuture;
  final Map<String, Future<String>> _assetUrlFutures = {};
  String? _selectedPackId;

  @override
  void initState() {
    super.initState();
    _catalogFuture = widget.service.getStickerCatalog();
  }

  Future<String> _assetUrl(String packId, String stickerId) {
    final key = '$packId:$stickerId';
    return _assetUrlFutures.putIfAbsent(
      key,
      () => widget.service.getStickerAssetUrl(packId: packId, stickerId: stickerId),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.68,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text('ملصقات مودة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                ),
                IconButton(
                  tooltip: 'إغلاق',
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            Expanded(
              child: FutureBuilder<List<Map<String, dynamic>>>(
                future: _catalogFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError) {
                    return Center(child: Text('تعذر تحميل الملصقات: ${snapshot.error}'));
                  }
                  final packs = snapshot.data ?? const <Map<String, dynamic>>[];
                  if (packs.isEmpty) {
                    return const Center(child: Text('لا توجد حزم ملصقات منشورة حالياً.'));
                  }
                  final selected = packs.firstWhere(
                    (pack) => pack['packId'] == _selectedPackId,
                    orElse: () => packs.first,
                  );
                  final stickers = (selected['stickers'] as List<dynamic>? ?? const [])
                      .whereType<Map>()
                      .map((item) => Map<String, dynamic>.from(item))
                      .toList(growable: false);
                  return Column(
                    children: [
                      SizedBox(
                        height: 48,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: packs.map((pack) {
                            final id = pack['packId'] as String? ?? '';
                            final active = id == selected['packId'];
                            return Padding(
                              padding: const EdgeInsetsDirectional.only(end: 8),
                              child: ChoiceChip(
                                label: Text(pack['title'] as String? ?? id),
                                selected: active,
                                onSelected: (_) => setState(() => _selectedPackId = id),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: GridView.builder(
                          itemCount: stickers.length,
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 4,
                            mainAxisSpacing: 8,
                            crossAxisSpacing: 8,
                          ),
                          itemBuilder: (context, index) {
                            final sticker = stickers[index];
                            final packId = selected['packId'] as String? ?? '';
                            final stickerId = sticker['stickerId'] as String? ?? '';
                            return InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: packId.isEmpty || stickerId.isEmpty
                                  ? null
                                  : () => Navigator.pop(context, {
                                        'packId': packId,
                                        'stickerId': stickerId,
                                      }),
                              child: DecoratedBox(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(6),
                                  child: FutureBuilder<String>(
                                    future: _assetUrl(packId, stickerId),
                                    builder: (context, imageSnapshot) {
                                      if (imageSnapshot.connectionState == ConnectionState.waiting) {
                                        return const Center(
                                          child: SizedBox(
                                            width: 20,
                                            height: 20,
                                            child: CircularProgressIndicator(strokeWidth: 2),
                                          ),
                                        );
                                      }
                                      final url = imageSnapshot.data;
                                      if (url == null) {
                                        return const Icon(Icons.broken_image_outlined);
                                      }
                                      return Image.network(
                                        url,
                                        fit: BoxFit.contain,
                                        errorBuilder: (_, __, ___) =>
                                            const Icon(Icons.broken_image_outlined),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MawddaStickerMessage extends StatefulWidget {
  const MawddaStickerMessage({
    super.key,
    required this.service,
    required this.packId,
    required this.stickerId,
  });

  final MemberMediaUploadService service;
  final String packId;
  final String stickerId;

  @override
  State<MawddaStickerMessage> createState() => _MawddaStickerMessageState();
}

class _MawddaStickerMessageState extends State<MawddaStickerMessage> {
  late Future<String> _urlFuture;

  @override
  void initState() {
    super.initState();
    _urlFuture = widget.service.getStickerAssetUrl(
      packId: widget.packId, stickerId: widget.stickerId,
    );
  }

  @override
  void didUpdateWidget(covariant MawddaStickerMessage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.packId != widget.packId || oldWidget.stickerId != widget.stickerId) {
      _urlFuture = widget.service.getStickerAssetUrl(
        packId: widget.packId, stickerId: widget.stickerId,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: _urlFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const SizedBox(
            width: 112,
            height: 112,
            child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
          );
        }
        final url = snapshot.data;
        if (url == null) {
          return const SizedBox(
            width: 112,
            height: 112,
            child: Center(child: Icon(Icons.broken_image_outlined)),
          );
        }
        return Image.network(
          url,
          width: 144,
          height: 144,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => const SizedBox(
            width: 112,
            height: 112,
            child: Center(child: Icon(Icons.broken_image_outlined)),
          ),
        );
      },
    );
  }
}
