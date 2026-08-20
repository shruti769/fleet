import { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

export function InteractiveFleetMap({ expanded }: { expanded: boolean }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const position = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const bounds = expanded ? { x: 90, y: 75 } : { x: 145, y: 170 };
  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
        onPanResponderGrant: () => {
          dragStart.current = position.current;
        },
        onPanResponderMove: (_, gesture) => {
          const next = {
            x: clamp(dragStart.current.x + gesture.dx, bounds.x),
            y: clamp(dragStart.current.y + gesture.dy, bounds.y),
          };
          position.current = next;
          pan.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const target = {
            x: clamp(position.current.x + gesture.vx * 22, bounds.x),
            y: clamp(position.current.y + gesture.vy * 22, bounds.y),
          };
          position.current = target;
          Animated.spring(pan, {
            toValue: target,
            damping: 18,
            stiffness: 180,
            mass: 0.8,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderTerminate: () => undefined,
      }),
    [bounds.x, bounds.y, pan],
  );

  return (
    <View style={s.viewport} {...responder.panHandlers}>
      <Animated.View
        style={[
          s.map,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: expanded ? 0.86 : 1 },
            ],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 480 820" preserveAspectRatio="xMidYMid slice">
          <Rect width={480} height={820} fill="#F5EFE2" />
          <Rect x="-20" y="110" width={190} height={155} rx={14} fill="#EAF0E4" />
          <Rect x="300" y="500" width={210} height={175} rx={14} fill="#EAF0E4" />
          <Path d="M-30 700C55 660 105 570 72 470S135 310 240 270 385 175 355 25" stroke="#DCEAF2" strokeWidth={20} fill="none" strokeLinecap="round" />
          <Path d="M-35 755C90 735 165 675 250 565S370 410 515 375" stroke="#E3D8C2" strokeWidth={25} fill="none" strokeLinecap="round" />
          <Path d="M65-30C85 135 30 335 115 475S265 625 235 850" stroke="#E9E1D0" strokeWidth={15} fill="none" />
          <Path d="M-30 345H510M-30 545H510" stroke="#EDE6D7" strokeWidth={9} fill="none" />
          <Path d="M395-30C405 145 455 305 412 495" stroke="#E9E1D0" strokeWidth={13} fill="none" />
          <Path d="M-35 755C90 735 165 675 250 565S370 410 515 375" stroke="#16324F" strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.9} />
          <Path d="M-35 755C90 735 165 675 250 565S370 410 515 375" stroke="#F5A21E" strokeWidth={5} strokeDasharray="14 10" fill="none" strokeLinecap="round" />
          <G>
            <Circle cx={250} cy={565} r={19} fill="#16324F" />
            <SvgText x={250} y={571} textAnchor="middle" fontFamily="Inter_700Bold" fontSize={17} fill="#FFFFFF">1</SvgText>
          </G>
          <G>
            <Circle cx={418} cy={405} r={19} fill="#16324F" />
            <SvgText x={418} y={411} textAnchor="middle" fontFamily="Inter_700Bold" fontSize={17} fill="#FFFFFF">2</SvgText>
          </G>
          <G>
            <Circle cx={75} cy={735} r={19} fill="#FFFFFF" stroke="#2563EB" strokeWidth={6} />
            <Circle cx={75} cy={735} r={7} fill="#2563EB" />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  viewport: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  map: {
    bottom: -200,
    left: -160,
    position: 'absolute',
    right: -160,
    top: -200,
  },
});
