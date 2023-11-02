module.exports = {
  apps: [
    {
      name: "NodeServer",
      script: "npm",
      automation: false,
      args: "run prod",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
