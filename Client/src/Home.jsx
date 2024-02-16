import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Home = () => {
    //const [response, setResponse] = useState(null)
    const [dataLoading, setDataLoading] = useState(false);
    const [averageDataLoading, setAverageDataLoading] = useState(false);
    const [data, setData] = useState(null);
    const [averageData, setAverageData] = useState(null);

    const fetchData = async () => {
        try {
            setDataLoading(true);
            const { data } = await axios.get(
                `${import.meta.env.VITE_APP_SERVER_URL}/quotes`
            );
            setData(data?.response);
            setDataLoading(false);
        } catch (error) {
            setDataLoading(false);
            console.log(error);
            toast.error(error.response?.data?.error || "Internal Server Error");
        }
    };

    const fetchAverageData = async () => {
        try {
            setAverageDataLoading(true);
            const { data } = await axios.get(
                `${import.meta.env.VITE_APP_SERVER_URL}/average`
            );
            setAverageData(data);
            setAverageDataLoading(false);
        } catch (error) {
            setAverageDataLoading(false);
            console.log(error);
            toast.error(error.response?.data?.error || "Internal Server Error");
        }
    };

    useEffect(() => {
        fetchData();
        fetchAverageData();
        const interval = setInterval(() => {
            // page refresh on every 15 sec
            if (data && averageData) window.location.reload(); // if data has been loaded then only refresh
        }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <div className="p-4 flex flex-col gap-y-4">
                <p className=" text-slate-900 font-semibold text-4xl w-full">
                    Dashboard
                </p>

                <div className="flex flex-col gap-y-1">
                    <p className="text-2xl font-semibold">Stock Price</p>
                    <div className="flex gap-2 flex-wrap w-full text-slate-900">
                        {!dataLoading &&
                            data?.map((data, index) => (
                                <Card data={data} key={index} />
                            ))}
                    </div>
                    {dataLoading && <span>Loading...</span>}
                </div>
                <div className="flex flex-col gap-y-1">
                    <p className="text-2xl font-semibold">Average Stock Price</p>
                    {!averageDataLoading && (
                        <div className="">
                            <p className="">
                                Average Buy Price:{" "}
                                {averageData?.average_buy_price}
                            </p>
                            <p className="">
                                Average Sell Price:{" "}
                                {averageData?.average_sell_price}
                            </p>
                        </div>
                    )}
                    {averageDataLoading && <span>Loading...</span>}
                </div>
            </div>
        </>
    );
};

export default Home;

const Card = ({ data }) => {
    return (
        <div className=" flex  flex-col p-2 h-32 w-44 bg-slate-200  items-center justify-around rounded-md">
            <div className="">
                <span className=" font-semibold">Buy Price: </span>
                {data.buy_price}
            </div>
            <div className="">
                <span className="font-semibold">Sell Price: </span>
                {data.sell_price}
            </div>
        </div>
    );
};
