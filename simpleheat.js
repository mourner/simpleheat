/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/

function simpleheat(canvas, radius, gradient) {
	if (!(this instanceof simpleheat)) { return new simpleheat(canvas); }

	this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

	this._ctx = canvas.getContext('2d');
	this._width = canvas.width;
	this._height = canvas.height;

	this.radius(radius || 25);

	this.gradient(gradient || {
		0.00: 'rgba(0,0,255,0)',
		0.45: 'rgb(0,0,255)',
		0.55: 'rgb(0,255,255)',
		0.65: 'rgb(0,255,0)',
		0.95: 'yellow',
		1.00: 'rgb(255,0,0)'
	});
};

simpleheat.prototype = {

	data: function (data, max) {
		this._data = data;
		this._max = max;
		return this;
	},

	radius: function (r, blur) {
		this._circle = document.createElement('canvas');

		blur = blur || 15;

		var ctx = this._circle.getContext('2d'),
		    r2 = this._r = r + blur;

		this._circle.width = this._circle.height = r2 * 2;

		ctx.shadowOffsetX = ctx.shadowOffsetY = 1000;
		ctx.shadowBlur = blur;
		ctx.shadowColor = 'black';

		ctx.beginPath();
		ctx.arc(r2 - 1000, r2 - 1000, r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();

		return this;
	},

	gradient: function (grad) {
		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext('2d');

		canvas.width = 1;
		canvas.height = 256;

		var gradient = ctx.createLinearGradient(0, 0, 0, 256);

		for (var i in grad) {
			gradient.addColorStop(i, grad[i]);
		}

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 1, 256);

		this._palette = ctx.getImageData(0, 0, 1, 256).data;

		return this;
	},

	draw: function () {
		this._ctx.clearRect(0, 0, this._width, this._height);

		for (var i = 0, len = this._data.length, p; i < len; i++) {
			p = this._data[i];

			this._ctx.globalAlpha = p[2] ? p[2] / this._max : 0.1;
			this._ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
		}

		this._colorize();

		return this;
	},

	_colorize: function () {
		var imageData = this._ctx.getImageData(0, 0, this._width, this._height),
			pixels = imageData.data,
			palette = this._palette;

		for (var i = 3, len = pixels.length, j; i < len; i += 4) {
			j = pixels[i] * 4;

			if (j) {
				pixels[i - 3] = palette[j];
				pixels[i - 2] = palette[j + 1];
				pixels[i - 1] = palette[j + 2];
			}
		}

		imageData.data = pixels;
		this._ctx.putImageData(imageData, 0, 0);
	}
};
