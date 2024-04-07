import React, { useContext } from "react";
import tw from "twin.macro"; //eslint-disable-line
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";

import Hero from "components/hero/BackgroundAsImage.js";
import Features from "components/features/DashedBorderSixFeatures";
import MainFeature from "components/features/TwoColSingleFeatureWithStats2.js";
import MainFeature2 from "components/features/TwoColWithTwoFeaturesAndButtons.js";
import Portfolio from "components/cards/PortfolioTwoCardsWithImage.js";
import Blog from "components/blogs/ThreeColSimpleWithImageAndDashedBorder.js";
import Testimonial from "components/testimonials/TwoColumnWithImageAndProfilePictureReview.js";
import FAQ from "components/faqs/SimpleWithSideImage.js";
import ContactUsForm from "components/forms/TwoColContactUsWithIllustration.js";
import Footer from "components/footers/MiniCenteredFooter.js";
import { StateContext } from "../App";
import { Helmet } from 'react-helmet';

export default function AgencyLandingPage() {
  const appConfig = useContext(StateContext); // Use the context to access the appConfig
  const state = appConfig.State; // Access the state from the appConfig

  const title = appConfig.State + " Solar Panel Solutions";
  const description = `${state} Solar Panel Solutions specializes in professional solar panel installation and services throughout ${state}. Discover efficient, eco-friendly solar energy for your home or business.`;
  const og_site_name = `${state} Solar Panel Solutions`;
  const og_title = `Professional Solar Panel Installation and Services in ${state}`;
  const og_description = `Experience the best in solar panel installation and services with ${state} Solar Panel Solutions. We ensure high-quality, reliable, and sustainable energy solutions tailored to your needs.`;
  const twitter_description = `Join the renewable energy movement with ${state} Solar Panel Solutions. We provide custom solar panel installations that are perfect for unique climate.`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:site_name" content={og_site_name} />
        <meta property="og:title" content={og_title} />
        <meta
          property="og:description"
          content={og_description}
        />
        <meta
          name="twitter:description"
          content={twitter_description}
        />
      </Helmet>
      <AnimationRevealPage>
        <Hero />
        <MainFeature />
        <Features />
        <MainFeature2 />
        <Portfolio />
        <Testimonial
          subheading="Our Customer Stories"
          heading={
            <>
              Our Clients <span tw="text-primary-500">Trust Us.</span>
            </>
          }
          description={`Our commitment to providing the best solar panel solutions is reflected in the satisfaction of our customers. Here are some of their experiences with ${state} Solar Panel Solutions.`}
          testimonials={[
            {
              imageSrc: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1024&q=80`,
              profileImageSrc: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3.25&w=512&h=512&q=80`,
              quote: `The professionalism and expertise of ${state} Solar Panel Solutions made the transition to solar energy seamless. Our energy bills have decreased significantly, and we're thrilled to contribute to a greener environment.`,
              customerName: `Angela Moss`,
              customerTitle: `Homeowner`,
            },
            {
              imageSrc: `https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80`,
              profileImageSrc: `https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=512&h=512&q=80`,
              quote: `I was impressed with the range of solar options ${state} Solar Panel Solutions provided and their understanding of what would work best for my property. The installation was quick, and the team was incredibly respectful of my space.`,
              customerName: `Elliot Alderson`,
              customerTitle: "Business Owner",
            },
          ]}
          textOnLeft={true}
        />
        <FAQ
          imageSrc="https://images.unsplash.com/photo-1581089778245-3ce67677f718?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80" // Replace with an image relevant to customer support in the solar industry
          imageContain={true}
          imageShadow={false}
          subheading="Help Center"
          heading={
            <>
              Frequently Asked <span tw="text-primary-500">Questions</span>
            </>
          }
        />
        <Blog />
        <ContactUsForm />
        <Footer />
      </AnimationRevealPage>
    </>
  );
}
