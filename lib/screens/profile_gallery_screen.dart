import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../services/member_media_upload_service.dart';

/// Shows only scanner-approved, short-lived safe derivatives. Originals remain
/// private in quarantine and gallery entries expire automatically after 7 days.
class ProfileGalleryScreen extends StatefulWidget {
  final String profileUserId;
  final String currentUserId;

  const ProfileGalleryScreen({
    super.key,
    required this.profileUserId,
    required this.currentUserId,
  });

  @override
  State<ProfileGalleryScreen> createState() => _ProfileGalleryScreenState();
}

class _ProfileGalleryScreenState extends State<ProfileGalleryScreen> {
  final ImagePicker _picker = ImagePicker();
  final MemberMediaUploadService _media = MemberMediaUploadService();
  late Future<List<Map<String, dynamic>>> _galleryFuture;
  bool _uploading = false;

  bool get _isOwner => widget.profileUserId == widget.currentUserId;

  @override
  void initState() {
    super.initState();
    _galleryFuture = _loadGallery();
  }

  Future<List<Map<String, dynamic>>> _loadGallery() {
    return _media.getProfileGalleryItems(userId: widget.profileUserId);
  }

  Future<void> _uploadImage() async {
    if (!_isOwner || _uploading) return;
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 88,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (file == null || !mounted) return;

    setState(() => _uploading = true);
    try {
      await _media.uploadImage(file: file, purpose: 'profile_album');
      if (!mounted) return;
      setState(() => _galleryFuture = _loadGallery());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تمت إضافة الصورة بعد اجتياز الفحص الأمني.'),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تعذر إضافة الصورة: $error')),
      );
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  void dispose() {
    _media.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('معرض الصور')),
      floatingActionButton: _isOwner
          ? FloatingActionButton.extended(
              onPressed: _uploading ? null : _uploadImage,
              icon: _uploading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.add_photo_alternate_outlined),
              label: Text(_uploading ? 'جارٍ الفحص...' : 'إضافة صورة'),
            )
          : null,
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Text(
              'تظهر هنا الصور التي اجتازت الفحص الأمني فقط. '
              'تُحذف صور المعرض تلقائياً بعد 7 أيام من رفعها.',
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _galleryFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.cloud_off_outlined, size: 40),
                          const SizedBox(height: 12),
                          const Text('تعذر تحميل معرض الصور.'),
                          TextButton(
                            onPressed: () => setState(
                              () => _galleryFuture = _loadGallery(),
                            ),
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                final items = snapshot.data ?? const [];
                if (items.isEmpty) {
                  return RefreshIndicator(
                    onRefresh: () async {
                      setState(() => _galleryFuture = _loadGallery());
                      await _galleryFuture;
                    },
                    child: ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: const [
                        SizedBox(height: 100),
                        Icon(Icons.photo_library_outlined, size: 56),
                        SizedBox(height: 12),
                        Center(child: Text('لا توجد صور نشطة في المعرض حالياً.')),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async {
                    setState(() => _galleryFuture = _loadGallery());
                    await _galleryFuture;
                  },
                  child: GridView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 96),
                    physics: const AlwaysScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 0.82,
                    ),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      final url = item['url'] as String;
                      final expiry = item['expiresAt'] is int
                          ? DateTime.fromMillisecondsSinceEpoch(
                              item['expiresAt'] as int,
                            )
                          : null;
                      return ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Material(
                          color: Theme.of(context).colorScheme.surfaceContainer,
                          child: Column(
                            children: [
                              Expanded(
                                child: Image.network(
                                  url,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(Icons.broken_image_outlined),
                                  ),
                                ),
                              ),
                              if (expiry != null)
                                Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Text(
                                    'تنتهي ${MaterialLocalizations.of(context).formatMediumDate(expiry)}',
                                    style:
                                        Theme.of(context).textTheme.bodySmall,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
