import { BaseClient } from './base.client';

class TestClient extends BaseClient {
    openUrl(url: string): Promise<any> {
        return undefined;
    }

    setCookie(name: string, value: string): Promise<any> {
        return undefined;
    }
}

describe('BaseClient', () => {
    let client: BaseClient;
    let openUrlFn: jest.SpyInstance;
    let setCookieFn: jest.SpyInstance;

    beforeEach(() => {
        client = new TestClient({ baseUrl: 'http://localhost:9000' });
        client.ngApimockId = '123';

        openUrlFn = jest.spyOn(client, 'openUrl');
        setCookieFn = jest.spyOn(client, 'setCookie');
    });

    describe('constructor', () => {
        describe('defaults', () => {
            beforeEach(() => {
                client = new TestClient({
                    baseUrl: 'http://localhost:9000',
                    basePath: undefined
                });
                client.ngApimockId = '123';

                openUrlFn = jest.spyOn(client, 'openUrl');
                setCookieFn = jest.spyOn(client, 'setCookie');
            });

            it('sets the apimock id', () => expect(client.ngApimockId).toBeDefined());

            it('sets the baseUrl', () => expect(client.baseUrl).toBe('http://localhost:9000/ngapimock'));

            it('sets the basePath', () => expect(client.baseUrl).toBe('http://localhost:9000/ngapimock'));

            it('sets the https agent', () => expect((client as any).agent).toBeDefined());
        });

        describe('overrides', () => {
            beforeEach(() => {
                client = new TestClient({
                    baseUrl: 'http://localhost:9000',
                    basePath: 'myapimock'
                });
                client.ngApimockId = '123';

                openUrlFn = jest.spyOn(client, 'openUrl');
                setCookieFn = jest.spyOn(client, 'setCookie');
            });
            it('sets the apimock id', () => expect(client.ngApimockId).toBeDefined());

            it('sets the baseUrl', () => expect(client.baseUrl).toBe('http://localhost:9000/myapimock'));

            it('sets the basePath', () => expect(client.baseUrl).toBe('http://localhost:9000/myapimock'));

            it('sets the https agent', () => expect((client as any).agent).toBeDefined());
        });
    });

    describe('createPreset', () => {
        let invokeFn: jest.Mock;
        let getMocksFn: jest.Mock;
        let getVariablesFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();
            getMocksFn = client.getMocks = jest.fn();
            getVariablesFn = client.getVariables = jest.fn();

            getMocksFn.mockResolvedValue({ state: { name: 'my-mock' } });
            getVariablesFn.mockResolvedValue({ state: { name: 'my-variable' } });
        });

        it('persists the preset with mocks and variables', async () => {
            await client.createPreset('my-preset', true, true);

            expect(invokeFn).toHaveBeenCalledWith('presets', 'POST', {
                name: 'my-preset',
                mocks: { name: 'my-mock' },
                variables: { name: 'my-variable' }
            });
        });

        it('persists the preset with mocks and without variables', async () => {
            await client.createPreset('my-preset', true, false);

            expect(invokeFn).toHaveBeenCalledWith('presets', 'POST', {
                name: 'my-preset',
                mocks: { name: 'my-mock' },
                variables: { }
            });
        });

        it('persists the preset with out mocks and with variables', async () => {
            await client.createPreset('my-preset', false, true);

            expect(invokeFn).toHaveBeenCalledWith('presets', 'POST', {
                name: 'my-preset',
                mocks: { },
                variables: { name: 'my-variable' }
            });
        });
    });

    describe('delayResponse', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.delayResponse('name', 1000);
        });

        it('delays the mock response', () => expect(invokeFn).toHaveBeenCalledWith('mocks', 'PUT', {
            name: 'name',
            delay: 1000
        }));
    });

    describe('deleteVariable', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.deleteVariable('one');
        });

        it('deletes the variable', () => expect(invokeFn).toHaveBeenCalledWith('variables/one', 'DELETE', {}));
    });

    describe('echoRequest', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.echoRequest('name', true);
        });

        it('enables the mock request echo', () => expect(invokeFn).toHaveBeenCalledWith('mocks', 'PUT', {
            name: 'name',
            echo: true
        }));
    });

    describe('getMocks', () => {
        let invokeFn: jest.Mock;
        let invokeResponseJsonFn: jest.Mock;

        beforeEach(async () => {
            invokeFn = client.invoke = jest.fn();
            invokeResponseJsonFn = jest.fn();
            invokeFn.mockResolvedValue({ json: invokeResponseJsonFn });

            await client.getMocks();
        });

        it('gets the mocks', () => {
            expect(invokeFn).toHaveBeenCalledWith('mocks', 'GET', {});
            expect(invokeResponseJsonFn).toHaveBeenCalled();
        });
    });

    describe('getPresets', () => {
        let invokeFn: jest.Mock;
        let invokeResponseJsonFn: jest.Mock;

        beforeEach(async () => {
            invokeFn = client.invoke = jest.fn();
            invokeResponseJsonFn = jest.fn();
            invokeFn.mockResolvedValue({ json: invokeResponseJsonFn });

            await client.getPresets();
        });

        it('gets the presets', () => {
            expect(invokeFn).toHaveBeenCalledWith('presets', 'GET', {});
            expect(invokeResponseJsonFn).toHaveBeenCalled();
        });
    });

    describe('getRecordings', () => {
        let invokeFn: jest.Mock;
        let invokeResponseJsonFn: jest.Mock;

        beforeEach(async () => {
            invokeFn = client.invoke = jest.fn();
            invokeResponseJsonFn = jest.fn();
            invokeFn.mockResolvedValue({ json: invokeResponseJsonFn });

            await client.getRecordings();
        });

        it('gets the recordings', () => {
            expect(invokeFn).toHaveBeenCalledWith('recordings', 'GET', {});
            expect(invokeResponseJsonFn).toHaveBeenCalled();
        });
    });

    describe('getVariables', () => {
        let invokeFn: jest.Mock;
        let invokeResponseJsonFn: jest.Mock;

        beforeEach(async () => {
            invokeFn = client.invoke = jest.fn();
            invokeResponseJsonFn = jest.fn();
            invokeFn.mockResolvedValue({ json: invokeResponseJsonFn });

            await client.getVariables();
        });

        it('gets the variables', () => {
            expect(invokeFn).toHaveBeenCalledWith('variables', 'GET', {});
            expect(invokeResponseJsonFn).toHaveBeenCalled();
        });
    });

    describe('invoke', () => {
        let fetchResponseFn: jest.SpyInstance;

        beforeEach(() => {
            fetchResponseFn = jest.spyOn(client, 'fetchResponse');

            fetchResponseFn.mockResolvedValue(({ ok: true, status: 200 }));
        });

        describe('throws an error when fetch returns non 200', () => {
            beforeEach(() => {
                fetchResponseFn.mockResolvedValue(({ ok: false, status: 404 }));
            });

            it('calls the api without body', async () => {
                await expect(client.invoke('some/query', 'GET', { some: 'body' })).rejects
                    .toThrow(expect.objectContaining({
                        message: 'An error occured while invoking http://localhost:9000/ngapimock/some/query that resulted in status code 404'
                    }));
            });
        });

        describe('method is GET', () => {
            it('calls the api without body', (async () => {
                client.invoke('some/query', 'GET', { some: 'body' });

                expect(fetchResponseFn).toHaveBeenCalled();

                const actualRequest = fetchResponseFn.mock.calls[0][0];
                expect(actualRequest.url).toBe('http://localhost:9000/ngapimock/some/query');
                expect(actualRequest.method).toBe('GET');
                expect((actualRequest as any).agent).toBeUndefined();
                expect(actualRequest.headers.get('Cookie')).toBe('apimockid=123');
                expect(actualRequest.headers.get('Content-Type')).toBe('application/json');
                expect(await actualRequest.text()).toBe('');
            }));
        });

        describe('method is HEAD', () => {
            it('calls the api without body', (async () => {
                client.invoke('some/query', 'HEAD', { some: 'body' });

                expect(fetchResponseFn).toHaveBeenCalled();

                const actualRequest = fetchResponseFn.mock.calls[0][0];
                expect(actualRequest.url).toBe('http://localhost:9000/ngapimock/some/query');
                expect(actualRequest.method).toBe('HEAD');
                expect((actualRequest as any).agent).toBeUndefined();
                expect(actualRequest.headers.get('Cookie')).toBe('apimockid=123');
                expect(actualRequest.headers.get('Content-Type')).toBe('application/json');
                expect(await actualRequest.text()).toBe('');
            }));
        });

        describe('method is POST', () => {
            it('calls the api with body', (async () => {
                client.invoke('some/query', 'POST', { some: 'body' });

                expect(fetchResponseFn).toHaveBeenCalled();

                const actualRequest = fetchResponseFn.mock.calls[0][0];
                expect(actualRequest.url).toBe('http://localhost:9000/ngapimock/some/query');
                expect(actualRequest.method).toBe('POST');
                expect((actualRequest as any).agent).toBeUndefined();
                expect(actualRequest.headers.get('Cookie')).toBe('apimockid=123');
                expect(actualRequest.headers.get('Content-Type')).toBe('application/json');
                expect(await actualRequest.text()).toBe('{"some":"body"}');
            }));
        });

        describe('method is PUT', () => {
            it('calls the api without body', (async () => {
                client.invoke('some/query', 'PUT', { some: 'body' });

                expect(fetchResponseFn).toHaveBeenCalled();

                const actualRequest = fetchResponseFn.mock.calls[0][0];
                expect(actualRequest.url).toBe('http://localhost:9000/ngapimock/some/query');
                expect(actualRequest.method).toBe('PUT');
                expect((actualRequest as any).agent).toBeUndefined();
                expect(actualRequest.headers.get('Cookie')).toBe('apimockid=123');
                expect(actualRequest.headers.get('Content-Type')).toBe('application/json');
                expect(await actualRequest.text()).toBe('{"some":"body"}');
            }));
        });

        describe('adds the agent when https', () => {
            beforeEach(() => {
                client.baseUrl = 'https://localhost:9000';

                client.invoke('some/query', 'GET', { some: 'body' });
            });

            it('adds the agent to the request options', (async () => {
                expect(fetchResponseFn).toHaveBeenCalled();

                const actualRequest = fetchResponseFn.mock.calls[0][0];
                expect((actualRequest as any).agent).toBeDefined();
            }));
        });
    });

    describe('recordRequests', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.recordRequests(true);
        });

        it('enables the recording the requests', () => expect(invokeFn).toHaveBeenCalledWith('actions', 'PUT', {
            action: 'record',
            record: true
        }));
    });

    describe('resetMocksToDefault', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.resetMocksToDefault();
        });

        it('resets the mocks to defaults', () => expect(invokeFn).toHaveBeenCalledWith('actions', 'PUT', { action: 'defaults' }));
    });

    describe('selectPreset', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.selectPreset('preset name');
        });

        it('selects the preset', () => expect(invokeFn).toHaveBeenCalledWith('presets', 'PUT', { name: 'preset name' }));
    });

    describe('selectScenario', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.selectScenario('name', 'scenario');
        });

        it('selects the mock scenario', () => expect(invokeFn).toHaveBeenCalledWith('mocks', 'PUT', {
            name: 'name',
            scenario: 'scenario'
        }));
    });

    describe('setMocksToPassThrough', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.setMocksToPassThrough();
        });

        it('sets mocks to passThrough', () => expect(invokeFn).toHaveBeenCalledWith('actions', 'PUT', { action: 'passThroughs' }));
    });

    describe('setNgApimockCookie', () => {
        describe('defaults', () => {
            beforeEach(async () => {
                openUrlFn.mockImplementation(() => {
                });
                setCookieFn.mockImplementation(() => {
                });

                await client.setNgApimockCookie();
            });

            it('opens the init url', () => expect(openUrlFn).toHaveBeenCalledWith('http://localhost:9000/ngapimock/init'));

            it('sets the cookie', () => expect(setCookieFn).toHaveBeenCalledWith('apimockid', client.ngApimockId));
        });

        describe('override', () => {
            beforeEach(async () => {
                client = new TestClient({
                    baseUrl: 'http://localhost:9000',
                    basePath: 'myapimock',
                    identifier: 'awesomemock'
                });
                client.ngApimockId = '123';

                openUrlFn = jest.spyOn(client, 'openUrl');
                setCookieFn = jest.spyOn(client, 'setCookie');
                openUrlFn.mockImplementation(() => {
                });
                setCookieFn.mockImplementation(() => {
                });

                await client.setNgApimockCookie();
            });

            it('opens the init url', () => expect(openUrlFn).toHaveBeenCalledWith('http://localhost:9000/myapimock/init'));

            it('sets the cookie', () => expect(setCookieFn).toHaveBeenCalledWith('awesomemock', client.ngApimockId));
        });
    });

    describe('setVariable', () => {
        let setVariablesFn: jest.Mock;

        beforeEach(() => {
            setVariablesFn = client.setVariables = jest.fn();

            client.setVariable('one', 'first');
        });

        it('sets the variable', () => expect(setVariablesFn).toHaveBeenCalledWith({ one: 'first' }));
    });

    describe('setVariables', () => {
        let invokeFn: jest.Mock;

        beforeEach(() => {
            invokeFn = client.invoke = jest.fn();

            client.setVariables({ one: 'first', enabled: true });
        });

        it('sets the variables', () => expect(invokeFn).toHaveBeenCalledWith('variables', 'PUT', {
            one: 'first',
            enabled: true
        }));
    });
});
