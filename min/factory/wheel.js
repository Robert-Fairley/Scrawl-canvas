import { constructors, radian } from '../core/library.js';
import { mergeOver, xt, xto, ensureFloat } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';
const Wheel = function (items = {}) {
if (!xto(items.dimensions, items.width, items.height, items.radius)) items.radius = 5;
this.entityInit(items);
return this;
};
let P = Wheel.prototype = Object.create(Object.prototype);
P.type = 'Wheel';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);
let defaultAttributes = {
radius: 5,
startAngle: 0,
endAngle: 360,
clockwise: true,
includeCenter: false,
closed: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.width = function (val) {
if (val != null) {
let dims = this.dimensions;
dims[0] = dims[1] = val;
this.dimensionsHelper();
}
};
D.width = function (val) {
let dims = this.dimensions;
dims[0] = dims[1] = addStrings(dims[0], val);
this.dimensionsHelper();
};
S.height = function (val) {
if (val != null) {
let dims = this.dimensions;
dims[0] = dims[1] = val;
this.dimensionsHelper();
}
};
D.height = function (val) {
let dims = this.dimensions;
dims[0] = dims[1] = addStrings(dims[0], val);
this.dimensionsHelper();
};
S.dimensions = function (w, h) {
this.setCoordinateHelper('dimensions', w, h);
this.dimensionsHelper();
};
D.dimensions = function (w, h) {
this.setDeltaCoordinateHelper('dimensions', w, h);
this.dimensionsHelper();
}
S.radius = function (val) {
this.radius = val;
this.radiusHelper();
};
D.radius = function (val) {
this.radius = addStrings(this.radius, val);
this.radiusHelper();
};
S.startAngle = function (val) {
this.startAngle = ensureFloat(val, 4);
this.dirtyPathObject = true;
};
D.startAngle = function (val) {
this.startAngle += ensureFloat(val, 4);
this.dirtyPathObject = true;
};
S.endAngle = function (val) {
this.endAngle = ensureFloat(val, 4);
this.dirtyPathObject = true;
};
D.endAngle = function (val) {
this.endAngle += ensureFloat(val, 4);
this.dirtyPathObject = true;
};
S.closed = function (bool) {
if(xt(bool)) {
this.closed = !!bool;
this.dirtyPathObject = true;
}
};
S.includeCenter = function (bool) {
if(xt(bool)) {
this.includeCenter = !!bool;
this.dirtyPathObject = true;
}
};
S.clockwise = function (bool) {
if(xt(bool)) {
this.clockwise = !!bool;
this.dirtyPathObject = true;
}
};
P.dimensionsHelper = function () {
let width = this.dimensions[0];
if (width.substring) this.radius = `${(parseFloat(width) / 2)}%`;
else this.radius = (width / 2);
this.dirtyDimensions = true;
};
P.radiusHelper = function () {
let radius = this.radius,
dims = this.dimensions;
if (radius.substring) dims[0] = dims[1] = (parseFloat(radius) * 2) + '%';
else dims[0] = dims[1] = (radius * 2);
this.dirtyDimensions = true;
};
P.cleanDimensionsAdditionalActions = function () {
let radius = this.radius,
dims = this.currentDimensions,
calculatedRadius = (radius.substring) ? (parseFloat(radius) / 100) * dims[0] : radius;
if (dims[0] !== calculatedRadius * 2) {
dims[1] = dims[0];
this.currentRadius = dims[0] / 2;
}
else this.currentRadius = calculatedRadius;
};
P.calculateSensors = function () {
let rotate = function(coords, angle, sx, sy) {
let [x, y] = coords,
arr = [0, 0];
arr[0] = Math.atan2(y, x);
arr[0] += (angle * 0.01745329251);
arr[1] = Math.sqrt((x * x) + (y * y));
return [Math.round(arr[1] * Math.cos(arr[0])) + sx, Math.round(arr[1] * Math.sin(arr[0])) + sy];
};
let smallRotate = function(x, y, angle) {
let arr = [0, 0];
arr[0] = Math.atan2(y, x);
arr[0] += (angle * 0.01745329251);
arr[1] = Math.sqrt((x * x) + (y * y));
return [Math.round(arr[1] * Math.cos(arr[0])), Math.round(arr[1] * Math.sin(arr[0]))];
};
this.calculatePerimeterLength();
let stamp = this.currentStampPosition,
handle = this.currentStampHandlePosition,
scale = this.currentScale,
radius = this.currentRadius * scale,
startAngle = this.startAngle,
endAngle = this.endAngle,
circumferenceLength = this.circumferenceLength,
circumferenceRatio = this.circumferenceRatio,
upend = this.flipUpend,
reverse = this.flipReverse;
let roll = this.roll,
sx = stamp[0],
sy = stamp[1],
handleX = (reverse) ? -handle[0] * scale : handle[0] * scale,
handleY = (upend) ? -handle[1] * scale : handle[1] * scale;
let sensorSpacing = this.sensorSpacing || 50;
let sensors = this.currentSensors;
sensors.length = 0;
let circumferenceSensors = Math.ceil(circumferenceLength / sensorSpacing);
if (circumferenceRatio < 0.25 && circumferenceSensors < 2) circumferenceSensors = 2;
else if (circumferenceRatio < 0.5 && circumferenceSensors < 4) circumferenceSensors = 4;
else if (circumferenceRatio < 0.75 && circumferenceSensors < 6) circumferenceSensors = 6;
else if (circumferenceSensors < 8) circumferenceSensors = 8;
let partialAngle = (circumferenceRatio * 360) / circumferenceSensors;
if (!this.clockwise) partialAngle = -partialAngle;
if ((reverse && !upend) || (!reverse && upend)) partialAngle = -partialAngle;
if (reverse && !upend) {
if (startAngle <= 180) startAngle = 180 - startAngle;
else startAngle = (180 - startAngle) + 360;
if (endAngle <= 180) endAngle = 180 - endAngle;
else endAngle = (180 - endAngle) + 360;
}
else if (!reverse && upend) {
if (startAngle <= 180) startAngle = 360 - startAngle;
else startAngle = (180 - startAngle) + 180;
if (endAngle <= 180) endAngle = 360 - endAngle;
else endAngle = (180 - endAngle) + 180;
}
else if (reverse && upend) {
startAngle += 180;
endAngle += 180;
if (startAngle > 360) startAngle -= 360;
if (endAngle > 360) endAngle -= 360;
}
let currentAngle = startAngle,
coord, i;
for (i = 0; i <= circumferenceSensors; i++) {
coord = smallRotate(radius, 0, currentAngle);
if (reverse) coord[0] = coord[0] + handleX - radius;
else coord[0] = coord[0] - handleX + radius;
if (upend) coord[1] = coord[1] + handleY - radius;
else coord[1] = coord[1] - handleY + radius;
sensors.push(rotate(coord, roll, sx, sy));
currentAngle += partialAngle;
}
let cx = (reverse) ? handleX - radius : -handleX + radius,
cy = (upend) ? handleY - radius : -handleY + radius,
startCoord = sensors[0],
endCoord = sensors[sensors.length - 1],
nonCircumferenceSensors, nonCircumferenceLength,
centerCoord, dx, dy, plotX, plotY;
if (this.includeCenter) {
sensors.push(rotate([cx, cy], roll, sx, sy));
centerCoord = sensors[sensors.length - 1];
nonCircumferenceLength = radius * 2;
nonCircumferenceSensors = Math.ceil(nonCircumferenceLength / sensorSpacing);
nonCircumferenceSensors = Math.ceil(nonCircumferenceSensors / 2) - 2;
if (nonCircumferenceSensors < 1) nonCircumferenceSensors = 1;
dx = (endCoord[0] - centerCoord[0]) / (nonCircumferenceSensors + 1);
dy = (endCoord[1] - centerCoord[1]) / (nonCircumferenceSensors + 1);
plotX = centerCoord[0];
plotY = centerCoord[1];
for (i = 0; i < nonCircumferenceSensors; i++) {
plotX += dx;
plotY += dy;
sensors.push([plotX, plotY]);
}
}
if (this.closed) {
if (this.includeCenter) {
dx = (startCoord[0] - centerCoord[0]) / (nonCircumferenceSensors + 1);
dy = (startCoord[1] - centerCoord[1]) / (nonCircumferenceSensors + 1);
plotX = centerCoord[0];
plotY = centerCoord[1];
for (i = 0; i < nonCircumferenceSensors; i++) {
plotX += dx;
plotY += dy;
sensors.push([plotX, plotY]);
}
}
else {
dx = endCoord[0] - startCoord[0];
dy = endCoord[1] - startCoord[1];
nonCircumferenceLength = Math.sqrt((dx * dx) + (dy * dy));
nonCircumferenceSensors = Math.ceil(nonCircumferenceLength / sensorSpacing);
nonCircumferenceSensors -= 2;
if (nonCircumferenceSensors < 1) nonCircumferenceSensors = 1;
dx /= (nonCircumferenceSensors + 1);
dy /= (nonCircumferenceSensors + 1);
plotX = startCoord[0];
plotY = startCoord[1];
for (i = 0; i < nonCircumferenceSensors; i++) {
plotX += dx;
plotY += dy;
sensors.push([plotX, plotY]);
}
}
}
};
P.calculatePerimeterLength = function () {
let radius = this.currentRadius * this.currentScale,
circumference = 2 * Math.PI * radius;
let leastAngle = Math.min(this.startAngle, this.endAngle),
starts = this.startAngle - leastAngle,
ends = this.endAngle - leastAngle,
leastDistance = Math.abs(ends - starts),
circumferenceRatio;
if (leastDistance > 360) circumferenceRatio = 1;
if (leastDistance <= 0) circumferenceRatio = 0;
else circumferenceRatio = leastDistance / 360;
if (circumferenceRatio < 1 && this.clockwise) circumferenceRatio = 1 - circumferenceRatio;
let perimeterCircumference = circumference * circumferenceRatio;
this.circumferenceLength = perimeterCircumference;
this.circumferenceRatio = circumferenceRatio;
};
P.cleanPathObject = function () {
this.dirtyPathObject = false;
if (!this.noPathUpdates || !this.pathObject) {
let p = this.pathObject = new Path2D();
let handle = this.currentStampHandlePosition,
scale = this.currentScale,
radius = this.currentRadius * scale,
x = radius - (handle[0] * scale),
y = radius - (handle[1] * scale),
starts = this.startAngle * radian,
ends = this.endAngle * radian;
p.arc(x, y, radius, starts, ends, !this.clockwise);
if (this.includeCenter) {
p.lineTo(x, y);
p.closePath();
}
else if (this.closed) p.closePath();
}
};
const makeWheel = function (items) {
return new Wheel(items);
};
constructors.Wheel = Wheel;
export {
makeWheel,
};
