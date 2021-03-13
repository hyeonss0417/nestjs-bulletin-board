export function pick(obj: Object, keys: string[]): Object {
  return keys
    .map(k => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {});
}

export function omit(obj: Object, keys: string[]): Object {
  const vkeys = Object.keys(obj).filter(k => !keys.includes(k));
  return pick(obj, vkeys);
}
