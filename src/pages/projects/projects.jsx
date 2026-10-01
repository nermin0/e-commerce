import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Products() {

        const [data, setData] = useState()
    
     useEffect(() => {
            async function getProduct() {
                const res = await fetch(`https://dummyjson.com/products`);
                const data = await res.json();
    
                setData(data);
                console.log(data);
            }
    
            getProduct();
    
        }, [])
    return (
        <div className="bg-bg-red-300">
            <h3 className="text-5xl text-black">Projects</h3>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    <Link to={"/products/1"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/2"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/3"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/4"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/5"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/6"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/ajKHDA"} className="h-22 bg-blue-300">Product 123</Link>
                    <Link to={"/products/ASJLjad"} className="h-22 bg-blue-300">Product 123</Link>
                    
                    <Link to={"/products/424"} className="h-22 bg-blue-300">Product 123</Link>
                </div>
            </div>
        </div>
    )
}
