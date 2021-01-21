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
      choices: ['Add department', 'Add role', 'Add employee', 'View department', 'View role', 'View employee', 'View employees by manager', 'Update employee roles'],
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
        updateRoles();
        break;
      default:
        connection.end();
        break;
    }
  })
};

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
  connection.query("SELECT name FROM department", (err, res) => {
    if (err) throw err;
    const departmentArr = res.map(element => ({name:element.name,value:element.id}));
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
          console.table(res);
          startUp();
        }
      )
    });
  });
}

function addEmployee() {
  const roleArr = [];

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
        // mgmtArr.push({name: fullName,value: element.id});
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
            console.table(res);
            startUp();
          })
      })
    })
  })
}

function viewDepartment() {
  connection.query(
    "SELECT * FROM department", (err, res) => {
      if (err) throw err;
      console.table(res);
      startUp();
    }
  )
}

function viewRole() {
  connection.query(
    "SELECT * FROM role", (err, res) => {
      if (err) throw err;
      console.table(res);
      startUp();
    }
  )
}

function viewEmployee() {
  connection.query(
    "SELECT * FROM employee", (err, res) => {
      if (err) throw err;
      console.table(res);
      startUp();
    }
  )
}

//TODO: update the call here
function viewEmployeeByMGMT() {
  const managerArr = [];
  connection.query("SELECT * FROM employee JOIN role USING (id)", (err, res) => {
    if (err) throw err;
    res.forEach(element => {
      managerArr.push(element.manager_id)
    });
    inquirer.prompt({
      type: 'list',
      choices: managerArr, //TODO: Current choices are just manager ID number, should be names?
      message: 'Which manager would you like to view?',
      name: 'employeesByMGMT'
    }).then(response => {
      connection.query(
        "SELECT * FROM employee WHERE manager_id = ?", [response.employeesByMGMT], (err, res) => {
          if (err) throw err;
          console.table(res);
          startUp();
        });
    });
  });
}

function updateRoles() {
  // Should return a list of employees and their roles
  // Should then ask which employee you'd like to update
  // What would you like to change (firstName, lastName, roleID, mgmtID)
  // Switch for each option and allow for updates to the db
}

// Add other functions like updateRoles for updating departments, roles, and employees
// Also should be able to delete them