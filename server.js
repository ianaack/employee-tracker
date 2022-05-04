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
  console.log("Viewing Employees by Last Name\n");
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

sortByDepartment = () => {
  console.log("Viewing Employees by Department\n");
  const sql = `SELECT CONCAT(employees.first_name," ", employees.last_name) AS "Employee", roles.title AS Role, roles.salary AS Salary, departments.name AS Department FROM employees RIGHT JOIN roles ON employees.role_id = roles.id RIGHT JOIN departments ON departments.id = roles.department_id ORDER BY department_id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// "Add" functions
addDepartment = () => {
  // this is a straight add to the database as this is the top most table
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
  // this is a little more complicated because we need to reference and send data to two tables (the roles table, and the departments table)
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
      // now that we have our information, we need to call and pass the information to the appropriate tables
      // this first function puts the information into the roles table
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

        // this function calls the proper department.name and passes in the roleTitle and roleSalary information into the departments table
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

addEmployee = () => {
  // this is the most complicated function as we need to reference and pass information to all 3 tables
  // this first call is to the employees table, to determine the new employee's manager
  const sql = `SELECT CONCAT(employees.first_name," ", employees.last_name) AS name FROM employees`;
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "managersName",
          message: "Who is the new employee's manager?",
          choices: rows,
        },
      ])
      .then(({ managersName }) => {
        getManagerID(managersName);
      });
    const getManagerID = function (managersName) {
      const sql = `SELECT employees.id FROM employees WHERE CONCAT(employees.first_name," ", employees.last_name) = "${managersName}"`;

      connection.query(sql, (err, rows) => {
        if (err) throw err;
        let managerId = rows[0].id;

        let newEmployee = function (managerId) {
          const sql = `SELECT roles.title AS name FROM roles`;

          connection.query(sql, (err, rows) => {
            if (err) throw err;
            inquirer
              .prompt([
                {
                  type: "input",
                  name: "firstName",
                  message: "What is the new employee's first name?",
                  validate: (input) => {
                    if (input) {
                      return true;
                    } else {
                      console.log(
                        "\n\nPlease enter a first name for the employee.\n"
                      );
                      return false;
                    }
                  },
                },
                {
                  type: "input",
                  name: "lastName",
                  message: "What is the new employee's last name?",
                  validate: (input) => {
                    if (input) {
                      return true;
                    } else {
                      console.log(
                        "\n\nPlease enter a last name for the employee.\n"
                      );
                      return false;
                    }
                  },
                },
                {
                  type: "list",
                  name: "roleTitle",
                  message: "What is the new employee's role?",
                  choices: rows,
                  loop: false,
                },
              ])
              .then(({ firstName, lastName, roleTitle }) => {
                getRoleId(firstName, lastName, roleTitle, managerId);
              });
          });
        };
        newEmployee(managerId);
      });
    };
    const getRoleId = function (firstName, lastName, roleTitle, managersName) {
      const sql = `SELECT roles.id FROM roles WHERE roles.title = "${roleTitle}"`;

      connection.query(sql, (err, rows) => {
        if (err) throw err;
        addNewEmployee(firstName, lastName, rows[0].id, managersName);
      });
    };
    const addNewEmployee = function (firstName, lastName, roleId, managerId) {
      const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
      const params = [firstName, lastName, roleId, managerId];

      connection.query(sql, params, (err) => {
        if (err) throw err;
        console.log(`\n${firstName} ${lastName} was added to the database!\n`);
        promptUser();
      });
    };
  });
};

// "Delete" functions
deleteDepartment = () => {
  const sql = `SELECT departments.name FROM departments`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "deleteDepartment",
          message: "Which Department would you like to remove?",
          choices: rows,
          loop: false,
        },
      ])
      .then(({ deleteDepartment }) => {
        const sql = `DELETE FROM departments WHERE name = "${deleteDepartment}"`;

        connection.query(sql, (err, rows) => {
          if (err) throw err;
          console.log(
            `\n${deleteDepartment} has been removed from the database.\n`
          );
          promptUser();
        });
      });
  });
};

deleteRole = () => {
  const sql = `SELECT roles.title AS name FROM roles`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "deleteRole",
          message: "Which Role would you like to remove?",
          choices: rows,
          loop: false,
        },
      ])
      .then(({ deleteRole }) => {
        const sql = `DELETE FROM roles WHERE title = "${deleteRole}"`;

        connection.query(sql, (err, rows) => {
          if (err) throw err;
          console.log(`\n${deleteRole} has been removed from the database.\n`);
          promptUser();
        });
      });
  });
};

deleteEmployee = () => {
  const sql = `SELECT CONCAT(employees.id," ", employees.first_name," ", employees.last_name) AS name FROM employees`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "deleteEmployee",
          message: "Which Employee would you like to remove?",
          choices: rows,
          loop: false,
        },
      ])
      .then(({ deleteEmployee }) => {
        let employeeId = deleteEmployee.split(" ")[0];
        let employeeFirstName = deleteEmployee.split(" ")[1];
        let employeeLastName = deleteEmployee.split(" ")[2];
        const sql = `DELETE FROM employees WHERE (employees.first_name = "${employeeFirstName}" AND employees.last_name = "${employeeLastName}")`;

        connection.query(sql, (err, rows) => {
          if (err) throw err;
          console.log(
            `\n${employeeFirstName} ${employeeLastName} has been removed from the database.\n`
          );
          promptUser();
        });
      });
  });
};

// "Update" functions

updateEmployee = () => {
  // which employee would you like to update? - list
  // update role_id function
};

updateManagers = () => {
  // which employee would you like to update? - list
  // who is their new manager? - list
  // update manager_id function
};
