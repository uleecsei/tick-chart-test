export interface IChartPriceData {
    a?: number,
    b?: string
    c?: number,
    d?: number,
    e?: number,
    f?: number,
    value?: number
    time?: number
}

export enum EAsset {
    EURUSD = 'EURUSD',
    EURGBP = 'EURGBP',
    EURCAD = 'EURCAD',
    EURAUD = 'EURAUD'
}