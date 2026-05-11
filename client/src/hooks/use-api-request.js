"use client";

import { useCallback, useEffect, useState } from "react";

export function useApiRequest(fetcher, options = {}) {
  const { auto = false, dependencies = [] } = options;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  const run = useCallback(
    async (...args) => {
      setStatus("loading");
      setError(null);

      try {
        const result = await fetcher(...args);
        setData(result);
        setStatus("success");
        return result;
      } catch (requestError) {
        setError(requestError);
        setStatus("error");
        throw requestError;
      }
    },
    [fetcher],
  );

  const dependencyKey = dependencies.join("|");

  useEffect(() => {
    if (!auto) {
      return undefined;
    }

    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) {
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        const result = await fetcher();

        if (cancelled) {
          return;
        }

        setData(result);
        setStatus("success");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(requestError);
        setStatus("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [auto, fetcher, dependencyKey]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    data,
    error,
    status,
    isIdle: status === "idle",
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    run,
    reset,
  };
}