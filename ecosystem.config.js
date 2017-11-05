module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'kobis',
      script    : 'server.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    },

    // Second application
    {
      name      : 'fetch',
      script    : 'kobis-fetch.js',
      exec_mode : 'cluster',
      'instances' : 1,
      cron_restart : '* */4 * * *'
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'ubuntu',
      host : 'ec2',
      // port : '3000',
      ref  : 'origin/master',
      repo : 'git@github.com:danbi2990/d3-kobis.git',
      // path : '/var/www/production',
      path : '/home/ubuntu/sites/d3-kobis',
      // ssh_options : '/home/jake/Downloads/jake.pem',
      // 'pre-deploy' : 'export PATH="$HOME/.nvm/versions/node/v6.11.5/bin:$PATH"',
      'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env production'
      // 'post-deploy' : '/home/ubuntu/.nvm/versions/node/v6.11.5/bin/npm install && pm2 startOrRestart ecosystem.config.js --env production'
    },
    dev : {
      user : 'node',
      host : 'localhost',
      ref  : 'origin/master',
      repo : 'git@github.com:danbi2990/d3-kobis.git',
      path : '/home/jake/Dev/d3-kobis',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
