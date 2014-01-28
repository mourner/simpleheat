simpleheat
==========

A super-tiny JavaScript library for drawing heatmaps with Canvas by [Vladimir Agafonkin](http://agafonkin.com/en).
Inspired by [heatmap.js](https://github.com/pa7/heatmap.js), but with focus on simplicity and performance.

Demo: http://mourner.github.io/simpleheat/debug

## Usage example

```js
var heat = simpleheat('canvas')  // create a simpleheat object
	.data(data)                  // set data of [[x, y, value], ...] format
	.draw(18);                   // draw with 18 as max value
```

## Reference

```js
// create a simpleheat object given an id or canvas reference
var heat = simpleheat(canvas);

// set data of [[x, y, value], ...] format
heat.data(data);

// set point radius to r (25 by default) and optionally blur radius to r2 (15 by default)
heat.radius(r, r2);

// set gradient colors in the form of {<colorStop>: '<color>'}, e.g. {0: 'red', 0.5: 'yellow', ...}
heat.gradient(grad);

// draw the heatmap, optionally passing max value (1 by default) and min value (max * 0.05 by default)
heat.draw(max, min);
```
