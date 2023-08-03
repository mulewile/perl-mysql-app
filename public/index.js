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
const colorListElement = getElement("colorList");
const colorCountElement = getElement("colorCount");

function handleColorChange() {
  const colorName = colorInput.value;
  bodyElement.style.backgroundColor = colorName;
}

function setColorContrast(bgColor, lightColor, darkColor) {
  const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}

function setLastTenTable(colorData) {
  const color_object = colorData.color_object;
  const { color_name, color_meaning, color_memories } = color_object[0];

  console.log("Data Check===", color_object);
  bodyElement.style.backgroundColor = color_name;
  moodElement.textContent = `My color is ${color_name}`;
  meaningElement.textContent = `${color_name} color associations: ${color_meaning}`;
  memoriesElement.textContent = `The ${color_name} color brings me the memories like.: ${color_memories}`;

  document
    .querySelectorAll(`[data-js="colorList"] tr`)
    .forEach((e) => e.remove());

  for (const color of color_object) {
    const adjustedColor = setColorContrast(
      color.color_name,
      "#FFFFFF",
      "#000000"
    );
    const row = document.createElement("tr");
    const colorCell = document.createElement("td");
    colorCell.style.backgroundColor = color.color_name;
    colorCell.textContent = color.color_name;
    colorCell.style.color = adjustedColor;
    row.append(colorCell);
    colorCell.addEventListener("click", (event) => {
      const newBackgroundColor = event.target.innerHTML;
      bodyElement.style.background = newBackgroundColor;
    });
    const countCell = document.createElement("td");
    countCell.textContent = color.color_count;
    row.append(countCell);
    colorListElement.append(row);
  }
}

async function getLastTenColors() {
  try {
    const response = await fetch("script.cgi");

    if (!response.ok) {
      console.log("Error reading color from the server");
      return;
    }

    const colorData = await response.json();

    if (colorData) {
      setLastTenTable(colorData);
    } else {
      console.log(`Invalid or missing color data in the response`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

function handleOnPageLoad() {
  const year = new Date().getFullYear();
  footerElement.textContent = `@Bill ${year}`;
  getLastTenColors();
}

async function handleColorSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const colorObject = Object.fromEntries(formData);
  const { color } = colorObject;
  bodyElement.style.backgroundColor = color;

  const response = await fetch("script.cgi", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData),
  });

  if (response.ok) {
    getLastTenColors();

    console.log("Color saved successfully", { status: response.status });
  } else {
    console.log("Error saving color", { status: response.status });
  }
}

colorInput.addEventListener("input", handleColorChange);
formElement.addEventListener("submit", handleColorSubmit);
window.addEventListener("load", handleOnPageLoad);
