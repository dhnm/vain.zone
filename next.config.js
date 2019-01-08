// export const PHASE_EXPORT = "phase-export";
// export const PHASE_PRODUCTION_BUILD = "phase-production-build";
// export const PHASE_PRODUCTION_SERVER = "phase-production-server";
// export const PHASE_DEVELOPMENT_SERVER = "phase-development-server";
// export const PAGES_MANIFEST = "pages-manifest.json";
// export const BUILD_MANIFEST = "build-manifest.json";
// const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const withTypescript = require("@zeit/next-typescript");
const withCSS = require("@zeit/next-css");

module.exports = (phase, { defaultConfig }) => {
  const customConfig = {
    serverRuntimeConfig: {
      mongodbURL:
        "mongodb://user_thisBoy:r8LspGn5jpZJIfCP@vainzone-shard-00-00-jem9k.mongodb.net:27017,vainzone-shard-00-01-jem9k.mongodb.net:27017,vainzone-shard-00-02-jem9k.mongodb.net:27017/VAINZONE?ssl=true&replicaSet=VAINZONE-shard-0&authSource=admin",
      apiKey:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhNWUxMDJkMC0yOTI1LTAxMzYtMGYyZS0wYTU4NjQ2MGI5MDciLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTI0NDg5MDQxLCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ2YWluLXpvbmUiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0Ijo1MH0.NROqQ2-U11JTN4lDCY81XmFIcRRucRfXco8VKYFzuxI",
      testingApiKey:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3ZmVlYTMwMC1mMTU3LTAxMzQtYzgzZS0wMjQyYWMxMTAwMDMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNDkwMjA1Njg5LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiI3ZmViZTNlMC1mMTU3LTAxMzQtYzgzZC0wMjQyYWMxMTAwMDMiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.rQrjRyo54Fdgicbv67pABSuu2zikb5MFa_gsidu0aBs",
      filterApiKey:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5ZGI0MTNjMC02NzE0LTAxMzYtOTQ4Mi0wYTU4NjQ2MTRkYjUiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTMxMjk4Njk4LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ0ZW1wX3Rlc3QiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.kZZ1kSvyT447fc_hKmvoZ5qXUmXWftX2eYrYzL6ganE",
      discordGuildApplicationWebhookURL:
        "https://discordapp.com/api/webhooks/378865484344459264/ivZIqgRY9TL2y5Q1X8uh78RBEA03OeIksArPnhEvAIv7xQSoheS_NvCiAtHUVEEfleBv",
      fbAppID: "617200295335676",
      fbMessengerVerifyToken: "vgeuverify",
      fbMessengerAccessToken:
        "EAAIxVyRb1vwBANuDITendkDbFYKffvdKC4qcHuz8iWdusIX5hiWCPc9ILq6n96Q3XXzC53S9Wi8gtzONZCycVcZBO9nJNsC1fonE5154EnC1a8zdz2TkJ9XgfP1kUGjyrIQ10XRjhRCxeF9exE8fZCDGDzAFacrEWJoPuNZBBwZDZD",
      gloryStatsKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyNzgyNDg1MC1mNTNmLTAxMzYtYjc0NS0wYTU4NjQ2MTRkNzMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTQ2OTMwMDMzLCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJnbG9yeWd1aWRlLXRlc3QiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.fylM4-0DQp_jQ7XfVEBRD8O4v7XnQ57C43jphi94npg"
    },
    publicRuntimeConfig: {
      currentSeasonPatch: "3.9",
      googleTag: "UA-125429066-1",
      storageVersion: 1.1,
      discordInviteCode: "PBjRYsj"
    }
  };
  const config = {
    ...defaultConfig,
    ...withTypescript(),
    ...withCSS(),
    ...customConfig
  };

  return config;
};
