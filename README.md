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

// set point radius to r (25 by default) and optionally blur radius to r2 (15 by default)
heat.radius(r, r2);

// set gradient colors as {<stop>: '<color>'}, e.g. {0: 'red', 0.5: 'yellow', ...}
heat.gradient(grad);

// draw the heatmap with optional max (1 by default) and min (max * 0.05 by default) values
heat.draw(max, min);
```
