//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------

/**
# scrawlFrame

## Purpose and features

The Frame module adds PerspectiveCell entitys to the core module

* ...

@module scrawlFrame
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'frame')) {
	var scrawl = (function(my) {
		'use strict';
		/**
# window.scrawl

scrawlFrame module adaptions to the Scrawl library object

@class window.scrawl_Frame
**/

		/**
Alias for makeFramePoint()
@method newFramePoint
@deprecated
**/
		my.newFramePoint = function(items) {
			return new my.FramePoint(items);
		};
		/**
A __factory__ function to generate new FramePoint entitys
@method makeFramePoint
@param {Object} items Key:value Object argument for setting attributes
@return FramePoint object
**/
		my.makeFramePoint = function(items) {
			return new my.FramePoint(items);
		};
		/**
Alias for makeFrame()
@method newFrame
@deprecated
**/
		my.newFrame = function(items) {
			return new my.Frame(items);
		};
		/**
A __factory__ function to generate new Frame entitys
@method makeFrame
@param {Object} items Key:value Object argument for setting attributes
@return Frame object
**/
		my.makeFrame = function(items) {
			return new my.Frame(items);
		};

		/**
# FramePoint

## Instantiation

* scrawl.makeFramePoint()

## Purpose

* Defines the corner points for a Frame entity

## Access

* none - like Vectors, only stored locally

@class FramePoint
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.FramePoint = function FramePoint(items) {
			var get = my.xtGet,
			vec = my.makeVector;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.host = get(items.host, false);
			this.data = get(items.data, false);
			this.reference = get(items.reference, false);
			this.lock = get(items.lock, false);
			this.pivot = get(items.pivot, false);
			this.path = get(items.path, false);
			this.pathPlace = get(items.pathPlace, false);
			this.deltaPathPlace = get(items.deltaPathPlace, false);
			this.pathSpeedConstant = get(items.pathSpeedConstant, false);
			this.local = vec({
				name: this.name + '_local'
			});
			this.work = {
				local: vec({
					name: this.name + '_work.local'
				})
			};
			this.setReference();
			this.setLocal();
		};
		my.FramePoint.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'FramePoint'
@final
**/
		my.FramePoint.prototype.type = 'FramePoint';
		my.d.FramePoint = {
			host: false,
			data: false,
			reference: false,
			pivot: false,
			lock: false,
			local: {
				x: 0,
				y: 0,
				z: 0
			},
			path: false,
			pathPlace: false,
			deltaPathPlace: false,
			pathSpeedConstant: false,
			work: {
				local: {
					x: 0,
					y: 0,
					z: 0
				}
			}
		};
		my.mergeInto(my.d.FramePoint, my.d.Base);
		/**
@method get
@param {String} item Name of attribute to return
@return attribute
**/
		my.FramePoint.prototype.get = function(item) {
			if (!item) {
				this.work.local.set(this.local);
				return this.work.local;
			}
			else {
				return my.Base.get.call(this, items);
			}
		};
		/**
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.FramePoint.prototype.set = function(items) {
			var get = my.xtGet;
			this.host = get(items.host, this.host);
			this.data = get(items.data, this.data);
			this.pivot = get(items.pivot, this.pivot);
			this.path = get(items.path, this.path);
			this.lock = get(items.lock, this.lock);
			this.pathPlace = get(items.pathPlace, this.pathPlace);
			this.deltaPathPlace = get(items.deltaPathPlace, this.deltaPathPlace);
			this.pathSpeedConstant = get(items.pathSpeedConstant, this.pathSpeedConstant);
			this.setReference();
			this.setLocal();
			return this;
		};
		/**
@method setReference
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setReference = function() {
			if (this.data) {
				this.reference = 'data';
			}
			else if (this.lock) {
				this.reference = 'lock';
			}
			else if (this.path && my.contains(my.entitynames, this.path)) {
				this.reference = 'entity';
			}
			else if (this.pivot) {
				if (my.contains(my.entitynames, this.pivot)) {
					this.reference = 'entity';
				}
				else if (my.contains(my.cellnames, this.pivot)) {
					this.reference = 'cell';
				}
				else if (my.contains(my.pointnames, this.pivot)) {
					this.reference = 'point';
				}
				else if (my.stack && my.contains(my.stacknames, this.pivot)) {
					this.reference = 'stack';
				}
				else if (my.pad && my.contains(my.padnames, this.pivot)) {
					this.reference = 'pad';
				}
				else if (my.element && my.contains(my.elementnames, this.pivot)) {
					this.reference = 'element';
				}
				else if (my.particle && my.contains(my.particlenames, this.pivot)) {
					this.reference = 'particle';
				}
				else {
					this.reference = false;
				}
			}
			else {
				this.reference = false;
			}
			return this;
		};
		/**
@method setLocal
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocal = function() {
			if (this.reference === 'data') {
				this.setLocalFromData();
			}
			else if (this.reference === 'lock') {
				// do nothing - it's up to the entity to set the local value;
			}
			else if (this.path) {
				this.setLocalFromPath();
			}
			else if (this.pivot) {
				switch (this.reference) {
					case 'point':
						this.local = my.point[this.pivot].local;
						break;
					case 'particle':
						this.local = my.particle[this.pivot].place;
						break;
					default:
						this.local = my[this.reference][this.pivot].start;
				}
			}
			return this;
		};
		/**
Data should always be an array in the form [x, y, z]
@method setLocalFromData
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromData = function() {
			var cell = my.cell[my.group[my.entity[this.host].group].cell],
				local = this.local,
				data = this.data,
				setlocal = this.setLocalFromDataString;
			if (Array.isArray(this.data)) {
				local.x = (data[0].toFixed) ? data[0] : setlocal(data[0], cell.actualWidth);
				local.y = (data[1].toFixed) ? data[1] : setlocal(data[1], cell.actualHeight);
			}
			return this;
		};
		/**
@method setLocalFromDataString
@param {String} item percentage string or string position value
@param {Number} dimension Host's cell's actualWidth or actualHeight
@return Number calculated position value
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromDataString = function(item, dimension) {
			switch (item) {
				case 'top':
				case 'left':
					return 0;
				case 'right':
				case 'bottom':
					return dimension;
				case 'center':
					return dimension / 2;
				default:
					return (parseFloat(item) / 100) * dimension;
			}
		};
		/**
@method setLocalFromPath
@return This
@chainable
@private
**/
		my.FramePoint.prototype.setLocalFromPath = function() {
			return this;
		};

		/**
# Frame

## Instantiation

* scrawl.Frame()

## Purpose

* ...

## Access

* scrawl.entity.FRAMENAME - for the Frame entity object

@class Frame
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Frame = function Frame(items) {
			var vec = my.makeVector,
				get = my.xtGet;
			my.Base.call(this, items);
			items = my.safeObject(items);

			this.cornersDataArrayOrder = my.xtGet(items.cornersDataArrayOrder, ['tlx', 'tly', 'trx', 'try', 'brx', 'bry', 'blx', 'bly']);

			this.topLeft = false;
			this.topRight = false;
			this.bottomRight = false;
			this.bottomLeft = false;

			this.width = 1;
			this.height = 1;
			this.localWidth = 1;
			this.localHeight = 1;
			this.start = vec();
			this.work = {
				start: vec()
			};

			this.source = get(items.source, false);
			this.sourceType = false;
			this.cell = document.createElement('canvas');
			this.engine = this.cell.getContext('2d');

			this.interferenceLoops = get(items.interferenceLoops, 2);
			this.interferenceFactor = get(items.interferenceFactor, 1.03);

			this.method = get(items.method, 'fill');
			this.visibility = get(items.visibility, true);
			this.order = get(items.order, 0);

			this.globalAlpha = get(items.globalAlpha, 1);
			this.globalCompositeOperation = get(items.globalCompositeOperation, 'source-over');

			this.lineWidth = get(items.lineWidth, 1);
			this.lineCap = get(items.lineCap, 'butt');
			this.lineJoin = get(items.lineJoin, 'miter');
			this.lineDash = get(items.lineDash, []);
			this.lineDashOffset = get(items.lineDashOffset, 0);
			this.miterLimit = get(items.miterLimit, 10);
			this.strokeStyle = get(items.strokeStyle, '#000000');
			this.shadowOffsetX = get(items.shadowOffsetX, 0);
			this.shadowOffsetY = get(items.shadowOffsetY, 0);
			this.shadowBlur = get(items.shadowBlur, 0);
			this.shadowColor = get(items.shadowColor, '#000000');

			this.group = my.Entity.prototype.getGroup.call(this, items);

			my.Entity.prototype.registerInLibrary.call(this, items);
			my.pushUnique(my.group[this.group].entitys, this.name);

			this.lockFrameTo = get(items.lockFrameTo, false);
			this.lockElementAttributes = {};

			this.setCorners(items);
			this.setEngine(this);
			this.filtersEntityInit(items);

			this.redraw = true;

			return this;
		};
		my.Frame.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Frame'
@final
**/
		my.Frame.prototype.type = 'Frame';
		my.Frame.prototype.classname = 'entitynames';
		my.d.Frame = {
			topLeft: false,
			topRight: false,
			bottomRight: false,
			bottomLeft: false,
			width: 1,
			height: 1,
			localWidth: 1,
			localHeight: 1,
			start: false,
			method: 'fill',
			visibility: true,
			order: 0,
			lockFrameTo: false,
			lockElementAttributes: false,
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
			lineWidth: 1,
			lineCap: 'butt',
			lineJoin: 'miter',
			lineDash: [],
			lineDashOffset: 0,
			miterLimit: 10,
			strokeStyle: '#000000',
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			shadowBlur: 0,
			shadowColor: '#000000',
			source: false,
			sourceType: false,
			cell: false,
			engine: false,
			filters: [],
			filterOnStroke: false,
			pivot: false,
			mouseIndex: 'mouse',
			flipReverse: false,
			flipUpend: false,
			lockX: false,
			lockY: false,
			group: false,
			redraw: false,
			interferenceLoops: 2,
			interferenceFactor: 1.03,
			work: {
				start: false
			}
		};
		my.mergeInto(my.d.Frame, my.d.Base);
		/**
Frame.registerInLibrary hook function - modified by collisions extension
@method collisionsEntityRegisterInLibrary
@private
**/
		my.Frame.prototype.collisionsEntityRegisterInLibrary = function(items) {
			return my.Entity.prototype.collisionsEntityRegisterInLibrary.call(this, items);
		};
		/**
Augments Base.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Frame.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.setCorners(items);
			this.setEngine(items);
			this.redraw = true;
			return this;
		};
		/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Frame.prototype.clone = function(items) {
			var c = my.Base.prototype.clone.call(this, items);
			c.setLockElementAttributes(my.mergeOver(this.lockElementAttributes, my.safeObject(items)));
			c.setCorners(items);
			return c;
		};
		/**
@method setCorners
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Frame.prototype.setCorners = function(items) {
			var i,
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				cornersX = ['tlx', 'trx', 'brx', 'blx'],
				cornersY = ['tly', 'try', 'bry', 'bly'],
				corner,
				temp,
				makeFramePoint = my.makeFramePoint,
				get = my.xtGet,
				order = this.cornersDataArrayOrder;

			items = my.safeObject(items);
			for (i = 0; i < 4; i++) {
				temp = {};
				corner = corners[i];
				if (!this[corner]) {
					this[corner] = makeFramePoint({
						name: this.name + '_' + corner,
						host: this.name,
					});
				}
				if (items.cornersData && Array.isArray(items.cornersData)) {
					temp.data = [
						get(items.cornersData[order.indexOf(cornersX[i])], this[corner].local.x, 0),
						get(items.cornersData[order.indexOf(cornersY[i])], this[corner].local.y, 0)
					];
					this[corner].set(temp);
				}
				else if (items.lockFrameTo) {
					temp.lock = items.lockFrameTo;
					this[corner].set(temp);
				}
				else {
					temp.path = get(items[corner + 'Path'], this[corner].path);
					temp.pathPlace = get(items[corner + 'PathPlace'], this[corner].pathPlace);
					temp.deltaPathPlace = get(items[corner + 'DeltaPathPlace'], this[corner].deltaPathPlace);
					temp.pathSpeedConstant = get(items[corner + 'PathSpeedConstant'], this[corner].pathSpeedConstant);
					temp.pivot = get(items[corner + 'Pivot'], this[corner].pivot);
					this[corner].set(temp);
				}
			}
			if (items.lockFrameTo || this.lockFrameTo) {
				this.lockOn(items);
			}
			return this;
		};
		/**
@method setEngine
@private
**/
		my.Frame.prototype.setEngine = function(items) {
			var design, strokeStyle,
				e = this.engine;
			if (items.lineWidth) {
				e.lineWidth = items.lineWidth;
			}
			if (items.lineCap) {
				e.lineCap = items.lineCap;
			}
			if (items.lineJoin) {
				e.lineJoin = items.lineJoin;
			}
			if (items.lineDash) {
				e.mozDash = items.lineDash;
				e.lineDash = items.lineDash;
				if (e.setLineDash) {
					e.setLineDash(items.lineDash);
				}
			}
			if (items.lineDashOffset) {
				e.mozDashOffset = items.lineDashOffset;
				e.lineDashOffset = items.lineDashOffset;
			}
			if (items.miterLimit) {
				e.miterLimit = items.miterLimit;
			}
			if (items.shadowOffsetX) {
				e.shadowOffsetX = items.shadowOffsetX;
			}
			if (items.shadowOffsetY) {
				e.shadowOffsetY = items.shadowOffsetY;
			}
			if (items.shadowBlur) {
				e.shadowBlur = items.shadowBlur;
			}
			if (items.shadowColor) {
				e.shadowColor = items.shadowColor;
			}
			if (items.strokeStyle) {
				design = my.design[items.strokeStyle];
				if (my.xt(design)) {
					if (my.contains(['Gradient', 'RadialGradient', 'Pattern'], design.type)) {
						design.update(this.name, my.group[this.group].cell);
					}
					strokeStyle = design.getData();
				}
				else {
					strokeStyle = items.strokeStyle;
				}
				this.engine.strokeStyle = strokeStyle;
			}
			return this;
		};
		/**
@method setDestinationEngine
@private
**/
		my.Frame.prototype.setDestinationEngine = function(ctx, cellname, cell) {
			var design, strokeStyle,
				record = my.ctx[cellname];
			if (record.lineWidth != this.lineWidth) {
				ctx.lineWidth = this.lineWidth;
				record.lineWidth = this.lineWidth;
			}
			if (record.lineCap != this.lineCap) {
				ctx.lineCap = this.lineCap;
				record.lineCap = this.lineCap;
			}
			if (record.lineJoin != this.lineJoin) {
				ctx.lineJoin = this.lineJoin;
				record.lineJoin = this.lineJoin;
			}
			if (record.lineDash != this.lineDash) {
				ctx.mozDash = this.lineDash;
				ctx.lineDash = this.lineDash;
				if (ctx.setLineDash) {
					ctx.setLineDash(this.lineDash);
				}
				record.lineDash = this.lineDash;
			}
			if (record.lineDashOffset != this.lineDashOffset) {
				ctx.mozDashOffset = this.lineDashOffset;
				ctx.lineDashOffset = this.lineDashOffset;
				record.lineDashOffset = this.lineDashOffset;
			}
			if (record.miterLimit != this.miterLimit) {
				ctx.miterLimit = this.miterLimit;
				record.miterLimit = this.miterLimit;
			}
			if (record.shadowOffsetX != this.shadowOffsetX) {
				ctx.shadowOffsetX = this.shadowOffsetX;
				record.shadowOffsetX = this.shadowOffsetX;
			}
			if (record.shadowOffsetY != this.shadowOffsetY) {
				ctx.shadowOffsetY = this.shadowOffsetY;
				record.shadowOffsetY = this.shadowOffsetY;
			}
			if (record.shadowBlur != this.shadowBlur) {
				ctx.shadowBlur = this.shadowBlur;
				record.shadowBlur = this.shadowBlur;
			}
			if (record.shadowColor != this.shadowColor) {
				ctx.shadowColor = this.shadowColor;
				record.shadowColor = this.shadowColor;
			}
			if (record.strokeStyle != this.strokeStyle) {
				if (my.xt(my.design[this.strokeStyle])) {
					design = my.design[this.strokeStyle];
					if (my.contains(['Gradient', 'RadialGradient', 'Pattern'], design.type)) {
						design.update(this.name, my.group[this.group].cell);
					}
					strokeStyle = design.getData();
				}
				else {
					strokeStyle = this.strokeStyle;
				}
				ctx.strokeStyle = strokeStyle;
				record.strokeStyle = this.strokeStyle;
			}
			return this;
		};
		/**
@method lockOn
@private
**/
		my.Frame.prototype.lockOn = function(items) {
			var so = my.safeObject,
				lockFrameTo = this.lockFrameTo,
				el = my.xtGet(so(my.stack)[lockFrameTo], so(my.pad)[lockFrameTo], so(my.element)[lockFrameTo], false),
				corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				corner,
				parent, stack, temp,
				i;
			if (!el) {
				temp = document.createElement('div');
				temp.id = lockFrameTo;
				parent = my.pad[my.cell[my.group[this.group].cell].pad].group;
				if (parent) {
					stack = my.stack[parent];
					document.body.appendChild(temp);
					el = stack.addElementById(lockFrameTo);
					el.set({
						translateZ: stack.get('translateZ') - 1
					});
				}
			}
			if (el) {
				if (!el.topLeft) {
					el.addCornerTrackers();
				}
				this.setLockElementAttributes(items);
				el.set(this.lockElementAttributes);
				for (i = 0; i < 4; i++) {
					corner = corners[i];
					this[corner].local = el[corner];
				}
			}
		};
		/**
@method setLockElementAttributes
@private
**/
		my.Frame.prototype.setLockElementAttributes = function(items) {
			var keys = Object.keys(items),
				key,
				whitelist = ['start', 'startX', 'startY', 'handle', 'handleX', 'handleY', 'deltaStart', 'deltaStartX', 'deltaStartY', 'deltaHandle', 'deltaHandleX', 'deltaHandleY', 'width', 'height', 'scale', 'deltaScale', 'deltaRoll', 'deltaPitch', 'deltaYaw', 'roll', 'pitch', 'yaw', 'includeCornerTrackers', 'pivot', 'path', 'pathPlace', 'deltaPathPlace', 'pathSpeedConstant', 'translate', 'translateX', 'translateY', 'translateZ', 'mouseIndex'],
				i, iz,
				cont = my.contains,
				lea = this.lockElementAttributes;
			for (i = 0, iz = keys.length; i < iz; i++) {
				key = keys[i];
				if (cont(whitelist, key)) {
					lea[key] = items[key];
				}
			}
			return this;
		};
		/**
@method forceStamp
@private
**/
		my.Frame.prototype.forceStamp = function(method, cellname, cell) {
			var temp = this.visibility;
			this.visibility = true;
			this.stamp(method, cell);
			this.visibility = temp;
			return this;
		};
		/**
@method stamp
@private
**/
		my.Frame.prototype.stamp = function(method, cellname, cell) {
			var dCell = (cell) ? cell : my.group[this.group].cell,
				dName = dCell.name,
				dCtx = my.context[dName],
				dMethod = (method) ? method : this.method;
			if (this.visibility) {
				if (this.redraw) {
					this.redrawCanvas();
				}
				this[dMethod](dCtx, dName, dCell);
				this.stampFilter(dCtx, dName, dCell);
			}
			return this;
		};
		/**
Entity constructor hook function - modified by filters module
@method filtersEntityInit
@private
**/
		my.Frame.prototype.filtersEntityInit = function(items) {
			my.Entity.prototype.filtersEntityInit.call(this, items);
		};
		/**
Entity.stamp hook function - add a filter to an Entity, and any background detail enclosed by the Entity
@method stampFilter
@private
**/
		my.Frame.prototype.stampFilter = function(engine, cellname, cell) {
			my.Entity.prototype.stampFilter.call(this, engine, cellname, cell);
		};
		/**
Entity.stamp hook helper function
@method stampFilterDefault
@private
**/
		my.Frame.prototype.stampFilterDefault = function(entity, engine, cellname, cell) {
			return my.Entity.prototype.stampFilterDefault.call(this, entity, engine, cellname, cell);
		};
		/**
@method redrawCanvas
@private
**/
		my.Frame.prototype.redrawCanvas = function() {
			var tlx = this.topLeft.local.x,
				tly = this.topLeft.local.y,
				trx = this.topRight.local.x,
				tryy = this.topRight.local.y,
				brx = this.bottomRight.local.x,
				bry = this.bottomRight.local.y,
				blx = this.bottomLeft.local.x,
				bly = this.bottomLeft.local.y,
				min = Math.min,
				max = Math.max,
				ceil = Math.ceil,
				floor = Math.floor,
				xmin = min.apply(Math, [tlx, trx, brx, blx]),
				ymin = min.apply(Math, [tly, tryy, bry, bly]),
				xmax = max.apply(Math, [tlx, trx, brx, blx]),
				ymax = max.apply(Math, [tly, tryy, bry, bly]),
				width = xmax - xmin || 1,
				height = ymax - ymin || 1,
				dim = max.apply(Math, [width, height]),
				maxDim = ceil(dim),
				minDim = floor(dim),
				src = my.xtGet(my.asset[this.source], my.canvas[this.source], false), //must be an image, canvas or video
				i, sx, sy, ex, ey, len, angle, val, fw, fh,
				cv = my.cv,
				cvx = my.cvx,
				getPos = this.getPosition,
				iFac = this.interferenceFactor,
				cell = this.cell;

			this.width = width;
			this.localWidth = width;
			this.height = height;
			this.localHeight = height;
			this.start.x = xmin;
			this.start.y = ymin;
			if (src && my.contains(['fill', 'drawFill', 'fillDraw', 'sinkInto', 'floatOver'], this.method)) {
				cell.width = ceil(width);
				cell.height = ceil(height);
				cv.width = maxDim;
				cv.height = maxDim;
				cvx.drawImage(src, 0, 0, src.width, src.height, 0, 0, minDim, minDim);
				for (i = 0; i <= minDim; i++) {
					val = i / minDim;
					sx = getPos(tlx, blx, val) - xmin;
					sy = getPos(tly, bly, val) - ymin;
					ex = getPos(trx, brx, val) - xmin;
					ey = getPos(tryy, bry, val) - ymin;
					len = this.getLength(sx, sy, ex, ey);
					angle = this.getAngle(sx, sy, ex, ey);

					this.setEasel(sx, sy, angle);
					this.engine.drawImage(cv, 0, i, minDim, 1, 0, 0, len, 1);
					this.resetEasel();
				}
				fw = ceil(width);
				fh = ceil(height);
				for (i = 0; i < this.interferenceLoops; i++) {
					fw = ceil(fw * iFac);
					fh = ceil(fh * iFac);
					cv.width = fw;
					cv.height = fh;
					cvx.drawImage(cell, 0, 0, cell.width, cell.height, 0, 0, fw, fh);
					this.engine.drawImage(cv, 0, 0, fw, fh, 0, 0, cell.width, cell.height);
				}
				this.redraw = false;
			}
			return this;
		};
		/**
@method getPosition
@private
**/
		my.Frame.prototype.getPosition = function(a, b, v) {
			return ((b - a) * v) + a;
		};
		/**
@method getLength
@private
**/
		my.Frame.prototype.getLength = function(xa, ya, xb, yb) {
			return Math.sqrt(Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2));
		};
		/**
@method getAngle
@private
**/
		my.Frame.prototype.getAngle = function(xa, ya, xb, yb) {
			return Math.atan2(ya - yb, xa - xb);
		};
		/**
@method setEasel
@private
**/
		my.Frame.prototype.setEasel = function(x, y, a) {
			var cos = Math.cos(a),
				sin = Math.sin(a);
			this.engine.setTransform(-cos, -sin, sin, -cos, x, y);
		};
		/**
@method resetEasel
@private
**/
		my.Frame.prototype.resetEasel = function() {
			this.engine.setTransform(1, 0, 0, 1, 0, 0);
		};
		/**
Stamp helper function - clear shadow parameters during a multi draw operation (drawFill and fillDraw methods)
@method clearShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Frame.prototype.clearShadow = function(ctx, cellname, cell) {
			if (this.shadowOffsetX || this.shadowOffsetY || this.shadowBlur) {
				// cell = (cell.substring) ? my.cell[cell] : cell;
				cell.clearShadow();
			}
			return this;
		};
		/**
@method prepareStamp
@private
**/
		my.Frame.prototype.prepareStamp = function(ctx, cellname, cell) {
			this.setDestinationEngine(ctx, cellname, cell);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		};
		/**
@method drawPath
@private
**/
		my.Frame.prototype.drawPath = function(ctx, cellname, cell) {
			var tl = this.topLeft.local,
				tr = this.topRight.local,
				br = this.bottomRight.local,
				bl = this.bottomLeft.local;
			ctx.beginPath();
			ctx.moveTo(tl.x, tl.y);
			ctx.lineTo(tr.x, tr.y);
			ctx.lineTo(br.x, br.y);
			ctx.lineTo(bl.x, bl.y);
			ctx.closePath();
			return this;
		};
		/**
@method drawImage
@private
**/
		my.Frame.prototype.drawImage = function(ctx, cellname, cell) {
			ctx.drawImage(this.cell, this.start.x, this.start.y);
			return this;
		};
		/**
@method clip
**/
		my.Frame.prototype.clip = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.clip();
			return this;
		};
		/**
@method clear
**/
		my.Frame.prototype.clear = function(ctx, cellname, cell) {
			var engine = my.ctx[cellname];
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = '#000000';
			ctx.strokeStyle = '#000000';
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = engine.get('fillStyle');
			ctx.strokeStyle = engine.get('strokeStyle');
			ctx.globalCompositeOperation = engine.get('globalCompositeOperation');
			return this;
		};
		/**
@method clearWithBackground
**/
		my.Frame.prototype.clearWithBackground = function(ctx, cellname, cell) {
			var engine = my.ctx[cellname],
				color = my.cell[cellname].get('backgroundColor');
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = engine.get('fillStyle');
			ctx.strokeStyle = engine.get('strokeStyle');
			ctx.globalCompositeOperation = engine.get('globalCompositeOperation');
			return this;
		};
		/**
@method draw
**/
		my.Frame.prototype.draw = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			return this;
		};
		/**
@method fill
**/
		my.Frame.prototype.fill = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			return this;
		};
		/**
@method drawFill
**/
		my.Frame.prototype.drawFill = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			this.clearShadow(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			return this;
		};
		/**
@method fillDraw
**/
		my.Frame.prototype.fillDraw = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			this.clearShadow(ctx, cellname, cell);
			ctx.stroke();
			return this;
		};
		/**
@method sinkInto
**/
		my.Frame.prototype.sinkInto = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawImage(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			return this;
		};
		/**
@method floatOver
**/
		my.Frame.prototype.floatOver = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			ctx.stroke();
			this.drawImage(ctx, cellname, cell);
			return this;
		};
		/**
@method none
**/
		my.Frame.prototype.none = function(ctx, cellname, cell) {
			this.prepareStamp(ctx, cellname, cell);
			this.drawPath(ctx, cellname, cell);
			return this;
		};
		/**
@method checkHit
**/
		my.Frame.prototype.checkHit = function(items) {
			items = my.safeObject(items);
			var tests = (my.xt(items.tests)) ? items.tests : [(items.x || false), (items.y || false)],
				result = false,
				cvx = my.cvx;
			cvx.setTransform(1, 0, 0, 1, 0, 0);
			this.drawPath(cvx);
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = cvx.isPointInPath(tests[i], tests[i + 1]);
				if (result) {
					items.x = tests[i];
					items.y = tests[i + 1];
					break;
				}
			}
			return (result) ? items : false;
		};

		/**
reciprocal assignment - also occurs in scrawlFilters as there's no way to tell which file (scrawlFrame, scrawlFilters) will be loaded first
@method stampFilterActions
@private
**/
		if (my.Entity.prototype.stampFilterActions) {
			my.Frame.prototype.stampFilterActions = my.Entity.prototype.stampFilterActions;
		}


		return my;
	}(scrawl));
}
