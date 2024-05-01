export const highlightMatch = (text: string, query: string) => {
    const startIndex = text.toLowerCase().indexOf(query.toLowerCase());
    if (startIndex === -1) return text;

    const endIndex = startIndex + query.length;
    return (
        <>
            {text.substring(0, startIndex)}
            <strong>{text.substring(startIndex, endIndex)}</strong>
            {text.substring(endIndex)}
        </>
    );
};
