/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/

(function () { 'use strict';

function simpleheat(canvas) {
    // jshint newcap: false, validthis: true
    if (!(this instanceof simpleheat)) { return new simpleheat(canvas); }

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    this._ctx = canvas.getContext('2d');

    var shadow = this._shadow = document.createElement('canvas');
    this._shadowCtx = shadow.getContext('2d');

    this._width = shadow.width = canvas.width;
    this._height = shadow.height = canvas.height;

    this._max = 1;
    this.clear();
}

simpleheat.prototype = {

    defaultRadius: 25,
    defaultGradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red'},

    data: function (data) {
        this._toAdd = data;
        return this;
    },

    max: function (max) {
        this._max = max;
        this._redraw();
        return this;
    },

    add: function (point) {
        this._toAdd.push(point);
        return this;
    },

    clear: function () {
        if (this._added && this._added.length) {
            this._clear = true;
        }
        this._added = [];
        this._toAdd = [];
        return this;
    },

    radius: function (r, blur) {
        blur = blur || 15;

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

        this._redraw();

        return this;
    },

    gradient: function (grad) {
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

        this._redraw();

        return this;
    },

    draw: function (minOpacity) {
        if (!this._circle) {
            this.radius(this.defaultRadius);
        }
        if (!this._grad) {
            this.gradient(this.defaultGradient);
        }

        var ctx = this._shadowCtx;

        if (this._clear) {
            ctx.clearRect(0, 0, this._width, this._height);
            this._ctx.clearRect(0, 0, this._width, this._height);
            this._clear = false;
        }

        var minX = this._width,
            minY = this._height,
            maxX = 0,
            maxY = 0,
            r = this._r;

        for (var i = 0, len = this._toAdd.length, p; i < len; i++) {
            p = this._toAdd[i];

            ctx.globalAlpha = Math.max(Math.abs(p[2]) / this._max, minOpacity || 0.05);
            ctx.globalCompositeOperation = p[2] > 0 ? 'source-over' : 'destination-out';
            ctx.drawImage(this._circle, p[0] - r, p[1] - r);

            minX = Math.min(minX, p[0] - r);
            maxX = Math.max(maxX, p[0] + r);
            minY = Math.min(minY, p[1] - r);
            maxY = Math.max(maxY, p[1] + r);
        }

        var colored = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
        this._colorize(colored.data, this._grad);
        this._ctx.putImageData(colored, minX, minY);

        this._added = this._added.concat(this._toAdd);
        this._toAdd = [];

        return this;
    },

    _redraw: function () {
        var added = this._added;
        this._added = [];
        this._toAdd = this._toAdd.concat(added);
        this._clear = true;
    },

    _colorize: function (pixels, gradient) {
        for (var i = 3, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i] * 4;

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
