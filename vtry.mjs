﻿import VError from 'verror';

function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }

function vtry(f, ...a) {
  if (!ifFun(f)) { throw new TypeError('f must be a function'); }
  const c = vtry.makeHandler(...a);
  return function vtrying(...args) {
    try { return f.apply(this, args); } catch (e) { return c(e); }
  };
}


function makeRethrower(msg, opt) {
  if (!Array.isArray(msg)) { return makeRethrower([msg], opt); }
  const safeOpt = (opt || false);
  return (err) => { throw new VError({ ...safeOpt, cause: err }, ...msg); };
}

vtry.makeHandler = (how, ...args) => {
  if (!how) { return () => undefined; }
  if (ifFun(how)) { return err => how(err, ...args); }
  return makeRethrower(how, ...args);
};




export default vtry;
