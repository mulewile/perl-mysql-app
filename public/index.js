const bodyElement = document.querySelector('[data-js="body"]');
const formElement = document.querySelector('[data-js="form"]');
const colorInput = document.querySelector('[data-js="color"]');
const moodElement = document.querySelector('[data-js="mood"]');
const footerElement = document.querySelector('[data-js="footer"]');

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
  Heute fühle ich mich "${upperCaseColorName}!". 
  Also ich bin "${upperCaseColorName}". 
  Mal sehen, was ich morgen sein werde!`;

  moodElement.textContent = moodText;

  const response = await fetch("script.cgi", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData),
  });

  if (response.ok) {
    console.log("Color saved successfully");
  } else {
    console.error("Error saving color:", response.status);
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

  const color = await response.text();

  if (color) {
    bodyElement.style.backgroundColor = color;
  } else {
    console.log("Color not found in the response");
  }
}

colorInput.addEventListener("input", handleColorChange);
formElement.addEventListener("submit", handleColorSubmit);
window.addEventListener("load", handleOnPageLoad);
