import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';
import ReactLogo from '../assets/react.svg';
import styles from './index.module.css';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <FrameworkCardContainer />
      <OlderFrameworkList />
    </Layout>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

function FrameworkCardContainer() {
  return (
    <div className="framework-card-container">
      <FrameworkCard
        name="React"
        href="/react/"
        logo={<ReactLogo alt="React logo" className="framework-card__logo" />}
      />
      <FrameworkCard
        name="React Native"
        href="/react-native/"
        logo={<ReactLogo alt="React logo" className="framework-card__logo" />}
      />
    </div>
  );
}

function FrameworkCard({name, logo, href}) {
  return (
    <div className="framework-card">
      <a href={href} className="framework-card__link">
        {logo}
        {name}
      </a>
    </div>
  );
}

function OlderFrameworkList() {
  return (
    <div className="older-tutorials-wrapper">
      <div>
        <h2>Older Tutorials</h2>
        <ul>
          <li>
            <a href="/ember">Ember</a>
          </li>
          <li>
            <a href="/rails">Ruby on Rails</a>
          </li>
          <li>
            <a href="/vue">Vue</a>
          </li>
        </ul>
      </div>
    </div>
  );
}