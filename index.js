/**
 * Module dependencies
 */
const webpack = require('webpack');

/**
 * Webpack hook
 *
 * @description :: A hook to compile assets using Webhook.
 */
module.exports = function defineWebpackHook(sails) {

	return {

		/**
		 * defaults
		 *
		 * The implicit configuration defaults merged into `sails.config` by this hook.
		 *
		 * @type {Dictionary}
		 */
		defaults: function () {

			let defaults = {};

			// If both `sails.config.connections` and `sails.config.datastores` is set, throw an error.
			if (!sails.config['webpack' + process.env.NODE_ENV] && !sails.config.webpack) {
				throw new Error(
					'\n\n[sails-hook-webpack] -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n' +
					'[sails-hook-webpack] No individual environment webpack, nor default webpack configuration found!\n' +
					'[sails-hook-webpack] -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n');
			} else if (!sails.config['webpack' + process.env.NODE_ENV] && sails.config.webpack) {
				sails.log.debug('[sails-hook-webpack] No individual environment webpack config found, using default.');
			} else {
				sails.log.debug('[sails-hook-webpack] Using webpack' + process.env.NODE_ENV + ' configuration.');
			}

			return defaults;

		},

		/**
		 * Runs when a Sails app loads/lifts.
		 *
		 * @param {Function} done
		 */
		initialize: function (done) {
			
			sails.log.info('[sails-hook-webpack] -> initializing.');

			sails.after('hook:http:loaded', function () {

				//choose the config file to use
				let configFile;
				if (sails.config['webpack' + process.env.NODE_ENV]) {
					configFile = sails.config['webpack' + process.env.NODE_ENV];
				} else {
					configFile = sails.config.webpack;
				}

				if (process.env.NODE_ENV !== 'production') {
					
					const compiler = webpack(configFile);
					const expressApp = sails.hooks.http.app;
					
					sails.log.info('[sails-hook-webpack] -> webpack: webpack-dev-middleware.');
					expressApp.use(require('webpack-dev-middleware')(compiler, {
						stats: {
							colors: true
						},
					}));

					sails.log.info('[sails-hook-webpack] -> webpack: webpack-hot-middleware.');
					expressApp.use(require("webpack-hot-middleware")(compiler, {
						noInfo: true,
						//quiet: true,
						reload: true
					}));

				} else {

					sails.log.info('[sails-hook-webpack] -> webpack: compiler init.');
					webpack(configFile, function (err, stats) {

						if (err) throw err;

						sails.log.info('[sails-hook-webpack] -> webpack: compiler loaded.');
						sails.log.debug(stats.toString({
							colors: true,
							chunks: false
						}));

					});

				}

			});

			// Continue lifting Sails.
			return done();

		}

	};

};