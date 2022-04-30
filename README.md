# employee-tracker

## USER STORY

- AS A business owner
- I WANT to be able to view and manage the departments, roles, and employees in my company
- SO THAT I can organize and plan my business

## Acceptance Criteria

- GIVEN a command-line application that accepts user input
<!--node.js-->
- WHEN I start the application
- THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
<!--inquirer list-->
- WHEN I choose to view all departments
- THEN I am presented with a formatted table showing department names and department ids
<!--populated departments mySQL table presented with console.table, this is similar to the parties table-->
- WHEN I choose to view all roles
- THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
<!--populated roles mySQL table presented with console.table, this is similar to the candidates table-->
- WHEN I choose to view all employees
- THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
<!--populated employees mySQL table presented with console.table, this is similar to the voters table-->
- WHEN I choose to add a department
- THEN I am prompted to enter the name of the department and that department is added to the database
<!--inquirer prompt which upon submission `INSERT INTO` departments table-->
- WHEN I choose to add a role
- THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
<!--inquirer prompts which upon submission format data and `INSERT INTO` roles table-->
- WHEN I choose to add an employee
- THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
<!--inquirer prompts which upon submission format data and `INSERT INTO` employees table-->
- WHEN I choose to update an employee role
- THEN I am prompted to select an employee to update and their new role and this information is updated in the database
<!--inquirer list of employees, prompts to select new role from list of existing roles, `UPDATE` employees table-->

## Bonus

Try to add some additional functionality to your application, such as the ability to do the following:

- Update employee managers. +2 points
<!--similar to `update a candidate's party-->
- View employees by manager. +2 points
<!--create a SORT BY function-->
- View employees by department. +2 points
<!--create a SORT BY function-->
- Delete departments, roles, and employees. +2 points each
<!--create a delete function-->
- View the total utilized budget of a department—in other words, the combined salaries of all employees in that department. +8 points
<!--similar to router.get("/votes) in voteRoutes.js-->


