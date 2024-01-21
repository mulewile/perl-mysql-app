export default function manipulateElementClass(
  element,
  className,
  classAction
) {
  try {
    if (!element) {
      throw new Error("Element is null or undefined.");
    }

    if (typeof className !== "string" || className.trim() === "") {
      throw new Error("Class name must be a non-empty string.");
    }

    if (
      classAction !== "add" &&
      classAction !== "remove" &&
      classAction !== "toggle"
    ) {
      throw new Error(
        "Invalid class action. Use 'add', 'remove', or 'toggle'."
      );
    }

    if (classAction === "add") {
      element.classList.add(className);
    } else if (classAction === "remove") {
      element.classList.remove(className);
    } else if (classAction === "toggle") {
      element.classList.toggle(className);
    }
  } catch (error) {
    console.error("Error in manipulateClass function:", error.message);
  }
}
