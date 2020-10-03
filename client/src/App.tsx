import React, { ChangeEvent, FormEvent } from 'react';
import './App.scss';
import {Citem, createApiClient, Item, Order} from './api';

const ORDERS_PER_PAGE = 50;

export type AppState = {
	orders?: Order[],
	search: string;
	curPage: number;  // The current page in view
	found: number;  // The number of relevant orders (orders that founded by search)
	itemsDict : ItemsByOrder[];
	searchBy : string;
}

export type ItemsByOrder = {
	orderId : number,
	items : Item[]
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	

	state: AppState = {
		search: '',
		curPage: 1,
		found: 0,
		itemsDict : [],
		searchBy: 'OrderID'
	
	};


	handleChange = async( value: string, newPage?: number)=>{
		clearTimeout(this.searchDebounce);
		this.searchDebounce = setTimeout(async ()=>{
			this.setState({
				searchBy : value
			});
		}, 300);
	};


	handleTextChange = async (value : string, newPage?: number)=>{
		clearTimeout(this.searchDebounce);
		this.searchDebounce = setTimeout( async ()=>{
				this.setState({
					search : value
				});
		}, 500);
	};


	handleSubmit = async ( event: React.FormEvent<HTMLFormElement>, newPage? : number)=>{
		clearTimeout(this.searchDebounce);
		event.preventDefault();
		this.searchDebounce = setTimeout(async ()=>{
			this.setState({
				orders: await api.getOrders(this.state.searchBy, this.state.search),
			});
			if (this.state.orders){
				this.setState({found: this.state.orders.length});
				console.log(this.state.orders);
		}
	},300);
	};



	searchDebounce: any = null;

	async componentDidMount() {
		
		this.setState({
			orders: await api.getOrders(this.state.searchBy, this.state.search),
		});
		// update the number of relevant orders that was found
		if (this.state.orders){
			this.setState({
				found: this.state.orders.length,
					// itemsDict: this.getOrdersItems(this.state.orders)
		});
		}
	}



	// onSearch = async (value: string, newPage?: number) => {
	// 	clearTimeout(this.searchDebounce);

	// 	this.searchDebounce = setTimeout(async () => {
	// 		this.setState({
	// 			search: value
	// 		});

	// 		this.setState({
	// 			orders: await api.getOrders()
	// 		});
	// 		// if (this.state.orders){
	// 		// 	this.setState({found: this.state.orders.length})
	// 		// }
	// 	}, 300);
	// };



	render() {
		const {orders} = this.state;
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		return (
			<main>
				<h1>Orders</h1>
				<form onSubmit = {(e)=>this.handleSubmit(e)}>
					<label> Search By:</label>
					<select value={this.state.searchBy} onChange={(e)=>this.handleChange(e.target.value)}>
						<option className="custom-select" value="OrderID">Order ID </option>
						<option className="custom-select" value='CustomerName'>Customer Name</option>
						<option className="custom-select" value='ItemName'>Item Name</option>
						<option className="custom-select" value='FulfillmentStatus'>Fulfillment Status</option>
						<option className="custom-select" value='PaymentStatus'>Payment Status</option>
					</select>
					<label> Search:
						<input type ="text" placeholder="Search" onChange={(e)=>this.handleTextChange(e.target.value)}></input>
					</label>
					<input type="submit" name='searchValue' ref = 'input' value='Submit' />
				</form>
	
				 {/* <header>
						<input type="search" placeholder="Search" onChange={(e) => this.onSearch(e.target.value)}/>
					</header>
					<header>
						<input type="text" placeholder="Search" id ='search' required/>
					</header>
					<input type = 'submit' value = "Search"/>  */}
		
				{orders ? <div className='results'>Showing {this.state.found} results</div> : null}
				<div className = 'results'> Viewing Page: {this.state.curPage} / {(Math.ceil(this.state.found/ORDERS_PER_PAGE))} </div>
				{orders ? this.renderOrders(orders) : <h2>Loading...</h2>}

			</main>
		)
	}
	


	renderOrders = (orders: Order[]) => {



		// const filteredOrders = orders.filter((order) => 
		// (order.customer.name.toLowerCase() + order.id).includes(this.state.search.toLowerCase()) || this.checkOrdersByItem(this.state.search.toLowerCase(), order.id));

		// this.setState({found: filteredOrders.length});

		const idxOfLastOrder = this.state.curPage * ORDERS_PER_PAGE;
        const idxOfFirstOrder = idxOfLastOrder - ORDERS_PER_PAGE;
        const SlicedOrders = orders.slice(idxOfFirstOrder, idxOfLastOrder);
        const ordersPerPage = ORDERS_PER_PAGE;
        const totalorders = this.state.found;
        let pageNumbers: number[];
        pageNumbers = [];

        for (let i = 1; i <= Math.ceil(totalorders / ordersPerPage); i++) {
            pageNumbers.push(i);
        }
		
		
		return (
			<div className='orders'>
				{orders.map((order) => {
					return (
					<div key={order.id}>
						<div className={'orderCard'}>
							<div className={'generalData'}>
								<h6>{order.id}</h6>
								<h4>{order.customer.name}</h4>
								<h5>Order Placed: {new Date(order.createdDate).toLocaleDateString()}</h5>
							</div>
							<div className={'fulfillmentData'}>
								<h4>{order.itemQuantity} Items</h4>
								<img src={App.getAssetByStatus(order.fulfillmentStatus)} alt=""/>
								{order.fulfillmentStatus !== 'canceled' &&
									<a className = {"markAs"} onClick = {()=> this.ChangeStatusClick(order) }>Mark as {order.fulfillmentStatus === 'fulfilled' ? 'Not Delivered' : 'Delivered'}</a>
								}
							</div>
							<div className={'paymentData'}>
								<h4>{order.price.formattedTotalPrice}</h4>
								<img src={App.getAssetByStatus(order.billingInfo.status)}/>
							</div>
							<button type="button" className="collapsible" onClick={()=>this.showMore(document.getElementsByClassName("collapsible")[orders.indexOf(order)])}> More Info</button>
							<div className="content">
								{this.getItemsByOrder(order.id, itemsDict).map((item)=><div>{item}</div>)} 
								 <h5>{this.getItemsByOrder(order.id, itemsDict)[0]} </h5>
								<h5>{"Order Time: " + new Date(order.createdDate).toLocaleDateString() +" " +  new Date(order.createdDate).toLocaleTimeString()}</h5>
							</div>
						</div>
					</div>
				)})}
					<nav className = "center">
						<ul className='pagination'>{pageNumbers.map((number) =>
							(<li key={number} className='pageItem'>
								<a  onClick={() => this.paginate(number)} href={"!#"} className="page-link">
									{number}
								</a>
							</li>))}
						</ul>
					</nav>
			</div>
		)
	}
	
// 	SetsearchBy(by : string) {
// 		document.getElementById("myCheck").checked = true;
// }
// 		var checkBox = document.getElementById("myCheck");
// 		if (checkBox?.checked == true){
// 			this.setState({
// 				searchBy: by
// 			});
// 		}
// 	  }
	getOrdersItems (orders: Order[]){
		var itemsDict : ItemsByOrder[] = [];
		var OrderItems : Item[] = [];
		for(let i=0; i<orders.length; i++) {
			OrderItems = []
			orders[i].items.forEach(async element => {
				OrderItems.push(await api.getItem(element.id)) 
			});
			itemsDict.push({
				orderId : orders[i].id,
				items: OrderItems
			});
		}
		return itemsDict;
	}


	getItemsByOrder(orderID : number, ItemsDict : ItemsByOrder[]){
		const order = ItemsDict.find(e => e.orderId === orderID);
		return order? order.items : [] ;
	}

	checkOrdersByItem(itemName: string, orderid : number){
		var index = this.state.itemsDict.findIndex((itemsByorder)=>{
			return itemsByorder.orderId === orderid
		})
		var result = this.state.itemsDict[index].items.findIndex((item)=>{
			return item.name.toLowerCase === itemName.toLowerCase
		})
		return (result !+= -1);
	}


	

	//set image for each order's status
	static getAssetByStatus(status: string) {
		switch (status) {
			case 'fulfilled':
				return require('./assets/package.png');
			case 'not-fulfilled':
				return require('./assets/pending.png');
			case 'canceled':
				return require('./assets/cancel.png');
			case 'paid':
				return require('./assets/paid.png');
			case 'not-paid':
				return require('./assets/not-paid.png');
			case 'refunded':
				return require('./assets/refunded.png');
		}
	}
	// extend orderCard for more info
	showMore = async(collapsible : Element) =>{
		if (this.state.orders){
			collapsible.classList.toggle("active");
			var content = collapsible.nextElementSibling;
			if (content != null){
				if (content.style.maxHeight){
					content.style.maxHeight = null;
				} 
				else{
					content.style.maxHeight = content.scrollHeight + "px";
				}
			}
		}
	}



	//change the fulfillmentStatus of an order by clicking the "Mark as..." button
	ChangeStatusClick = async (order : Order) => {
		if (this.state.orders){
			let newOrders : Order[] = Array.from(this.state.orders);
			let orderIndex : number = newOrders.indexOf(order);
			newOrders[orderIndex].fulfillmentStatus = (newOrders[orderIndex].fulfillmentStatus === 'fulfilled') ? 'not-fulfilled' : 'fulfilled';
			this.setState({orders : newOrders});
		}
	};

	// * Update the current Page according to the page that pressed by user
	// * @param pageNum - The pressed page
	// */
   paginate = (pageNum: number) => {
	   this.setState({curPage: pageNum});
   };


}


export default App;

  
