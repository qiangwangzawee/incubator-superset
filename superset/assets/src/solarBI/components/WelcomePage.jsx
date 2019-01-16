import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Grid, Row, Col, Alert } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Loading from "./Loading";
import classNames from "classnames";
import withWidth from "@material-ui/core/withWidth";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#489795"
    }
  }
});

const styles = theme => ({
  root: {
    marginTop: -19
  },
  title: {
    backgroundImage: `url("/static/assets/images/welcome_background.png")`,
    height: 350
  },
  topLine1: {
    height: 2,
    position: "fixed",
    width: "100%",
    top: 0,
    backgroundImage: `linear-gradient(to right, #FAD961, #00736A, #FAD961)`
  },
  topLine2: {
    height: 2,
    backgroundImage: `linear-gradient(to right, #FAD961, #00736A, #FAD961)`
  },
  head: {
    textAlign: "center",
    paddingTop: 60,
    fontSize: "4rem",
    fontWeight: 400
  },
  subtitle: {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: 300,
    lineHeight: 2
  },
  button: {
    margin: theme.spacing.unit,
    fontSize: 17,
    height: 50
  },
  solarAssets: {
    display: "flex",
    alignItems: "center",
    width: 900,
    margin: "auto",
    padding: 20
  },
  row: {
    display: "table",
    marginLeft: 100,
    width: 400
  },
  col: {
    display: "table-cell",
    verticalAlign: "middle"
  },
  number: {
    fontSize: "4em"
  },
  step: {
    fontSize: "1.5em"
  },
  explain: {
    fontSize: "1.1em"
  },
  solarMap: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: 1200
  }
});

class WelcomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.handleClickGo = this.handleClickGo.bind(this);
  }

  handleClickGo() {
    window.location = "/solar/add";
  }

  render() {
    const { width } = this.props;
    const { classes } = this.props;
    const isSmallScreen = /xs|sm|md/.test(width);
    const buttonProps = {
      size: isSmallScreen ? "medium" : "large"
    };

    return (
      <div className={classes.root}>
        <div className={classes.topLine1} />
        <div className={classes.topLine2} />
        <div className={classes.title}>
          <p className={classes.head}>SolarBI</p>
          <p className={classes.subtitle}>
            Welcome to SolarBI, let's start by finding the solar irradiation on
            your project's location
          </p>
          <div style={{ textAlign: "center" }}>
            <Button
              className={classes.button}
              variant="contained"
              size="large"
              onClick={this.handleClickGo}
            >
              let's go
            </Button>
          </div>
        </div>

        <div style={{ backgroundColor: "white" }}>
          <p className={classes.head}>How SolarBI Works</p>
          <p className={classes.subtitle}>
            Your own personalized solar project estimator, powered by Empower
            Analytics
          </p>
          <div className={classes.solarAssets}>
            <img
              src="/static/assets/images/solarBI_1.jpeg"
              alt="search for location"
              style={{ marginLeft: 80, width: 270 }}
            />
            <div className={classes.row}>
              <div className={classes.col}>
                <p className={classes.number}>1</p>
                <p className={classes.step}>Search for your project location</p>
                <p className={classes.explain}>
                  We use Google maps, satellite Solar Irradiation data and local
                  weather data to create a personalized solar plan.
                </p>
              </div>
            </div>
          </div>

          <div className={classes.solarAssets}>
            <img
              src="/static/assets/images/solarBI_2.png"
              alt="personalize your solar analysis"
              style={{ marginLeft: 80, width: 270 }}
            />
            <div className={classes.row}>
              <div className={classes.col}>
                <p className={classes.number}>2</p>
                <p className={classes.step}>Personalize your solar analysis</p>
                <p className={classes.explain}>
                  Adjust your energy consumption details to fine-tune potential
                  savings, optimal number of solar panels and forecast of
                  potential profit.
                </p>
              </div>
            </div>
          </div>

          <div className={classes.solarAssets}>
            <img
              src="/static/assets/images/solarBI_3.png"
              alt="personalize your solar analysis"
              style={{ marginLeft: 80, width: 270 }}
            />
            <div className={classes.row}>
              <div className={classes.col}>
                <p className={classes.number}>3</p>
                <p className={classes.step}>
                  Understand financial opportunities
                </p>
                <p className={classes.explain}>
                  Cost benefit analysis of loan, lease, and purchase options for
                  your solar project based on your results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className={classes.head}>Country-wide solar potential</p>
        <div
          style={{ backgroundColor: "white", marginTop: 30, marginBottom: 200 }}
        >
          <img
            className={classes.solarMap}
            src="/static/assets/images/aus_map.png"
            alt="solar map"
          />
        </div>
      </div>
    );
  }
}

// WelcomePage.propTypes = propTypes;

export default withWidth()(withStyles(styles)(WelcomePage));
