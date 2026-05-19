
CREATE TABLE `t_orders`(
    id bigint(28) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_number varchar(255) DEFAULT NULL,
    sku_code varchar(255),
    price decimal(19,2),
    quantity int(11)

)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
