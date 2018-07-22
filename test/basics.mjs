// -*- coding: utf-8, tab-width: 2 -*-

import test from 'p-tape';
import vtry from '../vtry.node';

test('basics', async (t) => {
  t.plan(6);

  const dataType = 'location';
  const okLoca = '{"lat":0,"lon":0}';
  const badLoca = '{"lat":undefined,"lon":undefined}';

  const parseOrIgnore = vtry(JSON.parse);
  t.deepEqual(parseOrIgnore(okLoca), { lat: 0, lon: 0 });
  t.deepEqual(parseOrIgnore(badLoca), undefined);

  const parseOrAnnotate = vtry(JSON.parse, ['Cannot parse %s', dataType]);
  t.deepEqual(parseOrAnnotate(okLoca), { lat: 0, lon: 0 });
  t.throws(() => parseOrAnnotate(badLoca),
    /Cannot parse location: Unexpected token/);

  const parseOrCapture = vtry(JSON.parse, err => ({
    error: err.name,
    msg: err.message.slice(0, 16),
  }));
  t.deepEqual(parseOrCapture(okLoca), { lat: 0, lon: 0 });
  t.deepEqual(parseOrCapture(badLoca),
    { error: 'SyntaxError', msg: 'Unexpected token' });
});
