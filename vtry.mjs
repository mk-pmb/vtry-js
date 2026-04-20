// -*- coding: utf-8, tab-width: 2 -*-

import safeVError from './safe-verror.mjs';

function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }
function identity(x) { return x; }
function reCause(opt, cause) { return { ...(opt || false), cause }; }


(function checkNodejsVersionCompat() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  const issuesUrl = 'https://github.com/TritonDataCenter/node-verror/issues/';
  if (major === 24) {
    if (minor < 14) {
      const url = issuesUrl + 93;
      const msg = ('vtry needs verror, but your node.js ' + process.version
        + ' has a bug that breaks verror.'
        + ' Please either downgrade to node.js v22.*, or (recommended)'
        + ' upgrade to node.js v24.14.0 or later. For details, see: ' + url);
      const err = new Error(msg);
      err.issuesUrl = url;
      throw err;
    }
  }
}());


function needFunc(f, slotName) {
  if (ifFun(f)) { return true; }
  throw new TypeError(`${slotName || 'f'} must be a function`);
}


function vtry(f, ...a) {
  needFunc(f);
  const c = vtry.makeHandler(...a);
  return function vtrying(...args) {
    try {
      return f.apply(this, args);
    } catch (e) {
      return c(e);
    }
  };
}


function quoteStack(descr, cutoff, src) {
  let st = String((src || false).stack || src);
  if (st) {
    st = st.split(/\n *(?=at )/).slice(cutoff).filter(Boolean).join('\n¦ ');
  }
  // Empty stack might result from incompatible error prettyprinting modules.
  return ('\n»»»»» ' + descr + (st ? (' »»»»»\n¦ ' + st + '\n««««« ' + descr)
    : ': (empty)') + ' «««««').replace(/\n/g, '\n    ');
}


function makeRethrower(msg, opt) {
  const setupStack = (new Error('trace')).stack;
  return function rethrow(origErr) {
    const err = safeVError(reCause(opt, origErr), msg);
    err.stack += quoteStack('original stack for: ' + msg, 0, origErr);
    err.stack += quoteStack('setup stack for: ' + msg, 4, setupStack);
    throw err;
  };
}


vtry.makeHandler = function makeVTryingHandler(how, ...args) {
  if ((!how) && (how !== '')) { return () => undefined; }
  if (ifFun(how)) { return err => how(err, ...args); }
  return makeRethrower(how, ...args);
};

vtry.pr = function pr(f, ...a) {
  if (f === 1) { return pr(identity, ...a); }
  needFunc(f);
  const c = vtry.makeHandler(...a);
  return async function vtrying(...args) {
    try { return await f.apply(this, args); } catch (e) { return c(e); }
  };
};



Object.assign(vtry, {
  safeVError,
});
export default vtry;
