// const compareImages = require('resemblejs/compareImages');
const resemble = require('resemblejs');

resemble.outputSettings({ useCrossOrigin: false });

function getDiff(drawing, clue) {
  let diff;
  resemble(drawing).compareTo(clue).ignoreNothing()
    .onComplete((data) => { diff = data; });
  return diff;
}

function getDiffFast(drawing, drawingBaseline, clue) {
  let diff;
  resemble(drawing).compareTo(clue).ignoreNothing().setReturnEarlyThreshold(drawingBaseline)
    .onComplete((data) => { diff = data; });
  return diff;
}
module.exports = { getDiff, getDiffFast };
