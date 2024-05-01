import { useState } from "react";
import Input from "../Input";
import styles from "./styles.module.css";
import { useFetchOnQueryChange } from "../../hooks";
import { highlightMatch } from "../../utils";
import api from "../../api";

const Autocomplete = () => {
    const [focused, setFocused] = useState(false);
    const [query, setQuery] = useState<string>("");
    const { data, loading, loaded } = useFetchOnQueryChange(
        query,
        fetchResults
    );

    async function fetchResults(query: string) {
        return api.getFruitListByQuery(query);
    }

    const dropDownVisible = (loading || loaded) && query.length > 0 && focused;

    return (
        <div className={styles.wrapper}>
            <Input
                value={query}
                onChange={setQuery}
                onFocusChange={setFocused}
                placeholder="Fruit search..."
            />

            <div
                className={`${styles.dropdown} ${
                    dropDownVisible && styles.visible
                }`}
            >
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    loaded &&
                    (data && data.length > 0 ? (
                        <ul className={styles.list}>
                            {data.map((item) => (
                                <li key={item.id} className={styles.item}>
                                    {highlightMatch(item.name, query)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>No results found.</div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Autocomplete;
