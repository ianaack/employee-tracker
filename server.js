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
  console.log("\n");
  console.log(
    "Successfully connected to company database." + connection.threadId
  );
  console.log("\n");
  promptUser();
});

const promptUser = () => {
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
      const { choices } = answers;

      if (choices === "View all Departments") {
        viewDepartments();
      }

      if (choices === "Add a Department") {
        addDepartment();
      }

      if (choices === "Delete a Department") {
        deleteDepartment();
      }

      if (choices === "View all Roles") {
        viewRoles();
      }

      if (choices === "Add a Role") {
        addRole();
      }

      if (choices === "Delete a Role") {
        deleteRole();
      }

      if (choices === "View all Employees") {
        viewEmployees();
      }

      if (choices === "Add an Employee") {
        addEmployee();
      }

      if (choices === "Update an Employee's Role") {
        updateEmployee();
      }

      if (choices === "Update Employee Managers") {
        updateManagers();
      }

      if (choices === "Delete an Employee") {
        deleteEmployee();
      }

      if (choices === "Exit Employee Tracker") {
        connection.end();
      }
    });
};

// viewDepartmentBudget() is a function within viewDepartments()
// sortByManager() is a function within ViewEmployees()
// sortByDepartment() is a function within ViewEmployees()

viewDepartments = () => {
  console.log("Company has the following departments:\n");
  const sql = `SELECT name AS 'Departments' FROM departments`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};
