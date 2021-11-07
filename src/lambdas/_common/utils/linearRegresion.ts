
export function linearRegresion(y: number[]) {
  let sum_x = 0;
	let sum_y = 0;
  let sum_xy = 0;
	let sum_xx = 0;
  let count = y.length;

  // calculate sums
  for (var i = 0, len = y.length; i < len; i++) {
    sum_x += i;
    sum_y += y[i];
    sum_xx += i * i;
    sum_xy += i * y[i];
  }

  // calculate slope (m) and y-intercept (b) for f(x) = m * x + b
  const m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
  const b = (sum_y / count) - (m * sum_x) / count;

  return function(x) {
    return m * x + b;
  }
}

export function windowedLinearRegresion(y: number[], period: number) {
  let sum_x = 0;
	let sum_y = 0;
  let sum_xy = 0;
	let sum_xx = 0;

	let results:number[] = [];

	// calculate initial sums
  for (let i = 0; i < period - 1; i++) {
    sum_x += i;
    sum_y += y[i];
    sum_xx += i * i;
    sum_xy += i * y[i];
		results.push(0);
  }

	for(let i = period - 1; i < y.length; i++ ){
    sum_x += i;
    sum_y += y[i];
    sum_xx += i * i;
    sum_xy += i * y[i];

		const m = (period * sum_xy - sum_x * sum_y) / (period * sum_xx - sum_x * sum_x);
  	const b = (sum_y / period) - (m * sum_x) / period;
		results.push( m * i + b );

		let indexToRemove = i - period + 1;
		sum_x -= indexToRemove;
    sum_y -= y[indexToRemove];
    sum_xx -= indexToRemove * indexToRemove;
    sum_xy -= indexToRemove * y[indexToRemove];
	}

	return results;
}