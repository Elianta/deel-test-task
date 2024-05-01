### 1. What is the difference between Component and PureComponent? Give an example where it might break my app.

Both `Component` and `PureComponent` serve as base classes for class components, but they have different approaches to re-rendering.

A regular `Component` does not implement `shouldComponentUpdate()`. It re-renders whenever setState is called or when its parent component re-renders, regardless of whether the props or state have changed.
You would need to manually implement `shouldComponentUpdate` if you want to optimize re-renders by comparing previous and next state and props.

`PureComponent` automatically implements `shouldComponentUpdate` with a **shallow** props and state comparison. It helps to avoid unnecessary re-renders when data structures are immutable and there's no change in state or props.

Using `PureComponent` might lead to issues is when you have complex data structures like nested objects or arrays as props. Since `PureComponent` performs shallow comparison, it only checks the first level. If a nested object or array changes but the object holding it remains the same, `PureComponent` will not catch this change and will not re-render.

```js
class MyComponent extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            items: [{ id: 1, name: "1" }],
        };
    }

    componentDidMount() {
        // Update the data directly.
        let newItems = this.state.items;
        newItems.push({ id: 2, name: "2" });
        this.setState({ items: newItems });
    }

    render() {
        return (
            <ul>
                {this.state.items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        );
    }
}
```

In this example, the items array in the state is directly mutated by pushing a new item into it. Since the reference to the items array does not change, a `PureComponent` will not re-render because its shallow comparison does not detect any changes. To fix this, you should use immutable data patterns, such as creating a new array with the new item:

```js
this.setState((prevState) => ({
    items: [...prevState.items, { id: 2, name: "2" }],
}));
```

Using `Component` instead of `PureComponent` generally won't "break" an app in the conventional sense of causing errors or malfunctions directly, but it can lead to performance issues, especially in large and complex applications.

### 2. Context + ShouldComponentUpdate might be dangerous. Why is that?

Components that consume context will still update when context values change, even if they have a shouldComponentUpdate method that returns false. This is because context updates bypass the local shouldComponentUpdate check.

```js
const MyContext = createContext("default value");

class MyComponent extends Component {
    shouldComponentUpdate(nextProps) {
        // This will prevent updates if props.value hasn't changed
        return nextProps.value !== this.props.value;
    }

    render() {
        console.log("Rendering MyComponent");
        return (
            <MyContext.Consumer>
                {(contextValue) => (
                    <div>
                        Prop: {this.props.value}, Context: {contextValue}
                    </div>
                )}
            </MyContext.Consumer>
        );
    }
}

class App extends Component {
    state = {
        value: "Initial value",
        contextValue: "Initial context",
    };

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                value: "Initial value",
                contextValue: "Updated context",
            });
        }, 2000);
    }

    render() {
        return (
            <MyContext.Provider value={this.state.contextValue}>
                <MyComponent value={this.state.value} />
            </MyContext.Provider>
        );
    }
}
```

In this example:

-   `MyComponent` has a `shouldComponentUpdate` method that blocks updates unless `props.value` changes.
-   The `contextValue` in `MyContext` changes from **_"Initial context"_** to **_"Updated context"_**.
-   Even though `shouldComponentUpdate` might return `false` due to no change in `props`, `MyComponent` still re-renders to display the updated context value.

### 3. Describe 3 ways to pass information from a component to its PARENT.

1. Callback Functions

Pass a callback function as a prop to the child component. The child component then calls this function, potentially passing data back to the parent.

```js
function ParentComponent() {
    const [childData, setChildData] = useState("");

    const handleData = (data) => {
        setChildData(data);
        console.log("Data received from child:", data);
    };

    return (
        <div>
            <ChildComponent onData={handleData} />
            <p>Data from child: {childData}</p>
        </div>
    );
}

function ChildComponent({ onData }) {
    const data = "Data from Child";

    return <button onClick={() => onData(data)}>Send Data to Parent</button>;
}
```

When the button in `ChildComponent` is clicked, it calls `onData` with some data, which updates the state in `ParentComponent`.

2. Using React Context

React Context can be used to share values like callbacks and state between components for deeper component trees or when multiple components need access to shared data.

```js
const DataContext = createContext(null);

function ParentComponent() {
    const [data, setData] = useState("");

    const updateData = (newData) => {
        setData(newData);
        console.log("Data received from descendant:", newData);
    };

    return (
        <DataContext.Provider value={updateData}>
            <ChildComponent />
            <p>Data from descendant: {data}</p>
        </DataContext.Provider>
    );
}

function ChildComponent() {
    return <GrandChildComponent />;
}

function GrandChildComponent() {
    const updateData = useContext(DataContext);
    const data = "Data from Grandchild";

    return (
        <button onClick={() => updateData(data)}>Send Data to Parent</button>
    );
}
```

In this example `GrandChildComponent` can access the `updateData` function defined in `ParentComponent` without the intermediary `ChildComponent` having to pass it through.

3. Custom Hooks

Custom hooks can be designed to share logic and state across components, including mechanisms for updating state.

```js
function useSharedData(initialValue = "") {
    const [data, setData] = useState(initialValue);

    const updateData = useCallback((newData) => {
        setData(newData);
        console.log("Data updated:", newData);
    }, []);

    return [data, updateData];
}

function ParentComponent() {
    const [data, updateData] = useSharedData();

    return (
        <div>
            <ChildComponent updateData={updateData} />
            <p>Shared Data: {data}</p>
        </div>
    );
}

function ChildComponent({ updateData }) {
    const childData = "Hello from Child";

    return (
        <button onClick={() => updateData(childData)}>
            Update Parent Data
        </button>
    );
}
```

In this example `ParentComponent` and `ChildComponent` use custom hook to manage and update shared data without directly passing props deep through the component tree.

### 4. Give 2 ways to prevent components from re-rendering.

1. Using React.memo

`React.memo` is a higher-order component that wraps a functional component to perform a shallow comparison of props. If the props haven't changed, React skips rendering the component and reuses the last rendered result.

```js
const MyComponent = React.memo(function MyComponent({ text }) {
    console.log("Rendering MyComponent"); // This will log only when `text` changes
    return <div>{text}</div>;
});

function ParentComponent() {
    const [text, setText] = React.useState("Hello, World!");
    const [count, setCount] = React.useState(0);

    return (
        <div>
            <MyComponent text={text} />
            <button onClick={() => setCount(count + 1)}>Increment Count</button>
        </div>
    );
}
```

In this example, `MyComponent` will only re-render when its prop text changes. Clicking the "Increment Count" button updates the count state but does not cause `MyComponent` to re-render, thanks to `React.memo`.

2. Using useCallback

`useCallback` is a hook that returns a memoized version of a callback function that only changes if one of its dependencies has changed.

```js
const Button = React.memo(({ onClick }) => {
    console.log("Button rendered"); // This will log only if `onClick` changes
    return <button onClick={onClick}>Click me</button>;
});

function ParentComponent() {
    const [count, setCount] = useState(0);

    const incrementCount = useCallback(() => {
        setCount((c) => c + 1);
    }, []); // Dependencies array is empty, so this function is created only once

    return (
        <div>
            <p>Count: {count}</p>
            <Button onClick={incrementCount} />
        </div>
    );
}
```

In this example, the `Button` component is wrapped with `React.memo` to prevent re-renders unless the `onClick` prop changes. `useCallback` ensures that the `incrementCount` function doesn't change unless its dependencies change, which in this case, are none, so it's only created once. This setup prevents `Button` from re-rendering unnecessarily when the parent component updates due to state changes unrelated to the function.

### 5. What is a fragment and why do we need it? Give an example where it might break my app.

A `React Fragment` is a common pattern for grouping a list of children without adding extra nodes to the DOM. This is useful because React components must return a single root element, but there are cases where developers might need to return multiple elements without an extra parent wrapper.

```js
function MyComponent() {
    return (
        <>
            <h1>Welcome to my application!</h1>
            <p>This is a paragraph explaining my application.</p>
        </>
    );
}
```

In this example, `<></>` is the shorthand syntax for `<React.Fragment></React.Fragment>`. It allows `MyComponent` to return two sibling elements without an unnecessary wrapper element around them.

In most cases, using `React.Fragment` doesn't lead to an application crash, as its primary function is to group a list of children without adding extra nodes to the DOM. However, there are scenarios where `React.Fragment` can affect your application’s behavior. For example, when you use `React.Fragment` to wrap elements in a list and fail to assign a unique key to each fragment, this can lead to unexpected behavior. React uses keys to track elements during updates. If the keys are missing or not unique, it may cause rendering errors or inefficient updates.

### 6. Give 3 examples of the HOC pattern.

A Higher-Order Component is a function that takes a component and returns a new component. It's used to enhance the capabilities of a base component by wrapping it with additional functionality.

**Example 1: WithAuthentication**

This HOC adds authentication logic to a component. It can be used to conditionally render components based on whether the user is authenticated.

```js
function withAuthentication(Component) {
    return class extends React.Component {
        componentDidMount() {
            if (!this.props.isAuthenticated) {
                // Redirect to login or handle unauthenticated user
            }
        }

        render() {
            return this.props.isAuthenticated ? (
                <Component {...this.props} />
            ) : null;
        }
    };
}
```

You would use it like this:

```js
const AuthenticatedProfile = withAuthentication(Profile);
```

**Example 2: WithLogging**

This HOC adds logging functionality. It might log when the component mounts, updates, or unmounts, which can be useful for debugging or analytics.

```js
function withLogging(Component) {
    return class extends React.Component {
        componentDidMount() {
            console.log(`Component ${Component.name} mounted`);
        }

        componentDidUpdate() {
            console.log(`Component ${Component.name} updated`);
        }

        componentWillUnmount() {
            console.log(`Component ${Component.name} will unmount`);
        }

        render() {
            return <Component {...this.props} />;
        }
    };
}
```

Usage example:

```js
const LoggedProfile = withLogging(Profile);
```

**Example 3: WithDataFetching**

This HOC abstracts the data fetching logic, making the component cleaner and focused on rendering UI.

```js
function withDataFetching(Component, url) {
    return class extends React.Component {
        state = {
            data: null,
            isLoading: true,
            error: null,
        };

        async componentDidMount() {
            try {
                const response = await fetch(url);
                const data = await response.json();
                this.setState({ data, isLoading: false });
            } catch (error) {
                this.setState({ error, isLoading: false });
            }
        }

        render() {
            return <Component {...this.props} {...this.state} />;
        }
    };
}
```

Usage example:

```js
const UserProfileWithData = withDataFetching(UserProfile, "/api/user/data");
```

Starting from React 16.8, hooks provide an alternative approach to reusing logic in functional components (e.g., useEffect for lifecycle behaviors, useState for state management), which might be used instead of HOCs in some cases.

### 7. What's the difference in handling exceptions in promises callbacks and async...await?

**1. Promises**

Promises provide a more fluent way to handle asynchronous operations and their exceptions. Promises can be in one of three states: _pending_, _fulfilled_, or _rejected_. Error handling in promises is accomplished using the `.catch()` method, which catches any errors that occur during the promise execution or in any preceding `.then()` chain.

Example:

```js
fetch("https://api.example.com/data")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Failed to fetch data:", error));
```

**2. Callbacks**

Callback functions are the earliest method used in JavaScript for handling asynchronous operations. Error handling in callback patterns is typically managed through an "error-first" callback style. This convention involves passing the error as the first argument to the callback function, allowing the function to check if the first argument is truthy and handle the error accordingly.

Example:

```js
fs.readFile("/path/to/file", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }
    console.log("File data:", data);
});
```

**3. Async/Await**

Async/await is syntactic sugar built on top of promises, making asynchronous code look and behave a little more like synchronous code. This syntax makes it easier to read and write. Errors in async functions are handled using standard `try/catch` blocks, similar to synchronous code.

Example:

```js
async function fetchData() {
    try {
        const response = await fetch("https://api.example.com/data");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
}
```

In this async function, `await` is used to pause the function execution until the promise settles. If the promise is _rejected_, or if any error is thrown in the `try` block (e.g., by `throw new Error`), the error is caught by the corresponding `catch` block.

### 8. How many arguments does setState take and why is it async.

The `setState` function in React class components can take up to two arguments:

1. Update Function or Object: The first argument is mandatory.
   When it is an object, it represents the new state that will be merged with the current state. When the first argument is a function, it receives the previous state and current props as arguments and must return an object that represents changes to the state. This is recommended when the new state depends on the previous state to avoid issues with asynchronous state updates.
2. Callback Function: The second argument is optional and is a callback function that will be executed after the state update has been applied and the component has been re-rendered. This is useful for operations that need to occur after the state has been updated and the component has rendered with the new state.

`setState` in React is asynchronous for several reasons, related to performance optimization and stability: for example, React batches state updates for performance reasons. When multiple `setState` calls are made, they might be batched together into a single update cycle. This minimizes the number of re-renders and diff calculations that React has to perform.

### 9. List the steps needed to migrate a Class to Function Component.

1. Start by creating a new functional component that returns the same JSX as your class component.

```js
// Class Component
class MyComponent extends React.Component {
    render() {
        return <div>Hello, World!</div>;
    }
}

// Converted Functional Component
function MyComponent() {
    return <div>Hello, World!</div>;
}
```

2. Replace the `this.state` and `this.setState` calls with the `useState` hook.

```js
// Class Component State
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

// Functional Component State
function MyComponent() {
  const [count, setCount] = useState(0);
```

3. Identify and migrate **lifecycle methods** such as `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` using the `useEffect` hook. Each lifecycle method might translate differently depending on its use:

    - `componentDidMount`: Use `useEffect` with an empty dependency array [].
    - `componentDidUpdate`: Include specific state or props in the dependency array.
    - `componentWillUnmount`: Return a cleanup function from `useEffect`.

```js
// Class Component Lifecycle
class MyComponent extends React.Component {
  componentDidMount() {
    console.log("Component mounted");
  }
  componentDidUpdate() {
    console.log("Component updated");
  }
  componentWillUnmount() {
    console.log("Component will unmount");
  }

// Functional Component Lifecycle
function MyComponent() {
  useEffect(() => {
    console.log("Component mounted or updated");

    return () => {
      console.log("Component will unmount");
    };
  }, []); // Dependencies can be adjusted based on when you need the effect to run
```

4. Migrate **methods** and **event handlers**. Bindings are not necessary in function components. Convert all instance methods in the class to functions within the functional component.

```js
// Class Component Method
class MyComponent extends React.Component {
  handleClick = () => {
    console.log("Clicked!");
  }

// Functional Component Method
function MyComponent() {
  const handleClick = () => {
    console.log("Clicked!");
  };
```

5. Access **props** directly in the functional component's argument list, rather than through `this.props`.

```js
// Class Component Props
class MyComponent extends React.Component {
    render() {
        return <div>Hello, {this.props.name}!</div>;
    }
}

// Functional Component Props
function MyComponent({ name }) {
    return <div>Hello, {name}!</div>;
}
```

6. If your class component uses **context** via _contextType_, use the `useContext` hook in your functional component to subscribe to context changes.

```js
// Class Component Context
class MyComponent extends React.Component {
  static contextType = MyContext;

// Functional Component Context
function MyComponent() {
  const context = useContext(MyContext);
```

7. If the class component uses **refs** with `React.createRef`, switch to `useRef` in the functional component.

```js
// Class Component Ref
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();

// Functional Component Ref
function MyComponent() {
  const myRef = useRef(null);
```

8. After completing the migration, **test** the new functional component to ensure it behaves as expected. Check for any performance issues or side effects, particularly those related to the misuse of dependencies in `useEffect`.

### 10.List a few ways styles can be used with components.

1. Inline Styling

Add style directly to components using the style attribute. It is straightforward but typically less powerful for complex applications due to its limitation in not supporting pseudo-classes or media queries directly.

```js
function MyComponent() {
    const style = {
        color: "blue",
        backgroundColor: "lightgray",
        padding: "10px",
        borderRadius: "5px",
    };

    return <div style={style}>Hello, styled component!</div>;
}
```

2. CSS Stylesheets

Create a `.css` file and import it into your component file. It supports all CSS features, including pseudo-classes, media queries, and animations.

```js
/* styles.css */
.myComponent {
  color: blue;
  background-color: lightgray;
  padding: 10px;
  border-radius: 5px;
}

import './styles.css';

function MyComponent() {
  return <div className="myComponent">Hello, styled component!</div>;
}
```

3. CSS Modules

CSS Modules provide a way to encapsulate styles per component, preventing global scope issues. When you import a CSS Module, it is scoped locally to the component rather than globally.

```js
/* MyComponent.module.css */
.container {
  color: blue;
  background-color: lightgray;
  padding: 10px;
  border-radius: 5px;
}

import styles from './MyComponent.module.css';

function MyComponent() {
  return <div className={styles.container}>Hello, styled component!</div>;
}
```

4. Styled Components
   Styled Components is a library for React and React Native that allows you to use component-level styles written with a mixture of JavaScript and CSS. This approach supports dynamic styling based on props and theming.

```js
import styled from "styled-components";

const StyledDiv = styled.div`
    color: blue;
    background-color: lightgray;
    padding: 10px;
    border-radius: 5px;
`;

function MyComponent() {
    return <StyledDiv>Hello, styled component!</StyledDiv>;
}
```

### 11. How to render an HTML string coming from the server.

Inserting raw HTML into your React app must be handled carefully to avoid security risks such as cross-site scripting (XSS) attacks.
React provides a special prop called `dangerouslySetInnerHTML` for inserting HTML content into your DOM from within a React component.

Usage example:

```js
function MyComponent({ htmlContent }) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
```

In this example, htmlContent should be a string containing the HTML you want to render. This tells React to bypass the usual virtual DOM and render the content directly into the DOM, which allows HTML tags in the string to be interpreted as actual HTML.

Before rendering HTML from an external source, it's crucial to sanitize it to remove any potentially malicious scripts or tags. You can use libraries like `DOMPurify` to sanitize HTML content effectively.
