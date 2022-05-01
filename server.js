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
          "View all Roles",
          "View all Employees",
          "View Employees by Manager",
          "View Employees by Department",
          "View Department Budget",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee's Role",
          "Update Employee Managers",
          "Delete a Department",
          "Delete a Role",
          "Delete an Employee",
          "Exit Employee Tracker",
        ],
        loop: false,
        pageSize: 15,
      },
    ])
    .then((answers) => {
      switch (answers.init) {
        case "View all Departments":
          viewDepartments();
          break;
        case "View all Roles":
          viewRoles();
          break;
        case "View all Employees":
          viewEmployees();
          break;
        case "View Employees by Manager":
          viewEmployeesByManager();
          break;
        case "View Employees by Department":
          viewEmployeesByDepartment();
          break;
        case "View Department Budget":
          viewDepartmentBudget();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
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
        case "Delete a Department":
          deleteDepartment();
          break;
        case "Delete a Role":
          deleteRole();
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

// start inquirer
init();
