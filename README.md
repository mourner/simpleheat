simpleheat
==========

A super-tiny JavaScript library for drawing heatmaps with Canvas by [Vladimir Agafonkin](http://agafonkin.com/en).
Inspired by [heatmap.js](https://github.com/pa7/heatmap.js), but with focus on simplicity and performance.

Demo: http://mourner.github.io/simpleheat/debug

```js
simpleheat('canvas').data(data).draw();
```

## Reference

```js
// create a simpleheat object given an id or canvas reference
var heat = simpleheat(canvas);

// set data of [[x, y, value], ...] format
heat.data(data);

// set point radius and blur radius (25 and 15 by default)
heat.radius(r, r2);

// set gradient colors as {<stop>: '<color>'}, e.g. {0.4: 'blue', 0.65: 'lime', 1: 'red'}
heat.gradient(grad);

// draw the heatmap with optional max and min values (1 and max * 0.05 by default)
heat.draw(max, min);
```
