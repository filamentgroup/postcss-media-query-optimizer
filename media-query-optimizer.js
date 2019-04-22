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
      let minPx = undefined;
      let maxPx = undefined;
      let usingEms = false;
      let needsCorrection = false;

      rule.params.split(",").forEach(function(expression) {
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
      });

      if( maxPx !== undefined && maxPx === 0 ) {
        rule.remove();
      }

      if(minPx !== undefined && maxPx !== undefined && minPx > maxPx) {
        rule.remove();
      }

      // console.log( rule.params, needsCorrection, minPx, maxPx );
      if(minPx !== undefined && minPx === 0) {
        if( maxPx === undefined ) {
          rule.params = "all";
        } else {
          rule.params = `(max-width: ${getValue(maxPx, usingEms ? "em" : "px")})`;
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
          rule.params = results.join(" and ");
        }
      }
    });

  };
});