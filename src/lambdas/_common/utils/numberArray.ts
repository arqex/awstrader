export function numberArray( n: number, length: number ): number[] {
	let result: number[] = [];
	while( length-- > 0 ){
		result.push(n);
	}
	return result;
}