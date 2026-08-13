import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCartApi } from '../services/orderService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, value }
  const { user } = useAuth();

  const mapBackendCart = (backendCart) => {
    if (!backendCart || !backendCart.items) return [];
    return backendCart.items.map(item => {
      const itemPrice = parseFloat(item.menu_item.price);
      const discountPct = parseInt(item.menu_item.discount || 0);
      const finalPrice = discountPct > 0 ? (itemPrice - (itemPrice * discountPct) / 100) : itemPrice;
      return {
        id: item.menu_item.id,
        name: item.menu_item.name,
        price: finalPrice,
        quantity: item.quantity,
        image: item.menu_item.image || item.menu_item.category_image,
        gst: item.menu_item.gst ? parseInt(item.menu_item.gst) : 5
      };
    });
  };

  useEffect(() => {
    const syncAndFetchCart = async () => {
      if (user && user.name !== 'Guest') {
        try {
          const stored = localStorage.getItem('hungryhub_guest_cart');
          if (stored) {
            const guestItems = JSON.parse(stored);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              for (const item of guestItems) {
                await addCartItem(item.id, item.quantity);
              }
            }
          }
        } catch (err) {
          console.warn("Failed to sync guest cart to backend.", err);
        } finally {
          localStorage.removeItem('hungryhub_guest_cart');
        }

        try {
          const pendingActionStr = sessionStorage.getItem('pending_action');
          if (pendingActionStr) {
            const pendingAction = JSON.parse(pendingActionStr);
            if (pendingAction.type === 'add_to_cart') {
              await addCartItem(pendingAction.item.id, 1);
              toast.success(`${pendingAction.item.name} added to cart`);
            }
          }
        } catch (err) {
          console.warn("Failed to sync pending action cart item to backend.", err);
        } finally {
          sessionStorage.removeItem('pending_action');
        }

        try {
          const response = await getCart();
          if (response.data && response.data.cart) {
            setItems(mapBackendCart(response.data.cart));
          }
        } catch (err) {
          console.warn("Failed to fetch cart from backend.", err);
        }
      } else {
        const stored = localStorage.getItem('hungryhub_guest_cart');
        if (stored) {
          try {
            setItems(JSON.parse(stored));
          } catch {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    };
    syncAndFetchCart();
  }, [user]);

  useEffect(() => {
    if (!user || user.name === 'Guest') {
      localStorage.setItem('hungryhub_guest_cart', JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = async (item) => {
    // 1. Optimistic Update (Immediate UI response)
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }
      const itemPrice = parseFloat(item.price);
      const discountPct = parseInt(item.discount || 0);
      const finalPrice = discountPct > 0 ? (itemPrice - (itemPrice * discountPct) / 100) : itemPrice;
      return [...prev, { 
        id: item.id,
        name: item.name,
        price: finalPrice,
        image: item.image || item.category_image,
        gst: item.gst ? parseInt(item.gst) : 5,
        quantity: 1 
      }];
    });

    // 2. Background Sync
    if (user && user.name !== 'Guest') {
      try {
        const response = await addCartItem(item.id, 1);
        if (response.data?.cart) {
          setItems(mapBackendCart(response.data.cart));
        }
      } catch (err) {
        console.error("Failed to add cart item to backend", err);
        // Rollback
        setItems((prev) => prev.flatMap((entry) => {
          if (entry.id !== item.id) return [entry];
          const nextQty = entry.quantity - 1;
          return nextQty > 0 ? [{ ...entry, quantity: nextQty }] : [];
        }));
      }
    }
  };

  const removeItem = async (id) => {
    // 1. Save current item for potential rollback
    const itemToRemove = items.find((entry) => entry.id === id);

    // 2. Optimistic Update
    setItems((prev) => prev.filter((entry) => entry.id !== id));

    // 3. Background Sync
    if (user && user.name !== 'Guest') {
      try {
        const response = await removeCartItem(id);
        if (response.data?.cart) {
          setItems(mapBackendCart(response.data.cart));
        }
      } catch (err) {
        console.error("Failed to remove cart item from backend", err);
        // Rollback
        if (itemToRemove) {
          setItems((prev) => [...prev, itemToRemove]);
        }
      }
    }
  };

  const clearCart = async () => {
    if (user && user.name !== 'Guest') {
      try {
        const response = await clearCartApi();
        if (response.data?.cart) {
          setItems(mapBackendCart(response.data.cart));
        }
      } catch (err) {
        console.error("Failed to clear backend cart", err);
      }
    } else {
      setItems([]);
    }
    setAppliedCoupon(null);
  };

  const updateQuantity = async (id, delta) => {
    // Trigger toast notification if item is being removed
    const item = items.find((entry) => entry.id === id);
    if (item && item.quantity + delta <= 0) {
      toast.success(`${item.name} removed from cart`);
    }

    // 1. Optimistic Update
    setItems((prev) => prev.flatMap((entry) => {
      if (entry.id !== id) return [entry];
      const nextQty = entry.quantity + delta;
      return nextQty > 0 ? [{ ...entry, quantity: nextQty }] : [];
    }));

    // 2. Background Sync
    if (user && user.name !== 'Guest') {
      try {
        const response = await updateCartItem(id, delta);
        if (response.data?.cart) {
          setItems(mapBackendCart(response.data.cart));
        }
      } catch (err) {
        console.error("Failed to update cart item quantity in backend", err);
        // Refetch/sync state on failure
        try {
          const response = await getCart();
          if (response.data?.cart) {
            setItems(mapBackendCart(response.data.cart));
          }
        } catch {
          // ignore
        }
      }
    }
  };

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const discount = appliedCoupon 
    ? (appliedCoupon.type === 'percent' 
        ? (subtotal * appliedCoupon.value) / 100 
        : Math.min(subtotal, appliedCoupon.value)) 
    : 0;
  const grandTotal = subtotal + gst - discount;

  const value = useMemo(() => ({ 
    items, 
    addItem, 
    removeItem, 
    clearCart, 
    updateQuantity, 
    totalQty, 
    subtotal, 
    gst, 
    discount,
    grandTotal,
    appliedCoupon,
    setAppliedCoupon
  }), [items, totalQty, subtotal, gst, discount, grandTotal, appliedCoupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
