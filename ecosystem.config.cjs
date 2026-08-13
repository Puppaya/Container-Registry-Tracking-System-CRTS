/**
 * PM2 ecosystem — CRTS (Nuxt / Nitro)
 *
 * Usage on server:
 *   cd C:\inetpub\wwwroot\CRTS
 *   pm2 startOrRestart ecosystem.config.cjs --env production
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'CRTS',
      cwd: 'C:\\inetpub\\wwwroot\\CRTS',
      script: 'prd/server/index.mjs',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',

        SECRET_KEY: 'WEFJIOWFOIJPOFKPSOK5626265959595',
        NUXT_SESSION_PASSWORD: 'SNJSNSPOJFIOSPJFOPSJFOPJSPOFKJOPWJFPEJ',

        // Hub SSO — sync with LaoX-One-Hub-Web-PWA MODULE_CRTS_*
        HUB_PUBLIC_URL: 'https://laoxone.sdplao.com:5500',
        HUB_MODULE_ID: 'crts',
        HUB_INTEGRATION_SECRET: 'edfde79949c7f2a32dcfba1e77ea523b5f6eefbdc432fa3fdb74eeaea0f11c0e',
        HUB_DEFAULT_PROVISION_ROLE: 'SurveyTeam',

        // OneX Identity JWT (verify Hub redeem access_token)
        ONEX_IDENTITY_JWT_KEY: 'LI7B7GQCVUXwSgSuhk8HLKcBTdPy4Y2moYRyNrnxgrP',
        ONEX_IDENTITY_ISSUER: 'onex-identity-api',
        ONEX_IDENTITY_AUDIENCE: 'onex-clients',

        NUXT_PUBLIC_HUB_FRAME_ANCESTORS: "'self' http://localhost:3000 https://laoxone.sdplao.com:5500"
      }
    }
  ]
}
