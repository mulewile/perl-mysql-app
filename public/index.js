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
  return colour.startsWith("#") ? colour : colorAPI[lowerCaseColour];
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

function setLastTenTable(colorData) {
  const color_object = colorData.color_object;

  if (color_object.length === 0) {
    return;
  }

  const { color_name, color_meaning, color_memories } = color_object[0];

  bodyElement.style.backgroundColor = color_name;
  moodElement.textContent = `My color is ${color_name}`;
  meaningElement.textContent = `${color_name} color associations: ${color_meaning}`;
  memoriesElement.textContent = `The ${color_name} color brings me memories like: ${color_memories}`;

  const colorListRows = document.querySelectorAll('[data-js="colorList"] tr');
  colorListRows.forEach((row) => row.remove());

  color_object.forEach((color) => {
    const hexColor = colorNameToHex(color.color_name);
    const adjustedColor = setColorContrast(hexColor, "#FFFFFF", "#000000");

    const row = document.createElement("tr");

    const colorCell = document.createElement("td");
    colorCell.style.backgroundColor = color.color_name;
    colorCell.textContent = color.color_name;
    colorCell.style.color = adjustedColor;
    row.append(colorCell);

    if (color.color_name) {
      colorCell.addEventListener("click", (event) => {
        const newBackgroundColor = event.target.textContent;
        bodyElement.style.backgroundColor = newBackgroundColor;
      });
    }

    const countCell = document.createElement("td");
    countCell.textContent = color.color_count;
    row.append(countCell);

    const actionButton = document.createElement("button");
    actionButton.textContent = "Delete";
    const actionCell = document.createElement("td");
    actionCell.append(actionButton);
    row.append(actionCell);

    row.dataset.colorId = color.color_id;

    actionButton.addEventListener("click", () => {
      if (color.color_id) {
        const colorId = row.dataset.colorId;
        deleteColorEntry(row, colorId);
      }
    });

    colorListElement.append(row);
  });
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
  const string = new Option().style;
  string.color = colorString.toLowerCase();
  return string.color === colorString.toLowerCase();
}

async function handleColorSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const colorObject = Object.fromEntries(formData);
  const { color } = colorObject;

  bodyElement.style.backgroundColor = color;
  const isValid = validCssColor(color);

  if (isValid) {
    try {
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
        handleSaveError(response.status);
      }
    } catch (error) {
      console.error("Error saving color:", error);
      errorMessageElement.textContent = "Error saving color.";
    }
  } else {
    errorMessageElement.textContent = "Please enter a valid color.";
  }
}

function handleSaveError(status) {
  console.log("Error saving color", { status });
  errorMessageElement.textContent = "Error saving color.";
}

colorInput.addEventListener("input", handleColorChange);
formElement.addEventListener("submit", handleColorSubmit);
window.addEventListener("load", handleOnPageLoad);
