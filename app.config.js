module.exports = ({ config }) => {
  const disableAutomaticUpdates =
    process.env.DISABLE_AUTOMATIC_UPDATES === 'true';

  return {
    ...config,
    updates: {
      ...config.updates,
      checkAutomatically: disableAutomaticUpdates ? 'NEVER' : config.updates.checkAutomatically,
    },
  };
};
