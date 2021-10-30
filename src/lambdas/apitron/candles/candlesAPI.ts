import { getCandles } from "./getCandles"

const candlesAPI = {
	initialize( app:any ){
		app.get('/candles', getCandles );
	}
}

export default candlesAPI;