// Simplified React component testing harness
// This doesn't actually render components but checks their structure

export function testReactComponent(name, componentFn, props) {
  try {
    console.log(`Testing component: ${name}`);

    // Call the component function with props
    const result = componentFn(props);

    // Print component structure
    console.log("Component structure:");
    printComponentStructure(result, 2);

    console.log(`✓ ${name} rendered successfully`);
    return true;
  } catch (e) {
    console.error(`✗ ${name} failed to render`);
    console.error(`  ${e.message}`);
    return false;
  }
}

function printComponentStructure(component, indent = 0) {
  if (!component) {
    console.log(`${" ".repeat(indent)}null or undefined component`);
    return;
  }

  // Handle primitive values
  if (typeof component !== "object") {
    console.log(`${" ".repeat(indent)}${component}`);
    return;
  }

  // Handle arrays (like children)
  if (Array.isArray(component)) {
    component.forEach((child) => printComponentStructure(child, indent + 2));
    return;
  }

  // Handle React elements
  if (component.type) {
    const typeName =
      typeof component.type === "function"
        ? component.type.name || "Anonymous Function"
        : component.type;

    console.log(`${" ".repeat(indent)}<${typeName}>`);

    // Print props
    if (component.props) {
      const { children, ...otherProps } = component.props;

      // Print non-children props
      Object.entries(otherProps).forEach(([key, value]) => {
        if (typeof value === "function") {
          console.log(`${" ".repeat(indent + 2)}${key}={function}`);
        } else if (typeof value === "object" && value !== null) {
          console.log(`${" ".repeat(indent + 2)}${key}={object}`);
        } else {
          console.log(
            `${" ".repeat(indent + 2)}${key}=${JSON.stringify(value)}`,
          );
        }
      });

      // Recursively print children
      if (children) {
        console.log(`${" ".repeat(indent + 2)}children:`);
        if (Array.isArray(children)) {
          children.forEach((child) =>
            printComponentStructure(child, indent + 4),
          );
        } else {
          printComponentStructure(children, indent + 4);
        }
      }
    }

    console.log(`${" ".repeat(indent)}</${typeName}>`);
  } else {
    console.log(`${" ".repeat(indent)}Unknown component type:`, component);
  }
}
