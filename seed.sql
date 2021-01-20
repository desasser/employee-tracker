INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Daniel", "Sasser", 1, 1), ("Jim", "Thorn", 2, 1), ("Bullet", "Bill", 3, 1);

INSERT INTO role (title, salary, department_id)
VALUES ("Developer", 100000, 1), ("Server Tech", 200000, 1), ("Accountant", 300000, 2);

INSERT INTO department (name)
VALUES ("RND"), ("Finance");