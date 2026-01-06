// NOTE: Some legacy deps (request / request-promise / form-data@2.x) break under
// Yarn V4 with nodeLinker=pnpm. Jest mocks + packageExtensions are required
// for tests to load modules reliably (no runtime impact).
function rp() {
  return Promise.reject(new Error("request-promise is disabled in Jest"));
}
rp.defaults = () => rp;
module.exports = rp;
module.exports.default = rp;
