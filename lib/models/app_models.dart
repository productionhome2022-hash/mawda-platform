// ==========================================
// ملف النماذج الشامل والنهائي لتطبيق مودة (mawda-app-2026)
// (غرفة العمليات الكبرى: التخفي الصامت، الأوسمة السينمائية المتحركة، النبذة التعريفية، هدف الاستخدام، قفل البروفايل، إدارة الـ 10 مشرفين، وكشف كلمات المرور)
// ==========================================

// أ. نموذج صور معرض البروفايل (تدمير ذاتي بعد 7 أيام)
class PhotoItemModel {
  final String photoUrl;
  final DateTime uploadedAt;
  final DateTime expiresAt;

  PhotoItemModel({
    required this.photoUrl,
    required this.uploadedAt,
    required this.expiresAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'photoUrl': photoUrl,
      'uploadedAt': uploadedAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
    };
  }

  factory PhotoItemModel.fromMap(Map<String, dynamic> map) {
    return PhotoItemModel(
      photoUrl: map['photoUrl'] ?? '',
      uploadedAt: DateTime.parse(map['uploadedAt']),
      expiresAt: DateTime.parse(map['expiresAt']),
    );
  }
}

// 1. نموذج المستخدم الشامل (مع الأوسمة السينمائية، النبذة، هدف الاستخدام، وقفل البروفايل)
class UserModel {
  final String uid;
  final String username;              // المعرف الفريد (@username)
  final String email;
  final String passwordHash;          // كلمة المرور (قابلة للاستعراض والتحديث من السوبر أدمن)
  final String displayName;           // الاسم الظاهري
  final int age;                      // العمر
  final String gender;                // ('male' / 'female')
  final String country;               // الدولة العربية
  final String province;              // المحافظة / المدينة
  final String relationshipStatus;    // الحالة الاجتماعية
  final String housingSituation;      // طريقة السكن
  final String occupation;            // المهنة
  final String datingIntent;          // الهدف من الاستخدام (يعرض في البروفايل لكافة الأعضاء)
  
  final String profileImageUrl;       // الصورة الشخصية
  final String coverImageUrl;         // صورة الغلاف
  final String bio;                   // النبذة التعريفية (حتى 500 حرف، قابلة للتعديل)
  
  final bool isEmailVerified;         // توثيق البريد (+500 كوينز)
  final bool isBiometricVerified;    // التوثيق البيومتري (+1500 كوينز)
  final int coins;                     // رصيد الكوينز
  
  final List<String> badges;           
  final List<String> titles;           
  final List<PhotoItemModel> photosGallery; 
  
  // ميزات متجر الميزات الخاصة والتحكم
  final List<String> activeSpecialFeatures; 
  final List<String> profileVisitors;       
  final bool isOnline;                      
  final bool isOnlineHidden;                
  final bool isGhostModeActive;             
  final bool isProfileBoosted;              
  final bool isProfileLocked;               // ميزة قفل البروفايل (مرئي للأصدقاء المسجلين فقط)
  final String customProfileStyle;          
  
  final String profileAudioUrl;             
  final String chatBackgroundUrl;          

  final String lastKnownIp;        
  final String deviceId;           
  final bool isBanned;             
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.uid,
    required this.username,
    required this.email,
    this.passwordHash = '',
    required this.displayName,
    this.age = 18,
    this.gender = 'male',
    this.country = '',
    this.province = '',
    this.relationshipStatus = '',
    this.housingSituation = '',
    this.occupation = '',
    this.datingIntent = '',
    this.profileImageUrl = '',
    this.coverImageUrl = '',
    this.bio = '',
    this.isEmailVerified = false,
    this.isBiometricVerified = false,
    this.coins = 0, 
    this.badges = const [],
    this.titles = const [],
    this.photosGallery = const [],
    this.activeSpecialFeatures = const [],
    this.profileVisitors = const [],
    this.isOnline = false,
    this.isOnlineHidden = false,
    this.isGhostModeActive = false,
    this.isProfileBoosted = false,
    this.isProfileLocked = false,
    this.customProfileStyle = '',
    this.profileAudioUrl = '',
    this.chatBackgroundUrl = '',
    this.lastKnownIp = '',
    this.deviceId = '',
    this.isBanned = false,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'username': username,
      'email': email,
      'passwordHash': passwordHash,
      'displayName': displayName,
      'age': age,
      'gender': gender,
      'country': country,
      'province': province,
      'relationshipStatus': relationshipStatus,
      'housingSituation': housingSituation,
      'occupation': occupation,
      'datingIntent': datingIntent,
      'profileImageUrl': profileImageUrl,
      'coverImageUrl': coverImageUrl,
      'bio': bio,
      'isEmailVerified': isEmailVerified,
      'isBiometricVerified': isBiometricVerified,
      'coins': coins,
      'badges': badges,
      'titles': titles,
      'photosGallery': photosGallery.map((x) => x.toMap()).toList(),
      'activeSpecialFeatures': activeSpecialFeatures,
      'profileVisitors': profileVisitors,
      'isOnline': isOnline,
      'isOnlineHidden': isOnlineHidden,
      'isGhostModeActive': isGhostModeActive,
      'isProfileBoosted': isProfileBoosted,
      'isProfileLocked': isProfileLocked,
      'customProfileStyle': customProfileStyle,
      'profileAudioUrl': profileAudioUrl,
      'chatBackgroundUrl': chatBackgroundUrl,
      'lastKnownIp': lastKnownIp,
      'deviceId': deviceId,
      'isBanned': isBanned,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      username: map['username'] ?? '',
      email: map['email'] ?? '',
      passwordHash: map['passwordHash'] ?? '',
      displayName: map['displayName'] ?? '',
      age: map['age'] ?? 18,
      gender: map['gender'] ?? 'male',
      country: map['country'] ?? '',
      province: map['province'] ?? '',
      relationshipStatus: map['relationshipStatus'] ?? '',
      housingSituation: map['housingSituation'] ?? '',
      occupation: map['occupation'] ?? '',
      datingIntent: map['datingIntent'] ?? '',
      profileImageUrl: map['profileImageUrl'] ?? '',
      coverImageUrl: map['coverImageUrl'] ?? '',
      bio: map['bio'] ?? '',
      isEmailVerified: map['isEmailVerified'] ?? false,
      isBiometricVerified: map['isBiometricVerified'] ?? false,
      coins: map['coins'] ?? 0,
      badges: List<String>.from(map['badges'] ?? []),
      titles: List<String>.from(map['titles'] ?? []),
      photosGallery: (map['photosGallery'] as List<dynamic>?)
              ?.map((x) => PhotoItemModel.fromMap(x))
              .toList() ??
          [],
      activeSpecialFeatures: List<String>.from(map['activeSpecialFeatures'] ?? []),
      profileVisitors: List<String>.from(map['profileVisitors'] ?? []),
      isOnline: map['isOnline'] ?? false,
      isOnlineHidden: map['isOnlineHidden'] ?? false,
      isGhostModeActive: map['isGhostModeActive'] ?? false,
      isProfileBoosted: map['isProfileBoosted'] ?? false,
      isProfileLocked: map['isProfileLocked'] ?? false,
      customProfileStyle: map['customProfileStyle'] ?? '',
      profileAudioUrl: map['profileAudioUrl'] ?? '',
      chatBackgroundUrl: map['chatBackgroundUrl'] ?? '',
      lastKnownIp: map['lastKnownIp'] ?? '',
      deviceId: map['deviceId'] ?? '',
      isBanned: map['isBanned'] ?? false,
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }
}

// 2. نموذج جلسات الزوار المؤقتة
class GuestSessionModel {
  final String guestId;
  final String guestUsername;      
  final String password;           
  final String gender;             
  final String country;            
  final String province;           
  final String avatarUrl;          
  final String deviceId;           
  final String guestIp;            
  final DateTime sessionStartedAt; 
  final DateTime sessionExpiresAt; 
  final bool isSessionActive;      

  GuestSessionModel({
    required this.guestId,
    required this.guestUsername,
    required this.password,
    this.gender = 'male',
    this.country = '',
    this.province = '',
    this.avatarUrl = '',
    required this.deviceId,
    required this.guestIp,
    required this.sessionStartedAt,
    required this.sessionExpiresAt,
    this.isSessionActive = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'guestId': guestId,
      'guestUsername': guestUsername,
      'password': password,
      'gender': gender,
      'country': country,
      'province': province,
      'avatarUrl': avatarUrl,
      'deviceId': deviceId,
      'guestIp': guestIp,
      'sessionStartedAt': sessionStartedAt.toIso8601String(),
      'sessionExpiresAt': sessionExpiresAt.toIso8601String(),
      'isSessionActive': isSessionActive,
    };
  }

  factory GuestSessionModel.fromMap(Map<String, dynamic> map) {
    return GuestSessionModel(
      guestId: map['guestId'] ?? '',
      guestUsername: map['guestUsername'] ?? '',
      password: map['password'] ?? '',
      gender: map['gender'] ?? 'male',
      country: map['country'] ?? '',
      province: map['province'] ?? '',
      avatarUrl: map['avatarUrl'] ?? '',
      deviceId: map['deviceId'] ?? '',
      guestIp: map['guestIp'] ?? '',
      sessionStartedAt: DateTime.parse(map['sessionStartedAt']),
      sessionExpiresAt: DateTime.parse(map['sessionExpiresAt']),
      isSessionActive: map['isSessionActive'] ?? true,
    );
  }
}

// 3. نموذج رسائل وتذاكر الدعم التقني
class SupportTicketModel {
  final String ticketId;
  final String senderUid;          
  final String senderEmail;        
  final String senderPhone;        
  final String subject;            
  final String message;            
  final String screenshotUrl;      
  final String category;           
  final String status;             
  final DateTime createdAt;

  SupportTicketModel({
    required this.ticketId,
    this.senderUid = 'GUEST',
    required this.senderEmail,
    this.senderPhone = '',
    required this.subject,
    required this.message,
    this.screenshotUrl = '',
    this.category = 'general_inquiry',
    this.status = 'pending',
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'ticketId': ticketId,
      'senderUid': senderUid,
      'senderEmail': senderEmail,
      'senderPhone': senderPhone,
      'subject': subject,
      'message': message,
      'screenshotUrl': screenshotUrl,
      'category': category,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory SupportTicketModel.fromMap(Map<String, dynamic> map) {
    return SupportTicketModel(
      ticketId: map['ticketId'] ?? '',
      senderUid: map['senderUid'] ?? 'GUEST',
      senderEmail: map['senderEmail'] ?? '',
      senderPhone: map['senderPhone'] ?? '',
      subject: map['subject'] ?? '',
      message: map['message'] ?? '',
      screenshotUrl: map['screenshotUrl'] ?? '',
      category: map['category'] ?? 'general_inquiry',
      status: map['status'] ?? 'pending',
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 4. نموذج الإعدادات المالية واقتصاد المنصة
class PlatformFinancialConfigModel {
  final int dailyRewardCoins;      
  final int hourlyRewardCoins;     
  final int weeklyRewardCoins;     
  final int adWatchRewardCoins;    
  final double transferCommissionPercentage; 
  final Map<String, dynamic> coinPackages; 
  final String customPurchaseContactUrl;  

  PlatformFinancialConfigModel({
    this.dailyRewardCoins = 50,
    this.hourlyRewardCoins = 10,
    this.weeklyRewardCoins = 500,
    this.adWatchRewardCoins = 20,
    this.transferCommissionPercentage = 10.0,
    this.coinPackages = const {},
    this.customPurchaseContactUrl = 'https://wa.me/mawda_admin',
  });

  Map<String, dynamic> toMap() {
    return {
      'dailyRewardCoins': dailyRewardCoins,
      'hourlyRewardCoins': hourlyRewardCoins,
      'weeklyRewardCoins': weeklyRewardCoins,
      'adWatchRewardCoins': adWatchRewardCoins,
      'transferCommissionPercentage': transferCommissionPercentage,
      'coinPackages': coinPackages,
      'customPurchaseContactUrl': customPurchaseContactUrl,
    };
  }

  factory PlatformFinancialConfigModel.fromMap(Map<String, dynamic> map) {
    return PlatformFinancialConfigModel(
      dailyRewardCoins: map['dailyRewardCoins'] ?? 50,
      hourlyRewardCoins: map['hourlyRewardCoins'] ?? 10,
      weeklyRewardCoins: map['weeklyRewardCoins'] ?? 500,
      adWatchRewardCoins: map['adWatchRewardCoins'] ?? 20,
      transferCommissionPercentage: (map['transferCommissionPercentage'] ?? 10.0).toDouble(),
      coinPackages: Map<String, dynamic>.from(map['coinPackages'] ?? {}),
      customPurchaseContactUrl: map['customPurchaseContactUrl'] ?? '',
    );
  }
}

// 5. نموذج السجل والرقابة المالية الشاملة للسوبر أدمن
class CoinAdminAuditModel {
  final String auditId;
  final String transactionType;   
  final String senderId;
  final String receiverId;
  final int amount;
  final String status;            
  final String details;
  final DateTime timestamp;

  CoinAdminAuditModel({
    required this.auditId,
    required this.transactionType,
    required this.senderId,
    required this.receiverId,
    required this.amount,
    this.status = 'completed',
    this.details = '',
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'auditId': auditId,
      'transactionType': transactionType,
      'senderId': senderId,
      'receiverId': receiverId,
      'amount': amount,
      'status': status,
      'details': details,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory CoinAdminAuditModel.fromMap(Map<String, dynamic> map) {
    return CoinAdminAuditModel(
      auditId: map['auditId'] ?? '',
      transactionType: map['transactionType'] ?? '',
      senderId: map['senderId'] ?? '',
      receiverId: map['receiverId'] ?? '',
      amount: map['amount'] ?? 0,
      status: map['status'] ?? 'completed',
      details: map['details'] ?? '',
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 6. نموذج سجلات إلغاء المعاملات والتحويلات المشبوهة
class TransactionCancellationModel {
  final String cancellationId;
  final String targetAuditId;
  final String adminId;
  final String reason;            
  final bool coinsReverted;       
  final DateTime cancelledAt;

  TransactionCancellationModel({
    required this.cancellationId,
    required this.targetAuditId,
    required this.adminId,
    required this.reason,
    this.coinsReverted = true,
    required this.cancelledAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'cancellationId': cancellationId,
      'targetAuditId': targetAuditId,
      'adminId': adminId,
      'reason': reason,
      'coinsReverted': coinsReverted,
      'cancelledAt': cancelledAt.toIso8601String(),
    };
  }

  factory TransactionCancellationModel.fromMap(Map<String, dynamic> map) {
    return TransactionCancellationModel(
      cancellationId: map['cancellationId'] ?? '',
      targetAuditId: map['targetAuditId'] ?? '',
      adminId: map['adminId'] ?? '',
      reason: map['reason'] ?? '',
      coinsReverted: map['coinsReverted'] ?? true,
      cancelledAt: DateTime.parse(map['cancelledAt']),
    );
  }
}

// 7. نموذج تحويل الكوينز بين الأعضاء
class CoinTransferTransactionModel {
  final String transactionId;
  final String senderId;
  final String receiverId;
  final int grossAmount;
  final double commissionPercentage;
  final int commissionAmount;
  final int netAmount;
  final DateTime timestamp;

  CoinTransferTransactionModel({
    required this.transactionId,
    required this.senderId,
    required this.receiverId,
    required this.grossAmount,
    required this.commissionPercentage,
    required this.commissionAmount,
    required this.netAmount,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'transactionId': transactionId,
      'senderId': senderId,
      'receiverId': receiverId,
      'grossAmount': grossAmount,
      'commissionPercentage': commissionPercentage,
      'commissionAmount': commissionAmount,
      'netAmount': netAmount,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory CoinTransferTransactionModel.fromMap(Map<String, dynamic> map) {
    return CoinTransferTransactionModel(
      transactionId: map['transactionId'] ?? '',
      senderId: map['senderId'] ?? '',
      receiverId: map['receiverId'] ?? '',
      grossAmount: map['grossAmount'] ?? 0,
      commissionPercentage: (map['commissionPercentage'] ?? 0.0).toDouble(),
      commissionAmount: map['commissionAmount'] ?? 0,
      netAmount: map['netAmount'] ?? 0,
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 8. نموذج الرسائل (مع دعم التخفي الصامت، وضع الشبح، والتدخل السيادي)
class MessageModel {
  final String messageId;
  final String roomId;
  final String senderId;
  final String text;
  final String mediaUrl;           
  final String mediaType;          // ('text', 'voice', 'image', 'video')
  final bool isAnonymous;          // إرسال كـ مجهول / شبح
  final bool isAdminIntervention;  // تدخل سيادي من السوبر أدمن
  final DateTime timestamp;
  final DateTime expiresAt;
  final bool isDeletedForEveryone;

  MessageModel({
    required this.messageId,
    required this.roomId,
    required this.senderId,
    required this.text,
    this.mediaUrl = '',
    this.mediaType = 'text',
    this.isAnonymous = false,
    this.isAdminIntervention = false,
    required this.timestamp,
    required this.expiresAt,
    this.isDeletedForEveryone = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'messageId': messageId,
      'roomId': roomId,
      'senderId': senderId,
      'text': text,
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'isAnonymous': isAnonymous,
      'isAdminIntervention': isAdminIntervention,
      'timestamp': timestamp.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'isDeletedForEveryone': isDeletedForEveryone,
    };
  }

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      messageId: map['messageId'] ?? '',
      roomId: map['roomId'] ?? '',
      senderId: map['senderId'] ?? '',
      text: map['text'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      mediaType: map['mediaType'] ?? 'text',
      isAnonymous: map['isAnonymous'] ?? false,
      isAdminIntervention: map['isAdminIntervention'] ?? false,
      timestamp: DateTime.parse(map['timestamp']),
      expiresAt: DateTime.parse(map['expiresAt']),
      isDeletedForEveryone: map['isDeletedForEveryone'] ?? false,
    );
  }
}

// 9. نموذج المشرفين الإداريين (بحد أقصى 10 مشرفين)
class AdminModeratorModel {
  final String moderatorId;
  final String userId;
  final String adminAssignedBy;     
  final bool canMonitorPublicRooms; 
  final bool canBanOrKickUsers;     
  final bool canManageRoomVisuals;  
  final bool canDeleteMessages;     
  final DateTime assignedAt;

  AdminModeratorModel({
    required this.moderatorId,
    required this.userId,
    required this.adminAssignedBy,
    this.canMonitorPublicRooms = true,
    this.canBanOrKickUsers = true,
    this.canManageRoomVisuals = true,
    this.canDeleteMessages = true,
    required this.assignedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'moderatorId': moderatorId,
      'userId': userId,
      'adminAssignedBy': adminAssignedBy,
      'canMonitorPublicRooms': canMonitorPublicRooms,
      'canBanOrKickUsers': canBanOrKickUsers,
      'canManageRoomVisuals': canManageRoomVisuals,
      'canDeleteMessages': canDeleteMessages,
      'assignedAt': assignedAt.toIso8601String(),
    };
  }

  factory AdminModeratorModel.fromMap(Map<String, dynamic> map) {
    return AdminModeratorModel(
      moderatorId: map['moderatorId'] ?? '',
      userId: map['userId'] ?? '',
      adminAssignedBy: map['adminAssignedBy'] ?? '',
      canMonitorPublicRooms: map['canMonitorPublicRooms'] ?? true,
      canBanOrKickUsers: map['canBanOrKickUsers'] ?? true,
      canManageRoomVisuals: map['canManageRoomVisuals'] ?? true,
      canDeleteMessages: map['canDeleteMessages'] ?? true,
      assignedAt: DateTime.parse(map['assignedAt']),
    );
  }
}

// 10. نموذج سجلات الحظر الذكي
class BanRecordModel {
  final String banId;
  final String targetUserId;
  final String targetIp;
  final String targetDeviceId;
  final String reason;
  final DateTime bannedAt;
  final DateTime expiresAt;
  final String bannedByAdminId;

  BanRecordModel({
    required this.banId,
    required this.targetUserId,
    required this.targetIp,
    required this.targetDeviceId,
    required this.reason,
    required this.bannedAt,
    required this.expiresAt,
    required this.bannedByAdminId,
  });

  Map<String, dynamic> toMap() {
    return {
      'banId': banId,
      'targetUserId': targetUserId,
      'targetIp': targetIp,
      'targetDeviceId': targetDeviceId,
      'reason': reason,
      'bannedAt': bannedAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'bannedByAdminId': bannedByAdminId,
    };
  }

  factory BanRecordModel.fromMap(Map<String, dynamic> map) {
    return BanRecordModel(
      banId: map['banId'] ?? '',
      targetUserId: map['targetUserId'] ?? '',
      targetIp: map['targetIp'] ?? '',
      targetDeviceId: map['targetDeviceId'] ?? '',
      reason: map['reason'] ?? '',
      bannedAt: DateTime.parse(map['bannedAt']),
      expiresAt: DateTime.parse(map['expiresAt']),
      bannedByAdminId: map['bannedByAdminId'] ?? '',
    );
  }
}

// 11. نموذج نظام المكافآت والحضور
class RewardModel {
  final String userId;
  final DateTime? lastDailyClaim;     
  final DateTime? lastHourlyClaim;    
  final DateTime? lastWeeklyClaim;    
  final int weeklyStreakCount;        

  RewardModel({
    required this.userId,
    this.lastDailyClaim,
    this.lastHourlyClaim,
    this.lastWeeklyClaim,
    this.weeklyStreakCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'lastDailyClaim': lastDailyClaim?.toIso8601String(),
      'lastHourlyClaim': lastHourlyClaim?.toIso8601String(),
      'lastWeeklyClaim': lastWeeklyClaim?.toIso8601String(),
      'weeklyStreakCount': weeklyStreakCount,
    };
  }

  factory RewardModel.fromMap(Map<String, dynamic> map) {
    return RewardModel(
      userId: map['userId'] ?? '',
      lastDailyClaim: map['lastDailyClaim'] != null ? DateTime.parse(map['lastDailyClaim']) : null,
      lastHourlyClaim: map['lastHourlyClaim'] != null ? DateTime.parse(map['lastHourlyClaim']) : null,
      lastWeeklyClaim: map['lastWeeklyClaim'] != null ? DateTime.parse(map['lastWeeklyClaim']) : null,
      weeklyStreakCount: map['weeklyStreakCount'] ?? 0,
    );
  }
}

// 12. نموذج الإشعارات الشامل
class NotificationModel {
  final String notificationId;
  final String userId;
  final String senderId;
  final String type;               
  final String title;
  final String body;
  final String targetId;
  final bool isRead;
  final DateTime timestamp;

  NotificationModel({
    required this.notificationId,
    required this.userId,
    required this.senderId,
    required this.type,
    required this.title,
    required this.body,
    this.targetId = '',
    this.isRead = false,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'notificationId': notificationId,
      'userId': userId,
      'senderId': senderId,
      'type': type,
      'title': title,
      'body': body,
      'targetId': targetId,
      'isRead': isRead,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory NotificationModel.fromMap(Map<String, dynamic> map) {
    return NotificationModel(
      notificationId: map['notificationId'] ?? '',
      userId: map['userId'] ?? '',
      senderId: map['senderId'] ?? '',
      type: map['type'] ?? '',
      title: map['title'] ?? '',
      body: map['body'] ?? '',
      targetId: map['targetId'] ?? '',
      isRead: map['isRead'] ?? false,
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 13. نموذج الهدايا وإهداء الكوينز والأوسمة والألقاب
class GiftTransactionModel {
  final String giftId;
  final String senderId;
  final String receiverId;
  final String giftType;           
  final String giftValue;
  final DateTime timestamp;

  GiftTransactionModel({
    required this.giftId,
    required this.senderId,
    required this.receiverId,
    required this.giftType,
    required this.giftValue,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'giftId': giftId,
      'senderId': senderId,
      'receiverId': receiverId,
      'giftType': giftType,
      'giftValue': giftValue,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory GiftTransactionModel.fromMap(Map<String, dynamic> map) {
    return GiftTransactionModel(
      giftId: map['giftId'] ?? '',
      senderId: map['senderId'] ?? '',
      receiverId: map['receiverId'] ?? '',
      giftType: map['giftType'] ?? '',
      giftValue: map['giftValue'] ?? '',
      timestamp: DateTime.parse(map['timestamp']),
    );
  }
}

// 14. نموذج اليوميات والمنشورات
class PostModel {
  final String postId;
  final String authorId;
  final String contentText;
  final String mediaUrl;
  final String mediaType;
  final List<String> likes;
  final int sharesCount;
  final DateTime createdAt;

  PostModel({
    required this.postId,
    required this.authorId,
    required this.contentText,
    this.mediaUrl = '',
    this.mediaType = 'text',
    this.likes = const [],
    this.sharesCount = 0,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'postId': postId,
      'authorId': authorId,
      'contentText': contentText,
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'likes': likes,
      'sharesCount': sharesCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory PostModel.fromMap(Map<String, dynamic> map) {
    return PostModel(
      postId: map['postId'] ?? '',
      authorId: map['authorId'] ?? '',
      contentText: map['contentText'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      mediaType: map['mediaType'] ?? 'text',
      likes: List<String>.from(map['likes'] ?? []),
      sharesCount: map['sharesCount'] ?? 0,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 15. نموذج الستوريات المؤقتة
class StoryModel {
  final String storyId;
  final String userId;
  final String mediaUrl;
  final DateTime createdAt;
  final DateTime expiresAt;

  StoryModel({
    required this.storyId,
    required this.userId,
    required this.mediaUrl,
    required this.createdAt,
    required this.expiresAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'storyId': storyId,
      'userId': userId,
      'mediaUrl': mediaUrl,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
    };
  }

  factory StoryModel.fromMap(Map<String, dynamic> map) {
    return StoryModel(
      storyId: map['storyId'] ?? '',
      userId: map['userId'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
      expiresAt: DateTime.parse(map['expiresAt']),
    );
  }
}

// 16. نموذج طلبات التوثيق البيومتري
class VerificationModel {
  final String requestId;
  final String userId;
  final String audioVoiceprintUrl; 
  final String movingSelfieUrl;    
  final String status;             
  final DateTime submittedAt;

  VerificationModel({
    required this.requestId,
    required this.userId,
    required this.audioVoiceprintUrl,
    required this.movingSelfieUrl,
    this.status = 'pending',
    required this.submittedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'requestId': requestId,
      'userId': userId,
      'audioVoiceprintUrl': audioVoiceprintUrl,
      'movingSelfieUrl': movingSelfieUrl,
      'status': status,
      'submittedAt': submittedAt.toIso8601String(),
    };
  }

  factory VerificationModel.fromMap(Map<String, dynamic> map) {
    return VerificationModel(
      requestId: map['requestId'] ?? '',
      userId: map['userId'] ?? '',
      audioVoiceprintUrl: map['audioVoiceprintUrl'] ?? '',
      movingSelfieUrl: map['movingSelfieUrl'] ?? '',
      status: map['status'] ?? 'pending',
      submittedAt: DateTime.parse(map['submittedAt']),
    );
  }
}

// 17. نموذج غرف الدردشة
class RoomModel {
  final String roomId;
  final String roomName;
  final bool isPublic;             
  final bool isRented;             
  final String ownerId;            
  final List<String> roomAdmins;   
  final String roomCoverUrl;       
  final String roomChatBackgroundUrl; 
  final int roomLevel;             
  final int totalCoinsInvested;    
  final List<String> invitedMembers;  
  final List<String> pendingRequests; 
  final List<String> approvedMembers; 
  final DateTime? rentalExpiresAt; 
  final DateTime createdAt;

  RoomModel({
    required this.roomId,
    required this.roomName,
    required this.isPublic,
    this.isRented = false,
    required this.ownerId,
    this.roomAdmins = const [],
    this.roomCoverUrl = '',
    this.roomChatBackgroundUrl = '',
    this.roomLevel = 1,
    this.totalCoinsInvested = 0,
    this.invitedMembers = const [],
    this.pendingRequests = const [],
    this.approvedMembers = const [],
    this.rentalExpiresAt,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'roomId': roomId,
      'roomName': roomName,
      'isPublic': isPublic,
      'isRented': isRented,
      'ownerId': ownerId,
      'roomAdmins': roomAdmins,
      'roomCoverUrl': roomCoverUrl,
      'roomChatBackgroundUrl': roomChatBackgroundUrl,
      'roomLevel': roomLevel,
      'totalCoinsInvested': totalCoinsInvested,
      'invitedMembers': invitedMembers,
      'pendingRequests': pendingRequests,
      'approvedMembers': approvedMembers,
      'rentalExpiresAt': rentalExpiresAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory RoomModel.fromMap(Map<String, dynamic> map) {
    return RoomModel(
      roomId: map['roomId'] ?? '',
      roomName: map['roomName'] ?? '',
      isPublic: map['isPublic'] ?? true,
      isRented: map['isRented'] ?? false,
      ownerId: map['ownerId'] ?? '',
      roomAdmins: List<String>.from(map['roomAdmins'] ?? []),
      roomCoverUrl: map['roomCoverUrl'] ?? '',
      roomChatBackgroundUrl: map['roomChatBackgroundUrl'] ?? '',
      roomLevel: map['roomLevel'] ?? 1,
      totalCoinsInvested: map['totalCoinsInvested'] ?? 0,
      invitedMembers: List<String>.from(map['invitedMembers'] ?? []),
      pendingRequests: List<String>.from(map['pendingRequests'] ?? []),
      approvedMembers: List<String>.from(map['approvedMembers'] ?? []),
      rentalExpiresAt: map['rentalExpiresAt'] != null ? DateTime.parse(map['rentalExpiresAt']) : null,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 18. نموذج الإعلانات التجارية
class AdModel {
  final String adId;
  final String title;
  final String content;
  final String mediaUrl;           
  final String linkUrl;            
  final String createdBy;          
  final DateTime createdAt;

  AdModel({
    required this.adId,
    required this.title,
    required this.content,
    this.mediaUrl = '',
    this.linkUrl = '',
    required this.createdBy,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'adId': adId,
      'title': title,
      'content': content,
      'mediaUrl': mediaUrl,
      'linkUrl': linkUrl,
      'createdBy': createdBy,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory AdModel.fromMap(Map<String, dynamic> map) {
    return AdModel(
      adId: map['adId'] ?? '',
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      mediaUrl: map['mediaUrl'] ?? '',
      linkUrl: map['linkUrl'] ?? '',
      createdBy: map['createdBy'] ?? '',
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 19. نموذج بيانات الوسام الواحد في متجر الأوسمة (مع الخصائص السينمائية المتحركة)
class BadgeItemModel {
  final String badgeId;
  final String badgeName;       // اسم الوسام (توثيق، أعلام، شرفي، إلخ)
  final String badgeIconUrl;    // أيقونة الوسام المتحرك
  final String category;        // التصنيف ('verification', 'national', 'honor', 'economy', 'innovation')
  final int priceInCoins;       // سعر الشراء بالكوينز
  final bool isAnimated;        // هل الوسام متحرك بطابع سينمائي؟
  final String glowColor;       // لون التوهج السينمائي المحيط بالوسام
  final bool isLimitedEdition;  // هل هو وسام محدود الإصدار؟
  final DateTime createdAt;

  BadgeItemModel({
    required this.badgeId,
    required this.badgeName,
    required this.badgeIconUrl,
    required this.category,
    this.priceInCoins = 0,
    this.isAnimated = true,
    this.glowColor = '#FFD700',
    this.isLimitedEdition = false,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'badgeId': badgeId,
      'badgeName': badgeName,
      'badgeIconUrl': badgeIconUrl,
      'category': category,
      'priceInCoins': priceInCoins,
      'isAnimated': isAnimated,
      'glowColor': glowColor,
      'isLimitedEdition': isLimitedEdition,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory BadgeItemModel.fromMap(Map<String, dynamic> map) {
    return BadgeItemModel(
      badgeId: map['badgeId'] ?? '',
      badgeName: map['badgeName'] ?? '',
      badgeIconUrl: map['badgeIconUrl'] ?? '',
      category: map['category'] ?? 'general',
      priceInCoins: map['priceInCoins'] ?? 0,
      isAnimated: map['isAnimated'] ?? true,
      glowColor: map['glowColor'] ?? '#FFD700',
      isLimitedEdition: map['isLimitedEdition'] ?? false,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

// 20. نموذج الأوسمة المملوكة والمفعلة في بروفايل العضو (شريط العرض السينمائي للأوسمة)
class UserBadgeInventoryModel {
  final String userId;
  final List<String> ownedBadgeIds;    // الأوسمة المملوكة
  final String activeDisplayedBadgeId; // الوسام البارز بجانب الاسم
  final List<String> showcaseBadgeIds; // أوسمة "حقض العرض السينمائي" البارزة في البروفايل (حتى 5 أوسمة)

  UserBadgeInventoryModel({
    required this.userId,
    this.ownedBadgeIds = const [],
    this.activeDisplayedBadgeId = '',
    this.showcaseBadgeIds = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'ownedBadgeIds': ownedBadgeIds,
      'activeDisplayedBadgeId': activeDisplayedBadgeId,
      'showcaseBadgeIds': showcaseBadgeIds,
    };
  }

  factory UserBadgeInventoryModel.fromMap(Map<String, dynamic> map) {
    return UserBadgeInventoryModel(
      userId: map['userId'] ?? '',
      ownedBadgeIds: List<String>.from(map['ownedBadgeIds'] ?? []),
      activeDisplayedBadgeId: map['activeDisplayedBadgeId'] ?? '',
      showcaseBadgeIds: List<String>.from(map['showcaseBadgeIds'] ?? []),
    );
  }
}
