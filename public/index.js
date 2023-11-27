function getElement(selector) {
  return document.querySelector(`[data-js="${selector}"]`);
}

const colorInput = getElement("color");
const bodyElement = getElement("body");
const formElement = getElement("form");
const moodElement = getElement("mood");
const footerElement = getElement("footer");
const meaningElement = getElement("meaning");
const memoriesElement = getElement("memories");
const colorListElement = getElement("colorList");
const colorCountElement = getElement("colorCount");
const errorMessageElement = getElement("errorMessage");

function handleColorChange() {
  const colorName = colorInput.value;
  bodyElement.style.backgroundColor = colorName;
}

let colorAPI;

async function fetchColorData() {
  try {
    const response = await fetch("./colorListe");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    colorAPI = await response.json();
  } catch (error) {
    console.error("Error fetching color data:", error);
  }
}

function setColorContrast(bgColor, lightColor, darkColor) {
  const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}

function colorNameToHex(colour) {
  const lowerCaseColour = colour.toLowerCase();

  if (colour.startsWith("#")) {
    return colour;
  } else {
    return colorAPI[lowerCaseColour];
  }
}

async function deleteColorEntry(row, colorId) {
  try {
    const response = await fetch(`./script.cgi?id=${colorId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      row.remove();
      handleOnPageLoad();
    } else {
      console.error("Error deleting color:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function setColorDetail(colorData) {
  const color_object = colorData.color_object;
  const { color_name, color_meaning, color_memories } = color_object[0];

  bodyElement.style.backgroundColor = color_name;
  moodElement.textContent = `My color is ${color_name}`;
  meaningElement.textContent = `${color_name} color associations: ${color_meaning}`;
  memoriesElement.textContent = `The ${color_name} color brings me memories like: ${color_memories}`;
}

function setLastTenTable(colorData) {
  const colorListElement = document.querySelector('[data-js="colorList"]');
  let colorListRows = colorListElement.querySelectorAll("tr");
  //colorListElement.innerHTML = "";

  colorListRows.forEach((row) => row.remove());
  colorListRows.forEach((row) => row.remove());
  for (const color of colorData.color_object) {
    const color_object = colorData.color_object;

    if (color_object.length === 0) {
      return;
    }
    const colourTableTh = document.querySelectorAll('[id="colourTable"] tr th');
    const row = document.createElement("tr");
    //colorListRows.forEach((row) => row.remove());

    colourTableTh.forEach((tableTh) => {
      const detail = tableTh.dataset.name;
      const dataCell = document.createElement("td");
      dataCell.setAttribute("data-name", detail);
      dataCell.style.backgroundColor = color[detail];
      dataCell.textContent = color[detail];
      row.append(dataCell);

      if (detail === "color_name") {
        const hexColor = colorNameToHex(color[detail]);
        const adjustedColor = setColorContrast(hexColor, "#FFFFFF", "#000000");
        dataCell.style.color = adjustedColor;
        dataCell.addEventListener("click", (event) => {
          const newBackgroundColor = event.target.textContent;
          bodyElement.style.backgroundColor = newBackgroundColor;
        });
      } else if (detail === "color_count") {
        dataCell.textContent = color[detail];
        row.append(dataCell);
      } else if (detail === "aktion") {
        const actionButton = document.createElement("button");
        actionButton.textContent = "Delete";
        dataCell.append(actionButton);
        row.append(dataCell);

        row.dataset.colorId = color.color_id;
        actionButton.addEventListener("click", () => {
          if (color.color_id) {
            const colorId = row.dataset.colorId;
            deleteColorEntry(row, colorId);
          }
        });
      }

      colorListElement.append(row);
    });
  }
}

async function getLastTenColors() {
  const API_URL = "./script.cgi";
  const NETWORK_ERROR_MESSAGE = "Network error occurred while fetching data.";
  const INVALID_DATA_MESSAGE = "Invalid or missing color data in the response.";
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      console.log("Error:", NETWORK_ERROR_MESSAGE);
      return;
    }

    const colorData = await response.json();

    if (colorData) {
      setLastTenTable(colorData);
      setColorDetail(colorData);
    } else {
      console.log("Error:", INVALID_DATA_MESSAGE);
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

function handleOnPageLoad() {
  const year = new Date().getFullYear();
  footerElement.textContent = `@Bill ${year}`;
  getLastTenColors();
  fetchColorData();
}

function validCssColor(colorString) {
  const lowerCaseColorString = colorString.toLowerCase();
  const string = new Option().style;
  string.color = lowerCaseColorString;
  const isValidString = string.color === lowerCaseColorString;
  const isValidHexPattern = /^#[0-9A-F]{6}$/i.test(colorString);
  return isValidString || isValidHexPattern;
}

async function handleColorSubmit(event) {
  const formData = new FormData(event.target);
  const colorObject = Object.fromEntries(formData);
  const color = colorObject.color;

  bodyElement.style.backgroundColor = color;
  const isValid = validCssColor(color);

  if (isValid) {
    const response = await fetch("./script.cgi", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData),
    });

    if (response.ok) {
      getLastTenColors();
      console.log("Color saved successfully", { status: response.status });

      errorMessageElement.textContent = "";
    } else {
      console.log("Error saving color", { status: response.status });
      errorMessageElement.textContent = "Error saving color.";
    }
  } else {
    errorMessageElement.textContent = "Please enter a valid color.";
  }
}

function hexToCssColorName(hexColor, colorLibrary) {
  hexColor = hexColor.toLowerCase();

  for (const colorName in colorLibrary) {
    if (colorLibrary[colorName] === hexColor) {
      return colorName;
    }
  }
  return console.error("No exact CSS color name found for " + hexColor);
}

function capitalizeFirstLetter(inputString) {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

document.addEventListener("input", (event) => {
  if (
    event.target.tagName.toLowerCase() === "input" &&
    event.target.type === "text" &&
    event.target.name === "color"
  ) {
    const colorInput = event.target;
    const inputValue = colorInput.value;
    const firstLetterCapitalized = capitalizeFirstLetter(inputValue);
    colorInput.value = firstLetterCapitalized;
    handleColorChange();
  }
});

document.addEventListener("submit", (event) => {
  const isFormSubmit = event.target.tagName.toLowerCase() === "form";

  if (isFormSubmit) {
    event.preventDefault();

    const colorInput = event.target.querySelector('[name="color"]');

    if (colorInput) {
      const inputValue = colorInput.value;
      const isValid = validCssColor(inputValue);

      if (inputValue.startsWith("#") && isValid) {
        const convertedHexColor = hexToCssColorName(inputValue, colorAPI);
        const firstLetterCapitalized = capitalizeFirstLetter(convertedHexColor);
        colorInput.value = firstLetterCapitalized;
      }

      handleColorSubmit(event);
    }
  }
});

function DOMLoadStatus(status) {
  console.info(status);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    DOMLoadStatus("DOM hasn't finished loading");
  });
} else {
  DOMLoadStatus("DOM has finished loading");
  handleOnPageLoad();
}
