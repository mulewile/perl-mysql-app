export function manipulateElementContent(element, newTextContent) {
  try {
    if (!element || !(element instanceof Element)) {
      throw new Error("Invalid HTML element provided.");
    }

    if (newTextContent !== undefined) {
      element.textContent = newTextContent;
    } else {
      throw new Error("Invalid text content provided for manipulation.");
    }
  } catch (error) {
    console.error(`Error in manipulateElementContent: ${error.message}`);
  }
}
