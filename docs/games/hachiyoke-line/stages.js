'use strict';
(function (root) {
  const stages = [{
    id: 1, title: '木もれびの広場', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 10, lineWidth: 7,
    targets: [{ x: 180, y: 350, radius: 18 }],
    nest: { x: 180, y: 68, radius: 28 },
    bees: { count: 4, radius: 8, speed: 95 }, obstacles: []
  }, {
    id: 2, title: '斜めの道', hint: '線は290まで。短い線で囲おう。', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 10, lineWidth: 7, maxLength: 290,
    targets: [{ x: 270, y: 345, radius: 18 }],
    nest: { x: 76, y: 72, radius: 28 },
    bees: { count: 6, radius: 8, speed: 105 }, obstacles: []
  }, {
    id: 3, title: 'ふたりの広場', hint: '巣は上下に2つ。7秒でふたりを囲おう。線は650まで。', width: 360, height: 480,
    drawSeconds: 7, defendSeconds: 12, lineWidth: 7, maxLength: 650,
    targets: [{ x: 126, y: 310, radius: 18 }, { x: 234, y: 310, radius: 18 }],
    nests: [{ x: 180, y: 68, radius: 28 }, { x: 180, y: 438, radius: 28 }],
    bees: { count: 7, radius: 8, speed: 108 }, obstacles: []
  }, {
    id: 4, title: '離れたふたり', hint: '8秒で2人を別々に囲おう。線は680まで。', width: 360, height: 480,
    drawSeconds: 8, defendSeconds: 12, lineWidth: 7, maxLength: 680,
    targets: [{ x: 100, y: 235, radius: 18 }, { x: 260, y: 370, radius: 18 }],
    nests: [{ x: 270, y: 70, radius: 28 }, { x: 320, y: 445, radius: 28 }],
    bees: { count: 8, radius: 8, speed: 112 }, obstacles: []
  }, {
    id: 5, title: 'みんなを守れ', hint: '3つの巣から9匹。線は710まで。', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 14, lineWidth: 7, maxLength: 710,
    targets: [{ x: 72, y: 315, radius: 18 }, { x: 180, y: 380, radius: 18 }, { x: 288, y: 315, radius: 18 }],
    nests: [{ x: 180, y: 72, radius: 28 }, { x: 35, y: 440, radius: 28 }, { x: 325, y: 440, radius: 28 }],
    bees: { count: 9, radius: 8, speed: 118 }, obstacles: []
  }];
  if (typeof module !== 'undefined' && module.exports) module.exports = stages;
  else root.HachiyokeStages = stages;
})(typeof globalThis === 'undefined' ? this : globalThis);
