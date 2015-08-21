/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
 
 Additions (c) 2015, Dan Jackson
 Added changes so that only additional data points need to be added to the canvas, and even then only the "dirty rectangle" is re-colorized.
 Some changes (e.g. radius/blur) will trigger a full redraw.
*/

(function () { 'use strict';

function simpleheat(canvas) {
    // jshint newcap: false, validthis: true
    if (!(this instanceof simpleheat)) { return new simpleheat(canvas); }

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];
}

simpleheat.prototype = {

	_redraw: true,
	
    defaultRadius: 25,

    defaultGradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
    },

    data: function (data) {
        this._data = data;
		this._redraw = true;
        return this;
    },

    max: function (max) {
		if (this._max != max) { this._redraw = true; }
        this._max = max;
        return this;
    },

    add: function (point) {
        this._data.push(point);
        return this;
    },

    clear: function () {
        this._data = [];
		this._redraw = true;
        return this;
    },

    radius: function (r, blur) {
        blur = blur === undefined ? 15 : blur;

		if (this._r != r + blur) {
			this._redraw = true;
		}
		
        // create a grayscale blurred circle image that we'll use for drawing points
        var circle = this._circle = document.createElement('canvas'),
            ctx = circle.getContext('2d'),
            r2 = this._r = r + blur;

        circle.width = circle.height = r2 * 2;

        ctx.shadowOffsetX = ctx.shadowOffsetY = 200;
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        ctx.arc(r2 - 200, r2 - 200, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        return this;
    },

    gradient: function (grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (var i in grad) {
            gradient.addColorStop(i, grad[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;

		this._redraw = true;
		
        return this;
    },

    draw: function (minOpacity) {
        if (!this._circle) {
            this.radius(this.defaultRadius);
        }
        if (!this._grad) {
            this.gradient(this.defaultGradient);
        }

        var ctx = this._ctx;
		if (this._width != this._canvas.width || this._height != this._canvas.height) {
			this._width = this._canvas.width;
			this._height = this._canvas.height;
			this._redraw = true;
		}

		var dirty = false, minX = null, minY = null, maxX = null, maxY = null;
		if (this._redraw) {
			ctx.clearRect(0, 0, this._width, this._height);
			this._redraw = false;
			this._alreadyDrawn = 0;
			dirty = true; minX = 0; minY = 0; maxX = this._width; maxY = this._height;
		}

        // draw a grayscale heatmap by putting a blurred circle at each data point
        for (var i = this._alreadyDrawn, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
            ctx.globalAlpha = Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity);
            ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
			if (!dirty || p[0] - this._r < minX) { minX = p[0] - this._r; }
			if (!dirty || p[0] + this._r > maxX) { maxX = p[0] + this._r; }
			if (!dirty || p[1] - this._r < minY) { minY = p[1] - this._r; }
			if (!dirty || p[1] + this._r > maxY) { maxY = p[1] + this._r; }
			dirty = true;
        }
		
		this._alreadyDrawn = this._data.length;

		if (dirty)
		{
			if (maxX < minX) { maxX = minX; }
			if (maxY < minY) { maxY = minY; }
			if (minX < 0) { minX = 0; }
			if (maxX > this._width) { maxX = this._width; }
			if (minY < 0) { minY = 0; }
			if (maxY > this._height) { maxY = this._height; }
			
			// colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
			var colored = ctx.getImageData(minX, minY, maxX - minX + 1, maxY - minY + 1);
			this._colorize(colored.data, this._grad);
			ctx.putImageData(colored, minX, minY);
		}
		
        return this;
    },

    _colorize: function (pixels, gradient) {
        for (var i = 3, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i] * 4; // get gradient color from opacity value

            if (j) {
                pixels[i - 3] = gradient[j];
                pixels[i - 2] = gradient[j + 1];
                pixels[i - 1] = gradient[j + 2];
            }
        }
    }
};

window.simpleheat = simpleheat;

})();
