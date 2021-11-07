const { linearRegresion, windowedLinearRegresion } = require("./linearRegresion")

describe('linear regresion', () => {
	it('should calculate regresion', () => {
		const lr = linearRegresion([0,2,1]);
		expect( lr(2) ).toBe(1.5);
	})

	it('should calculate regresion 2', () => {
		const lr = linearRegresion([2,1,3]);
		expect( lr(2) ).toBe(2.5);
	})

	it('should calculate regresion 3', () => {
		const lr = linearRegresion([1,3,2]);
		expect( lr(2) ).toBe(2.5);
	})

	it('should calculate regresion 4', () => {
		const lr = linearRegresion([3,2,4]);
		expect( lr(2) ).toBe(3.5);
	})
})

describe('windowed linear regresion', () => {
	it('should calculate all the lr', () => {
		const lr = windowedLinearRegresion([0,2,1,3,2,4], 3);
		expect( lr ).toEqual([0, 0, 1.5, 2.5, 2.5, 3.5]);
	})
})