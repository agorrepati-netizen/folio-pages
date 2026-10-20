// Industry Pipeline Atlas: how each CJA report becomes rows, and the calculations built on them.

dash.loader('by_industry', {
  description: 'CJA ranked report as one row per industry, metrics named in request order. The misspelled duplicate "Media & Enteratainment" is added into "Media & Entertainment".',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const m = ['accounts', 'people', 'sessions', 'opportunities', 'revenue_won', 'deals_won', 'deals_lost', 'revenue_lost', 'opps_created'];
    const rows = a.rows.map((r) => { const o = { industry: (r.values || [r.value])[0] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o; });
    const fixName = (n) => (n === 'Media & Enteratainment' ? 'Media & Entertainment' : n);
    const merged = new Map(); rows.forEach((o) => { o.industry = fixName(o.industry); const p = merged.get(o.industry); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(o.industry, o); });
    return { columns: ['industry', ...m], rows: [...merged.values()] };
  },
});
dash.loader('funnel_by_industry', {
  description: 'CJA ranked report as one row per industry, one column per funnel stage event',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const m = ['leads', 'mql', 'sql', 'opps_created', 'needs_assessment', 'solution_presented', 'proposal', 'negotiation', 'closed_won'];
    const rows = a.rows.map((r) => { const o = { industry: (r.values || [r.value])[0] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o; });
    const fixName = (n) => (n === 'Media & Enteratainment' ? 'Media & Entertainment' : n);
    const merged = new Map(); rows.forEach((o) => { o.industry = fixName(o.industry); const p = merged.get(o.industry); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(o.industry, o); });
    return { columns: ['industry', ...m], rows: [...merged.values()] };
  },
});
dash.loader('engagement_by_industry', {
  description: 'CJA ranked report as one row per industry, one column per sales touch event',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const m = ['meetings', 'calls', 'emails_sent', 'emails_opened', 'emails_clicked'];
    const rows = a.rows.map((r) => { const o = { industry: (r.values || [r.value])[0] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o; });
    const fixName = (n) => (n === 'Media & Enteratainment' ? 'Media & Entertainment' : n);
    const merged = new Map(); rows.forEach((o) => { o.industry = fixName(o.industry); const p = merged.get(o.industry); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(o.industry, o); });
    return { columns: ['industry', ...m], rows: [...merged.values()] };
  },
});
dash.loader('velocity_by_industry', {
  description: 'CJA ranked report as one row per industry: total days logged in three opportunity stages',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const m = ['days_opp_creation', 'days_needs_assessment', 'days_solution'];
    const rows = a.rows.map((r) => { const o = { industry: (r.values || [r.value])[0] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o; });
    const fixName = (n) => (n === 'Media & Enteratainment' ? 'Media & Entertainment' : n);
    const merged = new Map(); rows.forEach((o) => { o.industry = fixName(o.industry); const p = merged.get(o.industry); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(o.industry, o); });
    return { columns: ['industry', ...m], rows: [...merged.values()] };
  },
});
dash.loader('monthly_trend', {
  description: 'CJA monthly report as one row per month (month as YYYY-MM-01)',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'opportunities', 'deals_won', 'deals_lost', 'accounts'];
    const rows = a.rows.map((r) => {
      const [mm, yy] = String((r.values || [r.value])[0]).split(' ');
      const o = { month: yy + '-' + mon[mm] + '-01' }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o;
    });
    return { columns: ['month', ...m], rows };
  },
});
dash.loader('monthly_prior', {
  description: 'CJA monthly report for 2025 as one row per month (month as YYYY-MM-01)',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'deals_won', 'deals_lost'];
    const rows = a.rows.map((r) => {
      const [mm, yy] = String((r.values || [r.value])[0]).split(' ');
      const o = { month: yy + '-' + mon[mm] + '-01' }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o;
    });
    return { columns: ['month', ...m], rows };
  },
});
dash.loader('industry_month', {
  description: 'CJA industry × month report as one row per industry and month (month as YYYY-MM-01)',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'deals_won', 'deals_lost', 'opportunities'];
    const rows = a.rows.map((r) => {
      const v = r.values || []; const [mm, yy] = String(v[1]).split(' ');
      const o = { industry: v[0] === 'Media & Enteratainment' ? 'Media & Entertainment' : v[0], month: yy + '-' + mon[mm] + '-01' }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o;
    });
    const merged = new Map(); rows.forEach((o) => { const key = o.industry + '|' + o.month; const p = merged.get(key); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(key, o); });
    return { columns: ['industry', 'month', ...m], rows: [...merged.values()], cut: a.lastPage === false };
  },
});

dash.calc('scorecard', {
  title: 'Industry scorecard',
  description: 'Per-industry rates: revenue share, win rate, average won deal, revenue per account, lead-to-won, proposal rate, meetings per win and per opportunity, email click rate, days in stage and lost-to-won revenue.',
  inputs: ['by_industry', 'funnel_by_industry', 'engagement_by_industry', 'velocity_by_industry'],
  fn: (by_industry, funnel_by_industry, engagement_by_industry, velocity_by_industry) => {
    const total = by_industry.reduce((s, r) => s + r.revenue_won, 0);
    const f = new Map(funnel_by_industry.map((r) => [r.industry, r]));
    const e = new Map(engagement_by_industry.map((r) => [r.industry, r]));
    const v = new Map(velocity_by_industry.map((r) => [r.industry, r]));
    const div = (a, b) => (b ? a / b : null);
    return by_industry.map((r) => {
      const fr = f.get(r.industry) || {}; const er = e.get(r.industry) || {}; const vr = v.get(r.industry) || {};
      const cycle = [div(vr.days_opp_creation, fr.opps_created), div(vr.days_needs_assessment, fr.needs_assessment), div(vr.days_solution, fr.solution_presented)];
      return {
        industry: r.industry,
        revenue_won: r.revenue_won,
        revenue_share: div(r.revenue_won, total),
        win_rate: div(r.deals_won, r.deals_won + r.deals_lost),
        avg_deal: div(r.revenue_won, r.deals_won),
        revenue_per_account: div(r.revenue_won, r.accounts),
        lead_to_won: div(fr.closed_won, fr.leads),
        proposal_rate: div(fr.proposal, fr.solution_presented),
        meetings_per_win: div(er.meetings, r.deals_won),
        meetings_per_opp: div(er.meetings, r.opportunities),
        email_ctr: div(er.emails_clicked, er.emails_sent),
        stage_days: cycle.every((c) => c != null) ? cycle[0] + cycle[1] + cycle[2] : null,
        lost_to_won: div(r.revenue_lost, r.revenue_won),
        accounts: r.accounts,
        opportunities: r.opportunities,
        deals_won: r.deals_won,
      };
    });
  },
});

dash.calc('totals', {
  title: 'Headline totals',
  description: 'Sums across industries, with win rate, average won deal, lead-to-won, lost-to-won revenue and revenue concentration worked out from them.',
  inputs: ['by_industry', 'funnel_by_industry'],
  fn: (by_industry, funnel_by_industry) => {
    const s = (k) => by_industry.reduce((t, r) => t + r[k], 0);
    const won = s('deals_won'); const lost = s('deals_lost'); const rev = s('revenue_won'); const revLost = s('revenue_lost');
    const leads = funnel_by_industry.reduce((t, r) => t + r.leads, 0);
    const wonF = funnel_by_industry.reduce((t, r) => t + r.closed_won, 0);
    const ranked = by_industry.map((r) => r.revenue_won).sort((a, b) => b - a);
    const top = (n) => ranked.slice(0, n).reduce((t, x) => t + x, 0) / rev;
    return [{
      revenue_won: rev, revenue_lost: revLost, lost_to_won: rev ? revLost / rev : null,
      deals_won: won, deals_lost: lost, win_rate: won + lost ? won / (won + lost) : null,
      avg_deal: won ? rev / won : null, leads, lead_to_won: leads ? wonF / leads : null,
      accounts: s('accounts'), opportunities: s('opportunities'), industries: by_industry.length,
      top5_share: top(5), top10_share: top(10),
    }];
  },
});

dash.calc('monthly', {
  title: 'Monthly, this year and last',
  description: 'Each 2026 month with closed-won revenue, win rate (won ÷ won + lost) and opportunity activity, beside the same month of 2025. Months with no deals yet are left out; the latest month is marked partial.',
  inputs: ['monthly_trend', 'monthly_prior'],
  fn: (monthly_trend, monthly_prior) => {
    const prior = new Map(monthly_prior.map((r) => [r.month.slice(5, 7), r]));
    const live = monthly_trend.filter((r) => r.deals_won + r.deals_lost > 0);
    const lastMonth = live.length ? live[live.length - 1].month : null;
    return live.map((r) => {
      const p = prior.get(r.month.slice(5, 7)) || {};
      return {
        month: r.month, revenue_won: r.revenue_won, opportunities: r.opportunities, deals_won: r.deals_won, deals_lost: r.deals_lost,
        closed_share: r.opportunities ? (r.deals_won + r.deals_lost) / r.opportunities : null,
        win_rate: r.deals_won / (r.deals_won + r.deals_lost),
        prior_revenue_won: p.revenue_won ?? null,
        prior_win_rate: p.deals_won + p.deals_lost ? p.deals_won / (p.deals_won + p.deals_lost) : null,
        partial: r.month === lastMonth,
      };
    });
  },
});

dash.calc('yoy', {
  title: 'Year over year',
  description: 'Closed-won revenue and win rate for 2026’s complete months against the same months of 2025, by quarter and in total; months where 2026’s win rate trailed 2025’s; all of 2025 and its fourth quarter. The latest, partial month is left out of the comparison.',
  inputs: ['monthly_trend', 'monthly_prior'],
  fn: (monthly_trend, monthly_prior) => {
    const live = monthly_trend.filter((r) => r.deals_won + r.deals_lost > 0);
    const full = live.slice(0, -1);
    const keys = new Set(full.map((r) => r.month.slice(5, 7)));
    const prior = monthly_prior.filter((r) => keys.has(r.month.slice(5, 7)));
    const sum = (rows, k) => rows.reduce((t, r) => t + r[k], 0);
    const rev = sum(full, 'revenue_won'); const prev = sum(prior, 'revenue_won');
    const wr = (rows) => { const w = sum(rows, 'deals_won'); const l = sum(rows, 'deals_lost'); return w + l ? w / (w + l) : null; };
    const quarters = (now, then) => {
      const out = {};
      [1, 2, 3, 4].forEach((q) => {
        const ms = [0, 1, 2].map((i) => String((q - 1) * 3 + i + 1).padStart(2, '0'));
        const a = now.filter((r) => ms.includes(r.month.slice(5, 7))); const b = then.filter((r) => ms.includes(r.month.slice(5, 7)));
        const complete = a.length === 3 && b.length === 3;
        out['q' + q + '_revenue_won'] = complete ? sum(a, 'revenue_won') : null;
        out['q' + q + '_prior_revenue_won'] = complete ? sum(b, 'revenue_won') : null;
        out['q' + q + '_multiple'] = complete && sum(b, 'revenue_won') ? sum(a, 'revenue_won') / sum(b, 'revenue_won') : null;
      });
      return out;
    };
    return [{
      months_compared: full.length,
      last_full_month: full.length ? full[full.length - 1].month : null,
      revenue_won: rev, prior_revenue_won: prev, multiple: prev ? rev / prev : null,
      win_rate: wr(full), prior_win_rate: wr(prior),
      ytd_revenue_won: sum(live, 'revenue_won'), prior_year_revenue_won: sum(monthly_prior, 'revenue_won'),
      prior_q4_share: sum(monthly_prior, 'revenue_won') ? sum(monthly_prior.filter((r) => ['10', '11', '12'].includes(r.month.slice(5, 7))), 'revenue_won') / sum(monthly_prior, 'revenue_won') : null,
      prior_q4_revenue_won: sum(monthly_prior.filter((r) => ['10', '11', '12'].includes(r.month.slice(5, 7))), 'revenue_won'),
      prior_q4_wins_per_month: sum(monthly_prior.filter((r) => ['10', '11', '12'].includes(r.month.slice(5, 7))), 'deals_won') / 3,
      months_behind: full.filter((r) => { const p = prior.find((q) => q.month.slice(5, 7) === r.month.slice(5, 7)); const a = r.deals_won / (r.deals_won + r.deals_lost); const b = p && p.deals_won + p.deals_lost ? p.deals_won / (p.deals_won + p.deals_lost) : null; return b != null && a < b; }).length,
      ...quarters(full, prior),
      ...(() => {
        const h1 = full.filter((r) => r.month.slice(5, 7) <= '06'); const h1p = prior.filter((r) => r.month.slice(5, 7) <= '06');
        const q3 = full.filter((r) => ['07', '08', '09'].includes(r.month.slice(5, 7))); const q3p = prior.filter((r) => ['07', '08', '09'].includes(r.month.slice(5, 7)));
        const gain = rev - prev; const q3gain = sum(q3, 'revenue_won') - sum(q3p, 'revenue_won');
        return { h1_multiple: h1.length === 6 && sum(h1p, 'revenue_won') ? sum(h1, 'revenue_won') / sum(h1p, 'revenue_won') : null, q3_gain_share: q3.length === 3 && gain ? q3gain / gain : null };
      })(),
    }];
  },
});

dash.calc('funnel_all', {
  title: 'Funnel and stage time',
  description: 'Funnel stage counts per industry plus an “All industries” row that sums them, with average days per stage entry (days logged ÷ stage events) for three opportunity stages.',
  inputs: ['funnel_by_industry', 'velocity_by_industry'],
  fn: (funnel_by_industry, velocity_by_industry) => {
    const keys = ['leads', 'mql', 'sql', 'opps_created', 'needs_assessment', 'solution_presented', 'proposal', 'negotiation', 'closed_won'];
    const dkeys = ['days_opp_creation', 'days_needs_assessment', 'days_solution'];
    const v = new Map(velocity_by_industry.map((r) => [r.industry, r]));
    const all = { industry: 'All industries' };
    keys.forEach((k) => { all[k] = funnel_by_industry.reduce((t, r) => t + r[k], 0); });
    dkeys.forEach((k) => { all[k] = velocity_by_industry.reduce((t, r) => t + r[k], 0); });
    const withDays = (r) => {
      const d = r.industry === 'All industries' ? r : (v.get(r.industry) || {});
      return {
        ...r,
        avg_days_opp_creation: r.opps_created ? d.days_opp_creation / r.opps_created : null,
        avg_days_needs_assessment: r.needs_assessment ? d.days_needs_assessment / r.needs_assessment : null,
        avg_days_solution: r.solution_presented ? d.days_solution / r.solution_presented : null,
      };
    };
    return [withDays(all), ...funnel_by_industry.map(withDays)].map((r) => { const o = { ...r }; dkeys.forEach((k) => delete o[k]); return o; });
  },
});

dash.calc('heat', {
  title: 'Industry by month',
  description: 'Closed-won revenue and win rate for each industry in each month. Months with no deals in any industry yet are left out.',
  inputs: ['industry_month'],
  fn: (industry_month) => {
    const active = new Set(industry_month.filter((r) => r.deals_won + r.deals_lost > 0).map((r) => r.month));
    return industry_month.filter((r) => active.has(r.month)).map((r) => ({
      industry: r.industry, month: r.month, revenue_won: r.revenue_won,
      win_rate: r.deals_won + r.deals_lost ? r.deals_won / (r.deals_won + r.deals_lost) : null,
    }));
  },
});

dash.calc('effort', {
  title: 'Meetings and win rate',
  description: 'Least-squares fit of win rate on meetings per opportunity across industries with at least 100 wins: slope (win-rate change per extra meeting per opportunity) and correlation. A correlation, not evidence that meetings cause wins.',
  inputs: ['scorecard'],
  fn: (scorecard) => {
    const pts = scorecard.filter((r) => r.deals_won >= 100 && r.meetings_per_opp != null && r.win_rate != null);
    const n = pts.length; if (n < 3) return [{ slope: null, intercept: null, correlation: null, industries: n }];
    const mx = pts.reduce((t, r) => t + r.meetings_per_opp, 0) / n; const my = pts.reduce((t, r) => t + r.win_rate, 0) / n;
    let sxy = 0; let sxx = 0; let syy = 0;
    pts.forEach((r) => { const dx = r.meetings_per_opp - mx; const dy = r.win_rate - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; });
    const slope = sxy / sxx;
    return [{ slope, intercept: my - slope * mx, correlation: sxy / Math.sqrt(sxx * syy), industries: n }];
  },
});

dash.calc('steps', {
  title: 'Funnel steps, all industries',
  description: 'Each funnel stage summed across industries, as a share of leads and as the change from the stage before.',
  inputs: ['funnel_by_industry'],
  fn: (funnel_by_industry) => {
    const stages = [['leads', 'Lead generated'], ['mql', 'MQL qualified'], ['sql', 'SQL qualified'], ['opps_created', 'Opportunity created'], ['needs_assessment', 'Needs assessment'], ['solution_presented', 'Solution presented'], ['proposal', 'Proposal submitted'], ['negotiation', 'Negotiation started'], ['closed_won', 'Closed-won']];
    const tot = stages.map(([k]) => funnel_by_industry.reduce((t, r) => t + r[k], 0));
    return stages.map(([k, label], i) => ({ step: k, label, count: tot[i], share: tot[0] ? tot[i] / tot[0] : null, change: i && tot[i - 1] ? tot[i] / tot[i - 1] - 1 : null, drop: i && tot[i - 1] ? 1 - tot[i] / tot[i - 1] : null }));
  },
});

dash.calc('pipeline_facts', {
  title: 'Pipeline turning points',
  description: 'The month opportunity activity peaked and the last complete month: activity, the share of active opportunities that closed (won + lost ÷ active), win rate, and the softest revenue months.',
  inputs: ['monthly'],
  fn: (monthly) => {
    const full = monthly.filter((r) => !r.partial);
    if (!full.length) return [{}];
    const peak = full.reduce((a, b) => (b.opportunities > a.opportunities ? b : a));
    const last = full[full.length - 1];
    const lows = full.slice().sort((a, b) => a.revenue_won - b.revenue_won);
    return [{
      peak_month: peak.month, peak_opportunities: peak.opportunities, peak_win_rate: peak.win_rate,
      last_month: last.month, last_opportunities: last.opportunities, last_win_rate: last.win_rate,
      peak_closed_share: peak.closed_share, last_closed_share: last.closed_share, last_deals_won: last.deals_won,
      low_win_rate: lows[0].win_rate, low2_win_rate: lows[1] ? lows[1].win_rate : null,
      opportunity_change: peak.opportunities ? last.opportunities / peak.opportunities - 1 : null,
      opportunity_fall: peak.opportunities ? 1 - last.opportunities / peak.opportunities : null,
      low_month: lows[0].month, low_revenue: lows[0].revenue_won, low2_month: lows[1] ? lows[1].month : null, low2_revenue: lows[1] ? lows[1].revenue_won : null,
      high_month: lows[lows.length - 1].month, high_revenue: lows[lows.length - 1].revenue_won,
    }];
  },
});

dash.calc('grid_facts', {
  title: 'Best months by industry',
  description: 'For industries with at least $100M closed-won this year: the month most often holding each industry’s highest win rate and highest revenue, and how many industries share it.',
  inputs: ['heat'],
  fn: (heat) => {
    const by = new Map();
    heat.forEach((r) => { if (!by.has(r.industry)) by.set(r.industry, []); by.get(r.industry).push(r); });
    const months = heat.map((r) => r.month).sort();
    const lastMonth = months[months.length - 1];
    const tally = (key) => {
      const c = new Map(); let n = 0;
      by.forEach((rows) => {
        if (rows.reduce((t, r) => t + r.revenue_won, 0) < 1e8) return;
        n += 1;
        const full = rows.filter((r) => r.month !== lastMonth && r[key] != null);
        const best = full.reduce((a, b) => (b[key] > a[key] ? b : a), full[0]);
        if (best) c.set(best.month, (c.get(best.month) || 0) + 1);
      });
      let top = null; c.forEach((v, k) => { if (!top || v > top[1]) top = [k, v]; });
      return { month: top ? top[0] : null, count: top ? top[1] : 0, of: n };
    };
    const w = tally('win_rate'); const r = tally('revenue_won');
    return [{ best_win_month: w.month, best_win_count: w.count, best_rev_month: r.month, best_rev_count: r.count, industries: w.of }];
  },
});

dash.calc('leak', {
  title: 'Where deals are lost',
  description: 'Across all industries: proposals, wins and losses, the most losses that could follow a proposal (proposals − wins), so the fewest that come before one, and wins as a share of proposals. Event counts, assuming one proposal per opportunity.',
  inputs: ['funnel_by_industry', 'by_industry'],
  fn: (funnel_by_industry, by_industry) => {
    const proposals = funnel_by_industry.reduce((t, r) => t + r.proposal, 0);
    const wins = by_industry.reduce((t, r) => t + r.deals_won, 0);
    const losses = by_industry.reduce((t, r) => t + r.deals_lost, 0);
    const before = Math.max(0, losses - Math.max(0, proposals - wins));
    return [{ proposals, wins, losses, lost_before_proposal: before, lost_before_share: losses ? before / losses : null, win_per_proposal: proposals ? wins / proposals : null }];
  },
});

// ---------- account segments (company attributes on the account)
['by_size', 'by_propensity', 'by_churn'].forEach((id) => {
  dash.loader(id, {
    description: 'CJA ranked report as one row per segment value: revenue won, won and lost deals, accounts, opportunities',
    fn: ({ answer }) => {
      let a = answer;
      if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
      if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
      if (a && a.errorType) throw new Error(a.message || a.errorType);
      if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
      const m = ['revenue_won', 'deals_won', 'deals_lost', 'accounts', 'opportunities'];
      const rows = a.rows.map((r) => { const o = { segment: (r.values || [r.value])[0] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o; });
      return { columns: ['segment', ...m], rows };
    },
  });
});

dash.calc('segments', {
  title: 'Win rate by account segment',
  description: 'For each account attribute (propensity to buy, propensity to churn, company size): each value’s win rate (won ÷ won + lost), share of closed-won revenue and share of accounts.',
  inputs: ['by_propensity', 'by_churn', 'by_size'],
  fn: (by_propensity, by_churn, by_size) => {
    const groups = [['Propensity to buy', by_propensity, ['High', 'Medium', 'Low']], ['Propensity to churn', by_churn, ['Low', 'Medium', 'High']], ['Company size', by_size, ['Enterprise', 'Mid-Market', 'Small Business']]];
    const out = [];
    groups.forEach(([group, rows, order]) => {
      const rev = rows.reduce((t, r) => t + r.revenue_won, 0); const acc = rows.reduce((t, r) => t + r.accounts, 0);
      rows.slice().sort((a, b) => order.indexOf(a.segment) - order.indexOf(b.segment)).forEach((r) => out.push({
        key: group + ' · ' + r.segment, group, segment: r.segment,
        win_rate: r.deals_won + r.deals_lost ? r.deals_won / (r.deals_won + r.deals_lost) : null,
        revenue_won: r.revenue_won, revenue_share: rev ? r.revenue_won / rev : null,
        accounts: r.accounts, account_share: acc ? r.accounts / acc : null,
        opps_per_account: r.accounts ? r.opportunities / r.accounts : null, revenue_per_account: r.accounts ? r.revenue_won / r.accounts : null,
        avg_deal: r.deals_won ? r.revenue_won / r.deals_won : null,
      }));
    });
    return out;
  },
});

dash.calc('halves', {
  title: 'First half against third quarter',
  description: 'Each industry’s win rate in January–June and in July–September (won ÷ won + lost), and the change in points. Uses complete months only.',
  inputs: ['industry_month'],
  fn: (industry_month) => {
    const by = new Map();
    industry_month.forEach((r) => { if (!by.has(r.industry)) by.set(r.industry, []); by.get(r.industry).push(r); });
    const wr = (rows) => { const w = rows.reduce((t, r) => t + r.deals_won, 0); const l = rows.reduce((t, r) => t + r.deals_lost, 0); return w + l ? w / (w + l) : null; };
    const out = [];
    by.forEach((rows, industry) => {
      const h1 = rows.filter((r) => r.month >= '2026-01' && r.month < '2026-07');
      const q3 = rows.filter((r) => r.month >= '2026-07' && r.month < '2026-10');
      const won = rows.reduce((t, r) => t + r.deals_won, 0);
      if (!h1.length || q3.length < 3) return;
      const a = wr(h1); const b = wr(q3);
      const rev9 = rows.filter((r) => r.month >= '2026-01' && r.month < '2026-10').reduce((t, r) => t + r.revenue_won, 0);
      out.push({ industry, h1_win_rate: a, q3_win_rate: b, change: a != null && b != null ? b - a : null, deals_won: won, q3_revenue_share: rev9 ? q3.reduce((t, r) => t + r.revenue_won, 0) / rev9 : null });
    });
    return out;
  },
});

dash.calc('prior_rates', {
  title: '2025 win rate by month',
  description: 'Each month of 2025: closed-won revenue and win rate (won ÷ won + lost).',
  inputs: ['monthly_prior'],
  fn: (monthly_prior) => monthly_prior.map((r) => ({ month: r.month, revenue_won: r.revenue_won, win_rate: r.deals_won + r.deals_lost ? r.deals_won / (r.deals_won + r.deals_lost) : null })),
});

// ---------- added for the fourth-quarter outlook, drivers, seller allocation and the weekly strip
dash.loader('monthly_funnel', {
  description: 'CJA monthly report for 2025 and 2026, one row per month (month as YYYY-MM-01): revenue, won and lost deals, active opportunities, every funnel stage event, meetings, days logged in three stages and people with any activity',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'deals_won', 'deals_lost', 'opportunities', 'leads', 'mql', 'sql', 'opps_created', 'needs_assessment', 'solution_presented', 'proposal', 'negotiation', 'meetings', 'days_opp_creation', 'days_needs_assessment', 'days_solution', 'people'];
    const rows = a.rows.map((r) => {
      const [mm, yy] = String((r.values || [r.value])[0]).split(' ');
      const o = { month: yy + '-' + mon[mm] + '-01' }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o;
    }).filter((r) => r.month >= '2025-01-01');
    return { columns: ['month', ...m], rows };
  },
});
dash.loader('weekly', {
  description: 'CJA weekly report (weeks start on Sunday, week as YYYY-MM-DD): revenue, won and lost deals, opportunities created and active opportunities, from the last week of 2024',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'deals_won', 'deals_lost', 'opps_created', 'opportunities'];
    const rows = a.rows.map((r) => {
      const t = String((r.values || [r.value])[0]).replace(',', '').split(' ');
      const o = { week: t[2] + '-' + mon[t[0]] + '-' + String(t[1]).padStart(2, '0') }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o;
    }).filter((r) => r.week >= '2024-12-29');
    return { columns: ['week', ...m], rows };
  },
});
dash.loader('month_mix', {
  description: 'CJA month × company size × propensity to buy report: revenue, won and lost deals for each combination (month as YYYY-MM-01)',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'deals_won', 'deals_lost'];
    const rows = a.rows.map((r) => {
      const v = r.values || []; const [mm, yy] = String(v[0]).split(' ');
      const o = { month: yy + '-' + mon[mm] + '-01', size: v[1], propensity: v[2] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); }); return o;
    });
    return { columns: ['month', 'size', 'propensity', ...m], rows };
  },
});
dash.loader('seller_cross', {
  description: 'CJA industry × company size × propensity to buy report, 2026: revenue, won and lost deals, accounts and opportunities for each combination. The misspelled duplicate industry is added into "Media & Entertainment".',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const m = ['revenue_won', 'deals_won', 'deals_lost', 'accounts', 'opportunities'];
    const merged = new Map();
    a.rows.forEach((r) => {
      const v = r.values || []; const ind = v[0] === 'Media & Enteratainment' ? 'Media & Entertainment' : v[0];
      const key = ind + '|' + v[1] + '|' + v[2]; const o = { industry: ind, size: v[1], propensity: v[2] }; m.forEach((k, i) => { o[k] = Number(r.data[i]); });
      const p = merged.get(key); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(key, o);
    });
    return { columns: ['industry', 'size', 'propensity', ...m], rows: [...merged.values()] };
  },
});
dash.loader('industry_month_prior', {
  description: 'CJA industry × month report for 2025: revenue, won and lost deals and opportunities created (month as YYYY-MM-01). The misspelled duplicate industry is added into "Media & Entertainment".',
  fn: ({ answer }) => {
    let a = answer;
    if (a && Array.isArray(a.content)) a = a.content.map((c) => c.text || '').join('');
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { throw new Error(String(a).slice(0, 300)); } }
    if (a && a.errorType) throw new Error(a.message || a.errorType);
    if (!a || !Array.isArray(a.rows)) throw new Error('The report answer has no rows. Keys: ' + Object.keys(a || {}).join(', '));
    const mon = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const m = ['revenue_won', 'deals_won', 'deals_lost', 'opps_created'];
    const merged = new Map();
    a.rows.forEach((r) => {
      const v = r.values || []; const [mm, yy] = String(v[1]).split(' '); const ind = v[0] === 'Media & Enteratainment' ? 'Media & Entertainment' : v[0];
      const o = { industry: ind, month: yy + '-' + mon[mm] + '-01' }; m.forEach((k, i) => { o[k] = Number(r.data[i]); });
      const key = ind + '|' + o.month; const p = merged.get(key); if (p) m.forEach((k) => { p[k] += o[k]; }); else merged.set(key, o);
    });
    return { columns: ['industry', 'month', ...m], rows: [...merged.values()], cut: a.lastPage === false };
  },
});

dash.calc('outlook', {
  title: 'Fourth-quarter outlook',
  description: 'What 2025 closed in its fourth quarter, what 2026 has closed in the fourth quarter so far, the revenue still needed to match last year’s fourth quarter and the monthly pace that implies, the best month of 2026 for scale, opportunities created per quarter in both years, and months of cover (active opportunities ÷ deals closed) in the last complete month of each year. Remaining months count from today’s date.',
  inputs: ['monthly_funnel'],
  fn: (monthly_funnel) => {
    const y25 = monthly_funnel.filter((r) => r.month < '2026-01'); const y26 = monthly_funnel.filter((r) => r.month >= '2026-01' && r.deals_won + r.deals_lost > 0);
    const sum = (rows, k) => rows.reduce((t, r) => t + r[k], 0);
    const inQ = (rows, q) => rows.filter((r) => Math.floor((+r.month.slice(5, 7) - 1) / 3) + 1 === q);
    const last = y26[y26.length - 1]; const full26 = y26.slice(0, -1); const lastFull = full26[full26.length - 1];
    const same25 = lastFull ? y25.find((r) => r.month.slice(5, 7) === lastFull.month.slice(5, 7)) : null;
    const q = last ? Math.floor((+last.month.slice(5, 7) - 1) / 3) + 1 : 4;
    const prior_q = sum(inQ(y25, q), 'revenue_won'); const now_q = sum(inQ(y26, q), 'revenue_won');
    const now = new Date(); const qEnd = new Date(Date.UTC(2026, q * 3, 1)); const daysLeft = Math.max(0, (qEnd - now) / 864e5);
    const monthsLeft = daysLeft / 30.44; const need = Math.max(0, prior_q - now_q);
    const best = full26.reduce((a, b) => (b.revenue_won > a.revenue_won ? b : a), full26[0] || {});
    const cover = (r) => (r && r.deals_won + r.deals_lost ? r.opportunities / (r.deals_won + r.deals_lost) : null);
    const q3_created_26 = sum(inQ(y26, 3), 'opps_created'); const q3_created_25 = sum(inQ(y25, 3), 'opps_created');
    return [{
      quarter: q, prior_q_revenue: prior_q, q_to_date: now_q, needed: need, months_left: monthsLeft, needed_per_month: monthsLeft > 0.05 ? need / monthsLeft : null,
      best_month: best.month || null, best_month_revenue: best.revenue_won || null,
      prior_year_revenue: sum(y25, 'revenue_won'), ytd_revenue: sum(y26, 'revenue_won'),
      prior_q_share: sum(y25, 'revenue_won') ? prior_q / sum(y25, 'revenue_won') : null,
      prior_jan_sep: sum(y25.filter((r) => r.month.slice(5, 7) <= '09'), 'revenue_won'),
      q3_created: q3_created_26, prior_q3_created: q3_created_25, q3_created_ratio: q3_created_25 ? q3_created_26 / q3_created_25 : null,
      last_full_month: lastFull ? lastFull.month : null, last_created: lastFull ? lastFull.opps_created : null, prior_same_created: same25 ? same25.opps_created : null,
      cover_months: cover(lastFull), prior_cover_months: cover(same25), prior_q4_first: inQ(y25, 4)[0] ? inQ(y25, 4)[0].revenue_won : null,
    }];
  },
});

dash.calc('created', {
  title: 'Opportunities created by month',
  description: 'Opportunity-created events each month of 2026 beside the same month of 2025, with closed-won revenue for both years. Months of 2026 with no activity are left out; the latest month is marked partial.',
  inputs: ['monthly_funnel'],
  fn: (monthly_funnel) => {
    const p = new Map(monthly_funnel.filter((r) => r.month < '2026-01').map((r) => [r.month.slice(5, 7), r]));
    const live = monthly_funnel.filter((r) => r.month >= '2026-01' && r.deals_won + r.deals_lost > 0);
    const out = [];
    for (let i = 1; i <= 12; i++) {
      const mm = String(i).padStart(2, '0'); const r = live.find((x) => x.month.slice(5, 7) === mm); const b = p.get(mm) || {};
      out.push({ month: '2026-' + mm + '-01', created: r ? r.opps_created : null, prior_created: b.opps_created ?? null, revenue_won: r ? r.revenue_won : null, prior_revenue_won: b.revenue_won ?? null, partial: !!r && r === live[live.length - 1] });
    }
    return out;
  },
});

dash.calc('cumulative', {
  title: 'Cumulative closed-won revenue',
  description: 'Running total of closed-won revenue through each month of 2026 and of 2025, and the first month in which 2026’s running total passed all of 2025.',
  inputs: ['monthly_funnel'],
  fn: (monthly_funnel) => {
    const y25 = monthly_funnel.filter((r) => r.month < '2026-01'); const y26 = monthly_funnel.filter((r) => r.month >= '2026-01' && r.deals_won + r.deals_lost > 0);
    const total25 = y25.reduce((t, r) => t + r.revenue_won, 0);
    let a = 0; let b = 0; let crossed = null; const out = [];
    for (let i = 1; i <= 12; i++) {
      const mm = String(i).padStart(2, '0'); const r = y26.find((x) => x.month.slice(5, 7) === mm); const p = y25.find((x) => x.month.slice(5, 7) === mm);
      if (p) b += p.revenue_won;
      if (r) { a += r.revenue_won; if (!crossed && a >= total25) crossed = r.month; }
      out.push({ month: '2026-' + mm + '-01', cum: r ? a : null, prior_cum: p ? b : null, partial: !!r && r === y26[y26.length - 1], crossed_month: null, prior_total: total25 });
    }
    out.forEach((r) => { r.crossed_month = crossed; });
    return out;
  },
});

dash.calc('weekly_facts', {
  title: 'Last complete week',
  description: 'The latest complete week (Sunday to Saturday, ending before today) against the week before and the same week a year earlier: closed-won revenue, win rate and opportunities created, plus the average of the four weeks before it.',
  inputs: ['weekly'],
  fn: (weekly) => {
    const today = new Date().toISOString().slice(0, 10);
    const done = weekly.filter((r) => { const end = new Date(r.week + 'T00:00:00Z'); end.setUTCDate(end.getUTCDate() + 7); return end.toISOString().slice(0, 10) <= today && r.deals_won + r.deals_lost + r.opps_created > 0; });
    const w = done[done.length - 1]; if (!w) return [{}];
    const prev = done[done.length - 2] || {};
    const target = new Date(w.week + 'T00:00:00Z'); target.setUTCDate(target.getUTCDate() - 364); const ly = weekly.find((r) => r.week === target.toISOString().slice(0, 10)) || {};
    const four = done.slice(-5, -1); const avg = (k) => (four.length ? four.reduce((t, r) => t + r[k], 0) / four.length : null);
    const wr = (r) => (r && r.deals_won + r.deals_lost ? r.deals_won / (r.deals_won + r.deals_lost) : null);
    const end = new Date(w.week + 'T00:00:00Z'); end.setUTCDate(end.getUTCDate() + 6);
    return [{
      week: w.week, week_end: end.toISOString().slice(0, 10), revenue_won: w.revenue_won, win_rate: wr(w), opps_created: w.opps_created, opportunities: w.opportunities,
      prev_revenue_won: prev.revenue_won ?? null, prev_win_rate: wr(prev), prev_opps_created: prev.opps_created ?? null,
      ly_week: ly.week || null, ly_revenue_won: ly.revenue_won ?? null, ly_win_rate: wr(ly), ly_opps_created: ly.opps_created ?? null,
      avg4_revenue_won: avg('revenue_won'), avg4_opps_created: avg('opps_created'),
      created_vs_ly: ly.opps_created ? w.opps_created / ly.opps_created : null,
    }];
  },
});

dash.calc('drivers', {
  title: 'What moved around July',
  description: 'For each complete month of 2026: win rate, average won deal, meetings per active opportunity, average days per stage event across three stages, Enterprise share of closed-won revenue, high-propensity share of won deals, and opportunities created.',
  inputs: ['monthly_funnel', 'month_mix'],
  fn: (monthly_funnel, month_mix) => {
    const y26 = monthly_funnel.filter((r) => r.month >= '2026-01' && r.deals_won + r.deals_lost > 0).slice(0, -1);
    return y26.map((r) => {
      const mx = month_mix.filter((x) => x.month === r.month);
      const rev = mx.reduce((t, x) => t + x.revenue_won, 0); const won = mx.reduce((t, x) => t + x.deals_won, 0);
      const ent = mx.filter((x) => x.size === 'Enterprise').reduce((t, x) => t + x.revenue_won, 0);
      const hi = mx.filter((x) => x.propensity === 'High').reduce((t, x) => t + x.deals_won, 0);
      const ev = r.opps_created + r.needs_assessment + r.solution_presented; const days = r.days_opp_creation + r.days_needs_assessment + r.days_solution;
      return {
        month: r.month, win_rate: r.deals_won / (r.deals_won + r.deals_lost), avg_deal: r.deals_won ? r.revenue_won / r.deals_won : null,
        meetings_per_opp: r.opportunities ? r.meetings / r.opportunities : null, days_per_stage: ev ? days / ev : null,
        enterprise_share: rev ? ent / rev : null, high_share: won ? hi / won : null, opps_created: r.opps_created, deals_lost: r.deals_lost, deals_won: r.deals_won,
      };
    });
  },
});

dash.calc('seller', {
  title: 'Where to put sellers',
  description: 'Company size × propensity to buy, 2026: win rate, closed-won revenue per active account, share of revenue and accounts. Then every industry × size × propensity cell with at least 15 accounts and 500 closed deals, ranked by revenue per account: the top five and bottom five.',
  inputs: ['seller_cross'],
  fn: (seller_cross) => {
    const sizes = ['Enterprise', 'Mid-Market', 'Small Business']; const props = ['High', 'Medium', 'Low'];
    const rev = seller_cross.reduce((t, r) => t + r.revenue_won, 0); const acc = seller_cross.reduce((t, r) => t + r.accounts, 0);
    const agg = (rows) => { const s = (k) => rows.reduce((t, r) => t + r[k], 0); const w = s('deals_won'); const l = s('deals_lost'); return { revenue_won: s('revenue_won'), deals_won: w, deals_lost: l, accounts: s('accounts'), win_rate: w + l ? w / (w + l) : null, revenue_per_account: s('accounts') ? s('revenue_won') / s('accounts') : null }; };
    const out = [];
    sizes.forEach((sz) => props.forEach((p) => { const a = agg(seller_cross.filter((r) => r.size === sz && r.propensity === p)); out.push({ kind: 'grid', key: sz + ' · ' + p, size: sz, propensity: p, ...a, revenue_share: rev ? a.revenue_won / rev : null, account_share: acc ? a.accounts / acc : null }); }));
    const cells = seller_cross.filter((r) => r.accounts >= 15 && r.deals_won + r.deals_lost >= 500).map((r) => ({ ...r, win_rate: r.deals_won / (r.deals_won + r.deals_lost), revenue_per_account: r.revenue_won / r.accounts }));
    cells.sort((a, b) => b.revenue_per_account - a.revenue_per_account);
    cells.slice(0, 5).forEach((r, i) => out.push({ kind: 'top', key: r.industry + ' · ' + r.size + ' · ' + r.propensity, rank: i + 1, ...r }));
    cells.slice(-5).reverse().forEach((r, i) => out.push({ kind: 'bottom', key: r.industry + ' · ' + r.size + ' · ' + r.propensity, rank: i + 1, ...r }));
    return out;
  },
});

dash.calc('ind_brief', {
  title: 'Industry brief figures',
  description: 'For each industry: closed-won revenue in 2026 so far and in all of 2025, 2025’s fourth quarter, 2026’s fourth quarter so far, third-quarter opportunities created in both years, and monthly revenue for both years. Feeds the brief when an industry is followed.',
  inputs: ['industry_month', 'industry_month_prior'],
  fn: (industry_month, industry_month_prior) => {
    const names = [...new Set(industry_month.map((r) => r.industry))];
    const sum = (rows, k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
    const q = (rows, n) => rows.filter((r) => Math.floor((+r.month.slice(5, 7) - 1) / 3) + 1 === n);
    return names.map((industry) => {
      const a = industry_month.filter((r) => r.industry === industry && r.deals_won + r.deals_lost > 0); const b = industry_month_prior.filter((r) => r.industry === industry);
      const months = {}; for (let i = 1; i <= 12; i++) { const mm = String(i).padStart(2, '0'); const x = a.find((r) => r.month.slice(5, 7) === mm); const y = b.find((r) => r.month.slice(5, 7) === mm); months['m' + mm] = x ? x.revenue_won : null; months['p' + mm] = y ? y.revenue_won : null; }
      return { industry, ytd_revenue: sum(a, 'revenue_won'), prior_year_revenue: sum(b, 'revenue_won'), prior_q4_revenue: sum(q(b, 4), 'revenue_won'), q4_to_date: sum(q(a, 4), 'revenue_won'), prior_q3_created: sum(q(b, 3), 'opps_created'), ...months };
    });
  },
});

dash.calc('forecast', {
  title: 'Fourth-quarter range from the lag between new opportunities and revenue',
  description: 'Least-squares fit, over every complete month from April 2025, of closed-won revenue on opportunities created three months earlier. The fit projects each month of the current quarter that is not yet complete from the opportunities created three months before it; months already complete use actual revenue. The range is the projection plus or minus 1.28 standard deviations of the fit’s monthly error, scaled to the months projected (about an 80% band), and never below revenue already closed. Also reports the fit for lags of one to four months, and the full-year total this implies.',
  inputs: ['monthly_funnel'],
  fn: (monthly_funnel) => {
    const rows = monthly_funnel.filter((r) => r.month < '2027-01');
    const liveIdx = rows.reduce((a, r, i) => (r.deals_won + r.deals_lost > 0 ? i : a), -1);
    const lastFull = liveIdx - 1;
    const fit = (k) => {
      const xs = []; const ys = [];
      for (let t = 3 + Math.max(0, k - 3); t <= lastFull; t++) { if (t - k < 0) continue; xs.push(rows[t - k].opps_created); ys.push(rows[t].revenue_won); }
      const n = xs.length; const mx = xs.reduce((a, b) => a + b, 0) / n; const my = ys.reduce((a, b) => a + b, 0) / n;
      let sxy = 0; let sxx = 0; let syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
      const a = sxy / sxx; const b = my - a * mx; let sse = 0; xs.forEach((x, i) => { sse += (ys[i] - (a * x + b)) ** 2; });
      return { k, a, b, r2: 1 - sse / syy, sd: Math.sqrt(sse / Math.max(1, n - 2)), n };
    };
    const fits = [1, 2, 3, 4].map(fit); const f = fits[2];
    const q = Math.floor((+rows[liveIdx].month.slice(5, 7) - 1) / 3) + 1; const qStart = 12 + (q - 1) * 3; // 2026 rows start at index 12
    let actual = 0; let proj = 0; let nproj = 0; const months = [];
    for (let t = qStart; t < qStart + 3; t++) {
      const r = rows[t]; const done = t <= lastFull;
      if (done) { actual += r.revenue_won; months.push({ month: r.month, actual: r.revenue_won }); continue; }
      const p = Math.max(0, f.a * rows[t - 3].opps_created + f.b); proj += p; nproj += 1; months.push({ month: r.month, projected: p, from_month: rows[t - 3].month, from_created: rows[t - 3].opps_created });
    }
    const toDate = rows.slice(qStart, liveIdx + 1).reduce((a, r) => a + r.revenue_won, 0);
    const half = 1.28 * f.sd * Math.sqrt(Math.max(1, nproj));
    const central = actual + proj; const low = Math.max(toDate, central - half); const high = central + half;
    const before = rows.slice(12, qStart).reduce((a, r) => a + r.revenue_won, 0);
    return [{ quarter: q, lag: 3, slope: f.a, intercept: f.b, r2: f.r2, months_fitted: f.n, q_central: central, q_low: low, q_high: high, year_central: before + central, year_low: before + low, year_high: before + high, q_to_date: toDate,
      r2_lag1: fits[0].r2, r2_lag2: fits[1].r2, r2_lag4: fits[3].r2, m1: months[0], m2: months[1], m3: months[2],
      revenue_per_created: f.a }];
  },
});

dash.calc('trough', {
  title: 'Same trough a year earlier, and a data check',
  description: 'The lowest month for opportunities created in 2025 and in 2026 (complete months), what revenue did three months after 2025’s low, and a data check for the last complete month against June: leads, MQL, SQL and opportunity-created events, people with any activity, and deals closed.',
  inputs: ['monthly_funnel'],
  fn: (monthly_funnel) => {
    const live = monthly_funnel.filter((r) => r.deals_won + r.deals_lost > 0); const full = live.slice(0, -1);
    const y25 = full.filter((r) => r.month < '2026-01'); const y26 = full.filter((r) => r.month >= '2026-01');
    const lo25 = y25.reduce((a, b) => (b.opps_created < a.opps_created ? b : a)); const lo26 = y26.reduce((a, b) => (b.opps_created < a.opps_created ? b : a));
    const i = monthly_funnel.indexOf(lo25); const after = monthly_funnel[i + 3] || {}; const rec = monthly_funnel.slice(i + 1, i + 4);
    const recPeak = rec.reduce((a, b) => (b.opps_created > a.opps_created ? b : a), rec[0] || {});
    const last = y26[y26.length - 1]; const jun = y26.find((r) => r.month.slice(5, 7) === '06') || {};
    const ch = (k) => (jun[k] ? last[k] / jun[k] - 1 : null);
    return [{ low25_month: lo25.month, low25_created: lo25.opps_created, low25_revenue_3m: after.revenue_won ?? null, low25_revenue_month: after.month || null, rebound_month: recPeak.month || null, rebound_created: recPeak.opps_created ?? null,
      low26_month: lo26.month, low26_created: lo26.opps_created, check_month: last.month,
      leads_change: ch('leads'), mql_change: ch('mql'), sql_change: ch('sql'), created_change: ch('opps_created'), people_change: ch('people'), closed_change: jun.deals_won + jun.deals_lost ? (last.deals_won + last.deals_lost) / (jun.deals_won + jun.deals_lost) - 1 : null }];
  },
});

dash.calc('fix_value', {
  title: 'What the proposal fix is worth',
  description: 'For the five industries with 100 or more wins and the lowest share of solution presentations followed by a proposal: the extra proposals if each reached 55%, times wins per proposal across all industries, times the average won deal. A rough sizing on event counts, not a forecast.',
  inputs: ['funnel_all', 'scorecard', 'leak', 'totals'],
  fn: (funnel_all, scorecard, leak, totals) => {
    const elig = scorecard.filter((r) => r.deals_won >= 100 && r.proposal_rate != null).sort((a, b) => a.proposal_rate - b.proposal_rate).slice(0, 5);
    const target = 0.55; let extra = 0;
    elig.forEach((r) => { const f = funnel_all.find((x) => x.industry === r.industry); if (f) extra += Math.max(0, target * f.solution_presented - f.proposal); });
    const wpp = leak[0].win_per_proposal; const deal = totals[0].avg_deal;
    return [{ industries: elig.map((r) => r.industry).join(', '), first: elig[0] ? elig[0].industry : null, first_rate: elig[0] ? elig[0].proposal_rate : null, low5_rate: elig.reduce((a, r) => a + r.proposal_rate, 0) / (elig.length || 1), target, extra_proposals: extra, wins: extra * wpp, value: extra * wpp * deal }];
  },
});
