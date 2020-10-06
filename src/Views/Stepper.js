import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import {
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
} from "@material-ui/icons";
import StepperIcons from "./StepperIcons";
import ContactForm from "./Forms/ContactForm";
// import ServiceForm from "./Forms/ServiceForm";
import { useStateValue } from "../StateContext";
import StepConnector from "./StepConnector";
import axios from "axios";
import PaymentForm from "./Forms/PaymentForm";

import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import { ValidatorForm } from "react-material-ui-form-validator";

// OVERALL STYLE
const style = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(1),
  },
  mainBox: {
    position: "relative",
    marginTop: "-8px",
    padding: "10px 20px",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
    background: theme.palette.background.default,
  },
  stepper: {
    height: "calc(10vh - 40px)",
    minHeight: "55px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  buttonWrapper: {
    justifyContent: "flex-end",
  },
}));

const StepContent = ({ step }) => {
  switch (step) {
    case 0:
      return <ContactForm />;
    case 1:
      return <PaymentForm />;
    case 2:
      return <PaymentForm />;
    default:
      return <></>;
  }
};

const API_URL = window.location.href;

const Steppers = () => {
  const classes = style();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cardStatus] = useState(true);
  const [{ formValues }] = useStateValue();

  const handleNext = () => {
    if (activeStep === 1) {
      capture();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () =>
    setActiveStep((prevActiveStep) => prevActiveStep - 1);

  const capture = (e) => {
    setLoading(true);
    axios
      .post(`${API_URL}customer`, {
        data: {
          address: formValues.line1,
          name: formValues.firstname + " " + formValues.lastname,
          contact: "+91" + formValues.phone,
          email: formValues.email,
          postalcode: formValues.postal_code,
          country: formValues?.country.name,
          city: formValues.city,
        },
      })
      .then((dataCustomer) => {
        if (Object.keys(dataCustomer.data).length > 2) {
          if (dataCustomer.data.id) {
            axios
              .post(`${API_URL}order`, {
                data: {
                  customer_id: dataCustomer.data.id,
                  method: formValues.auth_type,
                },
              })
              .then((orderData) => {
                if (Object.keys(orderData.data).length > 2)
                  if (orderData.data.id) {
                    const options = {
                      key: process.env.REACT_APP_RAZOR_PAY_TEST_KEY,
                      order_id: orderData.data.id,
                      customer_id: dataCustomer.data.id,
                      recurring: "1",

                      handler: async (response) => {
                        try {
                          const paymentId = response.razorpay_payment_id;
                          const url = `${API_URL}capture/`;

                          const captureResponse = await axios.post(url, {
                            data: { payment_id: paymentId },
                          });
                          if (captureResponse.data.status === "captured") {
                            // alert("payment successfull");
                            setActiveStep(
                              (prevActiveStep) => prevActiveStep + 1
                            );
                            setLoading(false);
                          } else {
                            handleClickOpen();
                            setLoading(false);
                          }
                        } catch (err) {
                          // alert("payment failed");
                          handleClickOpen();
                          setLoading(false);
                        }
                      },
                      modal: {
                        ondismiss: function () {
                          // alert("payment failed");
                          handleClickOpen();
                          setLoading(false);
                        },
                      },

                      theme: {
                        color: "#F37254",
                      },
                    };
                    const rzp1 = new window.Razorpay(options);
                    rzp1.open();
                  } else {
                    handleClickOpen();
                    setLoading(false);
                  }
              });
          }
        } else {
          handleClickOpen();
          setLoading(false);
        }
      })
      .catch((err) => {
        handleClickOpen();
        setLoading(false);
      });
  };
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    handleBack();
  };
  const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });
  const DialogContent = withStyles((theme) => ({
    root: {
      padding: theme.spacing(2),
    },
  }))(MuiDialogContent);

  const DialogActions = withStyles((theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(1),
    },
  }))(MuiDialogActions);
  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

  return (
    <>
      <Stepper
        alternativeLabel
        className={classes.stepper}
        connector={<StepConnector />}
        activeStep={activeStep}
      >
        {/* Change the number of loops here based on StepContent */}
        {[1, 2, 3].map((e) => (
          <Step key={e}>
            <StepLabel StepIconComponent={StepperIcons} />
          </Step>
        ))}
      </Stepper>
      <Box className={classes.mainBox}>
        {activeStep === 2 ? (
          <Grid
            container
            spacing={3}
            direction="column"
            justify="space-around"
            alignItems="center"
            style={{ height: "400px" }}
          >
            {cardStatus ? (
              <SentimentVerySatisfied fontSize="large" color="primary" />
            ) : (
              <SentimentVeryDissatisfied fontSize="large" color="error" />
            )}
            <Typography variant="h4">Thank You</Typography>
          </Grid>
        ) : (
          <ValidatorForm
            autoComplete="off"
            className={classes.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <Grid container spacing={3}>
              <StepContent step={activeStep} />
              <Grid container item justify="flex-end">
                {activeStep === 1 && (
                  <Button
                    disabled={activeStep === 0}
                    className={classes.button}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : activeStep === 1 ? (
                    "Pay"
                  ) : (
                    "Next"
                  )}
                </Button>
              </Grid>
            </Grid>
          </ValidatorForm>
        )}
      </Box>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Payment Failed
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            We are sorry for the inconvenience caused.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Steppers;
