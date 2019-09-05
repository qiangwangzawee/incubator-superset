/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { requestSolarData } from '../actions/solarActions';

const propTypes = {
  address: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  solarBI: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  requestSolarData: PropTypes.func.isRequired,
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      main: '#0063B0',
    },
    secondary: {
      main: '#DBD800',
    },
  },
});


const styles = tm => ({
  border: {
    border: '1px solid #0063B0',
    borderRadius: 12,
    margin: 40,
  },
  button: {
    // fontSize: '1.2em',
    // width: '18%',
    margin: '10 10',
    height: 40,
    padding: '0 16px',
    minWidth: 115,
    borderRadius: 60,
    color: '#0063B0',
    backgroundColor: '#DAD800',
    border: 'none',
    fontSize: 16,
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    '&:hover': {
      color: '#F77E0B',
      backgroundColor: '#c4c102',
    },
  },
  closeBtn: {
    marginRight: 40,
  },
  dates: {
    display: 'flex',
  },
  dateLabel: {
    color: '#0063B0',
    display: 'block',
    marginBottom: 5,
  },
  dateWrapper: {
    width: 220,
    textAlign: 'center',
  },
  dialog: {
    borderRadius: 12,
    maxWidth: 750,
    padding: 10,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    marginLeft: 250,
  },
  endText: {
    marginLeft: '15px',
    '& fieldset': {
      borderRadius: 12,
    },
  },
  lengthLabel: {
    fontSize: '1.6rem',
    color: '#0063B0',
    width: '10%',
    float: 'left',
    borderBottom: 'none',
    marginLeft: '15px',
    marginRight: '30px',
    marginTop: '45px',
  },
  formControl: {
    marginBottom: '5px',
    width: '90%',
    display: 'inline-block',
    margin: theme.spacing.unit * 2,
  },
  formControlLabel: {
    fontSize: '1.5rem',
    color: '#0063B0',
    fontFamily: 'Montserrat',
    fontWeight: 500,
  },
  head: {
    textAlign: 'center',
    height: 50,
    background: 'linear-gradient(.25turn, #10998C, #09809D, #0063B0)',
    backgroundColor: 'white',
    marginTop: -10,
    marginLeft: -10,
    width: 760,
    color: 'white',
    paddingTop: 15,
  },
  labelFocused: {
    color: '#0063B0 !important',
  },
  loading: {
    width: 60,
    margin: 0,
    marginRight: '10px',
  },
  resolutionLabel: {
    fontSize: '1.6rem',
    color: '#0063B0',
    width: '10%',
    float: 'left',
    borderBottom: 'none',
    marginTop: '35px',
    marginRight: '45px',
  },
  startText: {
    marginLeft: '10px',
    '& fieldset': {
      borderRadius: 12,
    },
  },
  title: {
    color: '#0063B0',
    fontSize: '1.6em',
    textAlign: 'center',
    marginBottom: 30,
  },
  textLabel: {
    fontSize: '16px',
  },
  textInput: {
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontWeight: 500,
    backgroundColor: '#EEEFF0',
    borderRadius: 12,
    lineHeight: '18px',
  },
  typeGroup: {
    flexDirection: 'row',
    width: '70%',
    float: 'left',
  },
  typeLabel: {
    fontSize: '1.6rem',
    color: '#0063B0',
    width: '10%',
    float: 'left',
    borderBottom: 'none',
    marginTop: '35px',
    marginRight: '45px',
  },
  resolutionGroup: {
    flexDirection: 'row',
    width: '80%',
    float: 'left',
  },
  notUse: {
    margin: tm.spacing.unit,
  },
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class ExportModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      type: 'dni',
      startDate: '2017-01-01',
      endDate: '2018-01-01',
      resolution: 'hourly',
    };

    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleResolutionChange = this.handleResolutionChange.bind(this);
    this.handleRequestData = this.handleRequestData.bind(this);
  }

  handleTypeChange(event) {
    this.setState({ type: event.target.value });
  }

  handleStartDateChange(event) {
    this.setState({ startDate: event.target.value });
  }

  handleEndDateChange(event) {
    this.setState({ endDate: event.target.value });
  }

  handleResolutionChange(event) {
    this.setState({ resolution: event.target.value });
  }

  handleRequestData() {
    const sDate = new Date(this.state.startDate);
    const eDate = new Date(this.state.endDate);
    if (sDate > eDate) {
      alert('Start date cannot be later than end date!'); // eslint-disable-line no-alert
    } else {
      const queryData = {
        lat: this.props.solarBI.queryResponse.data.lat + '',
        lng: this.props.solarBI.queryResponse.data.lng + '',
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        type: this.state.type,
        resolution: this.state.resolution,
      };
      this.props.onHide();
      this.props.requestSolarData(queryData);
    }
  }

  render() {
    const { classes, open, onHide, solarBI } = this.props;
    const { startDate, endDate } = this.state;

    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <Dialog
            classes={{ paper: classes.dialog }}
            fullWidth
            open={open || solarBI.sending}
            onClose={onHide}
            TransitionComponent={Transition}
            keepMounted
          >
            <div className={classes.head}>{this.props.address.slice(0, -11)}</div>
            <div className={classes.border}>
              <DialogTitle
                disableTypography
                className={classes.title}
                id="form-dialog-title"
              >
                Options
              </DialogTitle>
              <DialogContent>
                <FormLabel classes={{ root: classes.lengthLabel, focused: classes.labelFocused }} component="legend">Length</FormLabel>
                <div className={classes.dates}>
                  <div className={classes.dateWrapper}>
                    <span className={classes.dateLabel}>Start</span>
                    <TextField
                      error={new Date(startDate) > new Date(endDate)}
                      id="date"
                      type="date"
                      value={startDate}
                      placeholder="yyyy-mm-dd"
                      variant="outlined"
                      onChange={this.handleStartDateChange}
                      className={classes.startText}
                      InputProps={{
                        classes: { input: classes.textInput },
                      }}
                    // InputLabelProps={{
                    //   FormLabelClasses: {
                    //     root: classes.textLabel,
                    //   },
                    // }}
                    />
                  </div>

                  <div className={classes.dateWrapper}>
                    <span className={classes.dateLabel}>End</span>
                    <TextField
                      error={new Date(startDate) > new Date(endDate)}
                      id="date"
                      type="date"
                      value={endDate}
                      placeholder="yyyy-mm-dd"
                      variant="outlined"
                      onChange={this.handleEndDateChange}
                      className={classes.endText}
                      InputProps={{
                        classes: { input: classes.textInput },
                      }}
                    // InputLabelProps={{
                    //   FormLabelClasses: {
                    //     root: classes.textLabel,
                    //   },
                    // }}
                    />
                  </div>
                </div>
                <FormControl component="fieldset" className={classes.formControl}>
                  <FormLabel classes={{ root: classes.typeLabel, focused: classes.labelFocused }} component="legend">Type</FormLabel>
                  <RadioGroup
                    aria-label="type"
                    name="type"
                    className={classes.typeGroup}
                    value={this.state.type}
                    onChange={this.handleTypeChange}
                  >
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="dni" control={<Radio color="secondary" />} label="DNI" labelPlacement="bottom" />
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="ghi" control={<Radio color="secondary" />} label="GHI" labelPlacement="bottom" />
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="both" control={<Radio color="secondary" />} label="Download both" labelPlacement="bottom" />
                  </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" className={classes.formControl}>
                  <FormLabel classes={{ root: classes.resolutionLabel, focused: classes.labelFocused }} component="legend">Resolution</FormLabel>
                  <RadioGroup
                    aria-label="resolution"
                    name="resolution"
                    className={classes.resolutionGroup}
                    value={this.state.resolution}
                    onChange={this.handleResolutionChange}
                  >
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="hourly" control={<Radio color="secondary" />} label="Hourly" labelPlacement="bottom" />
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="daily" control={<Radio color="secondary" />} label="Daily" labelPlacement="bottom" />
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="weekly" control={<Radio color="secondary" />} label="Weekly" labelPlacement="bottom" />
                    <FormControlLabel classes={{ label: classes.formControlLabel }} value="monthly" control={<Radio color="secondary" />} label="Monthly" labelPlacement="bottom" />
                  </RadioGroup>
                </FormControl>
              </DialogContent>
            </div>
            <DialogActions>
              {solarBI.sending ?
                (<img className={classes.loading} alt="Loading..." src="/static/assets/images/loading.gif" />) :
                (<Button className={classes.button} onClick={this.handleRequestData} color="primary">Request</Button>)
              }

              <Button
                className={classNames(classes.button, classes.closeBtn)}
                disabled={solarBI.sending}
                onClick={onHide}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

ExportModal.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI,
});

export default withStyles(styles)(
  connect(
    mapStateToProps,
    { requestSolarData },
  )(ExportModal),
);
