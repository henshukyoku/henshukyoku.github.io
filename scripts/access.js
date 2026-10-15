/* 時刻表のHTMLを読み取り、日本時間の運行日に次の便を表示する。 */
(() => {
  const schedules = [...document.querySelectorAll('[data-bus-schedule]')].map(card => ({
    date: card.dataset.operatingDate,
    status: card.querySelector('.access-next-time'),
    cells: [...card.querySelectorAll('[data-departure]')],
  }));

  function update() {
    const now = new Date();
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now).map(part => [part.type, part.value]));
    const today = `${parts.year}-${parts.month}-${parts.day}`;
    schedules.forEach(({ date, status, cells }) => {
      cells.forEach(cell => {
        cell.classList.remove('is-next');
        cell.removeAttribute('aria-current');
      });
      let message;
      if (today < date) {
        const [hour, minute] = cells[0].dataset.departure.split(':');
        message = `${Number(hour)}時${minute}分`;
      } else if (today > date) {
        message = '運行は終了しました';
      } else {
        const next = cells.find(cell => new Date(`${date}T${cell.dataset.departure}:00+09:00`).getTime() >= now.getTime());
        if (next) {
          const remaining = Math.ceil((new Date(`${date}T${next.dataset.departure}:00+09:00`).getTime() - now.getTime()) / 60000);
          const [hour, minute] = next.dataset.departure.split(':');
          message = `${Number(hour)}時${minute}分 発 · あと${remaining}分`;
          next.classList.add('is-next');
          next.setAttribute('aria-current', 'true');
        } else {
          message = '本日の運行は終了しました';
        }
      }
      if (status.textContent !== message) status.textContent = message;
    });
  }
  update();
  setInterval(update, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();

// ネイティブdialogでフォーカス管理・Escキーによる閉じる操作に対応。
document.querySelectorAll('[data-open-timetable]').forEach(button => {
  const dialog = document.getElementById(button.dataset.openTimetable);
  button.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});

