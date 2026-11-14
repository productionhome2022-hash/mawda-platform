import 'package:flutter/material.dart';

class UserProfileScreen extends StatelessWidget {
  final String userName;
  final String userBio;
  final String profileImageUrl;
  final String coverImageUrl;
  final int userCoins;
  final List<String> userBadges;

  const UserProfileScreen({
    Key? key,
    required this.userName,
    required this.userBio,
    required this.profileImageUrl,
    required this.coverImageUrl,
    required this.userCoins,
    required this.userBadges,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: Text(userName),
        backgroundColor: Colors.pink.shade700,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Container(
                  height: 200,
                  width: double.infinity,
                  color: Colors.pink.shade200,
                ),
                const Positioned(
                  bottom: -50,
                  child: CircleAvatar(
                    radius: 55,
                    backgroundColor: Colors.white,
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.pink,
                      child: Icon(Icons.person, size: 50, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 60),
            Text(userName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            if (userBadges.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 8,
                  runSpacing: 8,
                  children: userBadges
                      .where((badge) => badge.trim().isNotEmpty)
                      .map((badge) => Chip(
                            avatar: const Icon(Icons.military_tech, size: 16),
                            label: Text(badge),
                          ))
                      .toList(growable: false),
                ),
              ),
            const SizedBox(height: 15),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Icon(Icons.monetization_on, color: Colors.amber, size: 28),
                      const SizedBox(height: 5),
                      Text('$userCoins Coins', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const VerticalDivider(color: Colors.grey),
                  Column(
                    children: [
                      const Icon(Icons.military_tech, color: Colors.purple, size: 28),
                      const SizedBox(height: 5),
                      Text('${userBadges.length} Badges', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
