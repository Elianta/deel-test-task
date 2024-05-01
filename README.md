# Frontend test task

Auto-complete component in React TypeScript.

## :hammer: Installation:

    git clone git@github.com:Elianta/deel-test-task.git
    npm install

## :runner: Run in development mode:

    npm run dev

## :running::running: Run in production mode:

    npm run build && npm run preview

## :trophy: Description

The `Autocomplete` component covers several advanced use cases that enhance usability and robustness, making it well-suited for real-world applications:

-   **Debouncing**: Reduces API calls when users frequently change their input, improving performance and responsiveness.

-   **Conditional Rendering** and **Error Handling**: Manages loading states, keeping users informed during data fetches.

-   **Highlighting** Search Results:
    Enhances user understanding by highlighting matching parts of search results.

-   **Scalability** and **Maintenance**:
    Easily replace mock data fetch function with real API calls for testing and development.

-   **Cancellation** of Debounced Calls: Includes a method to cancel ongoing API calls, preventing unnecessary updates and potential issues during rapid user interactions.
