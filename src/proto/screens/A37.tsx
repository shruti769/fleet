import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVals } from '@/proto/runtime/vals';

const notifications = [
  {
    title: 'Job updated',
    body: 'Coastline moved the dock window to 11:00. Your run has been updated.',
    time: 'Now',
    kind: 'job',
    unread: true,
  },
  {
    title: 'Break due in 12 minutes',
    body: 'Take a 15 minute break before 12:26 to stay within your work-hour limit.',
    time: '2 min',
    kind: 'alert',
    unread: true,
  },
  {
    title: 'Kate Ryan sent a message',
    body: 'You are still fine for the revised Coastline dock window.',
    time: '11:38',
    kind: 'message',
    unread: true,
  },
  {
    title: 'Licence expires in 24 days',
    body: 'Your MC licence expires on 1 August 2026. Upload the renewed document when ready.',
    time: 'Yesterday',
    kind: 'document',
    unread: false,
  },
  {
    title: 'Offline records synced',
    body: '3 queued records and 2 photos were sent successfully.',
    time: 'Mon',
    kind: 'sync',
    unread: false,
  },
] as const;

export default function ScreenA37() {
  const insets = useSafeAreaInsets();
  const v = useVals();
  const [allRead, setAllRead] = useState(false);

  return (
    <View style={s.root}>
      <View style={{ height: insets.top }} />
      <View style={s.header}>
        <Pressable onPress={v.root_A27} style={({ pressed }) => [s.back, pressed && s.pressed]} accessibilityRole="button" accessibilityLabel="Back to Run">
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#0F1B2A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Path d="m15 18-6-6 6-6" />
          </Svg>
        </Pressable>
        <View style={s.heading}>
          <Text style={s.title}>Notifications</Text>
          <Text style={s.subtitle}>{allRead ? 'You are all caught up' : '3 unread updates'}</Text>
        </View>
        <Pressable onPress={() => setAllRead(true)} hitSlop={8}>
          <Text style={s.markRead}>Mark all read</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.section}>TODAY</Text>
        <View style={s.card}>
          {notifications.slice(0, 3).map((item, index) => (
            <NotificationRow key={item.title} item={item} read={allRead} last={index === 2} />
          ))}
        </View>
        <Text style={s.section}>EARLIER</Text>
        <View style={s.card}>
          {notifications.slice(3).map((item, index) => (
            <NotificationRow key={item.title} item={item} read last={index === 1} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function NotificationRow({
  item,
  read,
  last,
}: {
  item: (typeof notifications)[number];
  read: boolean;
  last: boolean;
}) {
  const unread = item.unread && !read;
  return (
    <Pressable style={({ pressed }) => [s.row, last && s.lastRow, unread && s.unreadRow, pressed && s.pressed]}>
      <View style={[s.icon, iconStyles[item.kind]]}>
        <NotificationIcon kind={item.kind} />
      </View>
      <View style={s.copy}>
        <View style={s.rowTop}>
          <Text style={s.rowTitle}>{item.title}</Text>
          <Text style={s.time}>{item.time}</Text>
        </View>
        <Text style={s.body}>{item.body}</Text>
      </View>
      {unread ? <View style={s.dot} /> : null}
    </Pressable>
  );
}

function NotificationIcon({ kind }: { kind: (typeof notifications)[number]['kind'] }) {
  const stroke = kind === 'alert' ? '#B45309' : kind === 'sync' ? '#15803D' : '#2563EB';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {kind === 'message' ? <Path d="M4 5h16v11H8l-4 3V5Z" /> : null}
      {kind === 'alert' ? <><Circle cx="12" cy="12" r="9" /><Path d="M12 7v6M12 17h.01" /></> : null}
      {kind === 'document' ? <><Path d="M6 3h8l4 4v14H6V3Z" /><Path d="M14 3v5h4M9 13h6M9 17h4" /></> : null}
      {kind === 'sync' ? <><Path d="M20 7v5h-5M4 17v-5h5" /><Path d="M6.1 8a7 7 0 0 1 11.7-1L20 12M4 12l2.2 5a7 7 0 0 0 11.7-1" /></> : null}
      {kind === 'job' ? <><Path d="M3 7h12v9H3V7ZM15 10h3l3 3v3h-6v-6Z" /><Circle cx="7" cy="17" r="2" /><Circle cx="18" cy="17" r="2" /></> : null}
    </Svg>
  );
}

const iconStyles = StyleSheet.create({
  job: { backgroundColor: '#EFF6FF' },
  alert: { backgroundColor: '#FEF6E9' },
  message: { backgroundColor: '#EFF6FF' },
  document: { backgroundColor: '#EFF6FF' },
  sync: { backgroundColor: '#F0FDF4' },
});

const s = StyleSheet.create({
  root: { backgroundColor: '#F4F6FA', flex: 1 },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#E2E8F0', borderBottomWidth: 1, flexDirection: 'row', minHeight: 68, paddingLeft: 6, paddingRight: 20 },
  back: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  heading: { flex: 1 },
  title: { color: '#0F1B2A', fontFamily: 'BarlowSemiCondensed_700Bold', fontSize: 24, lineHeight: 28 },
  subtitle: { color: '#5B6B7F', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16, marginTop: 2 },
  markRead: { color: '#2563EB', fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 18 },
  content: { padding: 20, paddingBottom: 36 },
  section: { color: '#7B8CA3', fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 0.9, lineHeight: 16, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  row: { alignItems: 'flex-start', borderBottomColor: '#E8EDF3', borderBottomWidth: 1, flexDirection: 'row', gap: 12, minHeight: 100, padding: 16, position: 'relative' },
  lastRow: { borderBottomWidth: 0 },
  unreadRow: { backgroundColor: '#F8FBFF' },
  pressed: { opacity: 0.65 },
  icon: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  copy: { flex: 1 },
  rowTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 8 },
  rowTitle: { color: '#0F1B2A', flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 19 },
  time: { color: '#7B8CA3', fontFamily: 'RobotoMono_400Regular', fontSize: 11, lineHeight: 16 },
  body: { color: '#5B6B7F', fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, marginTop: 5 },
  dot: { backgroundColor: '#2563EB', borderRadius: 999, height: 8, position: 'absolute', right: 8, top: 8, width: 8 },
});
