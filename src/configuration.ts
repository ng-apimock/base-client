export interface Configuration {
    baseUrl: string;
    basePath?: string;
    identifier?: string;
    useHeader?: boolean;
}

export const DefaultConfiguration: Configuration = {
    baseUrl: undefined,
    basePath: '/ngapimock',
    identifier: 'apimockid',
    useHeader: false
};
