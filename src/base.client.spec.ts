import * as sinon from 'sinon';
import * as uuid from 'uuid';

import BaseClient from './base.client';

class TestClient extends BaseClient {
    openUrl(url: string): Promise<any> {
        return undefined;
    }

    setCookie(name: string, value: string): Promise<any> {
        return undefined;
    }
}

describe('BaseClient', () => {
    const BASE_URL = 'http://localhost:9000';

    let client: BaseClient;
    let fetchResponseFn: sinon.SinonStub;
    let invokeFn: sinon.SinonStub;
    let invokeResponseJsonFn: sinon.SinonStub;
    let openUrlFn: sinon.SinonStub;
    let setCookieFn: sinon.SinonStub;
    let setVariablesFn: sinon.SinonStub;
    let uuidV4Fn: sinon.SinonStub;

    beforeAll(() => {
        invokeFn = sinon.stub(BaseClient.prototype, <any>'invoke');
        invokeResponseJsonFn = sinon.stub();
        setVariablesFn = sinon.stub(BaseClient.prototype, <any>'setVariables');
        fetchResponseFn = sinon.stub(BaseClient.prototype, <any>'fetchResponse');
        openUrlFn = sinon.stub(TestClient.prototype, <any>'openUrl');
        setCookieFn = sinon.stub(TestClient.prototype, <any>'setCookie');
        uuidV4Fn = sinon.stub(uuid, <any>'v4').returns('123');

        client = new TestClient(BASE_URL);
    });

    describe('constructor', () => {
        it('sets the apimock id', () =>
            expect(client.ngApimockId).toBeDefined());

        it('sets the baseUrl', () =>
            expect(client.baseUrl).toBe(BASE_URL + '/ngapimock'));
    });

    describe('delayResponse', () => {
        it('delays the mock response', () => {
            const name = 'name';
            const delay = 1000;
            client.delayResponse(name, delay);
            sinon.assert.calledWith(invokeFn, 'mocks', 'PUT', { name: name, delay: delay });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('deleteVariable', () => {
        it('deletes the variable', () => {
            client.deleteVariable('one');
            sinon.assert.calledWith(invokeFn, 'variables/one', 'DELETE', {});
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
            sinon.assert.calledWith(invokeFn, 'mocks', 'PUT', { name: name, echo: echo });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('getMocks', () => {
        beforeEach(() => {
            invokeFn.resolves({ json: invokeResponseJsonFn })
        });

        it('gets the mocks', async () => {
            await client.getMocks();
            sinon.assert.calledWith(invokeFn, 'mocks', 'GET', {});
            sinon.assert.called(invokeResponseJsonFn);
        });

        afterEach(() => {
            invokeFn.reset();
            invokeResponseJsonFn.reset();
        });
    });

    describe('getVariables', () => {
        beforeEach(() => {
            invokeFn.resolves({ json: invokeResponseJsonFn })
        });

        it('gets the variables', async () => {
            await client.getVariables();
            sinon.assert.calledWith(invokeFn, 'variables', 'GET', {});
            sinon.assert.called(invokeResponseJsonFn);
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
                client.invoke('some/query', 'GET', {some:'body'});

                sinon.assert.calledWith(fetchResponseFn, sinon.match(async (actual: Request) => {
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
                client.invoke('some/query', 'DELETE', {some:'body'});

                sinon.assert.calledWith(fetchResponseFn, sinon.match(async (actual: Request) => {
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
                client.invoke('some/query', 'POST', {some:'body'});

                sinon.assert.calledWith(fetchResponseFn, sinon.match(async (actual: Request) => {
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
                client.invoke('some/query', 'PUT', {some:'body'});

                sinon.assert.calledWith(fetchResponseFn, sinon.match(async (actual: Request) => {
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

    describe('resetMocksToDefault', () => {
        it('resets the mocks to defaults', () => {
            client.resetMocksToDefault();
            sinon.assert.calledWith(invokeFn, 'actions', 'PUT', { action: 'defaults' });
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
            sinon.assert.calledWith(invokeFn, 'mocks', 'PUT', { name: name, scenario: scenario });
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
            promise = client.setNgApimockCookie()
        });

        it('opens the init url', async () => {
            await promise;
            sinon.assert.calledWith(openUrlFn, `${BASE_URL}/ngapimock/init`);
        });

        it('sets the cookie', async () => {
            await promise;
            sinon.assert.calledWith(setCookieFn, 'apimockid', client.ngApimockId);
        });

        afterEach(() => {
            openUrlFn.reset();
            setCookieFn.reset();
        });
    });

    describe('setMocksToPassThrough', () => {
        it('sets mocks to passThrough', () => {
            client.setMocksToPassThrough();
            sinon.assert.calledWith(invokeFn, 'actions', 'PUT', { action: 'passThroughs' });
        });

        afterEach(() => {
            invokeFn.reset();
        });
    });

    describe('setVariable', () => {
        it('sets the variable', () => {
            client.setVariable('one', 'first');
            sinon.assert.calledWith(setVariablesFn, { one: 'first' });
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
            sinon.assert.calledWith(invokeFn, 'variables', 'PUT', variables);
        });

        afterEach(() => {
            setVariablesFn.reset();
            invokeFn.reset();
        });
    });

    afterAll(() => {
        invokeFn.restore();
        setVariablesFn.restore();
        fetchResponseFn.restore();
        openUrlFn.restore();
        setCookieFn.restore();
        uuidV4Fn.restore();
    });
});
