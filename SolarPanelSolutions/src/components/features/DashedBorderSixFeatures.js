import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
//eslint-disable-next-line
import { css } from "styled-components/macro";
import { SectionHeading } from "components/misc/Headings.js";

import SolarPanelImage from "../../images/solar-panel-icon.svg";
import BatteryImage from "../../images/battery-icon.svg";
import ConsultationImage from "../../images/consultation-icon.svg";
import InstallationImage from "../../images/installation-icon.svg";
import MaintenanceImage from "../../images/maintenance-icon.svg";
import MonitoringImage from "../../images/monitoring-icon.svg";

import { ReactComponent as SvgDecoratorBlob3 } from "../../images/svg-decorator-blob-3.svg";

const Container = tw.div`relative`;

const ThreeColumnContainer = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center max-w-screen-xl mx-auto py-20 md:py-24`}
`;
const Heading = tw(SectionHeading)`w-full`;

const Column = styled.div`
  ${tw`md:w-1/2 lg:w-1/3 px-6 flex`}
`;

const Card = styled.div`
  ${tw`flex flex-col mx-auto max-w-xs items-center px-6 py-10 border-2 border-dashed border-primary-500 rounded-lg mt-12`}
  .imageContainer {
    ${tw`border-2 border-primary-500 text-center rounded-full p-6 flex-shrink-0 relative`}
    img {
      ${tw`w-8 h-8`}
    }
  }

  .textContainer {
    ${tw`mt-6 text-center`}
  }

  .title {
    ${tw`mt-2 font-bold text-xl leading-none text-primary-500`}
  }

  .description {
    ${tw`mt-3 font-semibold text-secondary-100 text-sm leading-loose`}
  }
`;

const DecoratorBlob = styled(SvgDecoratorBlob3)`
  ${tw`pointer-events-none absolute right-0 bottom-0 w-64 opacity-25 transform translate-x-32 translate-y-48 `}
`;

export default () => {
  const cards = [
    {
      imageSrc: SolarPanelImage,
      title: "Solar Panel Installation",
      description:
        "Custom solar panel installations designed to maximize efficiency and energy savings.",
    },
    {
      imageSrc: BatteryImage,
      title: "Energy Storage Solutions",
      description:
        "High-capacity solar batteries to store and manage your energy use.",
    },
    {
      imageSrc: ConsultationImage,
      title: "Free Consultation",
      description:
        "Expert advice to tailor a solar solution that fits your home or business needs.",
    },
    {
      imageSrc: InstallationImage,
      title: "Professional Installation",
      description:
        "Seamless and reliable solar panel installation by certified professionals.",
    },
    {
      imageSrc: MaintenanceImage,
      title: "Maintenance & Repairs",
      description:
        "Regular maintenance services to ensure your solar system operates at peak performance.",
    },
    {
      imageSrc: MonitoringImage,
      title: "System Monitoring",
      description:
        "Continuous monitoring solutions to keep track of your energy production and usage.",
    },
  ];

  return (
    <Container>
      <ThreeColumnContainer>
        <Heading>
          Our Professional <span tw="text-primary-500">Services</span>
        </Heading>
        {cards.map((card, i) => (
          <Column key={i}>
            <Card>
              <span className="imageContainer">
                <img src={card.imageSrc} alt={card.title} />
              </span>
              <span className="textContainer">
                <span className="title">{card.title}</span>
                <p className="description">{card.description}</p>
              </span>
            </Card>
          </Column>
        ))}
      </ThreeColumnContainer>
      <DecoratorBlob />
    </Container>
  );
};
