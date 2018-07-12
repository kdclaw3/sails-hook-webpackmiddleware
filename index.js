/**
 * Module dependencies
 */
const webpack = require('webpack');
const log = require('captains-log')();


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

			if (typeof sails.config.custom.webpackmiddleware === 'boolean' && sails.config.custom.webpackmiddleware === false ) {

				log.debug(`[sails-hook-webpackmiddleware] -> DISABLED -> sails.config.custom.webpackmiddleware === false`);

			} else if (process.env.NODE_ENV !== 'production') {

				if (!sails.config['webpack' + process.env.NODE_ENV] && !sails.config.webpack) {
					throw new Error(
						'\n\n[sails-hook-webpackmiddleware] -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n' +
						'[sails-hook-webpackmiddleware] No individual environment webpack, nor default webpack configuration found!\n' +
						'[sails-hook-webpackmiddleware] -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n');
				} else if (!sails.config['webpack' + process.env.NODE_ENV] && sails.config.webpack) {
					log.debug('[sails-hook-webpackmiddleware] No individual environment webpack config found, using default.');
				} else {
					log.debug('[sails-hook-webpackmiddleware] Using webpack' + process.env.NODE_ENV + ' configuration.');
				}

			}

			return defaults;

		},

		/**
		 * Runs when a Sails app loads/lifts.
		 *
		 * @param {Function} done
		 */
		initialize: function (done) {

			log.verbose('[sails-hook-webpackmiddleware] -> initializing.');

			if (typeof sails.config.custom.webpackmiddleware === 'boolean' && sails.config.custom.webpackmiddleware === false ) {

				log.debug(`[sails-hook-webpackmiddleware] -> DISABLED -> sails.config.custom.webpackmiddleware === false`);

			} else if (process.env.NODE_ENV !== 'production') {

				sails.after('hook:http:loaded', function () {

					//choose the config file to use
					let configFile;
					if (sails.config['webpack' + process.env.NODE_ENV]) {
						configFile = sails.config['webpack' + process.env.NODE_ENV];
					} else {
						configFile = sails.config.webpack;
					}

					const compiler = webpack(configFile);
					const expressApp = sails.hooks.http.app;

					log.info('[sails-hook-webpackmiddleware] -> webpack: webpack-dev-middleware.');
					expressApp.use(require('webpack-dev-middleware')(compiler, {
						stats: {
							colors: true
						}
					}));

					log.info('[sails-hook-webpackmiddleware] -> webpack: webpack-hot-middleware.');
					expressApp.use(require('webpack-hot-middleware')(compiler, {
						noInfo: true,
						//quiet: true,
						reload: true
					}));

				});

			}
			// Continue lifting Sails.
			return done();

		}

	};

};
