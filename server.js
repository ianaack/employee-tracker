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
  console.log("\nSuccessfully connected to the company database.\n");
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
          "Delete an Employee",
          "Update an Employee's Role",
          "Update Employee Managers",
          "Exit Employee Tracker",
        ],
        loop: false,
        pageSize: 12,
      },
    ])
    .then((answers) => {
      choices = answers.initial;

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

      if (choices === "Delete an Employee") {
        deleteEmployee();
      }

      if (choices === "Update an Employee's Role") {
        updateEmployee();
      }

      if (choices === "Update Employee Managers") {
        updateManagers();
      }

      if (choices === "Exit Employee Tracker") {
        connection.end();
      }
    });
};

// "View" functions
viewDepartments = () => {
  console.log("\nCompany has the following departments:\n");
  const sql = `SELECT name AS Department FROM departments`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    inquirer
      .prompt([
        {
          name: "sortDepartments",
          type: "confirm",
          message: "Would you like to view a departments budget?",
        },
      ])
      .then((answers) => {
        if (answers.sortDepartments === true) {
          viewDepartmentBudget(rows);
        } else {
          promptUser();
        }
      });
  });
};

viewDepartmentBudget = (rows) => {
  let departmentsNames = rows.map(function (element) {
    return `${element.Department}`;
  });

  inquirer
    .prompt([
      {
        name: "whichDepartment",
        type: "list",
        message: "Which departments budget would you like to view?",
        choices: departmentsNames,
      },
    ])
    .then(({ whichDepartment }) => {
      const sql = `SELECT CONCAT(employees.first_name," ", employees.last_name) AS Employee, roles.title AS Title, roles.salary as Salary, departments.name AS Department FROM employees RIGHT JOIN roles on employees.role_id = roles.id RIGHT JOIN departments ON departments.id = roles.department_id WHERE name = "${whichDepartment}"`;

      connection.query(sql, (err, rows) => {
        if (err) throw err;
        let budget = 0;
        for (let i = 0; i < rows.length; i++) {
          budget += parseInt(rows[i].Salary);
        }
        console.log(
          `\nThe current total budget allocated to ${whichDepartment} is ${budget}\n`
        );
        promptUser();
      });
    });
};

viewRoles = () => {
  console.log("\nCompany has the following roles:\n");
  const sql = `SELECT roles.title AS Role, roles.salary as Salary, departments.name AS Department FROM roles LEFT JOIN departments ON roles.department_id = departments.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

viewEmployees = () => {
  inquirer
    .prompt([
      {
        name: "sortBy",
        type: "list",
        message: "How would you like to view your employees?",
        choices: ["Last Name", "Manager", "Department"],
      },
    ])
    .then((answers) => {
      choices = answers.sortBy;

      if (choices === "Last Name") {
        sortByLastName();
      }

      if (choices === "Manager") {
        sortByManager();
      }

      if (choices === "Department") {
        sortByDepartment();
      }
    });
};

// Sort Employees Functions
sortByLastName = () => {
  console.log("Viewing Employees by Last Name:\n");
  const sql = `SELECT CONCAT(first_name," ", last_name) AS "Employees" from employees ORDER BY last_name`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

sortByManager = () => {
  console.log("Viewing Employees by Manager\n");
  const sql = `SELECT CONCAT(employees.first_name," ", employees.last_name) AS "Employee", employees.manager_id, CONCAT(manager.first_name," ", manager.last_name) AS "Manager" FROM employees LEFT JOIN employees AS manager ON manager.id = employees.manager_id ORDER BY manager_id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// need to make - similar to sortByManager, just reference a different table
sortByDepartment = () => {
  console.log("Viewing Employees by Department\n");
  const sql = `SELECT CONCAT(employees.first_name," ", employees.last_name) AS "Employee", roles.title AS Role, roles.salary AS Salary, departments.name AS Department FROM employees RIGHT JOIN roles ON employees.role_id = roles.id RIGHT JOIN departments ON departments.id = roles.department_id ORDER BY department_id DESC`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// "Add" functions
addDepartment = () => {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "What is the name of the department you would like to add?",
        validate: (input) => {
          if (input) {
            return true;
          } else {
            console.log("\nPlease enter a department name.\n");
            return false;
          }
        },
      },
    ])
    .then(({ addDept }) => {
      const sql = `INSERT INTO departments (name) VALUES (?)`;
      const params = [addDept];

      connection.query(sql, params, (err, rows) => {
        if (err) throw err;
        console.log(`${addDept} has been added to database`);
      });
    })
    .then(() => {
      promptUser();
    });
};

addRole = () => {
  const sql = `SELECT departments.name FROM departments`;
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "What role would you like to add?",
          validate: (input) => {
            if (input) {
              return true;
            } else {
              console.log("\n\nPlease enter a role title.\n");
              return false;
            }
          },
        },
        {
          type: "number",
          name: "roleSalary",
          message: "What is the roles salary?",
        },
        {
          type: "list",
          name: "deptName",
          message: "What department does this role belong to?",
          choices: rows,
          loop: false,
        },
      ])
      .then(({ roleTitle, roleSalary, deptName }) => {
        const addRoles = function (title, salary, deptID) {
          const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`;
          const params = [title, salary, deptID];

          connection.query(sql, params, (err) => {
            if (err) throw err;
            console.log(`\n${title} has been added to the database\n`);
            promptUser();
          });
        };

        const getDeptID = function (roleTitle, roleSalary, deptName) {
          const sql = `SELECT departments.id FROM departments WHERE departments.name = "${deptName}"`;

          connection.query(sql, (err, rows) => {
            if (err) throw err;
            addRoles(roleTitle, roleSalary, rows[0].id);
          });
        };
        getDeptID(roleTitle, roleSalary, deptName);
      });
  });
};

addEmployee = () => {};

// "Delete" functions
deleteDepartment = () => {};

deleteRole = () => {};

deleteEmployee = () => {};

// "Update" functions

updateEmployee = () => {};

updateManagers = () => {};
