// # Styles mixin
// The styles mixin contains most of the code required for the [Gradient](../factory/gradient.html) and [RadialGradient](../factory/radialGradient.html) styles factories. It is not used by the other styles objects ([Color](../factory/color.html), [Pattern](../factory/pattern.html)).
// + the __start__ and __end__ positioning attributes are defined here rather than in the factories
// + gradient-type styles manage their color stops in [Palette factory](../factory/palette.html) objects; that functionality is entirely defined here
//
// The Canvas API CanvasRenderingContext2D interface defines two types of gradient: [linear](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient) and [radial](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient).
// + the `createLinearGradient` method creates a gradient along the line connecting two given coordinates (__start__ and __end__) which are absolute values (measured in pixels) from the &lt;canvas> elements top-left corner
// + the `createRadialGradient` method creates a radial gradient using the size and coordinates of two circles.
//
// Common to both types of gradient is the idea of a start coordinate and an end coordinate, supplied in pixels. 
// + Scrawl-canvas extends this idea so that the coordinates can be supplied as a percentage value (String%) of the host Cell's dimensions. 
// + Furthermore Scrawl-canvas allows each entity that uses a Gradient-type style to indicate whether the reference box should be that of the host Cell, or of the entity itself, through their `lockFillStyleToEntity` and `lockStrokeStyleToEntity` attribute flags.


// #### Imports
import { entity, asset, palette } from '../core/library.js';
import { addStrings, defaultNonReturnFunction, mergeOver, xt, isa_obj, mergeDiscard } from '../core/utilities.js';

import { makeCoordinate } from '../factory/coordinate.js';
import { makePalette } from '../factory/palette.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {


// __start__, __end__ - Gradient-type styles use Coordinate factory Arrays to hold details of their start and end coordinates. The following _pseudo-attributes_ can also be used to reference these values:
// + for the start coordinate, __startX__ and __startY__
// + for the end coordinate, __endX__ and __endY__
// 
// In all cases, the attribute values can be Numbers, which indicate absolute pixel coordinates, or String% values for coordinates calculated relative to either Cell or entity current dimensions 
// + for the `x` coordinate, the Strings __left__, __center__ and __right__ are also supported
// + for the `y` coordinate, the Strings __top__, __center__ and __bottom__ are also supported
        start: null,
        end: null,


// __palette__ - Every gradient requires a Palette object containing color stop instructions
        palette: null,


// __paletteStart__, __paletteEnd__ - We don't need to use the entire palette when building a gradient; we can restrict the palette using these start and end attributes.
        paletteStart: 0,
        paletteEnd: 999,


// The __cyclePalette__ attribute tells the Palette object how to handle situations where the paletteStart value is greater than the paletteEnd value:
// + when false, we reverse the color stops
// + when true, we keep the normal order of color stops and pass through the 1/0 border
        cyclePalette: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.finalizePacketOut = function (copy, items) {

        if (items.colors) copy.colors = items.colors;
        else if (this.palette && this.palette.colors) copy.colors = this.palette.colors;
        else copy.colors = {'0 ': [0,0,0,1], '999 ': [255,255,255,1]};

        return copy;
    };


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.kill = function () {

        let myname = this.name;

        if (this.palette && this.palette.kill) this.palette.kill();

        // Remove style from all entity state objects
        Object.entries(entity).forEach(([name, ent]) => {

            let state = ent.state;

            if (state) {

                let fill = state.fillStyle,
                    stroke = state.strokeStyle;

                if (isa_obj(fill) && fill.name === myname) state.fillStyle = state.defs.fillStyle;
                if (isa_obj(stroke) && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
            }
        });
        
        // Remove style from the Scrawl-canvas library
        this.deregister();
        
        return this;
    };


// #### Get, Set, deltaSet
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

// `start`, `startX`, `startY`
    G.startX = function () {

        return this.currentStart[0];
    };
    G.startY = function () {

        return this.currentStart[1];
    };
    S.startX = function (coord) {

        if (coord != null) {

            this.start[0] = coord;
            this.dirtyStart = true;
        }
    };
    S.startY = function (coord) {

        if (coord != null) {

            this.start[1] = coord;
            this.dirtyStart = true;
        }
    };
    S.start = function (x, y) {

        this.setCoordinateHelper('start', x, y);
        this.dirtyStart = true;
    };
    D.startX = function (coord) {

        let c = this.start;
        c[0] = addStrings(c[0], coord);
        this.dirtyStart = true;
    };
    D.startY = function (coord) {

        let c = this.start;
        c[1] = addStrings(c[1], coord);
        this.dirtyStart = true;
    };
    D.start = function (x, y) {

        this.setDeltaCoordinateHelper('start', x, y);
        this.dirtyStart = true;
    };


// `end`, `endX`, `endY`
    G.endX = function () {

        return this.currentEnd[0];
    };
    G.endY = function () {

        return this.currentEnd[1];
    };
    S.endX = function (coord) {

        if (coord != null) {

            this.end[0] = coord;
            this.dirtyEnd = true;
        }
    };
    S.endY = function (coord) {

        if (coord != null) {

            this.end[1] = coord;
            this.dirtyEnd = true;
        }
    };
    S.end = function (x, y) {

        this.setCoordinateHelper('end', x, y);
        this.dirtyEnd = true;
    };
    D.endX = function (coord) {

        let c = this.end;
        c[0] = addStrings(c[0], coord);
        this.dirtyEnd = true;
    };
    D.endY = function (coord) {

        let c = this.end;
        c[1] = addStrings(c[1], coord);
        this.dirtyEnd = true;
    };
    D.end = function (x, y) {

        this.setDeltaCoordinateHelper('end', x, y);
        this.dirtyEnd = true;
    };

// `palette` - argument has to be a Palette object
    S.palette = function (item = {}) {

        if(item.type === 'Palette') this.palette = item;
    };

// `paletteStart` - argument must be a positive integer Number in the range 0 - 999
    S.paletteStart = function (item) {

        if (item.toFixed) {

            this.paletteStart = item;
            
            if(item < 0 || item > 999) this.paletteStart = (item > 500) ? 999 : 0;
        }
    };
    D.paletteStart = function (item) {

        let p;

        if (item.toFixed) {

            p = this.paletteStart + item;

            if (p < 0 || p > 999) {

                if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
                else p = (item > 500) ? 999 : 0;
            }

            this.paletteStart = p;
        }
    };


// `paletteEnd` - argument must be a positive integer Number in the range 0 - 999
    S.paletteEnd = function (item) {

        if (item.toFixed) {

            this.paletteEnd = item;
            
            if (item < 0 || item > 999) this.paletteEnd = (item > 500) ? 999 : 0;
        }
    };

    D.paletteEnd = function (item) {

        let p;

        if (item.toFixed) {

            p = this.paletteEnd + item;

            if (p < 0 || p > 999) {

                if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
                else p = (item > 500) ? 999 : 0;
            }

            this.paletteEnd = p;
        }
    };

// `colors` - We can pass through an array of palette color objects to the Palette object by setting it on the gradient-type styles object
    S.colors = function (item) {

        let p = this.palette;

        if (p && p.colors) p.set({ colors: item });
    };

// `delta` - Gradient-type styles objects support the delta attribute, and can be delta-animated using its attributes
    S.delta = function (items = {}) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };


// #### Prototype functions

// `get` - Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.get = function (item) {

        let getter = this.getters[item];

        if (getter) return getter.call(this);
        else {

            let def = this.defs[item],
                palette = this.palette,
                val;

            if (typeof def !== 'undefined') {

                val = this[item];
                return (typeof val !== 'undefined') ? val : def;
            }

            def = palette.defs[item];

            if (typeof def !== 'undefined') {

                val = palette[item];
                return (typeof val !== 'undefined') ? val : def;
            }
            else return undef;
        }
    };


// `set` - Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.set = function (items = {}) {

        if (items) {

            let setters = this.setters,
                defs = this.defs,
                palette = this.palette,
                paletteSetters = (palette) ? palette.setters : {},
                paletteDefs = (palette) ? palette.defs : {};

            Object.entries(items).forEach(([key, value]) => {

                if (key && key !== 'name' && value != null) {

                    let predefined = setters[key],
                        paletteFlag = false;

                    if (!predefined) {

                        predefined = paletteSetters[key];
                        paletteFlag = true;
                    }

                    if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
                    else if (typeof defs[key] !== 'undefined') this[key] = value;
                    else if (typeof paletteDefs[key] !== 'undefined') palette[key] = value;
                }
            }, this);
        }
        return this;
    };


// `setDelta` - Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.setDelta = function (items = {}) {

        if (items) {

            let setters = this.deltaSetters,
                defs = this.defs,
                palette = this.palette,
                paletteSetters = (palette) ? palette.deltaSetters : {},
                paletteDefs = (palette) ? palette.defs : {};

            Object.entries(items).forEach(([key, value]) => {

                if (key && key !== 'name' && value != null) {

                    let predefined = setters[key],
                        paletteFlag = false;

                    if (!predefined) {

                        predefined = paletteSetters[key];
                        paletteFlag = true;
                    }

                    if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
                    else if (typeof defs[key] != 'undefined') this[key] = addStrings(this[key], value);
                    else if (typeof paletteDefs[key] !== 'undefined') palette[key] = addStrings(this[key], value);
                }
            }, this);
        }
        return this;
    };

// `setCoordinateHelper` - internal helper function
    P.setCoordinateHelper = function (label, x, y) {

        let c = this[label];

        if (Array.isArray(x)) {

            c[0] = x[0];
            c[1] = x[1];
        }
        else {

            c[0] = x;
            c[1] = y;
        }
    };

// `setDeltaCoordinateHelper` - internal helper function
    P.setDeltaCoordinateHelper = function (label, x, y) {

        let c = this[label],
            myX = c[0],
            myY = c[1];

        if (Array.isArray(x)) {

            c[0] = addStrings(myX, x[0]);
            c[1] = addStrings(myY, x[1]);
        }
        else {

            c[0] = addStrings(myX, x);
            c[1] = addStrings(myY, y);
        }
    };

// `updateByDelta` - manually force the gradient-type styles object to update its attributes by the values supplied in its delta attribute
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        return this;
    };

// `stylesInit` - common functionality invoked by gradient-type factory constructors
    P.stylesInit = function (items = {}) {

        this.makeName(items.name);
        this.register();

        this.gradientArgs = [];

        this.start = makeCoordinate();
        this.end = makeCoordinate();

        this.currentStart = makeCoordinate();
        this.currentEnd = makeCoordinate();

        this.palette = makePalette({
            name: `${this.name}_palette`,
        });

        this.delta = {};

        this.set(this.defs);

        this.set(items);
    };


// `getData` - Every styles object (Gradient, RadialGradient, Pattern, Color, Cell) needs to include a __getData__ function. This is invoked by Cell objects during the Display cycle `compile` step, when it takes an entity State object and updates its &lt;canvas> element's context engine to bring it into alignment with requirements.
    P.getData = function (entity, cell, isFill) {

        // Step 1: see if the palette is dirty, from having colors added/deleted/changed
        if(this.palette && this.palette.dirtyPalette) this.palette.recalculate();

        // Step 2: recalculate current start and end points
        this.cleanStyle(entity, cell, isFill);

        // Step 3: finalize the coordinates to use for creating the gradient in relation to the current entity's position and requirements on the canvas
        this.finalizeCoordinates(entity, isFill);

        // Step 4: create, populate and return gradient/pattern object
        return this.buildStyle(cell);
    };

// `cleanStyle` - internal function invoked as part of the gradient-type object's `getData` function. The style has to be cleaned every time it is applied to a Cell's engine because it can never know which Cell is invoking it, or for which entity it is to be used.
    P.cleanStyle = function (entity = {}, cell = {}, isFill) {

        let dims, w, h, scale;

        if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {

            dims = entity.currentDimensions;
            scale = entity.currentScale;

            w = dims[0] * scale; 
            h = dims[1] * scale; 
        }
        else {

            dims = cell.currentDimensions;
            w = dims[0]; 
            h = dims[1]; 
        }

        this.cleanPosition(this.currentStart, this.start, [w, h]);
        this.cleanPosition(this.currentEnd, this.end, [w, h]);
        this.cleanRadius(w);
    };

// `cleanPosition` - internal function invoked as part of the gradient-type object's `cleanStyle` function.
    P.cleanPosition = function (current, source, dimensions) {

        let val, dim;

        for (let i = 0; i < 2; i++) {

            val = source[i];
            dim = dimensions[i];

            if (val.toFixed) current[i] = val;
            else if (val === 'left' || val === 'top') current[i] = 0;
            else if (val === 'right' || val === 'bottom') current[i] = dim;
            else if (val === 'center') current[i] = dim / 2;
            else current[i] = (parseFloat(val) / 100) * dim;
        }
    };

// `finalizeCoordinates` - internal function invoked as part of the gradient-type object's `getData` function.
    P.finalizeCoordinates = function (entity = {}, isFill) {

        let currentStart = this.currentStart,
            currentEnd = this.currentEnd,
            entityStampPosition = entity.currentStampPosition,
            entityStampHandlePosition = entity.currentStampHandlePosition,
            entityScale = entity.currentScale,
            correctX, correctY;

        if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {

            correctX = -(entityStampHandlePosition[0] * entityScale) || 0; 
            correctY = -(entityStampHandlePosition[1] * entityScale) || 0; 
        }
        else {

            correctX = -entityStampPosition[0] || 0; 
            correctY = -entityStampPosition[1] || 0; 
        }

        if (entity.flipReverse) correctX = -correctX;
        if (entity.flipUpend) correctY = -correctY;

        this.updateGradientArgs(correctX, correctY);
    };


// `cleanRadius` - overwritten by the RadialGradient factory
    P.cleanRadius = defaultNonReturnFunction;


// `buildStyle` - Just in case something went wrong with loading other styles Factory modules, which must overwrite this function, we can return transparent color here
    P.buildStyle = function (cell) {

        return 'rgba(0,0,0,0)';
    };

// `addStopsToGradient` - internal function, called by the `buildStyle` function (which is overwritten by the Gradient and RadialGradient factories)
    P.addStopsToGradient = function (gradient, start, stop, cycle) {

        if (this.palette) return this.palette.addStopsToGradient(gradient, start, stop, cycle);

        return gradient;
    };

// #### Gradients and color stops
// The [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) uses a rather convoluted way to add color data to a [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) interface object: 
// + the object is created first on the &lt;canvas> context engine where it is to be applied, with __start__ and __end__ coordinates, 
// + then color stops are _individually_ added to it afterwards. 
// + This needs to be done for every gradient applied to a context engine before any fill or stroke operation using that gradient. 
// + And only one gradient may be applied to the context engine at any time.
//
// The specificity of the above requirements - in particular relating to position coordinates - and the inability to update the CanvasGradient beyond adding color stops to it, means that storing these objects for future use is not a useful proposition ... especially in a dynamic environment where we want the gradient to move in-step with an entity, or animate its colors in some way.
//
// Scrawl-canvas overcomes this problem through the use of [Palette objects](../factory/palette.html) which separate a gradient-type style's color-stop data from its positioning data. We treat Canvas API `CanvasGradient` objects as use-once-and-dispose objects, generating them in a just-in-time fashion for each entity's `stamp` operation in the Display cycle.
//
// Palette objects store their color data in a `colors` attribute object:
// ```
// {
//     name: "mygradient_palette",
//     colors: {
//         "0 ": [0, 0, 0, 1],
//         "350 ": [255, 0, 0, 1],
//         "650 ": [0, 0, 255, 1],
//         "999 ": [255, 255, 255, 1],
//         "index-label-between-0-and-999 ": [redValue, greenValue, blueValue, alphaValue]
//     },
// }
// ``` 
// To `set` the Palette object's `colors` object, either when creating the gradient-type style or at some point afterwards, we can use CSS color Strings instead of an array of values for each color. Note that:
// + the color object attribute labels MUST include a space after the String number; and 
// + the number itself must be a positive integer in the range 0-999:
//
// ``` 
// myGradient.set({
//
//     colors: {
//
//         '0 ': 'black',
//         '350 ': 'red',
//         '650 ': 'blue',
//         '999 ': 'white'
//     },
// });
// ``` 
//
// The following __convenience functions__ are supplied to make adding, deleting and managing Palette object color stop data easier than the above:

// `updateColor` - add or update a gradient-type style's Palette object with a color.
// + __index__ - positive integer Number between 0 and 999 inclusive
// + __color__ - CSS color String
    P.updateColor = function (index, color) {

        if (this.palette) this.palette.updateColor(index, color);

        return this;
    };

// `removeColor` - remove a gradient-type style's Palette object color from a specified index
// + __index__ - positive integer number between 0 and 999 inclusive
    P.removeColor = function (index) {

        if (this.palette) this.palette.removeColor(index);

        return this;
    };

// Return the prototype
    return P;
};
