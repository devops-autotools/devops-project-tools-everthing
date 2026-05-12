import yaml from 'js-yaml';

export const mergeKubeconfigs = (yamlContents) => {
  if (!yamlContents || yamlContents.length === 0) return '';

  const mergedConfig = {
    apiVersion: 'v1',
    kind: 'Config',
    preferences: {},
    clusters: [],
    users: [],
    contexts: [],
    'current-context': ''
  };

  const existingClusterNames = new Set();
  const existingUserNames = new Set();
  const existingContextNames = new Set();

  yamlContents.forEach((content) => {
    try {
      const config = yaml.load(content);
      if (!config) return;

      const nameMap = {
        clusters: {},
        users: {},
        contexts: {}
      };

      // 1. Merge Clusters
      if (Array.isArray(config.clusters)) {
        config.clusters.forEach(clusterObj => {
          let originalName = clusterObj.name;
          let newName = originalName;
          let counter = 1;
          
          while (existingClusterNames.has(newName)) {
            newName = `${originalName}-${counter}`;
            counter++;
          }
          
          existingClusterNames.add(newName);
          nameMap.clusters[originalName] = newName;
          
          // Deep clone to avoid mutating original objects if passed by reference
          const newClusterObj = JSON.parse(JSON.stringify(clusterObj));
          newClusterObj.name = newName;
          mergedConfig.clusters.push(newClusterObj);
        });
      }

      // 2. Merge Users
      if (Array.isArray(config.users)) {
        config.users.forEach(userObj => {
          let originalName = userObj.name;
          let newName = originalName;
          let counter = 1;
          
          while (existingUserNames.has(newName)) {
            newName = `${originalName}-${counter}`;
            counter++;
          }
          
          existingUserNames.add(newName);
          nameMap.users[originalName] = newName;
          
          const newUserObj = JSON.parse(JSON.stringify(userObj));
          newUserObj.name = newName;
          mergedConfig.users.push(newUserObj);
        });
      }

      // 3. Merge Contexts
      if (Array.isArray(config.contexts)) {
        config.contexts.forEach(contextObj => {
          let originalName = contextObj.name;
          let newName = originalName;
          let counter = 1;
          
          while (existingContextNames.has(newName)) {
            newName = `${originalName}-${counter}`;
            counter++;
          }
          
          existingContextNames.add(newName);
          nameMap.contexts[originalName] = newName;
          
          const newContextObj = JSON.parse(JSON.stringify(contextObj));
          newContextObj.name = newName;
          
          // Update internal references
          if (newContextObj.context) {
            if (newContextObj.context.cluster && nameMap.clusters[newContextObj.context.cluster]) {
              newContextObj.context.cluster = nameMap.clusters[newContextObj.context.cluster];
            }
            if (newContextObj.context.user && nameMap.users[newContextObj.context.user]) {
              newContextObj.context.user = nameMap.users[newContextObj.context.user];
            }
          }
          
          mergedConfig.contexts.push(newContextObj);
        });
      }

      // 4. Set current context
      if (!mergedConfig['current-context'] && config['current-context']) {
        mergedConfig['current-context'] = nameMap.contexts[config['current-context']] || config['current-context'];
      }

    } catch (e) {
      console.error("Failed to parse YAML content:", e);
    }
  });

  if (mergedConfig.clusters.length === 0 && mergedConfig.users.length === 0) return '';
  
  // Output as nice YAML
  return yaml.dump(mergedConfig, { 
    indent: 2, 
    noRefs: true,
    lineWidth: -1 // Disable line wrapping for long certs
  });
};
