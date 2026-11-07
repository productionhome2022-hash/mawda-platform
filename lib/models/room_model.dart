class RoomModel {
  final String roomId;
  final String roomName;
  final String roomType; // 'public' (عامة) أو 'rented_private' (خاصة مستأجرة)
  final String ownerId;
  final List<String> assignedModerators; // المشرفين المخصصين للغرفة (حتى 10)
  final int costPerDay;
  final bool isActive;

  RoomModel({
    required this.roomId,
    required this.roomName,
    required this.roomType,
    required this.ownerId,
    this.assignedModerators = const [],
    this.costPerDay = 0,
    this.isActive = true,
  });

  factory RoomModel.fromMap(Map<String, dynamic> map, String documentId) {
    return RoomModel(
      roomId: documentId,
      roomName: map['roomName'] ?? '',
      roomType: map['roomType'] ?? 'public',
      ownerId: map['ownerId'] ?? '',
      assignedModerators: List<String>.from(map['assignedModerators'] ?? []),
      costPerDay: map['costPerDay'] ?? 0,
      isActive: map['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'roomName': roomName,
      'roomType': roomType,
      'ownerId': ownerId,
      'assignedModerators': assignedModerators,
      'costPerDay': costPerDay,
      'isActive': isActive,
    };
  }
}
