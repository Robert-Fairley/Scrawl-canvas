// # Asset consumer mixin
// This mixin needs to be applied to any factory which wishes to use an asset. Asset objects are wrappers for managing &lt;img>, &lt;video> and (offscreen) &lt;canvas> elements.
//
// Currently only [Picture](../factory/picture.html) entity and [Pattern](../factory/pattern.html) style factories use assets. This mixin defines attributes and functionality common to both.


// #### Imports
import { mergeOver, xt } from '../core/utilities.js';
import { assetnames, asset } from '../core/library.js';

import { importImage } from '../factory/imageAsset.js';
import { importVideo } from '../factory/videoAsset.js';
import { importSprite } from '../factory/spriteAsset.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

// __asset__ - eventually becomes the current asset wrapper object (as generated by the `imageAsset`, `spriteAsset` and `videoAsset` factories).
        asset: null,


// ##### Spritesheet-specific attributes
        spriteIsRunning: false,
        spriteLastFrameChange: 0,
        spriteCurrentFrame: 0,
        spriteTrack: 'default',
        spriteForward: true,
        spriteFrameDuration: 100,
        spriteWillLoop: true,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    let S = P.setters;

// __asset__ - Setting the Asset object. Updating the asset will set the dirtyAsset flag.
    S.asset = function (item) {

        let oldAsset = this.asset,
            newAsset = (item && item.name) ? item.name : item;

        if (oldAsset && !oldAsset.substring) oldAsset.unsubscribe(this);

        this.asset = newAsset;
        this.dirtyAsset = true;
    };

// ##### Setting the source
// Argument needs to be a path/file String that will be used to import the new Image, Video or Sprite file and construct an appropriate Asset object wrapper for it.

// __imageSource__
    S.imageSource = function (item) {

        let results = importImage(item);

        if (results) {

            let myAsset = asset[results[0]];

            if (myAsset) {

                let oldAsset = this.asset;

                if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
            
                myAsset.subscribe(this);
            }
        }
    };

// __videoSource__
    S.videoSource = function (item) {

        let result = importVideo(item);

        if (result) {

            let myAsset = asset[result];

            if (myAsset) {

                let oldAsset = this.asset;

                if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
            
                myAsset.subscribe(this);
            }
        }
    };

// __spriteSource__
    S.spriteSource = function (item) {

        let result = importSprite(item);

        if (result) {

            let myAsset = asset[result];

            if (myAsset) {

                let oldAsset = this.asset;

                if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
            
                myAsset.subscribe(this);
            }
        }
    };


// #### Prototype functions

// `cleanAsset` - Cleaning the Asset object
    P.cleanAsset = function () {

        let ast = this.asset;

        if (ast && ast.substring) {

            let myAsset = asset[ast];

            if (myAsset) {

                this.dirtyAsset = false;
                myAsset.subscribe(this);
            }
        }
    };


// ##### Video actions
// These functions largely map to a selection of the asset's source &lt;video> element's [functions](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement). They allow the video to be controlled/coded by invoking the appropriate function on the Picture entity or Pattern style instance, rather than having to seek out the asset wrapper object to invoke the functions on them.

// `videoAction` - internal helper function
    P.videoAction = function (action, ...args) {

        let myAsset = this.asset;

        if (myAsset && myAsset.type === 'Video') return myAsset[action](...args);
    };

// `videoPromiseAction` - internal helper function
    P.videoPromiseAction = function (action, ...args) {

        let myAsset = this.asset;

        if (myAsset && myAsset.type === 'Video') return myAsset[action](...args);
        else return Promise.reject('Asset not a video');
    };

// `videoAddTextTrack`
    P.videoAddTextTrack = function (kind, label, language) {
        return this.videoAction('addTextTrack', kind, label, language);
    };

// `videoCaptureStream`
    P.videoCaptureStream = function () {
        return this.videoAction('captureStream');
    };

// `videoCanPlayType`
    P.videoCanPlayType = function (mytype) {
        return this.videoAction('canPlayType', mytype);
    };

// `videoFastSeek`
    P.videoFastSeek = function (time) {
        return this.videoAction('fastSeek', time);
    };

// `videoLoad`
    P.videoLoad = function () {
        return this.videoAction('load');
    };

// `videoPause`
    P.videoPause = function () {
        return this.videoAction('pause');
    };

// `videoPlay`
    P.videoPlay = function () {
        return this.videoPromiseAction('play');
    };

// `videoSetMediaKeys`
    P.videoSetMediaKeys = function (keys) {
        return this.videoPromiseAction('setMediaKeys', keys);
    };

// `videoSetSinkId`
    P.videoSetSinkId = function () {
        return this.videoPromiseAction('setSinkId');
    };


// ##### Sprite actions
// Add functions to the Picture entity or Pattern style factories which can be used to control image sprite animation playback.

// `checkSpriteFrame`
    P.checkSpriteFrame = function () {

        let asset = this.asset;

        if (asset && asset.type === 'Sprite') {

            let copyArray = this.copyArray;

            if (this.spriteIsRunning) {

                let last = this.spriteLastFrameChange,
                    choke = this.spriteFrameDuration,
                    now = Date.now();

                if (now > last + choke) {

                    let manifest = asset.manifest;

                    if (manifest) {

                        let track = manifest[this.spriteTrack],
                            len = track.length,
                            frame = this.spriteCurrentFrame,
                            loop = this.spriteWillLoop;

                        frame = (this.spriteForward) ? frame + 1 : frame - 1;

                        if (frame < 0) frame = (loop) ? len - 1 : 0;
                        if (frame >= len) frame = (loop) ? 0 : len - 1;

                        let [source, x, y, w, h] = track[frame];

                        copyArray.length = 0;
                        copyArray.push(x, y, w, h);

                        this.dirtyCopyStart = false;
                        this.dirtyCopyDimensions = false;

                        let sourceName = this.source.id || this.source.name;

                        if (source !== sourceName) {

                            let newSource = asset.sourceHold[source];

                            if (newSource) this.source = newSource;
                        }

                        this.spriteCurrentFrame = frame;
                        this.spriteLastFrameChange = now;
                    }
                }
            }
            else {

                let [source, x, y, w, h] = asset.manifest[this.spriteTrack][this.spriteCurrentFrame],
                    [cx, cy, cw, ch] = copyArray;

                if (cx !== x || cy !== y || cw !== w || ch !== h) {

                    copyArray.length = 0;
                    copyArray.push(x, y, w, h);

                    this.dirtyCopyStart = false;
                    this.dirtyCopyDimensions = false;
                }
            }
        }
    };

// `playSprite`
    P.playSprite = function (speed, loop, track, forward, frame) {

        if (xt(speed)) this.spriteFrameDuration = speed;
        if (xt(loop)) this.spriteWillLoop = loop;
        if (xt(track)) this.spriteTrack = track;
        if (xt(forward)) this.spriteForward = forward;
        if (xt(frame)) this.spriteCurrentFrame = frame;

        this.spriteLastFrameChange = Date.now();
        this.spriteIsRunning = true;
    }

// `haltSprite`
    P.haltSprite = function (speed, loop, track, forward, frame) {

        if (xt(speed)) this.spriteFrameDuration = speed;
        if (xt(loop)) this.spriteWillLoop = loop;
        if (xt(track)) this.spriteTrack = track;
        if (xt(forward)) this.spriteForward = forward;
        if (xt(frame)) this.spriteCurrentFrame = frame;

        this.spriteIsRunning = false;
    }

// Return the prototype
    return P;
};
