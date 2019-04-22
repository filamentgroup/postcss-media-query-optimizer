# postcss-media-query-optimizer

A postcss plugin that will optimize your media queries.

## Features

* Removes `@media (max-width: 0) {}` blocks
* Removes max < min: `@media (min-width: 400px) and (max-width: 320px) {}`
* Simplifies `@media (min-width: 400px) and (min-width: 320px) {}` to `@media (min-width: 400px) {}` (You probably don’t write this kind of code but for us it came from Mixin usage in SASS. Also, this solves an IE11 issue that uses the last `*-width` if multiple `*-width`’s exist).
* Simplifies `@media (min-width: 0) {}` to `@media all {}`
* Simplifies `@media (min-width: 0) and (max-width: 400px) {}` to `@media (max-width: 400px) {}`

## Limitations

* Only supports `em` and `px` units in media queries (for now).

## Usage

### Gulp

_TODO_

### Grunt

```
module.exports = function(grunt) {
	grunt.loadNpmTasks("grunt-postcss");

	grunt.initConfig({
		postcss: {
			options: {
				processors: [
					require("../../Code/postcss-media-query-optimizer")()
				]
			},
			dist: {
				src: "**/*.css"
			}
		}
		// …
	});
};
```

## Run tests

```
npx ava
```

## Credits

* This plugin borrows heavily from [`postcss-media-minmax`](https://github.com/postcss/postcss-media-minmax).