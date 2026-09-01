// Frontend service that calls the backend API
// Backend stores data in JSON files for persistence

const API_URL = ''; // Always use relative URLs for same-origin API calls

// Fetch all use cases
export async function fetchUseCases() {
  const response = await fetch(`${API_URL}/api/use-cases`);
  if (!response.ok) {
    throw new Error('Failed to fetch use cases');
  }
  return response.json();
}

// Fetch likes count for a use case
export async function fetchLikes(useCaseId) {
  const response = await fetch(`${API_URL}/api/likes/${useCaseId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch likes');
  }
  const data = await response.json();
  return { count: data.count, emails: data.emails ?? [] };
}

// Increment like count
export async function incrementLike(useCaseId) {
  const response = await fetch(`${API_URL}/api/likes/${useCaseId}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to increment like');
  }
  const data = await response.json();
  return data.count;
}

// Fetch comments for a use case
export async function fetchComments(useCaseId) {
  const response = await fetch(`${API_URL}/api/comments/${useCaseId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
}

// Add a comment
export async function addComment(useCaseId, text) {
  const response = await fetch(`${API_URL}/api/comments/${useCaseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error('Failed to add comment');
  }
  return response.json();
}

// Remove a comment from a specific post, made by a specific email (admin only)
export async function removeComment(useCaseId, id = '') {
  const response = await fetch(`${API_URL}/api/comments/remove/${useCaseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id}),
  });
  if (!response.ok) {
    throw new Error('Failed to remove comment');
  }

  return response.json();
}

// Submit a new use case
export async function submitUseCase(entry) {
  const response = await fetch(`${API_URL}/api/use-cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    throw new Error('Failed to submit use case');
  }
  return response.json();
}

// Fetch the authenticated user from the server (identity set by oauth2-proxy)
export async function fetchCurrentUser() {
  const response = await fetch(`${API_URL}/api/me`);
  if (!response.ok) return { user: null };
  const data = await response.json();
  // server returns { user: { email, displayName, isAdmin } }
  return data.user || null;
}

// Check if current user is admin (no email arg needed in production — server reads oauth2-proxy header)
export async function checkAdminStatus(email) {
  const headers = {};
  if (email) {
    headers['X-User-Email'] = email;
  }
  
  const response = await fetch(`${API_URL}/api/admin/check`, { headers });
  if (!response.ok) {
    return { isAdmin: false };
  }
  return response.json();
}

// Delete a use case (admin only)
export async function deleteUseCase(useCaseId, email) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (email) {
    headers['X-User-Email'] = email;
  }
  
  const response = await fetch(`${API_URL}/api/use-cases/${useCaseId}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete use case' }));
    throw new Error(error.error || error.message || 'Failed to delete use case');
  }
  
  return response.json();
}

// Bulk submit use cases (admin only)
export async function bulkSubmitUseCases(rows) {
  const response = await fetch(`${API_URL}/api/use-cases/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Bulk upload failed' }));
    throw new Error(err.error || 'Bulk upload failed');
  }
  return response.json();
}

// Made with Bob
