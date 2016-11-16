import React from 'react';
import Modal from '../utils/Modal';
import base from '../../base';
import $ from 'jquery';

class AddOrderForm extends React.Component{
  constructor() {
    super();
    this.renderProductsDropdown = this.renderProductsDropdown.bind(this);
    this.handleProductChange = this.handleProductChange.bind(this);
    this.updateOrderAmount = this.updateOrderAmount.bind(this);
    this.renderProductList = this.renderProductList.bind(this);
    this.removeProduct = this.removeProduct.bind(this);
    this.totalOrder = 0;
    this.orderProductList = {};

    this.state = {
      orderProductList: {}
    }
  }
  createOrder(e){
      e.preventDefault();
      const order = {
          clientName: this.clientName.value,
          clientPhone: this.clientPhone.value,
          deliveryDate: this.deliveryDate.value,
          deliveryHour: this.deliveryHour.value,
          shippingAddress: this.shippingAddress.value,
          shippingPrice: this.shippingPrice.value,
          shippingInCharge: this.shippingInCharge.value,
          status: this.status.value,
          total: this.total.value,
          payment1: this.payment1.value,
          payment1Type: this.payment1Type.value,
          payment2: this.payment2.value,
          payment2Type: this.payment2Type.value,
          balance: this.balance.value,
          description: this.description.value,
          products: this.orderProductList
      }

      const ordersRef = base.database().ref('orders');
      const timestamp = Date.now();
      ordersRef.child(`order-${timestamp}`).set({order});

      // Clear form inputs after submission
      this.orderForm.reset();
  }
  updateAmounts(e){
    let total = parseInt(document.getElementById('total').value, 10),
      payment1 = (parseInt(document.getElementById('payment1').value, 10) || 0),
      payment2  = (parseInt(document.getElementById('payment2').value, 10) || 0),
      balance = total - (payment1 + payment2),
      percentage = ((payment1 + payment2) * 100) / total,
      tagClass = '';

    if(!isNaN(balance)){
      if(percentage >= 0 && percentage <= 24){
        tagClass= 'tag-danger';
      }
      else if(percentage >= 25 && percentage <= 49){
        tagClass= 'tag-warning';
      }
      else if(percentage >= 50 && percentage <= 75){
        tagClass= 'tag-info';
      }
      else{
        tagClass= 'tag-success';
      }
      $('.balance').val(balance).text(balance);
      $('span.balance').removeClass('tag-danger tag-warning tag-info tag-success').addClass(tagClass);
    }
  }
  removeProduct(e, key){
    const orderProductList = {...this.state.orderProductList};
    delete orderProductList[key];
    if($.isEmptyObject(orderProductList)){
      $('.table-striped').hide();
      $('#product').val('');
      this.orderProductList = [];
    }
    this.setState({orderProductList});
  }
  updateOrderAmount(e, price, key){

    const orderProductList = this.state.orderProductList;
    orderProductList[key].units = e.target.value || 1;
    orderProductList[key].total = (parseInt(e.target.value || 1, 10)) * (parseInt(orderProductList[key].price, 10));

    // update state
    this.setState({orderProductList});

    this.totalOrder = 0;
    const that = this;

    var orderProductListIds = Object.keys(orderProductList) || [];
    orderProductListIds.map(function(item){
      that.totalOrder += orderProductList[item].total;
    });
    $('.total').val(that.totalOrder).text(that.totalOrder);
    // $('.order-product input.unit').filter(function() { 
    //   if($(this).val() != ""){
    //     that.totalOrder += (parseInt($(this).val(), 10)) * (parseInt($(this).data('price'), 10));
    //   }
    // });
    var balance = parseInt(document.getElementById('total').value, 10) - ((parseInt(document.getElementById('payment1').value, 10) || 0) + (parseInt(document.getElementById('payment2').value, 10) || 0));
    $('.balance').val(balance).text(balance);
  }
  renderProductList(key){
    const product = this.state.orderProductList[key];
    if(product){
      $('.table-striped').show();
      return(
        <tr key={key} className="order-product">
          <th scope="row">
            <input className="form-control unit" type="text" placeholder="Units" id="units" name="units" data-price={product.price} defaultValue={product.units} onChange={(e) => this.updateOrderAmount(e,product.price, key)}/>
          </th>
          <td>{product.name}</td>
          <td>{product.price}</td>
          <td>{product.total}</td>
          <td><textarea className="form-control" type="text" placeholder="Production description" id="desc" name="desc"></textarea></td>
          <td><textarea className="form-control" type="text" placeholder="Tape color" id="tape" name="tape"></textarea></td>
          <td><textarea className="form-control" type="text" placeholder="paper color" id="paper" name="paper"></textarea></td>
          <td>
            <button type="button" className="close" aria-label="Close" data-toggle="modal" data-target=".bd-example-modal-sm" onClick={(e) => this.removeProduct(e, key)}>
              <span aria-hidden="true">&times;</span>
            </button>
          </td>
        </tr>
      )
    }
  }
  handleProductChange(e){
    if(e.target.value){
      // console.log(e.target.value);
      const productsRef = base.database().ref('products').child(e.target.value);
      productsRef.on('value', (snapshot) => {
        const data = snapshot.val() || {};

        const temp = {
          id: e.target.value,
          name: data.product.name,
          price: data.product.price,
          units: 1,
          tapeColor: '',
          paperColor: '',
          desc: '',
          total: data.product.price * 1
        }
        this.orderProductList[e.target.value] = temp;
        
        this.setState({orderProductList:this.orderProductList});

        // $('#order-product-list').append();
        // $('#total').val(this.totalOrder);
      });
    }
  }
  renderProductsDropdown(key){
    const product = this.props.products[key].product;

    if(parseInt(product.status, 10) === 1){
      return(
        <option key={key} value={key}>{product.name}</option>
      )
    }
  }
  render(){
    const productIds = Object.keys(this.props.products) || [];
    const orderProductListIds = Object.keys(this.state.orderProductList) || [];
    console.log(this.state.orderProductList);
    return (
      <form ref={(input) => this.orderForm = input} className="order-edit" onSubmit={(e) => this.createOrder(e)}>
        <div className="form-group row">
          
          <div className="col-sm-6">
            <label htmlFor="name" className="col-xs-12 col-form-label">Name</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.clientName = input} type="text" placeholder="Name" id="name" name="name" />
            </div>
          </div>
          <div className="col-sm-6">
            <label htmlFor="phone" className="col-xs-12 col-form-label">Phone</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.clientPhone = input} type="tel" placeholder="88387675" id="phone" name="phone" />
            </div>
          </div>
        </div>
        
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="date" className="col-xs-12 col-form-label">Delivery Date</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.deliveryDate = input} type="date" id="date" name="date" />
            </div>
          </div>
          <div className="col-sm-6">
            <label htmlFor="hour" className="col-xs-12 col-form-label">Delivery Hour</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.deliveryHour = input} type="time" placeholder="Hour" id="hour" name="hour" />
            </div>
          </div>
        </div>
        
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="shipping-address" className="col-xs-12 col-form-label">Shipping Address</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.shippingAddress = input} type="text" placeholder="Address" id="shipping-address" name="shipping-address"/>
            </div>
          </div>
          <div className="col-sm-6">
            <label htmlFor="shipping-price" className="col-xs-12 col-form-label">Shipping Price</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.shippingPrice = input} type="number" placeholder="Price" id="shipping-price" name="shipping-price" />
            </div>
          </div>
        </div>
        
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="shipping-in-charge" className="col-xs-12 col-form-label">Shipping in charge</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.shippingInCharge = input} type="text" placeholder="Name" id="shipping-in-charge" name="shipping-in-charge" />
            </div>
          </div>
          <div className="col-sm-6">
              <label htmlFor="status" className="col-xs-12 col-form-label">Status</label>
              <div className="col-xs-12">
                  <select className="form-control" ref={(input) => this.status = input} id="status" name="status"  >
                      <option value="1">Confirm</option>
                      <option value="0">Not confirm</option>
                  </select>
              </div>
          </div>
        </div>
        
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="product" className="col-xs-12 col-form-label">Product</label>
            <div className="col-xs-12">
                <select className="form-control" ref={(input) => this.product = input} id="product" name="product" onChange={(e) => this.handleProductChange(e)} >
                  <option value="">Select Product</option>
                  {productIds.map(this.renderProductsDropdown)}
                </select>
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Units</th>
              <th>Product</th>
              <th>Price</th>
              <th>Total</th>
              <th>Description</th>
              <th>Tape Color</th>
              <th>Paper Color</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderProductListIds.map(this.renderProductList)}
          </tbody>
        </table>
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="total" className="col-xs-12 col-form-label invisible">Total</label>
            <div className="col-xs-12">
              <input className="form-control total" ref={(input) => this.total = input} type="hidden" placeholder="Total" id="total" name="total" readOnly />
              <h1>Total <span className="tag tag-info total">0</span></h1>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-xs-6">
            <label htmlFor="payment1" className="col-xs-12 col-form-label">Payment #1</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.payment1 = input} type="number" placeholder="Amount" id="payment1" name="payment1" onChange={(e) => this.updateAmounts(e)}/>
            </div>
          </div>
          <div className="col-xs-6">
            <label htmlFor="payment1Type" className="col-xs-12 col-form-label">Payment Type</label>
            <div className="col-xs-12">
                <select className="form-control" ref={(input) => this.payment1Type = input} id="payment1Type" name="payment1Type"  >
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer</option>
                </select>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-xs-6">
            <label htmlFor="payment2" className="col-xs-12 col-form-label">Payment #2</label>
            <div className="col-xs-12">
              <input className="form-control" ref={(input) => this.payment2 = input} type="number" placeholder="Amount" id="payment2" name="payment2" onChange={(e) => this.updateAmounts(e)}/>
            </div>
          </div>
          <div className="col-xs-6">
            <label htmlFor="payment2Type" className="col-xs-12 col-form-label">Payment Type</label>
            <div className="col-xs-12">
                <select className="form-control" ref={(input) => this.payment2Type = input} id="payment2Type" name="payment2Type"  >
                    <option value="Chash">Cash</option>
                    <option value="Transfer">Transfer</option>
                </select>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="balance" className="col-xs-12 col-form-label invisible">Balance</label>
            <div className="col-xs-12">
              <input className="form-control balance" ref={(input) => this.balance = input} type="hidden" placeholder="Amount" id="balance" name="balance" readOnly />
              <h1>Balance <span className="tag tag-danger balance">0</span></h1>
            </div>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-8">
            <label htmlFor="description" className="col-xs-12 col-form-label">Description</label>
            <div className="col-xs-12">
              <textarea className="form-control" ref={(input) => this.description = input} type="text" placeholder="Description" id="description" name="description"></textarea>
            </div>
          </div>
        </div>
        <button id="add-order" type="submit" className="btn btn-primary" disabled>Add Order</button>
      </form>
    )
  }
}

AddOrderForm.propTypes = {
  // addOrder: React.PropTypes.func.isRequired
}

export default AddOrderForm;