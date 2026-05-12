export const isLikelyImageRepo = (repo) => {
  if (!repo) return false;
  if (['true', 'false', 'yes', 'no'].includes(repo.toLowerCase())) return false;
  if (!isNaN(repo)) return false;
  return true;
};

export const extractImages = (yamlString) => {
  const lines = yamlString.split('\n');
  const images = [];
  let currentImageCtx = null;
  let globalRegistry = 'docker.io';
  let globalNamespace = '';
  let lastParentKey = '';

  lines.forEach((line, index) => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const parentMatch = line.match(/^(\s*)([a-zA-Z0-9_-]+):\s*$/);
    if (parentMatch) {
      lastParentKey = parentMatch[2];
    }

    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;

    // Pattern 0: imageRegistry: <domain>
    const registryMatch = line.match(/^(\s*)(?:imageRegistry|registry):\s*['"]?([^'"\s]+)['"]?/);
    if (registryMatch) {
      if (registryMatch[2] && registryMatch[2] !== '""') {
        globalRegistry = registryMatch[2];
        images.push({
          line: index,
          repo: registryMatch[2],
          tag: '',
          type: 'registry',
          indent: registryMatch[1].length
        });
      }
      return;
    }

    const namespaceMatch = line.match(/^(\s*)imageNamespace:\s*['"]?([^'"\s]+)['"]?/);
    if (namespaceMatch && namespaceMatch[2] !== '""') {
      globalNamespace = namespaceMatch[2];
      return;
    }

    // Pattern 1: repository: <repo>
    const repoMatch = line.match(/^(\s*)repository:\s*['"]?([^'"\s]+)['"]?/);
    if (repoMatch && repoMatch[2] !== '""') {
      currentImageCtx = {
        repoLine: index,
        repo: repoMatch[2],
        indent: repoMatch[1].length,
        tag: 'latest',
        tagLine: -1,
        type: 'split'
      };
      images.push(currentImageCtx);
      return;
    }

    // Pattern 1b: tag: <tag>
    const tagMatch = line.match(/^(\s*)tag:\s*['"]?([^'"\s]+)['"]?/);
    if (tagMatch && currentImageCtx && (currentImageCtx.type === 'split' || currentImageCtx.type === 'readonly')) {
      if (Math.abs(tagMatch[1].length - currentImageCtx.indent) <= 4) {
         currentImageCtx.tag = tagMatch[2];
         currentImageCtx.tagLine = index;
         return;
      }
    }

    // Pattern 2: image: <repo>:<tag>
    const imageKeyMatch = line.match(/^(\s*)image:\s*['"]?([^'"\s:]+):([^'"\s]+)['"]?/);
    if (imageKeyMatch) {
      images.push({
        line: index,
        repo: imageKeyMatch[2],
        tag: imageKeyMatch[3],
        type: 'combined',
        indent: imageKeyMatch[1].length
      });
      return;
    }
    
    // Pattern 3: image: <repo>
    const imageNoTagMatch = line.match(/^(\s*)image:\s*['"]?([^'"\s:]+)['"]?\s*$/);
    if (imageNoTagMatch) {
      if (imageNoTagMatch[2] && imageNoTagMatch[2] !== '{' && imageNoTagMatch[2] !== '[]') {
        images.push({
          line: index,
          repo: imageNoTagMatch[2],
          tag: 'latest',
          type: 'combined',
          indent: imageNoTagMatch[1].length
        });
        return;
      }
    }

    // Pattern 4: name: <image_name> under image:
    const nameMatch = line.match(/^(\s*)name:\s*['"]?([^'"\s]+)['"]?/);
    if (nameMatch && lastParentKey === 'image') {
      const imgName = nameMatch[2];
      const constructedRepo = globalNamespace ? `${globalRegistry}/${globalNamespace}/${imgName}` : `${globalRegistry}/${imgName}`;
      currentImageCtx = {
        repoLine: index,
        repo: constructedRepo,
        indent: nameMatch[1].length,
        tag: 'latest',
        tagLine: -1,
        type: 'readonly'
      };
      images.push(currentImageCtx);
      return;
    }
  });

  return images.filter(img => isLikelyImageRepo(img.repo));
};

export const processImages = (images, privateRegistry) => {
  const privateRegDomain = privateRegistry.replace(/\/$/, '');
  return images.map(img => {
    let originalRepo = img.repo;
    let newRepo = originalRepo;
    
    if (img.type === 'registry') {
      newRepo = privateRegDomain || originalRepo;
    } else {
      const parts = originalRepo.split('/');
      if (parts.length > 2 || (parts[0] && parts[0].includes('.'))) {
        parts.shift();
      }
      const cleanPath = parts.join('/');
      newRepo = privateRegDomain ? `${privateRegDomain}/${cleanPath}` : originalRepo;
    }
    
    return { ...img, newRepo };
  });
};

export const getConvertedYaml = (yamlString, processedImages) => {
  if (!yamlString) return '';
  const lines = yamlString.split('\n');
  
  processedImages.forEach(img => {
    if (img.type === 'split' && img.repoLine >= 0 && img.repoLine < lines.length) {
       const line = lines[img.repoLine];
       lines[img.repoLine] = line.replace(img.repo, img.newRepo);
    } 
    else if (img.type === 'combined' && img.line >= 0 && img.line < lines.length) {
       const line = lines[img.line];
       lines[img.line] = line.replace(img.repo, img.newRepo);
    }
    else if (img.type === 'registry' && img.line >= 0 && img.line < lines.length) {
       const line = lines[img.line];
       lines[img.line] = line.replace(img.repo, img.newRepo);
    }
    // We do NOT modify 'readonly' images in the YAML text, since we only want to replace global registry or standard repos
  });
  
  return lines.join('\n');
};

export const generateMigrationScript = (processedImages) => {
  if (!processedImages || processedImages.length === 0) return '';
  
  const scriptableImages = processedImages.filter(img => img.type !== 'registry');
  
  if (scriptableImages.length === 0) {
    // If we only found a registry but no actual images
    const registry = processedImages[0];
    return `# Vui lòng pull/tag/push thủ công các images thuộc registry: ${registry.repo}\n# Hệ thống không tìm thấy file cấu trúc image cụ thể trong values.yaml này.`;
  }

  const scripts = scriptableImages.map(img => {
    const originalRepo = img.repo;
    const parts = originalRepo.split('/');
    
    if (parts.length === 1) parts.unshift('library');
    if (!parts[0].includes('.')) parts.unshift('docker.io');
    
    const pullImage = `${parts.join('/')}:${img.tag}`;
    const newImage = `${img.newRepo}:${img.tag}`;
    
    return `docker pull ${pullImage} \\\n  && docker tag ${pullImage} ${newImage} \\\n  && docker push ${newImage}`;
  });
  
  return scripts.join('\n\n');
};
