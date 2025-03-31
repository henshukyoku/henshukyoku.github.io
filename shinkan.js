document.addEventListener("DOMContentLoaded", function() {
  // 全てのサークルにクリックイベントを設定
  document.querySelectorAll('.circle').forEach(circle => {
    circle.addEventListener('click', () => {
      const modalId = circle.getAttribute('data-modal'); // data-modal属性を取得
      const modal = document.getElementById(modalId);
      modal.style.display = 'flex'; // モーダルを表示
    });
  });

  // 全てのモーダルに閉じるイベントを設定
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      modal.style.display = 'none'; // モーダルを非表示
    });
  });

  // モーダルの背景クリックで閉じる
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none'; // モーダルを非表示
      }
    });
  });
});
