// Local stand-in for the Claude Dashboard runtime's `dash` API, so the page runs outside claude.ai.
// It reads the CJA report snapshots in /data, runs each dataset's loader, then the calcs, then the page's onData callbacks.
// The live dashboard has the same API (data, onData, calc, loader, params, setParams, colors, setLink), but runs real CJA queries.
(async function () {
  const q = new URLSearchParams(location.search);
  if (q.get('mode')) document.documentElement.dataset.mode = q.get('mode');
  const DATASETS = ['by_industry','funnel_by_industry','engagement_by_industry','velocity_by_industry','monthly_trend','monthly_prior','industry_month','by_size','by_propensity','by_churn','monthly_funnel','weekly','month_mix','seller_cross','industry_month_prior'];
  const loaders = {}; const calcs = {}; const results = {}; const subs = [];
  let params = { industry: q.get('focus') || null };
  window.__errors = [];
  window.addEventListener('error', (e) => window.__errors.push(String(e.message)));
  const fire = () => subs.forEach((fn) => { try { fn(); } catch (e) { window.__errors.push('onData ' + e.stack); console.error(e); } });
  window.dash = {
    loader: (id, o) => { loaders[id] = o; },
    calc: (id, o) => { calcs[id] = o; },
    data: (id) => (results[id] ? { status: 'ok', data: results[id], columns: [], meta: [] } : { status: 'loading', data: [] }),
    onData: (fn) => { subs.push(fn); try { fn(); } catch (e) { window.__errors.push('onData ' + e.stack); console.error(e); } },
    colors: ['var(--verdigris)', 'var(--lapis)', 'var(--ochre)', 'var(--madder)', 'var(--violet)', 'var(--moss)', 'var(--stone)', 'var(--ink-3)'],
    params: () => ({ ...params }),
    setParams: (p) => { params = { ...params, ...p }; fire(); },
    resetParams: () => { params = { industry: null }; fire(); },
    setLink: (id) => { history.replaceState(null, '', '#' + id); },
    refresh: () => {},
  };
  // mount the page fragment
  const src = await (await fetch('atlas.html')).text();
  const root = document.getElementById('dash-root');
  root.innerHTML = src.replace(/<script[\s\S]*?<\/script>/g, '');
  const scripts = [...src.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  for (const s of scripts) { const code = await (await fetch(s)).text(); try { new Function(code)(); } catch (e) { window.__errors.push(s + ': ' + e.stack); console.error(e); } }
  // load snapshots through each dataset's loader
  for (const id of DATASETS) {
    const answer = await (await fetch('data/' + id + '.json')).json();
    const out = loaders[id].fn({ answer, args: {}, read: {} });
    results[id] = Array.isArray(out) ? out : out.rows || out.data;
  }
  // run calcs in dependency order
  let left = Object.keys(calcs); let guard = 0;
  while (left.length && guard++ < 50) {
    for (const id of left.slice()) {
      const c = calcs[id];
      if (c.inputs.every((i) => results[i])) {
        try { results[id] = c.fn(...c.inputs.map((i) => results[i])); } catch (e) { window.__errors.push('calc ' + id + ': ' + e.stack); results[id] = []; }
        left = left.filter((x) => x !== id);
      }
    }
  }
  fire(); window.__ready = true;
})();
