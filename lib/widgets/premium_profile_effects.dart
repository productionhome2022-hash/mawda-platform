import 'package:flutter/material.dart';

class AnimatedPremiumAvatarFrame extends StatefulWidget {
  const AnimatedPremiumAvatarFrame({super.key, required this.child});

  final Widget child;

  @override
  State<AnimatedPremiumAvatarFrame> createState() => _AnimatedPremiumAvatarFrameState();
}

class _AnimatedPremiumAvatarFrameState extends State<AnimatedPremiumAvatarFrame>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1700),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      child: widget.child,
      builder: (context, child) {
        final pulse = Curves.easeInOut.transform(_controller.value);
        return Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Color.lerp(
                const Color(0xFFFFC857),
                const Color(0xFF9B5DE5),
                pulse,
              )!,
              width: 3 + pulse,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0x669B5DE5).withValues(alpha: 0.18 + pulse * 0.22),
                blurRadius: 10 + pulse * 10,
                spreadRadius: 1 + pulse * 2,
              ),
            ],
          ),
          child: child,
        );
      },
    );
  }
}

class AnimatedPremiumUsername extends StatefulWidget {
  const AnimatedPremiumUsername({
    super.key,
    required this.text,
    required this.colored,
    required this.animated,
  });

  final String text;
  final bool colored;
  final bool animated;

  @override
  State<AnimatedPremiumUsername> createState() => _AnimatedPremiumUsernameState();
}

class _AnimatedPremiumUsernameState extends State<AnimatedPremiumUsername>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1900),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseStyle = TextStyle(
      fontSize: 22,
      fontWeight: FontWeight.bold,
      color: widget.colored ? const Color(0xFF8B4AC8) : null,
    );
    if (!widget.animated) return Text(widget.text, style: baseStyle);
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final pulse = Curves.easeInOut.transform(_controller.value);
        final color = widget.colored
            ? Color.lerp(const Color(0xFF8B4AC8), const Color(0xFFCB6CE6), pulse)
            : null;
        return Transform.scale(
          scale: 1 + pulse * 0.018,
          child: Text(
            widget.text,
            style: baseStyle.copyWith(color: color),
          ),
        );
      },
    );
  }
}
