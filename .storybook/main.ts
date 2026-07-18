// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {StorybookConfig} from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.tsx'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
};

export default config;
