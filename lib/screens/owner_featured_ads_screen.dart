import 'package:flutter/material.dart';

import 'owner_advertising_rewards_screen.dart';

/// Compatibility entry point for legacy routes. Featured and standard ads now
/// share the single owner campaign, finance and reward workflow.
class OwnerFeaturedAdsScreen extends StatelessWidget {
  const OwnerFeaturedAdsScreen({super.key});

  @override
  Widget build(BuildContext context) => const OwnerAdvertisingRewardsScreen();
}
