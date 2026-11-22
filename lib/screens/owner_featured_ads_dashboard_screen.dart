import 'package:flutter/material.dart';

import 'owner_advertising_rewards_screen.dart';

/// Compatibility entry point for legacy routes. Do not maintain a parallel
/// featured-ad dashboard or a separate reward-policy API.
class OwnerFeaturedAdsDashboardScreen extends StatelessWidget {
  const OwnerFeaturedAdsDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) => const OwnerAdvertisingRewardsScreen();
}
