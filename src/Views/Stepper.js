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

const API_URL = "https://dev.stylumia.com/";

const Steppers = () => {
  const classes = style();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cardStatus] = useState(true);
  const [cardMessage] = useState("");
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
  const handleReset = () => setActiveStep(0);

  const capture = (e) => {
    console.log(formValues.auth_type);
    setLoading(true);
    axios
      .post(`${API_URL}customer`, {
        data: {
          address: formValues.line1,
          name: formValues.firstname + " " + formValues.lastname,
          contact: formValues.phone,
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
                            alert("payment successfull");
                            setActiveStep(
                              (prevActiveStep) => prevActiveStep + 1
                            );
                            setLoading(false);
                          } else {
                            alert("payment failed");
                          }
                        } catch (err) {
                          console.log(err);
                        }
                      },

                      theme: {
                        color: "#F37254",
                      },
                    };
                    const rzp1 = new window.Razorpay(options);
                    rzp1.open();
                  }
              });
          }
        }
      });
  };

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
          <form
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
          </form>
        )}
      </Box>
    </>
  );
};

export default Steppers;
