import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

/**
 * Custom hook for handling API requests with loading and error states
 * @param {Object} options - Configuration options
 * @param {Function} [options.onSuccess] - Callback on successful request
 * @param {Function} [options.onError] - Callback on request error
 * @param {boolean} [options.showSuccess] - Whether to show success message
 * @param {string} [options.successMessage] - Success message to show
 * @param {boolean} [options.showError] - Whether to show error message
 * @returns {Object} - API call function and state
 */
const useApi = (options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccess = true,
    successMessage = 'Operation completed successfully',
    showError = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Make an API request
   * @param {Object} config - Axios request config
   * @param {Object} localOptions - Local options that override hook options
   * @returns {Promise} - Promise that resolves with response data or rejects with error
   */
  const callApi = useCallback(
    async (config, localOptions = {}) => {
      const {
        onSuccess: localOnSuccess,
        onError: localOnError,
        showSuccess: localShowSuccess = showSuccess,
        successMessage: localSuccessMessage = successMessage,
        showError: localShowError = showError,
      } = localOptions;

      setLoading(true);
      setError(null);

      try {
        const response = await axios({
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
        });

        setData(response.data);

        if (localShowSuccess && localSuccessMessage) {
          enqueueSnackbar(localSuccessMessage, { variant: 'success' });
        }

        if (localOnSuccess) {
          localOnSuccess(response.data);
        } else if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);

        if (localShowError) {
          enqueueSnackbar(errorMessage, { variant: 'error' });
        }

        if (localOnError) {
          localOnError(err);
        } else if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, onError, onSuccess, showError, showSuccess, successMessage]
  );

  return {
    callApi,
    loading,
    error,
    data,
    setData, // Allow manual data updates if needed
  };
};

export default useApi;
