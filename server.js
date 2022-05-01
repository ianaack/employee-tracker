// required modules
const cTable = require("console.table");
const inquirer = require("inquirer");
const mysql = require("mysql2");

// required files
const credentials = require("./db/credentials");

// MySQL connection data
const connection = mysql.createConnection({
  host: "localhost",
  user: credentials.user,
  password: credentials.password,
  database: "company",
});

connection.connect((error) => {
  if (error) {
    console.log("Error connecting to the MySQL Database");
    return;
  }
});

const init = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "initial",
        message: "What would you like to do?",
        choices: [
          "View all Departments",
          "Add a Department",
          "Delete a Department",
          "View all Roles",
          "Add a Role",
          "Delete a Role",
          "View all Employees",
          "Add an Employee",
          "Update an Employee's Role",
          "Update Employee Managers",
          "Delete an Employee",
          "Exit Employee Tracker",
        ],
        loop: false,
        pageSize: 12,
      },
    ])
    .then((answers) => {
      switch (answers.init) {
        case "View all Departments":
          viewDepartments();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Delete a Department":
          deleteDepartment();
          break;
        case "View all Roles":
          viewRoles();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Delete a Role":
          deleteRole();
          break;
        case "View all Employees":
          viewEmployees();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Update an Employee's Role":
          updateEmployee();
          break;
        case "Update Employee Managers":
          updateManagers();
          break;
        case "Delete an Employee":
          deleteEmployee();
          break;
        case "Exit Employee Tracker":
          console.log("Your connection to the MySQL Database has ended.");
          connection.end();
          break;
      }
    });
};

// viewDepartmentBudget() is a function within viewDepartments()
// sortByManager() is a function within ViewEmployees()
// sortByDepartment() is a function within ViewEmployees()

function viewDepartments() {
  const sql = `SELECT name AS 'Departments' FROM departments`;

  connection.query(sql, (err, res) => {
    if (err) throw err;
    console.table(res);
    init();
  });
}

// start inquirer
init();
