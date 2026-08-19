// The prototype's fixed data, carried over verbatim from its script block.

export const baseIds =
  'A1 A1.S1 A2 A2.S1 A2.S2 A26 A26.S1 A26.S2 A27 A27.S1 A27.S2 A27.S3 A33 A35 A35.S1 A36 A16 A16.S1 A16.S2 A16.S3 A32 A32.S1 A14 A14.M2 A14.M3 A14.M4 A14.S1 A14.S2 A14.S3 A15 A15.M1 A15.M2 A28 A29 A29.S1 A4 A4.S1 A4.S2 A4.S3 A30 A30.M1 A30.S1 A7 A6 A18 A5 A5.M1 A31 A31.S1 A8 A8.S1 A10 A9 A9.M1 A9.M2 A9.S1 A11 A11.M2 A12 A13 A13.M2 A21 A17 A17.M2 A17.S1 A19 A19.M1 A19.M2 A20 A20.M2 A22 A22.M1 A22.S1 A23 A23.M1 A23.S1 A24 A25 A25.M1 A25.S1 A34 A34.M1 A34.M2 B1 B2 B3 B3.S1 B3.S2 B4 B5 B6 B7 C1 C2 C2.S1 C3 C3.S1 C4'.split(
    ' ',
  );

export const overIds =
  'A2.M1 A2.M2 A26.M1 A27.M1 A27.M2 A27.M3 A27.M4 A27.M5 A35.M1 A16.M1 A16.M2 A32.M1 A14.M1 A14.M5 A15.M3 A29.M1 A29.M2 A4.M1 A30.M2 A7.M1 A6.M1 A6.M2 A5.M2 A5.M3 A31.M1 A8.M1 A10.M1 A10.M2 A9.M3 A11.M1 A12.M1 A12.M2 A13.M1 A21.M1 A21.M2 A17.M1 A20.M1 A24.M1 A34.M3 B2.M1 B4.M1 B5.M1 B7.M1 C2.M1 C3.M1'.split(
    ' ',
  );

/** Screens whose top area is dark, so the status bar needs light content. */
export const darkTop = (
  'A1 A1.S1 A27 A27.S1 A27.S2 A27.S3 A33 A34 A9.S1 A32 A10 A14.M4 A15.M1 A9.M2 A11.M2 A17.M2 A19.M2 ' +
  'A2.S2 A16.S3 A29.S1 A4.S2 A8.S1 C4'
).split(' ');

export const darkBottom = 'A1 A1.S1 A32 A10 A14.M4 A15.M1 A9.M2 A11.M2 A17.M2 A19.M2'.split(' ');

export const threads = [
  {
    who: 'Kate Ryan',
    role: 'Allocator',
    at: '11:38',
    preview: 'Coastline moved the dock window to 11:00, you are still fine.',
    unread: true,
  },
  {
    who: 'Redgum workshop',
    role: 'Workshop',
    at: '09:12',
    preview: 'Air line on T-4471 is booked in for Friday morning.',
  },
  {
    who: 'Marco Ferretti',
    role: 'Site',
    at: 'Yesterday',
    preview: 'Use the north gate after 15:00, the main gate is chained.',
  },
];

export const docs = [
  {
    name: 'Licence and accreditation',
    items: [
      { n: 'MC licence, Victoria', s: 'Expires 1 August 2026', warn: true },
      { n: 'Dangerous goods licence', s: 'Expired 2 July 2026', bad: true },
      { n: 'Fatigue management, BFM', s: 'Expires 30 June 2027' },
    ],
  },
  {
    name: 'Vehicle documents',
    items: [
      { n: 'Registration 1RG4XT', s: 'Expires 14 March 2027' },
      { n: 'Maintenance record', s: 'Updated 6 July 2026' },
    ],
  },
  {
    name: 'Job documents',
    items: [
      { n: 'Consignment CN-48213', s: 'Downloaded' },
      { n: 'Coastline site induction', s: 'Downloaded' },
    ],
  },
];

export const queueList = [
  { what: 'Fit for duty declaration', at: '06:14', waiting: 'Waiting for a connection' },
  { what: 'Pre start inspection, 1RG4XT', at: '06:31', waiting: 'Waiting for a connection' },
  { what: 'Photo, brakes and air lines', at: '06:29', waiting: 'Large file, will send on wifi' },
];

export const accreds = [
  { n: 'Dangerous goods', s: 'Expired 2 July 2026', bad: true },
  { n: 'Basic Fatigue Management', s: 'Expires 30 June 2027' },
  { n: 'Forklift licence, LF', s: 'Expires 12 November 2028' },
];

export const notifKeys = [
  'New job',
  'Job changed',
  'Break due',
  'Message from allocator',
  'Document expiring',
];

export type FileItem = {
  n: string;
  s: string;
  by: string;
  st: string;
  tag?: string;
  warn?: boolean;
  kind: string;
  no: string;
  issuer: string;
  issued: string;
  expires: string;
};

export const fileItems: FileItem[] = [
  {
    n: 'Heavy vehicle licence, MC',
    s: 'Expires 1 August 2026',
    by: 'vicroads',
    st: 'verified',
    tag: '24 days',
    warn: true,
    kind: 'VICTORIA DRIVER LICENCE',
    no: '042 118 663 · Class MC',
    issuer: 'VicRoads, Victoria',
    issued: '02/08/2018',
    expires: '01/08/2026',
  },
  {
    n: 'NHVR medical certificate',
    s: 'Valid to 4 February 2027',
    by: 'fleetsync',
    st: 'verified',
    kind: 'HEAVY VEHICLE MEDICAL',
    no: 'MED-70412',
    issuer: 'Dr A Kaur, Werribee',
    issued: '05/02/2025',
    expires: '04/02/2027',
  },
  {
    n: 'Fatigue accreditation, BFM',
    s: 'Confirmed by Redgum Freightlines',
    by: 'employer',
    st: 'verified',
    kind: 'BASIC FATIGUE MANAGEMENT',
    no: 'BFM-31188',
    issuer: 'Redgum Freightlines',
    issued: '06/07/2026',
    expires: '30/06/2027',
  },
  {
    n: 'Dangerous goods licence',
    s: 'Expired 2 July 2026',
    by: 'expired',
    st: 'expired',
    kind: 'DANGEROUS GOODS LICENCE',
    no: 'DG-88420',
    issuer: 'WorkSafe Victoria',
    issued: '03/07/2023',
    expires: '02/07/2026',
  },
  {
    n: 'Work rights, VEVO check',
    s: 'Submitted 6 July, check running',
    by: 'progress',
    st: 'progress',
    kind: 'WORK RIGHTS, VEVO',
    no: 'VEVO-4419',
    issuer: 'Department of Home Affairs',
    issued: '06/07/2026',
    expires: 'While the visa holds',
  },
  {
    n: 'Tanker safety induction',
    s: 'Required by Barwon Fuel Haulage, not supplied',
    by: 'missing',
    st: 'missing',
    kind: 'TANKER SAFETY INDUCTION',
    no: 'Not supplied',
    issuer: 'Barwon Fuel Haulage',
    issued: 'Not supplied',
    expires: 'Not supplied',
  },
];

export const uploadSources = [
  'Photograph the document',
  'Choose a file on this phone',
  'Import from Service Victoria',
  'Ask the operator to send it',
];

export const workTypes = [
  'General freight',
  'Line haul, overnight',
  'Local, day shift',
  'Refrigerated',
  'Tanker and dangerous goods',
  'Livestock',
];

export const noticeOptions = ['Same day', '24 hours', 'A week ahead'];
export const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const offers = [
  {
    op: 'Sutton Bros Transport',
    mark: 'SB',
    tint: '#7C3AED',
    kind: 'Line haul, overnight',
    route: 'Laverton to Shepparton return',
    when: 'Thu 9 and Fri 10 July, 18:00 start',
    rate: '$52.00 / h',
    dist: '14 km away',
    vehicle: 'Kenworth K220, B double',
    ok: true,
    block: '',
  },
  {
    op: 'Kellow Cold Chain',
    mark: 'KC',
    tint: '#0EA5A4',
    kind: 'Refrigerated, day shift',
    route: 'Truganina metro run, 9 drops',
    when: 'Mon 13 to Wed 15 July, 06:00 start',
    rate: '$44.80 / h',
    dist: '9 km away',
    vehicle: 'Volvo FM rigid',
    ok: true,
    block: '',
  },
  {
    op: 'Barwon Fuel Haulage',
    mark: 'BF',
    tint: '#0EA5A4',
    kind: 'Tanker relief',
    route: 'Corio to Ballarat, placarded',
    when: 'Sat 11 July, 3 shifts',
    rate: '$58.40 / h',
    dist: '22 km away',
    vehicle: 'Volvo FH tanker',
    ok: false,
    block: 'Dangerous goods licence expired 2 July',
  },
];

export const declineReasons = [
  'Rate is too low',
  'Wrong days for me',
  'Too far from home',
  'Already committed',
  'Not this operator',
];

export const shareWindows = ['24 hours', '7 days', 'Until I revoke it'];

export const week = [
  { d: 'Monday 6 July', h: '10 h 12 m', n: '3 jobs' },
  { d: 'Tuesday 7 July', h: '09 h 04 m', n: '2 jobs' },
  { d: 'Wednesday 8 July', h: '02 h 47 m', n: 'In progress' },
  { d: 'Thursday 9 July', h: '00 h 00 m', n: 'Rostered' },
  { d: 'Friday 10 July', h: '00 h 00 m', n: 'Rostered' },
];

export const diary = [
  { at: '06:12', what: 'Work', note: 'Clocked on, Laverton VIC' },
  { at: '06:44', what: 'Drive', note: 'Departed depot' },
  { at: '10:52', what: 'Rest', note: 'Break, Euroa BP' },
  { at: '11:22', what: 'Drive', note: 'Resumed, Hume Freeway' },
];

export const fills = [
  {
    l: '412.6 L',
    p: '$1.842 / L',
    t: '$759.99',
    where: 'Shell Euroa',
    ref: 'RC-88410',
    at: '10:56',
  },
  {
    l: '388.0 L',
    p: '$1.879 / L',
    t: '$729.05',
    where: 'BP Wodonga',
    ref: 'RC-88102',
    at: '7 July 15:12',
  },
  {
    l: '401.2 L',
    p: '$1.812 / L',
    t: '$726.97',
    where: 'Redgum depot, Laverton',
    ref: 'RC-87994',
    at: '6 July 06:40',
  },
];

export const incidentTypes = [
  'Collision',
  'Near miss',
  'Load or restraint',
  'Property damage',
  'Injury',
  'Other',
];

export const dutyTypes = ['Drive', 'Work', 'Rest', 'Off duty'];

export const statuses = [
  { label: 'Accepted', at: '07:02', note: 'Job pushed to your phone' },
  { label: 'En route', at: '11:22', note: 'Left the previous stop' },
  { label: 'Arrived', at: '', note: 'Records time and position at the gate' },
  { label: 'Unloading', at: '', note: 'Starts the site clock' },
  { label: 'Completed', at: '', note: 'Needs a signature or a photo' },
];

export const podReasons = [
  'Site closed',
  'No one to receive',
  'Access blocked',
  'Goods refused',
  'Other',
];

export const reasons = [
  'Workshop collection',
  'Yard duties',
  'Customer site',
  'Relocation',
  'Other',
];

export const addresses = [
  '2 Kirkwood Road, Corio VIC 3214',
  '18 Dohertys Road, Laverton North VIC 3026',
  '441 Melbourne Road, North Geelong VIC 3215',
  '9 Bennet Street, Wodonga VIC 3690',
];

export const jobs = [
  {
    id: 'CN-48213',
    customer: 'Coastline Grocers',
    site: 'Wodonga DC',
    pallets: 22,
    window: '09:30 to 11:00',
    status: 'En route',
    amber: true,
  },
  {
    id: 'CN-48260',
    customer: 'BuildMate Supplies',
    site: 'Albury',
    pallets: 12,
    window: '13:15 to 14:00',
    status: 'Allocated',
    amber: false,
  },
  {
    id: 'CN-48271',
    customer: 'Riverina Produce',
    site: 'Wagga Wagga',
    pallets: 8,
    window: '15:30 to 16:15',
    status: 'Allocated',
    amber: false,
  },
];

export const questions = [
  {
    q: 'Are you well rested and fit to drive?',
    h: 'Redgum Freightlines asks this because fatigue is the single largest cause of heavy vehicle incidents. Answer for how you feel now, not how you expect to feel later in the run.',
  },
  {
    q: 'Are you free of alcohol and drugs?',
    h: 'This covers anything consumed in the last 24 hours. A zero blood alcohol limit applies to every heavy vehicle licence class in Victoria.',
  },
  {
    q: 'Are you free of medication that affects driving?',
    h: 'Prescription and over the counter medicine both count. If the packet carries a drowsiness warning, answer no and speak to your allocator.',
  },
  {
    q: 'Are you fit to complete the planned hours?',
    h: 'Today is planned at 9 h 46 m with one 30 minute break. Answer no if anything about your day makes that unrealistic.',
  },
];

export const checkItems = [
  'Tyres and wheels',
  'Lights and indicators',
  'Brakes and air lines',
  'Mirrors and glass',
  'Coupling and safety chains',
  'Load restraint',
];

export const tankerItems = [
  'Hose and coupling condition',
  'Earthing lead',
  'Emergency shutdown',
  'Vapour recovery',
  'Placards and manifest',
  'Tyres and brakes',
];

export const components = [
  'Brakes and air lines',
  'Tyres and wheels',
  'Lights and indicators',
  'Coupling and safety chains',
  'Body and load restraint',
  'Cab and controls',
];

export const severities = ['Monitor', 'Repair soon', 'Do not drive'];

export const toasts = {
  availOn: 'Saved on this phone only',
  settings: 'Settings would open here',
  store: 'App Store would open here',
  invite: 'Barwon Fuel Haulage added',
  prestartLocked: 'Complete Fit for Duty first',
  reset: 'Reset link sent to your email',
  flip: 'Camera flipped',
  callKate: 'Calling Kate Ryan',
  calling: 'Calling the site contact',
  voice: 'Voice guidance on',
  shareEta: 'ETA sent to the site contact',
  notified: 'Kate Ryan notified',
  commentAttached: 'Comment attached',
  rules: 'BFM, Basic Fatigue Management',
  dutyChanged: 'Status changed at 11:41',
  correction: 'Correction sent to Kate Ryan',
  fuelSaved: 'Fuel entry saved',
  override: 'Override recorded',
  saved: 'Saved to this phone',
  shared: 'Sent',
  help: 'Help centre would open here',
  syncing: 'Syncing',
  notifyClear: 'We will tell you as soon as the check clears',
  renew: 'The WorkSafe Victoria renewal page would open here',
};

export const initialMsgs = [
  {
    them: true,
    me: false,
    at: '11:32',
    text: 'Coastline moved the dock window to 11:00. You are still fine on time.',
  },
  {
    them: false,
    me: true,
    at: '11:34',
    text: 'No worries, I am 40 minutes out. Trailer is loaded to 22.',
  },
  { them: true, me: false, at: '11:38', text: 'Perfect. Marco will meet you at the north gate.' },
];

export const initialComments = [
  {
    who: 'Kate Ryan',
    role: 'Allocator',
    at: '06:58',
    text: 'Coastline added a drop at Albury, pushed to your sheet as stop 2.',
  },
  {
    who: 'Dave Whitmore',
    role: 'Driver',
    at: '08:42',
    text: 'Gate 3 was locked, used the north gate. Keys left in the office pigeonhole.',
  },
];
