export const api = async ({
  endpoint,
  method = "GET",
  headers,
  body,
  onError,
  onSuccess,
}: {
  endpoint: Request["url"];
  method?: Request["method"];
  mode?: Request["mode"];
  headers?: Record<string, string>;
  body?: string;
  onError?: () => void;
  onSuccess?: (data?: any) => void;
}) => {
  const response = await fetch(endpoint, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    onError?.();
    return;
  }

  try {
    const data = await response.json();
    onSuccess?.(data);
    return data;
  } catch (error) {
    onSuccess?.();
    return;
  }
};

export const group = <T>(array: T[], size: number): T[][] => {
  return array.length > size ? [array.slice(0, size), ...group(array.slice(size), size)] : [array];
};

export const sortByOccurrence = (array: Array<any>) => {
  const frequencyMap = new Map();

  array.forEach((item) => {
    frequencyMap.set(item, (frequencyMap.get(item) ?? 0) + 1);
  });

  return array.slice().sort((a, b) => {
    const frequencyA = frequencyMap.get(a);
    const frequencyB = frequencyMap.get(b);

    if (frequencyA !== frequencyB) {
      return frequencyB - frequencyA;
    }

    return array.indexOf(a) - array.indexOf(b);
  });
};
