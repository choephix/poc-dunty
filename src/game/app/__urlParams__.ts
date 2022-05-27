function adaptValue(value: any): string | number | boolean {
  if (typeof value === "boolean") return value;
  if (value === "") return true;
  if (value?.toString?.().toLowerCase() === "true") return true;
  if (value?.toString?.().toLowerCase() === "false") return false;
  if (isNaN(value as any)) return value;
  return Number(value);
}

export const __urlParams__: Record<string, string | number | boolean> = window.location.search
  .substr(1)
  .split("&")
  .reduce((params, param) => {
    const [key, value = true] = param.split("=");
    return { ...params, [key]: adaptValue(value) };
  }, {});

Object.assign(window, { __urlParams__ });

// export const urlParamsService = {
//   get: function (name: string) {
//     const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
//     const r = window.location.search.substr(1).match(reg);
//     if (r != null) return unescape(r[2]);
//     return null;
//   },
//   set: function (name: string, value: string) {
//     const r = window.location.search.substr(1);
//     const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
//     const r1 = r.replace(reg, `$1${name}=${value}$3`);
//     if (r1 !== r) {
//       window.location.search = r1;
//     }
//   },
//   remove: function (name: string) {
//     const r = window.location.search.substr(1);
//     const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
//     const r1 = r.replace(reg, '');
//     if (r1 !== r) {
//       window.location.search = r1;
//     }
//   },
//   clear: function () {
//     window.location.search = '';
//   },
// };
