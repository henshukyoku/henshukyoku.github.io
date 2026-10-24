/* 登録済みの出発時刻と現在時刻（日本時間）から毎秒カウントダウンする。 */
(() => {
  const schedules = [...document.querySelectorAll('[data-bus-schedule]')].map(card => {
    const date = card.dataset.operatingDate;
    return {
      status: card.querySelector('.access-next-time'),
      countdown: card.querySelector('.access-bus-countdown'),
      remaining: card.querySelector('.access-countdown-value'),
      dayEnd: new Date(`${date}T00:00:00+09:00`).getTime() + 86400000,
      departures: [...card.querySelectorAll('[data-departure]')].map(cell => ({
        cell,
        time: cell.dataset.departure,
        timestamp: new Date(`${date}T${cell.dataset.departure}:00+09:00`).getTime(),
      })).sort((a, b) => a.timestamp - b.timestamp),
      currentCell: null,
    };
  });

  function formatRemaining(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const rest = seconds % 60;
    const pad = value => String(value).padStart(2, '0');
    return `${days ? `${days}日 ` : ''}${days || hours ? `${pad(hours)}時間` : ''}${pad(minutes)}分${pad(rest)}秒`;
  }

  function update() {
    const now = Date.now();
    schedules.forEach(schedule => {
      const { status, countdown, remaining, departures, dayEnd } = schedule;
      const next = departures.find(departure => departure.timestamp >= now);
      if (schedule.currentCell !== (next?.cell || null)) {
        schedule.currentCell?.classList.remove('is-next');
        schedule.currentCell?.removeAttribute('aria-current');
        next?.cell.classList.add('is-next');
        next?.cell.setAttribute('aria-current', 'true');
        schedule.currentCell = next?.cell || null;
      }
      let message;
      if (next) {
        const [hour, minute] = next.time.split(':');
        message = `${Number(hour)}時${minute}分 発`;
        const seconds = Math.max(0, Math.ceil((next.timestamp - now) / 1000));
        remaining.textContent = formatRemaining(seconds);
        countdown.hidden = false;
      } else {
        message = now < dayEnd ? '本日の運行は終了しました' : '運行は終了しました';
        countdown.hidden = true;
      }
      // 読み上げは次の便が変わったときだけ。秒数は別要素で静かに更新する。
      if (status.textContent !== message) status.textContent = message;
    });
  }
  update();
  setInterval(update, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('pageshow', update);
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

