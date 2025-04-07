import crypto from "crypto";
import { readFile } from "fs/promises";

const v = global || void 0;

async function loadWasm() {
  const n = $(); // Tạo đối tượng imports
  const wasmBuffer = await readFile(new URL("./game2.wasm", import.meta.url));
  const { instance, module } = await WebAssembly.instantiate(wasmBuffer, n);
  return instance;
}

// Export hàm khởi tạo WASM
export async function initializeWasm() {
  const wasmInstance = await loadWasm();
  return wasmInstance;
}

let _;
const g = new Array(128).fill(void 0);
g.push(void 0, null, !0, !1);
// function c(e) {
//   return g[e];
// }
function i(e) {
  return g[e];
}
// let m = g.length;
let I = g.length;
// function M(e) {
//   e < 132 || ((g[e] = m), (m = e));
// }
function W(e) {
  e < 132 || ((g[e] = I), (I = e));
}
// function w(e) {
//   const n = c(e);
//   return M(e), n;
// }
function l(e) {
  const n = i(e);
  return W(e), n;
}
// let d = 0,
//   p = null;
let w = 0,
  m = null;
// function S() {
//   return (
//     (p === null || p.byteLength === 0) && (p = new Uint8Array(_.memory.buffer)),
//     p
//   );
// }

function S() {
  return (
    (m === null || m.byteLength === 0) && (m = new Uint8Array(_.memory.buffer)),
    m
  );
}

const typeofTextEncoder = typeof TextEncoder;
// const O = typeof TextEncoder < "u" ? new TextEncoder("utf-8") : {
//   encode: () => {
//       throw Error("TextEncoder not available")
//   }
// }
const O =
  typeofTextEncoder < "u"
    ? new TextEncoder("utf-8")
    : {
        encode: () => {
          throw Error("TextEncoder not available");
        },
      };
const M =
  typeof O.encodeInto == "function"
    ? function (e, n) {
        return O.encodeInto(e, n);
      }
    : function (e, n) {
        const t = O.encode(e);
        return (
          n.set(t),
          {
            read: e.length,
            written: t.length,
          }
        );
      };

function p(e, n, t) {
  if (t === void 0) {
    const a = O.encode(e),
      y = n(a.length, 1) >>> 0;
    return (
      S()
        .subarray(y, y + a.length)
        .set(a),
      (w = a.length),
      y
    );
  }
  let r = e.length,
    o = n(r, 1) >>> 0;
  const f = S();
  let s = 0;
  for (; s < r; s++) {
    const a = e.charCodeAt(s);
    if (a > 127) break;
    f[o + s] = a;
  }
  if (s !== r) {
    s !== 0 && (e = e.slice(s)), (o = t(o, r, (r = s + e.length * 3), 1) >>> 0);
    const a = S().subarray(o + s, o + r),
      y = M(e, a);
    (s += y.written), (o = t(o, r, s, 1) >>> 0);
  }
  return (w = s), o;
}

function h(e) {
  return e == null;
}
let d = null;
function u() {
  return (
    (d === null ||
      d.buffer.detached === !0 ||
      (d.buffer.detached === void 0 && d.buffer !== _.memory.buffer)) &&
      (d = new DataView(_.memory.buffer)),
    d
  );
}

function c(e) {
  I === g.length && g.push(g.length + 1);
  const n = I;
  return (I = g[n]), (g[n] = e), n;
}

const typeofTextDecoder = typeof TextDecoder;
function createDecode() {
  return typeofTextDecoder < "u"
    ? new TextDecoder("utf-8", {
        ignoreBOM: true,
        fatal: true,
      })
    : {
        decode: () => {
          throw new Error("TextDecoder not available");
        },
      };
}
const E = createDecode();
typeofTextDecoder < "u" && E.decode();
function A(e, n) {
  return (e = e >>> 0), E.decode(S().subarray(e, e + n));
}

function D(e) {
  try {
    const o = _.__wbindgen_add_to_stack_pointer(-16),
      f = p(e, _.__wbindgen_malloc, _.__wbindgen_realloc),
      s = w;
    _.proof(o, f, s);
    var n = u().getInt32(o + 4 * 0, !0),
      t = u().getInt32(o + 4 * 1, !0),
      r = u().getInt32(o + 4 * 2, !0);
    if (r) throw l(t);
    return l(n);
  } finally {
    _.__wbindgen_add_to_stack_pointer(16);
  }
}
function F(e, n, t, r) {
  let o, f;
  try {
    const j = _.__wbindgen_add_to_stack_pointer(-16),
      N = p(e, _.__wbindgen_malloc, _.__wbindgen_realloc),
      V = w;
    _.pack(j, N, V, c(n), c(t), c(r));
    var s = u().getInt32(j + 4 * 0, !0),
      a = u().getInt32(j + 4 * 1, !0),
      y = u().getInt32(j + 4 * 2, !0),
      C = u().getInt32(j + 4 * 3, !0),
      x = s,
      U = a;
    if (C) throw ((x = 0), (U = 0), l(y));
    return (o = x), (f = U), A(x, U);
  } finally {
    _.__wbindgen_add_to_stack_pointer(16), _.__wbindgen_free(o, f, 1);
  }
}

function b(e, n) {
  try {
    return e.apply(this, n);
  } catch (t) {
    _.__wbindgen_exn_store(c(t));
  }
}

function $() {
  const e = {};
  return (
    (e.wbg = {}),
    (e.wbg.__wbindgen_string_get = function (n, t) {
      const r = i(t),
        o = typeof r == "string" ? r : void 0;
      var f = h(o) ? 0 : p(o, _.__wbindgen_malloc, _.__wbindgen_realloc),
        s = w;
      u().setInt32(n + 4 * 1, s, !0), u().setInt32(n + 4 * 0, f, !0);
    }),
    (e.wbg.__wbindgen_object_drop_ref = function (n) {
      l(n);
    }),
    (e.wbg.__wbindgen_error_new = function (n, t) {
      const r = new Error(A(n, t));
      return c(r);
    }),
    (e.wbg.__wbindgen_is_bigint = function (n) {
      return typeof i(n) == "bigint";
    }),
    (e.wbg.__wbindgen_bigint_from_u64 = function (n) {
      const t = BigInt.asUintN(64, n);
      return c(t);
    }),
    (e.wbg.__wbindgen_jsval_eq = function (n, t) {
      return i(n) === i(t);
    }),
    (e.wbg.__wbindgen_is_object = function (n) {
      const t = i(n);
      return typeof t == "object" && t !== null;
    }),
    (e.wbg.__wbindgen_is_undefined = function (n) {
      return i(n) === void 0;
    }),
    (e.wbg.__wbindgen_in = function (n, t) {
      return i(n) in i(t);
    }),
    (e.wbg.__wbg_crypto_1d1f22824a6a080c = function (n) {
      const t = i(n).crypto;
      return c(crypto);
    }),
    (e.wbg.__wbg_process_4a72847cc503995b = function (n) {
      const t = i(n).process;
      return c(t);
    }),
    (e.wbg.__wbg_versions_f686565e586dd935 = function (n) {
      const t = i(n).versions;
      return c(t);
    }),
    (e.wbg.__wbg_node_104a2ff8d6ea03a2 = function (n) {
      const t = i(n).node;
      return c(t);
    }),
    (e.wbg.__wbindgen_is_string = function (n) {
      return typeof i(n) == "string";
    }),
    (e.wbg.__wbg_require_cca90b1a94a0255b = function () {
      return b(function () {
        const n = module.require;
        return c(n);
      }, arguments);
    }),
    (e.wbg.__wbindgen_is_function = function (n) {
      return typeof i(n) == "function";
    }),
    (e.wbg.__wbindgen_string_new = function (n, t) {
      const r = A(n, t);
      return c(r);
    }),
    (e.wbg.__wbg_msCrypto_eb05e62b530a1508 = function (n) {
      const t = i(n).msCrypto;
      return c(t);
    }),
    (e.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function () {
      return b(function (n, t) {
        i(n).randomFillSync(l(t));
      }, arguments);
    }),
    (e.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function () {
      return b(function (n, t) {
        i(n).getRandomValues(i(t));
      }, arguments);
    }),
    (e.wbg.__wbindgen_jsval_loose_eq = function (n, t) {
      return i(n) == i(t);
    }),
    (e.wbg.__wbindgen_boolean_get = function (n) {
      const t = i(n);
      return typeof t == "boolean" ? (t ? 1 : 0) : 2;
    }),
    (e.wbg.__wbindgen_number_get = function (n, t) {
      const r = i(t),
        o = typeof r == "number" ? r : void 0;
      u().setFloat64(n + 8 * 1, h(o) ? 0 : o, !0),
        u().setInt32(n + 4 * 0, !h(o), !0);
    }),
    (e.wbg.__wbindgen_as_number = function (n) {
      return +i(n);
    }),
    (e.wbg.__wbindgen_number_new = function (n) {
      return c(n);
    }),
    (e.wbg.__wbindgen_object_clone_ref = function (n) {
      const t = i(n);
      return c(t);
    }),
    (e.wbg.__wbg_getwithrefkey_edc2c8960f0f1191 = function (n, t) {
      const r = i(n)[i(t)];
      return c(r);
    }),
    (e.wbg.__wbg_set_f975102236d3c502 = function (n, t, r) {
      i(n)[l(t)] = l(r);
    }),
    (e.wbg.__wbg_String_b9412f8799faab3e = function (n, t) {
      const r = String(i(t)),
        o = p(r, _.__wbindgen_malloc, _.__wbindgen_realloc),
        f = w;
      u().setInt32(n + 4 * 1, f, !0), u().setInt32(n + 4 * 0, o, !0);
    }),
    (e.wbg.__wbg_get_3baa728f9d58d3f6 = function (n, t) {
      const r = i(n)[t >>> 0];
      return c(r);
    }),
    (e.wbg.__wbg_length_ae22078168b726f5 = function (n) {
      return i(n).length;
    }),
    (e.wbg.__wbg_newnoargs_76313bd6ff35d0f2 = function (n, t) {
      const r = new Function(A(n, t));
      return c(r);
    }),
    (e.wbg.__wbg_next_de3e9db4440638b2 = function (n) {
      const t = i(n).next;
      return c(t);
    }),
    (e.wbg.__wbg_next_f9cb570345655b9a = function () {
      return b(function (n) {
        const t = i(n).next();
        return c(t);
      }, arguments);
    }),
    (e.wbg.__wbg_done_bfda7aa8f252b39f = function (n) {
      return i(n).done;
    }),
    (e.wbg.__wbg_value_6d39332ab4788d86 = function (n) {
      const t = i(n).value;
      return c(t);
    }),
    (e.wbg.__wbg_iterator_888179a48810a9fe = function () {
      return c(Symbol.iterator);
    }),
    (e.wbg.__wbg_get_224d16597dbbfd96 = function () {
      return b(function (n, t) {
        const r = Reflect.get(i(n), i(t));
        return c(r);
      }, arguments);
    }),
    (e.wbg.__wbg_call_1084a111329e68ce = function () {
      return b(function (n, t) {
        const r = i(n).call(i(t));
        return c(r);
      }, arguments);
    }),
    (e.wbg.__wbg_new_525245e2b9901204 = function () {
      const n = new Object();
      return c(n);
    }),
    (e.wbg.__wbg_self_3093d5d1f7bcb682 = function () {
      return b(function () {
        const n = global;
        return c(n);
      }, arguments);
    }),
    (e.wbg.__wbg_window_3bcfc4d31bc012f8 = function () {
      return b(function () {
        const n = global;
        return c(n);
      }, arguments);
    }),
    (e.wbg.__wbg_globalThis_86b222e13bdf32ed = function () {
      return b(function () {
        const n = global;
        return c(n);
      }, arguments);
    }),
    (e.wbg.__wbg_global_e5a3fe56f8be9485 = function () {
      return b(function () {
        const n = v.global;
        return c(n);
      }, arguments);
    }),
    (e.wbg.__wbg_instanceof_ArrayBuffer_61dfc3198373c902 = function (n) {
      let t;
      try {
        t = i(n) instanceof ArrayBuffer;
      } catch {
        t = !1;
      }
      return t;
    }),
    (e.wbg.__wbg_call_89af060b4e1523f2 = function () {
      return b(function (n, t, r) {
        const o = i(n).call(i(t), i(r));
        return c(o);
      }, arguments);
    }),
    (e.wbg.__wbg_isSafeInteger_7f1ed56200d90674 = function (n) {
      return Number.isSafeInteger(i(n));
    }),
    (e.wbg.__wbg_entries_7a0e06255456ebcd = function (n) {
      const t = Object.entries(i(n));
      return c(t);
    }),
    (e.wbg.__wbg_buffer_b7b08af79b0b0974 = function (n) {
      const t = i(n).buffer;
      return c(t);
    }),
    (e.wbg.__wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9 = function (
      n,
      t,
      r
    ) {
      const o = new Uint8Array(i(n), t >>> 0, r >>> 0);
      return c(o);
    }),
    (e.wbg.__wbg_new_ea1883e1e5e86686 = function (n) {
      const t = new Uint8Array(i(n));
      return c(t);
    }),
    (e.wbg.__wbg_set_d1e79e2388520f18 = function (n, t, r) {
      i(n).set(i(t), r >>> 0);
    }),
    (e.wbg.__wbg_length_8339fcf5d8ecd12e = function (n) {
      return i(n).length;
    }),
    (e.wbg.__wbg_instanceof_Uint8Array_247a91427532499e = function (n) {
      let t;
      try {
        t = i(n) instanceof Uint8Array;
      } catch {
        t = !1;
      }
      return t;
    }),
    (e.wbg.__wbg_newwithlength_ec548f448387c968 = function (n) {
      const t = new Uint8Array(n >>> 0);
      return c(t);
    }),
    (e.wbg.__wbg_subarray_7c2e3576afe181d1 = function (n, t, r) {
      const o = i(n).subarray(t >>> 0, r >>> 0);
      return c(o);
    }),
    (e.wbg.__wbindgen_bigint_get_as_i64 = function (n, t) {
      const r = i(t),
        o = typeof r == "bigint" ? r : void 0;
      u().setBigInt64(n + 8 * 1, h(o) ? BigInt(0) : o, !0),
        u().setInt32(n + 4 * 0, !h(o), !0);
    }),
    (e.wbg.__wbindgen_debug_string = function (n, t) {
      const r = T(i(t)),
        o = p(r, _.__wbindgen_malloc, _.__wbindgen_realloc),
        f = w;
      u().setInt32(n + 4 * 1, f, !0), u().setInt32(n + 4 * 0, o, !0);
    }),
    (e.wbg.__wbindgen_throw = function (n, t) {
      throw new Error(A(n, t));
    }),
    (e.wbg.__wbindgen_memory = function () {
      const n = _.memory;
      return c(n);
    }),
    e
  );
}

function L(e, n) {
  return (
    (_ = e.exports), (R.__wbindgen_wasm_module = n), (d = null), (m = null), _
  );
}
async function R(e) {
  if (_ !== void 0) return _;
  const n = $();
  const wasmBuffer = await readFile(new URL("./game2.wasm", import.meta.url));
  const { instance: t, module: r } = await WebAssembly.instantiate(
    wasmBuffer,
    n
  );
  return L(t, r);
}
let k;
const q = async () => {
  k === void 0 && (k = R()), await k;
};

export async function proof(payload) {
  await q();

  return D(payload);
}

export async function pack(gameId, challenge, totalPoints, earnedAssets) {
  await q();
  return F(gameId, challenge, totalPoints, earnedAssets);
}
