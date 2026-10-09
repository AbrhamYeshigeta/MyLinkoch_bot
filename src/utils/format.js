export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function linkCard(link) {
  const tags = link.tags ? `\n🏷 <i>${escapeHtml(link.tags)}</i>` : "";
  const note = link.note ? `\n\n🗒 <b>Note:</b> ${escapeHtml(link.note)}` : "";
  const fav = link.favorite ? " ⭐" : "";

  return (
    `🔗 <b>LINK SAVED</b>  <code>#${link.id}</code>${fav}\n\n` +
    `📌 <b>${escapeHtml(link.title)}</b>\n` +
    `🌐 ${escapeHtml(link.domain)}\n` +
    (link.description ? `📝 ${escapeHtml(link.description)}\n` : "") +
    `📂 ${escapeHtml(link.category)}${tags}` +
    note
  );
}