// export const PHASE_EXPORT = "phase-export";
// export const PHASE_PRODUCTION_BUILD = "phase-production-build";
// export const PHASE_PRODUCTION_SERVER = "phase-production-server";
// export const PHASE_DEVELOPMENT_SERVER = "phase-development-server";
// export const PAGES_MANIFEST = "pages-manifest.json";
// export const BUILD_MANIFEST = "build-manifest.json";
// const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const withTypescript = require('@zeit/next-typescript');

module.exports = (phase, { defaultConfig }) => {
  const customConfig = {
    serverRuntimeConfig: {
      // Will only be available on the server side
      mySecret: 'secret',
    },
    publicRuntimeConfig: {
      // Will be available on both server and client
      staticFolder: '/static',
    },
  };
  const config = Object.assign(defaultConfig, withTypescript(), customConfig);

  return config;
};

// import getConfig from "next/config";
// const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

// console.log(serverRuntimeConfig.mySecret); // Will only be available on the server side
// console.log(publicRuntimeConfig.staticFolder); // Will be available on both server and client

// export default () => (
//     <div>
//         <img src={`${publicRuntimeConfig.staticFolder}/logo.png`} />
//     </div>
// );
