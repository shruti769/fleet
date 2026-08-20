import { useMemo } from 'react';
import * as D from './data';
import { useStore } from './state';
import { OVERLAY_IDS, SCREEN_IDS, type AnyId } from '@/proto/screens';

/**
 * A port of the prototype's `renderVals()`. Every key the generated screens
 * bind to is produced here under the same name, so the markup did not have to
 * be rewritten.
 */

type Underscored<T extends string> = T extends `${infer A}.${infer B}`
  ? `${A}_${Underscored<B>}`
  : T;

type NavKey = Underscored<AnyId>;

type NavVals = {
  [K in
    | `push_${NavKey}`
    | `rep_${NavKey}`
    | `open_${NavKey}`
    | `tab_${NavKey}`
    | `root_${NavKey}`]: () => void;
};

type ToastVals = { [K in `t_${keyof typeof D.toasts}`]: () => void };

export function useVals() {
  const store = useStore();

  return useMemo(() => buildVals(store), [store]);
}

export type Vals = ReturnType<typeof buildVals>;

function buildVals(store: ReturnType<typeof useStore>) {
  const { state: s, screen, set, go, back, dismiss, toast, drafts, setDraft } = store;

  const nav = {} as NavVals;
  for (const id of [...SCREEN_IDS, ...OVERLAY_IDS]) {
    const k = id.replace(/\./g, '_') as NavKey;
    nav[`push_${k}`] = () => go(id, 'push');
    nav[`rep_${k}`] = () => go(id, 'replace');
    nav[`open_${k}`] = () => go(id, 'sheet');
    nav[`tab_${k}`] = () => go(id, 'tab');
    nav[`root_${k}`] = () => go(id, 'root');
  }

  const toastVals = {} as ToastVals;
  for (const key of Object.keys(D.toasts) as (keyof typeof D.toasts)[]) {
    toastVals[`t_${key}`] = () => toast(D.toasts[key]);
  }

  const opName = s.operator === 'barwon' ? 'Barwon Fuel Haulage' : 'Redgum Freightlines';

  /* -- fit for duty ------------------------------------------------- */
  const qq = D.questions[s.q] || D.questions[0];

  /* -- pre start ---------------------------------------------------- */
  const marked = Object.keys(s.checks).length;
  const mkRows = (names: string[]) =>
    names.map((name, i) => ({
      name,
      num: i + 1,
      isPass: s.checks[i] === 'pass',
      isFail: s.checks[i] === 'fail',
      notPass: s.checks[i] !== 'pass',
      notFail: s.checks[i] !== 'fail',
      pass: () => set((x) => ({ checks: { ...x.checks, [i]: 'pass' } })),
      fail: () => {
        set({ pending: i, activeCheck: name });
        go('A14.M3', 'push');
      },
      open: () => {
        set({ pending: i, activeCheck: name });
        go('A14.M2', 'push');
      },
    }));

  /* -- the run ------------------------------------------------------ */
  const order = s.order || [0, 1, 2];
  const mkStop = (j: (typeof D.jobs)[number], i: number) => ({
    n: i + 1,
    id: j.id,
    customer: j.customer,
    site: j.site,
    window: j.window,
    status: j.status,
    pallets: `${j.pallets} pallets`,
    amber: j.amber,
    muted: !j.amber,
    i0: i % 3 === 0,
    i1: i % 3 === 1,
    i2: i % 3 === 2,
    open: () => go('A5', 'push'),
    more: () => go('A4.M1', 'sheet'),
  });

  const stopsLong = [];
  for (let i = 0; i < 14; i++) {
    const j = D.jobs[i % 3];
    stopsLong.push({
      n: i + 1,
      id: `CN-482${13 + i * 7}`,
      customer: j.customer,
      site: j.site,
      window: j.window,
      status: i === 0 ? 'En route' : 'Allocated',
      amber: i === 0,
      muted: i !== 0,
      i0: i % 3 === 0,
      i1: i % 3 === 1,
      i2: i % 3 === 2,
      open: () => go('A5', 'push'),
      more: () => go('A4.M1', 'sheet'),
    });
  }

  /* -- job status --------------------------------------------------- */
  const si = s.statusIdx;

  /* -- scanning ----------------------------------------------------- */
  const scannedIds = [];
  for (let i = s.scanned; i > s.scanned - 5 && i > 0; i--) {
    scannedIds.push({ id: `PLT-44${50 + i}` });
  }

  /* -- looking for work --------------------------------------------- */
  const wantOffer = screen === 'C3.S1' ? false : screen === 'C3' ? true : null;
  let offer = D.offers[s.offerIdx] || D.offers[0];
  if (wantOffer !== null && offer.ok !== wantOffer) {
    offer = D.offers.filter((x) => x.ok === wantOffer)[0];
  }

  /* -- driver file -------------------------------------------------- */
  const want = screen === 'B3.S2' ? 'expired' : screen === 'B3.S1' ? 'progress' : null;
  const docItem =
    s.docItem && (!want || s.docItem.st === want)
      ? s.docItem
      : want
        ? D.fileItems.filter((f) => f.st === want)[0]
        : s.docItem || D.fileItems[0];

  return {
    ...nav,
    ...toastVals,

    openNotifications: () => go('A37', 'replace'),
    openTimesheetShift: () => {
      set({ timesheetView: 'shift' });
      go('A21', 'push');
    },
    openTimesheetWeek: () => {
      set({ timesheetView: 'week' });
      go('A21', 'push');
    },
    timesheetWeek: s.timesheetView === 'week',

    back,
    dismiss,
    overlayOn: !!s.overlay,
    sbLight: D.darkTop.includes(screen),
    sbDark: !D.darkTop.includes(screen),
    hiLight: D.darkBottom.includes(screen),
    hiDark: !D.darkBottom.includes(screen),
    toastOn: !!s.toast,
    toastMsg: s.toast,

    /* company and operator */
    opName,
    redgumIsCurrent: s.operator !== 'barwon',
    barwonIsCurrent: s.operator === 'barwon',
    redgumSel: s.operator === 'redgum',
    barwonSel: s.operator === 'barwon',
    pickRedgum: () => set({ operator: 'redgum' }),
    pickBarwon: () => set({ operator: 'barwon' }),
    remember: s.remember,
    rememberOff: !s.remember,
    toggleRemember: () => set((x) => ({ remember: !x.remember })),
    canContinue: !!s.operator,
    cannotContinue: !s.operator,

    /* availability */
    available: s.available,
    availableOff: !s.available,
    availHelpOn: s.available,
    availHelpOff: !s.available,
    toggleAvail: () => {
      if (s.available) {
        set({ available: false });
        toast('You are no longer visible to operators');
        return;
      }
      if (!s.availSet) {
        go('C1', 'push');
        return;
      }
      set({ available: true });
      toast('You are visible to operators near Laverton');
    },
    openOffers: () => go(s.availSet ? 'C2' : 'C1', 'push'),
    typeRows: D.workTypes.map((t) => ({
      label: t,
      on: !!s.pickedTypes[t],
      off: !s.pickedTypes[t],
      pick: () => set((x) => ({ pickedTypes: { ...x.pickedTypes, [t]: !x.pickedTypes[t] } })),
    })),
    dayRows: D.dayNames.map((t) => ({
      label: t,
      on: !!s.pickedDays[t],
      off: !s.pickedDays[t],
      pick: () => set((x) => ({ pickedDays: { ...x.pickedDays, [t]: !x.pickedDays[t] } })),
    })),
    radius: `${s.radius} km`,
    radiusUp: () => set((x) => ({ radius: Math.min(300, x.radius + 25) })),
    radiusDown: () => set((x) => ({ radius: Math.max(25, x.radius - 25) })),
    noticeRows: D.noticeOptions.map((t) => ({
      label: t,
      on: s.notice === t,
      off: s.notice !== t,
      pick: () => set({ notice: t }),
    })),
    goLive: () => {
      set({ available: true, availSet: true });
      go('C2', 'replace');
    },
    offerRows: D.offers.map((o, i) => ({
      op: o.op,
      mark: o.mark,
      kind: o.kind,
      when: o.when,
      rate: o.rate,
      dist: o.dist,
      ok: o.ok,
      blocked: !o.ok,
      block: o.block || '',
      isViolet: o.mark === 'SB',
      isTeal: o.mark !== 'SB',
      open: () => {
        set({ offerIdx: i });
        go(o.ok ? 'C3' : 'C3.S1', 'push');
      },
    })),
    offerOp: offer.op,
    offerMark: offer.mark,
    offerKind: offer.kind,
    offerRoute: offer.route,
    offerWhen: offer.when,
    offerRate: offer.rate,
    offerDist: offer.dist,
    offerVehicle: offer.vehicle,
    offerBlock: offer.block || '',
    acceptOffer: () => go('C4', 'replace'),
    declineOffer: () => {
      dismiss();
      back();
      toast('Offer declined, the operator has been told');
    },
    declineRows: D.declineReasons.map((r) => ({
      label: r,
      pick: () => {
        dismiss();
        back();
        toast(`Declined, ${r.toLowerCase()}`);
      },
    })),
    pauseAvail: () => {
      dismiss();
      set({ available: false });
      toast('Paused for a week, nobody can see you');
    },
    stopAvail: () => {
      dismiss();
      set({ available: false, availSet: false });
      go('A27', 'root');
    },
    acceptedDone: () => {
      set({ operator: 'redgum' });
      go('A27', 'root');
    },

    /* shift */
    openCompany: () => go(s.clockedOn ? 'A27.M5' : 'A27.M4', 'sheet'),
    confirmClockOn: () => {
      set({ clockedOn: true });
      go('A27.S1', 'replace');
    },
    takeBreak: () => {
      set({ onBreak: true });
      go('A27.S2', 'replace');
    },
    endBreak: () => {
      set({ onBreak: false });
      go('A27.S1', 'replace');
    },
    confirmClockOff: () => go('A33', 'replace'),
    doneShift: () => {
      set({ clockedOn: false, onBreak: false });
      go('A27', 'replace');
    },
    switchRedgum: () => {
      set({ operator: 'redgum' });
      dismiss();
      toast('Now driving for Redgum Freightlines');
    },
    switchBarwon: () => {
      set({ operator: 'barwon' });
      dismiss();
      toast('Now driving for Barwon Fuel Haulage');
    },
    acceptInvite: () => {
      toast('Barwon Fuel Haulage added');
      go('A26', 'replace');
    },
    tabRun: () => go(s.clockedOn ? 'A27.S1' : 'A27', 'tab'),
    gatePrestart: () => toast('Complete Fit for Duty first'),

    /* fit for duty */
    qText: qq.q,
    qHelp: qq.h,
    qNum: `${s.q + 1} of 4`,
    qPct: `${(s.q + 1) * 25}%` as `${number}%`,
    answerYes: () => {
      if (s.q < 3) set({ q: s.q + 1 });
      else {
        set({ fitForDuty: 'photo' });
        go('A32', 'push');
      }
    },
    answerNo: () => go('A16.S2', 'replace'),
    answered: D.questions.map((x) => ({ q: x.q })),
    usePhoto: () => {
      set({ declPhoto: true, fitForDuty: 'complete' });
      go('A16.S1', 'replace');
    },
    retakePhoto: () => {
      dismiss();
      go('A32', 'replace');
    },

    /* pre start and defects */
    checkProgress: `${Math.min(3 + marked, 16)} of 16`,
    checkPct: `${(Math.min(3 + marked, 16) / 16) * 100}%` as `${number}%`,
    checkRows: mkRows(D.checkItems),
    tankerRows: mkRows(D.tankerItems),
    activeCheck: s.activeCheck,
    passItem: () => {
      set((x) => ({ checks: { ...x.checks, [x.pending]: 'pass' } }));
      back();
    },
    failItem: () => go('A14.M3', 'replace'),
    saveDefect: () => {
      set((x) => ({ checks: { ...x.checks, [x.pending]: 'fail' } }));
      back();
      toast('Comment saved to the vehicle');
    },
    addDefectPhoto: () => {
      set({ defectPhoto: true });
      back();
      toast('Photo added');
    },
    sevOpts: D.severities.map((x) => ({
      label: x,
      on: s.sev === x,
      off: s.sev !== x,
      pick: () => set({ sev: x }),
    })),
    pickSevMonitor: () => {
      set({ sev: 'Monitor' });
      dismiss();
    },
    pickSevRepair: () => {
      set({ sev: 'Repair soon' });
      dismiss();
    },
    pickSevStop: () => {
      set({ sev: 'Do not drive' });
      dismiss();
      go('A14.S2', 'replace');
    },
    sev: s.sev,
    pickVehicleRedgum: () => {
      set({ operator: 'redgum' });
      dismiss();
    },
    pickVehicleTanker: () => {
      dismiss();
      go('A14.S3', 'replace');
    },
    component: s.component,
    componentRows: D.components.map((x) => ({
      label: x,
      pick: () => {
        set({ component: x });
        dismiss();
      },
    })),
    defectPhoto: s.defectPhoto,
    noDefectPhoto: !s.defectPhoto,

    /* starting work */
    reason: s.reason,
    reasonRows: D.reasons.map((x) => ({
      label: x,
      pick: () => {
        set({ reason: x });
        dismiss();
      },
    })),
    addressRows: D.addresses.map((x) => ({
      label: x,
      pick: () => {
        set({ address: x });
        back();
      },
    })),
    address: s.address,
    startUnscheduled: () => {
      toast('Work started, 14:02 Corio VIC');
      go('A27.S1', 'root');
    },
    startUnscheduledOffline: () => {
      set((x) => ({ queue: x.queue + 1 }));
      toast('Saved on this phone, 1 item waiting to sync');
      go('A27.S1', 'root');
    },

    /* the run */
    stops: D.jobs.map(mkStop),
    stopsOrdered: order.map((k) => D.jobs[k]).map(mkStop),
    stopsLong,
    reorderRows: order.map((k, i) => ({
      n: i + 1,
      customer: D.jobs[k].customer,
      site: D.jobs[k].site,
      window: D.jobs[k].window,
      up: () =>
        set((x) => {
          const o = (x.order || [0, 1, 2]).slice();
          if (i > 0) [o[i - 1], o[i]] = [o[i], o[i - 1]];
          return { order: o };
        }),
      down: () =>
        set((x) => {
          const o = (x.order || [0, 1, 2]).slice();
          if (i < o.length - 1) [o[i + 1], o[i]] = [o[i], o[i + 1]];
          return { order: o };
        }),
    })),
    useSuggested: () => {
      dismiss();
      set({ order: [1, 2, 0] });
      go('A4', 'replace');
      toast('Order updated, Kate Ryan notified');
    },
    zoomK: s.zoomOut ? 0.72 : 1,
    toggleZoom: () => set((x) => ({ zoomOut: !x.zoomOut })),
    reroute: () => {
      dismiss();
      toast('Route updated');
    },
    moveToEnd: () => {
      dismiss();
      set({ order: [1, 2, 0] });
      toast('Moved to the end of the run');
    },

    /* job status */
    statusRows: D.statuses.map((x, i) => ({
      label: x.label,
      at: x.at || '',
      note: x.note,
      done: i < si,
      current: i === si,
      later: i > si,
      open: () => {
        set({ target: i });
        go('A8.M1', 'modal');
      },
      openStatus: () => go('A8', 'push'),
    })),
    statusNow: D.statuses[si].label,
    statusNext: D.statuses[Math.min(si + 1, 4)].label,
    advanceStatus: () => {
      const n = Math.min(s.target === undefined ? si + 1 : s.target, 4);
      set({ statusIdx: n });
      dismiss();
      toast(`Marked as ${D.statuses[n].label}, recorded 11:41`);
    },
    arrived: () => {
      set({ target: 2 });
      go('A8.M1', 'modal');
    },

    /* scanning and proof of delivery */
    scanned: `${s.scanned} of 22 scanned`,
    scanPct: `${(s.scanned / 22) * 100}%` as `${number}%`,
    scannedIds,
    scanOne: () => {
      if (s.scanned >= 22) go('A10.M1', 'sheet');
      else set({ scanned: s.scanned + 1 });
    },
    manualAdd: () => {
      dismiss();
      set((x) => ({ scanned: Math.min(22, x.scanned + 1) }));
      toast('Pallet added by hand');
    },
    sig: s.sig,
    noSig: !s.sig,
    setSig: () => {
      set({ sig: true });
      back();
    },
    clearSig: () => set({ sig: false }),
    addPodPhoto: () => {
      back();
      toast('Photo added to the delivery');
    },
    completeDelivery: () => go('A9.S1', 'replace'),
    nextStop: () => {
      set({ statusIdx: 1, sig: false, scanned: 18 });
      go('A5', 'replace');
    },
    podReason: s.podReason,
    podReasonRows: D.podReasons.map((x) => ({
      label: x,
      pick: () => {
        set({ podReason: x });
        dismiss();
      },
    })),
    recordFailed: () => {
      go('A4', 'root');
      toast('Kate Ryan notified');
    },

    /* comments */
    comments: s.comments.map((c) => ({
      who: c.who,
      role: c.role,
      at: c.at,
      text: c.text,
      isKate: c.role === 'Allocator',
      isDave: c.role !== 'Allocator',
    })),
    hasComments: s.comments.length > 0,
    commentRef: {
      value: drafts.comment,
      onChangeText: (text: string) => setDraft('comment', text),
    },
    sendComment: () => {
      const text = drafts.comment.trim() || 'Left the paperwork with the gatehouse.';
      setDraft('comment', '');
      set((x) => ({
        comments: x.comments.concat([
          { who: 'Dave Whitmore', role: 'Driver', at: '11:44', text },
        ]),
      }));
      toast('Comment posted');
    },
    postWithPhoto: () => {
      dismiss();
      set((x) => ({
        comments: x.comments.concat([
          {
            who: 'Dave Whitmore',
            role: 'Driver',
            at: '11:46',
            text: 'Pallets stacked two high on the dock, photo attached.',
          },
        ]),
      }));
      toast('Comment posted');
    },
    whoToast: () => toast('Kate Ryan, Allocator at Redgum Freightlines'),
    attach: s.attach !== false,
    noAttach: s.attach === false,
    removeAttach: () => set({ attach: false }),
    addAttach: () => set({ attach: true }),

    /* fatigue, diary and records */
    weekRows: D.week.map((x) => ({
      d: x.d,
      h: x.h,
      n: x.n,
      tap: () => toast(`${x.d}, ${x.h}, ${x.n}`),
    })),
    diaryRows: D.diary.map((x) => ({
      at: x.at,
      what: x.what,
      note: x.note,
      isRest: x.what === 'Rest',
      isWork: x.what === 'Work',
      isDrive: x.what === 'Drive',
      open: () => go('A13.M2', 'push'),
    })),
    dutyRows: D.dutyTypes.map((x) => ({
      label: x,
      pick: () => {
        dismiss();
        toast(`Status changed to ${x} at 11:41`);
      },
    })),
    fillRows: D.fills.map((x) => ({
      l: x.l,
      p: x.p,
      t: x.t,
      where: x.where,
      ref: x.ref,
      at: x.at,
      tap: () => toast(`${x.l} at ${x.where}, ${x.t}`),
    })),
    incidentType: s.incidentType,
    incidentRows: D.incidentTypes.map((x) => ({
      label: x,
      pick: () => {
        set({ incidentType: x });
        dismiss();
      },
    })),
    startBreakNow: () => {
      dismiss();
      set({ onBreak: true });
      go('A27.S2', 'replace');
    },
    endBreakSheet: () => {
      dismiss();
      set({ onBreak: false });
      go('A27.S1', 'replace');
    },
    submitCorrection: () => {
      back();
      toast('Correction sent to Kate Ryan');
    },
    saveFuel: () => {
      back();
      toast('Fuel entry saved');
    },
    addReceipt: () => {
      back();
      toast('Receipt attached');
    },
    saveOverride: () => {
      back();
      toast('Override recorded');
    },
    t_remind: () => {
      dismiss();
      toast('Reminder set for 12:07');
    },

    /* messages and documents */
    threads: D.threads.map((t, i) => ({
      who: t.who,
      role: t.role,
      at: t.at,
      preview: t.preview,
      i0: i === 0,
      i1: i === 1,
      i2: i === 2,
      unread: !!t.unread,
      read: !t.unread,
      open: () => go('A22.M1', 'push'),
    })),
    msgs: s.msgs,
    msgRef: {
      value: drafts.msg,
      onChangeText: (text: string) => setDraft('msg', text),
    },
    sendMsg: () => {
      const text = drafts.msg.trim() || 'On my way, about 20 minutes out.';
      setDraft('msg', '');
      set((x) => ({
        msgs: x.msgs.concat([{ me: true, them: false, text, at: '11:45' }]),
      }));
    },
    docSections: D.docs,

    /* sync queue */
    queueItems: (s.queue > 0 ? D.queueList.slice(0, s.queue) : []).map((q) => ({
      what: q.what,
      at: q.at,
      waiting: q.waiting,
      open: () => go('A24.M1', 'sheet'),
    })),
    queueCount: s.queue > 0 ? `${s.queue} items waiting` : 'Everything has been sent',
    queueNote:
      s.queue > 0
        ? 'Nothing is lost. It sends as soon as you have signal.'
        : 'Your phone and the office agree.',
    hasQueue: s.queue > 0,
    queueClear: s.queue === 0,
    retrySync: () => {
      toast('Syncing');
      setTimeout(() => set({ queue: 0 }), 800);
    },

    /* profile */
    accreditations: D.accreds,
    notifRows: D.notifKeys.map((k) => ({
      label: k,
      on: s.notif[k] !== false,
      off: s.notif[k] === false,
      toggle: () => set((x) => ({ notif: { ...x.notif, [k]: x.notif[k] === false } })),
    })),
    leaveRedgum: () => toast('Leaving Redgum Freightlines needs your allocator to confirm'),
    leaveBarwon: () => toast('You have left Barwon Fuel Haulage'),
    signOut: () => {
      set({ clockedOn: false, operator: null });
      go('A2', 'root');
    },

    /* driver file */
    fileRows: D.fileItems.map((f) => ({
      n: f.n,
      s: f.s,
      tag: f.tag || '',
      isFs: f.by === 'fleetsync',
      isEmp: f.by === 'employer',
      isVr: f.by === 'vicroads',
      isProg: f.by === 'progress',
      isExp: f.by === 'expired',
      isMissing: f.by === 'missing',
      ok: f.st === 'verified',
      prog: f.st === 'progress',
      bad: f.st === 'expired',
      missing: f.st === 'missing',
      warn: !!f.warn,
      open: () => {
        set({ docItem: f });
        if (f.st === 'missing') go('B2.M1', 'sheet');
        else go(f.st === 'expired' ? 'B3.S2' : f.st === 'progress' ? 'B3.S1' : 'B3', 'push');
      },
    })),
    doc: docItem.n,
    docKind: docItem.kind,
    docNo: docItem.no,
    docIssuer: docItem.issuer,
    docIssued: docItem.issued,
    docExpires: docItem.expires,
    docWarn: !!docItem.warn,
    docByVr: docItem.by === 'vicroads',
    docByFs: docItem.by === 'fleetsync',
    docByEmp: docItem.by === 'employer',
    uploadRows: D.uploadSources.map((x) => ({
      label: x,
      pick: () => {
        dismiss();
        toast(
          x === 'Ask the operator to send it'
            ? 'Request sent to Kate Ryan'
            : 'Uploaded, FleetSync is checking it',
        );
      },
    })),
    shareRows: D.shareWindows.map((x) => ({
      label: x,
      on: s.shareWindow === x,
      off: s.shareWindow !== x,
      pick: () => set({ shareWindow: x }),
    })),
    registerContinue: () => go('B2', 'replace'),
    linkCompany: () => go('B6', 'replace'),
    acceptCode: () => {
      dismiss();
      toast('Invitation code accepted');
      go('B6', 'replace');
    },
    companyLinked: () => {
      set({ operator: 'barwon' });
      go('A26', 'root');
    },
    copyLink: () => toast(`Link copied, valid for ${s.shareWindow}`),
  };
}
