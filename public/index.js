function getElement(selector) {
  return document.querySelector(`[data-js="${selector}"]`);
}

const bodyElement = getElement("body");
const formElement = getElement("form");
const colorInput = getElement("color");
const moodElement = getElement("mood");
const footerElement = getElement("footer");
const meaningElement = getElement("meaning");
const memoriesElement = getElement("memories");
function handleColorChange() {
  const colorName = colorInput.value;
  bodyElement.style.backgroundColor = colorName;
}

async function handleColorSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const colorObject = Object.fromEntries(formData);
  const { color } = colorObject;
  const upperCaseColorName = color.toUpperCase();
  const moodText = `Heute fühle ich mich "${upperCaseColorName}!".`;
  bodyElement.style.backgroundColor = color;
  moodElement.textContent = moodText;

  const response = await fetch("script.cgi", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData),
  });

  if (response.ok) {
    console.log("Color saved successfully", { status: response.status });
  } else {
    console.log("Error saving color", { status: response.status });
  }
}

async function handleOnPageLoad() {
  const year = new Date().getFullYear();

  //const currentDate = new Date();
  //const year = currentDate.getFullYear();

  footerElement.textContent = `@Bill ${year}`;
  try {
    const response = await fetch("script.cgi");

    if (!response.ok) {
      console.log("Error reading color from the server");
    }

    const colorData = await response.json();

    if (
      colorData &&
      colorData.name &&
      colorData.meaning &&
      colorData.memories
    ) {
      const { name, meaning, memories } = colorData;
      bodyElement.style.backgroundColor = name;
      moodElement.textContent = `My color is ${name}`;
      meaningElement.textContent = `${name} color associations: ${meaning}.`;
      memoriesElement.textContent = `The ${name} color brings me the memories like ${memories}.`;
    } else {
      console.log(`Invalid or missing color data in the response`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

colorInput.addEventListener("input", handleColorChange);
formElement.addEventListener("submit", handleColorSubmit);
window.addEventListener("load", handleOnPageLoad);
