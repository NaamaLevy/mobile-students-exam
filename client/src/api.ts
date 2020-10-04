import axios from 'axios';

export type Customer = {
	name: string;
}

export type BillingInfo = {
	status: string;
}

export type Price = {
	formattedTotalPrice: string;
}

export type Order = {
	id: number;
	createdDate: string;
	fulfillmentStatus: string;
	billingInfo: BillingInfo;
	customer: Customer;
	itemQuantity: number;
	price: Price;
	items : Citem[];
}

export type Citem = {
	id : string;
	quantity : number
}

export type Item = {
	id: string;
	name: string;
	price: number;
	image: string;
}

export type ApiClient = {
  getOrders: (searchby: string, search: string) => Promise<Order[]>;
  getItem: (itemId: string) => Promise<Item>;
  getProducts: () => Promise<any[]>;
  handleOrder : (agentID: string, orderId : string) => Promise<string>;
};

export const createApiClient = (): ApiClient => {
	return {
		getOrders: (searchby : string, search: string) => {
			return axios.get(`http://localhost:3232/api/orders`,
			{params: {searchBy : searchby, searchFor : search}}).then((res) => res.data);
		},
		getItem: (itemId: string) => {
			return axios.get(`http://localhost:3232/api/items/${itemId}`).then((res) => res.data);
		},
		getProducts: () => {
			return axios.get('http://localhost:3232/api/items/').then((res) => res.data);
		},

		handleOrder: (agentID: string, orderID : string)=>{
			return axios.get('http://localhost:3232/api/handleOrder',
			{params: {agentId : agentID , orderId : orderID}}).then((res)=> res.data);
		},
	}
};
