import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../services/member_media_upload_service.dart';

class StoriesScreen extends StatefulWidget {
  final String currentUserId;

  const StoriesScreen({super.key, required this.currentUserId});

  @override
  State<StoriesScreen> createState() => _StoriesScreenState();
}

class _StoriesScreenState extends State<StoriesScreen> {
  final ImagePicker _picker = ImagePicker();
  final MemberMediaUploadService _media = MemberMediaUploadService();
  bool _busy = false;
  late Future<List<Map<String, dynamic>>> _storiesFuture;

  @override
  void initState() {
    super.initState();
    _storiesFuture = _loadStories();
  }

  @override
  void dispose() {
    _media.close();
    super.dispose();
  }

  Future<List<Map<String, dynamic>>> _loadStories() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('listMemberStories')
        .call(<String, dynamic>{});
    final data = Map<String, dynamic>.from(response.data as Map);
    final stories = (data['stories'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((entry) => Map<String, dynamic>.from(entry))
        .toList(growable: false);
    // Resolve previews in small parallel batches: avoid serial latency without
    // issuing an unbounded burst of signed-URL requests.
    for (var offset = 0; offset < stories.length; offset += 5) {
      final end = offset + 5 < stories.length ? offset + 5 : stories.length;
      await Future.wait(stories.sublist(offset, end).map(_loadStoryPreview));
    }
    return stories;
  }

  Future<void> _loadStoryPreview(Map<String, dynamic> story) async {
    try {
      final preview = await FirebaseFunctions.instance
          .httpsCallable('getMemberStoryMediaUrl')
          .call({'storyId': story['storyId']});
      story['previewUrl'] =
          (Map<String, dynamic>.from(preview.data as Map))['url'];
    } catch (_) {
      story['previewUrl'] = null;
    }
  }

  void _openStoryViewer(int initialIndex, List<Map<String, dynamic>> stories) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _StoryViewer(
          stories: stories,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  Future<void> _createStory() async {
    if (_busy) return;
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 88,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (file == null || !mounted) return;

    final today = DateTime.now();
    final selectedDate = await showDatePicker(
      context: context,
      initialDate: today.add(const Duration(days: 1)),
      firstDate: today,
      lastDate: today.add(const Duration(days: 365)),
      helpText: 'حدد تاريخ انتهاء القصة',
    );
    if (selectedDate == null || !mounted) return;
    final selectedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(today.add(const Duration(hours: 24))),
      helpText: 'حدد وقت انتهاء القصة',
    );
    if (selectedTime == null || !mounted) return;
    final expiry = DateTime(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      selectedTime.hour,
      selectedTime.minute,
    );
    if (!expiry.isAfter(DateTime.now())) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يجب أن يكون موعد انتهاء القصة في المستقبل.')),
      );
      return;
    }

    setState(() => _busy = true);
    try {
      final mediaId = await _media.uploadImage(
        file: file,
        purpose: 'story',
        storyExpiresAtMs: expiry.millisecondsSinceEpoch,
      );
      await FirebaseFunctions.instance.httpsCallable('createMemberStory')
          .call({'mediaId': mediaId});
      if (!mounted) return;
      setState(() => _storiesFuture = _loadStories());
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('نُشرت القصة بعد اجتياز فحص الأمان.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('تعذر نشر القصة: $error')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('قصص مودة'),
        actions: [
          IconButton(
            tooltip: 'تحديث القصص',
            onPressed: () => setState(() => _storiesFuture = _loadStories()),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _busy ? null : _createStory,
        icon: _busy
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
            : const Icon(Icons.add_a_photo_outlined),
        label: Text(_busy ? 'جارٍ الفحص والنشر...' : 'إضافة قصة'),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _storiesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('تعذر تحميل القصص.'),
                  TextButton(
                    onPressed: () => setState(() => _storiesFuture = _loadStories()),
                    child: const Text('إعادة المحاولة'),
                  ),
                ],
              ),
            );
          }
          final stories = snapshot.data ?? const [];
          if (stories.isEmpty) {
            return const Center(child: Text('لا توجد قصص نشطة حالياً.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
            itemCount: stories.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final story = stories[index];
              final previewUrl = story['previewUrl'] as String?;
              final expiresAt = story['expiresAt'] is int
                  ? DateTime.fromMillisecondsSinceEpoch(story['expiresAt'] as int)
                  : null;
              return InkWell(
                onTap: () => _openStoryViewer(index, stories),
                child: Card(
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (previewUrl != null)
                      Image.network(
                        previewUrl,
                        height: 300,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const SizedBox(
                          height: 120,
                          child: Center(child: Text('تعذر تحميل المعاينة الآمنة.')),
                        ),
                      )
                    else
                      const SizedBox(
                        height: 120,
                        child: Center(child: Icon(Icons.hourglass_empty)),
                      ),
                    ListTile(
                      title: Text(story['displayName'] as String? ?? 'عضو مودة'),
                      subtitle: Text(expiresAt == null
                          ? 'قصة نشطة'
                          : 'تنتهي في ${MaterialLocalizations.of(context).formatMediumDate(expiresAt)} • ${TimeOfDay.fromDateTime(expiresAt).format(context)}'),
                    ),
                  ],
                ),
              )),
            },
          );
        },
      ),
    );
  }
}


class _StoryViewer extends StatefulWidget {
  final List<Map<String, dynamic>> stories;
  final int initialIndex;

  const _StoryViewer({
    required this.stories,
    required this.initialIndex,
  });

  @override
  State<_StoryViewer> createState() => _StoryViewerState();
}

class _StoryViewerState extends State<_StoryViewer> {
  late final PageController _controller =
      PageController(initialPage: widget.initialIndex);
  late int _currentIndex = widget.initialIndex;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final story = widget.stories[_currentIndex];
    final expiresAt = story['expiresAt'] is int
        ? DateTime.fromMillisecondsSinceEpoch(story['expiresAt'] as int)
        : null;
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(story['displayName'] as String? ?? 'عضو مودة'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(3),
          child: LinearProgressIndicator(
            value: (_currentIndex + 1) / widget.stories.length,
            backgroundColor: Colors.white24,
          ),
        ),
      ),
      body: PageView.builder(
        controller: _controller,
        itemCount: widget.stories.length,
        onPageChanged: (index) => setState(() => _currentIndex = index),
        itemBuilder: (context, index) {
          final previewUrl = widget.stories[index]['previewUrl'] as String?;
          return Center(
            child: previewUrl == null
                ? const Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'المعاينة الآمنة غير متاحة حالياً.',
                      style: TextStyle(color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                  )
                : InteractiveViewer(
                    minScale: 1,
                    maxScale: 3,
                    child: Image.network(
                      previewUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Text(
                        'تعذر تحميل القصة.',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ),
          );
        },
      ),
      bottomNavigationBar: expiresAt == null
          ? null
          : Container(
              color: Colors.black,
              padding: const EdgeInsets.all(12),
              child: Text(
                'تنتهي القصة في ${MaterialLocalizations.of(context).formatMediumDate(expiresAt)} • ${TimeOfDay.fromDateTime(expiresAt).format(context)}',
                style: const TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            ),
    );
  }
}
