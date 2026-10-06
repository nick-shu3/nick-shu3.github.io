'use strict';
(function (root) {
  const stages = [{
    id: 1, title: '木もれびの広場', width: 360, height: 480,
    drawSeconds: 5, defendSeconds: 10, lineWidth: 7,
    targets: [{ x: 180, y: 350, radius: 18 }],
    nest: { x: 180, y: 68, radius: 28 },
    bees: { count: 4, radius: 8, speed: 95 }, obstacles: []
  }];
  if (typeof module !== 'undefined' && module.exports) module.exports = stages;
  else root.HachiyokeStages = stages;
})(typeof globalThis === 'undefined' ? this : globalThis);
