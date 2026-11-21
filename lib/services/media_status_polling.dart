/// Returns a bounded exponential delay between media-scanner status checks.
/// The first status request remains immediate; subsequent checks back off to
/// reduce callable reads without making the UI wait excessively.
Duration mediaStatusPollDelay(int completedPolls) {
  if (completedPolls < 0) {
    throw ArgumentError.value(completedPolls, 'completedPolls');
  }
  if (completedPolls == 0) return const Duration(seconds: 1);
  if (completedPolls == 1) return const Duration(seconds: 2);
  if (completedPolls == 2) return const Duration(seconds: 4);
  if (completedPolls == 3) return const Duration(seconds: 8);
  return const Duration(seconds: 10);
}
