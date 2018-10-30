import fetch, {Request} from 'node-fetch';
import * as uuid from 'uuid';
import * as urljoin from 'url-join';

const COOKIE_NAME = 'apimockid';

/** Base client that takes care of the actual invoking of the ng-apimock api.*/
abstract class BaseClient {
    public ngApimockId: string;
    public baseUrl: string;

    /**
     * Constructor.
     * @param {string} baseUrl The base url.
     */
    constructor(baseUrl: string) {
        this.ngApimockId = uuid.v4();
        this.baseUrl = urljoin(baseUrl, 'ngapimock');
    }

    /**
     * Delay the mock response.
     * @param {string} name The mock name.
     * @param {number} delay The delay.
     * @return {Promise} promise The promise.
     */
    async delayResponse(name: string, delay: number): Promise<any> {
        return await this.invoke('mocks', 'PUT', { name: name, delay: delay });
    }

    /**
     * Delete the variable matching the given key.
     * @param {string} key The key.
     * @return {Promise} promise The promise.
     */
    async deleteVariable(key: string): Promise<any> {
        return await this.invoke(`variables/${key}`, 'DELETE', {});
    }

    /**
     * Echo the request.
     * @param {string} name The mock name.
     * @param {boolean} echo Indicator echo.
     * @return {Promise} promise The promise.
     */
    async echoRequest(name: string, echo: boolean): Promise<any> {
        return await this.invoke('mocks', 'PUT', { name: name, echo: echo });
    }


    /**
     * Fetch the request.
     * @param {Request} request The request.
     * @return {Promise<any>} promise The promise.
     */
    async fetchResponse(request: Request): Promise<any> {
        return await fetch(request);
    }

    /**
     * Gets the mocks.
     * @return {Promise} promise The promise.
     */
    async getMocks(): Promise<any> {
        const response = await this.invoke('mocks', 'GET', {});
        return await response.json();
    }

    /**
     * Gets the presets.
     * @return {Promise} promise The promise.
     */
    async getPresets(): Promise<any> {
        const response = await this.invoke('presets', 'GET', {});
        return await response.json();
    }

    /**
     * Gets the recordings.
     * @return {Promise} promise The promise.
     */
    async getRecordings(): Promise<any> {
        const response = await this.invoke('recordings', 'GET', {});
        return await response.json();
    }

    /**
     * Gets the variables.
     * @return {Promise} promise The promise.
     */
    async getVariables(): Promise<any> {
        const response = await this.invoke('variables', 'GET', {});
        return await response.json();
    }

    /**
     * Invokes the api and handles the response.
     * @param {string} query The query.
     * @param {string} method The method.
     * @param {Object} body The body.
     */
    async invoke(query: string, method: string, body: any): Promise<any> {
        const requestInit: any = {
            method: method,
            headers: {
                'Cookie': `${COOKIE_NAME}=${this.ngApimockId}`,
                'Content-Type': 'application/json'
            }
        };

        if (['GET', 'DELETE'].indexOf(method) === -1) {
            requestInit.body = JSON.stringify(body);
        }

        return await this.fetchResponse(new Request(urljoin(this.baseUrl, query), requestInit));
    }

    /**
     * Opens the given url.
     * @param {string} url The url.
     * @return {Promise} promise The promise.
     */
    abstract async openUrl(url: string): Promise<any>;

    /**
     * Record the requests.
     * @param {boolean} record Indicator record.
     * @return {Promise} promise The promise.
     */
    async recordRequests(record: boolean): Promise<any> {
        return await this.invoke('actions', 'PUT', { action: 'record', record: record });
    }

    /**
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     */
    async resetMocksToDefault(): Promise<any> {
        await this.invoke('actions', 'PUT', { action: 'defaults' });
    }

    /**
     * Selects the preset matching the given preset name.
     * @param {string} name The mock name.
     * @return {Promise} promise The promise.
     */
    async selectPreset(name: string): Promise<any> {
        return await this.invoke('presets', 'PUT', { name: name });
    }

    /**
     * Selects the scenario matching the given mock name and scenario.
     * @param {string} name The mock name.
     * @param {string} scenario The scenario name.
     * @return {Promise} promise The promise.
     */
    async selectScenario(name: string, scenario: string): Promise<any> {
        return await this.invoke('mocks', 'PUT', { name: name, scenario: scenario });
    }

    /**
     * Sets the cookie.
     * @param {string} name The cookie name.
     * @param {string} value The cookie value.
     * @return {Promise} promise The promise.
     */
    abstract async setCookie(name: string, value: string): Promise<any>;

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     */
    async setMocksToPassThrough(): Promise<any> {
        return await this.invoke('actions', 'PUT', { action: 'passThroughs' });
    }

    /**
     * Sets the apimock cookie.
     * @return {Promise} promise The promise.
     */
    async setNgApimockCookie(): Promise<any> {
        await this.openUrl(urljoin(this.baseUrl, 'init'));
        await this.setCookie(COOKIE_NAME, this.ngApimockId);
        return this;
    }

    /**
     * Sets the variable.
     * @param {string} key The key.
     * @param {string} value The value.
     * @return {Promise} promise The promise.
     */
    async setVariable(key: string, value: string): Promise<any> {
        const body: { [key: string]: string } = {};
        body[key] = value;
        return await this.setVariables(body);
    }

    /**
     * Sets the variables.
     * @param {Object} variables The variables.
     * @return {Promise} promise The promise.
     */
    async setVariables(variables: { [key: string]: string }): Promise<any> {
        return await this.invoke('variables', 'PUT', variables);
    }
}

export default BaseClient;