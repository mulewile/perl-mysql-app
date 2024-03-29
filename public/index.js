import manipulateElementClass from "./handlers/manipulatElementClass/index.js";

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
const errorMessageElement = getElement("errorMessage");
const addButtonContainerElement = getElement("addButtonContainer");
const formWrapperElement = getElement("formWrapper");
const colorListContainerElement = getElement("colorListContainer");
const signUpFormElement = getElement("signupForm");
const signInFormElement = getElement("signInForm");

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
      //signUpFormElement.classList.add("hidden");
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

//This function is used to validate the color string. It takes the color string as a parameter.
//It then checks if the color string is a string and if it is not empty.
//It then converts the color string to lower case and checks if it is a valid CSS color string.
//Warning: This function does not check if the color string is a valid hexadecimal color string.
function validCssColor(colorString) {
  if (colorString !== "string") {
    console.error("Invalid color string");
  } else if (colorString === "") {
    console.error("Invalid color string");
  } else {
    const lowerCaseColorString = colorString.toLowerCase();
    const string = new Option().style;

    const isValidString = string.color === lowerCaseColorString;
    const isValidHexPattern = /^#[0-9A-F]{6}$/i.test(colorString);
    return isValidString || isValidHexPattern;
  }
}

//This function is used to handle the form submit event. It takes the event as a parameter.
//It then gets the form data and converts it to an object

function handleColorSubmit(event) {
  const formData = new FormData(event.target);
  const formObject = Object.fromEntries(formData);
  const isColorCreate =
    formElement.getAttribute("data-color-create") === "true";
  const isUserRegister =
    signUpFormElement.getAttribute("data-user-create") === "true";
  const isUserLogin =
    signInFormElement.getAttribute("data-user-login") === "true";

  if (isUserRegister) {
    postColorData(formObject, "create user");
  } else if (isUserLogin) {
    postColorData(formObject, "sign in user");
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
//This function is used to post the data to the server. It takes the form data and the action value as parameters.
//The action value is used to determine which action to take on the server side.
//The action value is passed to the server as a JSON object.
//The server then uses the action value to determine which action to take.
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
    console.log("API Data", API_DATA[1]);
    if (response.ok && API_DATA.isUserCreated === "1") {
      getLastTenColors();

      console.info(SUCCESS_MESSAGE, { status: response.status });
      errorMessageElement.textContent = "";

      manipulateElementClass(mainElement, "hidden", "remove");
      manipulateElementClass(signUpFormElement, "hidden", "add");
      manipulateElementClass(colorListContainerElement, "hidden", "remove");
    } else if (response.ok && API_DATA[0].isLogin === "1") {
      setLastTenTable(API_DATA[1]);
      setColorDetail(API_DATA[1]);

      manipulateElementClass(mainElement, "hidden", "remove");
      manipulateElementClass(signInFormElement, "hidden", "add");
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

//This function is used to handle the input event. It uses event delegation to determine which input element was changed.

document.addEventListener("input", (event) => {
  const EVENT_TARGET = event.target;
  if (
    EVENT_TARGET.tagName.toLowerCase() === "input" &&
    EVENT_TARGET.type === "text" &&
    EVENT_TARGET.name === "color"
  ) {
    const colorInput = EVENT_TARGET;
    const inputValue = colorInput.value;
    if (inputValue === "") {
      console.error("Invalid color");
      return;
    } else {
      const firstLetterCapitalised = capitaliseFirstLetter(inputValue);
      colorInput.value = firstLetterCapitalised;
      handleColorChange();
    }
  } else if (
    EVENT_TARGET.matches(".login_username_input") ||
    EVENT_TARGET.matches(".login_password_input")
  ) {
    signInFormElement.setAttribute("data-user-login", "true");
  } else if (EVENT_TARGET.matches(".form--Register")) {
    signUpFormElement.setAttribute("data-user-create", "true");
  } else if (EVENT_TARGET.matches(".form")) {
    formElement.setAttribute("data-color-create", "true");
  }
});

//This function is used to handle the submit event. It uses event delegation to determine which form was submitted.
document.addEventListener("submit", (event) => {
  const EVENT_TARGET = event.target;

  const isFormSubmit = EVENT_TARGET.matches(".form");
  const isUserCreateSubmit = EVENT_TARGET.matches(".form--Register");
  const isUserLoginSubmit = EVENT_TARGET.matches(".form--Signin");

  if (isFormSubmit) {
    event.preventDefault();
    const colorInput = EVENT_TARGET.querySelector('[name="color"]');
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
  } else if (isUserLoginSubmit) {
    event.preventDefault();
    handleColorSubmit(event);
  }
});

//This is the DOMContentLoaded event handler. It is used to determine if the DOM has finished loading.
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

//This function is used to handle the click event. It uses event delegation to determine which element was clicked.
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
