import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'chat_room_screen.dart';
import 'room_moderation_screen.dart';

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

  Future<void> _rentRoom() async {
    try {
      final response = await FirebaseFunctions.instance.httpsCallable('getRoomRentalPlans').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final plans = (data['plans'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      if (!mounted || plans.isEmpty) return;
      final name = TextEditingController();
      final capacity = TextEditingController(text: '50');
      String selected = plans.first['planId'] as String;
      final values = await showDialog<Map<String, dynamic>>(context: context,
        builder: (ctx) => StatefulBuilder(builder: (ctx, update) {
          final plan = plans.firstWhere((p) => p['planId'] == selected);
          return AlertDialog(
            title: const Text('استئجار غرفة خاصة'),
            content: SizedBox(width: 420, child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'اسم الغرفة')),
              TextField(controller: capacity, keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'السعة (5 إلى 1000)')),
              DropdownButtonFormField<String>(
                initialValue: selected,
                decoration: const InputDecoration(labelText: 'مدة الاستئجار والسعر'),
                items: plans.map((p) => DropdownMenuItem<String>(
                  value: p['planId'] as String,
                  child: Text('${p['name']} • ${p['durationDays']} يوم • ${p['priceCoins']} كوين'),
                )).toList(),
                onChanged: (value) { if (value != null) update(() => selected = value); },
              ),
              const SizedBox(height: 8),
              Text('السعر النهائي: ${plan['priceCoins']} كوين'),
            ])),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
              FilledButton(onPressed: () {
                final count = int.tryParse(capacity.text);
                if (name.text.trim().length < 3 || count == null || count < 5 || count > 1000) return;
                Navigator.pop(ctx, {'name': name.text.trim(), 'capacity': count,
                  'planId': selected, 'priceCoins': plan['priceCoins']});
              }, child: const Text('تأكيد الاستئجار')),
            ],
          );
        }));
      name.dispose(); capacity.dispose();
      if (values == null || !mounted) return;
      setState(() => _joining = true);
      final result = await FirebaseFunctions.instance.httpsCallable('createRentedRoom').call({
        ...values,
        'expectedPriceCoins': values['priceCoins'],
        'requestId': 'room_rent_${DateTime.now().microsecondsSinceEpoch}',
      });
      if (!mounted) return;
      final roomId = (result.data as Map)['roomId'] as String?;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم استئجار الغرفة وخصم الكوينز ذرياً.')),
      );
      _refresh();
      if (roomId != null) {
        await _openRoom({'roomId': roomId, 'kind': 'private', 'name': values['name'],
          'isRoomOwner': true});
      }
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر استئجار الغرفة.')));
    } finally { if (mounted) setState(() => _joining = false); }
  }

  Future<void> _leaveRoom(Map<String, dynamic> room) async {
    try {
      await FirebaseFunctions.instance.httpsCallable('leaveRoom').call({'roomId': room['roomId']});
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('غادرت الغرفة.')));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر مغادرة الغرفة.')));
    }
  }

  Future<void> _renewRoom(Map<String, dynamic> room) async {
    try {
      final response = await FirebaseFunctions.instance.httpsCallable('getRoomRentalPlans').call();
      final data = Map<String, dynamic>.from(response.data as Map);
      final plans = (data['plans'] as List<dynamic>? ?? const [])
          .whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      if (!mounted || plans.isEmpty) return;
      String selected = plans.first['planId'] as String;
      final plan = await showDialog<Map<String, dynamic>>(context: context,
        builder: (ctx) => StatefulBuilder(builder: (ctx, update) => AlertDialog(
          title: const Text('تجديد استئجار الغرفة'),
          content: DropdownButtonFormField<String>(
            initialValue: selected,
            items: plans.map((p) => DropdownMenuItem<String>(
              value: p['planId'] as String,
              child: Text('${p['name']} • ${p['durationDays']} يوم • ${p['priceCoins']} كوين'),
            )).toList(),
            onChanged: (value) { if (value != null) update(() => selected = value); },
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
            FilledButton(onPressed: () => Navigator.pop(ctx,
              plans.firstWhere((p) => p['planId'] == selected)), child: const Text('تأكيد')),
          ],
        )));
      if (plan == null || !mounted) return;
      await FirebaseFunctions.instance.httpsCallable('renewRoomRental').call({
        'roomId': room['roomId'], 'planId': plan['planId'],
        'expectedPriceCoins': plan['priceCoins'],
        'requestId': 'room_renew_${DateTime.now().microsecondsSinceEpoch}',
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تجديد الغرفة.')));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تجديد الغرفة.')));
    }
  }

  Future<void> _closeRoom(Map<String, dynamic> room) async {
    final confirmed = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('إغلاق الغرفة؟'),
      content: const Text('سيتم إيقاف الغرفة دون حذف سجلاتها أو رد رسوم الاستئجار السابقة.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('تراجع')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('إغلاق الغرفة')),
      ],
    ));
    if (confirmed != true) return;
    try {
      await FirebaseFunctions.instance.httpsCallable('closeOwnedRoom').call({'roomId': room['roomId']});
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم إغلاق الغرفة.')));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر إغلاق الغرفة.')));
    }
  }

  Future<void> _enableGuestAudience(Map<String, dynamic> room) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إتاحة الغرفة للزوار'),
        content: const Text(
          'سيتم تصنيف هذه الغرفة كغرفة عامة مناسبة لجميع الأعمار، وسيتمكن الزوار مجهولو العمر من دخولها. '
          'تأكد من أن محتوى الغرفة وإشرافها وقواعدها مناسبة للجمهور العام باستمرار.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('تأكيد التصنيف')),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await FirebaseFunctions.instance.httpsCallable('setRoomAudience').call({
        'roomId': room['roomId'],
        'audience': 'all_ages',
        'confirmGeneralAudienceModeration': true,
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم اعتماد الغرفة للجمهور العام والزوار.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر تغيير تصنيف الغرفة.')),
      );
    }
  }

  Future<void> _transferRoom(Map<String, dynamic> room) async {
    final controller = TextEditingController();
    final uid = await showDialog<String>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('نقل ملكية الغرفة'),
      content: TextField(controller: controller, decoration: const InputDecoration(labelText: 'معرف العضو الجديد')),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
        FilledButton(onPressed: () => Navigator.pop(ctx, controller.text.trim()),
          child: const Text('نقل الملكية')),
      ],
    ));
    controller.dispose();
    if (uid == null || uid.isEmpty || !mounted) return;
    try {
      await FirebaseFunctions.instance.httpsCallable('transferRoomOwnership').call({
        'roomId': room['roomId'], 'newOwnerUid': uid,
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نقل ملكية الغرفة.')));
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر نقل الملكية.')));
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

  Future<void> _openModeration(Map<String, dynamic> room) async {
    await Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => RoomModerationScreen(
        roomId: room['roomId'] as String,
        roomName: room['name'] as String? ?? 'الغرفة',
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
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (room['isSuperAdmin'] == true || room['isRoomOwner'] == true)
                    IconButton(
                      tooltip: 'إدارة مشرفي الغرفة',
                      onPressed: () => _openModeration(room),
                      icon: const Icon(Icons.admin_panel_settings_outlined),
                    ),
                  if (room['isRoomOwner'] == true)
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'guest-audience') _enableGuestAudience(room);
                        if (value == 'renew') _renewRoom(room);
                        if (value == 'transfer') _transferRoom(room);
                        if (value == 'close') _closeRoom(room);
                      },
                      itemBuilder: (_) => [
                        if (room['kind'] == 'public' && room['audience'] != 'all_ages')
                          const PopupMenuItem(value: 'guest-audience', child: Text('إتاحة للزوار (جميع الأعمار)')),
                        if (room['isRented'] == true)
                          const PopupMenuItem(value: 'renew', child: Text('تجديد الاستئجار')),
                        const PopupMenuItem(value: 'transfer', child: Text('نقل الملكية')),
                        const PopupMenuItem(value: 'close', child: Text('إغلاق الغرفة')),
                      ],
                    )
                  else
                    IconButton(
                      tooltip: 'مغادرة الغرفة',
                      onPressed: () => _leaveRoom(room),
                      icon: const Icon(Icons.logout),
                    ),
                  IconButton(
                    tooltip: 'فتح الغرفة',
                    onPressed: () => _openRoom(room),
                    icon: const Icon(Icons.arrow_forward_ios),
                  ),
                ],
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (room['isSuperAdmin'] == true)
                    IconButton(
                      tooltip: 'إدارة مشرفي الغرفة',
                      onPressed: () => _openModeration(room),
                      icon: const Icon(Icons.admin_panel_settings_outlined),
                    ),
                  FilledButton(
                    onPressed: _joining ? null : () => _join(room),
                    child: const Text('انضمام'),
                  ),
                ],
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
              Row(
                children: [
                  Expanded(child: Text('غرفي', style: Theme.of(context).textTheme.titleLarge)),
                  FilledButton.tonalIcon(
                    onPressed: _joining ? null : _rentRoom,
                    icon: const Icon(Icons.add_home_work_outlined),
                    label: const Text('استئجار غرفة'),
                  ),
                ],
              ),
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
