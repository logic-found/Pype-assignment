import React from "react";
import Home from "./Home";
import { Toaster } from "react-hot-toast";

const App = () => {
    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#F5F2F2",
                    },
                    success: {
                        icon: "✅",
                    },
                    error: {
                        icon: "❌",
                    },
                }}
            />

            <div>
                <Home />
            </div>
        </>
    );
};

export default App;
