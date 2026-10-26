# simpleheat

A super-tiny JavaScript library for drawing heatmaps with Canvas.
Inspired by [heatmap.js](https://github.com/pa7/heatmap.js), but with focus on simplicity and performance.

Powers [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat), a heatmap plugin for [Leaflet](https://leafletjs.com).

```js
import SimpleHeat from 'simpleheat';

new SimpleHeat('canvas').data(data).draw();
```

[![Build Status](https://github.com/mourner/simpleheat/actions/workflows/ci.yml/badge.svg)](https://github.com/mourner/simpleheat/actions) [![Simply Awesome](https://img.shields.io/badge/simply-awesome-brightgreen.svg)](https://github.com/mourner/projects)

## [Demo](https://mourner.github.io/simpleheat/demo)

## Reference

#### Constructor

```js
// create a simpleheat object given an id or canvas reference
const heat = new SimpleHeat(canvas);
```

#### Data

```js
// set data of [[x, y, value], ...] format
heat.data(data);

// set max data value (1 by default)
heat.max(2.5);

// add a data point
heat.add([10, 10, 5.3]);

// clear data
heat.clear();
```

#### Appearance

```js
// set point radius and blur radius (25 and 15 by default)
heat.radius(30, 10);

// set gradient colors as {<stop>: '<color>'}
heat.gradient({0.4: 'blue', 0.65: 'lime', 1: 'red'});
```

#### Rendering

```js
// draw the heatmap with optional minimum point opacity (0.05 by default)
heat.draw(0.1);
```
