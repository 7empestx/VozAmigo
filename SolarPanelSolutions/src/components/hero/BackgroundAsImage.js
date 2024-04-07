import React, { useState, useContext } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line

import Header, {
  NavLink,
  NavLinks,
  PrimaryLink,
  LogoLink,
  NavToggle,
  DesktopNavLinks,
} from "../headers/light.js";
import "./ModalForm.css";

import { StateContext } from "../../App";

const StyledHeader = styled(Header)`
  ${tw`pt-8 max-w-none`}
  ${DesktopNavLinks} ${NavLink}, ${LogoLink} {
    ${tw`text-gray-100 hover:border-gray-300 hover:text-gray-300`}
  }
  ${NavToggle}.closed {
    ${tw`text-gray-100 hover:text-primary-500`}
  }
`;
const Container = styled.div`
  ${tw`relative -mx-8 -mt-8 bg-center bg-cover`}
  background-image: url("https://images.unsplash.com/photo-1522071901873-411886a10004?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80");
`;

const OpacityOverlay = tw.div`z-10 absolute inset-0 bg-primary-500 opacity-25`;

const HeroContainer = tw.div`z-20 relative px-4 sm:px-8 max-w-screen-xl mx-auto`;
const TwoColumn = tw.div`pt-24 pb-32 px-4 flex justify-between items-center flex-col lg:flex-row`;
const LeftColumn = tw.div`flex flex-col items-center lg:block`;
const RightColumn = tw.div`w-full sm:w-5/6 lg:w-1/2 mt-16 lg:mt-0 lg:pl-8`;

const Heading = styled.h1`
  ${tw`text-3xl text-center lg:text-left sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-100 leading-none`}
  span {
    ${tw`inline-block mt-2`}
  }
`;

const SlantedBackground = styled.span`
  ${tw`relative text-primary-500 px-4 -mx-4 py-2`}
  &::before {
    content: "";
    ${tw`absolute inset-0 bg-gray-100 transform -skew-x-12 -z-10`}
  }
`;

const Notification = tw.span`inline-block my-4 pl-3 py-1 text-gray-100 border-l-4 border-blue-500 font-medium text-sm`;

const PrimaryAction = tw.button`px-8 py-3 mt-10 text-sm sm:text-base sm:mt-16 sm:px-8 sm:py-4 bg-gray-100 text-primary-500 font-bold rounded shadow transition duration-300 hocus:bg-primary-500 hocus:text-gray-100 focus:shadow-outline`;

const VideoPlayer = styled.video`
  ${tw`rounded bg-black shadow-xl max-w-full h-auto`}
  width: 100%;
`;

const Modal = ({ isOpen, toggleModal, children }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 5,
          width: "80%",
          maxWidth: 500,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const xapikey = process.env.REACT_APP_X_API_KEY;

  const appConfig = useContext(StateContext);
  const state = appConfig.State;

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      operation: 'write', // Specify the operation type
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      state: state,
      business: "SolarPanelSolutions",
    };

    // Endpoint where you want to send the form data
    const endpoint = "https://api.clientcultivator.biz/lead";

    try {
      const response = await fetch(endpoint, {
        credentials: "same-origin",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": xapikey, // Reminder: Handle API key securely
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle the response from the server
      const result = await response.json();
      console.log(result);

      // Close the modal if the submission was successful
      setIsModalOpen(false);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="under-construction">About</NavLink>
      <NavLink href="under-construction">Blog</NavLink>
      <NavLink href="under-construction">Locations</NavLink>
      <NavLink href="under-construction">Pricing</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      <PrimaryLink as="button" onClick={() => setIsModalOpen(true)}>
        Hire Us
      </PrimaryLink>
    </NavLinks>,
  ];

  return (
    <Container>
      <OpacityOverlay />
      <HeroContainer>
        <StyledHeader links={navLinks} />
        <TwoColumn>
          <LeftColumn>
            <Notification>
              We have now launched operations in {state}.
            </Notification>
            <Heading>
              <span>Hire the best</span>
              <br />
              <SlantedBackground>
                Solar Panel Installation Team.
              </SlantedBackground>
            </Heading>
            <PrimaryAction onClick={() => setIsModalOpen(true)}>
              Hire Us
            </PrimaryAction>
          </LeftColumn>
          <RightColumn>
            <VideoPlayer controls>
              <source src="/solar-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </VideoPlayer>
          </RightColumn>
        </TwoColumn>
      </HeroContainer>
      <Modal isOpen={isModalOpen} toggleModal={() => setIsModalOpen(false)}>
        <div className="modal-content">
          <div className="close-icon" onClick={() => setIsModalOpen(false)}>
            &times;
          </div>{" "}
          {}
          <h2 className="modal-header">Request a Quote</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input type="tel" name="phone" required />
            </div>
            <button type="submit" className="submit-btn">
              Submit
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="close-btn"
            >
              Close
            </button>
          </form>
        </div>
      </Modal>
    </Container>
  );
};
