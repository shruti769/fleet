import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Brand glow supplied in Container.svg, scaled to the full login viewport. */
export function LoginBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 344 702" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient
            id="loginGlow"
            cx={0}
            cy={0}
            r={1}
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(172 575.64) rotate(-90) scale(280.8 206.4)"
          >
            <Stop stopColor="#F5A21E" stopOpacity={0.14} />
            <Stop offset={0.7} stopColor="#F5A21E" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={344} height={702} fill="url(#loginGlow)" opacity={0.5} />
      </Svg>
    </View>
  );
}
