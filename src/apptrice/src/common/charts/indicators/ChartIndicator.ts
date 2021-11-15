export interface ChartIndicator {
	augmentData: (datum: any) => any,
	render: (key: string, styles: any) => JSX.Element
}