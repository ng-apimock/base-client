import fetch, {Request} from 'node-fetch';
import * as path from 'path';
import * as uuid from 'uuid';
import * as urljoin from 'url-join';

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
     * Opens the given url.
     * @param {string} url The url.
     * @return {Promise} promise The promise.
     */
    abstract async openUrl(url: string): Promise<any>;

    /**
     * Sets the cookie.
     * @param {string} name The cookie name.
     * @param {string} value The cookie value.
     * @return {Promise} promise The promise.
     */
    abstract async setCookie(name: string, value: string): Promise<any>;

    /**
     * Gets the mocks.
     * @return {Promise} promise The promise.
     */
    async getMocks(): Promise<any> {
        const response = await this.invoke('mocks', 'GET', {});
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
     * Delay the mock response.
     * @param {string} name The mock name.
     * @param {number} delay The delay.
     * @return {Promise} promise The promise.
     */
    async delayResponse(name: string, delay: number): Promise<any> {
        return await this.invoke('mocks', 'PUT', { name: name, delay: delay });
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
     * Sets the apimock cookie.
     * @return {Promise} promise The promise.
     */
    async setNgApimockCookie(): Promise<any> {
        await this.openUrl(path.join(this.baseUrl, 'init'));
        await this.setCookie('ngApimockId', this.ngApimockId);
        return this;
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
     * @param {Object} body The body.
     * @return {Promise} promise The promise.
     */
    async setVariables(body: { [key: string]: string }): Promise<any> {
        return await this.invoke('variables', 'PUT', body);
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
     * Sets for all the mocks the selected scenario back to the default.
     * @return {Promise} promise The promise.
     */
    async resetMocksToDefault(): Promise<any> {
        await this.invoke('actions', 'PUT', { action: 'defaults' });
    }

    /**
     * Sets for all the mocks the selected scenario to the passThrough.
     * @return {Promise} promise The promise.
     */
    async setMocksToPassThrough(): Promise<any> {
        return await this.invoke('actions', 'PUT', { action: 'passThroughs' });
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
                'Cookie': `apimockid=${this.ngApimockId}`,
                'Content-Type': 'application/json'
            }
        };

        if (['GET', 'DELETE'].indexOf(method) === -1) {
            requestInit.body = JSON.stringify(body);
        }

        return await this.fetchResponse(new Request(urljoin(this.baseUrl, query), requestInit));
    }

    /**
     * Fetch the request.
     * @param {Request} request The request.
     * @return {Promise<any>} promise The promise.
     */
    fetchResponse(request: Request): Promise<any> {
        return fetch(request);
    }
}

export default BaseClient;