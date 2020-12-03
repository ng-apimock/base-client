import * as https from 'https';

import fetch, { Request } from 'node-fetch';
import urljoin = require('url-join');
import * as uuid from 'uuid';

import { Client } from './client';
import { Configuration, DefaultConfiguration } from './configuration';

/** Base client that takes care of the actual invoking of the ng-apimock api. */
abstract class BaseClient implements Client {
    public ngApimockId: string;
    public baseUrl: string;
    private agent: https.Agent;
    private configuration: Configuration;

    /**
     * Constructor.
     * @param {Configuration} configuration The configuration.
     */
    constructor(configuration: Configuration) {
        this.ngApimockId = uuid.v4();
        this.configuration = {
            ...DefaultConfiguration,
            ...JSON.parse(JSON.stringify(configuration)) // removed undefined values
        };

        this.baseUrl = urljoin(this.configuration.baseUrl, this.configuration.basePath);

        this.agent = new https.Agent({
            rejectUnauthorized: false
        });
    }

    /**
     * Delay the mock response.
     * @param {string} name The mock name.
     * @param {number} delay The delay.
     * @return {Promise} promise The promise.
     */
    async delayResponse(name: string, delay: number): Promise<any> {
        return await this.invoke('mocks', 'PUT', { name, delay });
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
        return await this.invoke('mocks', 'PUT', { name, echo });
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
            method,
            headers: {
                Cookie: `${this.configuration.identifier}=${this.ngApimockId}`,
                'Content-Type': 'application/json'
            }
        };

        if (['GET', 'HEAD'].indexOf(method) === -1) {
            requestInit.body = JSON.stringify(body);
        }

        if (this.baseUrl.startsWith('https')) {
            requestInit.agent = this.agent;
        }

        const url = urljoin(this.baseUrl, query);
        return await this.fetchResponse(new Request(url, requestInit))
            .then((response: Response) => {
                if (response.ok) {
                    return response;
                }
                throw new Error(`An error occured while invoking ${url} that resulted in status code ${response.status}`);
            });
    }

    /**
     * Opens the given url.
     * @param {string} url The url.
     * @return {Promise} promise The promise.
     */
    abstract openUrl(url: string): Promise<any>;

    /**
     * Record the requests.
     * @param {boolean} record Indicator record.
     * @return {Promise} promise The promise.
     */
    async recordRequests(record: boolean): Promise<any> {
        return await this.invoke('actions', 'PUT', { action: 'record', record });
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
        return await this.invoke('presets', 'PUT', { name });
    }

    /**
     * Selects the scenario matching the given mock name and scenario.
     * @param {string} name The mock name.
     * @param {string} scenario The scenario name.
     * @return {Promise} promise The promise.
     */
    async selectScenario(name: string, scenario: string): Promise<any> {
        return await this.invoke('mocks', 'PUT', { name, scenario });
    }

    /**
     * Sets the cookie.
     * @param {string} name The cookie name.
     * @param {string} value The cookie value.
     * @return {Promise} promise The promise.
     */
    abstract setCookie(name: string, value: string): Promise<any>;

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
        await this.setCookie(this.configuration.identifier, this.ngApimockId);
        return this;
    }

    /**
     * Sets the variable.
     * @param {string} key The key.
     * @param {any} value The value.
     * @return {Promise} promise The promise.
     */
    async setVariable(key: string, value: any): Promise<any> {
        const body: { [key: string]: any } = {};
        body[key] = value;
        return await this.setVariables(body);
    }

    /**
     * Sets the variables.
     * @param {Object} variables The variables.
     * @return {Promise} promise The promise.
     */
    async setVariables(variables: { [key: string]: any }): Promise<any> {
        return await this.invoke('variables', 'PUT', variables);
    }
}

export {
    BaseClient, Client, Configuration, DefaultConfiguration
};
