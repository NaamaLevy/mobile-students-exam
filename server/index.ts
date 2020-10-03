import express from 'express';
import bodyParser = require('body-parser');
const {products} = require('./products.json');

const app = express();//new server
const allOrders: any[] = require('./orders.json');

const PORT = 3232;

const PAGE_SIZE = 200;
var searchBy = "";
var searchFor = "";
app.use(bodyParser.json());

app.use((_, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

app.get('/api/orders', (req, res) => {
	const page = <number>(req.query.page || 1);
	
	var searchBy = req.query.searchBy;
	var searchFor = req.query.searchFor;
	console.log("searchBy : " + searchBy);
	console.log("searchFor :" + searchFor);
	// const orders: any[] = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	console.log('checkproduct');
	if (searchFor === ''){
		console.log("checkcleanSearch");
		res.send(allOrders);
	}
	else{
		switch (searchBy) {
			case 'OrderID':{
				const orderId = <string>(searchFor);
				const orderById = allOrders.filter(({id})=> id.toString().includes(orderId));
				console.log("checkorderid");
				res.send(orderById);
			}

			case 'CustomerName':{
				const customerName = <string>(searchFor);
				const orderByName = allOrders.filter(({customer})=> (customer.name.toLowerCase()).includes(customerName.toLowerCase()));
				console.log("checkorderCustName");
				res.send(orderByName);
			}

			case 'ItemName':{
				const itemName = <string>(searchFor);
				var orderByitem: any[] = [];
				var productid = 0; 
				console.log('checkproduct');
				for (var i=0; i < products.length; i++){
					  if (products[i][name].toLowerCase().includes(itemName).toLowerCase())
						productid = products[i][0];
				}
				if (productid ! = 0){
					orderByitem = allOrders.filter(({items})=> items.forEach((element: { id: any; }) => {element.id === productid}));

				console.log("checkorderItemName");
				}
				res.send(orderByitem);
			}

			case 'FulfillmentStatus':{
				const fulfillmentstatus = <string>(searchFor);
				const orderByfull = allOrders.filter(({fulfillmentStatus})=> fulfillmentStatus.toLowerCase() === fulfillmentstatus.toLowerCase());
				console.log("checkorderfulf");
				res.send(orderByfull);
			}

			case 'PaymentStatus':{
				const paymentstatus = <string>(searchFor);
				const orderBypay = allOrders.filter(({status})=> status.toLowerCase() === paymentstatus.toLowerCase());
				console.log("checkorderpay");
				res.send(orderBypay);
			}
		}
	}

});


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
app.get('/api.items/:itemName', (req,res)=>{
	const itemName = <string>(req.params.itemName);
	const size = <string>(req.query.size|| 'large');
	const product = products.find((element:any)=> element["name"] === req.params.itemName);
	res.send({
		id : product.id,
		name : product.name,
		price: product.price,
		image: product.images[size]
	});
	
})

app.listen(PORT);
console.log('Listening on port', PORT);
