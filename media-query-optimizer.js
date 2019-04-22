const postcss = require("postcss");
const matchAll = require("string.prototype.matchall");

const regex = {
  minWidth: /\(\s*min\-width\s*:\s*(\s*[0-9\.]+)([\w]*)\s*\)/g,
  maxWidth: /\(\s*max\-width\s*:\s*(\s*[0-9\.]+)([\w]*)\s*\)/g
};

function getValue(pxValue, units) {
  if( pxValue === 0 ) {
    return `0`;
  }
  if( units === "em" ) {
    return `${pxValue / 16}em`;
  }
  if( units === "px" ) {
    return `${pxValue}px`;
  }

  throw Error("media-query-optimizer only supports px and em units (for now).")
}

module.exports = postcss.plugin("postcss-media-query-optimizer", function () {
  return function(css) {
    css.walkAtRules("media", function(rule) {
      let finalSelector = [];

      rule.params.split(",").forEach(function(expression) {
        let usingEms = false;
        let minPx = undefined;
        let maxPx = undefined;
        let needsCorrection = false;

        expression = expression.trim();

        [...matchAll( expression, regex.minWidth )].forEach(function(minMatch, i) {
          let minValue = parseFloat(minMatch[1]);
          if( minMatch[2] === "em" ) {
            usingEms = true;
            minValue *= 16;
          }

          if( minPx === undefined ) {
            minPx = minValue;
          } else {
            minPx = Math.max(minPx, minValue);
          }

          if(i > 0) {
            needsCorrection = true;
          }
        });

        [...matchAll( expression, regex.maxWidth )].forEach(function(maxMatch, i) {
          let maxValue = parseFloat(maxMatch[1]);
          if( maxMatch[2] === "em" ) {
            usingEms = true;
            maxValue *= 16;
          }

          if( maxPx === undefined ) {
            maxPx = maxValue;
          } else {
            maxPx = Math.min(maxPx, maxValue);
          }

          if(i > 0) {
            needsCorrection = true;
          }
        });

        if( maxPx !== undefined && maxPx === 0 ) {
          return;
        }

        if(minPx !== undefined && maxPx !== undefined && minPx > maxPx) {
          return;
        }

        // console.log( expression, needsCorrection, minPx, maxPx );
        if(minPx !== undefined && minPx === 0) {
          if( maxPx === undefined ) {
            finalSelector.push("all");
            return;
          } else {
            finalSelector.push(`(max-width: ${getValue(maxPx, usingEms ? "em" : "px")})`);
            return;
          }
        } else if(needsCorrection) {
          let results = [];
          if(minPx !== undefined) {
            results.push(`(min-width: ${getValue(minPx, usingEms ? "em" : "px")})`);
          }
          if(maxPx !== undefined) {
            results.push(`(max-width: ${getValue(maxPx, usingEms ? "em" : "px")})`);
          }

          if( results.length ) {
            finalSelector.push(results.join(" and "));
            return;
          }
        }

        // passthrough
        finalSelector.push(expression);
      });

      if( finalSelector.length === 0 ) {
        rule.remove();
      } else {
        rule.params = finalSelector.join(", ");
      }
    });

  };
});