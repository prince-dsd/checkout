import React from "react";
import { StateProvider } from "./StateContext";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./constants/theme";

import Header from "./Views/Header";
import Main from "./Views/Main";
import Footer from "./Views/Footer";

const App = () => (
  <ThemeProvider theme={theme}>
    <StateProvider>
      <div style={{ flexGrow: 1 }}>
        <Header title="Checkout" logoLink="stylumia.png" />

        <Main />
        <Footer />
      </div>
    </StateProvider>
  </ThemeProvider>
);

export default App;
