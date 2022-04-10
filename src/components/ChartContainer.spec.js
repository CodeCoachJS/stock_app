import ChartContainer from './ChartContainer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ChartContainer', () => {
    const unmockedFetch = global.fetch;

    const QUERY_DATA = {
        bestMatches: [
            {
                '1. symbol': 'IBM',
                '2. name': 'International Business Machines Corp',
                '3. type': 'Equity',
                '4. region': 'United States',
                '5. marketOpen': '09:30',
                '6. marketClose': '16:00',
                '7. timezone': 'UTC-04',
                '8. currency': 'USD',
                '9. matchScore': '1.0000',
            },
            {
                '1. symbol': 'IBMK',
                '2. name': 'iShares iBonds Dec 2022 Term Muni Bond ETF',
                '3. type': 'ETF',
                '4. region': 'United States',
                '5. marketOpen': '09:30',
                '6. marketClose': '16:00',
                '7. timezone': 'UTC-04',
                '8. currency': 'USD',
                '9. matchScore': '0.8571',
            },
        ],
    };

    const STOCK_DATA = {
        'Meta Data': {
            '1. Information':
                'Daily Prices (open, high, low, close) and Volumes',
            '2. Symbol': 'IBM',
            '3. Last Refreshed': '2022-03-29',
            '4. Output Size': 'Compact',
            '5. Time Zone': 'US/Eastern',
        },
        'Time Series (Daily)': {
            '2022-03-29': {
                '1. open': '132.0400',
                '2. high': '132.8400',
                '3. low': '130.4300',
                '4. close': '131.9400',
                '5. volume': '5791032',
            },
            '2022-03-28': {
                '1. open': '130.8200',
                '2. high': '131.5000',
                '3. low': '129.6000',
                '4. close': '131.4700',
                '5. volume': '2483492',
            },
            '2022-03-25': {
                '1. open': '129.5000',
                '2. high': '131.4000',
                '3. low': '129.3100',
                '4. close': '131.3500',
                '5. volume': '3516923',
            },
            '2022-03-24': {
                '1. open': '128.3300',
                '2. high': '129.3700',
                '3. low': '127.8000',
                '4. close': '129.2500',
                '5. volume': '2971075',
            },
            '2022-03-23': {
                '1. open': '129.0800',
                '2. high': '129.3200',
                '3. low': '128.2500',
                '4. close': '128.3000',
                '5. volume': '2924535',
            },
            '2022-03-22': {
                '1. open': '128.5000',
                '2. high': '129.3000',
                '3. low': '127.8500',
                '4. close': '129.0600',
                '5. volume': '2649026',
            },
            '2022-03-21': {
                '1. open': '129.0000',
                '2. high': '129.7400',
                '3. low': '127.4000',
                '4. close': '128.1000',
                '5. volume': '3379393',
            },
            '2022-03-18': {
                '1. open': '127.3800',
                '2. high': '128.9300',
                '3. low': '126.3700',
                '4. close': '128.7600',
                '5. volume': '7400216',
            },
            '2022-03-17': {
                '1. open': '127.1000',
                '2. high': '128.2900',
                '3. low': '126.5300',
                '4. close': '127.9600',
                '5. volume': '3671903',
            },
        },
    };

    let fetchMock;

    beforeEach(() => {
        fetchMock = jest.spyOn(global, 'fetch').mockImplementation((url) => {
            if (url.includes('TIME_SERIES_DAILY')) {
                return Promise.resolve({
                    json: () => {
                        return Promise.resolve(STOCK_DATA);
                    },
                });
            }

            return Promise.resolve({
                json: () => {
                    return Promise.resolve(QUERY_DATA);
                },
            });
        });
    });

    afterAll(() => {
        global.fetch = unmockedFetch;
    });

    it('does not show a chart if no data is available', () => {
        render(<ChartContainer />);
        expect(
            screen.getByText('Enter a stock symbol to get started')
        ).toBeTruthy();
    });

    it('only makes a request after at least 3 characters are entered in the searchbar', async () => {
        render(<ChartContainer />);

        const searchBar = screen.getByTestId('searchbar');
        userEvent.type(searchBar, 'IB');
        expect(fetchMock).toBeCalledTimes(0);

        userEvent.type(searchBar, 'M');
        expect(fetchMock).toBeCalledTimes(1);
    });

    it('it makes a request for a specific stock once the dropdown is clicked', async () => {
        render(<ChartContainer />);

        const searchBar = screen.getByTestId('searchbar');
        userEvent.type(searchBar, 'IBM');

        const ibmOption = await screen.findByTestId('IBM');
        userEvent.click(ibmOption);

        expect(await screen.findByTestId('highchart')).toBeTruthy();
    });
});
