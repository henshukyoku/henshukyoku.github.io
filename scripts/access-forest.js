/* 丸い葉を持つイラスト調の枝。本文の背後に、下へ行くほど多く配置する。 */
(() => {
  const forest = document.querySelector('.access-forest');
  if (!forest) return;
  const ns = 'http://www.w3.org/2000/svg';
  function svgNode(name, attributes) {
    const node = document.createElementNS(ns, name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  const layout = [
    [2, 'left', 300, .24, -7], [8, 'right', 330, .25, 8],
    [24, 'left', 370, .30, -2], [31, 'right', 390, .30, 5],
    [44, 'left', 410, .34, -9], [50, 'right', 430, .34, 7],
    [60, 'left', 440, .37, 5], [66, 'right', 460, .37, -6],
    [74, 'left', 470, .40, -8], [78, 'right', 490, .40, 6],
    [84, 'left', 450, .40, 12], [88, 'right', 480, .40, -10],
    [94, 'left', 510, .42, -4], [96, 'right', 520, .42, 9],
  ];
  // 丸い葉を枝先にもまとめて、幹と枝分かれが見える木のシルエットに。
  const leaves = [
    [58, 375, -110, 1.04], [80, 355, 8, .9],
    [112, 330, -103, 1.12], [126, 306, 12, .96],
    [160, 275, -100, 1.04], [180, 253, 15, 1.0],
    [211, 222, -93, .96], [237, 204, 19, .87],
    [268, 175, -90, .90], [292, 155, 20, .83],
    [328, 132, -78, .79], [350, 117, 12, .74],
    [384, 99, -35, .76],
    [111, 241, -120, .78], [102, 265, -25, .70],
    [252, 288, -44, .78], [279, 277, 19, .73],
    [62, 292, -125, .68], [65, 285, -42, .76],
    [198, 133, -125, .76], [201, 125, -35, .83],
    [317, 230, -40, .78], [324, 226, 30, .66],
    [335, 65, -112, .68], [341, 61, -24, .72],
  ];
  layout.forEach(([top, side, width, opacity, angle], index) => {
    const branch = document.createElement('div');
    branch.className = `access-sprig access-sprig--${side}`;
    branch.style.setProperty('--branch-top', `${top}%`);
    branch.style.setProperty('--branch-width', `${width}px`);
    branch.style.setProperty('--branch-opacity', opacity);
    branch.style.setProperty('--branch-angle', `${angle}deg`);
    const svg = svgNode('svg', { viewBox: '0 0 460 460', focusable: 'false' });
    const paths = [
      // 根元を太く、先端ほど細くする。丸い節を含む緩やかな曲線。
      ['M-30 428 C34 411 69 381 109 337', 17],
      ['M109 337 Q137 309 166 273 Q205 226 253 191', 11],
      ['M253 191 Q323 136 395 94', 5.5],
      ['M107 339 Q76 325 62 282', 6],
      ['M141 302 Q100 290 108 232', 5],
      ['M190 249 Q230 306 287 272', 5],
      ['M215 221 Q191 178 201 125', 6],
      ['M264 183 Q280 235 326 226', 4],
      ['M319 142 Q324 99 341 61', 3.5],
    ];
    paths.forEach(([d, width]) => svg.append(svgNode('path', { d, 'stroke-width': width, class: 'access-sprig-stem', pathLength: 1 })));
    leaves.forEach(([x, y, rotation, scale], leafIndex) => {
      const anchor = svgNode('g', { transform: `translate(${x} ${y}) rotate(${rotation + (index % 3 - 1) * 6}) scale(${scale})` });
      const leaf = svgNode('g', { class: 'access-sprig-leaf', style: `--leaf-delay:${.25 + (leafIndex % 17) * .055}s` });
      leaf.append(svgNode('path', {
        d: 'M0 0 C8 -29 48 -37 67 -13 C55 14 20 22 0 0Z',
        fill: ['#87ad8c', '#a5bf91', '#6f9e8c', '#b6cba2'][(index + leafIndex) % 4],
        stroke: '#eff5e8', 'stroke-width': 1.6,
      }));
      leaf.append(svgNode('path', { d: 'M5 0 Q30 -7 55 -12', fill: 'none', stroke: '#f4f7ed', 'stroke-width': 1.7, 'stroke-linecap': 'round' }));
      anchor.append(leaf);
      svg.append(anchor);
    });
    // 小さな丸い実を添えて、柔らかな印象に。
    const berries = svgNode('g', { class: 'access-sprig-leaf', style: '--leaf-delay:1s' });
    [[121, 228], [132, 215], [140, 232]].forEach(([cx, cy]) => berries.append(svgNode('circle', { cx, cy, r: 5.5, fill: index % 2 ? '#d8afba' : '#b9c891', stroke: '#fff6ef', 'stroke-width': 1.5 })));
    svg.append(berries);
    branch.append(svg);
    forest.append(branch);
  });
  if (!('IntersectionObserver' in window)) {
    forest.querySelectorAll('.access-sprig').forEach(branch => branch.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px 60px 0px', threshold: 0 });
  forest.querySelectorAll('.access-sprig').forEach(branch => observer.observe(branch));
})();
