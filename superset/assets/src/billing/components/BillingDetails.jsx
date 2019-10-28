/* eslint-disable camelcase */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StripeProvider, Elements } from 'react-stripe-elements';
import ChangeAddress from './ChangeAddress';
import ChangeCreditCard from './ChangeCreditCard';
import { changeBillDetail, changeCreditCard } from '../actions/billingActions';
// import TeamCreditCard from './TeamCreditCard';

function BillingDetails({ billing, changeBillDetailConnect, changeCreditCardConnect }) {
  const { cus_name, cus_email, cus_address } = billing.cus_info;
  let country = '';
  let city = '';
  let line1 = '';
  let line2 = '';
  let state = '';
  let postal_code = '';
  if (cus_address != null) {
    const cus_city = cus_address.city;
    const cus_country = cus_address.country;
    const cus_line1 = cus_address.line1;
    const cus_line2 = cus_address.line2;
    const cus_postal_code = cus_address.postal_code;
    const cus_state = cus_address.state;
    country = cus_country; city = cus_city; line1 = cus_line1; line2 = cus_line2;
    state = cus_state; postal_code = cus_postal_code;
  }
  const [changeAddressOpen, setChangeAddressOpen] = useState(false);
  const [billingValues, setBillingValues] = useState({
    name: cus_name,
    email: cus_email,
    country,
    line1,
    city,
    line2,
    state,
    postal_code,
  });
  const [nameError, setNameError] = useState(false);
  const [emailEmptyError, setEmailEmptyError] = useState(false);
  const [emailInvalidError, setEmailInvalidError] = useState(false);
  const [openCCC, setOpenCCC] = useState(false);

  const handleChange = name => (event) => {
    setBillingValues({ ...billingValues, [name]: event.target.value });
  };

  const handleChangeAddressOpen = () => {
    setChangeAddressOpen(true);
  };

  const handleChangeAddressClose = () => {
    setChangeAddressOpen(false);
  };

  const handleCloseCCC = () => {
    setOpenCCC(false);
  };

  const handleOpenCCC = () => {
    setOpenCCC(true);
  };

  const validateEmail = (email) => {
    // eslint-disable-next-line no-useless-escape
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleUpdateSubmit = () => {
    setNameError(false);
    setEmailEmptyError(false);
    setEmailInvalidError(false);
    if (billingValues.name === '') {
      setNameError(true);
    }
    if (billingValues.email === '') {
      setEmailEmptyError(true);
    } else if (!validateEmail(billingValues.email)) {
      setEmailInvalidError(true);
    }
    if (billingValues.name !== '' && billingValues.email !== '' && validateEmail(billingValues.email)) {
      changeBillDetailConnect(billing.cus_id, billingValues);
    }
  };

  return (
    <React.Fragment>
      <div className="tab-pane active" id="billing">
        {/* <TeamCreditCard /> */}
        <div className="panel panel-primary">
          <div className="panel-heading">Billing Details</div>
          <div className="panel-body">
            <p>Please let us know how you’d like your invoices to be addressed.</p>
            <div>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" className="form-control billing-details" value={billingValues.name} onChange={handleChange('name')} />
                {nameError ? <p className="invalid-message">* Name cannot be empty</p> : null}
              </div>
              <div className="form-group">
                <label htmlFor="email">Billing email</label>
                <input type="email" id="email" className="form-control billing-details" value={billingValues.email} onChange={handleChange('email')} />
                {emailEmptyError ? <p className="invalid-message">* Email cannot be empty</p> : null}
                {emailInvalidError ? <p className="invalid-message">* Email is invalid</p> : null}
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <div
                  onClick={handleChangeAddressOpen}
                  id="billing-address"
                  className="form-control billing-details"
                >
                  {billingValues.line1}<br />
                  {billingValues.line2 !== '' ? <p style={{ margin: 0 }}>{billingValues.line2}</p> : null}
                  {billingValues.city === '' ? '' : billingValues.city + ','} {billingValues.state} {billingValues.postal_code}<br />
                  {billingValues.country}
                </div>
                <p style={{ marginTop: 10, fontSize: 13 }}>
                  * Everytime you update your billing details,
                  remember to click the Update details button below to effect.
                </p>
              </div>
            </div>
          </div>
          <div className="panel-footer">
            {billing.detail_change === 'changing' ?
              <img style={{ width: 50, margin: 0 }} alt="Loading..." src="/static/assets/images/loading.gif" /> :
              <button className="update-details-btn" onClick={handleUpdateSubmit}>Update details</button>
            }
          </div>
        </div>

        {billing.card_expire_soon ? (
          <div className="alert alert-warning cc-expire-warning" role="alert">
            <i className="fas fa-exclamation-circle" />&nbsp;&nbsp;
            Looks like your credit card is about expiring, Please update it now.
            <button type="button" className="btn update-cc-btn" onClick={handleOpenCCC}>Update</button>
          </div>
        ) : null}
        {billing.card_has_expired ? (
          <div className="alert alert-danger cc-expire-warning" role="alert">
            <i className="fas fa-exclamation-circle" />&nbsp;&nbsp;
            Your credit card has expired. Please update it now.
            <button type="button" className="btn update-cc-btn" onClick={handleOpenCCC}>Update</button>
          </div>
        ) : null}

        <div className="panel panel-primary">
          <div className="panel-heading">Users</div>
          <div className="panel-body billing-users">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>INVOICE #</th>
                  <th>UTC DATE</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {billing.invoice_list.map(item => (
                  <tr key={item.invoice_id}>
                    <td>{item.invoice_id}</td>
                    <td>{item.date}</td>
                    <td>
                      {item.link !== null ?
                        <a href={item.link}>
                          <i style={{ color: '#024067' }} className="fas fa-cloud-download-alt" />
                        </a> : 'Scheduled'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ChangeAddress
        open={changeAddressOpen}
        handleChangeAddressClose={handleChangeAddressClose}
        billingValues={billingValues}
        setBillingValues={setBillingValues}
        handleChange={handleChange}
      />

      <StripeProvider apiKey="pk_test_2CT1LvA7viLp1j7yCHJ2MezU00xXxxnRdM">
        <Elements>
          <ChangeCreditCard
            openCCC={openCCC}
            handleCloseCCC={handleCloseCCC}
            changeCreditCard={changeCreditCardConnect}
            billing={billing}
          />
        </Elements>
      </StripeProvider>
    </React.Fragment>
  );
}

BillingDetails.propTypes = {
  billing: PropTypes.object.isRequired,
  changeBillDetailConnect: PropTypes.func.isRequired,
  changeCreditCardConnect: PropTypes.func.isRequired,
};

function mapStateToProps({ billing }) {
  return {
    billing,
  };
}

export default connect(
  mapStateToProps,
  { changeBillDetailConnect: changeBillDetail, changeCreditCardConnect: changeCreditCard },
)(BillingDetails);

