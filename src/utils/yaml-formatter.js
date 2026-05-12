import yaml from 'js-yaml';

/**
 * Validates Kubernetes-specific schema rules heuristically.
 * @param {Object} parsedObject 
 * @returns {Array} Array of error message strings
 */
const validateK8sSchema = (parsedObject) => {
  let errors = [];
  if (!parsedObject || typeof parsedObject !== 'object') return errors;

  const kind = parsedObject.kind;
  if (!kind) return errors; // Not a k8s object, skip validation

  const checkContainers = (containers, path) => {
    if (containers !== undefined) {
      if (!Array.isArray(containers)) {
        errors.push(`[${path}]: Must be a List/Array. (Bạn có quên thêm dấu gạch ngang '-' trước mỗi container không?)`);
      } else {
        containers.forEach((c, i) => {
          if (typeof c !== 'object' || c === null) {
            errors.push(`[${path}[${i}].name]: Container item must be an object.`);
            return;
          }
          if (!c.name) errors.push(`[${path}[${i}].name]: Missing required field 'name'.`);
          if (!c.image) errors.push(`[${path}[${i}].image]: Missing required field 'image'.`);
        });
      }
    }
  };

  // Pod
  if (kind === 'Pod' && parsedObject.spec) {
    checkContainers(parsedObject.spec.containers, 'spec.containers');
    checkContainers(parsedObject.spec.initContainers, 'spec.initContainers');
  }

  // Workloads
  if (['Deployment', 'DaemonSet', 'StatefulSet', 'Job', 'ReplicaSet'].includes(kind)) {
    if (parsedObject.spec && parsedObject.spec.template && parsedObject.spec.template.spec) {
      checkContainers(parsedObject.spec.template.spec.containers, 'spec.template.spec.containers');
      checkContainers(parsedObject.spec.template.spec.initContainers, 'spec.template.spec.initContainers');
    }
  }

  // Common list fields
  const checkListField = (field, path) => {
    if (field !== undefined && !Array.isArray(field)) {
      errors.push(`[${path}]: Must be a List/Array. (Bạn có quên thêm dấu gạch ngang '-' không?)`);
    }
  };

  if (kind === 'Service' && parsedObject.spec) {
    checkListField(parsedObject.spec.ports, 'spec.ports');
  }

  return errors;
};

/**
 * Formats and validates a YAML or JSON string.
 * @param {string} input - The raw YAML or JSON string.
 * @returns {Object} { isValid, formatted, error, autoFixed, k8sErrors }
 */
export const formatYAML = (input) => {
  if (!input || !input.trim()) {
    return { isValid: true, formatted: '', error: null, autoFixed: null, k8sErrors: [] };
  }

  try {
    const parsed = yaml.load(input);

    if (typeof parsed !== 'object' || parsed === null) {
      return { 
        isValid: false, 
        formatted: '', 
        autoFixed: null,
        k8sErrors: [],
        error: {
          message: 'Input does not represent a valid YAML/JSON object or array.',
          line: 1
        }
      };
    }

    const formatted = yaml.dump(parsed, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });

    const k8sErrors = validateK8sSchema(parsed);

    return {
      isValid: true,
      formatted,
      autoFixed: null,
      k8sErrors,
      error: null
    };

  } catch (e) {
    let line = 1;
    let message = e.message || 'Invalid YAML format';

    if (e.mark && typeof e.mark.line === 'number') {
      line = e.mark.line + 1;
      message = e.reason || message;
    }

    // Try a basic auto-fix heuristic
    let autoFixed = null;
    try {
      let temp = input.replace(/\t/g, '  '); // Fix tabs
      
      // Fix missing space after colon BUT ONLY for dictionary keys
      temp = temp.replace(/^(\s*[-a-zA-Z0-9_]+):(?![/\s])/gm, '$1: ');
      
      // Fix missing colons at the end of lines if the next line is indented deeper
      let lines = temp.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        let currentLine = lines[i];
        let nextLine = lines[i + 1];
        let currentNoComment = currentLine.split('#')[0].trimEnd();
        let nextNoComment = nextLine.split('#')[0];

        if (currentNoComment.length > 0 && !currentNoComment.endsWith(':') && !currentNoComment.includes(': ')) {
          if (/^[\s-]*[a-zA-Z0-9_-]+$/.test(currentNoComment)) {
            let currentIndent = currentLine.search(/\S|$/);
            let nextIndent = nextLine.search(/\S|$/);
            if (nextIndent > currentIndent && nextNoComment.trim().length > 0) {
              let commentMatch = currentLine.match(/(\s*#.*)$/);
              let comment = commentMatch ? commentMatch[1] : '';
              lines[i] = currentNoComment + ':' + comment;
            }
          }
        }
      }

      // Fix mismatched indentation in list items (scan downwards to align properties)
      for (let i = 0; i < lines.length - 1; i++) {
        let currentLine = lines[i];
        let listMatch = currentLine.match(/^( *)- /);
        if (listMatch) {
          let expectedPropIndent = listMatch[1].length + 2;
          
          for (let j = i + 1; j < lines.length; j++) {
            let scanLine = lines[j];
            if (scanLine.trim().length === 0) continue;
            
            let scanIndent = scanLine.search(/\S|$/);
            // Stop if we hit another list item or drop below list indent
            if (scanLine.trim().startsWith('-') || scanIndent <= listMatch[1].length) {
              break;
            }
            
            // Fix if indent is slightly off (by 1 or 2 spaces)
            if (Math.abs(scanIndent - expectedPropIndent) <= 2) {
               lines[j] = ' '.repeat(expectedPropIndent) + scanLine.trimLeft();
            }
          }
        }
      }
      
      temp = lines.join('\n');
      
      const parsedFix = yaml.load(temp);
      if (typeof parsedFix === 'object' && parsedFix !== null) {
        autoFixed = yaml.dump(parsedFix, { indent: 2, lineWidth: -1 });
      }
    } catch (fixErr) {
      // Ignore if auto-fix fails
    }

    return {
      isValid: false,
      formatted: '',
      autoFixed,
      k8sErrors: [],
      error: {
        message,
        line,
        fullError: e.message
      }
    };
  }
};
