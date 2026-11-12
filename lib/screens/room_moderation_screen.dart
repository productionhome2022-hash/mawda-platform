import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

class RoomModerationScreen extends StatefulWidget {
  const RoomModerationScreen({
    super.key,
    required this.roomId,
    required this.roomName,
  });

  final String roomId;
  final String roomName;

  @override
  State<RoomModerationScreen> createState() => _RoomModerationScreenState();
}

class _RoomModerationScreenState extends State<RoomModerationScreen> {
  late Future<List<Map<String, dynamic>>> _membersFuture;
  String? _busyUid;

  @override
  void initState() {
    super.initState();
    _membersFuture = _loadMembers();
  }

  Future<List<Map<String, dynamic>>> _loadMembers() async {
    final response = await FirebaseFunctions.instance
        .httpsCallable('listRoomMembers')
        .call({'roomId': widget.roomId});
    final data = Map<String, dynamic>.from(response.data as Map);
    return (data['members'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((member) => Map<String, dynamic>.from(member))
        .toList(growable: false);
  }

  void _refresh() => setState(() => _membersFuture = _loadMembers());

  Future<void> _editModerator(Map<String, dynamic> member) async {
    final uid = member['uid'] as String?;
    if (uid == null || uid.isEmpty || _busyUid != null) return;
    final current = Map<String, dynamic>.from(
      member['permissions'] as Map? ?? const {},
    );
    var manageMessages = current['manageMessages'] == true;
    var muteMembers = current['muteMembers'] == true;
    var removeMembers = current['removeMembers'] == true;

    final permissions = await showDialog<Map<String, bool>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(member['role'] == 'moderator'
              ? 'تعديل صلاحيات المشرف'
              : 'تعيين مشرف غرفة'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SwitchListTile(
                value: manageMessages,
                onChanged: (value) => setDialogState(() => manageMessages = value),
                title: const Text('إدارة رسائل الغرفة'),
              ),
              SwitchListTile(
                value: muteMembers,
                onChanged: (value) => setDialogState(() => muteMembers = value),
                title: const Text('كتم أعضاء الغرفة'),
              ),
              SwitchListTile(
                value: removeMembers,
                onChanged: (value) => setDialogState(() => removeMembers = value),
                title: const Text('إزالة أعضاء من الغرفة'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('إلغاء'),
            ),
            FilledButton(
              onPressed: manageMessages || muteMembers || removeMembers
                  ? () => Navigator.pop(dialogContext, {
                        'manageMessages': manageMessages,
                        'muteMembers': muteMembers,
                        'removeMembers': removeMembers,
                      })
                  : null,
              child: const Text('حفظ الصلاحيات'),
            ),
          ],
        ),
      ),
    );
    if (permissions == null || !mounted) return;

    setState(() => _busyUid = uid);
    try {
      await FirebaseFunctions.instance.httpsCallable('setRoomModerator').call({
        'roomId': widget.roomId,
        'memberUid': uid,
        'permissions': permissions,
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ صلاحيات مشرف الغرفة.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر حفظ صلاحيات المشرف.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر حفظ الصلاحيات؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _busyUid = null);
    }
  }

  Future<void> _revokeModerator(Map<String, dynamic> member) async {
    final uid = member['uid'] as String?;
    if (uid == null || uid.isEmpty || _busyUid != null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('سحب صلاحيات الإشراف'),
        content: Text('سيعود ${member['displayName'] ?? 'العضو'} إلى صلاحيات العضو العادي في هذه الغرفة فقط.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('سحب الإشراف'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _busyUid = uid);
    try {
      await FirebaseFunctions.instance.httpsCallable('removeRoomModerator').call({
        'roomId': widget.roomId,
        'memberUid': uid,
      });
      if (!mounted) return;
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم سحب صلاحيات الإشراف دون التأثير على حساب العضو.')),
      );
    } on FirebaseFunctionsException catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message ?? 'تعذر سحب صلاحيات الإشراف.')),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تعذر سحب الصلاحيات؛ لم يتم تأكيد نجاح العملية.')),
      );
    } finally {
      if (mounted) setState(() => _busyUid = null);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: Text('إدارة مشرفي ${widget.roomName}'),
          actions: [
            IconButton(
              tooltip: 'تحديث قائمة الأعضاء',
              onPressed: _busyUid == null ? _refresh : null,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        body: FutureBuilder<List<Map<String, dynamic>>>(
          future: _membersFuture,
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
                      const Text('تعذر تحميل أعضاء الغرفة أو لا تملك صلاحية إدارتهم.'),
                      TextButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                    ],
                  ),
                ),
              );
            }
            final members = snapshot.data ?? const [];
            if (members.isEmpty) {
              return const Center(child: Text('لا يوجد أعضاء مسجلون في هذه الغرفة.'));
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: members.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final member = members[index];
                final role = member['role'] as String? ?? 'member';
                final uid = member['uid'] as String? ?? '';
                final permissions = Map<String, dynamic>.from(
                  member['permissions'] as Map? ?? const {},
                );
                final isModerator = role == 'moderator';
                final isOwner = role == 'owner';
                return Card(
                  child: ListTile(
                    title: Text(member['displayName'] as String? ?? 'عضو مودة'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if ((member['username'] as String? ?? '').isNotEmpty)
                          Text('@${member['username']}'),
                        Text('الدور: ${isOwner ? 'مالك الغرفة' : isModerator ? 'مشرف' : 'عضو'}'),
                        if (isModerator)
                          Text([
                            if (permissions['manageMessages'] == true) 'إدارة الرسائل',
                            if (permissions['muteMembers'] == true) 'كتم الأعضاء',
                            if (permissions['removeMembers'] == true) 'إزالة الأعضاء',
                          ].join(' • ')),
                        SelectableText('UID: $uid'),
                      ],
                    ),
                    isThreeLine: true,
                    trailing: isOwner
                        ? const Icon(Icons.verified_user_outlined)
                        : _busyUid == uid
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : PopupMenuButton<String>(
                                onSelected: (value) {
                                  if (value == 'edit') _editModerator(member);
                                  if (value == 'revoke') _revokeModerator(member);
                                },
                                itemBuilder: (_) => [
                                  PopupMenuItem(
                                    value: 'edit',
                                    child: Text(isModerator ? 'تعديل الصلاحيات' : 'تعيين مشرف'),
                                  ),
                                  if (isModerator)
                                    const PopupMenuItem(
                                      value: 'revoke',
                                      child: Text('سحب الإشراف'),
                                    ),
                                ],
                              ),
                  ),
                );
              },
            );
          },
        ),
      );
}
