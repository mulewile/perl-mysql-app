# TESTAUFGABE

### Erstelle eine Internetseite mit einem Inputfeld und einem "Speichern"-Button.

• Während der Eingabe eines HTML Farbcodes bzw. eines gültigen Farbnamens, soll sich die Seitenhintergrundfarbe sofort auf den eingegebenen Wert ändern.
• Bei Klick auf den "Speichern"-Button, soll der Farbcode in eine MySQL Tabelle gespeichert werden.
• Beim Laden der Internetseite, soll der zuvor in der MySql DB gespeicherte Farbcode wieder ausgelesen und auf der Seite als Hintergrundfarbe gesetzt werden.
• Wir erwarten dokumentierter Quellcode und ein ausgewogenes Design.

### Folgende Techniken müssen dafür eingesetzt werden:

• Perl
• HTML
• Pures JavaScript und/oder jQuery
• CSS
• MySql

---

## Tasks

### Basic functionality.

1. index.html file.

- [ ] Create an index.html file in the public directory.
- [ ] Create a form with an input field and a save button.
- [ ] Create classes in the main elements of the index.html file.
- [ ] Create custom data attributes in the main elements of the index.html file.

2. styles.css file.

- [ ] Create a styles.css file in the public directory.
- [ ] Connect the styles.css file to the index.html file.
- [ ] Give the index.html main compnents basic styling and positioning.

3. index.js file

- [ ] Create an index.js file in the public directory.
- [ ] Connect the styles.js file to the index.js file.
- [ ] Store javascript data attributes as variables.
- [ ] Write a handleColorChange function to handle the onChange event and set the value of the background to the current value from the input field.
- [ ] Write a handleColorSubmit function to handle the submission in the input field.
- [ ] Write a handleOnPageLoad function to handle the the setting of the background color when page is loaded.
- [ ] Listen to the "input" event and call the handleColorChange function.
- [ ] Listen to the "submit" event and call the handleColorSubmit function.
- [ ] Listen to the "load" event and call the handleOnPageLoad function.

### Data Persistence.

1. MYSQL database.

- [ ] Research on the [MYSQL](https://www.mysql.com/) database installation and use.
- [ ] Install MYSQL database and initialise the server.
- [ ] Open terminal and connect to the MySQL server to create the "myDB" database.
- [ ] Create the "myDB" database with id INT and color VARCHAR.

2. Perl Script.

- [ ] Research and learn basic [Perl](https://www.educative.io/courses/learn-perl-from-scratch) programming language especially interacting [with MySQL](https://www.mysqltutorial.org/perl-mysql/).

- [ ] Install [Strawberry Perl](https://strawberryperl.com/) for windows.
- [ ] Install CPAN CBI module.
- [ ] Install CPAN CGI module.
- [ ] Create a script.cgi file in the public directory.
- [ ] Connect to "myDB" database.
- [ ] Get form data and insert it into the "myDB" database.
- [ ] Retrieve form data from "myDB" database.
- [ ] Print form data from "myDB" database.

3. Index.html Update.

- [ ] Add action="script.cgi" to the form element.
- [ ] Add method="post" to the form element.

4. Index.js Update.

- [ ] Refactor the handleColorSubmit function to make a POST request to "myDB" database through script.cgi.
- [ ] Refactor the handleOnPageLoad function to make a GET request from "myDB" database through script.cgi.

5. APACHE server.

- [ ] Research on the installation and use of APACHE.
- [ ] Install [Wampserver](https://sourceforge.net/projects/wampserver/).
- [ ] Configure Wampserver to handle CGI scripts.
- [ ] Configure project path to create a virtual host called "mywebsite".
- [ ] Initialise Wampserver.

6. Test "mywebsite".

- [ ] Test "mywebsite" that background color changes upon user input of a valid color.
- [ ] Test "mywebsite" that the sumbited color is saved in the database.
      Test "mywebsite" that the sumbited color is retrieved from the database upon page load and background color is set to last saved color.
- [ ] Handle and resolve any errors in programme logs and webpage console.

7. Generate mysql-dump.

8. Upload project on GitHub.

9. Deploy project on Vercel.
