const ts = () => new Date().toISOString().slice(11, 19);
export const logger = {
  info: (...a) => console.log(`[${ts()}] ℹ️`, ...a),
  warn: (...a) => console.warn(`[${ts()}] ⚠️`, ...a),
  error: (...a) => console.error(`[${ts()}] ❌`, ...a),
};