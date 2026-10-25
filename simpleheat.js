const defaultGradient = {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
};

// OffscreenCanvas keeps the helper canvases out of the DOM (and works in workers); fall back to a
// detached DOM canvas in browsers without it (Safari < 16.4). In Node, define a global
// OffscreenCanvas (e.g. Canvas from node-canvas) to use the library without a DOM.
function createCanvas(width, height) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export default class SimpleHeat {
    constructor(canvas) {
        this._canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
        this._ctx = this._canvas.getContext('2d', {willReadFrequently: true});
        this._max = 1;
        this._data = [];
    }

    data(data) {
        this._data = data;
        return this;
    }

    max(max) {
        this._max = max;
        return this;
    }

    add(point) {
        this._data.push(point);
        return this;
    }

    clear() {
        this._data = [];
        return this;
    }

    radius(r = 25, blur = 15) {
        // create a grayscale blurred circle image that we'll use for drawing points
        const r2 = this._r = r + blur;
        const circle = this._circle = createCanvas(r2 * 2, r2 * 2);
        const ctx = circle.getContext('2d');

        // draw the circle off-canvas so that only its blurred shadow lands inside
        ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        ctx.arc(-r2, -r2, r, 0, Math.PI * 2);
        ctx.fill();

        return this;
    }

    gradient(grad = defaultGradient) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        const ctx = createCanvas(1, 256).getContext('2d', {willReadFrequently: true});
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);

        for (const [stop, color] of Object.entries(grad)) {
            gradient.addColorStop(+stop, color);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;

        return this;
    }

    draw(minOpacity = 0.05) {
        if (!this._circle) this.radius();
        if (!this._grad) this.gradient();

        const {_ctx: ctx, _circle: circle, _r: r, _grad: grad} = this;
        const {width, height} = this._canvas;

        ctx.clearRect(0, 0, width, height);

        // draw a grayscale heatmap by putting a blurred circle at each data point
        for (const [x, y, value] of this._data) {
            ctx.globalAlpha = Math.min(Math.max(value / this._max, minOpacity), 1);
            ctx.drawImage(circle, x - r, y - r);
        }

        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        const image = ctx.getImageData(0, 0, width, height);
        const pixels = image.data;

        for (let i = 0; i < pixels.length; i += 4) {
            const j = pixels[i + 3] * 4;
            if (j) {
                pixels[i] = grad[j];
                pixels[i + 1] = grad[j + 1];
                pixels[i + 2] = grad[j + 2];
            }
        }

        ctx.putImageData(image, 0, 0);

        return this;
    }
}
