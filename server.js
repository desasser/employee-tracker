const mysql = require("mysql");
require('dotenv').config();
const inquirer = require("inquirer");
require('console.table');

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: process.env.DB_PASSWORD,
  database: "employee_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  startUp();
});

function startUp() {
  inquirer.prompt(
    {
      type: 'list',
      choices: ['Add department', 'Add role', 'Add employee', 'View department', 'View role', 'View employee', 'View employees by manager', 'Update employee roles', 'Delete department', 'Quit'],
      message: 'What would you like to do?',
      name: 'action'
    }
  ).then(answers => {
    console.log(answers);
    switch (answers.action) {
      case 'Add department':
        addDepartment();
        break;
      case 'Add role':
        addRole();
        break;
      case 'Add employee':
        addEmployee();
        break;
      case 'View department':
        viewDepartment();
        break;
      case 'View role':
        viewRole();
        break;
      case 'View employee':
        viewEmployee();
        break;
      case 'View employees by manager':
        viewEmployeeByMGMT();
        break;
      case 'Update employee roles':
        updateRole();
        break;
      case 'Delete department':
        deleteDepartment();
        break;
      case 'Quit':
        connection.end();
        break;
      default:
        connection.end();
        break;
    }
  })
}

// adds department to the dept table in the db
function addDepartment() {
  inquirer.prompt({
    type: 'input',
    message: 'What is the name of your department?',
    name: 'deptName'
  }).then(answers => {
    console.log('Inserting a new department...\n');
    connection.query(
      "INSERT INTO department SET ?",
      {
        name: answers.deptName
      },
      (err, res) => {
        if (err) throw err;
        console.log(res.affectedRows + " department inserted!\n");
        startUp();
      }
    )
  })
}

function addRole() {
  connection.query("SELECT name, id FROM department", (err, res) => {
    if (err) throw err;
    const departmentArr = res.map(element => ({ name: element.name, value: element.id }));
    console.log(res);
    inquirer.prompt([
      {
        type: 'input',
        message: 'Title?',
        name: 'roleTitle'
      },
      {
        type: 'number',
        message: 'Salary?',
        name: 'salary'
      },
      {
        type: 'list',
        message: 'Department ID?',
        choices: departmentArr,
        name: 'deptID'
      }
    ]).then(answers => {
      console.log('Inserting a new role...\n');
      console.log('dept arr', departmentArr);
      console.log('department_id', answers.deptID);
      // places info into the db
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answers.roleTitle,
          salary: answers.salary,
          department_id: answers.deptID
        },
        (err, res) => {
          if (err) throw err;
          console.log(res.affectedRows + " role inserted!\n");
          startUp();
        }
      )
    });
  });
}

function addEmployee() {
  // fetch titles for role choices
  connection.query("SELECT title, id FROM role", (err, res) => {
    if (err) throw err;
    const roleArr = res.map(element => ({ name: element.title, value: element.id }));

    let fullName;
    // fetch names for manager choices
    connection.query("SELECT first_name,last_name, id FROM employee", (err, res2) => {
      if (err) throw err;
      const mgmtArr = res2.map(element => {
        fullName = `${element.first_name} ${element.last_name}`;
        return { name: fullName, value: element.id };
      });
      inquirer.prompt([
        {
          type: 'input',
          message: 'First name?',
          name: 'firstName'
        },
        {
          type: 'input',
          message: 'Last name?',
          name: 'lastName'
        },
        {
          type: 'list',
          message: 'Role?',
          choices: roleArr,
          name: 'roleID'
        },
        {
          type: 'list',
          message: 'Manager?',
          choices: mgmtArr,
          name: 'mgmtID'
        }
      ]).then(answers => {
        console.log('Inserting a new employee...\n');

        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: answers.roleID,
            manager_id: answers.mgmtID
          },
          (err, res) => {
            if (err) throw err;
            console.log(res.affectedRows + " role inserted!\n");
            startUp();
          })
      })
    })
  })
}

function viewDepartment() {
  connection.query(
    "SELECT name FROM department", (err, res) => {
      if (err) throw err;
      console.table(res);
      startUp();
    }
  )
}

function viewRole() {
  connection.query(
    "SELECT title, salary, name FROM role JOIN department ON role.department_id = department.id", (err, res) => {
      if (err) throw err;
      console.table(res);
      startUp();
    }
  )
}

function viewEmployee() {
  connection.query(
    "SELECT first_name, last_name, title, salary, name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id", (err, res) => {
      if (err) throw err;
      console.table(res);
      startUp();
    }
  )
}

function viewEmployeeByMGMT() {
  connection.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    const managerArr = res.map(element => {
      fullName = `${element.first_name} ${element.last_name}`;
      return { name: fullName, value: element.id };
    });
    inquirer.prompt({
      type: 'list',
      choices: managerArr,
      message: 'Which manager would you like to view?',
      name: 'employeesByMGMT'
    }).then(response => {
      connection.query(
        "SELECT first_name, last_name, title, salary FROM employee JOIN role ON employee.role_id = role.id WHERE manager_id = ?", [response.employeesByMGMT], (err, res) => {
          if (err) throw err;
          console.table(res);
          startUp();
        });
    });
  });
}

function updateRole() {
  connection.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    const empArr = res.map(element => {
      fullName = `${element.first_name} ${element.last_name}`;
      return { name: fullName, value: element.id };
    });
    connection.query("SELECT title,id FROM role", (err, res2) => {
      if (err) throw err;
      const roleArr = res2.map(element => ({ name: element.title, value: element.id }))

      inquirer.prompt([
        {
          type: 'list',
          message: 'Which employee do you want to modify?',
          choices: empArr,
          name: 'modEmp'
        }, {
          type: 'list',
          message: 'What is their new role?',
          choices: roleArr,
          name: 'modRole'
        }
      ]).then(response => {
        connection.query("UPDATE employee SET ? WHERE ?", [
          { role_id: response.modRole },
          { id: response.modEmp }], (err, res3) => {
            if (err) throw err;
            console.log(res3.affectedRows + " role updated!\n");
            viewEmployee();
          })
      })
    })
  })
}

function deleteDepartment() {
  connection.query(
    "SELECT name,id FROM department", (err, res) => {
      const deptArr = res.map(element => ({name:element.name, value:element.id}));
      if (err) throw err;
      inquirer.prompt({
        type: 'list',
        message: 'Delete which department?',
        choices: deptArr,
        name: 'delDept'
      }).then(response => {
        connection.query(
          "DELETE FROM department WHERE ?", {id: response.delDept}, (err,res) => {
            if (err) throw err;
            console.log(res.affectedRows + " department deleted!\n");
            viewDepartment();
          }
        )
      })
})
}

// TODO: Future progress - Delete roles, delete employees, update role departments
// TODO: Future progress - When a dept or role is deleted, require the user to update the roles for each employee affected and when a dept is deleted, require the user to update the department for each role affected
// TODO: Future progress - Calculate the total utilized budget for a department (combined salary)