import express from 'express';
import bodyParser = require('body-parser');
const {products} = require('./products.json');

const app = express();//new server
const allOrders: any[] = require('./orders.json');


const PORT = 3232;

const PAGE_SIZE = 200;

var manageOrders : any[];

app.use(bodyParser.json());

app.use((_, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

//search event 

app.get('/api/orders', (req, res) => {
	const page = <number>(req.query.page || 1);
	
	var searchBy = req.query.searchBy;
	var searchFor = req.query.searchFor;
	// const orders: any[] = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	//return all orders
	if (searchFor === ''){
		res.send(allOrders);
	}
	//search by value
	else{
		switch (searchBy) {
			case 'OrderID':{
				const orderId = <string>(searchFor);
				const orderById = allOrders.filter(({id})=> id.toString().includes(orderId));
				res.send(orderById);
			}

			case 'CustomerName':{
				const customerName = <string>(searchFor);
				const orderByName = allOrders.filter(({customer})=> (customer.name.toLowerCase()).includes(customerName.toLowerCase()));
				res.send(orderByName);
			}


			case 'FulfillmentStatus':{
				const fulfillmentstatus = <string>(searchFor);
				const orderByfull = allOrders.filter(({fulfillmentStatus})=> fulfillmentStatus.toLowerCase() === fulfillmentstatus.toLowerCase());
				res.send(orderByfull);
			}

			case 'PaymentStatus':{
				const paymentstatus = <string>(searchFor);
				const orderBypay = allOrders.filter(({status})=> status.toLowerCase() === paymentstatus.toLowerCase());
				res.send(orderBypay);
			}
		}
	}

});

//get all products
app.get("/api/items/", (req, res) => {
  res.send(products);
});

//get item by OrderId
app.get('/api/items/:itemId', (req, res) => {
	const itemId = <string>(req.params.itemId);
	const size = <string>(req.query.size || 'large');
	const product = products[itemId];
	res.send({
		id: itemId,
		name: product.name,
		price: product.price,
		image: product.images[size]
	});
});

//handle Order - By agent request
app.post('/api/handleOrder',(req, res) => {
	var agentId=<string>req.params.agentId;
	var orderId=<string>req.body.orderId;
	if (agentId !== " "){
		if(!(manageOrders.find(({element})=> element === orderId))){
			manageOrders.push(orderId);
			res.send("approved");
		}
		else {
			res.send("This Order is already handled");
		}
	}
	else { var i = manageOrders.indexOf(orderId);
		manageOrders.splice(i, i+1);
		res.send("Order Unhendeled");

	}

})
		

app.listen(PORT);
console.log('Listening on port', PORT);
