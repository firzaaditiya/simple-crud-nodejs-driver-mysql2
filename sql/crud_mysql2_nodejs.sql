show databases;

create database db_temp;

use db_temp;

create table products (
	id varchar(100) not null,
    name varchar(100) not null,
    brand varchar(100) not null,
    price int unsigned not null default 0,
    color varchar(20) not null,
    category enum("Baju", "Celana", "Jaket", "Aksesoris") not null,
    primary key (id),
    constraint price_check check (price >= 1000)
) engine = innodb;

show tables;

insert into products (id, name, brand, price, color, category)
	values (
		"2d570b53-e327-4e40-9064-ee839ad1cfdf",
        "Celana Jeans",
        "Levi's",
        800000,
        "Biru",
        "Celana"
    );
    
select * from products;