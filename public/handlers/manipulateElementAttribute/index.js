export default function manipulateElementAttribute(
  element,
  dataAttributeName,
  dataAttributeValue,
  dataAttributeAction
) {
  try {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error("Invalid HTML element provided.");
    }

    if (dataAttributeAction === "setAttribute") {
      element.setAttribute(dataAttributeName, dataAttributeValue);
    } else if (dataAttributeAction === "getAttribute") {
      return element.getAttribute(dataAttributeName);
    } else if (dataAttributeAction === "removeAttribute") {
      element.removeAttribute(dataAttributeName);
    } else {
      throw new Error("Invalid data attribute action provided.");
    }
  } catch (error) {
    console.error(`Error in manipulateElementAttribute: ${error.message}`);
  }

  return null;
}
