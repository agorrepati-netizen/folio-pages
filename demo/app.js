// Industry Pipeline Atlas: the brief and the analysis.
(function () {
  const root = document.getElementById('atlas');
  const MIN_WON = 100;
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ---------- formatting
  const ok = (v) => v != null && !isNaN(v);
  const sig3 = new Intl.NumberFormat('en', { notation: 'compact', minimumSignificantDigits: 3, maximumSignificantDigits: 3 });
  const money = (v) => { if (!ok(v)) return '—'; const a = Math.abs(v); if (a >= 1e9) return '$' + (v / 1e9).toFixed(a >= 1e11 ? 0 : 1) + 'bn'; if (a >= 1e6) return '$' + Math.round(v / 1e6) + 'm'; if (a >= 1e3) return '$' + Math.round(v / 1e3) + 'k'; return '$' + Math.round(v); };
  const moneyK = (v) => (ok(v) ? '$' + Math.round(v / 1000) + 'k' : '—');
  const pct = (v) => (ok(v) ? (v * 100).toFixed(1) + '%' : '—');
  const pct0 = (v) => (ok(v) ? Math.round(v * 100) + '%' : '—');
  const pts = (v) => (ok(v) ? (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1) : '—');
  const mult = (v) => (ok(v) ? v.toFixed(1) + '×' : '—');
  const num = (v) => (ok(v) ? (Math.abs(v) >= 10000 ? sig3.format(v).replace('K', 'k') : d3.format(',')(Math.round(v))) : '—');
  const dec1 = (v) => (ok(v) ? v.toFixed(1) : '—');
  const dec2 = (v) => (ok(v) ? v.toFixed(2) : '—');
  const per100 = (v) => (ok(v) ? Math.round(v * 100) + ' of 100' : '—');
  const FMT = { money, pct, pct0, per100, mult };
  const day = (s) => new Date(s + 'T00:00:00Z');
  const mon = (s) => d3.utcFormat('%b')(day(s));
  const monthName = (s) => MONTHS[day(s).getUTCMonth()];

  // ---------- theme follows the dashboard's own background
  function setTone() {
    const p = document.createElement('span'); p.style.color = 'var(--color-bg, #fff)'; p.hidden = true; root.appendChild(p);
    const c = d3.color(getComputedStyle(p).color); p.remove();
    const tone = c && (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255 < 0.45 ? 'dark' : 'light';
    if (root.dataset.tone !== tone) { root.dataset.tone = tone; return true; }
    return false;
  }
  setTone();

  // ---------- helpers
  const el = (id) => document.getElementById(id);
  const W = (k, v) => k + '=' + encodeURIComponent(v);
  function mark(src, field, text, where, cls) { const b = document.createElement('b'); b.dataset.source = src; b.dataset.field = field; if (where) b.dataset.where = where; else b.dataset.row = '0'; b.textContent = text; if (cls) b.className = cls; return b; }
  const put = (node, parts) => node.replaceChildren(...parts.filter((p) => p != null && p !== false).map((p) => (typeof p === 'string' ? document.createTextNode(p) : p)));
  function paras(id, list) { el(id).replaceChildren(...list.filter(Boolean).map((parts) => { const p = document.createElement('p'); put(p, parts); return p; })); }
  const data = (...ids) => { const s = ids.map((i) => dash.data(i)); return s.every((x) => x.status === 'ok') ? s.map((x) => x.data) : null; };
  function state(box, ...ids) {
    const s = ids.map((i) => dash.data(i));
    if (s.some((x) => x.status === 'error' || x.status === 'declined')) { box.replaceChildren(); const d = document.createElement('div'); d.className = 'pa-fail'; d.textContent = 'Failed to load'; box.appendChild(d); return null; }
    if (s.some((x) => x.status !== 'ok')) { if (!box.firstChild) box.classList.add('dash-skeleton'); return null; }
    box.classList.remove('dash-skeleton'); return s.map((x) => x.data);
  }
  const seen = new Set();
  function animOnce(box, key) { if (seen.has(key)) { box.classList.remove('pa-anim'); return false; } seen.add(key); box.classList.add('pa-anim'); setTimeout(() => box.classList.remove('pa-anim'), 2600); return true; }
  function svgIn(box, w, h, label) { box.replaceChildren(); box.style.minHeight = '0'; return d3.select(box).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${w} ${h}`).attr('role', 'img').attr('aria-label', label); }
  function textW(svg, t, cls) { const n = svg.append('text').attr('class', cls || 'lb').text(t); const w = n.node().getComputedTextLength(); n.remove(); return w; }
  function tip(box) {
    let t = box.querySelector(':scope > .pa-tip'); if (!t) { t = document.createElement('div'); t.className = 'pa-tip'; box.appendChild(t); }
    return {
      show(ev, head, rows) {
        t.replaceChildren(); const h = document.createElement('div'); h.className = 'h'; h.textContent = head; t.appendChild(h);
        rows.forEach(([k, v]) => { const r = document.createElement('div'); r.className = 'r'; const a = document.createElement('span'); a.textContent = k; const b = document.createElement('b'); b.textContent = v; r.append(a, b); t.appendChild(r); });
        if (!t.isConnected) box.appendChild(t);
        const rc = box.getBoundingClientRect(); let x = ev.clientX - rc.left + 14; let y = ev.clientY - rc.top + 14;
        if (x + t.offsetWidth > rc.width) x = ev.clientX - rc.left - t.offsetWidth - 14; if (x < 0) x = 0;
        if (y + t.offsetHeight > rc.height) y = Math.max(0, ev.clientY - rc.top - t.offsetHeight - 14);
        t.style.left = x + 'px'; t.style.top = y + 'px'; t.classList.add('on');
      },
      hide() { t.classList.remove('on'); },
    };
  }
  const grid = (g, x0, x1, ys) => ys.forEach((yy) => g.append('line').attr('x1', x0).attr('x2', x1).attr('y1', yy).attr('y2', yy).attr('stroke', 'var(--rule-soft)'));
  const eligible = (rows) => rows.filter((r) => r.deals_won >= MIN_WON);
  const focus = () => dash.params().industry || null;
  const setFocus = (n) => dash.setParams({ industry: n && n !== focus() ? n : null });
  const BLUE = 'var(--blue)'; const GREY = 'var(--grey)'; const RED = 'var(--red)'; const FOC = 'var(--focus)';

  // ================= THE BRIEF =================
  let counted = false;
  function countUp(node, to, fmt) {
    if (counted || matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = fmt(to); return; }
    const t0 = performance.now(); const step = (t) => { const k = Math.min(1, (t - t0) / 1100); node.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); else node.textContent = fmt(to); }; requestAnimationFrame(step);
  }
  const fig = (i, src, field, value, fmt, where) => { const n = el('f' + i + 'v'); n.dataset.source = src; n.dataset.field = field; delete n.dataset.where; delete n.dataset.row; if (where) n.dataset.where = where; else n.dataset.row = '0'; countUp(n, value, fmt); };
  const nfmt = (v) => d3.format(',')(Math.round(v));
  const poss = (n) => n + (/s$/.test(n) ? '’' : '’s');
  const weekLabel = (w) => { if (!w.week) return 'the latest week'; const a = day(w.week); const b = day(w.week_end); return a.getUTCMonth() === b.getUTCMonth() ? a.getUTCDate() + ' to ' + b.getUTCDate() + ' ' + MONTHS[b.getUTCMonth()] : d3.utcFormat('%-d %B')(a) + ' to ' + d3.utcFormat('%-d %B')(b); };
  const indRow = () => { const f = focus(); const g = dash.data('ind_brief'); return f && g.status === 'ok' ? g.data.find((r) => r.industry === f) : null; };
  function drawDateline() {
    const now = new Date(); const d = d3.utcFormat('%-d %B %Y')(now); const t = d3.utcFormat('%H:%M')(now);
    const M = dash.data('monthly'); const full = M.status === 'ok' ? M.data.filter((r) => !r.partial) : [];
    const lastFull = full.length ? monthName(full[full.length - 1].month) : null;
    put(el('asof'), ['Data to ' + d + ', queried live at ' + t + ' GMT. ', lastFull ? 'Complete months: January to ' + lastFull + '; ' + monthName(M.data[M.data.length - 1].month) + ' is to date. ' : '', 'Source: Adobe Customer Journey Analytics, data view CJA B2B Edition Demo.']);
    const S = dash.data('scorecard'); const sel = el('brief-pick'); if (S.status !== 'ok') return;
    const f = focus(); const names = S.data.map((r) => r.industry).sort((a, b) => a.localeCompare(b));
    sel.replaceChildren(new Option('All industries', ''), ...names.map((n) => new Option(n, n))); sel.value = f || '';
    if (!sel.dataset.wired) { sel.dataset.wired = '1'; sel.addEventListener('change', () => dash.setParams({ industry: sel.value || null })); }
  }
  function drawBrief() {
    const got = data('outlook', 'yoy', 'monthly', 'scorecard', 'segments', 'weekly_facts', 'funnel_all', 'forecast', 'trough', 'fix_value');
    if (!got) return;
    const [[o], [y], M, S, SEG, [wk], F, [fc], [tr], [fv]] = got; const ir = indRow(); const f = focus();
    const tight = ok(o.needed_per_month) && o.needed_per_month > o.best_month_revenue;
    el('h1').textContent = fc.q_high < o.prior_q_revenue ? '2026 sold early, leaving little for the fourth quarter' : '2026 sold early, and the fourth quarter will show whether it sold more';
    el('stand').classList.remove('dash-skeleton');
    put(el('stand'), [
      '2026 has closed ', mark('outlook', 'ytd_revenue', money(o.ytd_revenue)), ', already more than all of 2025 (', mark('outlook', 'prior_year_revenue', money(o.prior_year_revenue)), '). But half of last year’s revenue came in its fourth quarter, and revenue here tracks the opportunities created three months earlier. Those fell to ',
      mark('outlook', 'last_created', nfmt(o.last_created)), ' in ' + monthName(o.last_full_month) + '. On that pattern the fourth quarter lands near ', mark('forecast', 'q_central', money(fc.q_central)), ' (', mark('forecast', 'q_low', money(fc.q_low)), ' to ', mark('forecast', 'q_high', money(fc.q_high)), '), against ', mark('outlook', 'prior_q_revenue', money(o.prior_q_revenue)), ' a year ago.',
    ]);
    // five numbers
    if (ir) {
      fig(1, 'ind_brief', 'ytd_revenue', ir.ytd_revenue, money, W('industry', f));
      put(el('f1'), [f + ', closed-won revenue in 2026 so far. All of 2025: ', mark('ind_brief', 'prior_year_revenue', money(ir.prior_year_revenue), W('industry', f))]);
      fig(2, 'ind_brief', 'prior_q4_revenue', ir.prior_year_revenue ? ir.prior_q4_revenue / ir.prior_year_revenue : null, pct0, W('industry', f));
      put(el('f2'), ['of ' + poss(f) + ' 2025 revenue came in the fourth quarter: ', mark('ind_brief', 'prior_q4_revenue', money(ir.prior_q4_revenue), W('industry', f))]);
    } else {
      fig(1, 'outlook', 'ytd_revenue', o.ytd_revenue, money);
      put(el('f1'), ['closed-won revenue in 2026 so far. All of 2025: ', mark('outlook', 'prior_year_revenue', money(o.prior_year_revenue))]);
      fig(2, 'outlook', 'prior_q_share', o.prior_q_share, pct0);
      put(el('f2'), ['of 2025’s revenue came in its fourth quarter: ', mark('outlook', 'prior_q_revenue', money(o.prior_q_revenue))]);
    }
    const allp = ir ? 'All industries: ' : '';
    fig(3, 'forecast', 'q_central', fc.q_central, money);
    put(el('f3'), [allp + 'likely fourth quarter, range ', mark('forecast', 'q_low', money(fc.q_low)), ' to ', mark('forecast', 'q_high', money(fc.q_high)), '. Same quarter of 2025: ', mark('outlook', 'prior_q_revenue', money(o.prior_q_revenue))]);
    fig(4, 'outlook', 'cover_months', o.cover_months, dec1);
    put(el('f4'), [allp + 'months of open pipeline in ' + monthName(o.last_full_month) + ' at its closing pace. A year earlier: ', mark('outlook', 'prior_cover_months', dec1(o.prior_cover_months))]);
    fig(5, 'outlook', 'needed_per_month', o.needed_per_month, money);
    el('f5v').classList.toggle('red', tight);
    put(el('f5'), [allp + 'a month needed to match 2025’s fourth quarter. Best month of 2026: ', mark('outlook', 'best_month_revenue', money(o.best_month_revenue))]);
    counted = true;
    // side note, set at the foot of the chart
    paras('hero-side', [
      [ir ? 'All industries: through June, 2026 closed ' : 'Through June, 2026 closed ', mark('yoy', 'h1_multiple', d3.format('.1f')(y.h1_multiple) + ' times'), ' as much as the same months of 2025. July to September added ', mark('yoy', 'q3_revenue_won', money(y.q3_revenue_won)), '.'],
      ['2025 went through the same trough. Opportunities created fell to ', mark('trough', 'low25_created', nfmt(tr.low25_created)), ' in ' + monthName(tr.low25_month) + ' 2025 and were back at ', mark('trough', 'rebound_created', nfmt(tr.rebound_created)), ' by ' + monthName(tr.rebound_month) + ', but that revenue only arrived in the fourth quarter. A rebound now would pay out in 2027.'],
    ]);
    // decisions: owner, trigger, review date, live status
    const meta = (id, rows) => el(id).replaceChildren(...rows.flatMap(([k, v]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); put(dd, Array.isArray(v) ? v : [v]); return [dt, dd]; }));
    const status = (id, cls, txt) => { const s = el(id); s.className = 'pa-status ' + cls; s.textContent = txt; };
    const breach1 = ok(wk.created_vs_ly) && wk.created_vs_ly < 0.7;
    put(el('a1'), ['In the week of ' + weekLabel(wk) + ', ', mark('weekly_facts', 'opps_created', nfmt(wk.opps_created)), ' opportunities were created, against ', mark('weekly_facts', 'ly_opps_created', nfmt(wk.ly_opps_created)), ' a year earlier.']);
    meta('d1', [['Owner', 'Head of demand generation'], ['Trigger', 'Below 70% of the same week in 2025'], ['This year', 'Work the deals already at proposal or negotiation'], ['For 2027', 'Restart opportunity creation now; revenue follows by about three months'], ['Review', 'Every Monday']]);
    status('s1', breach1 ? 'br' : 'ok', breach1 ? 'Triggered' : 'Clear');
    const all = F.find((r) => r.industry === 'All industries'); const rate = all.proposal / all.solution_presented;
    const P = eligible(S).filter((r) => ok(r.proposal_rate)).sort((a, b) => a.proposal_rate - b.proposal_rate); const best = P[P.length - 1];
    put(el('a2'), [mark('funnel_all', 'proposal', String(Math.round(rate * 100)), W('industry', 'All industries')), ' in 100 solution presentations are followed by a proposal. ' + best.industry + ' reaches ', mark('scorecard', 'proposal_rate', pct(best.proposal_rate), W('industry', best.industry)), '; the five weakest industries average ', mark('fix_value', 'low5_rate', pct(fv.low5_rate)), '. Lifting those five to 55% would have added about ', mark('fix_value', 'wins', nfmt(Math.round(fv.wins / 100) * 100)), ' wins, roughly ', mark('fix_value', 'value', money(fv.value)), ', on 2026’s volumes so far.']);
    meta('d2', [['Owner', 'Sales operations'], ['Target', ['55% in each of the five weakest, starting with ' + fv.first + ' (', mark('fix_value', 'first_rate', pct(fv.first_rate)), ')']], ['Review', 'By 31 December 2026']]);
    status('s2', fv.low5_rate >= fv.target ? 'ok' : 'op', fv.low5_rate >= fv.target ? 'Met' : 'Open');
    const hi = SEG.find((s) => s.key === 'Propensity to buy · High'); const lo = SEG.find((s) => s.key === 'Propensity to buy · Low');
    if (hi && lo) put(el('a3'), ['High-propensity accounts win ', mark('segments', 'win_rate', pct(hi.win_rate), W('key', hi.key)), ' of the deals they close and low-propensity ', mark('segments', 'win_rate', pct(lo.win_rate), W('key', lo.key)), '. The score may be built from these same outcomes, so test it before using it to steer sellers.']);
    meta('d3', [['Owner', 'Revenue operations'], ['Test', 'Win rates on opportunities created after the score was last set'], ['Read-out', 'By 15 November 2026']]);
    status('s3', 'op', 'Not started');
  }

  // Hero: running total, 2026 against 2025, the likely fourth quarter and what matching 2025 would take
  function drawHero() {
    const box = el('hero'); const got = state(box, 'cumulative', 'outlook', 'forecast'); if (!got) return;
    const [C, [o], [fc]] = got; const ir = indRow(); const f = focus();
    let rows = C; let need = o.needed; let label = 'All industries';
    if (ir) {
      let a = 0; let b = 0; const live = []; for (let i = 1; i <= 12; i++) { const mm = String(i).padStart(2, '0'); if (ir['m' + mm] != null) live.push(mm); }
      rows = C.map((r, i) => { const mm = String(i + 1).padStart(2, '0'); const m = ir['m' + mm]; const p = ir['p' + mm]; if (p != null) b += p; if (m != null) a += m; return { month: r.month, cum: m != null ? a : null, prior_cum: p != null ? b : null, partial: mm === live[live.length - 1], prior_total: ir.prior_year_revenue }; });
      need = Math.max(0, ir.prior_q4_revenue - ir.q4_to_date); label = f;
    }
    el('hero-t').textContent = (ir ? f + ': r' : 'R') + 'unning total of closed-won revenue';
    const Wd = Math.max(320, box.clientWidth); const narrow = Wd < 560; const H = narrow ? 270 : 290;
    const svg = svgIn(box, Wd, H, 'Running total of closed-won revenue, 2026 against 2025, ' + label);
    const m = { t: 14, r: narrow ? 74 : 104, b: 28, l: 30 };
    const x = d3.scalePoint(rows.map((r) => r.month), [m.l, Wd - m.r]);
    const now = rows.filter((r) => r.cum != null); const last = now[now.length - 1]; const total = rows[0].prior_total;
    const sepIdx = rows.findIndex((r) => r.month.slice(5, 7) === '09'); const sep = rows[sepIdx];
    const target = last ? last.cum + need : total;
    const ymax = Math.max(total, target, d3.max(now, (r) => r.cum), ir ? 0 : fc.year_high) * 1.04;
    const y = d3.scaleLinear([0, ymax], [H - m.b, m.t]).nice();
    const first = animOnce(box, 'hero');
    const q4 = rows.slice(9); if (q4.length) { const xa = x(q4[0].month) - x.step() / 2; svg.append('rect').attr('x', xa).attr('width', x(q4[2].month) - xa + 4).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'var(--wash)'); if (!narrow) svg.append('text').attr('class', 'lb2').attr('x', xa + 8).attr('y', H - m.b - 8).text('Fourth quarter'); }
    const g = svg.append('g'); const ticks = y.ticks(4).filter((t) => t > 0);
    grid(g, m.l, Wd - m.r, ticks.map((t) => y(t)));
    const unit = ymax >= 2e9 ? 1e9 : 1e6; const sfx = unit === 1e9 ? ' $bn' : ' $m';
    ticks.forEach((t, i) => g.append('text').attr('class', 'tk').attr('x', 0).attr('y', y(t) - 5).text(d3.format(',')(t / unit) + (i === ticks.length - 1 ? sfx : '')));
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', 'var(--ink)');
    rows.forEach((r, i) => { if (narrow && i % 2) return; svg.append('text').attr('class', 'tk').attr('x', x(r.month)).attr('y', H - 8).attr('text-anchor', 'middle').text(mon(r.month)); });
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', y(total)).attr('y2', y(total)).attr('stroke', 'var(--ink-3)').attr('stroke-dasharray', '4 4');
    svg.append('text').attr('class', 'lb2 halo').attr('x', m.l + 4).attr('y', y(total) - 7).text('All of 2025: ' + money(total));
    const line = d3.line().x((r) => x(r.month)).y((r) => y(r.v));
    const p25 = rows.filter((r) => r.prior_cum != null).map((r) => ({ month: r.month, v: r.prior_cum }));
    const p26 = now.map((r) => ({ month: r.month, v: r.cum }));
    // likely range for the fourth quarter (all industries only)
    const ann = svg.append('g').attr('class', first ? 'a-fade' : null).style('--d', '1.1s');
    const endM = rows[rows.length - 1].month; const rlab = [];
    if (!ir && sep && sep.cum != null) {
      const base = sep.cum; const band = [{ month: sep.month, lo: base, hi: base }, { month: endM, lo: base + fc.q_low, hi: base + fc.q_high }];
      ann.append('path').attr('d', d3.area().x((r) => x(r.month)).y0((r) => y(r.lo)).y1((r) => y(r.hi))(band)).attr('fill', BLUE).attr('fill-opacity', 0.16);
      ann.append('path').attr('d', line([{ month: sep.month, v: base }, { month: endM, v: base + fc.q_central }])).attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 2).attr('stroke-dasharray', '6 4');
      rlab.push([base + fc.q_central, 'Likely ' + money(base + fc.q_central), BLUE]);
    }
    if (last && need > 0) {
      ann.append('path').attr('d', line([{ month: last.month, v: last.cum }, { month: endM, v: last.cum + need }])).attr('fill', 'none').attr('stroke', 'var(--ink-3)').attr('stroke-width', 1.5).attr('stroke-dasharray', '2 4').attr('stroke-linecap', 'round');
      rlab.push([last.cum + need, 'Needed ' + money(last.cum + need), 'var(--ink-3)']);
    }
    const l25 = svg.append('path').attr('d', line(p25)).attr('fill', 'none').attr('stroke', GREY).attr('stroke-width', 2.5).attr('stroke-linejoin', 'round');
    const l26 = svg.append('path').attr('d', line(p26)).attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 3.5).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
    if (first) [l25, l26].forEach((l, i) => { const L = l.node().getTotalLength(); l.attr('class', 'a-draw').style('--len', L).style('--d', i * 0.25 + 's'); });
    svg.append('g').selectAll('circle').data(p26).join('circle').attr('cx', (r) => x(r.month)).attr('cy', (r) => y(r.v)).attr('r', (r, i) => (i === p26.length - 1 ? 4.5 : 3)).attr('fill', (r, i) => (i === p26.length - 1 ? 'var(--paper)' : BLUE)).attr('stroke', BLUE).attr('stroke-width', 2);
    const cross = p26.find((r) => r.v >= total);
    if (cross) { const cx = x(cross.month); const cy = y(cross.v); ann.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 7).attr('fill', 'none').attr('stroke', 'var(--ink)'); const t = ann.append('text').attr('class', 'an halo').attr('y', cy + (narrow ? 32 : 24)).style('font-size', narrow ? '13px' : null).text((narrow ? 'Passed 2025 in ' : 'Passed all of 2025 in ') + monthName(cross.month)); const w = t.node().getComputedTextLength(); t.attr('x', Math.min(cx + 10, Wd - m.r - w)); }
    // right-hand labels, spaced so they never collide
    const e25 = p25[p25.length - 1]; rlab.push([e25.v, '2025 ' + money(e25.v), 'var(--ink-3)']);
    rlab.sort((a, b) => b[0] - a[0]); let prevY = -1e9;
    rlab.forEach(([v, txt, c]) => { let yy = y(v) + 5; if (yy - prevY < 17) yy = prevY + 17; prevY = yy; ann.append('text').attr('class', 'an').attr('x', x(endM) + 8).attr('y', yy).style('fill', c).style('font-size', narrow ? '13px' : null).text(narrow ? txt.replace('Needed ', 'Need ').replace(/\$([\d.]+)bn/, (mm, n) => '$' + Math.round(+n) + 'bn') : txt); });
    if (last) ann.append('text').attr('class', 'an halo').attr('x', x(last.month) - 6).attr('y', y(last.cum) - 12).attr('text-anchor', 'end').style('fill', BLUE).style('font-size', narrow ? '13px' : null).text('2026 ' + money(last.cum));
    const tt = tip(box);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('x', (r) => x(r.month) - x.step() / 2).attr('width', x.step()).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .on('mousemove', (ev, r) => tt.show(ev, monthName(r.month) + ', running total', [['2026', r.cum != null ? money(r.cum) + (r.partial ? ' (to date)' : '') : 'to come'], ['2025', money(r.prior_cum)]])).on('mouseleave', () => tt.hide());
    put(el('hero-src'), [(ir ? f + '. ' : 'Shaded: likely range, from opportunities created three months earlier. ') + 'Dotted: the pace needed to match 2025’s fourth quarter. Source: Adobe Customer Journey Analytics']);
  }

  // The fourth quarter: opportunities created by month, the last complete week, and alerts
  function drawCreated() {
    const box = el('created'); const got = state(box, 'created', 'outlook'); if (!got) return;
    const [R, [o]] = got;
    const Wd = Math.max(320, box.clientWidth); const narrow = Wd < 560; const H = narrow ? 280 : 300;
    const svg = svgIn(box, Wd, H, 'Opportunities created each month, 2026 against 2025');
    const m = { t: 34, r: 0, b: 30, l: 30 };
    const x = d3.scaleBand(R.map((r) => r.month), [m.l, Wd - m.r]).paddingInner(narrow ? 0.2 : 0.3).paddingOuter(0.05);
    const ymax = d3.max(R, (r) => Math.max(r.created || 0, r.prior_created || 0)) * 1.1;
    const y = d3.scaleLinear([0, ymax], [H - m.b, m.t]).nice();
    const first = animOnce(box, 'created');
    const g = svg.append('g'); const ticks = y.ticks(4).filter((t) => t > 0);
    grid(g, m.l, Wd - m.r, ticks.map((t) => y(t)));
    ticks.forEach((t, i) => g.append('text').attr('class', 'tk').attr('x', 0).attr('y', y(t) - 5).text(Math.round(t / 1000) + (i === ticks.length - 1 ? 'k' : '')));
    const bw = x.bandwidth() / 2 - 1;
    svg.append('g').selectAll('rect').data(R.filter((r) => r.prior_created != null)).join('rect').attr('class', first ? 'a-up' : null).style('--d', (r, i) => i * 0.04 + 's')
      .attr('x', (r) => x(r.month)).attr('width', bw).attr('y', (r) => y(r.prior_created)).attr('height', (r) => y(0) - y(r.prior_created)).attr('fill', GREY);
    svg.append('g').selectAll('rect').data(R.filter((r) => r.created != null)).join('rect').attr('class', first ? 'a-up' : null).style('--d', (r, i) => 0.15 + i * 0.04 + 's')
      .attr('x', (r) => x(r.month) + bw + 2).attr('width', bw).attr('y', (r) => y(r.created)).attr('height', (r) => Math.max(1, y(0) - y(r.created))).attr('fill', (r) => (r.partial ? 'var(--blue-soft)' : BLUE));
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', 'var(--ink)');
    R.forEach((r, i) => { if (narrow && i % 2) return; svg.append('text').attr('class', 'tk').attr('x', x(r.month) + x.bandwidth() / 2).attr('y', H - 8).attr('text-anchor', 'middle').text(mon(r.month)); });
    // bracket the third quarter in both years
    const q3 = R.slice(6, 9); const xa = x(q3[0].month); const xb = x(q3[2].month) + x.bandwidth(); const top = y(d3.max(q3, (r) => r.prior_created || 0)) - 12;
    const ann = svg.append('g').attr('class', first ? 'a-fade' : null).style('--d', '0.9s');
    ann.append('path').attr('d', `M${xa},${top + 6}V${top}H${xb}V${top + 6}`).attr('fill', 'none').attr('stroke', 'var(--ink)');
    const t = ann.append('text').attr('class', 'an halo').attr('y', top - 8).text('Third quarter: ' + num(o.q3_created) + ' in 2026, ' + num(o.prior_q3_created) + ' in 2025');
    const w = t.node().getComputedTextLength(); t.attr('x', Math.max(m.l, Math.min((xa + xb) / 2 - w / 2, Wd - w)));
    const tt = tip(box);
    svg.append('g').selectAll('rect').data(R).join('rect').attr('x', (r) => x(r.month) - x.step() * x.paddingInner() / 2).attr('width', x.step()).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .on('mousemove', (ev, r) => tt.show(ev, monthName(r.month), [['2026', r.created != null ? nfmt(r.created) + (r.partial ? ' (to date)' : '') : 'to come'], ['2025', nfmt(r.prior_created)]])).on('mouseleave', () => tt.hide());
    el('q4-h').textContent = o.q3_created_ratio < 0.5 ? 'New pipeline dried up in the third quarter' : 'New pipeline held up in the third quarter';
    const T = dash.data('trough'); if (T.status === 'ok') { const t2 = T.data[0]; const lowR = R.find((r) => r.month.slice(5, 7) === t2.low25_month.slice(5, 7)); if (lowR && !narrow) { const lx = x(lowR.month) + bw / 2; ann.append('text').attr('class', 'lb2 halo').attr('x', lx).attr('y', y(lowR.prior_created) - 8).attr('text-anchor', 'middle').text('2025 low'); }
      const pc = (v) => (v < 0 ? '−' : '+') + Math.round(Math.abs(v) * 100) + '%';
      put(el('created-check'), ['Data check, June to ' + monthName(t2.check_month) + ': leads ', mark('trough', 'leads_change', pc(t2.leads_change)), ', MQLs ', mark('trough', 'mql_change', pc(t2.mql_change)), ', SQLs ', mark('trough', 'sql_change', pc(t2.sql_change)), ', opportunities created ', mark('trough', 'created_change', pc(t2.created_change)), '. People with any activity ', mark('trough', 'people_change', pc(t2.people_change)), ' and deals closed ', mark('trough', 'closed_change', pc(t2.closed_change)), '. Data is still arriving; the whole top of the funnel stopped, as it did in spring 2025.']); }
  }
  function drawWeek() {
    const box = el('week'); const got = state(box, 'weekly_facts', 'outlook', 'scorecard'); if (!got) return;
    const [[w], [o], S] = got; if (!w.week) return;
    const lbl = weekLabel(w);
    const row = (k, v, c) => { const r = document.createElement('div'); r.className = 'wr'; const a = document.createElement('span'); a.className = 'k'; a.textContent = k; const b = document.createElement('span'); b.className = 'v'; put(b, [v]); const cc = document.createElement('span'); cc.className = 'c'; put(cc, c); r.append(a, b, cc); return r; };
    const hd = document.createElement('div'); hd.className = 'wh'; hd.textContent = 'Last complete week, ' + lbl;
    box.replaceChildren(hd,
      row('Closed-won revenue', mark('weekly_facts', 'revenue_won', money(w.revenue_won)), ['Week before: ', mark('weekly_facts', 'prev_revenue_won', money(w.prev_revenue_won)), '. Same week of 2025: ', mark('weekly_facts', 'ly_revenue_won', money(w.ly_revenue_won))]),
      row('Win rate', mark('weekly_facts', 'win_rate', pct(w.win_rate)), ['Week before: ', mark('weekly_facts', 'prev_win_rate', pct(w.prev_win_rate)), '. Same week of 2025: ', mark('weekly_facts', 'ly_win_rate', pct(w.ly_win_rate))]),
      row('Opportunities created', mark('weekly_facts', 'opps_created', nfmt(w.opps_created)), ['Week before: ', mark('weekly_facts', 'prev_opps_created', nfmt(w.prev_opps_created)), '. Same week of 2025: ', mark('weekly_facts', 'ly_opps_created', nfmt(w.ly_opps_created))]));
    // alerts
    const al = el('alerts'); const lowWR = eligible(S).filter((r) => r.win_rate < 0.2);
    const items = [
      [ok(w.created_vs_ly) && w.created_vs_ly < 0.7, 'New opportunities below 70% of the same week in 2025', [mark('weekly_facts', 'created_vs_ly', pct(w.created_vs_ly)), ' of last year’s level']],
      [ok(o.cover_months) && o.cover_months < 3, 'Fewer than three months of cover', [mark('outlook', 'cover_months', dec1(o.cover_months)), ' months']],
      [ok(o.needed_per_month) && o.needed_per_month > o.best_month_revenue, 'Pace needed above 2026’s best month', [mark('outlook', 'needed_per_month', money(o.needed_per_month)), ' a month']],
      [lowWR.length > 0, 'Industries with 100 or more wins below a 20% win rate', [lowWR.length ? String(lowWR.length) : 'None']],
    ];
    const ah = document.createElement('div'); ah.className = 'ah'; ah.textContent = 'Alerts';
    items.push([null, 'Plan or quota', ['Not connected']]);
    al.replaceChildren(ah, ...items.map(([hit, txt, val]) => { const r = document.createElement('div'); r.className = 'al ' + (hit == null ? 'na' : hit ? 'br' : 'ok'); const i = document.createElement('i'); const s = document.createElement('span'); s.textContent = txt; const b = document.createElement('b'); put(b, val); r.append(i, s, b); r.title = hit ? 'Triggered' : 'Clear'; return r; }));
  }

  // ================= ANALYSIS =================
  function drawFocusBar() {
    const S = dash.data('scorecard'); const box = el('focus'); if (S.status !== 'ok') return;
    const f = focus(); const names = eligible(S.data).map((r) => r.industry).sort((a, b) => a.localeCompare(b));
    const lab = document.createElement('span'); lab.textContent = f ? 'Following' : 'Follow an industry with the picker in the brief, or click any row or mark below.';
    const parts = [lab];
    if (f) { const b = document.createElement('button'); b.type = 'button'; b.textContent = f + '  ×'; b.setAttribute('aria-label', 'Stop following ' + f); b.addEventListener('click', () => dash.setParams({ industry: null })); parts.push(b); }
    box.replaceChildren(...parts);
    const pill = el('follow');
    if (f) {
      const t = document.createElement('span'); t.innerHTML = ''; const b1 = document.createElement('b'); b1.textContent = f; t.append('Following ', b1, '. It is picked out in every chart, and the funnel, the notes, the first two figures and the running total switch to it. Other brief figures stay on all industries.');
      const c = document.createElement('button'); c.type = 'button'; c.textContent = 'Clear'; c.addEventListener('click', () => dash.setParams({ industry: null }));
      pill.replaceChildren(t, c); pill.hidden = false;
    } else { pill.hidden = true; pill.replaceChildren(); }
  }

  // Time: win rate lines
  function drawLine() {
    const box = el('line'); const got = state(box, 'monthly', 'prior_rates'); if (!got) return;
    const [M, P] = got; const full = M.filter((r) => !r.partial);
    const k = (r) => r.month.slice(5, 7);
    const rows = full.map((r) => { const b = P.find((p) => k(p) === k(r)); return b && ok(r.win_rate) && ok(b.win_rate) ? { month: r.month, mm: k(r), now: r.win_rate, was: b.win_rate, gap: r.win_rate - b.win_rate } : null; }).filter(Boolean);
    if (!rows.length) return;
    const Wd = Math.max(320, box.clientWidth); const narrow = Wd < 560; const H = narrow ? 330 : 420;
    const svg = svgIn(box, Wd, H, 'Win rate gap by month: 2026 minus 2025, in percentage points');
    const m = { t: 30, r: 0, b: narrow ? 58 : 62, l: narrow ? 34 : 40 };
    const x = d3.scaleBand(rows.map((r) => r.mm), [m.l, Wd - m.r]).paddingInner(narrow ? 0.3 : 0.42).paddingOuter(0.15);
    const gmax = d3.max(rows, (r) => r.gap); const gmin = d3.min(rows, (r) => r.gap);
    const lim = Math.max(0.04, Math.abs(gmin), gmax);
    const y = d3.scaleLinear([Math.min(-0.04, Math.floor(gmin * 20) / 20 - 0.03), Math.max(0.04, Math.ceil(gmax * 20) / 20 + 0.03)], [H - m.b, m.t]);
    const first = animOnce(box, 'line');
    const g = svg.append('g'); const step = lim > 0.24 ? 0.1 : lim > 0.12 ? 0.05 : 0.02;
    const ticks = d3.range(Math.ceil(y.domain()[0] / step) * step, y.domain()[1] + 1e-9, step).map((t) => Math.round(t * 1000) / 1000).filter((t) => Math.abs(t) > 1e-9);
    grid(g, m.l, Wd - m.r, ticks.map((t) => y(t)));
    ticks.forEach((t, i) => g.append('text').attr('class', 'tk').attr('x', 0).attr('y', y(t) + 4).text((t > 0 ? '+' : '−') + Math.round(Math.abs(t) * 100) + (i === ticks.length - 1 ? ' pts' : '')));
    g.append('text').attr('class', 'tk').attr('x', 0).attr('y', y(0) + 4).text('0');
    const bars = svg.append('g').selectAll('rect').data(rows).join('rect').attr('class', first ? 'a-up' : null).style('--d', (r, i) => i * 0.06 + 's')
      .attr('x', (r) => x(r.mm)).attr('width', x.bandwidth())
      .attr('y', (r) => y(Math.max(0, r.gap))).attr('height', (r) => Math.max(1, Math.abs(y(r.gap) - y(0))))
      .attr('fill', (r) => (r.gap < 0 ? RED : BLUE));
    if (first) bars.style('transform-origin', (r) => (r.gap < 0 ? 'center top' : 'center bottom'));
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', 'var(--ink)').attr('stroke-width', 1.5);
    const lab = svg.append('g').attr('class', first ? 'a-fade' : null).style('--d', '0.8s');
    rows.forEach((r) => {
      const cx = x(r.mm) + x.bandwidth() / 2; const pts = r.gap * 100;
      lab.append('text').attr('class', 'an halo').style('fill', r.gap < 0 ? RED : BLUE).attr('text-anchor', 'middle').attr('x', cx)
        .attr('y', r.gap < 0 ? y(r.gap) + 18 : y(r.gap) - 8).text((pts < 0 ? '−' : '+') + Math.abs(pts).toFixed(1));
      lab.append('text').attr('class', 'tk').attr('text-anchor', 'middle').attr('x', cx).attr('y', H - m.b + 24).style('fill', 'var(--ink)').text(MONTHS[+r.mm - 1].slice(0, 3));
      lab.append('text').attr('class', 'tk').attr('text-anchor', 'middle').attr('x', cx).attr('y', H - m.b + 42).text(pct(r.now).replace('%', ''));
      lab.append('text').attr('class', 'tk').attr('text-anchor', 'middle').attr('x', cx).attr('y', H - m.b + 58).style('opacity', 0.7).text(pct(r.was).replace('%', ''));
    });
    const wlo = d3.least(rows, (r) => r.was);
    if (!narrow && wlo && wlo.gap > 0 && wlo.was < 0.15) {
      const i = rows.indexOf(wlo); const prev = rows[i - 1] && rows[i - 1].gap > 0 ? rows[i - 1] : wlo; const tx = x(prev.mm) - 18; const ty = y(prev.gap) + 4;
      lab.append('path').attr('d', `M${tx + 4},${ty - 4}H${x(prev.mm) - 3}`).attr('stroke', 'var(--ink)').attr('fill', 'none');
      ['Much of this lead is last year’s slump:', '2025 won ' + pct(wlo.was) + ' in ' + monthName(wlo.month)].forEach((t, j) => lab.append('text').attr('class', j ? 'lb2 halo' : 'an halo').attr('text-anchor', 'end').attr('x', tx).attr('y', ty + j * 18).text(t));
    }
    const fa = rows.find((r) => r.gap > 0); const fb = rows.find((r) => r.gap < 0);
    if (fa) lab.append('text').attr('class', 'lb2 halo').attr('x', x(fa.mm)).attr('y', y(fa.gap) - 28).style('fill', BLUE).text('2026 ahead');
    if (fb) { const lowest = d3.least(rows, (r) => r.gap); lab.append('text').attr('class', 'lb2 halo').attr('x', x(lowest.mm) + x.bandwidth() + 8).attr('y', y(lowest.gap) - 4).style('fill', RED).text('2026 behind'); }
    svg.append('text').attr('class', 'tk').attr('x', 0).attr('y', H - m.b + 42).style('fill', 'var(--blue)').text('2026');
    svg.append('text').attr('class', 'tk').attr('x', 0).attr('y', H - m.b + 58).style('opacity', 0.7).text('2025');
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', H - m.b + 29).attr('y2', H - m.b + 29).attr('stroke', 'var(--rule-soft)');
    const tt = tip(box);
    svg.append('g').selectAll('rect').data(rows).join('rect').attr('x', (r) => x(r.mm) - x.step() * x.paddingInner() / 2).attr('width', x.step()).attr('y', m.t).attr('height', H - m.t).attr('fill', 'transparent')
      .on('mousemove', (ev, r) => tt.show(ev, MONTHS[+r.mm - 1], [['2026 win rate', pct(r.now)], ['2025 win rate', pct(r.was)], ['Gap', (r.gap < 0 ? '−' : '+') + Math.abs(r.gap * 100).toFixed(1) + ' pts']])).on('mouseleave', () => tt.hide());
  }
  function timeNotes() {
    const got = data('yoy', 'prior_rates', 'drivers'); if (!got) return; const [[y], P, D] = got;
    const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
    const nb = mark('yoy', 'months_behind', words[y.months_behind] || String(y.months_behind)); nb.style.fontWeight = 'inherit';
    put(el('time-h'), ['2026’s win rate trailed 2025’s in ', nb, ' of ' + (words[y.months_compared] || y.months_compared) + ' months, then pulled ahead']);
    const late = P.filter((r) => ['08', '09'].includes(r.month.slice(5, 7)));
    const jul = D.find((r) => r.month.slice(5, 7) === '07'); const lastD = D[D.length - 1];
    const wonLo = d3.min(D.filter((r) => r.month >= '2026-07'), (r) => r.deals_won); const wonHi = d3.max(D.filter((r) => r.month >= '2026-07'), (r) => r.deals_won);
    paras('n-time', [
      ['2026’s win rate trailed 2025’s in ', mark('yoy', 'months_behind', words[y.months_behind] || String(y.months_behind)), ' of ', mark('yoy', 'months_compared', words[y.months_compared] || String(y.months_compared)), ' complete months. Over January to ' + monthName(y.last_full_month) + ' it still comes out ahead: ', mark('yoy', 'win_rate', pct(y.win_rate), null, 'bl'), ' against ', mark('yoy', 'prior_win_rate', pct(y.prior_win_rate)), '.'],
      late.length === 2 ? ['The late lead says as much about last year as this one. 2025’s win rate fell to ', mark('prior_rates', 'win_rate', pct(late[0].win_rate), W('month', late[0].month)), ' in August and ', mark('prior_rates', 'win_rate', pct(late[1].win_rate), W('month', late[1].month)), ' in September.'] : null,
      jul && lastD ? ['From July to ' + monthName(lastD.month) + ', wins stayed between ', mark('drivers', 'deals_won', nfmt(wonLo), W('month', D.find((r) => r.deals_won === wonLo).month)), ' and ', mark('drivers', 'deals_won', nfmt(wonHi), W('month', D.find((r) => r.deals_won === wonHi).month)), ' a month while losses fell from ', mark('drivers', 'deals_lost', nfmt(jul.deals_lost), W('month', jul.month), 'r'), ' to ', mark('drivers', 'deals_lost', nfmt(lastD.deals_lost), W('month', lastD.month)), '. The higher win rate came from fewer losses. Most losses happen early, and with opportunity creation down from ', mark('drivers', 'opps_created', nfmt(jul.opps_created), W('month', jul.month)), ' in July to ', mark('drivers', 'opps_created', nfmt(lastD.opps_created), W('month', lastD.month)), ' in ' + monthName(lastD.month) + ', fewer deals were young enough to lose. The ' + monthName(lastD.month) + ' win rate flatters the quarter.'] : null,
    ]);
  }
  function drawDrivers() {
    const box = el('drivers'); const got = state(box, 'drivers'); if (!got) return; const [D] = got;
    const Wd = Math.max(320, box.clientWidth); const narrow = Wd < 560; const H = narrow ? 240 : 260;
    const svg = svgIn(box, Wd, H, 'Deals won and lost each month of 2026');
    const m = { t: 16, r: narrow ? 8 : 74, b: 30, l: 34 };
    const x = d3.scalePoint(D.map((r) => r.month), [m.l, Wd - m.r]);
    const y = d3.scaleLinear([0, d3.max(D, (r) => Math.max(r.deals_won, r.deals_lost)) * 1.08], [H - m.b, m.t]).nice();
    const first = animOnce(box, 'drivers');
    const g = svg.append('g'); const ticks = y.ticks(4).filter((t) => t > 0);
    grid(g, m.l, Wd - m.r, ticks.map((t) => y(t)));
    ticks.forEach((t, i) => g.append('text').attr('class', 'tk').attr('x', 0).attr('y', y(t) - 5).text(Math.round(t / 1000) + (i === ticks.length - 1 ? 'k' : '')));
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', 'var(--ink)');
    D.forEach((r, i) => { if (narrow && i % 2) return; svg.append('text').attr('class', 'tk').attr('x', x(r.month)).attr('y', H - 8).attr('text-anchor', 'middle').text(mon(r.month)); });
    const jul = D.find((r) => r.month.slice(5, 7) === '07'); if (jul) { svg.append('line').attr('x1', x(jul.month)).attr('x2', x(jul.month)).attr('y1', m.t).attr('y2', y(0)).attr('stroke', 'var(--ink-3)').attr('stroke-dasharray', '3 4'); svg.append('text').attr('class', 'lb2').attr('x', x(jul.month) + 6).attr('y', m.t + 12).text('July'); }
    [['deals_lost', RED, 'Lost'], ['deals_won', BLUE, 'Won']].forEach(([k, c, lab], j) => {
      const p = svg.append('path').attr('d', d3.line().x((r) => x(r.month)).y((r) => y(r[k]))(D)).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 3).attr('stroke-linejoin', 'round');
      if (first) { const L = p.node().getTotalLength(); p.attr('class', 'a-draw').style('--len', L).style('--d', j * 0.2 + 's'); }
      svg.append('g').selectAll('circle').data(D).join('circle').attr('cx', (r) => x(r.month)).attr('cy', (r) => y(r[k])).attr('r', 3).attr('fill', c);
      const e = D[D.length - 1]; if (!narrow) svg.append('text').attr('class', 'an').attr('x', x(e.month) + 10).attr('y', y(e[k]) + 5).style('fill', c).text(lab);
      else svg.append('text').attr('class', 'an halo').attr('x', x(D[0].month)).attr('y', y(D[0][k]) - 9).style('fill', c).text(lab);
    });
    const tt = tip(box);
    svg.append('g').selectAll('rect').data(D).join('rect').attr('x', (r) => x(r.month) - x.step() / 2).attr('width', x.step()).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .on('mousemove', (ev, r) => tt.show(ev, monthName(r.month), [['Won', nfmt(r.deals_won)], ['Lost', nfmt(r.deals_lost)], ['Win rate', pct(r.win_rate)], ['Opportunities created', nfmt(r.opps_created)]])).on('mouseleave', () => tt.hide());
  }
  function drawSuspects() {
    const box = el('suspects'); const got = state(box, 'drivers'); if (!got) return; const [D] = got;
    const a = D.find((r) => r.month.slice(5, 7) === '06'); const b = D[D.length - 1]; if (!a || !b) return;
    const rows = [['Average won deal', 'avg_deal', moneyK], ['Enterprise share of revenue', 'enterprise_share', pct], ['High-propensity share of wins', 'high_share', pct], ['Meetings per active opportunity', 'meetings_per_opp', dec2], ['Opportunities created', 'opps_created', nfmt]];
    const moved = []; const t = document.createElement('table'); t.className = 'pa-rt';
    const th = document.createElement('tr'); ['', monthName(a.month), monthName(b.month), 'Change'].forEach((s) => { const c = document.createElement('th'); c.textContent = s; th.appendChild(c); }); t.appendChild(th);
    rows.forEach(([lab, k, f]) => {
      const tr = document.createElement('tr'); const share = /share/.test(k); const ch = share ? b[k] - a[k] : a[k] ? b[k] / a[k] - 1 : null; const hot = !share && ok(ch) && Math.abs(ch) > 0.25; if (hot) moved.push(lab);
      const c0 = document.createElement('td'); c0.textContent = lab;
      const c1 = document.createElement('td'); c1.appendChild(mark('drivers', k, f(a[k]), W('month', a.month)));
      const c2 = document.createElement('td'); c2.appendChild(mark('drivers', k, f(b[k]), W('month', b.month)));
      const c3 = document.createElement('td'); c3.className = 'vd' + (hot ? ' hot' : ''); c3.textContent = !ok(ch) ? '—' : share ? (ch >= 0 ? '+' : '−') + Math.abs(ch * 100).toFixed(1) + ' pts' : (ch >= 0 ? '+' : '−') + Math.abs(ch * 100).toFixed(0) + '%';
      [c1, c2].forEach((c) => c.firstChild.style.fontWeight = 'inherit');
      tr.append(c0, c1, c2, c3); t.appendChild(tr);
    });
    box.replaceChildren(t);
    el('suspects-cs').textContent = 'If one of these had moved, it could explain the turn. ' + (moved.length === 1 ? 'Only ' + moved[0].toLowerCase() + ' did' : moved.length ? moved.length + ' did' : 'None did');
  }

  // Industries: dumbbell
  let dbAll = false;
  function drawDumbbell() {
    const box = el('dumbbell'); const got = state(box, 'halves'); if (!got) return;
    const [Hv] = got; const f = focus();
    const rows = eligible(Hv).filter((r) => ok(r.h1_win_rate) && ok(r.q3_win_rate)).sort((a, b) => b.q3_win_rate - a.q3_win_rate);
    const lo = Math.floor(d3.min(rows, (r) => r.h1_win_rate) * 20) / 20; const hi = Math.ceil(d3.max(rows, (r) => r.q3_win_rate) * 20) / 20;
    const sx = (v) => (((v - lo) / (hi - lo)) * 100).toFixed(2) + '%';
    const narrowDb = box.clientWidth < 560;
    const ticks = d3.range(lo, hi + 0.001, narrowDb ? 0.1 : 0.05);
    const hd = document.createElement('div'); hd.className = 'hd';
    const ax = document.createElement('div'); ax.className = 'axis';
    ticks.forEach((t, i) => { const s = document.createElement('span'); s.style.left = sx(t); s.textContent = Math.round(t * 100) + (i === ticks.length - 1 ? '%' : ''); ax.appendChild(s); });
    const c3 = document.createElement('span'); c3.style.textAlign = 'right'; c3.textContent = 'Points';
    hd.append(document.createElement('span'), ax, c3);
    const out = [hd];
    const EDGE = 5; const cut = !dbAll && rows.length > EDGE * 2 + 2;
    const keep = (r, i) => !cut || i < EDGE || i >= rows.length - EDGE || r.industry === f;
    const moreBtn = (txt) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'more'; b.textContent = txt; b.addEventListener('click', () => { dbAll = !dbAll; drawDumbbell(); }); return b; };
    let gap = 0;
    const flush = () => { if (!gap) return; const g = document.createElement('div'); g.className = 'gap'; g.append(moreBtn(gap + ' more industries in between. Show all ' + rows.length)); out.push(g); gap = 0; };
    rows.forEach((r, i) => {
      if (!keep(r, i)) { gap++; return; } flush();
      const rw = document.createElement('div'); rw.className = 'rw' + (r.industry === f ? ' on' : '') + (f && r.industry !== f ? ' dim' : '');
      rw.dataset.key = r.industry; rw.title = r.industry + ': ' + pct(r.h1_win_rate) + ' → ' + pct(r.q3_win_rate);
      const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = r.industry;
      const tr = document.createElement('div'); tr.className = 'tr';
      ticks.forEach((t) => { const gl = document.createElement('i'); gl.className = 'gl'; gl.style.left = sx(t); tr.appendChild(gl); });
      const seg = document.createElement('i'); seg.className = 'seg'; seg.style.left = sx(r.h1_win_rate); seg.style.width = ((r.q3_win_rate - r.h1_win_rate) / (hi - lo) * 100).toFixed(2) + '%';
      const a = document.createElement('i'); a.className = 'a'; a.style.left = sx(r.h1_win_rate);
      const b = document.createElement('i'); b.className = 'b'; b.style.left = sx(r.q3_win_rate);
      tr.append(seg, a, b);
      const dv = document.createElement('span'); dv.className = 'dv'; dv.textContent = pts(r.change);
      rw.append(nm, tr, dv); rw.addEventListener('click', () => setFocus(r.industry)); out.push(rw);
    });
    flush();
    if (dbAll && rows.length > EDGE * 2 + 2) { const g = document.createElement('div'); g.className = 'gap end'; g.append(moreBtn('Show the top and bottom five only')); out.push(g); }
    box.replaceChildren(...out);
  }
  function indNotes() {
    const got = data('halves', 'scorecard', 'effort'); if (!got) return; const [Hv, S, [fit]] = got; const rows = eligible(Hv).filter((r) => ok(r.change));
    const up = rows.filter((r) => r.change > 0).length; const big = d3.greatest(rows, (r) => r.change); const small = d3.least(rows, (r) => r.change);
    const best = d3.greatest(rows, (r) => r.q3_win_rate); const f = focus(); const fr = f && rows.find((r) => r.industry === f);
    el('ind-h').textContent = (up === rows.length ? 'Win rates rose in every industry, by ' : 'Win rates rose in most industries, by ') + Math.round(small.change * 100) + ' to ' + Math.round(big.change * 100) + ' points';
    paras('n-ind', [
      [up === rows.length ? 'All ' + rows.length + ' industries won a larger share of their closed deals in the third quarter than in the first half.' : String(up) + ' of ' + rows.length + ' industries won a larger share of their closed deals in the third quarter than in the first half.'],
      ['The gains ran from ', mark('halves', 'change', pts(small.change) + ' points', W('industry', small.industry)), ' in ' + small.industry + ' to ', mark('halves', 'change', pts(big.change) + ' points', W('industry', big.industry), 'bl'), ' in ' + big.industry + '.'],
      [best.industry + ' won ', mark('halves', 'q3_win_rate', pct(best.q3_win_rate), W('industry', best.industry), 'bl'), ' of the deals it closed in the third quarter, the best of any industry.'],
      (() => { const sh = rows.filter((r) => ok(r.q3_revenue_share)); if (sh.length < 3) return null; const a = d3.least(sh, (r) => r.q3_revenue_share); const b = d3.greatest(sh, (r) => r.q3_revenue_share); return ['Every industry took between ', mark('halves', 'q3_revenue_share', pct(a.q3_revenue_share), W('industry', a.industry)), ' and ', mark('halves', 'q3_revenue_share', pct(b.q3_revenue_share), W('industry', b.industry)), ' of its January to September revenue in the third quarter. A swing that even points to a cause shared by every industry.']; })(),
      fr ? [fr.industry + ': ', mark('halves', 'h1_win_rate', pct(fr.h1_win_rate), W('industry', fr.industry)), ' in the first half, ', mark('halves', 'q3_win_rate', pct(fr.q3_win_rate), W('industry', fr.industry), 'bl'), ' in the third quarter.'] : null,
    ]);
  }

  function drawMultiples() {
    const box = el('mult'); const got = state(box, 'heat', 'scorecard', 'monthly'); if (!got) return;
    const [Hd, S, M] = got; const f = focus();
    const part = (M.find((r) => r.partial) || {}).month;
    const names = new Set(eligible(S).map((r) => r.industry));
    const H0 = Hd.filter((r) => r.month !== part && names.has(r.industry));
    const months = Array.from(new Set(H0.map((r) => r.month))).sort();
    const series = Array.from(d3.group(H0, (r) => r.industry), ([industry, rs]) => { const tot = d3.sum(rs, (r) => r.revenue_won); const by = new Map(rs.map((r) => [r.month, r.revenue_won])); return { industry, pts: months.map((mo) => ({ month: mo, share: tot ? (by.get(mo) || 0) / tot : 0 })) }; });
    const fullM = M.filter((r) => !r.partial && months.includes(r.month)); const totAll = d3.sum(fullM, (r) => r.revenue_won);
    const all = months.map((mo) => { const r = fullM.find((q) => q.month === mo); return { month: mo, share: r && totAll ? r.revenue_won / totAll : 0 }; });
    const Wd = Math.max(320, box.clientWidth); const narrow = Wd < 560; const H = narrow ? 300 : 340;
    const svg = svgIn(box, Wd, H, 'Each industry’s monthly closed-won revenue as a share of its January to September total');
    const m = { t: 24, r: narrow ? 8 : 150, b: 30, l: 34 };
    const x = d3.scalePoint(months, [m.l, Wd - m.r]).padding(0.2);
    const ymax = Math.ceil((d3.max(series, (s) => d3.max(s.pts, (p) => p.share)) + 0.01) * 50) / 50;
    const y = d3.scaleLinear([0, ymax], [H - m.b, m.t]);
    const first = animOnce(box, 'mult');
    const q3 = months.filter((mo) => +mo.slice(5, 7) >= 7);
    if (q3.length) { const xa = x(q3[0]) - x.step() / 2; const xb = Math.min(Wd - m.r, x(q3[q3.length - 1]) + x.step() / 2); svg.append('rect').attr('x', xa).attr('width', xb - xa).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'var(--wash)'); svg.append('text').attr('class', 'lb2').attr('x', xa + 8).attr('y', m.t + 16).text('July to September'); }
    const g = svg.append('g'); const ticks = y.ticks(4).filter((t) => t > 0);
    grid(g, m.l, Wd - m.r, ticks.map((t) => y(t)));
    ticks.forEach((t, i) => g.append('text').attr('class', 'tk').attr('x', 0).attr('y', y(t) - 5).text(Math.round(t * 100) + (i === ticks.length - 1 ? '%' : '')));
    svg.append('line').attr('x1', m.l).attr('x2', Wd - m.r).attr('y1', y(0)).attr('y2', y(0)).attr('stroke', 'var(--ink)');
    months.forEach((mo, i) => { if (narrow && i % 2) return; svg.append('text').attr('class', 'tk').attr('x', x(mo)).attr('y', H - 8).attr('text-anchor', 'middle').text(MONTHS[+mo.slice(5, 7) - 1].slice(0, 3)); });
    const line = d3.line().x((p) => x(p.month)).y((p) => y(p.share));
    const lg = svg.append('g').attr('class', first ? 'a-fade' : null);
    const paths = lg.selectAll('path').data(series).join('path').attr('d', (s) => line(s.pts)).attr('fill', 'none').attr('stroke', 'var(--ink-3)').attr('stroke-opacity', 0.45).attr('stroke-width', 1);
    const allP = svg.append('path').attr('d', line(all)).attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 3.5).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
    if (first) { const L = allP.node().getTotalLength(); allP.attr('class', 'a-draw').style('--len', L).style('--d', '0.3s'); }
    svg.append('g').selectAll('circle').data(all).join('circle').attr('cx', (p) => x(p.month)).attr('cy', (p) => y(p.share)).attr('r', 3).attr('fill', BLUE);
    const hl = svg.append('path').attr('fill', 'none').attr('stroke-width', 2.5).attr('stroke-linejoin', 'round');
    const last = months[months.length - 1]; const ex = x(last) + 10;
    const endLab = (txt, val, cls, col) => { if (narrow) return; svg.append('text').attr('class', cls).style('fill', col).attr('x', ex).attr('y', y(val) + 5).text(txt); };
    endLab('All industries', all[all.length - 1].share, 'an', BLUE);
    const fs = f && series.find((s) => s.industry === f);
    const lab2 = svg.append('text').attr('class', 'lb2 halo').attr('x', ex);
    const show = (s, col) => { hl.attr('d', line(s.pts)).attr('stroke', col).attr('opacity', 1); if (!narrow) lab2.attr('y', y(s.pts[s.pts.length - 1].share) + (s.pts[s.pts.length - 1].share > all[all.length - 1].share ? -12 : 20)).style('fill', col).text(s.industry); };
    const clear = () => { if (fs) show(fs, FOC); else { hl.attr('opacity', 0); lab2.text(''); } };
    clear();
    if (!narrow) { svg.append('text').attr('class', 'lb2 halo').attr('x', x(months[1])).attr('y', m.t + 14).text('Grey: one line per industry'); }
    const tt = tip(box);
    svg.append('rect').attr('x', m.l).attr('width', Wd - m.l - m.r).attr('y', m.t).attr('height', H - m.t - m.b).attr('fill', 'transparent').style('cursor', 'pointer')
      .on('mousemove', (ev) => {
        const [px, py] = d3.pointer(ev); const i = Math.max(0, Math.min(months.length - 1, Math.round((px - x(months[0])) / x.step()))); const mo = months[i];
        const s = d3.least(series, (q) => Math.abs(y(q.pts[i].share) - py)); show(s, BLUE);
        tt.show(ev, s.industry, [[MONTHS[+mo.slice(5, 7) - 1], pct(s.pts[i].share) + ' of its year'], ['All industries', pct(all[i].share)]]);
        box.dataset.hover = s.industry;
      })
      .on('mouseleave', () => { tt.hide(); clear(); delete box.dataset.hover; })
      .on('click', () => { if (box.dataset.hover) setFocus(box.dataset.hover); });
  }

  // Industries: deal size as a single strip
  function drawBee() {
    const box = el('bee'); const got = state(box, 'scorecard'); if (!got) return;
    const [S] = got; const f = focus(); const P = eligible(S).filter((r) => ok(r.avg_deal));
    const Wd = Math.max(300, box.clientWidth); const H = 96;
    const lo = d3.min(P, (q) => q.avg_deal); const hi = d3.max(P, (q) => q.avg_deal);
    const x = d3.scaleLinear([Math.floor(lo / 1e4) * 1e4 - 1e4, Math.ceil(hi / 1e4) * 1e4 + 1e4], [8, Wd - 8]);
    const svg = svgIn(box, Wd, H, 'Average won deal by industry');
    const base = 62;
    svg.append('line').attr('x1', x.range()[0]).attr('x2', x.range()[1]).attr('y1', base).attr('y2', base).attr('stroke', 'var(--ink)');
    x.ticks(Wd < 480 ? 3 : 4).filter((t) => x(t) > 30 && x(t) < Wd - 30).forEach((t) => svg.append('text').attr('class', 'tk').attr('x', x(t)).attr('y', base + 22).attr('text-anchor', 'middle').text(moneyK(t)));
    const tt = tip(box);
    svg.append('g').selectAll('line').data(P).join('line').attr('class', 'hit').attr('x1', (q) => x(q.avg_deal)).attr('x2', (q) => x(q.avg_deal)).attr('y1', base - 26).attr('y2', base)
      .attr('stroke', (q) => (q.industry === f ? FOC : 'var(--ink-3)')).attr('stroke-width', (q) => (q.industry === f ? 3 : 1.5)).attr('stroke-opacity', (q) => (f && q.industry !== f ? 0.35 : 0.9))
      .on('click', (ev, q) => setFocus(q.industry)).on('mousemove', (ev, q) => tt.show(ev, q.industry, [['Average won deal', moneyK(q.avg_deal)]])).on('mouseleave', () => tt.hide());
    svg.append('path').attr('d', `M${x(lo)},${base - 30}V${base - 36}H${x(hi)}V${base - 30}`).attr('fill', 'none').attr('stroke', 'var(--ink)');
    const t = svg.append('text').attr('class', 'an').attr('y', base - 42).text('Range ' + moneyK(hi - lo) + ', ' + Math.round((hi / lo - 1) * 100) + '% of the lowest');
    const w = t.node().getComputedTextLength(); t.attr('x', Math.max(0, Math.min((x(lo) + x(hi)) / 2 - w / 2, Wd - w)));
  }
  function dealNotes() {
    const got = data('scorecard', 'effort'); if (!got) return; const [S, [fit]] = got; const P = eligible(S);
    const lo = d3.least(P, (r) => r.avg_deal); const hi = d3.greatest(P, (r) => r.avg_deal);
    if (ok(fit.correlation) && el('m-corr')) el('m-corr').textContent = fit.correlation.toFixed(2);
    paras('n-deal', [
      ['Every industry’s average won deal falls between ', mark('scorecard', 'avg_deal', moneyK(lo.avg_deal), W('industry', lo.industry)), ' (' + lo.industry + ') and ', mark('scorecard', 'avg_deal', moneyK(hi.avg_deal), W('industry', hi.industry)), ' (' + hi.industry + '). The revenue gaps between industries come mostly from how many deals are won.'],
    ]);
  }

  // Accounts: where to put sellers
  function drawSeller() {
    const box = el('grid3'); const got = state(box, 'seller'); if (!got) return; const [SL] = got;
    const G = SL.filter((r) => r.kind === 'grid'); const sizes = ['Enterprise', 'Mid-Market', 'Small Business']; const props = ['High', 'Medium', 'Low'];
    const max = d3.max(G, (r) => r.win_rate); const min = d3.min(G.filter((r) => r.accounts >= 20), (r) => r.win_rate);
    const out = [document.createElement('span')];
    props.forEach((p) => { const h = document.createElement('div'); h.className = 'gh'; h.textContent = p + ' propensity'; out.push(h); });
    sizes.forEach((sz) => {
      const rh = document.createElement('div'); rh.className = 'rh'; rh.textContent = sz; out.push(rh);
      props.forEach((p) => {
        const r = G.find((g) => g.size === sz && g.propensity === p) || {}; const t = ok(r.win_rate) ? Math.max(0.06, (r.win_rate - min * 0.8) / (max - min * 0.8)) * 0.85 : 0;
        const c = document.createElement('div'); c.className = 'cell' + (t > 0.5 ? ' inv' : ''); c.style.setProperty('--t', t.toFixed(3));
        const w = document.createElement('div'); w.className = 'w'; const mw = mark('seller', 'win_rate', pct(r.win_rate), W('key', r.key)); mw.style.fontWeight = 'inherit'; w.appendChild(mw);
        const s = document.createElement('div'); s.className = 's'; s.append(mark('seller', 'revenue_per_account', money(r.revenue_per_account), W('key', r.key)), document.createTextNode(' per account · ' + nfmt(r.accounts) + ' accounts'));
        s.firstChild.style.fontWeight = 'inherit';
        c.title = sz + ', ' + p.toLowerCase() + ' propensity: win rate ' + pct(r.win_rate) + ', ' + pct0(r.revenue_share) + ' of revenue, ' + pct0(r.account_share) + ' of accounts';
        c.append(w, s); out.push(c);
      });
    });
    box.replaceChildren(...out);
    const list = (kind, title) => {
      const d = document.createElement('div'); d.className = 'pa-list'; const h = document.createElement('h4'); h.textContent = title; const ol = document.createElement('ol');
      SL.filter((r) => r.kind === kind).forEach((r) => { const li = document.createElement('li'); const n = document.createElement('span'); n.className = 'n2'; n.textContent = r.industry + ' · ' + r.size + ', ' + r.propensity.toLowerCase(); const dsc = document.createElement('span'); dsc.className = 'd'; dsc.textContent = 'Win rate ' + pct(r.win_rate) + ' on ' + nfmt(r.deals_won + r.deals_lost) + ' closed deals · ' + r.accounts + ' accounts'; const v = document.createElement('span'); v.className = 'v'; v.appendChild(mark('seller', 'revenue_per_account', money(r.revenue_per_account), W('key', r.key))); li.append(n, v, dsc); ol.appendChild(li); });
      d.append(h, ol); return d;
    };
    el('lists').replaceChildren(list('top', 'Highest revenue per account'), list('bottom', 'Lowest revenue per account'));
  }
  function accNotes() {
    const got = data('seller', 'scorecard'); if (!got) return; const [SL, S] = got;
    const G = SL.filter((r) => r.kind === 'grid' && r.accounts >= 20); const P = eligible(S);
    const gHi = d3.greatest(G, (r) => r.win_rate); const gLo = d3.least(G, (r) => r.win_rate);
    const iHi = d3.greatest(P, (r) => r.win_rate); const iLo = d3.least(P, (r) => r.win_rate);
    const eh = SL.find((r) => r.key === 'Enterprise · High');
    el('acc-h').textContent = (gHi.win_rate - gLo.win_rate) > (iHi.win_rate - iLo.win_rate) ? 'Account segment separates winners more than industry does' : 'Industry separates winners more than account segment does';
    paras('n-acc', [
      ['Across industries, win rates run from ', mark('scorecard', 'win_rate', pct(iLo.win_rate), W('industry', iLo.industry)), ' to ', mark('scorecard', 'win_rate', pct(iHi.win_rate), W('industry', iHi.industry)), '. Across segments with 20 or more accounts they run from ', mark('seller', 'win_rate', pct(gLo.win_rate), W('key', gLo.key), 'r'), ' (' + gLo.size + ', ' + gLo.propensity.toLowerCase() + ' propensity) to ', mark('seller', 'win_rate', pct(gHi.win_rate), W('key', gHi.key), 'bl'), ' (' + gHi.size + ', ' + gHi.propensity.toLowerCase() + ').'],
      eh ? ['Enterprise accounts with high propensity are ', mark('seller', 'account_share', pct0(eh.account_share), W('key', eh.key)), ' of active accounts and bring in ', mark('seller', 'revenue_share', pct0(eh.revenue_share), W('key', eh.key)), ' of revenue. If the propensity score passes the test due by 15 November, that is where added sellers should go first. With only about a month of open pipeline, they would be prospecting for 2027.'] : null,
      ['Revenue per account counts accounts with any activity in 2026, so it reflects the size of the account base in this data, not contract value.'],
    ]);
  }
  // Accounts: segment bars, one header and one colour
  function drawSegments() {
    const box = el('segments'); const got = state(box, 'segments'); if (!got) return;
    const [SEG] = got; const groups = d3.group(SEG.filter((r) => r.group === 'Propensity to churn'), (r) => r.group);
    const maxWR = d3.max(SEG, (r) => r.win_rate) * 1.22;
    const out = [];
    const head = document.createElement('div'); head.className = 'gh'; const h0 = document.createElement('span'); const h1 = document.createElement('span'); h1.textContent = 'Win rate, %'; const h2 = document.createElement('span'); h2.textContent = 'Share of closed-won revenue, %'; head.append(h0, h1, h2); out.push(head);
    groups.forEach((rows, g) => {
      const wrap = document.createElement('div'); wrap.className = 'g';
      rows.forEach((r) => {
        const sr = document.createElement('div'); sr.className = 'sr';
        const n = document.createElement('div'); n.textContent = r.segment;
        const bar = (v, max, color, txt) => { const d = document.createElement('div'); d.className = 'bar'; const i = document.createElement('i'); i.style.setProperty('--c', color); i.style.width = (v / max * 100).toFixed(1) + '%'; const em = document.createElement('em'); em.textContent = txt; const pc = v / max * 100; if (pc > 62) { em.style.right = (100 - pc).toFixed(1) + '%'; em.style.paddingRight = '6px'; em.style.color = color === BLUE ? 'var(--paper)' : 'var(--ink)'; } else em.style.left = pc.toFixed(1) + '%'; d.append(i, em); return d; };
        sr.append(n, bar(r.win_rate, maxWR, BLUE, pct(r.win_rate)), bar(r.revenue_share, 1, 'var(--grey)', pct0(r.revenue_share)));
        sr.title = r.group + ' · ' + r.segment + ': ' + num(r.accounts) + ' accounts, average won deal ' + moneyK(r.avg_deal);
        wrap.appendChild(sr);
      });
      out.push(wrap);
    });
    box.replaceChildren(...out);
  }
  function segNotes() {
    const got = data('segments'); if (!got) return; const [SEG] = got;
    const g = (k) => SEG.find((s) => s.key === k) || {};
    const hb = g('Propensity to buy · High'); const lb = g('Propensity to buy · Low'); const lc = g('Propensity to churn · Low'); const hc = g('Propensity to churn · High');
    paras('n-seg', [
      ['High-propensity accounts win ', mark('segments', 'win_rate', pct(hb.win_rate), W('key', hb.key), 'bl'), ' of the deals they close, low-propensity accounts ', mark('segments', 'win_rate', pct(lb.win_rate), W('key', lb.key), 'r'), '. That fits the score but does not prove it works, because the score sits on the account today and may be built from these same outcomes.'],
      ['High-propensity accounts both win more often and have more opportunities: ', mark('segments', 'opps_per_account', num(hb.opps_per_account), W('key', hb.key)), ' per account against ', mark('segments', 'opps_per_account', num(lb.opps_per_account), W('key', lb.key)), '. Average deal size is almost the same (', mark('segments', 'avg_deal', moneyK(hb.avg_deal), W('key', hb.key)), ' and ', mark('segments', 'avg_deal', moneyK(lb.avg_deal), W('key', lb.key)), ').'],
      ['Churn risk lines up the same way: low-risk accounts win ', mark('segments', 'win_rate', pct(lc.win_rate), W('key', lc.key)), ', high-risk ', mark('segments', 'win_rate', pct(hc.win_rate), W('key', hc.key)), '.'],
    ]);
  }

  // Funnel: stage counts beside the drop from the stage before
  const STAGES = [['leads', 'Lead generated'], ['mql', 'MQL qualified'], ['sql', 'SQL qualified'], ['opps_created', 'Opportunity created'], ['needs_assessment', 'Needs assessment'], ['solution_presented', 'Solution presented'], ['proposal', 'Proposal submitted'], ['negotiation', 'Negotiation started'], ['closed_won', 'Closed-won']];
  function drawSteps() {
    const box = el('steps'); const got = state(box, 'funnel_all'); if (!got) return;
    const [F] = got; const f = focus(); const row = (f && F.find((r) => r.industry === f)) || F.find((r) => r.industry === 'All industries');
    el('steps-title').textContent = 'Where deals stall' + (row.industry === 'All industries' ? '' : ': ' + row.industry);
    const st = STAGES.map(([k, l], i) => ({ k, l, v: row[k], c: i ? row[k] / row[STAGES[i - 1][0]] - 1 : null }));
    const worst = d3.least(st.filter((s) => s.c != null), (s) => s.c); const vmax = d3.max(st, (s) => s.v); const dmax = d3.max(st, (s) => (s.c != null ? Math.abs(s.c) : 0));
    const narrow = box.clientWidth < 520;
    const kf = (n) => (n >= 1e4 ? Math.round(n / 1e3) + 'k' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(Math.round(n)));
    const cell = (cls, kids) => { const d = document.createElement('div'); d.className = cls; kids.forEach((k) => d.append(k)); return d; };
    const out = [cell('hd', ['Stage']), cell('hd', ['Events']), cell('hd', ['Change'])];
    st.forEach((s) => {
      const isW = s === worst; const nm = cell('nm' + (isW ? ' worst' : ''), [s.l]);
      const bi = document.createElement('i'); bi.style.width = 'calc((100% - 46px) * ' + (s.v / vmax).toFixed(4) + ')'; if (isW) bi.style.background = 'var(--red)';
      const cb = cell('cb', [bi, kf(s.v)]);
      let dr;
      if (s.c == null) dr = cell('dr', ['']);
      else if (s.c > 0) dr = cell('dr up', [(() => { const sp = document.createElement('span'); sp.textContent = '+' + Math.round(s.c * 100) + '%'; return sp; })()]);
      else { const di = document.createElement('i'); di.style.width = Math.max(2, Math.abs(s.c) / dmax * (narrow ? 34 : 56)).toFixed(1) + 'px'; const sp = document.createElement('span'); sp.textContent = (Math.abs(s.c) < 0.01 ? '−' + (Math.abs(s.c) * 100).toFixed(1) : '−' + Math.round(Math.abs(s.c) * 100)) + '%' + (isW && !narrow ? ', biggest drop' : ''); dr = cell('dr' + (isW ? ' worst' : ''), [di, sp]); }
      [nm, cb, dr].forEach((c) => { c.title = s.l + ': ' + num(s.v) + ' events' + (s.c != null ? ', ' + (s.c > 0 ? '+' : '−') + Math.abs(s.c * 100).toFixed(1) + '% on the stage before' : ''); });
      out.push(nm, cb, dr);
    });
    box.replaceChildren(...out);
  }
  function drawWaffle() {
    const got = data('leak', 'funnel_all'); if (!got) return; const [[lk], F] = got; const all = F.find((r) => r.industry === 'All industries'); const pr = all.proposal / all.solution_presented;
    [['waffle', lk.lost_before_share, RED], ['waffle2', 1 - pr, RED]].forEach(([id, share, col]) => {
      const n = Math.round(share * 100);
      el(id).replaceChildren(...Array.from({ length: 100 }, (_, i) => { const c = document.createElement('i'); c.style.setProperty('--c', i < n ? col : 'var(--cell)'); return c; }));
    });
    document.querySelectorAll('#funnel .pa-big .v[data-fmt]').forEach((v) => { v.textContent = FMT[v.dataset.fmt](lk[v.dataset.field]); });
    el('w2v').textContent = per100(1 - pr);
  }
  function funNotes() {
    const got = data('steps', 'scorecard', 'funnel_all'); if (!got) return; const [ST, S, F] = got;
    const s = ST.filter((r) => r.drop != null).sort((a, b) => b.drop - a.drop); const w = s[0]; const w2 = s[1];
    const prev = ST[ST.findIndex((r) => r.step === w.step) - 1];
    const P = eligible(S).filter((r) => ok(r.proposal_rate)); const pl = d3.least(P, (r) => r.proposal_rate); const ph = d3.greatest(P, (r) => r.proposal_rate);
    const all = F.find((r) => r.industry === 'All industries');
    paras('n-fun', [
      ['"' + w.label + '" logs ', mark('steps', 'drop', pct(w.drop), W('step', w.step), 'r'), ' fewer events than "' + prev.label.toLowerCase() + '"', w.drop > 2 * w2.drop ? ', more than twice the drop at any other stage.' : ', the largest drop in the funnel.'],
      ['Among industries with 100 or more wins, the share of solution presentations followed by a proposal runs from ', mark('scorecard', 'proposal_rate', pct(pl.proposal_rate), W('industry', pl.industry)), ' (' + pl.industry + ') to ', mark('scorecard', 'proposal_rate', pct(ph.proposal_rate), W('industry', ph.industry)), ' (' + ph.industry + ').'],
      ['Solution presentation is also the slowest stage measured: it averages ', mark('funnel_all', 'avg_days_solution', dec1(all.avg_days_solution) + ' days', W('industry', 'All industries')), ' per event, against ', mark('funnel_all', 'avg_days_opp_creation', dec1(all.avg_days_opp_creation), W('industry', 'All industries')), ' for opportunity creation and ', mark('funnel_all', 'avg_days_needs_assessment', dec1(all.avg_days_needs_assessment), W('industry', 'All industries')), ' for needs assessment.'],
      ['Needs assessment logs more events than opportunity creation, a sign that these are event counts and not deals followed from stage to stage.'],
      (() => { const f = focus(); const fr = f && S.find((r) => r.industry === f); if (!fr) return null; return ['For ' + f + ', ', mark('scorecard', 'proposal_rate', pct(fr.proposal_rate), W('industry', f)), ' of solution presentations are followed by a proposal.']; })(),
    ]);
  }

  // Ledger
  const st = { k: 'revenue_won', asc: false };
  const tbody = document.querySelector('#table tbody'); const search = el('search');
  document.querySelectorAll('#table th button').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.k; if (st.k === k) st.asc = !st.asc; else { st.k = k; st.asc = k === 'industry'; } drawTable(); }));
  search.addEventListener('input', () => drawTable());
  const SHOW = 10; let showAll = false;
  const more = el('more'); more.addEventListener('click', () => { showAll = !showAll; drawTable(); if (!showAll) el('ledger').scrollIntoView({ block: 'start' }); });
  const ttT = tip(el('ledger'));
  const WHY = { win_rate: 'win rate', proposal_rate: 'proposal rate' };
  tbody.addEventListener('mousemove', (e) => { const c = e.target.closest('td.hi, td.lo'); if (!c) { ttT.hide(); return; } const r = c.closest('tr').dataset.key; const k = c.dataset.k; ttT.show(e, r, [[c.classList.contains('hi') ? 'Top three on ' + WHY[k] : 'Bottom three on ' + WHY[k], c.textContent], ['Ranked among', 'industries with 100+ wins']]); });
  tbody.addEventListener('mouseleave', () => ttT.hide());
  tbody.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-key]'); if (tr) setFocus(tr.dataset.key); });
  const LOWER = new Set(['stage_days']);
  const RATES = ['win_rate', 'proposal_rate'];
  function drawTable() {
    document.querySelectorAll('#table th').forEach((th) => { const b = th.querySelector('button'); if (!b) return; const on = th.dataset.field === st.k; th.setAttribute('aria-sort', on ? (st.asc ? 'ascending' : 'descending') : 'none'); b.textContent = b.textContent.replace(/ [↑↓]$/, '') + (on ? (st.asc ? ' ↑' : ' ↓') : ''); });
    const S = dash.data('scorecard'); const Hd = dash.data('heat'); const M = dash.data('monthly');
    if (S.status !== 'ok') { tbody.replaceChildren(); return; }
    const f = focus(); const q = search.value.trim().toLowerCase(); const P = eligible(S.data);
    const rank = {}; RATES.forEach((k) => { const s = P.filter((r) => ok(r[k])).sort((a, b) => (LOWER.has(k) ? a[k] - b[k] : b[k] - a[k])); rank[k] = [new Set(s.slice(0, 3).map((r) => r.industry)), new Set(s.slice(-3).map((r) => r.industry))]; });
    const part = M.status === 'ok' ? (M.data.find((r) => r.partial) || {}).month : null;
    const by = Hd.status === 'ok' ? d3.group(Hd.data.filter((r) => r.month !== part), (r) => r.industry) : new Map();
    const smax = Hd.status === 'ok' ? d3.max(Hd.data.filter((r) => r.month !== part), (r) => r.revenue_won) : 1;
    const max = d3.max(S.data, (r) => r.revenue_won);
    const rows = S.data.filter((r) => !q || r.industry.toLowerCase().includes(q)).sort((a, b) => { const va = a[st.k]; const vb = b[st.k]; if (st.k === 'industry') return st.asc ? va.localeCompare(vb) : vb.localeCompare(va); return st.asc ? d3.ascending(va, vb) : d3.descending(va, vb); });
    const capped = !q && !showAll && rows.length > SHOW;
    let shown = capped ? rows.slice(0, SHOW) : rows;
    if (capped && f && !shown.some((r) => r.industry === f)) { const fr = rows.find((r) => r.industry === f); if (fr) shown = shown.concat(fr); }
    const top3 = S.data.slice().sort((a, b) => b.revenue_won - a.revenue_won).slice(0, 3).map((r) => r.industry); el('ledger-h').textContent = top3[0] + ', ' + top3[1] + ' and ' + top3[2] + ' lead on revenue';
    el('count').textContent = q ? rows.length + ' of ' + S.data.length + ' industries match' : (capped ? 'Top ' + SHOW + ' of ' + rows.length + ' industries, by the column you sort on' : 'All ' + rows.length + ' industries');
    const anyIn = (j) => shown.some((r) => r.deals_won >= MIN_WON && RATES.some((k) => rank[k] && rank[k][j].has(r.industry)));
    el('tk-hi').hidden = !anyIn(0); el('tk-lo').hidden = !anyIn(1);
    more.hidden = !!q || rows.length <= SHOW; more.textContent = showAll ? 'Show the top ' + SHOW + ' only' : 'Show all ' + rows.length + ' industries';
    const td = (t, c) => { const d = document.createElement('td'); if (c) d.className = c; d.textContent = t; return d; };
    const rt = (r, k, t, x) => { const c = x ? ['x'] : []; if (r.deals_won >= MIN_WON && rank[k]) { if (rank[k][0].has(r.industry)) c.push('hi'); else if (rank[k][1].has(r.industry)) c.push('lo'); } const d = td(t, c.join(' ')); if (rank[k]) d.dataset.k = k; return d; };
    tbody.replaceChildren(...shown.map((r) => {
      const tr = document.createElement('tr'); tr.dataset.key = r.industry; if (r.industry === f) tr.className = 'on';
      const rv = document.createElement('td'); const w = document.createElement('span'); w.className = 'rv'; const s = document.createElement('s'); const u = document.createElement('u'); u.style.width = (r.revenue_won / max * 100).toFixed(1) + '%'; s.appendChild(u); w.append(document.createTextNode(money(r.revenue_won)), s); rv.appendChild(w);
      const sp = document.createElement('td'); sp.className = 'x'; const ser = (by.get(r.industry) || []).slice().sort((a, b) => a.month.localeCompare(b.month));
      if (ser.length) { const sv = d3.select(sp).append('svg').attr('width', 84).attr('height', 22).attr('viewBox', '0 0 84 22').attr('aria-hidden', 'true'); const step = 84 / ser.length; const ys = d3.scaleLinear([0, smax], [0, 18]); const on = r.industry === f; sv.append('g').selectAll('rect').data(ser).join('rect').attr('x', (d, i) => i * step + 1).attr('width', Math.max(2, step - 3)).attr('y', (d) => 20 - Math.max(0.75, ys(d.revenue_won))).attr('height', (d) => Math.max(0.75, ys(d.revenue_won))).attr('fill', (d) => on ? FOC : (+d.month.slice(5, 7) >= 7 ? BLUE : GREY)); sv.append('line').attr('x1', 0).attr('x2', 84).attr('y1', 20.5).attr('y2', 20.5).attr('stroke', 'var(--rule)').attr('stroke-width', 1); }
      tr.append(td(r.industry), rv, td(pct(r.revenue_share), 'x'), rt(r, 'win_rate', pct(r.win_rate)), rt(r, 'avg_deal', moneyK(r.avg_deal), true), rt(r, 'proposal_rate', pct(r.proposal_rate), true), rt(r, 'meetings_per_opp', dec2(r.meetings_per_opp), true), rt(r, 'stage_days', dec1(r.stage_days), true), td(num(r.accounts), 'x'), sp);
      return tr;
    }));
  }

  // ---------- orchestration
  function drawAll() {
    drawDateline(); drawBrief(); drawHero(); drawCreated(); drawWeek();
    drawFocusBar();
    drawLine(); timeNotes(); drawDrivers(); drawSuspects();
    drawDumbbell(); indNotes(); drawMultiples(); drawBee(); dealNotes();
    drawSeller(); accNotes(); drawSegments(); segNotes();
    drawSteps(); drawWaffle(); funNotes();
    drawTable();
  }
  let lastW = 0; let rz = null;
  new ResizeObserver(() => { const w = root.clientWidth; if (Math.abs(w - lastW) < 24) return; lastW = w; clearTimeout(rz); rz = setTimeout(drawAll, 180); }).observe(root);
  dash.onData(drawAll);
  const retone = () => { if (setTone()) drawAll(); };
  new MutationObserver(retone).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-theme', 'class', 'style'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', retone);
  document.querySelectorAll('.pa-nav a').forEach((a) => a.addEventListener('click', (e) => { const t = document.getElementById(a.getAttribute('href').slice(1)); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); dash.setLink(t.id); } }));
  const named = location.hash && document.getElementById(location.hash.slice(1)); if (named) setTimeout(() => named.scrollIntoView(), 300);
})();
