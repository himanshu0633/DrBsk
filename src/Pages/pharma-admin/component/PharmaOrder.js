import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../components/AxiosInstance';
import CustomLoader from '../../../components/CustomLoader';

const PharmaOrder = () => {
    const [Order, setOrder] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/api/orders');
                console.log("Fetched orders:", response.data);
                setOrder(response.data.orders);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="admin-page">
            <h1>Orders</h1>
            {loading ? <CustomLoader /> : <div className="table-responsive">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Payment ID</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Order.map((order) => {
                            return order.items.map((item) => (
                                <tr key={item.productId}>
                                    <td data-label="ID">{item.productId}</td>
                                    <td data-label="Name">{item.name}</td>
                                    <td data-label="Price">₹{item.price}</td>
                                    <td data-label="Stock">{item.quantity}</td>
                                    <td data-label="Payment">{order.paymentId} </td>
                                    <td data-label="Status" className={`${order.status == 'Pending' ? 'clrOrange' : 'clrGreen'}`} >{order.status} </td>
                                </tr>
                            ))
                        })}

                    </tbody>
                </table>
            </div>}

        </div>
    )
}

export default PharmaOrder
