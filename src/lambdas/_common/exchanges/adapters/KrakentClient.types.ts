export interface KrakenClientOptions {
	apiKey: string
	privateKey: string
	timestamp?: number
	version?: number
	baseUrl?: string
}

export interface KrakenClientConfig {
	apiKey: string
	privateKey: string
	nonceOffset: number
	version: number
	baseUrl: string
}


export interface GetAssetInfoOptions {
	assets: string[],
	aclass: string
}
export interface GetAssetPairsOptions {
	pairs: string[],
	infoType?: 'all' | 'leverage' | 'fees' | 'margin'
}
export interface OHLCOptions {
	pair: string,
	interval?: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600
	since?: number
}
export interface OrderBookOptions {
	pair: string,
	count?: number,
}
export interface RecentQueryOptions {
	pair: string,
	since?: number
}

export interface GetOpenOrdersOptions {
	trades?: boolean,
	userref?: number
}

export interface GetClosedOrdersOptions {
	trades?: boolean,
	userref?: number,
	start?: number,
	end?: number,
	ofs?: number,
	closetime?: string
}

export interface QueryOrdersOptions {
	txid: string[],
	trades?: boolean,
	userref?: number
}

export interface TradesHistoryOptions {
	type?: 'all' | 'any position' | 'closed position' | 'closing position' | 'no position',
	trades?: boolean
	start?: number,
	end?: number,
	ofs?: number
}

export interface QueryTradesOptions {
	txid?: string
	trades?: boolean
}


export interface OpenPositionsOptions {
	txid?: string
	docalcs?: boolean
	consolidation?: 'market' | 'pair'
}

export interface LedgersOptions {
	assets?: 'all' | string[]
	aclass?: string
	type?: 'all' | 'deposit' | 'withdrawal' | 'trade' | 'margin'
	start?: number
	end?: number
	ofs?: number
}

export interface QueryLedgersOptions {
	ids?: string[]
	trades?: boolean
}

export interface ExportReportOptions {
	report: 'trades' | 'ledgers'
	description: string
	format?: 'CSV' | 'TSV'
	fields?: 'all' | string[]
	startm?: number
}

export interface DeleteExportReportOptions {
	id: string
	type: 'cancel' | 'delete'
}

type Oflag = 'post' | 'fcib' | 'fciq' | 'nompp'
type Otype = 'market' | 'limit' | 'stop-loss' | 'take-profit' | 'stop-loss-limit' | 'take-profit-limit' | 'settle-position'
export interface AddOrderOptions {
	ordertype: Otype
	type: 'buy' | 'sell'
	pair: string
	price?: string | number
	price2?: string | number
	volume?: string | number
	leverage?: string
	oflags?: Oflag[]
	timeinforce?: 'GTC' | 'IOC' | 'GTD'
	startm?: string | number
	expiretm?: string | number
	close?: {
		ordertype: 'limit' | 'stop-loss' | 'take-profit' | 'stop-loss-limit' | 'take-profit-limit'
		price: string | number
		price2?: string | number
	}
	validate?: boolean
}

export interface GetDepositAddressesOptions {
	asset: string
	method: string
}

export interface RecentDepositsStatusOptions {
	asset: string
	method?: string
}

export interface WithdrawalOptions {
	asset: string
	key: string
	amount: number | string
}

export interface RecentWithdrawalOptions {
	asset: string
	method?: string
}

export interface WithdrawalCancelOptions {
	asset: string
	refid: string
}

type WalletType = 'Spot Wallet' | 'Futures Wallet'
export interface WalletTransferOptions {
	asset: string
	from: WalletType
	to: WalletType
	amount: number | string
}

export interface StakeAssetOptions {
	asset: string
	amount: number | string
	method: string
}

export interface UnstakeAssetOptions {
	asset: string
	amount: number | string
}