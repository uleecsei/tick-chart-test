import { TableColumnDefinition } from "ag-grid-lib";

export const PricesDefinition: TableColumnDefinition[] = [
    {
        Field: 'a',
        Header: 'ServerId',
    },
    {
        Field: 'b',
        Header: 'Asset',
    },
    {
        Field: 'c',
        Header: 'Bid',
        IsAnimatable: true,
    },
    {
        Field: 'd',
        Header: 'Ask',
        IsAnimatable: true,
    },
    {
        Field: 'e',
        Header: 'Spread',
        IsAnimatable: true,
    },
    {
        Field: 'f',
        Header: 'Timestamp',
        LocalDateFormat: 'YYYY-MM-dd HH:mm:ss',
    }
]
