import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Horizontal FleetSync lockup supplied in Container (5).svg. */
export function FleetWordmark() {
  return (
    <View style={s.root}>
      <Svg width={45} height={45} viewBox="0 0 30 30" fill="none">
        <Path d="M0 7a7 7 0 0 1 7-7h16a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7V7Z" fill="#F5A21E" />
        <Path d="M15 8a7 7 0 1 1-7 7" stroke="#0E2033" strokeWidth={1.5} strokeLinecap="round" opacity={0.92} />
        <Path d="m12.6 8.3 2.4-.3.5 2.4" stroke="#0E2033" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.8 18.4V15c0-.333.167-.5.5-.5h6.1v3.9H8.8ZM16 18.4V16h1.2l1.1-1.9c.133-.2.333-.3.6-.3h1.5c.333 0 .5.167.5.5v4.1H16Z" fill="#0E2033" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M11 20.04a1.24 1.24 0 1 0 0-2.48 1.24 1.24 0 0 0 0 2.48Zm0-.7a.54.54 0 1 0 0-1.08.54.54 0 0 0 0 1.08ZM14.2 20.04a1.24 1.24 0 1 0 0-2.48 1.24 1.24 0 0 0 0 2.48Zm0-.7a.54.54 0 1 0 0-1.08.54.54 0 0 0 0 1.08ZM19 20.04a1.24 1.24 0 1 0 0-2.48 1.24 1.24 0 0 0 0 2.48Zm0-.7a.54.54 0 1 0 0-1.08.54.54 0 0 0 0 1.08Z" fill="#0E2033" />
      </Svg>
      <Text style={s.wordmark}>
        <Text style={s.fleet}>Fleet</Text>
        <Text style={s.sync}>Sync</Text>
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  wordmark: {
    fontFamily: 'BarlowSemiCondensed_700Bold',
    fontSize: 27,
    letterSpacing: 0,
    lineHeight: 32,
  },
  fleet: {
    color: '#1B3A5B',
  },
  sync: {
    color: '#F5A21E',
  },
});
