/**
 * @typedef {[x: number, y: number, value: number]} HeatPoint
 * @typedef {Record<number, string>} HeatGradient Color stops in the 0..1 range, e.g. `{0.4: 'blue', 1: 'red'}`.
 * @typedef {HTMLCanvasElement | OffscreenCanvas} AnyCanvas
 */

/** @type {HeatGradient} */
const defaultGradient = {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
};

/**
 * @param {AnyCanvas} canvas
 * @param {CanvasRenderingContext2DSettings} [settings]
 */
function getContext(canvas, settings) {
    return /** @type {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} */ (canvas.getContext('2d', settings));
}

/**
 * Create an offscreen canvas context, falling back to a DOM canvas in older browsers (Safari < 16.4).
 * In Node, define a global OffscreenCanvas (e.g. Canvas from @napi-rs/canvas).
 * @param {number} width
 * @param {number} height
 * @param {CanvasRenderingContext2DSettings} [settings]
 */
function createContext(width, height, settings) {
    if (typeof OffscreenCanvas !== 'undefined') return getContext(new OffscreenCanvas(width, height), settings);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return getContext(canvas, settings);
}

export default class SimpleHeat {
    /** @param {AnyCanvas | string} canvas A canvas or the id of a canvas element. */
    constructor(canvas) {
        this._canvas = typeof canvas === 'string' ? /** @type {HTMLCanvasElement} */ (document.getElementById(canvas)) : canvas;
        this._ctx = getContext(this._canvas, {willReadFrequently: true});
        this._max = 1;
        this._data = /** @type {HeatPoint[]} */ ([]);
    }

    /**
     * Set data points, replacing existing ones.
     * @param {HeatPoint[]} data
     */
    data(data) {
        this._data = data;
        return this;
    }

    /**
     * Set the value that maps to the full gradient color (1 by default).
     * @param {number} max
     */
    max(max) {
        this._max = max;
        return this;
    }

    /**
     * Add a data point.
     * @param {HeatPoint} point
     */
    add(point) {
        this._data.push(point);
        return this;
    }

    /** Remove all data points. */
    clear() {
        this._data = [];
        return this;
    }

    /**
     * Set point radius and blur radius.
     * @param {number} r
     * @param {number} blur
     */
    radius(r = 25, blur = 15) {
        // create a grayscale blurred circle image that we'll use for drawing points
        const r2 = r + blur;
        const ctx = createContext(r2 * 2, r2 * 2);

        // draw the circle off-canvas so that only its blurred shadow lands inside
        ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        ctx.arc(-r2, -r2, r, 0, Math.PI * 2);
        ctx.fill();

        this._circle = ctx.canvas;
        this._r = r2;
        return this;
    }

    /**
     * Set gradient colors.
     * @param {HeatGradient} grad
     */
    gradient(grad = defaultGradient) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        const ctx = createContext(1, 256, {willReadFrequently: true});
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);

        for (const [stop, color] of Object.entries(grad)) {
            gradient.addColorStop(+stop, color);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        // pack each color with alpha equal to its index, so colorizing is a single lookup per pixel
        const rgba = new Uint32Array(ctx.getImageData(0, 0, 1, 256).data.buffer);
        this._grad = rgba.map((c, a) => a && (c & 0xffffff | a << 24));
        return this;
    }

    /**
     * Draw the heatmap.
     * @param {number} minOpacity Minimum point opacity.
     */
    draw(minOpacity = 0.05) {
        if (!this._circle) this.radius();
        if (!this._grad) this.gradient();

        const ctx = this._ctx;
        const circle = /** @type {AnyCanvas} */ (this._circle);
        const grad = /** @type {Uint32Array} */ (this._grad);
        const r = /** @type {number} */ (this._r);
        const {width, height} = this._canvas;
        if (!width || !height) return this; // e.g. a hidden map container; getImageData would throw

        ctx.clearRect(0, 0, width, height);

        // draw a grayscale heatmap by putting a blurred circle at each data point
        for (const [x, y, value] of this._data) {
            ctx.globalAlpha = Math.min(Math.max(value / this._max, minOpacity), 1);
            ctx.drawImage(circle, Math.round(x - r), Math.round(y - r));
        }

        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        const image = ctx.getImageData(0, 0, width, height);
        const pixels = new Uint32Array(image.data.buffer); // little-endian, so alpha is the top byte

        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = grad[pixels[i] >>> 24];
        }

        ctx.putImageData(image, 0, 0);
        return this;
    }
}
