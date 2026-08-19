import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * The prototype's CSS keyframes, reproduced with Reanimated.
 *
 *   scrIn    translateX 100% -> 0
 *   sheetIn  translateY 100% -> 0
 *   modalIn  opacity 0 -> 1, scale .94 -> 1
 *   dimIn    opacity 0 -> 1
 *   pulseDot opacity .35 <-> 1, forever
 *   spin     rotate 0 -> 360deg, forever
 *   barFill  width 8% -> 96%
 */
export type AnimName =
  | 'scrIn'
  | 'sheetIn'
  | 'modalIn'
  | 'dimIn'
  | 'pulseDot'
  | 'spin'
  | 'barFill';

const STANDARD = Easing.bezier(0.4, 0, 0.2, 1);

export type AnimProps = {
  name: AnimName | string;
  duration: number;
  loop?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  children?: React.ReactNode;
};

export function Anim(props: AnimProps) {
  switch (props.name) {
    case 'scrIn':
      return <SlideIn axis="x" {...props} />;
    case 'sheetIn':
      return <SlideIn axis="y" {...props} />;
    case 'modalIn':
      return <ModalIn {...props} />;
    case 'dimIn':
      return <FadeIn {...props} />;
    case 'pulseDot':
      return <Pulse {...props} />;
    case 'spin':
      return <Spin {...props} />;
    case 'barFill':
      return <BarFill {...props} />;
    default:
      return <Box {...props} animatedStyle={undefined} />;
  }
}

/** Animated.View or Animated.ScrollView, with the shared plumbing. */
function Box({
  scroll,
  style,
  animatedStyle,
  contentContainerStyle,
  showsVerticalScrollIndicator,
  pointerEvents,
  children,
  onLayout,
}: AnimProps & {
  animatedStyle?: AnimatedStyle<ViewStyle>;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  if (scroll) {
    return (
      <Animated.ScrollView
        style={[style, animatedStyle]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        onLayout={onLayout}
      >
        {children}
      </Animated.ScrollView>
    );
  }
  return (
    <Animated.View
      style={[style, animatedStyle]}
      pointerEvents={pointerEvents}
      onLayout={onLayout}
    >
      {children}
    </Animated.View>
  );
}

/** translate 100% -> 0; the offset needs the laid-out size, so measure first. */
function SlideIn({ axis, ...props }: AnimProps & { axis: 'x' | 'y' }) {
  const progress = useSharedValue(0);
  const [size, setSize] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = axis === 'x' ? e.nativeEvent.layout.width : e.nativeEvent.layout.height;
    if (next && !size) setSize(next);
  };

  useEffect(() => {
    if (!size) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: props.duration, easing: STANDARD });
  }, [size, props.duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const offset = size * (1 - progress.value);
    return {
      // Stay invisible for the frame between mount and measurement.
      opacity: size ? 1 : 0,
      transform: axis === 'x' ? [{ translateX: offset }] : [{ translateY: offset }],
    };
  }, [size]);

  return <Box {...props} animatedStyle={animatedStyle} onLayout={onLayout} />;
}

function ModalIn(props: AnimProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: props.duration, easing: STANDARD });
  }, [props.duration, progress]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.94 + 0.06 * progress.value }],
  }));
  return <Box {...props} animatedStyle={animatedStyle} />;
}

function FadeIn(props: AnimProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: props.duration, easing: Easing.linear });
  }, [props.duration, progress]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  return <Box {...props} animatedStyle={animatedStyle} />;
}

function Pulse(props: AnimProps) {
  const progress = useSharedValue(0.35);
  useEffect(() => {
    const half = props.duration / 2;
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: half, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: half, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [props.duration, progress]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  return <Box {...props} animatedStyle={animatedStyle} />;
}

function Spin(props: AnimProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: props.duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [props.duration, progress]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 360}deg` }],
  }));
  return <Box {...props} animatedStyle={animatedStyle} />;
}

function BarFill(props: AnimProps) {
  const progress = useSharedValue(8);
  useEffect(() => {
    progress.value = withTiming(96, { duration: props.duration, easing: STANDARD });
  }, [props.duration, progress]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  return <Box {...props} animatedStyle={animatedStyle} />;
}

/** The toast keyframe: in, hold, out — one shot across the whole duration. */
export function Toast({
  duration,
  style,
  children,
}: {
  duration: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const progress = useSharedValue(0);
  const lift = useSharedValue(14);
  useEffect(() => {
    const inMs = duration * 0.07;
    const outMs = duration * 0.07;
    const holdMs = duration - inMs - outMs;
    progress.value = withSequence(
      withTiming(1, { duration: inMs, easing: STANDARD }),
      withDelay(holdMs, withTiming(0, { duration: outMs, easing: STANDARD })),
    );
    lift.value = withSequence(
      withTiming(0, { duration: inMs, easing: STANDARD }),
      withDelay(holdMs, withTiming(6, { duration: outMs, easing: STANDARD })),
    );
  }, [duration, progress, lift]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: lift.value }],
  }));
  return (
    <Animated.View style={[style, animatedStyle]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}
