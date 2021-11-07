export function wildersSmoothing(data: number[], period: number){
	let result: number[] = [];
	let sum = 0;

	for(let i=0; i<period-1; i++){
		result.push(0);
		sum+=data[i];
	}
	
	result.push(sum+data[period-1]);
	for(let i=period; i<data.length; i++){
		let prev = result[result.length-1];
		result.push(prev - (prev/period) + data[i]);
	}

	return result;
}

export function wildersSmoothing2(data: number[], period: number) {
	let result: number[] = [];
	let sum = 0;

	for(let i=0; i<period-1; i++){
		sum+=data[i];
	}
	result.push( (sum+data[period-1]) /period);

	for(let i=period; i<data.length; i++){
		let prev = result[result.length-1];
		result.push( ((prev*(period-1)+data[i])/period ));
	}
	return result
}