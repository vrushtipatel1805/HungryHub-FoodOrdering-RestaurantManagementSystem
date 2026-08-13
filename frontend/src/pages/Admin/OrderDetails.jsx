import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../components/Common/Loader';
import { getOrderById, updateOrderStatus } from '../../services/orderService';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await getOrderById(id);
        setOrder(response.data);
      } catch (err) {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <p className="text-slate-600 p-6">Order not found.</p>;

  const steps = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Served'];
  const currentStepIndex = steps.indexOf(order.status || 'Pending');

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border-2 border-rust-200 bg-white p-6 shadow-md">
        <p className="text-sm text-rust-500 font-semibold">Order #{order.id}</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Customer Information</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-rust-200 bg-rust-50 p-4">
            <p className="text-sm text-slate-600 font-medium">Name</p>
            <p className="mt-2 text-slate-900 font-semibold">{order.customer_name}</p>
          </div>
          <div className="rounded-2xl border-2 border-rust-200 bg-rust-50 p-4">
            <p className="text-sm text-slate-600 font-medium">Phone</p>
            <p className="mt-2 text-slate-900 font-semibold">{order.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="rounded-[2rem] border-2 border-rust-200 bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-slate-900">Order Items</h2>
        <div className="mt-4 divide-y divide-rust-100 border border-rust-200 rounded-2xl overflow-hidden">
          {order.items && order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-rust-50/20">
              <div>
                <p className="font-semibold text-slate-900">{item.menu_item?.name || 'Menu Item'}</p>
                <p className="text-xs text-slate-500">Qty: {item.quantity} x ₹{item.price}</p>
              </div>
              <p className="font-bold text-rust-500">₹{(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center p-4 bg-rust-50 font-bold text-slate-900">
            <span>Grand Total</span>
            <span className="text-rust-600">₹{order.grand_total}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border-2 border-rust-200 bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold text-slate-900">Timeline</h2>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            return (
              <div 
                key={step} 
                className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition duration-150 ${
                  isCompleted 
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900' 
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="font-medium">{step}</span>
                <span className={`font-semibold ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isCompleted ? 'Complete' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
