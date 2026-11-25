/* eslint-disable */
import { makePdf, pdfCover, fmtDate } from './pdfEngine.js';
import { stats, keysFor, textFor } from './curriculum.js';
import { MODULE_NAMES as MN } from '../data/modules.js';

export { fmtDate };

// Single advisor progress report.
export function reportBlob(sh, cases) {
  var st = stats(sh, cases), q = sh.quiz, nm = sh.name || '(name not entered)';
  return makePdf(function (P) {
    var PW = P.PW, M = P.M, W = PW - 2 * M;
    pdfCover(P, 'Home Loan Advisor Training', 'Progress report', nm, 'Generated ' + fmtDate(Date.now()));
    var y0 = P.y();
    P.ring(M + 58, y0 - 62, 48, st.pc, 12);
    P.at(st.pc + '%', M + 58, y0 - 56, { size: 22, bold: true, align: 'center' });
    P.at('CLEAR', M + 58, y0 - 70, { size: 7, bold: true, c: 'stone', sp: 1.2, align: 'center' });
    var x2 = M + 140;
    P.at(st.pc >= 100 ? 'Every topic is clear' : st.d + ' of ' + st.t + ' topics clear', x2, y0 - 34, { size: 16, bold: true });
    P.at(st.full + ' of ' + st.n + ' modules fully complete', x2, y0 - 52, { size: 10, c: 'stone' });
    P.at(q.runs && q.last ? ('Last quiz ' + Math.round(q.last.s / q.last.t * 100) + '%, best ' + q.best + '%, ' + q.runs + ' attempt' + (q.runs > 1 ? 's' : '')) : 'Quiz not taken yet', x2, y0 - 68, { size: 10, c: 'stone' });
    var ty = y0 - 176, tw3 = (W - 24) / 3;
    P.tile(M, ty, tw3, 52, st.d + ' / ' + st.t, 'Pointers done');
    P.tile(M + tw3 + 12, ty, tw3, 52, st.full + ' / ' + st.n, 'Modules complete');
    P.tile(M + 2 * (tw3 + 12), ty, tw3, 52, q.runs ? q.best + '%' : '-', 'Best quiz score');
    P.y(ty - 30);
    P.label('Progress by module', M, P.y()); P.gap(10);
    var cw = (W - 26) / 2, top = P.y(), mods = [];
    for (var m = 1; m <= 18; m++) { if (keysFor(m, cases).length) mods.push(m); }
    var per = Math.ceil(mods.length / 2);
    mods.forEach(function (m, i) {
      var col = i < per ? 0 : 1, row = i < per ? i : i - per, x = M + col * (cw + 26), yy = top - row * 27 - 12, xx = st.mods[m - 1], pc = xx[1] ? Math.round(xx[0] / xx[1] * 100) : 0;
      P.at(P.fit(m + '.  ' + MN[m], 8.5, false, cw - 34), x, yy, { size: 8.5, c: xx[0] === xx[1] ? 'navy' : 'stone', bold: xx[0] === xx[1] });
      P.at(xx[0] + '/' + xx[1], x + cw, yy, { size: 8.5, bold: true, c: 'teal', align: 'right' });
      P.bar(x, yy - 8, cw, 4, pc, xx[0] === xx[1] ? 'orange' : 'teal');
    });
    P.y(top - per * 27 - 14);
    P.newPage();
    P.label('Checklist', M, P.y()); P.gap(2);
    for (var m2 = 1; m2 <= 18; m2++) {
      var ks = keysFor(m2, cases); if (!ks.length) continue;
      var x3 = st.mods[m2 - 1];
      P.band(m2 + '.  ' + MN[m2], x3[0] + '/' + x3[1] + ' done');
      ks.forEach(function (k, p) { P.check(!!sh.checked[k], textFor(m2, p, cases), { indent: 6 }); });
    }
  }, { label: 'Progress report', right: nm });
}

// rows: [{ name, s (sheet), st (stats), t }]
export function teamBlob(rows, cases) {
  rows = rows.slice().sort(function (a, b) { return b.st.pc - a.st.pc; });
  var avg = rows.length ? Math.round(rows.reduce(function (s, r) { return s + r.st.pc; }, 0) / rows.length) : 0;
  var taken = rows.filter(function (r) { return r.s.quiz && r.s.quiz.runs; }).length;
  return makePdf(function (P) {
    var PW = P.PW, M = P.M, W = PW - 2 * M, C = P.C;
    pdfCover(P, 'Home Loan Advisor Training', 'Team overview', rows.length + ' advisor sheet' + (rows.length === 1 ? '' : 's'), 'Generated ' + fmtDate(Date.now()));
    var ty = P.y() - 52, tw3 = (W - 24) / 3;
    P.tile(M, ty, tw3, 52, rows.length + '', 'Sheets');
    P.tile(M + tw3 + 12, ty, tw3, 52, avg + '%', 'Average completion');
    P.tile(M + 2 * (tw3 + 12), ty, tw3, 52, taken + ' / ' + rows.length, 'Quiz taken');
    P.y(ty - 28);
    P.label('Advisors, highest completion first', M, P.y()); P.gap(8);
    var cx = [M, M + 140, M + 280, M + 330, M + 390, M + 450];
    P.need(30); var hy = P.y() - 8;
    [['Advisor', 0], ['Completion', 1], ['', 2], ['Modules', 3], ['Quiz best', 4], ['Active', 5]].forEach(function (h) { if (h[0]) P.at(h[0].toUpperCase(), cx[h[1]], hy, { size: 6.5, bold: true, c: 'stone', sp: 0.8 }); });
    P.line(M, hy - 5, PW - M, hy - 5, C.line, 0.6); P.y(hy - 5);
    rows.forEach(function (r, i) {
      P.need(24); var yy = P.y() - 16, q = r.s.quiz;
      if (i % 2 === 0) P.rect(M - 4, yy - 7, W + 8, 22, C.tint);
      P.at(P.fit(r.name, 9.5, true, 138), cx[0], yy, { size: 9.5, bold: true });
      P.bar(cx[1], yy + 1, 100, 5, r.st.pc, r.st.pc >= 100 ? 'orange' : 'teal');
      P.at(r.st.pc + '%', cx[2] + 36, yy - 1, { size: 9, bold: true, c: 'teal', align: 'right' });
      P.at(r.st.full + '/' + r.st.n, cx[3], yy - 1, { size: 9, c: 'stone' });
      P.at(q && q.runs ? q.best + '%' : '-', cx[4], yy - 1, { size: 9, c: 'stone' });
      P.at(r.t ? fmtDate(r.t).replace(/ 20(\d\d)$/, ' $1') : '-', cx[5], yy - 1, { size: 8.5, c: 'stone' });
      P.y(yy - 7);
    });
    if (rows.length) {
      P.newPage();
      P.label('Module heat map', M, P.y()); P.gap(4);
      P.text('Darker cells mean more of that module is clear.', { size: 8.5, grey: true }); P.gap(6);
      var lx = M, gx = M + 130, cwid = (PW - M - gx) / 18;
      function shade(f) { var a = [0.949, 0.961, 0.973], b = [0.118, 0.357, 0.388]; return [0, 1, 2].map(function (i) { return (a[i] + (b[i] - a[i]) * f).toFixed(3); }).join(' '); }
      function head() { P.need(24); var yy = P.y() - 10; for (var m = 1; m <= 18; m++) P.at(m + '', gx + (m - 0.5) * cwid, yy, { size: 7, bold: true, c: 'stone', align: 'center' }); P.y(yy - 6); }
      head();
      rows.forEach(function (r) {
        if (P.y() - 20 < M + 14) { P.newPage(); head(); }
        var yy = P.y() - 16;
        P.at(P.fit(r.name, 8.5, true, 122), lx, yy + 2, { size: 8.5, bold: true });
        for (var m = 1; m <= 18; m++) { var x = r.st.mods[m - 1], f = x[1] ? x[0] / x[1] : 0; P.rect(gx + (m - 1) * cwid + 0.8, yy - 4, cwid - 1.6, 15, shade(f)); }
        P.y(yy - 6);
      });
      var yy2 = P.y() - 18; P.line(M, yy2 + 12, PW - M, yy2 + 12, C.line, 0.6);
      P.at('Team average', lx, yy2, { size: 8.5, bold: true, c: 'teal' });
      for (var m3 = 1; m3 <= 18; m3++) {
        var tot = 0, cnt = 0;
        rows.forEach(function (r) { var x = r.st.mods[m3 - 1]; if (x[1]) { tot += x[0] / x[1]; cnt++; } });
        P.at(cnt ? Math.round(tot / cnt * 100) + '' : '-', gx + (m3 - 0.5) * cwid, yy2, { size: 7.5, bold: true, c: 'teal', align: 'center' });
      }
      P.y(yy2 - 14);
      P.gap(14); P.label('Module key', M, P.y()); P.gap(4);
      for (var m4 = 1; m4 <= 18; m4++) P.text(m4 + '.  ' + MN[m4], { size: 8.5, grey: true, lh: 12 });
    }
  }, { label: 'Team overview', right: fmtDate(Date.now()) });
}

// Saves a Blob as a file through a normal browser download.
export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
