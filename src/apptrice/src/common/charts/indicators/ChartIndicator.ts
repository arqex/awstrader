export interface ChartIndicator {
	augmentData: (datum: any) => any,
	render: (styles: any) => JSX.Element
}