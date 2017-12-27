'use strict';

const ApiClient = require('./api_client');
const PlayerController = require('./player_controller');

class TestContext
{
    constructor()
    {
        const { API_TESTS_BUILD_TYPE, API_TESTS_PORT } = process.env;

        this.config = Object.freeze({
            buildType: API_TESTS_BUILD_TYPE  || 'debug',
            port: parseInt(API_TESTS_PORT) || 8879,
        });

        this.client = new ApiClient(`http://localhost:${this.config.port}`);
        this.player = new PlayerController(this.config);

        this.moduleHooks = Object.freeze({
            before: this.beginTests.bind(this),
            after: this.endTests.bind(this),
        });
    }

    async beginTests()
    {
        await this.player.start();

        if (await this.client.waitUntilReady())
            return;

        const logData = await this.player.getLog();
        console.error('Player run log:\n%s', logData);
        throw Error('Failed to reach API endpoint');
    }

    async endTests()
    {
        this.client.cancelRequests();
        await this.player.stop();
    }
}

module.exports = new TestContext();