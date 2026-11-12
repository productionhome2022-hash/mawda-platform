import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'chat_room_screen.dart';

class RoomsScreen extends StatefulWidget {
  const RoomsScreen({super.key, required this.userId});
  final String userId;

  @override
  State<RoomsScreen> createState() => _RoomsScreenState();
}

class _RoomsScreenState extends State<RoomsScreen> {
  late Future<Map<String, dynamic>> _roomsFuture;
  bool _joining = false;

  @override
  void initState() {
    super.initState();
    _roomsFuture = _loadRooms();
  }

  Future<Map<String, dynamic>> _loadRooms() async {
    final result = await FirebaseFunctions.instance
        .httpsCallable('listMemberRooms')
        .call();
    return Map<String, dynamic>.from(result.data as Map);
  }

  void _refresh() {
    setState(() => _roomsFuture = _loadRooms());
  }

  Future<void> _join(Map<String, dynamic> room) async {
    if (_joining) return;
    setState(() => _joining = true);
    try {
      await FirebaseFunctions.instance.httpsCallable('joinRoom').call({
        'roomId': room['roomId'],
      });
      if (!mounted) return;
      _refresh();
      await _openRoom(room);
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر الانضمام إلى الغرفة.')),
      );
    } finally {
      if (mounted) setState(() => _joining = false);
    }
  }

  Future<void> _openRoom(Map<String, dynamic> room) async {
    await Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => ChatRoomScreen(
        chatId: room['roomId'] as String,
        currentUserId: widget.userId,
        isPublicRoom: room['kind'] == 'public',
        isSuperAdmin: room['isSuperAdmin'] == true,
        isRoomOwner: room['isRoomOwner'] == true,
        isModerator: room['isModerator'] == true,
        peerName: room['name'] as String?,
      ),
    ));
  }

  Widget _roomCard(Map<String, dynamic> room, {required bool joined}) {
    final count = room['memberCount'] is num
        ? (room['memberCount'] as num).toInt()
        : 0;
    final capacity = room['capacity'] is num
        ? (room['capacity'] as num).toInt()
        : 0;
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          child: Icon(joined ? Icons.forum_outlined : Icons.meeting_room_outlined),
        ),
        title: Text(room['name'] as String? ?? 'غرفة مودة'),
        subtitle: Text(
          '${room['kind'] == 'private' ? 'خاصة' : 'عامة'}'
          ' • الأعضاء: $count${capacity > 0 ? ' / $capacity' : ''}',
        ),
        trailing: joined
            ? IconButton(
                tooltip: 'فتح الغرفة',
                onPressed: () => _openRoom(room),
                icon: const Icon(Icons.arrow_forward_ios),
              )
            : FilledButton(
                onPressed: _joining ? null : () => _join(room),
                child: const Text('انضمام'),
              ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الغرف والمجتمعات'),
        actions: [
          IconButton(
            tooltip: 'تحديث',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _roomsFuture,
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
                    const Text('تعذر تحميل الغرف. تحقق من الاتصال والصلاحيات.'),
                    TextButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                  ],
                ),
              ),
            );
          }
          final data = snapshot.data ?? const <String, dynamic>{};
          final joined = (data['joined'] as List<dynamic>? ?? const [])
              .whereType<Map>()
              .map((room) => Map<String, dynamic>.from(room))
              .toList();
          final discoverable = (data['discoverable'] as List<dynamic>? ?? const [])
              .whereType<Map>()
              .map((room) => Map<String, dynamic>.from(room))
              .toList();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('غرفي', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              if (joined.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text('لم تنضم إلى أي غرفة بعد.'),
                )
              else
                ...joined.map((room) => _roomCard(room, joined: true)),
              const SizedBox(height: 20),
              Text('غرف عامة متاحة', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              if (discoverable.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Text('لا توجد غرف عامة مناسبة متاحة حالياً.'),
                )
              else
                ...discoverable.map((room) => _roomCard(room, joined: false)),
            ],
          );
        },
      ),
    );
  }
}
