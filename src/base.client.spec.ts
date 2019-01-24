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
    let fetchResponseFn: SinonStub;
    let invokeFn: SinonStub;
    let invokeResponseJsonFn: SinonStub;
    let openUrlFn: SinonStub;
    let setCookieFn: SinonStub;
    let setVariablesFn: SinonStub;
    let uuidV4Fn: SinonStub;

    beforeEach(() => {
        invokeFn = stub(BaseClient.prototype, 'invoke');
        invokeResponseJsonFn = stub();
        setVariablesFn = stub(BaseClient.prototype, 'setVariables');
        fetchResponseFn = stub(BaseClient.prototype, 'fetchResponse');
        openUrlFn = stub(TestClient.prototype, 'openUrl');
        setCookieFn = stub(TestClient.prototype, 'setCookie');
        uuidV4Fn = stub(uuid, 'v4').returns('123' as any);

        client = new TestClient('http://localhost:9000');
    });

    describe('constructor', () => {
        it('sets the apimock id', () =>
            expect(client.ngApimockId).toBeDefined());

        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe('http://localhost:9000' + '/ngapimock'));
    });

    describe('delayResponse', () => {
        it('delays the mock response', () => {
            const name = 'name';
            const delay = 1000;
            client.delayResponse(name, delay);
            assert.calledWith(invokeFn, 'mocks', 'PUT', { name: name, delay: delay });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('deleteVariable', () => {
        it('deletes the variable', () => {
            client.deleteVariable('one');
            assert.calledWith(invokeFn, 'variables/one', 'DELETE', {});
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('echoRequest', () => {
        it('enables the mock request echo', () => {
            const name = 'name';
            const echo = true;
            client.echoRequest(name, echo);
            assert.calledWith(invokeFn, 'mocks', 'PUT', { name: name, echo: echo });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('getMocks', () => {
        beforeEach(() => {
            invokeFn.resolves({ json: invokeResponseJsonFn });
        });

        it('gets the mocks', async () => {
            await client.getMocks();
            assert.calledWith(invokeFn, 'mocks', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });

        afterEach(() => {
            invokeFn.reset();
            invokeResponseJsonFn.reset();
        });
    });

    describe('getPresets', () => {
        beforeEach(() => {
            invokeFn.resolves({ json: invokeResponseJsonFn });
        });

        it('gets the presets', async () => {
            await client.getPresets();
            assert.calledWith(invokeFn, 'presets', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });

        afterEach(() => {
            invokeFn.reset();
            invokeResponseJsonFn.reset();
        });
    });

    describe('getRecordings', () => {
        beforeEach(() => {
            invokeFn.resolves({ json: invokeResponseJsonFn });
        });

        it('gets the recordings', async () => {
            await client.getRecordings();
            assert.calledWith(invokeFn, 'recordings', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });

        afterEach(() => {
            invokeFn.reset();
            invokeResponseJsonFn.reset();
        });
    });

    describe('getVariables', () => {
        beforeEach(() => {
            invokeFn.resolves({ json: invokeResponseJsonFn });
        });

        it('gets the variables', async () => {
            await client.getVariables();
            assert.calledWith(invokeFn, 'variables', 'GET', {});
            assert.called(invokeResponseJsonFn);
        });

        afterEach(() => {
            invokeFn.reset();
            invokeResponseJsonFn.reset();
        });
    });

    describe('invoke', () => {
        beforeEach(() => {
            invokeFn.callThrough();
        });

        describe('method is GET', () => {
            it('calls the api without body', () => {
                client.invoke('some/query', 'GET', { some: 'body' });

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
                client.invoke('some/query', 'DELETE', { some: 'body' });

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
                client.invoke('some/query', 'POST', { some: 'body' });

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
                client.invoke('some/query', 'PUT', { some: 'body' });

                assert.calledWith(fetchResponseFn, match(async (actual: Request) => {
                    expect(actual.method).toBe('PUT');
                    expect(actual.url).toBe('http://localhost:9000/ngapimock/some/query');
                    expect(actual.headers.get('Cookie')).toBe('apimockid=123');
                    expect(actual.headers.get('Content-Type')).toBe('application/json');
                    return expect(await actual.text()).toBe('{"some":"body"}');
                }));
            });
        });

        afterEach(() => {
            fetchResponseFn.reset();
        });
    });

    describe('recordRequests', () => {
        it('enables the recording the requests', () => {
            client.recordRequests(true);
            assert.calledWith(invokeFn, 'actions', 'PUT', { action: 'record', record: true });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('resetMocksToDefault', () => {
        it('resets the mocks to defaults', () => {
            client.resetMocksToDefault();
            assert.calledWith(invokeFn, 'actions', 'PUT', { action: 'defaults' });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('selectPreset', () => {
        it('selects the preset', () => {
            const name = 'preset name';
            client.selectPreset(name);
            assert.calledWith(invokeFn, 'presets', 'PUT', { name: name });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('selectScenario', () => {
        it('selects the mock scenario', () => {
            const name = 'name';
            const scenario = 'scenario';
            client.selectScenario(name, scenario);
            assert.calledWith(invokeFn, 'mocks', 'PUT', { name: name, scenario: scenario });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('setApimockCookie', () => {
        let promise: Promise<any>;

        beforeEach(() => {
            openUrlFn.resolves();
            setCookieFn.resolves();
            promise = client.setNgApimockCookie();
        });

        it('opens the init url', async () => {
            await promise;
            assert.calledWith(openUrlFn, `${'http://localhost:9000'}/ngapimock/init`);
        });

        it('sets the cookie', async () => {
            await promise;
            assert.calledWith(setCookieFn, 'apimockid', client.ngApimockId);
        });

        afterEach(() => {
            openUrlFn.reset();
            setCookieFn.reset();
        });
    });

    describe('setMocksToPassThrough', () => {
        it('sets mocks to passThrough', () => {
            client.setMocksToPassThrough();
            assert.calledWith(invokeFn, 'actions', 'PUT', { action: 'passThroughs' });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('setVariable', () => {
        it('sets the variable', () => {
            client.setVariable('one', 'first');
            assert.calledWith(setVariablesFn, { one: 'first' });
        });

        afterEach(() => {
            setVariablesFn.reset();
        });
    });

    describe('setVariables', () => {
        let variables: { [key: string]: string };
        beforeEach(() => {
            setVariablesFn.callThrough();
            variables = { 'one': 'first', 'two': 'second' };
        });

        it('sets the variables', () => {
            client.setVariables(variables);
            assert.calledWith(invokeFn, 'variables', 'PUT', variables);
        });

        afterEach(() => {
            setVariablesFn.reset();
            invokeFn.reset();
        });
    });

    afterEach(() => {
        invokeFn.restore();
        setVariablesFn.restore();
        fetchResponseFn.restore();
        openUrlFn.restore();
        setCookieFn.restore();
        uuidV4Fn.restore();
    });
});
