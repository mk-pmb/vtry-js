import safeVError from './safe-verror';

function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }
function identity(x) { return x; }
function reCause(opt, cause) { return { ...(opt || false), cause }; }


function needFunc(f, slotName) {
  if (ifFun(f)) { return true; }
  throw new TypeError(`${slotName || 'f'} must be a function`);
}


function vtry(f, ...a) {
  needFunc(f);
  const c = vtry.makeHandler(...a);
  return function vtrying(...args) {
    try { return f.apply(this, args); } catch (e) { return c(e); }
  };
}


function makeRethrower(msg, opt) {
  return (err) => { throw safeVError(reCause(opt, err), msg); };
}

vtry.makeHandler = (how, ...args) => {
  if (!how) { return () => undefined; }
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
