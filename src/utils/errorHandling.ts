import axios from 'axios';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const handleApiError = (
  error: unknown,
  fallbackMessage = "Une erreur s'est produite"
): string => {
  console.log(error);
  if (axios.isCancel(error)) {
    console.log('Requête annulée');
    return 'Opération annulée';
  }

  if (error instanceof ApiError) {
    return `Erreur ${error.status}: ${error.message}`;
  }

  if (error instanceof Error) {
    console.error(error.message);
    return error.message;
  }

  return fallbackMessage;
};
