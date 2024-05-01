import { useEffect, useState } from "react";
import { debounce } from "../utils";

export const useFetchOnQueryChange = <T>(
    query: string,
    fetchData: (query: string) => Promise<T>,
    delay: number = 400
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Debounce function to delay execution until X ms have passed without the query changing
        const debouncedFetch = debounce(async () => {
            if (query === "") {
                setLoaded(false);
                setData(null);
                setLoading(false);
                return;
            }

            setLoaded(false);
            setLoading(true);
            setData(null);
            try {
                const response = await fetchData(query);
                setData(response);
                setError(null);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
                setLoaded(true);
            }
        }, delay);

        debouncedFetch();

        // Cleanup function to cancel the debounce on unmount or query change
        return () => {
            debouncedFetch.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return { data, loading, error, loaded };
};
