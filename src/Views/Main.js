import React from "react";
import { Container, Paper, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CustomizedSteppers from "./Stepper";

const useStyles = makeStyles((theme) => ({
  boxWrapper: {
    marginBottom: "55px",
    minHeight: "calc(26vh + 260px)",
  },
  container: {
    position: "relative",
    zIndex: "1100",
    marginTop: "-95px",
    marginBottom: "45px",
  },
}));

const Main = () => {
  const classes = useStyles();

  //   useEffect(() => {
  //     const resCustomer = axios.post("https://dev.stylumia.com/customer", {
  //       data: { firstname: "sdsd" },
  //     });
  //     console.log(resCustomer);
  //   }, []);

  return (
    <Box component="main" className={classes.boxWrapper}>
      <Container maxWidth="md" className={classes.container}>
        <Paper elevation={5}>
          <CustomizedSteppers />
        </Paper>
      </Container>
    </Box>
  );
};

export default Main;
