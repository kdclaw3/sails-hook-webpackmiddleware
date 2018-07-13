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

	function log(s) {
		sails.log.debug(`[sails-hook-webpackmiddleware] -> ${s}.`);
	}

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

			if (!(sails && sails.config && sails.config.webpackmiddleware && sails.config.webpackmiddleware.enabled)) {

				log(`DISABLED -> sails.config..webpackmiddleware !== true`);

			} else if (process.env.NODE_ENV !== 'production') {

				if (!sails.config['webpack' + process.env.NODE_ENV] && !sails.config.webpack) {
					throw new Error(
						'\n\n[sails-hook-webpackmiddleware] -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n' +
						'[sails-hook-webpackmiddleware] No individual environment webpack, nor default webpack configuration found!\n' +
						'[sails-hook-webpackmiddleware] -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n');
				} else if (!sails.config['webpack' + process.env.NODE_ENV] && sails.config.webpack) {
					log('No individual environment webpack config found, using default');
				} else {
					log('Using webpack' + process.env.NODE_ENV + ' configuration');
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



			if (!(sails && sails.config && sails.config.webpackmiddleware && sails.config.webpackmiddleware.enabled)) {

				return done();

			} else if (process.env.NODE_ENV !== 'production') {

				log('initializing');

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

					log('webpack: webpack-dev-middleware');
					expressApp.use(require('webpack-dev-middleware')(compiler, {
						stats: {
							colors: true
						}
					}));

					log('webpack: webpack-hot-middleware');
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
