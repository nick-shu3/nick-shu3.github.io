'use strict';
(function (root) {
  const stages = [{
    id: 1, title: '木もれびの広場', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 10, lineWidth: 7,
    targets: [{ x: 180, y: 350, radius: 18 }],
    nest: { x: 180, y: 68, radius: 28 },
    bees: { count: 4, radius: 8, speed: 95 }, obstacles: []
  }, {
    id: 2, title: '斜めの道', hint: '蜂の巣が左上に。守る子の周りを閉じよう。', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 10, lineWidth: 7,
    targets: [{ x: 270, y: 345, radius: 18 }],
    nest: { x: 76, y: 72, radius: 28 },
    bees: { count: 6, radius: 8, speed: 105 }, obstacles: []
  }, {
    id: 3, title: 'ふたりの広場', hint: '2人をまとめて囲ってみよう。', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 12, lineWidth: 7,
    targets: [{ x: 108, y: 345, radius: 18 }, { x: 252, y: 345, radius: 18 }],
    nest: { x: 180, y: 68, radius: 28 },
    bees: { count: 7, radius: 8, speed: 108 }, obstacles: []
  }, {
    id: 4, title: '離れたふたり', hint: '上下に離れた2人。囲いの形を工夫しよう。', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 12, lineWidth: 7,
    targets: [{ x: 100, y: 235, radius: 18 }, { x: 260, y: 370, radius: 18 }],
    nest: { x: 270, y: 70, radius: 28 },
    bees: { count: 8, radius: 8, speed: 112 }, obstacles: []
  }, {
    id: 5, title: 'みんなを守れ', hint: '3人とも守れたら試用版クリア！', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 14, lineWidth: 7,
    targets: [{ x: 72, y: 315, radius: 18 }, { x: 180, y: 380, radius: 18 }, { x: 288, y: 315, radius: 18 }],
    nest: { x: 180, y: 72, radius: 28 },
    bees: { count: 9, radius: 8, speed: 118 }, obstacles: []
  }];
  if (typeof module !== 'undefined' && module.exports) module.exports = stages;
  else root.HachiyokeStages = stages;
})(typeof globalThis === 'undefined' ? this : globalThis);
