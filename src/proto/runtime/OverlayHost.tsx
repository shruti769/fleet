import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Anim, Toast } from '@/proto/theme/anim';
import { overlays } from '@/proto/screens';
import { useStore } from './state';

/**
 * The prototype renders overlays and the toast inside the phone frame, above
 * whichever screen is showing. Both live here so every route gets them.
 */
export function OverlayHost() {
  const { state, dismiss } = useStore();
  const Overlay = state.overlay ? overlays[state.overlay] : null;

  return (
    <>
      {Overlay ? (
        <View style={styles.layer}>
          <Anim name="dimIn" duration={200} style={StyleSheet.absoluteFill}>
            <Pressable
              accessibilityLabel="Close"
              onPress={dismiss}
              style={[StyleSheet.absoluteFill, styles.backdrop]}
            />
          </Anim>
          <Overlay />
        </View>
      ) : null}
      <ToastHost />
    </>
  );
}

function ToastHost() {
  const { state } = useStore();
  if (!state.toast) return null;
  return (
    <Toast key={state.toast} duration={3300} style={styles.toast}>
      <Text style={styles.toastText}>{state.toast}</Text>
    </Toast>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 30,
  },
  backdrop: {
    backgroundColor: 'rgba(15,27,42,.52)',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 104,
    zIndex: 80,
    backgroundColor: '#0E2033',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    boxShadow: '0 10px 28px rgba(15,27,42,.3)',
  },
  toastText: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
});
