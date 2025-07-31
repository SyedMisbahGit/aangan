import axios from 'axios';
import { getAuthHeader } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Flag content for moderation
 */
export const flagContent = async (data: {
  contentId: string;
  contentType: 'whisper' | 'comment' | 'user';
  reason: string;
  details?: string;
}) => {
  const response = await axios.post(
    `${API_URL}/moderation/flags`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

/**
 * Get list of flagged content
 */
export const getFlaggedContent = async (params?: {
  status?: 'pending' | 'resolved' | 'rejected';
  type?: 'whisper' | 'comment' | 'user';
  page?: number;
  limit?: number;
}) => {
  const response = await axios.get(`${API_URL}/moderation/flags`, {
    params,
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Review a flagged content item
 */
export const reviewFlaggedContent = async (
  flagId: string,
  action: 'approve' | 'reject' | 'delete',
  moderatorNote?: string
) => {
  const response = await axios.post(
    `${API_URL}/moderation/flags/${flagId}`,
    { action, moderatorNote },
    { headers: getAuthHeader() }
  );
  return response.data;
};

/**
 * Get moderation statistics
 */
export const getModerationStats = async () => {
  const response = await axios.get(`${API_URL}/moderation/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/**
 * Suspend a user
 */
export const suspendUser = async (
  userId: string,
  reason: string,
  durationDays?: number
) => {
  const response = await axios.post(
    `${API_URL}/moderation/users/${userId}/suspend`,
    { reason, durationDays },
    { headers: getAuthHeader() }
  );
  return response.data;
};

/**
 * Unsuspend a user
 */
export const unsuspendUser = async (suspensionId: string, reason: string) => {
  const response = await axios.post(
    `${API_URL}/moderation/suspensions/${suspensionId}/unsuspend`,
    { reason },
    { headers: getAuthHeader() }
  );
  return response.data;
};

/**
 * Get user's suspension history
 */
export const getUserSuspensions = async (userId: string) => {
  const response = await axios.get(
    `${API_URL}/moderation/users/${userId}/suspensions`,
    { headers: getAuthHeader() }
  );
  return response.data;
};
