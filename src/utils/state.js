const pending = new Map();

export function setPending(userId, action, data = {}) {
  pending.set(userId, { action, data, at: Date.now() });
}

export function getPending(userId) {
  const p = pending.get(userId);
  if (!p) return null;
  if (Date.now() - p.at > 5 * 60 * 1000) {
    pending.delete(userId);
    return null;
  }
  return p;
}

export function clearPending(userId) {
  pending.delete(userId);
}