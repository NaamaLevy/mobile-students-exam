import React from 'react';
import './App.scss';
import {Citem, createApiClient, Item, Order} from './api';

const ORDERS_PER_PAGE = 50;

export type AppState = {
	orders?: Order[],
	search: string;
	curPage: number;  // The current page in view
	found: number;  // The number of relevant orders (orders that founded by search)
	searchBy : string;
	isShowMoreOpen: boolean;
	products?: {[index: string] : any},
}



export type ItemsByOrder = {
	orderId : number,
	items : Item[]
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  [x: string]: any;
  state: AppState = {
    search: "",
    curPage: 1,
    found: 0,
    searchBy: "OrderID",
	isShowMoreOpen: false,
  };

//Agent click for handle Order
  handleClick = (orderId : string)=> {
   clearTimeout(this.searchDebounce);
   this.searchDebounce = setTimeout(async () => {
		if(document.querySelector('.checkbox:checked') !== null){
			api.handleOrder('myAgentId', orderId);
		}
		else{
			api.handleOrder(" ", orderId)};
   }, 300);
 };

//Agent choose value to search by (category)
  handleChange = async (value: string, newPage?: number) => {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(async () => {

      this.setState({
        searchBy: value,
      });
    }, 300);
  };
//Agent input to search for
  handleTextChange = async (value: string, newPage?: number) => {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(async () => {
      this.setState({
        search: value,
      });
    }, 500);
  };
//call the server upon submit - search query
  handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    newPage?: number
  ) => {
    clearTimeout(this.searchDebounce);
    event.preventDefault();
    this.searchDebounce = setTimeout(async () => {
		if (this.state.searchBy === 'ItemName'){
			var idArray = this.getiDByName(this.state.search)!;
			idArray.forEach(element => {
				this.filterByItem(element);
			});
		}
      this.setState({
        orders: await api.getOrders(this.state.searchBy, this.state.search),
      });
      if (this.state.orders) {
        this.setState({ found: this.state.orders.length });
      }
    }, 300);
  };

  searchDebounce: any = null;

  async componentDidMount() {
    this.setState({
      orders: await api.getOrders(this.state.searchBy, this.state.search),
      products: await api.getProducts(),
    });
    // update the number of relevant orders that was found
    if (this.state.orders) {
      this.setState({
        found: this.state.orders.length,
      });
    }
  }


  render() {
    const { orders } = this.state;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    return (
      <main>
        <h1>Orders</h1>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <label> Search By:</label>
          <select
            value={this.state.searchBy}
            onChange={(e) => this.handleChange(e.target.value)}
          >
            <option className="custom-select" value="OrderID">
              Order ID{" "}
            </option>
            <option className="custom-select" value="CustomerName">
              Customer Name
            </option>
            <option className="custom-select" value="ItemName">
              Item Name
            </option>
            <option className="custom-select" value="FulfillmentStatus">
              Fulfillment Status
            </option>
            <option className="custom-select" value="PaymentStatus">
              Payment Status
            </option>
          </select>
          <label>
            {" "}
            Search:
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => this.handleTextChange(e.target.value)}
            ></input>
          </label>
          <input type="submit" name="searchValue" ref="input" value="Submit" />
        </form>

        {orders ? (
          <div className="results">Showing {this.state.found} results</div>
        ) : null}
        <div className="results">
          {" "}
          Viewing Page: {this.state.curPage} /{" "}
          {Math.ceil(this.state.found / ORDERS_PER_PAGE)}{" "}
        </div>
        {orders ? this.renderOrders(orders) : <h2>Loading...</h2>}
      </main>
    );
  }

  renderOrders = (orders: Order[]) => {


    const ordersPerPage = ORDERS_PER_PAGE;
    const totalorders = this.state.found;
    let pageNumbers: number[];
    pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalorders / ordersPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="orders">
			{orders.map((order) => {
			return (
			<div key={order.id}>
				<div className={"orderCard"}>
					<div className={"generalData"}>
						<h5>{order.id}</h5>
						<h4>{order.customer.name}</h4>
						<h4>Order Placed:{" "} {new Date(order.createdDate).toLocaleDateString()}</h4>
						<label className="markAs">Handle Order
						<input type='checkbox' id = "handle" onClick={() => this.handleClick(order.id.toString())}></input>
					</label>
					</div>
					<div className={"fulfillmentData"}>
						<h4>{order.itemQuantity} Items</h4>
						<img src={App.getAssetByStatus(order.fulfillmentStatus)} alt=""/>
						{order.fulfillmentStatus !== "canceled" &&
						(<a className={"markAs"} onClick={() => this.ChangeStatusClick(order)}> Mark as{" "}
						{order.fulfillmentStatus === "fulfilled" ? "Not Delivered" : "Delivered"} </a>
						)}
					</div>
					<div className={"paymentData"}>
						<h4>{order.price.formattedTotalPrice}</h4>
						<img src={App.getAssetByStatus(order.billingInfo.status)} alt="" />
					</div>
					<button type="button" className="collapsible" onClick={() =>
						this.showMore(document.getElementsByClassName("collapsible")[orders.indexOf(order)])}>More Info
					</button>
						<div className="content">
							<div className = "ordertime">
								{"Order Time: " + new Date(order.createdDate).toLocaleDateString() + " " + new Date(order.createdDate).toLocaleTimeString()}
							</div>
							<div className="items"> Items: {}</div>
							{order.items.map((item) =>(
								<div key = {item.id} className = "item">
									{ this.showProduct(item.id).name + " : " +  item.quantity+ " items"}
								</div>
							))}
							<div className = "itemImage" ><img src={this.findMostExpensive(order.items)} alt=""/> </div>
						</div>
				</div>
			</div>
			)
			})};

			<nav className="center">
				<ul className="pagination"> {pageNumbers.map((number) => (
					<li key={number} className="pageItem">
						<a onClick={() => this.paginate(number)} href={"!#"} className="page-link">{number}</a>
					</li>
				))}
				</ul>
			</nav>
		</div>
	);
	
}

 

	//find product by id
  showProduct = (index: string) => {
	if (this.state.products && this.state.orders && this.state.products[index]) {
		var product = this.state.products[index];
		return (product);
    }
  };
  //find products by name
  getiDByName = (name : string)=>{
	if (this.state.products && this.state.orders ){
		var result: string[] = [];
		for (var i in this.state.products){
			if(this.state.products[i].name.toLowerCase().includes(name.toLocaleLowerCase()))
			result.push(i.toString());
		}
		return(result)
	}

  };
  //find the most expensive item in order's items
  findMostExpensive = (items : Citem[])=>{
	if (this.state.products && this.state.orders){
		var chosen = this.showProduct(items[0].id);
		var price = 0;
		items.forEach(element => {
			let curr = this.showProduct(element.id);
			if (curr.price > price){
				chosen = curr;
				price = chosen.price; 
			}
		});
		console.log(chosen.images[3])
		return chosen.images['medium'];
	}
  }

// set results in orders for searching orderds by item's name
  filterByItem (id : string){
	  	if(this.state.orders){

			let newOrders: Order[] = Array.from(this.state.orders);
			newOrders.filter((order)=>{
				 (this.checkItems(order.items, id))
			});
			console.log(newOrders);
			this.setState({orders : newOrders});
		}
	}
	

//check if item id matchs an items' order list
  checkItems(items : Citem[], id : string){
	  var check = false;
	items.forEach(element =>{
		if (element.id ===id){
			check = true;
			return (check);
		}
	});
	return check;
  	}
  //get jpg to show for each order status
  static getAssetByStatus(status: string) {
    switch (status) {
      case "fulfilled":
        return require("./assets/package.png");
      case "not-fulfilled":
        return require("./assets/pending.png");
      case "canceled":
        return require("./assets/cancel.png");
      case "paid":
        return require("./assets/paid.png");
      case "not-paid":
        return require("./assets/not-paid.png");
      case "refunded":
        return require("./assets/refunded.png");
    }
  }
  // extend orderCard for more info
  showMore = async (collapsible: Element) => {
    if (this.state.orders) {
      collapsible.classList.toggle("active");
      var content: HTMLElement = collapsible.nextElementSibling as HTMLElement;
      if (content != null) {
        if (content.style.maxHeight) {
          content.style.maxHeight = "";
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      }
    }
  };

  //change the fulfillmentStatus of an order by clicking the "Mark as..." button
  ChangeStatusClick = async (order: Order) => {
    if (this.state.orders) {
      let newOrders: Order[] = Array.from(this.state.orders);
      let orderIndex: number = newOrders.indexOf(order);
      newOrders[orderIndex].fulfillmentStatus =
        newOrders[orderIndex].fulfillmentStatus === "fulfilled"
          ? "not-fulfilled"
          : "fulfilled";
      this.setState({ orders: newOrders });
    }
  };

  //update the current Page according to the page that pressed by user
  paginate = (pageNum: number) => {
    this.setState({ curPage: pageNum });
  };
}


export default App;

  
