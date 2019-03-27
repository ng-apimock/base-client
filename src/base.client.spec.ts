import * as uuid from 'uuid';
import {assert, match, SinonStub, stub} from 'sinon';
import {BaseClient} from './base.client';

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
    let openUrlFn: SinonStub;
    let setCookieFn: SinonStub;
    let stubs: SinonStub[];
    let uuidV4Fn: SinonStub;

    beforeEach(() => {
        stubs = [
            uuidV4Fn = stub(uuid, 'v4'),
            openUrlFn = stub(TestClient.prototype, 'openUrl'),
            setCookieFn = stub(TestClient.prototype, 'setCookie')
        ];

        uuidV4Fn.returns('123' as any);

        client = new TestClient('http://localhost:9000');
    });

    afterEach(() => stubs.forEach((stub) => stub.restore()));

    describe('constructor', () => {
        it('sets the apimock id', () =>
            expect(client.ngApimockId).toBeDefined());

        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe('http://localhost:9000' + '/ngapimock'));
    });

    describe('delayResponse', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.delayResponse('name', 1000);
        });

        afterEach(() => invokeFn.restore());

        it('delays the mock response', () =>
            assert.calledWith(invokeFn, 'mocks', 'PUT', {name: 'name', delay: 1000}));
    });

    describe('deleteVariable', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.deleteVariable('one');
        });

        afterEach(() => invokeFn.restore());

        it('deletes the variable', () =>
            assert.calledWith(invokeFn, 'variables/one', 'DELETE', {}));
    });

    describe('echoRequest', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.echoRequest('name', true);
        });

        afterEach(() => invokeFn.restore());

        it('enables the mock request echo', () =>
            assert.calledWith(invokeFn, 'mocks', 'PUT', {name: 'name', echo: true}));
    });

    describe('getMocks', () => {
        let invokeFn: SinonStub;
        let invokeResponseJsonFn: SinonStub;

        beforeEach(async () => {
            invokeResponseJsonFn = stub();
            invokeFn = stub(BaseClient.prototype, 'invoke')
            invokeFn.resolves({json: invokeResponseJsonFn});

            await client.getMocks();
        });

        afterEach(() => invokeFn.restore());

        it('gets the mocks', () => {
            assert.calledWith(invokeFn, 'mocks', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });
    });

    describe('getPresets', () => {
        let invokeFn: SinonStub;
        let invokeResponseJsonFn: SinonStub;

        beforeEach(async () => {
            invokeResponseJsonFn = stub();
            invokeFn = stub(BaseClient.prototype, 'invoke')
            invokeFn.resolves({json: invokeResponseJsonFn});

            await client.getPresets();
        });

        afterEach(() => invokeFn.restore());

        it('gets the presets', () => {
            assert.calledWith(invokeFn, 'presets', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });
    });

    describe('getRecordings', () => {
        let invokeFn: SinonStub;
        let invokeResponseJsonFn: SinonStub;

        beforeEach(async () => {
            invokeResponseJsonFn = stub();
            invokeFn = stub(BaseClient.prototype, 'invoke')
            invokeFn.resolves({json: invokeResponseJsonFn});

            await client.getRecordings();
        });

        afterEach(() => invokeFn.restore());

        it('gets the recordings', () => {
            assert.calledWith(invokeFn, 'recordings', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });
    });

    describe('getVariables', () => {
        let invokeFn: SinonStub;
        let invokeResponseJsonFn: SinonStub;

        beforeEach(async () => {
            invokeResponseJsonFn = stub();
            invokeFn = stub(BaseClient.prototype, 'invoke')
            invokeFn.resolves({json: invokeResponseJsonFn});

            await client.getVariables();
        });

        afterEach(() => invokeFn.restore());

        it('gets the variables', () => {
            assert.calledWith(invokeFn, 'variables', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });
    });

    describe('invoke', () => {
        let fetchResponseFn: SinonStub;

        beforeEach(() => {
            fetchResponseFn = stub(BaseClient.prototype, 'fetchResponse');

            fetchResponseFn.resolves(({ok: true, status: 200}))
        });

        afterEach(() => fetchResponseFn.restore());

        describe('throws an error when fetch returns non 200', () => {
            beforeEach(() => {
                fetchResponseFn.resolves(({ok: false, status: 404}))
            });

            it('calls the api without body', async () => {
                try {
                    await client.invoke('some/query', 'GET', {some: 'body'});
                    fail();
                } catch (error) {
                    expect(error.message).toBe('An error occured while invoking http://localhost:9000/ngapimock/some/query that resulted in status code 404')
                }
            });
        });


        describe('method is GET', () => {
            it('calls the api without body', () => {
                client.invoke('some/query', 'GET', {some: 'body'});

                assert.calledWith(fetchResponseFn, match(async (actual: Request) => {
                    expect(actual.method).toBe('GET');
                    expect(actual.url).toBe('http://localhost:9000/ngapimock/some/query');
                    expect(actual.headers.get('Cookie')).toBe('apimockid=123');
                    expect(actual.headers.get('Content-Type')).toBe('application/json');
                    return expect(await actual.text()).toBe('');
                }));
            });
        });

        describe('method is DELETE', () => {
            it('calls the api without body', () => {
                client.invoke('some/query', 'DELETE', {some: 'body'});

                assert.calledWith(fetchResponseFn, match(async (actual: Request) => {
                    expect(actual.method).toBe('DELETE');
                    expect(actual.url).toBe('http://localhost:9000/ngapimock/some/query');
                    expect(actual.headers.get('Cookie')).toBe('apimockid=123');
                    expect(actual.headers.get('Content-Type')).toBe('application/json');
                    return expect(await actual.text()).toBe('');
                }));
            });
        });

        describe('method is POST', () => {
            it('calls the api without body', () => {
                client.invoke('some/query', 'POST', {some: 'body'});

                assert.calledWith(fetchResponseFn, match(async (actual: Request) => {
                    expect(actual.method).toBe('POST');
                    expect(actual.url).toBe('http://localhost:9000/ngapimock/some/query');
                    expect(actual.headers.get('Cookie')).toBe('apimockid=123');
                    expect(actual.headers.get('Content-Type')).toBe('application/json');
                    return expect(await actual.text()).toBe('{"some":"body"}');
                }));
            });
        });

        describe('method is PUT', () => {
            it('calls the api without body', () => {
                client.invoke('some/query', 'PUT', {some: 'body'});

                assert.calledWith(fetchResponseFn, match(async (actual: Request) => {
                    expect(actual.method).toBe('PUT');
                    expect(actual.url).toBe('http://localhost:9000/ngapimock/some/query');
                    expect(actual.headers.get('Cookie')).toBe('apimockid=123');
                    expect(actual.headers.get('Content-Type')).toBe('application/json');
                    return expect(await actual.text()).toBe('{"some":"body"}');
                }));
            });
        });
    });


    describe('recordRequests', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.recordRequests(true);
        });

        afterEach(() => invokeFn.restore());

        it('enables the recording the requests', () =>
            assert.calledWith(invokeFn, 'actions', 'PUT', {action: 'record', record: true}));
    });

    describe('resetMocksToDefault', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.resetMocksToDefault();
        });

        afterEach(() => invokeFn.restore());

        it('resets the mocks to defaults', () =>
            assert.calledWith(invokeFn, 'actions', 'PUT', {action: 'defaults'}));
    });

    describe('selectPreset', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.selectPreset('preset name');
        });

        afterEach(() => invokeFn.restore());

        it('selects the preset', () =>
            assert.calledWith(invokeFn, 'presets', 'PUT', {name: 'preset name'}));
    });

    describe('selectScenario', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.selectScenario('name', 'scenario');
        });

        afterEach(() => invokeFn.restore());

        it('selects the mock scenario', () =>
            assert.calledWith(invokeFn, 'mocks', 'PUT', {name: 'name', scenario: 'scenario'}));
    });

    describe('setMocksToPassThrough', () => {
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.setMocksToPassThrough();
        });

        afterEach(() => invokeFn.restore());

        it('sets mocks to passThrough', () =>
            assert.calledWith(invokeFn, 'actions', 'PUT', {action: 'passThroughs'}));
    });

    describe('setNgApimockCookie', () => {

        beforeEach(async () => {
            openUrlFn.resolves();
            setCookieFn.resolves();

            await client.setNgApimockCookie();
        });

        afterEach(() => {
            openUrlFn.reset();
            setCookieFn.reset();
        });

        it('opens the init url', () => {
            assert.calledWith(openUrlFn, `${'http://localhost:9000'}/ngapimock/init`);
        });

        it('sets the cookie', () => {
            assert.calledWith(setCookieFn, 'apimockid', client.ngApimockId);
        });
    });


    describe('setVariable', () => {
        let setVariablesFn: SinonStub;

        beforeEach(() => {
            setVariablesFn = stub(BaseClient.prototype, 'setVariables');

            client.setVariable('one', 'first');
        });

        afterEach(() => {
            setVariablesFn.restore();
        });

        it('sets the variable', () =>
            assert.calledWith(setVariablesFn, {one: 'first'}));
    });

    describe('setVariables', () => {
        let variables: { [key: string]: string };
        let invokeFn: SinonStub;

        beforeEach(() => {
            invokeFn = stub(BaseClient.prototype, 'invoke');

            client.setVariables({'one': 'first', 'two': 'second'});
        });

        afterEach(() => invokeFn.restore());

        it('sets the variables', () =>
            assert.calledWith(invokeFn, 'variables', 'PUT', {'one': 'first', 'two': 'second'}));
    });


});
