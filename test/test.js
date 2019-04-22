import test from "ava";
import postcss from "postcss";
import MediaQueryOptimizer from "..";

function getCSS(str) {
	return postcss()
		.use(MediaQueryOptimizer())
		.process(str).css;
}

test("Control", t => {
	t.is(getCSS("* { color: red; } @media (min-width: 320px) { color: blue }"), "* { color: red; } @media (min-width: 320px) { color: blue }");
});

test("@media (max-width: 0)", t => {
	t.is(getCSS("* { color: red; } @media (max-width: 0) { color: blue }"), "* { color: red; }");
	t.is(getCSS("@media (max-width: 0px) {}"), "");
});

test("@media (min-width: 0)", t => {
	t.is(getCSS("@media (min-width: 0) {}"), "@media all {}");
	t.is(getCSS("@media (min-width: 0px) {}"), "@media all {}");
	t.is(getCSS("@media (min-width: 0) and (min-width: 320px) {}"), "@media (min-width: 320px) {}");
});

test("Removed if Max less than min", t => {
	t.is(getCSS("@media (max-width: 320px) and (min-width: 321px) { color: blue }"), "");
});

test("Em values", t => {
	t.is(getCSS("@media (min-width: 20em) { color: blue }"), "@media (min-width: 20em) { color: blue }");
	t.is(getCSS("@media (max-width: 20em) { color: blue }"), "@media (max-width: 20em) { color: blue }");
});

test("Px values", t => {
	t.is(getCSS("@media (min-width: 20px) { color: blue }"), "@media (min-width: 20px) { color: blue }");
	t.is(getCSS("@media (max-width: 20px) { color: blue }"), "@media (max-width: 20px) { color: blue }");
});

test("From the wild", t => {
	t.is(getCSS(`@media (min-width: 59.375em) and (min-width: 37.5em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }`), `@media (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }`);


	// Two queries
	t.is(getCSS(`@media (min-width: 59.375em) and (min-width: 37.5em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }
	@media (min-width: 59.375em) and (min-width: 48em) {
		.layout-full .layout_body {
			/* 768px */
			padding-left: 4%; } }`), `@media (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }
	@media (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 768px */
			padding-left: 4%; } }`);
});

test("From the wild (reversed value order)", t => {
	// reversed values
	t.is(getCSS(`@media (min-width: 37.5em) and (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }`), `@media (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }`);

	// Two queries, reversed values
	t.is(getCSS(`@media (min-width: 37.5em) and (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }
	@media (min-width: 59.375em) and (min-width: 48em) {
		.layout-full .layout_body {
			/* 768px */
			padding-left: 4%; } }`), `@media (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 600px */
			padding-left: 5%; } }
	@media (min-width: 59.375em) {
		.layout-full .layout_body {
			/* 768px */
			padding-left: 4%; } }`);
});
