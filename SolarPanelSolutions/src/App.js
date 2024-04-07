import React from "react";
import GlobalStyles from "styles/GlobalStyles";
import { css } from "styled-components/macro"; //eslint-disable-line
import AgencyLandingPage from "demos/AgencyLandingPage.js";
import ComponentRenderer from "ComponentRenderer.js";
import UnderConstruction from "pages/UnderConstruction";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, createContext } from "react";

export const StateContext = createContext();

export default function App() {
  const [appConfig, setAppConfig] = useState(null);

  useEffect(() => {
    fetch("/config.json") // Fetches from the public directory
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((configData) => {
        setAppConfig(configData);
      })
      .catch((error) => {
        console.error("Failed to load configuration:", error);
      });
  }, []);

  if (!appConfig) {
    return <div>Loading...</div>;
  }

  return (
    <StateContext.Provider value={appConfig}>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route
            path="/components/:type/:subtype/:name"
            element={<ComponentRenderer />}
          />
          <Route
            path="/components/:type/:name"
            element={<ComponentRenderer />}
          />
          <Route path="/" element={<AgencyLandingPage />} />
          <Route path="/under-construction" element={<UnderConstruction />} />
        </Routes>
      </Router>
    </StateContext.Provider>
  );
}
