import { bollinger, calculateStandardDeviation } from "./bollinger";
import { smaArray } from "./sma";

describe('bollinger bands', () => {
	it('should return the expected resutls for candles', () => {
		// @ts-ignore
		const result = bollinger(testInput, {period:20}).slice(20);
		expect(result).toEqual(expectedRes);
	})
});

describe('standard deviation', () => {
  it('should calculate the sd', () => {
    let prices = [2,3,4,5,6,5,6,4,6,7,1,2];
    let avgs = [ 0, 0, 0, 3.5, 4.5, 5, 5.5, 5.25, 5.25, 5.75, 4.5, 4 ];
    let sd = calculateStandardDeviation(prices, avgs, 4);
    expect(sd).toEqual( expectedDeviation );
  })
});

const expectedDeviation = [ 0,
  0,
  0,
  1.118033988749895,
  1.118033988749895,
  0.7071067811865476,
  0.5,
  0.82915619758885,
  0.82915619758885,
  1.0897247358851685,
  2.29128784747792,
  2.5495097567963922
]

const testInput = [
  [0,52.97,53.57,53.61,52.97,68555],
  [0,53.56,53.55,53.61,53.5,98428],
  [0,53.71,53.73,53.79,53.69,61875],
  [0,53.75,53.74,53.83,53.66,137648],
  [0,53.82,54.26,54.43,53.82,186224],
  [0,54.01,53.76,54.06,53.63,912441],
  [0,54,53.89,54.1,53.84,319514],
  [0,54.08,53.85,54.16,53.79,395370],
  [0,53.94,53.44,53.94,53.32,555994],
  [0,53.63,53.68,53.77,53.63,85093],
  [0,53.51,53.23,53.51,53.18,135002],
  [0,52.99,53.02,53.02,52.84,120814],
  [0,53.26,53.09,53.41,53.01,166502],
  [0,52.89,52.86,52.91,52.73,266201],
  [0,53.09,52.41,53.13,52.34,110203],
  [0,52.5,52.75,52.79,52.41,370169],
  [0,53.14,52.98,53.2,52.84,71896],
  [0,53.14,53.32,53.38,53.01,862705],
  [0,53.11,52.87,53.11,52.73,72995],
  [0,52.63,52.51,52.66,52.34,80180],
  [0,52.6,52.78,52.8,52.41,35496],
  [0,52.98,52.73,53,52.6,54425],
  [0,52.68,52.48,52.9,52.45,101418],
  [0,52.73,52.44,52.87,52.35,50817],
  [0,52.35,52.5,52.5,52.14,61019],
  [0,52.52,52.81,52.84,52.52,27412],
  [0,52.88,52.92,52.98,52.63,35786]
];

const expectedRes = [ 
  { middle: 53.286000000000016,
    upper: 54.28426649748453,
    lower: 52.2877335025155 },
  { middle: 53.24500000000002,
    upper: 54.263675610781,
    lower: 52.22632438921904 },
  { middle: 53.18250000000002,
    upper: 54.22752392317116,
    lower: 52.137476076828875 },
  { middle: 53.11750000000002,
    upper: 54.17734668702603,
    lower: 52.05765331297401 },
  { middle: 53.02950000000002,
    upper: 53.98212741929888,
    lower: 52.07687258070116 },
  { middle: 52.98200000000001,
    upper: 53.87720053619288,
    lower: 52.08679946380715 },
  { middle: 52.933500000000016,
    upper: 53.72587049415032,
    lower: 52.14112950584971 }
];

