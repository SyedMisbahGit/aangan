import React from 'react';
import ErrorPage from './ErrorPage';

export default {
  title: 'Shared/ErrorPage',
  component: ErrorPage,
};

export const Default = () => (
  <ErrorPage title="Something went adrift" message="The courtyard encountered an unexpected moment." />
);

export const WithErrorDetails = () => (
  <ErrorPage
    title="Something went adrift"
    message="The courtyard encountered an unexpected moment."
    errorDetails="Stack trace: Error: Something broke at line 42."
  />
);

export const WithNarratorLine = () => (
  <ErrorPage
    title="Oops!"
    message="A gentle hush falls over the campus."
    narratorLine="A poetic narrator line for this error."
  />
); 