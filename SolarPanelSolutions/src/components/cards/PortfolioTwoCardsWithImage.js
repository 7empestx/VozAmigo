import React, { useContext } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import { SectionHeading, Subheading } from "components/misc/Headings.js";
import { PrimaryLink as PrimaryLinkBase } from "components/misc/Links.js";
import { ReactComponent as LocationIcon } from "feather-icons/dist/icons/map-pin.svg";
import { ReactComponent as TimeIcon } from "feather-icons/dist/icons/clock.svg";
import { ReactComponent as ArrowRightIcon } from "images/arrow-right-icon.svg";
import ResidentialHomeIllustrationSrc from "../../images/residential-home-illustration.svg";
import CommercialComplexIllustrationSrc from "../../images/commercial-complex-illustration.svg";
import { Link } from "react-router-dom";
import { StateContext } from "../../App";

const Container = tw.div`relative`;
const Content = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;

const ThreeColumn = tw.div`flex flex-wrap`;
const Column = tw.div`xl:mr-12 xl:last:mr-0`;
const HeadingColumn = styled(Column)((props) => [
  tw`w-full xl:w-5/12`,
  props.textOnLeft ? tw`xl:order-first` : tw`xl:order-last xl:ml-12 xl:mr-0`,
]);
const CardColumn = tw(
  Column,
)`w-full md:w-1/2 xl:w-3/12 mt-16 xl:mt-0 xl:last:ml-auto`;

const HeadingInfoContainer = tw.div`text-center xl:text-left max-w-lg xl:max-w-none mx-auto xl:mx-0`;
const HeadingTitle = tw(SectionHeading)`mt-4 xl:text-left leading-tight`;
const HeadingDescription = tw.p`text-sm md:text-base lg:text-lg font-medium leading-relaxed text-secondary-100 mt-8`;
const PrimaryLink = styled(PrimaryLinkBase)`
  ${tw`inline-flex justify-center xl:justify-start items-center mt-8 text-lg`}
  svg {
    ${tw`ml-2 w-5 h-5`}
  }
`;

const Card = tw.div`mx-auto xl:mx-0 xl:ml-auto max-w-sm md:max-w-xs lg:max-w-sm xl:max-w-xs`;
const CardImage = styled.div((props) => [
  `background-image: url("${props.imageSrc}");`,
  tw`h-80 bg-cover bg-center rounded`,
]);

const CardText = tw.div`mt-4`;

const CardHeader = tw.div`flex justify-between items-center`;
const CardCompany = tw.div`text-primary-500 font-bold text-lg`;
const CardType = tw.div`font-semibold text-sm text-gray-600`;

const CardTitle = tw.h5`text-xl mt-4 font-bold`;

const CardMeta = styled.div`
  ${tw`flex flex-row flex-wrap justify-center sm:items-center font-semibold tracking-wide text-gray-600 uppercase text-xs`}
`;

const CardMetaFeature = styled.div`
  ${tw`flex items-center mt-4 mr-4 last:mr-0`}
  svg {
    ${tw`w-5 h-5 mr-1`}
  }
`;

const CardActionLink = styled(Link)`
  ${tw`w-full mt-6 inline-block text-center bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded cursor-pointer`}/* Add more of your TailwindCSS or custom styles here */
`;

export default ({
  subheading = "Our Projects",
  description = "Take a look at our portfolio of solar panel installations and see how we're helping homes and businesses save energy and reduce costs.",
  linkText = "View All Projects",
  cardLinkText = "View Project",
  textOnLeft = true,
}) => {
  const appConfig = useContext(StateContext);
  const state = appConfig.State;

  const headingHtmlComponent = (
    <>
      Powering {state} with{" "}
      <span tw="text-primary-500">Sustainable Energy.</span>
    </>
  );

  const cards = [
    {
      imageSrc: ResidentialHomeIllustrationSrc,
      company: "Residential Home",
      type: "Solar Installation",
      title: "Complete Solar System Installation",
      durationText: "2 Weeks",
      locationText: `${state}`,
    },
    {
      imageSrc: CommercialComplexIllustrationSrc,
      company: "Commercial Complex",
      type: "Solar Retrofit",
      title: "Solar Energy Retrofit for Office",
      durationText: "4 Weeks",
      locationText: `${state}`,
    },
  ];
  return (
    <Container>
      <Content>
        <ThreeColumn>
          <HeadingColumn textOnLeft={textOnLeft}>
            <HeadingInfoContainer>
              <Subheading>{subheading}</Subheading>
              <HeadingTitle>{headingHtmlComponent}</HeadingTitle>
              <HeadingDescription>{description}</HeadingDescription>
              <PrimaryLink as={Link} to="/under-construction">
                {linkText} <ArrowRightIcon />
              </PrimaryLink>
            </HeadingInfoContainer>
          </HeadingColumn>
          {cards.map((card, index) => (
            <CardColumn key={index}>
              <Card>
                <CardImage imageSrc={card.imageSrc} />
                <CardText>
                  <CardHeader>
                    <CardCompany>{card.company}</CardCompany>
                    <CardType>{card.type}</CardType>
                  </CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardMeta>
                    <CardMetaFeature>
                      <TimeIcon /> {card.durationText}
                    </CardMetaFeature>
                    <CardMetaFeature>
                      <LocationIcon /> {card.locationText}
                    </CardMetaFeature>
                  </CardMeta>
                </CardText>
                <CardActionLink to="/under-construction">
                  {cardLinkText}
                </CardActionLink>
              </Card>
            </CardColumn>
          ))}
        </ThreeColumn>
      </Content>
    </Container>
  );
};
