import fs from 'fs-extra';

function plugin(options = {}) {

  const {
    targets = []
  } = options;

  let isFirstRun = true;
  
  return {
    name: 'clean-targets',

    buildStart: async function () {
      if (!isFirstRun) {
        return;
      }

      isFirstRun = false;
      
      const items = Array.isArray(targets) ? targets : [ targets ];

      const deletions = items.map(async target => {
        await fs.emptyDir(target);
      });

      await Promise.all(deletions);
    }
  }
}

export default plugin;