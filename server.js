const mysql = require("mysql");
require('dotenv').config();
const inquirer = require("inquirer");

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
      choices: ['Add department', 'Add role', 'Add employee', 'View department', 'View role', 'View employee', 'Update employee roles'],
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
  //TODO: use the department IDs from the dept table to populate the choices for the list of DEPT ID (can nest connection.queries)
  inquirer.prompt([
    {
      type: 'input',
      message: 'What is the title of your role?',
      name: 'roleTitle'
    },
    {
      type: 'number',
      message: 'What is the salary of your role?',
      name: 'salary'
    },
    {
      type: 'number',
      message: 'What is the department ID for your role?',
      //TODO: choices go here
      name: 'deptID'
    }
  ]).then(answers => {
    console.log('Inserting a new role...\n');
    connection.query(
      "INSERT INTO role SET ?",
      {
        title: answers.roleTitle,
        salary: answers.salary,
        department_id: answers.deptId
      },
      (err, res) => {
        if (err) throw err;
        console.log(res.affectedRows + " role inserted!\n");
        startUp();
      }
    )
  })
}

function addEmployee() {

}
function viewDepartment() {

}
function viewRole() {

}
function viewEmployee() {

}
function updateRoles() {

}