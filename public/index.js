const bodyElement = document.querySelector('[data-js="body"]');
const formElement = document.querySelector('[data-js="form"]');
const colorInput = document.querySelector('[data-js="color"]');
const moodElement = document.querySelector('[data-js="mood"]');
const footerElement = document.querySelector('[data-js="footer"]');
const meaningElement = document.querySelector('[data-js="meaning"]');
function handleColorChange() {
  const colorName = colorInput.value;
  bodyElement.style.backgroundColor = colorName;
}

async function handleColorSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const colorObject = Object.fromEntries(formData);
  bodyElement.style.backgroundColor = colorObject.color;

  const upperCaseColorName = colorObject.color.toUpperCase();
  const moodText = `
  Heute fühle ich mich "${upperCaseColorName}!".`;

  moodElement.textContent = moodText;

  const response = await fetch("script.cgi", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData),
  });

  if (response.ok) {
    logger.info("Color saved successfully", { status: response.status });
  } else {
    logger.error("Error saving color", { status: response.status });
  }
}

async function handleOnPageLoad() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  footerElement.textContent = `Bill ${year}`;
  const response = await fetch("script.cgi");

  if (!response.ok) {
    console.log("Error reading color from the server");
    return;
  }

  const colorData = await response.text();

  if (colorData) {
    const [color, meaning] = colorData.split("\n");
    bodyElement.style.backgroundColor = color;
    moodElement.textContent = `My color is ${color}`;
    console.log(colorData);
    meaningElement.textContent = `The colour ${color} is associated with ${meaning}`;
  } else {
    console.log("Color not found in the response");
  }
}

colorInput.addEventListener("input", handleColorChange);
formElement.addEventListener("submit", handleColorSubmit);
window.addEventListener("load", handleOnPageLoad);
