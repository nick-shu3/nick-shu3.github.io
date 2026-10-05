// Short sound effects with recovery from browser/native-sheet interruptions.
function createGameAudio(host, enabled, visible = () => true) {
  let ctx = null, pending = null, failed = false, generation = 0;
  function reset() {
    generation++;
    const old = ctx;
    ctx = null; pending = null; failed = false;
    if (old && old.state !== 'closed') {
      try { Promise.resolve(old.close()).catch(() => {}); } catch {}
    }
  }
  function ready(gesture = false) {
    if (!enabled() || !visible()) return Promise.resolve(null);
    try {
      if (gesture && (failed || (pending && Date.now() - pending.at > 1000))) reset();
      if (!ctx || ctx.state === 'closed') {
        if (!gesture) return Promise.resolve(null);
        const Audio = host.AudioContext || host.webkitAudioContext;
        if (!Audio) return Promise.resolve(null);
        ctx = new Audio();
      }
      const current = ctx;
      if (current.state === 'running') return Promise.resolve(current);
      if (pending) return pending.promise;
      const attempt = { at: Date.now() };
      pending = attempt;
      // Call resume synchronously inside the user gesture; wait before scheduling notes.
      attempt.promise = Promise.resolve(current.resume()).then(() => {
        if (ctx !== current) return null;
        failed = current.state !== 'running';
        return failed ? null : current;
      }, () => { if (ctx === current) failed = true; return null; })
        .finally(() => { if (pending === attempt) pending = null; });
      return attempt.promise;
    } catch { failed = true; pending = null; return Promise.resolve(null); }
  }
  async function tone(kind) {
    const started = Date.now();
    const waiting = ready(true), ticket = generation;
    const current = await waiting;
    if (!current || current !== ctx || ticket !== generation || !enabled() || !visible() || current.state !== 'running' || Date.now() - started > 500) return;
    try {
      const freq = {key:880,box:180,gate:440,bridge:260,win:660,step:100}[kind] || 220;
      [0, ...(kind === 'win' ? [.12,.24] : [])].forEach((delay,i) => {
        const o = current.createOscillator(), g = current.createGain(), now = current.currentTime + delay;
        o.type = 'triangle'; o.frequency.value = freq * (1+i*.25);
        g.gain.setValueAtTime(.065,now); g.gain.exponentialRampToValueAtTime(.001,now+.13);
        o.connect(g).connect(current.destination); o.start(now); o.stop(now+.14);
        o.onended = () => { o.disconnect(); g.disconnect(); };
      });
    } catch { failed = true; }
  }
  return {ready, tone, reset};
}
if (typeof module !== 'undefined') module.exports = createGameAudio;
