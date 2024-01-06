function getElement(selector) {
  return document.querySelector(`[data-js="${selector}"]`);
}

function genereateElement(
  elementName,
  classNames,
  elementTextContent,
  attribute,
  attributeValue
) {
  const element = document.createElement(elementName);

  if (classNames && classNames.length) {
    element.classList.add(...classNames);
  }

  if (elementTextContent) {
    element.textContent = elementTextContent;
  }

  if (attribute) {
    element.setAttribute(attribute, attributeValue);
  }

  return element;
}

const colorInput = getElement("color");
const mainElement = getElement("main");
const bodyElement = getElement("body");
const formElement = getElement("form");
const moodElement = getElement("mood");
const footerElement = getElement("footer");
const meaningElement = getElement("meaning");
const memoriesElement = getElement("memories");
const colorListElement = getElement("colorList");
const colorCountElement = getElement("colorCount");
const errorMessageElement = getElement("errorMessage");
const addButtonContainerElement = getElement("addButtonContainer");
const formWrapperElement = getElement("formWrapper");
const colorListContainerElement = getElement("colorListContainer");
const signupFormElement = getElement("signupForm");

const addButton = genereateElement("button", ["add_button--color"], "add");

addButtonContainerElement.appendChild(addButton);

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
  const isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(bgColor);
  if (!isValidColor) {
    throw new Error(
      "Invalid background color format. Please use valid hexadecimal color."
    );
  }
  const hexToRgb = (hex) => parseInt(hex, 16);
  const r = hexToRgb(bgColor.substring(1, 3));
  const g = hexToRgb(bgColor.substring(3, 5));
  const b = hexToRgb(bgColor.substring(5, 7));

  const luminance = r * 0.299 + g * 0.587 + b * 0.114;

  return luminance > 186 ? darkColor : lightColor;
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
  const API_URL = `./script.cgi?id=${colorId}`;
  const NETWORK_ERROR_MESSAGE = "Network error occurred while deleting data.";
  const ERROR_MESSAGE = "Error deleting color:";
  const SUCCESS_MESSAGE = "Color deleted successfully";
  try {
    const response = await fetch(API_URL, {
      method: "DELETE",
    });

    if (response.ok) {
      row.remove();
      handleOnPageLoad();
      console.info(SUCCESS_MESSAGE, response.statusText);
    } else {
      console.error(ERROR_MESSAGE, response.statusText);
    }
  } catch (error) {
    console.error(NETWORK_ERROR_MESSAGE, error);
  }
}

function setColorDetail({ color_object }) {
  try {
    if (
      !color_object ||
      !Array.isArray(color_object) ||
      color_object.length === 0
    ) {
      throw new Error("Invalid color data structure");
    }

    const { color_name, color_meaning, color_memories } = color_object[0];

    bodyElement.style.backgroundColor = color_name;
    moodElement.textContent = `My color is ${color_name}`;
    meaningElement.textContent = `${color_name} color associations: ${color_meaning}`;
    memoriesElement.textContent = `The ${color_name} color brings me memories like: ${color_memories}`;
  } catch (error) {
    console.error("Error setting color details:", error.message);
  }
}

function setLastTenTable(colorData) {
  const colorListElement = document.querySelector('[data-js="colorList"]');
  let colorListRows = colorListElement.querySelectorAll("tr");
  //colorListElement.innerHTML = "";

  colorListRows.forEach((row) => row.remove());
  for (const color of colorData.color_object) {
    const color_object = colorData.color_object;

    if (color_object.length === 0) {
      return;
    }
    const colourTableTh = document.querySelectorAll('[id="colourTable"] tr th');
    const row = document.createElement("tr");

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
      } else if (detail === "aktion one") {
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
      } else if (detail === "aktion two") {
        const actionButton = document.createElement("button");
        actionButton.textContent = "Edit";
        dataCell.append(actionButton);
        row.append(dataCell);

        row.dataset.colorId = color.color_id;
        actionButton.addEventListener("click", () => {
          if (color.color_id) {
            const colorId = row.dataset.colorId;
          }
        });
      }

      colorListElement.append(row);
    });
  }
}

async function getLastTenColors() {
  const API_URL = "./script.cgi";
  const ERROR = "Error:";
  const NETWORK_ERROR_MESSAGE = "Network error occurred while fetching data.";
  const INVALID_DATA_MESSAGE = "Invalid or missing color data in the response.";

  signupFormElement.setAttribute("data-user-create", "true");
  formElement.setAttribute("data-color-create", "true");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      console.log(ERROR, NETWORK_ERROR_MESSAGE);
      return;
    }

    const apiData = await response.json();
    if (apiData) {
      setLastTenTable(apiData);
      setColorDetail(apiData);
      //signupFormElement.classList.add("hidden");
    } else {
      console.log(ERROR, INVALID_DATA_MESSAGE);
    }
  } catch (error) {
    console.log(ERROR, error.message);
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

function handleColorSubmit(event) {
  const formData = new FormData(event.target);
  const formObject = Object.fromEntries(formData);
  const isColorCreate =
    formElement.getAttribute("data-color-create") === "true";
  const isUserRegister =
    signupFormElement.getAttribute("data-user-create") === "true";

  if (isUserRegister) {
    postColorData(formObject, "create user");
  } else if (isColorCreate) {
    const color = formObject.color;

    bodyElement.style.backgroundColor = color;
    const isValid = validCssColor(color);
    console.log("Form data", formData);
    console.log("colorObject", formObject);
    isValid
      ? postColorData(formObject, "create color data")
      : (errorMessageElement.textContent = "Please Enter a Valid Colour.");
  }
}

async function postColorData(formData, actionValue) {
  const API_URL = "./script.cgi";
  const NETWORK_ERROR_MESSAGE = "Network error occurred while inserting data.";
  const ERROR_MESSAGE = "Error saving color.";
  const SUCCESS_MESSAGE = "Color saved successfully";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, action: actionValue }),
    });

    const API_DATA = await response.json();
    console.log("API Data", API_DATA);
    if (response.ok && API_DATA.isUserCreated === "1") {
      getLastTenColors();

      console.info(SUCCESS_MESSAGE, { status: response.status });
      errorMessageElement.textContent = "";
      mainElement.classList.remove("hidden");
      signupFormElement.classList.add("hidden");
      colorListContainerElement.classList.remove("hidden");
    } else if (!response.ok) {
      console.info(ERROR_MESSAGE, { status: response.status });
      errorMessageElement.textContent = ERROR_MESSAGE;
    }
  } catch (error) {
    console.error(NETWORK_ERROR_MESSAGE, error);
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

function capitaliseFirstLetter(inputString) {
  const string = inputString.charAt(0).toUpperCase() + inputString.slice(1);
  if (string) {
    return string;
  } else {
    console.error("No input string found");
  }
}

document.addEventListener("input", (event) => {
  if (
    event.target.tagName.toLowerCase() === "input" &&
    event.target.type === "text" &&
    event.target.name === "color"
  ) {
    const colorInput = event.target;
    const inputValue = colorInput.value;
    if (inputValue === "") {
      console.error("Invalid color");
      return;
    } else {
      const firstLetterCapitalised = capitaliseFirstLetter(inputValue);
      colorInput.value = firstLetterCapitalised;
      handleColorChange();
    }
  }
});

document.addEventListener("submit", (event) => {
  const isFormSubmit = event.target.matches(".form");
  const isUserCreateSubmit = event.target.matches(".form--Register");

  if (isFormSubmit) {
    event.preventDefault();
    const colorInput = event.target.querySelector('[name="color"]');
    if (colorInput) {
      const inputValue = colorInput.value;
      const isValid = validCssColor(inputValue);

      if (inputValue.startsWith("#") && isValid) {
        const convertedHexColor = hexToCssColorName(inputValue, colorAPI);
        const firstLetterCapitalised = capitaliseFirstLetter(convertedHexColor);
        colorInput.value = firstLetterCapitalised;
      }

      handleColorSubmit(event);
    }
  } else if (isUserCreateSubmit) {
    event.preventDefault();
    handleColorSubmit(event);
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

document.addEventListener("click", (event) => {
  console.log(event.target);
  if (event.target.matches(".add_button--color")) {
    formWrapperElement.classList.remove("hidden");
    colorListContainerElement.classList.add("hidden");
  }
  if (event.target.matches(".button--cancel")) {
    formWrapperElement.classList.add("hidden");
    colorListContainerElement.classList.remove("hidden");
  }
});
