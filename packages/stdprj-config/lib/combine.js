//@flow strict

module.exports = function combine(
  a /*:$ReadOnlyArray<string>*/,
  b /*:$ReadOnlyArray<string>*/
) /*:$ReadOnlyArray<string>*/ {
  const o = [];
  a.forEach(aVal => b.forEach(bVal => o.push(`${aVal}${bVal}`)));
  return o;
};
