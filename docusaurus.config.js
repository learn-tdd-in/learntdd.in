// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const lightCodeTheme = require('prism-react-renderer/themes/github');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Learn TDD',
  tagline: 'Learn Test-Driven Development in the framework of your choice.',
  url: 'https://learntdd.in',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // favicon: 'img/favicon.ico',
  organizationName: 'learn-tdd-in', // Usually your GitHub org/user name.
  projectName: 'learntdd.in', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        gtag: {
          trackingID: 'G-D5WS3PECNF',
          anonymizeIP: true,
        },
        docs: false,
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Learn TDD in…',
        // logo: {
        //   alt: 'My Site Logo',
        //   src: 'img/logo.svg',
        // },
        items: [
          {
            to: '/react',
            label: 'React',
            position: 'left',
          },
          {
            to: '/next',
            label: 'Next.js',
            position: 'left',
          },
          {
            to: '/react-native',
            label: 'React Native',
            position: 'left',
          },
          {
            type: 'dropdown',
            label: 'Older Tutorials',
            items: [
              {
                to: '/ember',
                label: 'Ember',
              },
              {
                to: '/rails',
                label: 'Ruby on Rails',
              },
              {
                to: '/vue',
                label: 'Vue',
              },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'More',
            items: [
              {
                label: 'Contact',
                to: 'mailto:tdd@codingitwrong.com',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Josh Justice.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
