import { FRUIT_DATA } from "./mocks";

const getFruitListByQuery = (
    query: string
): Promise<Array<{ id: number; name: string }>> => {
    // instead of real api call
    return new Promise((resolve) => {
        setTimeout(() => {
            const filteredData = FRUIT_DATA.filter((item) =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            resolve(filteredData);
        }, 500); // 500ms delay to simulate network request
    });
};

export default {
    getFruitListByQuery,
};
