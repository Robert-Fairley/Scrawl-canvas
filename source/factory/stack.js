// # Stack factory
// The Scrawl-canvas Stack/Element system is an attempt to supplement DOM elements with Scrawl-canvas entity positioning and dimensioning functionality.
// + Entitys exist in a Cell environment
// + They can position themselves within that Cell either __absolutely__ (px coordinates), or __relatively__ (% coordinates, with values relative to the Cell's dimensions), or __by reference__ (using other entity's coordinates to calculate their own coordinates - `pivot`, `mimic`, `path`)
// + They can also base their dimensions on absolute (px) or relative (%) values
// + They can be __animated__ directly (`set`, `deltaSet`), or through automation (`delta` object), or through the Scrawl-canvas `tween` functionality
// + They can be stored and retrieved ('packet' functionality), cloned ('clone', based on packets) and killed ('kill' functions)
// 
// __A Stack is a wrapper object around a DOM element__, whose direct children are given Scrawl-canvas Element wrappers:
// ```
// Stack    ~~> Canvas/Cell  
// Element  ~~> Entity (eg Block)  
// ```
// During initialization Scrawl-canvas will search the DOM tree and automatically create Stack wrappers for any element which has been given a `data-stack` attribute which resolves to true. Every direct (first level) child inside the stack element will have Element wrappers created for them (except for &lt;canvas> elements). As part of this work, Scrawl-canvas will modify the affected elements' `position` CSS style:
// + Stack elements have `relative` positioning within the DOM
// + Element elements have `absolute` positioning within the Stack
//
// The Stack factory is not used directly; the factory is not exported as part of the __scrawl object__ during Scrawl-canvas initialization. Instead, wrappers can be created for a DOM-based &lt;div> element using the following scrawl function:
// + `scrawl.addStack` - generates a new &lt;div> element, creates a wrapper for it, then adds it to the DOM.
//
// Stack wrapper objects use the __base__, __position__, __anchor__, __cascade__ and __dom__ mixins. Thus Stack wrappers are also __artefact__ objects: if a Stack's DOM element is a direct child of another Stack wrapper's element then it can be positioned, dimensioned and rotated like any other artefact.
//
// By default, all Stack wrappers will track mouse/touch movements across their DOM element, supplying this data to constituent Canvas objects and artefacts as-and-when-required.
//
// Stack wrappers are used by Scrawl-canvas to invoke the __Display cycle cascade__. As such, they include `clear`, `compile`, `show` and `render` functions to manage the Display cycle. These functions are asynchronous, returning Promises.
//
// Stack wrappers are excluded from the Scrawl-canvas packet system; they cannot be saved or cloned. Killing a Stack wrapper will remove its DOM element from the document - __including all Elements and Canvases that it contains__.


// #### Demos:
// + All stack demos include Stack wrapper functionality - most of which happens behind the scenes and does not need to be directly coded. 
// + [DOM-001](../../demo/dom-001.html) - Loading the scrawl-canvas library using a script tag in the HTML code
// + [DOM-003](../../demo/dom-003.html) - Dynamically create and clone Element artefacts; drag and drop elements (including SVG elements) around a Stack
// + [DOM-010](../../demo/dom-010.html) - Add and remove (kill) Scrawl-canvas Stack elements programmatically


// #### Imports
import { constructors, group, stack, stacknames, element, artefact, artefactnames, canvas } from '../core/library.js';
import { generateUuid, mergeOver, pushUnique, isa_dom, removeItem, xt, xto, addStrings, defaultThisReturnFunction, defaultNonReturnFunction } from '../core/utilities.js';
import { rootElements, setRootElementsSort, addDomShowElement, setDomShowRequired, domShow } from '../core/document.js';
import { uiSubscribedElements, currentCorePosition } from '../core/userInteraction.js';

import { makeGroup } from './group.js';
import { makeElement } from './element.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import cascadeMix from '../mixin/cascade.js';
import domMix from '../mixin/dom.js';


// #### Stack constructor
const Stack = function (items = {}) {

    let g, el;

    this.makeName(items.name);
    this.register();
    this.initializePositions();
    this.initializeCascade();

    this.dimensions[0] = 300;
    this.dimensions[1] = 150;

    this.pathCorners = [];
    this.css = {};
    this.here = {};
    this.perspective = {

        x: '50%',
        y: '50%',
        z: 0
    };
    this.dirtyPerspective = true;

    this.initializeDomLayout(items);

    g = makeGroup({
        name: this.name,
        host: this.name
    });
    this.addGroups(g.name);

    this.set(this.defs);
    this.set(items);

    el = this.domElement;

    if (el) {

        if (this.trackHere) pushUnique(uiSubscribedElements, this.name);

        if (el.getAttribute('data-group') === 'root') {

            pushUnique(rootElements, this.name);
            setRootElementsSort();
        }
    }

    return this;
};


// #### Stack prototype
let P = Stack.prototype = Object.create(Object.prototype);
P.type = 'Stack';
P.lib = 'stack';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = cascadeMix(P);
P = domMix(P);


// #### Stack attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, handle, offset, dimensions, delta, noDeltaUpdates, pivot, pivotCorner, pivoted, addPivotHandle, addPivotOffset, addPivotRotation, path, pathPosition, addPathHandle, addPathOffset, addPathRotation, mimic, mimicked, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic, lockTo, scale, roll, collides, sensorSpacing, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates__.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [cascade mixin](../mixin/cascade.html): __groups__.
// + Attributes defined in the [dom mixin](../mixin/dom.html): __domElement, pitch, yaw, offsetZ, css, classes, position, actionResize, trackHere, domAttributes__.
let defaultAttributes = {

// __position__, __perspective__ - while most of the Stack wrapper's DOM element's attributes are handled through CSS, Scrawl-canvas takes control of some positioning-related attributes. Most of these are defined in the [dom mixin](../mixin/dom.html) - but the position and perspective attributes are managed in this module
    position: 'relative',
    perspective: null,

// __trackHere__ - Boolean flag to indicate whether the Stack object should participate in the Scrawl-canvas mouse/touch tracking functionality; the functionality can be switched off by setting the flag to false (via `set`).
    trackHere: true,

// TODO: This is all about a mad idea we may have for making stacks 'responsive' to viewport changes. It needs a lot more thinking through. Search on 'isResponsive' to find the relevant function below
    isResponsive: false,
    containElementsInHeight: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet/Clone management
// This functionality is disabled for Stack objects
P.stringifyFunction = defaultNonReturnFunction;
P.processPacketOut = defaultNonReturnFunction;
P.finalizePacketOut = defaultNonReturnFunction;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = defaultThisReturnFunction;


// #### Kill functionality
P.kill = function () {

    let myname = this.name;

    // rootElements and uiSubscribedElements arrays
    removeItem(rootElements, myname);
    setRootElementsSort();

    removeItem(uiSubscribedElements, myname);

    // Groups
    if (group[myname]) group[myname].kill();

    Object.entries(artefact).forEach(([name, art]) => {

        if (art.host === myname) art.kill();
    });

    // DOM removals
    this.domElement.remove();

    // Scrawl-canvas library
    return this.deregister();
}


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// Similar to start, handle, dimensions, etc Scrawl-canvas supplies some pseudo-attributes to help set and manage the Stack wrapper's `perspective` object:
// + `perspectiveX`
// + `perspectiveY`
// + `perspectiveZ`
G.perspectiveX = function () {

    return this.perspective.x;
};
G.perspectiveY = function () {

    return this.perspective.y;
};
G.perspectiveZ = function () {

    return this.perspective.z;
};

S.perspectiveX = function (item) {

    this.perspective.x = item;
    this.dirtyPerspective = true;
};
S.perspectiveY = function (item) {

    this.perspective.y = item;
    this.dirtyPerspective = true;
};
S.perspectiveZ = function (item) {

    this.perspective.z = item;
    this.dirtyPerspective = true;
};
S.perspective = function (item = {}) {

    this.perspective.x = (xt(item.x)) ? item.x : this.perspective.x;
    this.perspective.y = (xt(item.y)) ? item.y : this.perspective.y;
    this.perspective.z = (xt(item.z)) ? item.z : this.perspective.z;
    this.dirtyPerspective = true;
};
D.perspectiveX = function (item) {

    this.perspective.x = addStrings(this.perspective.x, item);
    this.dirtyPerspective = true;
};
D.perspectiveY = function (item) {

    this.perspective.y = addStrings(this.perspective.y, item);
    this.dirtyPerspective = true;
};


// #### Prototype functions

// `updateArtefacts` - internal function. Iterate through all Element and Canvas wrappers associated with the Stack wrapper's Group object and set a range of dirty flags on them, for future processing by each as appropriate.
P.updateArtefacts = function (items = {}) {

    this.groupBuckets.forEach(grp => {

        grp.artefactBuckets.forEach(art => {

            if (items.dirtyScale) art.dirtyScale = true;
            if (items.dirtyDimensions) art.dirtyDimensions = true;
            if (items.dirtyLock) art.dirtyLock = true;
            if (items.dirtyStart) art.dirtyStart = true;
            if (items.dirtyOffset) art.dirtyOffset = true;
            if (items.dirtyHandle) art.dirtyHandle = true;
            if (items.dirtyRotation) art.dirtyRotation = true;
            if (items.dirtyPathObject) art.dirtyPathObject = true;
            if (items.dirtyCollision) art.dirtyCollision = true;
        })
    });
};

// `cleanDimensionsAdditionalActions` - overwrites mixin/position function. Promulgates Stack dimension changes through to all Element and Canvas wrappers associated with the Stack wrapper's Group object.
P.cleanDimensionsAdditionalActions = function () {

    if (this.groupBuckets) {

        this.updateArtefacts({
            dirtyDimensions: true,
            dirtyPath: true,
            dirtyStart: true,
            dirtyHandle: true,
            dirtyCollision: true,
        });
    }

    this.dirtyDomDimensions = true;
    this.dirtyPath = true;
    this.dirtyStart = true;
    this.dirtyHandle = true;
    this.dirtyCollision = true;
};

// `cleanPerspective` - internal function
P.cleanPerspective = function () {

    this.dirtyPerspective = false;

    let p = this.perspective;

    this.domPerspectiveString = `perspective-origin: ${p.x} ${p.y}; perspective: ${p.z}px;`;
    this.domShowRequired = true;

    if (this.groupBuckets) {

        this.updateArtefacts({
            dirtyHandle: true,
            dirtyPathObject: true,
            dirtyCollision: true,
        });
    }
};


// TODO - experimental! `checkResponsive`
//
// Scrawl-canvas Stack artefacts - at the __root__ level - cannot have 'String%' dimensions, which means they have absolute dimensions - because everything that relies on 'String%' dimensions needs an absolute (number) value for their calculations at the root, which is the stack. 
//
// But we still need to make Stacks responsive. We do this by checking if the viewport dimensions have changed (a resize action has taken place) and - if yes - update the stack's absolute dimensions accordingly ... if the __isResponsive__ flag has been set to true for the Stack (default is 'false' - may change this in due course).
//
// We call this check in the __clear__ function below, because it's doing nothing else useful at the moment and it makes sense to get updates in place here before everything launches into the compile part of the display cycle
P.checkResponsive = function () {

    if (this.isResponsive && this.trackHere) {

        // Start keeping track of the viewport dimensions
        if (!this.currentVportWidth) this.currentVportWidth = currentCorePosition.w;
        if (!this.currentVportHeight) this.currentVportHeight = currentCorePosition.h;

        // If last display cycle responded to dimension changes, need to finalise height now
        if (this.dirtyHeight && this.containElementsInHeight) {

            console.log('stack height final fixes need to be done');
            this.dirtyHeight = false;
        }

        if (this.currentVportWidth !== currentCorePosition.w) {

            console.log('need to update for resized viewport width');
            this.currentVportWidth = currentCorePosition.w;

            if (this.containElementsInHeight) {

                // Won't be updated until the next display cycle, but flag it now for action
                // - needed because text in elements flow as part of normal DOM operations
                this.dirtyHeight = true;
            }
        }

        if (this.currentVportHeight !== currentCorePosition.h) {

            console.log('need to update for resized viewport height');
            this.currentVportHeight = currentCorePosition.h;
        }
    }
};


// ##### Display cycle functions

// `clear`
P.clear = function () {

    this.checkResponsive();

    return Promise.resolve(true);
};

// `compile`
P.compile = function () {

    let self = this;

    return new Promise((resolve, reject) => {

        self.sortGroups();

        self.prepareStamp()

        self.stamp()
        .then(() => {

            let promises = [];

            self.groupBuckets.forEach(mygroup => promises.push(mygroup.stamp()));

            return Promise.all(promises);
        })
        .then(() => resolve(true))
        .catch((err) => reject(false));
    })
};

// `show`
P.show = function () {

    return new Promise((resolve) => {

        domShow();
        resolve(true);
    });
};

// `render`
P.render = function () {

    let self = this;

    return new Promise((resolve, reject) => {

        self.compile()
        .then(() => self.show())
        .then(() => resolve(true))
        .catch((err) => reject(false));
    });
};

// `addExistingDomElements` - argument is a CSS query search String. All elements in the DOM matching the search will be __moved__ into the Stack wrapper's DOM element and given Scrawl-canvas Element wrappers. While Scrawl-canvas will try its best to respect the elements' CSS attributes, they will be __positioned absolutely__ within the Stack and given start, handle and offset values of `[0, 0]`. 
P.addExistingDomElements = function (search) {

    let elements, el, captured, i, iz;

    if (xt(search)) {

        elements = (search.substring) ? document.querySelectorAll(search) : [].concat(search);

        for (i = 0, iz = elements.length; i < iz; i++) {

            el = elements[i];
            
            if (isa_dom(el)) {

                captured = makeElement({
                    name: el.id || el.name,
                    domElement: el,
                    group: this.name,
                    host: this.name,
                    position: 'absolute',
                    setInitialDimensions: true,
                });

                if (captured && captured.domElement) this.domElement.appendChild(captured.domElement);
            }
        }
    }
    return this;
};

// `addNewElement` - takes an 'items' object as an argument. The only required attribute of the argument is __tag__, which determines the type of element that will be created (for example - setting tag to 'div' will create a new &lt;div> element)
// + Any other Element artefact attribute can also be included in the argument object, including __text__ and __content__ attributes to set the new DOM Element's textContent and innerHTML attributes.
// + If position and dimension values are not included in the argument, the element will be given default values of [0,0] for start, offset and handle; and dimensions of 100px width and height.
// + The new element will also default to a CSS box-sizing style value of 'border-box', unless the argument's __boxSizing__ attribute has been set to 'content-box' - this will override any 'borderBox' attribute value in the argument's __.css__ object (if one has been included)
P.addNewElement = function (items = {}) {

    if (items.tag) {

        items.domElement = document.createElement(items.tag);
        items.domElement.setAttribute('data-group', this.name);
        if (!xt(items.group)) items.group = this.name;
        items.host = this.name;

        if (!items.position) items.position = 'absolute';
        if (!xt(items.width)) items.width = 100;
        if (!xt(items.height)) items.height = 100;

        let myElement = makeElement(items);

        if (myElement && myElement.domElement) {

            if (!xt(items.boxSizing)) myElement.domElement.style.boxSizing = 'border-box';

            this.domElement.appendChild(myElement.domElement);
        }

        return myElement;
    }
    return false;
};


// #### Factory
const makeStack = function (items) {

    return new Stack(items);
};

constructors.Stack = Stack;


// #### Exports
export {
    makeStack,
};
