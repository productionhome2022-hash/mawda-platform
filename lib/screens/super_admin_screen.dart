import 'package:flutter/material.dart';
import '../services/super_admin_security_service.dart';

class SuperAdminScreen extends StatefulWidget {
  const SuperAdminScreen({Key? key}) : super(key: key);

  @override
  State<SuperAdminScreen> createState() => _SuperAdminScreenState();
}

class _SuperAdminScreenState extends State<SuperAdminScreen> {
  final SuperAdminSecurityService _securityService = SuperAdminSecurityService();
  final TextEditingController _searchController = TextEditingController();
  
  Map<String, dynamic>? _foundCredentials;
  bool _isLoading = false;

  void _searchMember() async {
    setState(() => _isLoading = true);
    String query = _searchController.text.trim();
    var data = await _securityService.getMemberCredentials(query);
    setState(() {
      _foundCredentials = data;
      _isLoading = false;
    });
  }

  void _showBanDialog(String uid, String deviceFingerprint) {
    showDialog(
      context: context,
      builder: (context) {
        String selectedType = '24h';
        TextEditingController reasonController = TextEditingController();
        return AlertDialog(
          title: const Text('Sovereign Ban System 🛡️'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(labelText: 'Ban Reason'),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: selectedType,
                items: const [
                  DropdownMenuItem(value: '3h', child: Text('Ban for 3 Hours')),
                  DropdownMenuItem(value: '6h', child: Text('Ban for 6 Hours')),
                  DropdownMenuItem(value: '24h', child: Text('Ban for 24 Hours')),
                  DropdownMenuItem(value: '3d', child: Text('Ban for 3 Days')),
                  DropdownMenuItem(value: '7d', child: Text('Ban for 1 Week')),
                  DropdownMenuItem(value: 'permanent', child: Text('Permanent Account Ban')),
                  DropdownMenuItem(value: 'hwid', child: Text('Hardware Fingerprint Ban (HWID)')),
                ],
                onChanged: (val) {
                  if (val != null) selectedType = val;
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              onPressed: () async {
                await _securityService.executeAdvancedBan(
                  uid: uid,
                  deviceFingerprint: deviceFingerprint,
                  banDurationType: selectedType,
                  reason: reasonController.text.trim().isEmpty ? 'Terms of service violation' : reasonController.text.trim(),
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Penalty executed successfully')),
                );
              },
              child: const Text('Confirm Ban'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin Operations Room 🛡️'),
        backgroundColor: Colors.black87,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            const Text(
              'Intelligence Search & Password Recovery',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: 'Enter Email or UID',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _searchMember,
                  child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Search'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (_foundCredentials != null) ...[
              Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Email: ${_foundCredentials!['email']}'),
                      Text('Password: ${_foundCredentials!['plainPassword']}'),
                      const SizedBox(height: 10),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.block),
                        label: const Text('Issue Penalty / Ban'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                        onPressed: () {
                          _showBanDialog(_foundCredentials!['uid'] ?? 'UNKNOWN_UID', _foundCredentials!['deviceFingerprint'] ?? 'UNKNOWN_HWID');
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const Divider(height: 40),
            const Text(
              'Sovereignty & Master Controls',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ListTile(
              leading: const Icon(Icons.cleaning_services, color: Colors.blue),
              title: const Text('Trigger Auto-Destruct Media (4 Hours)'),
              subtitle: const Text('Delete and purge expired photos & videos'),
              onTap: () async {
                await _securityService.triggerAutoDestructMedia();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Expired media cleaned successfully ⏳')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
