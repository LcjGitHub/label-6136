export function extractErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'error' in err.response.data &&
    typeof (err.response.data as { error: unknown }).error === 'string'
  ) {
    return (err.response.data as { error: string }).error;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return '操作失败，请稍后重试';
}
